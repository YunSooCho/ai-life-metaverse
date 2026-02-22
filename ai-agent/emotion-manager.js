const emotionTypes = ['happy', 'sad', 'angry', 'surprised', 'neutral']

const emotionEmojis = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  neutral: '😐'
}

export class EmotionManager {
  constructor(currentEmotion = 'neutral') {
    if (!emotionTypes.includes(currentEmotion)) {
      throw new Error(`Invalid emotion type: ${currentEmotion}`)
    }
    this.currentEmotion = currentEmotion
    this.emotionHistory = []
    this.lastChangeTime = Date.now()
  }

  get currentEmoji() {
    return emotionEmojis[this.currentEmotion]
  }

  setEmotion(emotion, reason = null) {
    if (!emotionTypes.includes(emotion)) {
      throw new Error(`Invalid emotion type: ${emotion}`)
    }

    this.emotionHistory.push({
      from: this.currentEmotion,
      to: emotion,
      timestamp: Date.now(),
      reason
    })

    this.currentEmotion = emotion
    this.lastChangeTime = Date.now()

    return this.currentEmotion
  }

  analyzeEmotion(message) {
    const lowerMessage = message.toLowerCase()

    const emotionKeywords = {
      happy: [
        'happy', 'joy', 'excited', 'thank', 'love', 'great', 'good', 'wonderful',
        'awesome', 'amazing', 'best', 'yay', 'hurrah', 'congrat', 'celebrat',
        'hello', 'nice', 'meet', 'friend', 'welcome', 'glad',
        '행복', '기뻐', '좋아', '사랑', '대박', '최고', '감사', '축하', '야호', '신나'
      ],
      sad: [
        'sad', 'sorry', 'miss', 'disappointed', 'bad', 'terrible', 'hurt',
        'crying', 'upset', 'depressed', 'lonely', 'heartbroken',
        '슬퍼', '미안', '그리워', '서운', '안타까워', '우울', '외로워', '아파', '울어'
      ],
      angry: [
        'angry', 'hate', 'stupid', 'annoying', 'frustrated', 'why', 'ridiculous',
        'unfair', 'unbelievable', 'wtf', 'hateful', 'mad', 'furious',
        '화나', '싫어', '바보', '짜증', '불공평', '믿을 수 없어', '화내', '미쳤어'
      ],
      surprised: [
        'wow', 'incredible', 'surprise', 'shocking', 'unexpected',
        'unbelievable', 'oh my', 'holy', 'omg', 'incredible', 'shock',
        '와우', '놀라워', '대단', '신기', '오마이갓', '헐', '놀랐어', '놀라'
      ]
    }

    let scores = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0.5
    }

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          scores[emotion] += 1
        }
      }
    }

    if (scores.happy > 0 || scores.sad > 0 || scores.angry > 0 || scores.surprised > 0) {
      scores.neutral = 0
    }

    const maxEmotion = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    )

    this.setEmotion(maxEmotion, `Analyzed from message: "${message.substring(0, 50)}..."`)
    
    return {
      emotion: maxEmotion,
      scores,
      emoji: emotionEmojis[maxEmotion]
    }
  }

  getHistory(limit = 10) {
    return this.emotionHistory.slice(-limit)
  }

  getEmotion() {
    return {
      type: this.currentEmotion,
      emoji: emotionEmojis[this.currentEmotion],
      lastChangeTime: this.lastChangeTime
    }
  }

  reset() {
    this.currentEmotion = 'neutral'
    this.emotionHistory = []
    this.lastChangeTime = Date.now()
  }

  static getEmotionTypes() {
    return [...emotionTypes]
  }

  static getEmotionEmojis() {
    return { ...emotionEmojis }
  }
}