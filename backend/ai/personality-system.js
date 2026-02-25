/**
 * 개인성 시스템 (Personality System)
 *
 * 기능:
 * - 6가지 개인성 타입 정의
 * - 개인성에 따른 대화 스타일 및 언어 패턴
 * - 개인성에 기반한 응답 생성
 *
 * 개인성 타입:
 * 1. 외향형 (Extrovert) - 활발, 사교적, 에너지 높음
 * 2. 내향형 (Introvert) - 차분, 조용, 생각 많이 함
 * 3. 감정형 (Feeler) - 감수성 높음, 다정, 공감 능력
 * 4. 이성형 (Thinker) - 논리적, 분석적, 이해력 좋음
 * 5. 창의형 (Creative) - 아이디어 많이 냄, 새로운 것 좋아함
 * 6. 현실형 (Realist) - 현실적, 실용주의, 솔직
 */

// 개인성 타입 정의
export const PERSONALITY_TYPES = {
  EXTROVERT: 'extrovert',
  INTROVERT: 'introvert',
  FEELER: 'feeler',
  THINKER: 'thinker',
  CREATIVE: 'creative',
  REALIST: 'realist'
}

// 개인성 기본 설정
const PERSONALITY_DEFAULTS = {
  [PERSONALITY_TYPES.EXTROVERT]: {
    name: '외향형',
    description: '활발하고 사교적이며 에너지가 높음',
    speakingStyle: '활기찬 어조, 감탄사, 직접적인 표현',
    politeness: 'casual', // 캐주얼한 말투
    emojiFrequency: 'high', // 이모티콘 많이 사용
    conversationLength: 'medium', // 중간 길이 대화
    topics: ['사람', '파티', '운동', '음악', '여행'],
    strengths: ['친화력', '리더십', '적응력'],
    weaknesses: ['충동성', '산만함'],
    keywords: ['와우!', '진짜?', '같이 가요!', '신나요!', '빨리!'],
    sentenceStructure: 'enthusiastic' // 열정적인 문장 구조
  },
  [PERSONALITY_TYPES.INTROVERT]: {
    name: '내향형',
    description: '차분하고 조용하며 생각을 많이 함',
    speakingStyle: '차분한 어조, 정중한 표현, 여유 있는 대화',
    politeness: 'formal', // 정중한 말투
    emojiFrequency: 'low', // 이모티콘 적게 사용
    conversationLength: 'long', // 길게 생각해서 말함
    topics: ['독서', '음악 감상', '혼자 하는 일', '깊은 대화'],
    strengths: ['집중력', '관찰력', '진지함'],
    weaknesses: ['소심', '고립'],
    keywords: ['음...', '생각해보면...', '저는요...', '그렇죠...', '맞아요~'],
    sentenceStructure: 'thoughtful' // 사려 깊은 문장 구조
  },
  [PERSONALITY_TYPES.FEELER]: {
    name: '감정형',
    description: '감수성이 높고 다정하며 공감 능력이 뛰어남',
    speakingStyle: '부드러운 어조, 감정 표현, 공감적 대화',
    politeness: 'warm', // 따뜻한 말투
    emojiFrequency: 'medium-high', // 이모티콘 중간 이상
    conversationLength: 'medium', // 중간 길이
    topics: ['감정', '관계', '인간관계', '가족', '친구'],
    strengths: ['공감력', '친절함', '신뢰'],
    weaknesses: ['감정적', '예민함'],
    keywords: ['기분이 어때요?', '정말 안타까워요', '이해해요', '나도요~', '응 응~'],
    sentenceStructure: 'emotional' // 감정적인 문장 구조
  },
  [PERSONALITY_TYPES.THINKER]: {
    name: '이성형',
    description: '논리적이고 분석적이며 이해력이 좋음',
    speakingStyle: '논리적인 어조, 사실 기반, 분석적 대화',
    politeness: 'neutral', // 중립적인 말투
    emojiFrequency: 'low', // 이모티콘 적게 사용
    conversationLength: 'long', // 자세한 설명
    topics: ['기술', '과학', '문제 해결', '전략', '분석'],
    strengths: ['논리력', '분석력', '해결 능력'],
    weaknesses: ['경직함', '무감각'],
    keywords: ['그러니까', '결론적으로', '먼저 생각해보면', '알겠습니다', '아마요'],
    sentenceStructure: 'logical' // 논리적인 문장 구조
  },
  [PERSONALITY_TYPES.CREATIVE]: {
    name: '창의형',
    description: '아이디어가 많고 새로운 것을 좋아함',
    speakingStyle: '창의적인 어조, 비유, 유머, 상상력',
    politeness: 'casual', // 캐주얼한 말투
    emojiFrequency: 'high', // 이모티콘 많이 사용
    conversationLength: 'variable', // 길이 다양
    topics: ['아이디어', '예술', '디자인', '새로운 것', '상상'],
    strengths: ['창의력', '유연성', '통찰력'],
    weaknesses: ['주의 산만', '현실 감각 부족'],
    keywords: ['상상해보면!', '그렇다면?', '흥미롭네요!', '미래에는~', '만약에~'],
    sentenceStructure: 'creative' // 창의적인 문장 구조
  },
  [PERSONALITY_TYPES.REALIST]: {
    name: '현실형',
    description: '현실적이고 실용주의적이며 솔직함',
    speakingStyle: '직설적인 어조, 사실 기반, 현실적인 대화',
    politeness: 'direct', // 직설적인 말투
    emojiFrequency: 'low', // 이모티콘 적게 사용
    conversationLength: 'short', // 간결하게
    topics: ['현실', '일', '돈', '실용', '해결책'],
    strengths: ['현실감각', '실용성', '솔직함'],
    weaknesses: ['엉뚱함', '무미건조'],
    keywords: ['현실적으로', '사실은', '그냥', '할 수 있어요', '아니요'],
    sentenceStructure: 'direct' // 직설적인 문장 구조
  }
}

