/**
 * AI 캐릭터 고급 대화 시스템 (Advanced Conversation System)
 *
 * 기능:
 * - 감정 시스템 통합 (Emotion System)
 * - 개인성 시스템 통합 (Personality System)
 * - 맥락 인식 대화 (Context Manager)
 * - 상황 기반 응답 생성
 * - 감정, 개인성, 맥락이 결합된 자연스러운 대화
 */

import { emotionSystem, EMOTION_TYPES } from './ai/emotion-system.js'
import { personalitySystem, PERSONALITY_TYPES } from './ai/personality-system.js'
import { contextManager } from './ai/context-manager.js'

// 캐릭터 개인성 설정 (AI_PERSONAS와 연동)
const CHARACTER_PERSONALITIES = {
  'ai-agent-1': {
    personality: PERSONALITY_TYPES.FEELER, // 감정형 (유리)
    defaultEmotion: EMOTION_TYPES.JOY
  },
  'ai-agent-2': {
    personality: PERSONALITY_TYPES.EXTROVERT, // 외향형 (히카리)
    defaultEmotion: EMOTION_TYPES.JOY
  }
}

// 고급 대화 시스템 클래스
class AdvancedConversationSystem {
  constructor() {
    this.isActive = true
  }

  // 초기화
  initialize(io, characters) {
    this.isActive = true

    // 감정 시스템 시작
    emotionSystem.startDecay()

    // 캐릭터별 개인성 설정
    for (const characterId of Object.keys(CHARACTER_PERSONALITIES)) {
      const config = CHARACTER_PERSONALITIES[characterId]
      personalitySystem.setPersonality(characterId, config.personality)
      emotionSystem.setEmotion(characterId, config.defaultEmotion)
    }

    console.log('✅ 고급 대화 시스템 초기화 완료')
  }

  // 고급 응답 생성
  async generateAdvancedResponse(characterId, userMessage, additionalPrompt = '') {
    if (!this.isActive) {
      console.log('⚠️ 고급 대화 시스템 비활성화')
      return null
    }

    // 1. 감정 상태 가져오기
    const emotionState = emotionSystem.getEmotionState(characterId)
    const currentEmotion = emotionState.getCurrentEmotion()

    // 2. 개인성 설정 가져오기
    const personality = personalitySystem.getPersonalitySettings(characterId)

    // 3. 맥락 프롬프트 생성
    const contextPrompt = contextManager.generateContextPrompt(characterId, userMessage)

    // 4. 감정 프롬프트 추가
    const emotionPrompt = this.generateEmotionPrompt(currentEmotion)

    // 5. 개인성 프롬프트 추가
    const personalityPrompt = this.generatePersonalityPrompt(personality)

    // 통합 프롬프트
    const fullPrompt = `${contextPrompt}
${emotionPrompt}
${personalityPrompt}
${additionalPrompt}
`

    // 6. 맥락 업데이트
    contextManager.updateContext(characterId, 'user', userMessage)

    console.log(`🎭 고급 대화 프롬프트 생성: ${characterId}`)
    console.log(`  - 감정: ${currentEmotion.type} (강도: ${currentEmotion.intensity.toFixed(2)})`)
    console.log(`  - 분위기: ${contextManager.context.conversations.get(characterId)?.mood}`)

    return fullPrompt
  }

  // 감정 프롬프트 생성
  generateEmotionPrompt(emotionState) {
    const { type, intensity, intensityModifier } = emotionState

    const emotionKorean = {
      happy: '행복',
      sad: '슬픔',
      angry: '화남',
      joy: '기쁨',
      calm: '평온',
      anxious: '불안'
    }

    let prompt = `[감정 상태]
- 현재 감정: ${emotionKorean[type]} (${(intensity * 100).toFixed(0)}%)
`

    // 감정 강도에 따른 대화 스타일
    if (intensityModifier === 'strong') {
      prompt += `- 감정 강도: 매우 강함 → 감정 표현을 명확히 하세요
`
    } else if (intensityModifier === 'moderate') {
      prompt += `- 감정 강도: 중간 → 자연스러운 감정 표현
`
    } else {
      prompt += `- 감정 강도: 약함 → 감정 표현을 조금만 사용
`
    }

    return prompt
  }

