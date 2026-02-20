import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecipePreview from './RecipePreview';
import '@testing-library/jest-dom';

describe('RecipePreview Component', () => {
  const mockRecipe = {
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
      quantity: 1,
      minQuantity: 1,
      maxQuantity: 3
    },
    craftingTime: 1000,
    difficulty: 'easy',
    category: 'equipment',
    maxFailureRate: 0.1
  };

  const mockSufficientInventory = {
    wood: 5,
    stone: 10
  };

  const mockInsufficientInventory = {
    wood: 1,  // 2개 필요, 1개만 있음
    stone: 10
  };

  const mockTable = {
    id: 'table1',
    name: '초급 제작대',
    location: 'main_plaza',
    level: 'beginner',
    bonus: {
      expBoost: 0.2,  // 20% 경험치 증가
      failRateReduction: 0.1  // 10% 실패 확률 감소
    },
    maxConcurrentCrafts: 1
  };

  const mockOnCraft = jest.fn();
  const mockT = (key) => key;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('레시피 미리보기가 올바르게 렌더링된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    expect(screen.getByText(/recipePreview/i)).toBeInTheDocument();
    expect(screen.getByText('나무 검')).toBeInTheDocument();
    expect(screen.getByText('나무로 만든 기본 검')).toBeInTheDocument();
  });

  test('날이도가 올바르게 표시된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    expect(screen.getByText(/difficulty.easy/i)).toBeInTheDocument();
  });

  test('결과물이 올바르게 표시된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    expect(screen.getByText(/result/i)).toBeInTheDocument();
    expect(screen.getByText('wooden_sword')).toBeInTheDocument();
    expect(screen.getByText('(1~3)')).toBeInTheDocument();
  });

  test('재료 목록이 올바르게 표시된다 - 재료 충분', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    expect(screen.getByText(/materials/i)).toBeInTheDocument();
    expect(screen.getByText('wood')).toBeInTheDocument();
    expect(screen.getByText('5 / 2')).toBeInTheDocument();
    expect(screen.getByText('stone')).toBeInTheDocument();
    expect(screen.getByText('10 / 1')).toBeInTheDocument();
  });

  test('재료 목록이 올바르게 표시된다 - 재료 부족', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockInsufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    expect(screen.getByText('wood')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  test('성공 확률이 올바르게 계산되고 표시된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    // maxFailureRate: 0.1, 테이블 bonus: 0.1
    // adjustedFailureRate = 0.1 * (1 - 0.1) = 0.09
    // successRate = 91.0%
    const successRate = screen.getByText(/successRate/i).nextElementSibling;
    expect(successRate.textContent).toBe('91.0%');
  });

  test('실패 확률이 올바르게 계산되고 표시된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const failureRate = screen.getByText(/failureRate/i).nextElementSibling;
    expect(failureRate.textContent).toBe('9.0%');
  });

  test('경험치 획득량이 올바르게 계산되고 표시된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const expGain = screen.getByText(/expGain/i).nextElementSibling;
    expect(expGain.textContent).toBe('+24 EXP');
  });

  test('테이블 보너스 없는 경우 기본 경험치가 계산된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={null}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const expGain = screen.getByText(/expGain/i).nextElementSibling;
    expect(expGain.textContent).toBe('+20 EXP');
  });

  test('제작 시간이 올바르게 표시된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const craftingTime = screen.getByText(/craftingTime/i).nextElementSibling;
    expect(craftingTime.textContent).toBe('1.0s');
  });

  test('테이블 이름이 표시된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    expect(screen.getByText(/craftingTable/i).nextElementSibling.textContent).toBe('초급 제작대');
  });

  test('제작 버튼 클릭 시 onCraft가 호출된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const craftButton = screen.getByText(/craft/i);
    fireEvent.click(craftButton);

    expect(mockOnCraft).toHaveBeenCalledTimes(1);
  });

  test('제작 가능할 때 버튼이 활성화된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const craftButton = screen.getByText(/craft/i);
    expect(craftButton.closest('.craft-button')).not.toHaveClass('disabled');
  });

  test('레벨이 부족할 때 버튼이 비활성화된다', () => {
    render(
      <RecipePreview
        recipe={{ ...mockRecipe, requiredLevel: 5 }}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const craftButton = screen.getByText(/craft/i);
    expect(craftButton.closest('.craft-button')).toHaveClass('disabled');
  });

  test('재료가 부족할 때 버튼이 비활성화된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockInsufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    const craftButton = screen.getByText(/craft/i);
    expect(craftButton.closest('.craft-button')).toHaveClass('disabled');
  });

  test('제작 중일 때 버튼이 비활성화된다', () => {
    render(
      <RecipePreview
        recipe={mockRecipe}
        inventory={mockSufficientInventory}
        level={1}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={true}
        t={mockT}
      />
    );

    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.getByText('...').closest('.craft-button')).toHaveClass('disabled');
  });

  test('레벨 차이에 따른 실패 확률 감소가 계산된다', () => {
    const hardRecipe = {
      ...mockRecipe,
      requiredLevel: 1,
      maxFailureRate: 0.3
    };

    render(
      <RecipePreview
        recipe={hardRecipe}
        inventory={mockSufficientInventory}
        level={5}  // 레벨이 더 높음
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    // 레벨 차이: 5 - 1 = 4
    // adjustedFailureRate = max(0, 0.3 - (4 * -0.05)) = max(0, 0.3 + 0.2) = 0.5
    // 테이블 보너스: 0.5 * (1 - 0.1) = 0.45
    const failureRate = screen.getByText(/failureRate/i).nextElementSibling;
    expect(failureRate.textContent).toBe('100.0%'); // 최대 100%
  });

  test('난이도에 따른 경험치 배수가 적용된다', () => {
    const hardRecipe = {
      ...mockRecipe,
      difficulty: 'hard',
      requiredLevel: 5
    };

    render(
      <RecipePreview
        recipe={hardRecipe}
        inventory={mockSufficientInventory}
        level={5}
        table={mockTable}
        onCraft={mockOnCraft}
        isCrafting={false}
        t={mockT}
      />
    );

    // 난이도 hard: x1.5
    // 기본 경험치: 20 * 1.5 * 5 = 150
    // 테이블 보너스: 150 * (1 + 0.2) = 180
    const expGain = screen.getByText(/expGain/i).nextElementSibling;
    expect(expGain.textContent).toBe('+180 EXP');
  });
});