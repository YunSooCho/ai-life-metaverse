import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import InventoryWindow from '../InventoryWindow';

describe('InventoryWindow 컴포넌트', () => {
  const mockOnClose = vi.fn();
  const mockOnItemSelect = vi.fn();

  const sampleItems = [
    {
      id: 1,
      name: '체력 포션',
      icon: '❤️',
      description: '체력을 50 회복합니다',
      quantity: 5,
    },
    {
      id: 2,
      name: '마나 포션',
      icon: '💙',
      description: '마나를 50 회복합니다',
      quantity: 3,
    },
    {
      id: 3,
      name: '검',
      icon: '⚔️',
      description: '기본 공격력 10의 검',
      quantity: 1,
    },
  ];

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnItemSelect.mockClear();
  });

  describe('기본 렌더링', () => {
    it('visible=false 일 때 렌더링하지 않음', () => {
      const { container } = render(
        <InventoryWindow visible={false} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('visible=true 일 때 렌더링', () => {
      render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      expect(screen.getByText('인벤토리')).toBeInTheDocument();
    });

    it('커스텀 타이틀 표시', () => {
      render(<InventoryWindow visible={true} items={[]} title="나의 아이템" onClose={mockOnClose} />);
      expect(screen.getByText('나의 아이템')).toBeInTheDocument();
    });
  });

  describe('빈 인벤토리', () => {
    it('아이템이 없을 때 빈 상태 메시지 표시', () => {
      render(<InventoryWindow visible={true} items={[]} onClose={mockOnClose} />);
      expect(screen.getByText('아이템이 없습니다')).toBeInTheDocument();
    });

    it('빈 상태에서 아이템 선택 영역 렌더링 안 함', () => {
      const { container } = render(<InventoryWindow visible={true} items={[]} onClose={mockOnClose} />);
      expect(container.querySelector('.inventory-grid')).not.toBeInTheDocument();
    });
  });

  describe('아이템 렌더링', () => {
    it('아이템 목록 렌더링', () => {
      render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      expect(screen.getByText('체력 포션')).toBeInTheDocument();
      expect(screen.getByText('마나 포션')).toBeInTheDocument();
      expect(screen.getByText('검')).toBeInTheDocument();
    });

    it('아이템 아이콘 렌더링', () => {
      const { container } = render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const icons = container.querySelectorAll('.item-icon');
      expect(icons.length).toBe(3);
      expect(icons[0].textContent).toBe('❤️');
      expect(icons[1].textContent).toBe('💙');
      expect(icons[2].textContent).toBe('⚔️');
    });

    it('수량 표시 (quantity > 1)', () => {
      const { container } = render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const quantities = container.querySelectorAll('.item-quantity');
      expect(quantities.length).toBe(2);
      expect(quantities[0].textContent).toBe('x5');
      expect(quantities[1].textContent).toBe('x3');
    });

    it('수량 1일 때 수량 표시 안 함', () => {
      const { container } = render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const swordItem = container.querySelectorAll('.inventory-item')[2];
      const quantity = swordItem.querySelector('.item-quantity');
      expect(quantity).toBeNull();
    });
  });

  describe('아이템 선택', () => {
    it('아이템 클릭 시 선택 상태 변경', () => {
      const { container } = render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const items = container.querySelectorAll('.inventory-item');
      const firstItem = items[0];

      fireEvent.click(firstItem);
      expect(firstItem).toHaveClass('selected');
    });

    it('아이템 클릭 시 onItemSelect 호출', () => {
      const { container } = render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const items = container.querySelectorAll('.inventory-item');
      const secondItem = items[1];

      fireEvent.click(secondItem);
      expect(mockOnItemSelect).toHaveBeenCalledTimes(1);
      expect(mockOnItemSelect).toHaveBeenCalledWith(sampleItems[1]);
    });

    it('아이템 선택 시 상세 정보 표시', () => {
      render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const firstItem = screen.getAllByText('체력 포션')[0]?.closest('.inventory-item');
      if (firstItem) {
        fireEvent.click(firstItem);
        expect(screen.getByText('체력을 50 회복합니다')).toBeInTheDocument();
      }
    });

    it('다른 아이템 클릭 시 선택 변경', () => {
      const { container } = render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const items = container.querySelectorAll('.inventory-item');

      fireEvent.click(items[0]);
      expect(items[0]).toHaveClass('selected');

      fireEvent.click(items[1]);
      expect(items[0]).not.toHaveClass('selected');
      expect(items[1]).toHaveClass('selected');
    });
  });

  describe('닫기 버튼', () => {
    it('닫기 버튼 렌더링', () => {
      const { container } = render(<InventoryWindow visible={true} items={[]} onClose={mockOnClose} />);
      expect(container.querySelector('.pixel-close-button')).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 onClose 호출', () => {
      const { container } = render(<InventoryWindow visible={true} items={[]} onClose={mockOnClose} />);
      const closeButton = container.querySelector('.pixel-close-button');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일링', () => {
    it('pixel-inventory-window 클래스 적용', () => {
      const { container } = render(<InventoryWindow visible={true} items={[]} onClose={mockOnClose} />);
      const windowDiv = container.querySelector('.inventory-window');
      expect(windowDiv).toBeInTheDocument();
    });

    it('overlay 렌더링', () => {
      const { container } = render(<InventoryWindow visible={true} items={[]} onClose={mockOnClose} />);
      const overlay = container.querySelector('.inventory-window-overlay');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('상세 정보 영역', () => {
    it('아이템 선택 시 상세 정보 표시', () => {
      render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const itemElements = screen.getAllByText('체력 포션');
      expect(itemElements.length).toBe(1);

      const firstItem = itemElements[0].closest('.inventory-item');
      fireEvent.click(firstItem);

      expect(screen.getByText('체력을 50 회복합니다')).toBeInTheDocument();
    });

    it('상세 정보 액션 버튼 렌더링', () => {
      render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const itemElements = screen.getAllByText('체력 포션');
      const firstItem = itemElements[0].closest('.inventory-item');
      fireEvent.click(firstItem);

      const actionButtons = screen.getAllByText('사용');
      expect(actionButtons.length).toBeGreaterThan(0);
    });
  });

  describe('다중 아이템', () => {
    it('다수의 아이템 렌더링', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        name: `아이템 ${i + 1}`,
        icon: '📦',
        description: `설명 ${i + 1}`,
        quantity: 1,
      }));

      render(<InventoryWindow visible={true} items={manyItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      expect(screen.getByText('아이템 1')).toBeInTheDocument();
      expect(screen.getByText('아이템 20')).toBeInTheDocument();
    });

    it('GRID 레이아웃 적용', () => {
      const { container } = render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const grid = container.querySelector('.inventory-grid');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('아이템 클릭 가능', () => {
      const { container } = render(<InventoryWindow visible={true} items={sampleItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const items = container.querySelectorAll('.inventory-item');
      expect(items.length).toBe(3);
    });

    it('닫기 버튼에 role 설정', () => {
      const { container } = render(<InventoryWindow visible={true} items={[]} onClose={mockOnClose} />);
      const closeButton = container.querySelector('.pixel-close-button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('스크롤', () => {
    it('많은 아이템일 때 스크롤 활성화', () => {
      const manyItems = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        name: `아이템 ${i + 1}`,
        icon: '📦',
        description: `설명 ${i + 1}`,
        quantity: 1,
      }));

      const { container } = render(<InventoryWindow visible={true} items={manyItems} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const content = container.querySelector('.inventory-content');
      expect(content).toHaveStyle({ overflowY: 'auto' });
    });
  });

  describe('icon prop 없음', () => {
    it('icon prop 없을 때 기본 emoji 표시', () => {
      const itemsWithoutIcon = [
        {
          id: 1,
          name: '기본 아이템',
          description: '설명',
          quantity: 1,
        },
      ];

      const { container } = render(<InventoryWindow visible={true} items={itemsWithoutIcon} onClose={mockOnClose} onItemSelect={mockOnItemSelect} />);
      const icon = container.querySelector('.item-icon');
      expect(icon.textContent).toBe('📦');
    });
  });
});