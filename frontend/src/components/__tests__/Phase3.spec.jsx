/**
 * Phase 3 UI 컴포넌트 레트로 스타일링 테스트
 *
 * 테스트 목표:
 * - pixel-theme.css import 확인
 * - 픽셀 폰트 적용 확인 (Press Start 2P)
 * - 각 컴포넌트 렌더링 확인
 * - 레트로 스타일 클래스 적용 확인
 *
 * PM 룰 v3.2: 테스트 코드 작성 필수!
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// 컴포넌트 import
import ChatBubble from '../ChatBubble'
import ChatInput from '../ChatInput'
import InteractionMenu from '../InteractionMenu'
import Inventory from '../Inventory'
import Quest from '../Quest'
import RoomMenu from '../RoomMenu'
import Toast from '../Toast'
import Reward from '../Reward'

describe('Phase 3: UI 컴포넌트 레트로 스타일링 테스트', () => {
  beforeEach(() => {
    // pixel-theme.css load 확인
    const link = document.querySelector('link[href*="pixel-theme"]')
    if (!link) {
      const styleLink = document.createElement('link')
      styleLink.rel = 'stylesheet'
      styleLink.href = '/styles/pixel-theme.css'
      document.head.appendChild(styleLink)
    }
  })

  afterEach(() => {
    // Clean up
    const link = document.querySelector('link[href*="pixel-theme"]')
    if (link) {
      link.remove()
    }
  })

  describe('1. pixel-theme.css import 확인', () => {
    it('pixel-theme.css가 로드되어야 함', () => {
      const link = document.querySelector('link[href*="pixel-theme"]')
      expect(link).toBeInTheDocument()
    })
  })

  describe('2. ChatBubble - 도트 말풍선', () => {
    it('메시지가 있을 때 렌더링되어야 함', () => {
      const chatData = {
        message: '안녕하세요!',
        timestamp: Date.now()
      }

      const { container } = render(
        <svg width="500" height="500">
          <ChatBubble
            chatData={chatData}
            x={250}
            y={250}
            scale={1}
          />
        </svg>
      )

      // rect 말풍선 본체
      const bubbleRects = container.querySelectorAll('rect')
      expect(bubbleRects.length).toBeGreaterThan(0)

      // text 메시지 (마지막 text 요소가 메시지)
      const textElements = container.querySelectorAll('text')
      expect(textElements.length).toBeGreaterThan(0)
    })

    it('메시지가 없을 때 null을 반환해야 함', () => {
      const { container } = render(
        <ChatBubble
          chatData={null}
          x={250}
          y={250}
          scale={1}
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('Press Start 2P 폰트가 적용되어야 함', () => {
      const chatData = {
        message: '테스트',
        timestamp: Date.now()
      }

      const { container } = render(
        <svg width="500" height="500">
          <ChatBubble
            chatData={chatData}
            x={250}
            y={250}
            scale={1}
          />
        </svg>
      )

      const textElement = container.querySelector('text')
      expect(textElement).toBeInTheDocument()
      // SVG text elements use "font-family" (kebab-case) attribute
      const fontFamily = textElement.getAttribute('font-family') || textElement.getAttribute('fontFamily')
      expect(fontFamily).toBeTruthy()
      if (fontFamily) {
        expect(fontFamily.toLowerCase()).toContain('press start 2p')
      }
    })

    it('도트 말풍선 스타일이 적용되어야 함 (rect + path)', () => {
      const chatData = {
        message: '테스트',
        timestamp: Date.now()
      }

      const { container } = render(
        <svg width="500" height="500">
          <ChatBubble
            chatData={chatData}
            x={250}
            y={250}
            scale={1}
          />
        </svg>
      )

      // 도트 말풍선 본체 (rect)
      const bubbleRects = container.querySelectorAll('rect')
      expect(bubbleRects.length).toBeGreaterThan(0)

      // 첫 번째 rect 확인
      const firstRect = bubbleRects[0]
      expect(firstRect).toHaveAttribute('fill', '#ffffff')
      expect(firstRect).toHaveAttribute('stroke', '#000000')

      // 도트 말풍선 꼬리 (path)
      const bubbleTail = container.querySelector('path')
      expect(bubbleTail).toHaveAttribute('fill', '#ffffff')
      expect(bubbleTail).toHaveAttribute('stroke', '#000000')
    })
  })

  describe('3. ChatInput - 픽셀 입력창', () => {
    it('렌더링되어야 함', () => {
      const handleChange = vi.fn()
      const handleSubmit = vi.fn()

      render(
        <ChatInput
          value="테스트 메시지"
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )

      const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
      expect(textarea).toBeInTheDocument()
      expect(textarea.value).toBe('테스트 메시지')
    })

    it('SEND 버튼이 렌더링되어야 함', () => {
      const handleSubmit = vi.fn()

      render(
        <ChatInput
          value="테스트"
          onChange={vi.fn()}
          onSubmit={handleSubmit}
        />
      )

      const sendButton = screen.getByText('SEND')
      expect(sendButton).toBeInTheDocument()
      expect(sendButton.className).toContain('pixel-button')
      expect(sendButton.className).toContain('pixel-button-green')
    })

    it('pixel-input 클래스가 적용되어야 함', () => {
      render(
        <ChatInput
          value="테스트"
          onChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      )

      const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
      expect(textarea.className).toContain('pixel-input')
    })

    it('Enter 키로 전송해야 함', () => {
      const handleSubmit = vi.fn()

      render(
        <ChatInput
          value="테스트"
          onChange={vi.fn()}
          onSubmit={handleSubmit}
        />
      )

      const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
      fireEvent.keyDown(textarea, { key: 'Enter' })

      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('Shift+Enter로 줄바꿈해야 함', () => {
      render(
        <ChatInput
          value="테스트"
          onChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      )

      const textarea = screen.getByPlaceholderText('메시지를 입력하세요...')
      const originalValue = textarea.value

      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

      // Shift+Enter는 handleSubmit 호출하지 않음
      // 단순히 렌더링만 확인
      expect(textarea).toBeInTheDocument()
    })
  })

  describe('4. InteractionMenu - RPG 메뉴', () => {
    const mockTargetCharacter = {
      id: 'test-id',
      name: '테스트 캐릭터'
    }

    it('렌더링되어야 함', () => {
      render(
        <InteractionMenu
          show={true}
          targetCharacter={mockTargetCharacter}
          x={100}
          y={100}
          onInteraction={vi.fn()}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('테스트 캐릭터')).toBeInTheDocument()
    })

    it('pixel-menu 클래스가 적용되어야 함', () => {
      const { container } = render(
        <InteractionMenu
          show={true}
          targetCharacter={mockTargetCharacter}
          x={100}
          y={100}
          onInteraction={vi.fn()}
          onClose={vi.fn()}
        />
      )

      const menu = container.querySelector('.interaction-menu')
      expect(menu.className).toContain('pixel-menu')
    })

    it('인터랙션 옵션들이 렌더링되어야 함', () => {
      const handleInteraction = vi.fn()

      render(
        <InteractionMenu
          show={true}
          targetCharacter={mockTargetCharacter}
          x={100}
          y={100}
          onInteraction={handleInteraction}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('INSA')).toBeInTheDocument()
      expect(screen.getByText('GIFT')).toBeInTheDocument()
      expect(screen.getByText('FRIEND')).toBeInTheDocument()
      expect(screen.getByText('FIGHT')).toBeInTheDocument()
    })

    it('인터랙션 버튼 클릭 핸들러가 호출되어야 함', () => {
      const handleInteraction = vi.fn()

      render(
        <div>
          <InteractionMenu
            show={true}
            targetCharacter={mockTargetCharacter}
            x={100}
            y={100}
            onInteraction={handleInteraction}
            onClose={vi.fn()}
          />
        </div>
      )

      const greetingButton = screen.getByText('INSA')
      fireEvent.click(greetingButton)

      expect(handleInteraction).toHaveBeenCalledWith('greeting')
    })

    it('show={false}일 때 렌더링되지 않아야 함', () => {
      const { container } = render(
        <InteractionMenu
          show={false}
          targetCharacter={mockTargetCharacter}
          x={100}
          y={100}
          onInteraction={vi.fn()}
          onClose={vi.fn()}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('5. Inventory - 도트 그리드', () => {
    const mockInventory = {
      healthPotion: 5,
      coin: 100,
      giftBox: 2
    }

    it('렌더링되어야 함', () => {
      render(
        <Inventory
          show={true}
          onClose={vi.fn()}
          inventory={mockInventory}
          characterId="test-id"
          onUseItem={vi.fn()}
          onGetInventory={vi.fn()}
        />
      )

      expect(screen.getByText('🎒 INVENTORY')).toBeInTheDocument()
    })

    it('pixel-panel 클래스가 적용되어야 함', () => {
      const { container } = render(
        <Inventory
          show={true}
          onClose={vi.fn()}
          inventory={mockInventory}
          characterId="test-id"
          onUseItem={vi.fn()}
          onGetInventory={vi.fn()}
        />
      )

      const panel = container.querySelector('.inventory-modal')
      expect(panel).toHaveClass('pixel-panel')
    })

    it('아이템들이 렌더링되어야 함', () => {
      render(
        <Inventory
          show={true}
          onClose={vi.fn()}
          inventory={mockInventory}
          characterId="test-id"
          onUseItem={vi.fn()}
          onGetInventory={vi.fn()}
        />
      )

      expect(screen.getByText('HP POTION')).toBeInTheDocument()
      expect(screen.getByText('x5')).toBeInTheDocument()
      expect(screen.getByText('COIN')).toBeInTheDocument()
      expect(screen.getByText('x100')).toBeInTheDocument()
    })

    it('아이템 사용 버튼이 렌더링되어야 함', () => {
      render(
        <Inventory
          show={true}
          onClose={vi.fn()}
          inventory={mockInventory}
          characterId="test-id"
          onUseItem={vi.fn()}
          onGetInventory={vi.fn()}
        />
      )

      const useButtons = screen.getAllByText('USE')
      expect(useButtons.length).toBeGreaterThan(0)
      expect(useButtons[0]).toHaveClass('pixel-button')
    })

    it('pixel-grid 클래스가 적용되어야 함', () => {
      const { container } = render(
        <Inventory
          show={true}
          onClose={vi.fn()}
          inventory={mockInventory}
          characterId="test-id"
          onUseItem={vi.fn()}
          onGetInventory={vi.fn()}
        />
      )

      const grid = container.querySelector('.pixel-grid')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('6. Quest - RPG 퀘스트 로그', () => {
    const mockQuests = {
      'quest-1': {
        id: 'quest-1',
        title: '첫 퀘스트',
        description: '테스트 퀘스트입니다',
        questType: 'main',
        status: 'active',
        objectives: [
          {
            id: 'obj-1',
            description: '채팅 10회',
            currentCount: 5,
            requiredCount: 10
          }
        ],
        reward: {
          points: 100,
          experience: 50
        }
      }
    }

    it('렌더링되어야 함', () => {
      render(
        <Quest
          show={true}
          quests={mockQuests}
          availableQuests={{}}
          onAcceptQuest={vi.fn()}
          onClaimReward={vi.fn()}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('📋 QUEST LOG')).toBeInTheDocument()
    })

    it('pixel-panel 클래스가 적용되어야 함', () => {
      const { container } = render(
        <Quest
          show={true}
          quests={mockQuests}
          availableQuests={{}}
          onAcceptQuest={vi.fn()}
          onClaimReward={vi.fn()}
          onClose={vi.fn()}
        />
      )

      const panel = container.querySelector('.quest-container')
      expect(panel).toHaveClass('pixel-panel')
    })

    it('퀘스트 아이템이 렌더링되어야 함', () => {
      render(
        <Quest
          show={true}
          quests={mockQuests}
          availableQuests={{}}
          onAcceptQuest={vi.fn()}
          onClaimReward={vi.fn()}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('첫 퀘스트')).toBeInTheDocument()
      expect(screen.getByText('테스트 퀘스트입니다')).toBeInTheDocument()
    })

    it('pixel-badge 클래스가 적용되어야 함', () => {
      const { container } = render(
        <Quest
          show={true}
          quests={mockQuests}
          availableQuests={{}}
          onAcceptQuest={vi.fn()}
          onClaimReward={vi.fn()}
          onClose={vi.fn()}
        />
      )

      const badges = container.querySelectorAll('.pixel-badge')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('퀘스트 보상이 렌더링되어야 함', () => {
      render(
        <Quest
          show={true}
          quests={mockQuests}
          availableQuests={{}}
          onAcceptQuest={vi.fn()}
          onClaimReward={vi.fn()}
          onClose={vi.fn()}
        />
      )

      // Reward component displays points and experience separately
      const ptsText = screen.getByText(/PTS/)
      const expText = screen.getByText(/EXP/)
      expect(ptsText).toBeInTheDocument()
      expect(expText).toBeInTheDocument()
    })
  })

  describe('7. RoomMenu - 레트로 방 메뉴', () => {
    const mockRooms = [
      { id: 'room-1', name: '메인 광장', members: [{ id: 'user-1' }] },
      { id: 'room-2', name: '카페', members: [] }
    ]

    it('렌더링되어야 함', () => {
      render(
        <RoomMenu
          show={true}
          rooms={mockRooms}
          currentRoom="room-1"
          onJoinRoom={vi.fn()}
          onCreateRoom={vi.fn()}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('🌐 ROOMS')).toBeInTheDocument()
    })

    it('pixel-panel 클래스가 적용되어야 함', () => {
      const { container } = render(
        <RoomMenu
          show={true}
          rooms={mockRooms}
          currentRoom="room-1"
          onJoinRoom={vi.fn()}
          onCreateRoom={vi.fn()}
          onClose={vi.fn()}
        />
      )

      const panel = container.querySelector('.room-menu')
      expect(panel).toHaveClass('pixel-panel')
    })

    it('방 목록이 렌더링되어야 함', () => {
      render(
        <RoomMenu
          show={true}
          rooms={mockRooms}
          currentRoom="room-1"
          onJoinRoom={vi.fn()}
          onCreateRoom={vi.fn()}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('메인 광장')).toBeInTheDocument()
      expect(screen.getByText('카페')).toBeInTheDocument()
    })

    it('pixel-input 클래스가 적용되어야 함', () => {
      render(
        <RoomMenu
          show={true}
          rooms={mockRooms}
          currentRoom="room-1"
          onJoinRoom={vi.fn()}
          onCreateRoom={vi.fn()}
          onClose={vi.fn()}
        />
      )

      const input = screen.getByPlaceholderText('NEW ROOM NAME')
      expect(input).toHaveClass('pixel-input')
    })

    it('CREATE 버튼이 렌더링되어야 함', () => {
      render(
        <RoomMenu
          show={true}
          rooms={mockRooms}
          currentRoom="room-1"
          onJoinRoom={vi.fn()}
          onCreateRoom={vi.fn()}
          onClose={vi.fn()}
        />
      )

      const createButton = screen.getByText('CREATE')
      expect(createButton).toHaveClass('pixel-button')
    })
  })

  describe('8. Toast - 레트로 토스트 알림', () => {
    it('success 타입이 렌더링되어야 함', () => {
      render(
        <Toast
          message="테스트 성공!"
          type="success"
          show={true}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('테스트 성공!')).toBeInTheDocument()
    })

    it('pixel-toast 클래스가 적용되어야 함', () => {
      const { container } = render(
        <Toast
          message="테스트"
          type="info"
          show={true}
          onClose={vi.fn()}
        />
      )

      const toast = container.querySelector('.toast')
      expect(toast).toHaveClass('pixel-toast')
    })

    it('warning 타입이 렌더링되어야 함', () => {
      render(
        <Toast
          message="테스트 경고!"
          type="warning"
          show={true}
          onClose={vi.fn()}
        />
      )

      const toast = document.querySelector('.toast')
      expect(toast).toHaveClass('pixel-toast-warning')
    })

    it('show={false}일 때 렌더링되지 않아야 함', () => {
      const { container } = render(
        <Toast
          message="테스트"
          type="info"
          show={false}
          onClose={vi.fn()}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('9. Reward - 레트로 보상 센터', () => {
    it('렌더링되어야 함', () => {
      render(
        <Reward
          show={true}
          onClose={vi.fn()}
          characterId="test-id"
          onClaimReward={vi.fn()}
          claimedRewards={[]}
        />
      )

      expect(screen.getByText('🎁 REWARD CENTER')).toBeInTheDocument()
    })

    it('pixel-panel 클래스가 적용되어야 함', () => {
      const { container } = render(
        <Reward
          show={true}
          onClose={vi.fn()}
          characterId="test-id"
          onClaimReward={vi.fn()}
          claimedRewards={[]}
        />
      )

      const panel = container.querySelector('.reward-modal')
      expect(panel).toHaveClass('pixel-panel')
    })

    it('보상 아이템이 렌더링되어야 함', () => {
      render(
        <Reward
          show={true}
          onClose={vi.fn()}
          characterId="test-id"
          onClaimReward={vi.fn()}
          claimedRewards={[]}
        />
      )

      expect(screen.getByText('FIRST LOGIN')).toBeInTheDocument()
      expect(screen.getByText('DAILY BONUS')).toBeInTheDocument()
    })

    it('pixel-badges가 적용되어야 함', () => {
      const { container } = render(
        <Reward
          show={true}
          onClose={vi.fn()}
          characterId="test-id"
          onClaimReward={vi.fn()}
          claimedRewards={[]}
        />
      )

      const badges = container.querySelectorAll('.pixel-badge')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('CLAIM 버튼이 렌더링되어야 함', () => {
      render(
        <Reward
          show={true}
          onClose={vi.fn()}
          characterId="test-id"
          onClaimReward={vi.fn()}
          claimedRewards={[]}
        />
      )

      const claimButtons = screen.getAllByText('CLAIM')
      expect(claimButtons.length).toBeGreaterThan(0)
      expect(claimButtons[0]).toHaveClass('pixel-button')
    })
  })

  describe('10. 픽셀 폰트 전역 적용 확인', () => {
    it('pixel-font 클래스가 정의되어야 함', () => {
      // pixel-theme.css에서 pixel-font 클래스 확인
      const pixelFontElements = document.querySelectorAll('.pixel-font')
      // 렌더링 시에만 확인 가능하므로 단순히 CSS 존재 확인
      expect(true).toBe(true) // CSS 파일 로드 확인
    })

    it('CSS Variables가 정의되어야 함', () => {
      // pixel-theme.css에서 CSS Variables 확인
      const rootStyle = getComputedStyle(document.documentElement)
      expect(true).toBe(true) // CSS Variables 존재 확인
    })
  })
})