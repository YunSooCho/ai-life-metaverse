import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeList from './RecipeList';
import '@testing-library/jest-dom';

describe('RecipeList Component', () => {
  const mockRecipes = [
    {
      id: 'recipe1',
      name: '나무 검',
      description: '나무로 만든 기본 검',
      requiredLevel: 1,
      materials: [
        { itemId: 'wood', quantity: 2 },
        { itemId: 'stone', quantity: 1 }
      ],
      result: {
        itemId: 'wooden_sword',
        quantity: 1
      },
      craftingTime: 1000,
      difficulty: 'easy',
      category: 'equipment',
      maxFailureRate: 0.1
    },
    {
      id: 'recipe2',
      name: '철 검',
      description: '철로 만든 강력한 검',
      requiredLevel: 3,
      materials: [
        { itemId: 'iron', quantity: 2 },
        { itemId: 'wood', quantity: 1 }
      ],
      result: {
        itemId: 'iron_sword',
        quantity: 1
      },
      craftingTime: 2000,
      difficulty: 'normal',
      category: 'equipment',
      maxFailureRate: 0.2
    },
    {
      id: 'recipe3',
      name: '체력 포션',
      description: '체력을 회복하는 포션',
      requiredLevel: 1,
      materials: [
        { itemId: 'herb', quantity: 3 },
        { itemId: 'water', quantity: 1 }
      ],
      result: {
        itemId: 'health_potion',
        quantity: 1
      },
      craftingTime: 500,
      difficulty: 'easy',
      category: 'consumable',
      maxFailureRate: 0.05
    }
  ];

  const mockInventory = {
    wood: 3,
    stone: 5,
    iron: 2,
    herb: 2,
    water: 10
  };

  const mockOnRecipeSelect = jest.fn();
  const mockOnCraft = jest.fn();
  const mockT = (key) => key;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('레시피 목록이 올바르게 렌더링된다', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={1}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    expect(screen.getByText(/recipeList/i)).toBeInTheDocument();
    expect(screen.getByText('나무 검')).toBeInTheDocument();
    expect(screen.getByText('철 검')).toBeInTheDocument();
    expect(screen.getByText('체력 포션')).toBeInTheDocument();
  });

  test('카테고리별로 레시피가 그룹화된다', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={5}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    // 장비 카테고리
    expect(screen.getByText(/equipment/i)).toBeInTheDocument();
    expect(screen.getByText('나무 검')).toBeInTheDocument();
    expect(screen.getByText('철 검')).toBeInTheDocument();

    // 소모품 카테고리
    expect(screen.getByText(/consumable/i)).toBeInTheDocument();
    expect(screen.getByText('체력 포션')).toBeInTheDocument();
  });

  test('레시피 제작 가능 여부가 올바르게 표시된다 - 레벨 부족', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={1}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    // 철 검 (레벨 3 필요)
    const ironSwordRecipe = screen.getByText('철 검').closest('.recipe-item');
    expect(ironSwordRecipe).toHaveClass('disabled');
    expect(screen.getByText(/levelRequired/i)).toBeInTheDocument();
  });

  test('레시피 제작 가능 여부가 올바르게 표시된다 - 재료 부족', () => {
    const lowInventory = {
      wood: 5,
      stone: 5,
      iron: 2,
      herb: 1,  // 2개 필요, 1개만 있음
      water: 10
    };

    render(
      <RecipeList
        recipes={mockRecipes}
        level={5}
        inventory={lowInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    // 체력 포션 (허브 3개 필요, 1개만 있음)
    const healthPotionRecipe = screen.getByText('체력 포션').closest('.recipe-item');
    expect(healthPotionRecipe).toHaveClass('disabled');
    expect(screen.getByText(/missingMaterials/i)).toBeInTheDocument();
  });

  test('제작 가능한 레시피가 활성 상태로 표시된다', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={5}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    // 나무 검 (레벨 1, 재료 충분)
    const woodenSwordRecipe = screen.getByText('나무 검').closest('.recipe-item');
    expect(woodenSwordRecipe).not.toHaveClass('disabled');
  });

  test('레시피 클릭 시 onRecipeSelect가 호출된다', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={5}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const woodenSwordRecipe = screen.getByText('나무 검').closest('.recipe-item');
    fireEvent.click(woodenSwordRecipe);

    expect(mockOnRecipeSelect).toHaveBeenCalledWith(mockRecipes[0]);
  });

  test('제작 버튼 클릭 시 onCraft가 호출된다', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={5}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const craftButtons = screen.getAllByText(/craft/i);
    fireEvent.click(craftButtons[0]);

    expect(mockOnCraft).toHaveBeenCalledWith(mockRecipes[0]);
  });

  test('제작 중일 때 제작 버튼이 비활성화된다', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={5}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={true}
        t={mockT}
      />
    );

    const craftButtons = screen.getAllByText('...');
    expect(craftButtons.length).toBeGreaterThan(0);
  });

  test('빈 레시피 목록이면 메시지가 표시된다', () => {
    render(
      <RecipeList
        recipes={[]}
        level={1}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    expect(screen.getByText(/noRecipes/i)).toBeInTheDocument();
  });

  test('레시피 레벨 배지가 올바르게 표시된다', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={5}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    // 각 레시피의 레벨 배지 확인
    expect(screen.getByText('1')).toBeInTheDocument(); // 나무 검
    expect(screen.getByText('3')).toBeInTheDocument(); // 철 검
  });

  test('선택된 레시피가 강조 표시된다', () => {
    render(
      <RecipeList
        recipes={mockRecipes}
        level={5}
        inventory={mockInventory}
        onRecipeSelect={mockOnRecipeSelect}
        selectedRecipe={mockRecipes[0]}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const woodenSwordRecipe = screen.getByText('나무 검').closest('.recipe-item');
    expect(woodenSwordRecipe).toHaveClass('selected');
  });
});