  // 개인성 프롬프트 생성
  generatePersonalityPrompt(personality) {
    let prompt = `[개인성 특성]
- 개인성 타입: ${personality.name}
- 성격: ${personality.description}
- 말하기 스타일: ${personality.speakingStyle}
- 말투 수준: ${personality.politeness === 'formal' ? '정중합니다' : personality.politeness === 'casual' ? '편안합니다' : '중립입니다'}
- 이모티콘 사용: ${personality.emojiFrequency === 'high' ? '많이 사용하세요' : personality.emojiFrequency === 'medium' ? '적당히 사용하세요' : '적게 사용하세요'}
- 대화 길이: ${personality.conversationLength === 'short' ? '간결하게' : personality.conversationLength === 'long' ? '자세하게' : '중간 길이로'}
`

    // 키워드 예시
    if (personality.keywords && personality.keywords.length > 0) {
      prompt += `- 자주 사용하는 표현: ${personality.keywords.slice(0, 3).join(', ')}
`
    }

    return prompt
  }

  // 감정 상태 변경 (채팅 내용 분석)
  updateEmotionFromContent(characterId, content, isUserMessage = false) {
    // 감정 키워드 분석
    const emotionKeywords = {
      [EMOTION_TYPES.HAPPY]: ['좋아', '행복해', '기뻐', '즐거워', '좋아요', '대박', '신나', '사랑해'],
      [EMOTION_TYPES.SAD]: ['슬퍼', '안타까워', '미안해', '힘들어', '우울해', '아파', '쓸쓸해'],
      [EMOTION_TYPES.ANGRY]: ['화나', '짜증나', '미워', '미쳤어', '어이없어', '분노', '격노'],
      [EMOTION_TYPES.JOY]: ['와우', '멋져', '대단해', '놀라워', '기적', '최고', '훌륭해'],
      [EMOTION_TYPES.CALM]: ['평온해', '안정돼', '조용해', '차분해', '편안해', '잘 지냈어'],
      [EMOTION_TYPES.ANXIOUS]: ['걱정돼', '불안해', '두려워', '심각해', '위험해', '어떡해']
    }

    let matchedEmotion = null
    let matchScore = 0

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      let score = 0
      for (const keyword of keywords) {
        if (content.includes(keyword)) score++
      }

      if (score > matchScore) {
        matchScore = score
        matchedEmotion = emotion
      }
    }

    // 감정 변경
    if (matchedEmotion && matchScore >= 2) {
      const boostedIntensity = Math.min(1.0, 0.2 + matchScore * 0.1)
      emotionSystem.setEmotion(characterId, matchedEmotion, boostedIntensity)

      if (isUserMessage) {
        // 사용자가 긍정적이면 AI도 긍정적 감정으로 변환
        if (matchedEmotion === EMOTION_TYPES.HAPPY || matchedEmotion === EMOTION_TYPES.JOY) {
          emotionSystem.boostEmotion(characterId, 0.15)
        }
      }
    }
  }

  // 개인성 기반 응답 후처리
  applyPersonalityPostprocessing(characterId, response) {
    // 개인성 스타일 적용
    let modifiedResponse = personalitySystem.applyPersonalityStyle(characterId, response)

    // 감정 기반 이모티콘 추가
    if (Math.random() < 0.5) {
      const emotionState = emotionSystem.getEmotionState(characterId)
      modifiedResponse += emotionState.getEmoji()
    }

    return modifiedResponse
  }

  // 맥락 기반 플레이어 동작 분석
  analyzePlayerAction(characterId, actionType, details) {
    contextManager.context.recordPlayerAction(characterId, actionType, details)

    // 특정 행동에 따른 감정 변화
    if (actionType === 'greet') {
      emotionSystem.boostEmotion(characterId, 0.1)
    } else if (actionType === 'compliment') {
      emotionSystem.setEmotion(characterId, EMOTION_TYPES.JOY, 0.7)
    } else if (actionType === 'insult') {
      emotionSystem.setEmotion(characterId, EMOTION_TYPES.ANGRY, 0.6)
    }
  }

  // 감정 상태 가져오기
  getEmotionState(characterId) {
    return emotionSystem.getEmotionState(characterId)
  }

  // 개인성 가져오기
  getPersonality(characterId) {
    return personalitySystem.getPersonality(characterId)
  }

  // 개인성 설정 가져오기
  getPersonalitySettings(characterId) {
    return personalitySystem.getPersonalitySettings(characterId)
  }

  // 맥락 요약 가져오기
  getConversationSummary(characterId) {
    return contextManager.getConversationSummary(characterId)
  }

  // 시스템 중지
  stop() {
    this.isActive = false
    emotionSystem.stopDecay()
    contextManager.context.cleanup()
    console.log('⏹️ 고급 대화 시스템 중지')
  }
}

// 싱글톤 인스턴스
const advancedConversationSystem = new AdvancedConversationSystem()

export {
  AdvancedConversationSystem,
  advancedConversationSystem,
  CHARACTER_PERSONALITIES
}