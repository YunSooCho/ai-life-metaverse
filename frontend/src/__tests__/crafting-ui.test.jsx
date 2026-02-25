/**
 * Crafting System Tests
 * 제작 시스템 UI 컴포넌트 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { I18nProvider } from '../i18n/I18nContext'
import Crafting from '../components/Crafting.jsx'
import RecipeList from '../components/RecipeList.jsx'
import RecipePreview from '../components/RecipePreview.jsx'

// Mock socket
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
}

// Sample recipe data
const mockRecipes = [
  {
    id: 'healthPotion',
    name: 'HP 포션',
    description: 'HP를 50 회복합니다',
    requiredLevel: 1,
    materials: [
      { itemId: 'herb', quantity: 3 },
      { itemId: 'water', quantity: 1 }
    ],
    result: { itemId: 'healthPotion', quantity: 1 },
    difficulty: 'easy',
    category: 'consumable',
    maxFailureRate: 0.1
  },
  {
    id: 'sword',
    name: '검',
    description: '기본 공격력 10의 검',
    requiredLevel: 5,
    materials: [
      { itemId: 'iron', quantity: 5 },
      { itemId: 'wood', quantity: 2 }
    ],
    result: { itemId: 'sword', quantity: 1 },
    difficulty: 'normal',
    category: 'equipment',
    maxFailureRate: 0.2
  }
]

// Sample inventory data
const mockInventory = {
  herb: 10,
  water: 5,
  iron: 3,
  wood: 2
}

// Mock callbacks
const mockCallbacks = {
  onSelectRecipe: vi.fn(),
  onCraft: vi.fn()
}

// Wrapper with I18nProvider
function Wrapper({ children }) {
  return <I18nProvider>{children}</I18nProvider>
}

describe('RecipeList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders recipes correctly', () => {
    render(
      <Wrapper>
        <RecipeList
          recipes={mockRecipes}
          inventory={mockInventory}
          craftingLevel={5}
          selectedRecipe={null}
          onSelectRecipe={mockCallbacks.onSelectRecipe}
        />
      </Wrapper>
    )

    // 레시피 이름 확인
    expect(screen.getByText('HP 포션')).toBeInTheDocument()
    expect(screen.getByText('검')).toBeInTheDocument()

    // 필요 레벨 확인
    expect(screen.getByText('⚒️ 필요 레벨: 1')).toBeInTheDocument()
    expect(screen.getByText('⚒️ 필요 레벨: 5')).toBeInTheDocument()

    // 난이도 확인
    expect(screen.getByText('EASY')).toBeInTheDocument()
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
  })

  it('shows "can craft" status for craftable recipes', () => {
    render(
      <Wrapper>
        <RecipeList
          recipes={[mockRecipes[0]]}
          inventory={mockInventory}
          craftingLevel={1}
          selectedRecipe={null}
          onSelectRecipe={mockCallbacks.onSelectRecipe}
        />
      </Wrapper>
    )

    expect(screen.getByText('✓ 제작 가능')).toBeInTheDocument()
  })

  it('shows "cannot craft" status for insufficient materials', () => {
    const insufficientInventory = { herb: 1, water: 0 }

    render(
      <Wrapper>
        <RecipeList
          recipes={[mockRecipes[0]]}
          inventory={insufficientInventory}
          craftingLevel={1}
          selectedRecipe={null}
          onSelectRecipe={mockCallbacks.onSelectRecipe}
        />
      </Wrapper>
    )

    expect(screen.getByText('✕ 제작 불가')).toBeInTheDocument()
    expect(screen.getByText(/herb \(-2\)/)).toBeInTheDocument()
    expect(screen.getByText(/water \(-1\)/)).toBeInTheDocument()
  })

  it('shows "cannot craft" status for insufficient level', () => {
    render(
      <Wrapper>
        <RecipeList
          recipes={[mockRecipes[1]]}
          inventory={mockInventory}
          craftingLevel={3}
          selectedRecipe={null}
          onSelectRecipe={mockCallbacks.onSelectRecipe}
        />
      </Wrapper>
    )

    expect(screen.getByText('✕ 제작 불가')).toBeInTheDocument()
  })

  it('calls onSelectRecipe when clicking a craftable recipe', () => {
    render(
      <Wrapper>
        <RecipeList
          recipes={[mockRecipes[0]]}
          inventory={mockInventory}
          craftingLevel={1}
          selectedRecipe={null}
          onSelectRecipe={mockCallbacks.onSelectRecipe}
        />
      </Wrapper>
    )

    const recipeItem = screen.getByText('HP 포션').closest('.recipe-item')
    fireEvent.click(recipeItem)

    expect(mockCallbacks.onSelectRecipe).toHaveBeenCalledWith(mockRecipes[0])
  })

  it('does not call onSelectRecipe when clicking disabled recipe', () => {
    render(
      <Wrapper>
        <RecipeList
          recipes={[mockRecipes[1]]}
          inventory={mockInventory}
          craftingLevel={3}
          selectedRecipe={null}
          onSelectRecipe={mockCallbacks.onSelectRecipe}
        />
      </Wrapper>
    )

    const recipeItem = screen.getByText('검').closest('.recipe-item')
    fireEvent.click(recipeItem)

    expect(mockCallbacks.onSelectRecipe).not.toHaveBeenCalled()
  })

  it('shows "no recipes" message when recipes list is empty', () => {
    render(
      <Wrapper>
        <RecipeList
          recipes={[]}
          inventory={mockInventory}
          craftingLevel={1}
          selectedRecipe={null}
          onSelectRecipe={mockCallbacks.onSelectRecipe}
        />
      </Wrapper>
    )

    expect(screen.getByText('제작 가능한 레시피가 없습니다')).toBeInTheDocument()
  })

  it('shows selected recipe with different styling', () => {
    render(
      <Wrapper>
        <RecipeList
          recipes={[mockRecipes[0]]}
          inventory={mockInventory}
          craftingLevel={1}
          selectedRecipe={mockRecipes[0]}
          onSelectRecipe={mockCallbacks.onSelectRecipe}
        />
      </Wrapper>
    )

    const recipeItem = screen.getByText('HP 포션').closest('.recipe-item')
    expect(recipeItem).toHaveClass('selected')
  })
})

describe('RecipePreview Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders recipe details correctly', () => {
    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[0]}
          inventory={mockInventory}
          craftingLevel={1}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    expect(screen.getByText('HP 포션')).toBeInTheDocument()
    expect(screen.getByText('HP를 50 회복합니다')).toBeInTheDocument()
    expect(screen.getByText('⚒️ 필요 레벨:')).toBeInTheDocument()
    expect(screen.getByText('🎯 난이도:')).toBeInTheDocument()
    expect(screen.getByText('📊 성공 확률:')).toBeInTheDocument()
  })

  it('shows success rate correctly', () => {
    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[0]}
          inventory={mockInventory}
          craftingLevel={1}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    // 성공 확률은 레벨과 난이도에 따라 계산됨
    const successRateText = screen.getByText(/\d+%/)
    expect(successRateText).toBeInTheDocument()
  })

  it('shows materials list with quantities', () => {
    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[0]}
          inventory={mockInventory}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    expect(screen.getByText('herb')).toBeInTheDocument()
    expect(screen.getByText('10 / 3')).toBeInTheDocument()
    expect(screen.getByText('water')).toBeInTheDocument()
    expect(screen.getByText('5 / 1')).toBeInTheDocument()
  })

  it('shows result item', () => {
    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[0]}
          inventory={mockInventory}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    expect(screen.getByText('✨ 결과물:')).toBeInTheDocument()
    expect(screen.getByText('healthPotion')).toBeInTheDocument()
  })

  it('shows craft button as enabled when craftable', () => {
    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[0]}
          inventory={mockInventory}
          craftingLevel={1}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    const craftButton = screen.getByRole('button', { name: /제작하기/ })
    expect(craftButton).not.toBeDisabled()
  })

  it('shows craft button as disabled when not craftable (level)', () => {
    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[1]}
          inventory={mockInventory}
          craftingLevel={3}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    const craftButton = screen.getByRole('button', { name: /사용 불가/ })
    expect(craftButton).toBeDisabled()
    expect(screen.getByText(/필요 레벨: 5/)).toBeInTheDocument()
  })

  it('shows craft button as disabled when not craftable (materials)', () => {
    const insufficientInventory = { herb: 1, water: 0 }

    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[0]}
          inventory={insufficientInventory}
          craftingLevel={1}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    const craftButton = screen.getByRole('button', { name: /사용 불가/ })
    expect(craftButton).toBeDisabled()
    expect(screen.getByText(/재료 부족/)).toBeInTheDocument()
  })

  it('calls onCraft when clicking craft button', () => {
    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[0]}
          inventory={mockInventory}
          craftingLevel={1}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    const craftButton = screen.getByRole('button', { name: /제작하기/ })
    fireEvent.click(craftButton)

    expect(mockCallbacks.onCraft).toHaveBeenCalled()
  })

  it('shows crafting动画 when crafting', async () => {
    render(
      <Wrapper>
        <RecipePreview
          recipe={mockRecipes[0]}
          inventory={mockInventory}
          craftingLevel={1}
          onCraft={mockCallbacks.onCraft}
        />
      </Wrapper>
    )

    const craftButton = screen.getByRole('button', { name: /제작하기/ })
    fireEvent.click(craftButton)

    await waitFor(() => {
      expect(screen.getByText('⚒️ 제작 중...')).toBeInTheDocument()
    })
  })
})

describe('Crafting Component Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads crafting data on mount', () => {
    render(
      <Wrapper>
        <Crafting
          show={true}
          onClose={vi.fn()}
          characterId="test-character"
          socket={mockSocket}
        />
      </Wrapper>
    )

    // Socket 이벤트 전송 확인
    expect(mockSocket.emit).toHaveBeenCalledWith('getCraftingLevel', expect.any(Object), expect.any(Function))
    expect(mockSocket.emit).toHaveBeenCalledWith('getRecipes', expect.any(Object), expect.any(Function))
    expect(mockSocket.emit).toHaveBeenCalledWith('getInventory', expect.any(Object), expect.any(Function))
    expect(mockSocket.emit).toHaveBeenCalledWith('getCraftingHistory', expect.any(Object), expect.any(Function))
  })

  it('sets up socket event listeners', () => {
    render(
      <Wrapper>
        <Crafting
          show={true}
          onClose={vi.fn()}
          characterId="test-character"
          socket={mockSocket}
        />
      </Wrapper>
    )

    expect(mockSocket.on).toHaveBeenCalledWith('craftingResult', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('inventoryUpdate', expect.any(Function))
  })

  it('shows crafting level and experience', () => {
    mockSocket.emit.mockImplementation((event, data, callback) => {
      if (event === 'getCraftingLevel') {
        callback({ success: true, data: { level: 5, exp: 50, expToNext: 100 } })
      }
    })

    render(
      <Wrapper>
        <Crafting
          show={true}
          onClose={vi.fn()}
          characterId="test-character"
          socket={mockSocket}
        />
      </Wrapper>
    )

    expect(screen.getByText(/제작 레벨: 5/)).toBeInTheDocument()
    expect(screen.getByText('50 / 100')).toBeInTheDocument()
  })

  it('shows empty preview when no recipe selected', () => {
    render(
      <Wrapper>
        <Crafting
          show={true}
          onClose={vi.fn()}
          characterId="test-character"
          socket={mockSocket}
        />
      </Wrapper>
    )

    expect(screen.getByText('레시피를 선택하세요')).toBeInTheDocument()
  })
})

/**
 * Total tests: 20 tests
 * Component coverage: Crafting, RecipeList, RecipePreview
 * Integration coverage: Socket events, data loading, state management
 */