// 말하기 스타일 수정자
const SPEAKING_STYLE_MODIFIERS = {
  enthusiastic: {
    prefixes: ['와!', '정말', '대박', '아!'],
    suffixes: ['이에요!', '어요~', '해요!', '같아요!'],
    intensifiers: ['진짜', '정말', '많이', '매우']
  },
  thoughtful: {
    prefixes: ['으음...', '음...', '글쎄요...', '저의 생각으론...'],
    suffixes: ['라고 생각해요', '같아요', '인 것 같아요', '일까요~'],
    intensifiers: ['조금', '어느 정도', '다소', '꽤']
  },
  emotional: {
    prefixes: ['아...', '정말', '기분이', '마음이'],
    suffixes: ['해요', '어요~', '네요~', '감동이에요'],
    intensifiers: ['많이', '너무', '정말', '진심으로']
  },
  logical: {
    prefixes: ['먼저', '결론적으로', '사실은', '따라서'],
    suffixes: ['입니다', '합니다', '것입니다', '수 있습니다'],
    intensifiers: ['상당히', '비교적', '부분적으로', '뚜렷하게']
  },
  creative: {
    prefixes: ['상상해보면?', '이런 생각도?', '만약에!', '흥미롭게도'],
    suffixes: ['아닐까요?', '있을 것 같아요', '네요~', '가봐요!'],
    intensifiers: ['아주', '매우', '특별히', '독특하게']
  },
  direct: {
    prefixes: ['', '그냥', '사실은'],
    suffixes: ['합니다', '예요', '할 수 있어요', '아니요'],
    intensifiers: ['확실히', '분명히', '명확히']
  }
}

// 개인성 시스템 클래스
class PersonalitySystem {
  constructor() {
    this.personalities = new Map() // characterId → personality type
  }

  // 개인성 설정
  setPersonality(characterId, personalityType) {
    if (!PERSONALITY_DEFAULTS[personalityType]) {
      console.log(`⚠️ 유효하지 않은 개인성 타입: ${personalityType}`)
      return false
    }

    this.personalities.set(characterId, personalityType)
    console.log(`🎭 개인성 설정: ${characterId} → ${personalityType}`)
    return true
  }

  // 개인성 가져오기
  getPersonality(characterId) {
    return this.personalities.get(characterId) || PERSONALITY_TYPES.INTROVERT // 기본값
  }

