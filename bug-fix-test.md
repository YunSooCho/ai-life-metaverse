# Bug #139 Fix Test

## Problem
채팅 말풍선이 캐릭터 위에 표시되지 않음

## Current Code Flow

### App.jsx - sendChatMessage
```javascript
setChatMessages(prev => {
  return {
    ...prev,
    [myCharacter.id]: {
      message: trimmedMessage,
      timestamp
    }
  }
})
```

### GameCanvas.jsx - Render Loop
```javascript
const msgs = chatMessagesRef.current
const chatBubblesToRender = []

// drawCharacter 함수 내부
const chatData = msgs[char.id]
if (chatData?.message) {
  chatBubblesToRender.push({
    message: chatData.message,
    x: x,
    y: y
  })
}

// 캐릭터 렌더링 후
const allChars = { ...chars, [myChar.id]: myChar }
Object.values(allChars).forEach(char => {
  drawCharacter(char)
})

// 채팅 버블 렌더링
chatBubblesToRender.forEach(bubble => {
  renderChatBubble(...)
})
```

## Investigation Points

1. **chatMessagesRef sync 확인** - useEffect에서 refs를 sync하는 부분 확인
2. **myCharacter 포함 확인** - allChars에 myCharacter가 정확히 포함되는지
3. **drawCharacter 호출 확인** - forEach 루프에서 실제로 호출되는지

## Next Steps
브라우저 디버깅으로 실제 동작 확인 필요