// 대화 컨텍스트 관리 시스템
class ChatContext {
  constructor(maxHistory = 10) {
    this.maxHistory = maxHistory
    this.history = {} // { characterId: [message1, message2, ...], senderId: [...] }
    this.affinity = {} // { characterId: affinityScore }
  }

  // 대화 히스토리에 메시지 추가
  addMessage(characterId, senderName, message, isFromMe = false) {
    if (!this.history[characterId]) {
      this.history[characterId] = []
    }

    this.history[characterId].push({
      sender: senderName,
      message: message,
      isFromMe: isFromMe,
      timestamp: new Date().toISOString()
    })

    // 최근 N개만 유지
    if (this.history[characterId].length > this.maxHistory) {
      this.history[characterId] = this.history[characterId].slice(-this.maxHistory)
    }
  }

  // 특정 캐릭터와의 대화 히스토리 가져오기
  getHistory(characterId) {
    return this.history[characterId] || []
  }

  // 모든 대화 히스토리 초기화
  clearHistory(characterId) {
    if (characterId) {
      this.history[characterId] = []
    } else {
      this.history = {}
    }
  }

  // 호감도 설정/조회
  setAffinity(characterId, score) {
    this.affinity[characterId] = score
  }

  getAffinity(characterId) {
    return this.affinity[characterId] || 50 // 기본 호감도 50
  }

  // 대화 컨텍스트를 GLM-4.7 프롬프트로 변환
  to_prompt(characterId, aiCharacterName) {
    const history = this.getHistory(characterId)
    const affinity = this.getAffinity(characterId)

    let prompt = `현재 호감도: ${affinity}/100\n`

    if (history.length > 0) {
      prompt += '최근 대화 히스토리:\n'
      history.forEach((msg, idx) => {
        const prefix = msg.isFromMe ? aiCharacterName : msg.sender
        prompt += `${prefix}: "${msg.message}"\n`
      })
    } else {
      prompt += '이전 대화 없음 (첫 만남)\n'
    }

    return prompt
  }
}

module.exports = { ChatContext }