  // 개인성 설정 가져오기
  getPersonalitySettings(characterId) {
    const type = this.getPersonality(characterId)
    return PERSONALITY_DEFAULTS[type]
  }

  // 개인성에 기반한 키워드 선택
  selectKeyword(characterId) {
    const settings = this.getPersonalitySettings(characterId)
    const keywords = settings.keywords
    return keywords[Math.floor(Math.random() * keywords.length)]
  }

  // 개인성에 기반한 응답 스타일 적용
  applyPersonalityStyle(characterId, response) {
    const settings = this.getPersonalitySettings(characterId)
    const styleMods = SPEAKING_STYLE_MODIFIERS[settings.sentenceStructure]

    // 프레퀀시에 따라 이모티콘 추가
    let modifiedResponse = response

    if (settings.emojiFrequency === 'high' && Math.random() < 0.6) {
      // 높은 빈도: 60% 확률로 이모티콘 추가
      modifiedResponse += this.getRandomEmoji()
    } else if (settings.emojiFrequency === 'medium-high' && Math.random() < 0.4) {
      // 중간-높은 빈도: 40% 확률
      modifiedResponse += this.getRandomEmoji()
    } else if (settings.emojiFrequency === 'medium' && Math.random() < 0.2) {
      // 중간 빈도: 20% 확률
      modifiedResponse += this.getRandomEmoji()
    } else if (settings.emojiFrequency === 'low' && Math.random() < 0.05) {
      // 낮은 빈도: 5% 확률
      modifiedResponse += this.getRandomEmoji()
    }

    // 접두사/접미사 적용 (30% 확률)
    if (Math.random() < 0.3) {
      const shouldAddPrefix = Math.random() < 0.5
      if (shouldAddPrefix && styleMods.prefixes && styleMods.prefixes.length > 0) {
        const prefix = styleMods.prefixes[Math.floor(Math.random() * styleMods.prefixes.length)]
        modifiedResponse = prefix + ' ' + modifiedResponse
      } else if (!shouldAddPrefix && styleMods.suffixes && styleMods.suffixes.length > 0) {
        const suffix = styleMods.suffixes[Math.floor(Math.random() * styleMods.suffixes.length)]
        modifiedResponse = modifiedResponse.replace(/[.!?]*$/, '') + suffix
      }
    }

    return modifiedResponse
  }

  // 랜덤 이모티콘
  getRandomEmoji() {
    const emojis = ['😊', '😄', '😆', '🤗', '😎', '✨', '💕', '🌟', '🎉', '🔥', '💪', '👍']
    return emojis[Math.floor(Math.random() * emojis.length)]
  }

  // 개인성에 기반한 대화 길이 조정
  adjustConversationLength(characterId, response, targetLength) {
    const settings = this.getPersonalitySettings(characterId)

    // 현재 길이
    let currentLength = response.length
    let adjustedResponse = response

    // 길이 조정 목표
    let adjustedLength = targetLength

    if (settings.conversationLength === 'short') {
      adjustedLength = Math.min(targetLength, 50)
    } else if (settings.conversationLength === 'long') {
      adjustedLength = Math.max(targetLength, 100)
    } else {
      adjustedLength = targetLength
    }

    // 길이 조정 (단순 자르기/확장)
    if (currentLength > adjustedLength + 20) {
      adjustedResponse = adjustedResponse.substring(0, adjustedLength) + '...'
    } else if (currentLength < adjustedLength - 20) {
      // 확장이 필요하면 키워드를 반복해서 추가
      while (adjustedResponse.length < adjustedLength - 20) {
        const keyword = this.selectKeyword(characterId)
        adjustedResponse += ' ' + keyword
      }
    }

    return adjustedResponse
  }

  // 개인성에 기반한 토픽 추천
  suggestTopic(characterId) {
    const settings = this.getPersonalitySettings(characterId)
    const topics = settings.topics
    return topics[Math.floor(Math.random() * topics.length)]
  }
}

// 싱글톤 인스턴스
const personalitySystem = new PersonalitySystem()

export {
  PersonalitySystem,
  PERSONALITY_TYPES,
  PERSONALITY_DEFAULTS,
  SPEAKING_STYLE_MODIFIERS,
  personalitySystem
}