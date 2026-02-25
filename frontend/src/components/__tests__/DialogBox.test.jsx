import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DialogBox from '../DialogBox';

describe('DialogBox 컴포넌트', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('기본 렌더링', () => {
    it('visible=false 일 때 렌더링하지 않음', () => {
      const { container } = render(<DialogBox visible={false} text="테스트 대화" />);
      expect(container.firstChild).toBeNull();
    });

    it('visible=true 일 때 렌더링', () => {
      render(<DialogBox visible={true} text="테스트 대화" />);
      const dialogText = screen.getByText('테스트 대화');
      expect(dialogText).toBeInTheDocument();
    });

    it('화자 이름 표시', () => {
      render(<DialogBox visible={true} speaker="테스트 캐릭터" text="안녕하세요" />);
      const speaker = screen.getByText('테스트 캐릭터');
      expect(speaker).toBeInTheDocument();
    });
  });

  describe('선택지 기능', () => {
    it('선택지가 없을 때 렌더링', () => {
      render(<DialogBox visible={true} text="선택지 없는 대화" />);
      expect(screen.queryAllByRole('button').length).toBe(0);
    });

    it('선택지 렌더링', () => {
      const choices = [
        { text: '예', onSelect: vi.fn() },
        { text: '아니오', onSelect: vi.fn() },
      ];

      render(<DialogBox visible={true} text="선택지 있는 대화" choices={choices} />);

      expect(screen.getByText('예')).toBeInTheDocument();
      expect(screen.getByText('아니오')).toBeInTheDocument();
    });

    it('선택지 클릭 시 onSelect 호출', () => {
      const mockSelect1 = vi.fn();
      const mockSelect2 = vi.fn();

      const choices = [
        { text: '선택 1', onSelect: mockSelect1 },
        { text: '선택 2', onSelect: mockSelect2 },
      ];

      render(<DialogBox visible={true} text="선택지 있는 대화" choices={choices} />);

      const choice2 = screen.getByText('선택 2');
      fireEvent.click(choice2);

      expect(mockSelect2).toHaveBeenCalledTimes(1);
      expect(mockSelect1).not.toHaveBeenCalled();
    });
  });

  describe('닫기 버튼', () => {
    it('onClose prop이 없을 때 닫기 버튼 렌더링 안 함', () => {
      const { container } = render(<DialogBox visible={true} text="닫기 버튼 없는 대화" />);
      expect(container.querySelector('.pixel-close-button')).toBeNull();
    });

    it('onClose prop이 있을 때 닫기 버튼 렌더링', () => {
      const { container } = render(
        <DialogBox visible={true} text="닫기 버튼 있는 대화" onClose={mockOnClose} />
      );
      expect(container.querySelector('.pixel-close-button')).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 onClose 호출', () => {
      const { container } = render(
        <DialogBox visible={true} text="클릭 테스트" onClose={mockOnClose} />
      );

      const closeButton = container.querySelector('.pixel-close-button');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('스타일링', () => {
    it('pixel-border 클래스 적용', () => {
      const { container } = render(<DialogBox visible={true} text="스타일 테스트" />);
      const dialogBorder = container.querySelector('.dialog-box-pixel-border');
      expect(dialogBorder).toBeInTheDocument();
    });

    it('speaker 내용 표시', () => {
      render(<DialogBox visible={true} speaker="히로인" text="만나서 반가워요" />);
      expect(screen.getByText('히로인')).toBeInTheDocument();
    });

    it('긴 텍스트 처리', () => {
      const longText = '이것은 매우 긴 텍스트입니다. '.repeat(10);
      const { container } = render(<DialogBox visible={true} text={longText} />);
      const dialogContent = container.querySelector('.dialog-content');
      expect(dialogContent).toBeInTheDocument();
    });
  });

  describe('다중 선택지', () => {
    it('5개 이상의 선택지 렌더링', () => {
      const choices = Array.from({ length: 5 }, (_, i) => ({
        text: `선택지 ${i + 1}`,
        onSelect: vi.fn(),
      }));

      render(<DialogBox visible={true} text="다중 선택지 테스트" choices={choices} />);

      expect(screen.getByText('선택지 1')).toBeInTheDocument();
      expect(screen.getByText('선택지 2')).toBeInTheDocument();
      expect(screen.getByText('선택지 3')).toBeInTheDocument();
      expect(screen.getByText('선택지 4')).toBeInTheDocument();
      expect(screen.getByText('선택지 5')).toBeInTheDocument();
    });
  });

  describe('특수 문자 처리', () => {
    it('HTML 엔티티 처리', () => {
      render(<DialogBox visible={true} text="<script>alert('xss')</script>" />);
      expect(screen.getByText(/alert\('xss'\)/)).toBeInTheDocument();
    });

    it('줄바꿈 문자 처리', () => {
      render(
        <DialogBox
          visible={true}
          speaker="캐릭터"
          text="첫 번째 줄\n두 번째 줄\n 세 번째 줄"
        />
      );
      expect(screen.getByText(/첫 번째 줄.*두 번째 줄.*세 번째 줄/s)).toBeInTheDocument();
    });
  });
});