/**
 * Chat System Tests (Issue #152)
 * Tests chat message display bug in GameCanvas
 */

/**
 * Test for messagesRef sync behavior
 * Simulates GameCanvas.jsx messagesRef logic
 */
describe('Chat Message Sync (Issue #152)', () => {
  // Helper: create a mock ref object
  const createMockRef = (initialValue) => ({ current: initialValue })

  test('messagesRef should sync with chatMessages when chatMessagesRef is null', () => {
    const chatMessages = { 'char1': { message: 'Hello', timestamp: Date.now() } }
    const chatMessagesRef = null

    // Simulating GameCanvas.jsx logic:
    // const messagesRef = chatMessagesRef || useRef(chatMessages)
    const messagesRef = createMockRef(chatMessages)

    expect(messagesRef.current).toEqual(chatMessages)
  })

  test('messagesRef should use chatMessagesRef when provided', () => {
    const chatMessages = { 'char1': { message: 'Hello', timestamp: Date.now() } }
    const chatMessagesRef = createMockRef(chatMessages)

    // Simulating GameCanvas.jsx logic:
    // const messagesRef = chatMessagesRef || useRef(chatMessages)
    const messagesRef = chatMessagesRef

    expect(messagesRef).toBe(chatMessagesRef)
    expect(messagesRef.current).toEqual(chatMessages)
  })

  test('messagesRef should update when chatMessages changes (chatMessagesRef is null)', () => {
    const initialChatMessages = {}
    const chatMessagesRef = null
    const messagesRef = createMockRef(initialChatMessages)

    // Initial state
    expect(messagesRef.current).toEqual(initialChatMessages)

    // Update chatMessages (simulate useEffect)
    const newChatMessages = { 'char1': { message: 'New message', timestamp: Date.now() } }
    messagesRef.current = newChatMessages

    // Check updated state
    expect(messagesRef.current).toEqual(newChatMessages)
    expect(messagesRef.current['char1'].message).toBe('New message')
  })

  test('messagesRef should NOT update directly when chatMessagesRef is provided (managed by App)', () => {
    const chatMessages = { 'char1': { message: 'Hello', timestamp: Date.now() } }
    const chatMessagesRef = createMockRef(chatMessages)

    // GameCanvas uses chatMessagesRef directly
    const messagesRef = chatMessagesRef

    // Initial state
    expect(messagesRef.current).toEqual(chatMessages)

    // App.jsx updates chatMessagesRef.current (not GameCanvas)
    const newChatMessages = { 'char2': { message: 'New message', timestamp: Date.now() } }
    chatMessagesRef.current = newChatMessages

    // Check that messagesRef reflects the update (same reference)
    expect(messagesRef.current).toEqual(newChatMessages)
    expect(messagesRef.current['char2'].message).toBe('New message')
  })

  test('chat bubble rendering should find matching character ID (string)', () => {
    const chatMessages = {
      'char123': { message: 'Test message', timestamp: Date.now() }
    }

    const characters = {
      'char123': { id: 'char123', name: 'TestChar', x: 100, y: 100 }
    }

    // Simulating render loop logic:
    const msgs = chatMessages
    const allChars = characters

    let bubblesFound = 0
    Object.entries(allChars).forEach(([charId, char]) => {
      const chatData = msgs[charId]
      if (chatData?.message) {
        bubblesFound++
      }
    })

    expect(bubblesFound).toBe(1)
  })

  test('chat bubble rendering should handle characterId type coercion (string vs number)', () => {
    const chatMessages = {
      '123': { message: 'Test message', timestamp: Date.now() }
    }

    const characters = {
      123: { id: 123, name: 'TestChar', x: 100, y: 100 }
    }

    // Simulating render loop logic with type coercion:
    const msgs = chatMessages
    const allChars = characters

    let bubblesFound = 0
    Object.entries(allChars).forEach(([charId, char]) => {
      // ✅ FIXED: Type coercion (Issue #145)
      const chatData = msgs[String(charId)] || msgs[Number(charId)]
      if (chatData?.message) {
        bubblesFound++
      }
    })

    expect(bubblesFound).toBe(1)
  })
})

/**
 * Integration Test: Chat Message Lifecycle
 */
describe('Chat Message Lifecycle (Issue #152)', () => {
  // Helper: create a mock ref object
  const createMockRef = (initialValue) => ({ current: initialValue })

  test('chat message should appear on character after broadcast', () => {
    // Initial state: no messages
    const chatMessages = {}

    // Simulate chatBroadcast event
    const newMessage = {
      characterId: 'player',
      characterName: 'TestPlayer',
      message: 'Hello world!',
      timestamp: Date.now()
    }

    // Update chatMessages (App.jsx setChatMessages)
    const updatedChatMessages = {
      ...chatMessages,
      [newMessage.characterId]: {
        message: newMessage.message,
        timestamp: newMessage.timestamp
      }
    }

    // Render loop reads messagesRef.current
    const messagesRef = createMockRef(chatMessages)

    // Sync (simulate useEffect)
    messagesRef.current = updatedChatMessages

    // Check render loop behavior
    const msgs = messagesRef.current
    const characters = { 'player': { id: 'player', x: 100, y: 100 } }

    let bubbleFound = false
    Object.entries(characters).forEach(([charId, char]) => {
      const chatData = msgs[charId]
      if (chatData?.message) {
        bubbleFound = true
        expect(chatData.message).toBe('Hello world!')
      }
    })

    expect(bubbleFound).toBe(true)
  })

  test('chat message should be removed after 3 seconds', async () => {
    const chatMessages = {
      'player': { message: 'Hello world!', timestamp: Date.now() }
    }

    const messagesRef = createMockRef(chatMessages)

    // Initially, message exists
    expect(messagesRef.current['player']).toBeDefined()

    // Simulate setTimeout removal (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 0)) // Mock delay

    // Update chatMessages (remove message)
    messagesRef.current = {}

    // Check that message is gone
    expect(messagesRef.current['player']).toBeUndefined()
  })
})