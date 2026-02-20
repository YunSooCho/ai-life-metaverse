import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Crafting from './Crafting';
import { I18nProvider } from '../i18n/I18nContext';

describe('Crafting Component - Issue #137 Fix', () => {
  const defaultProps = {
    craftingLevel: 1,
    craftingExp: 0,
    characterId: 'test-char-1',
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithI18n = (component) => {
    return render(
      <I18nProvider>
        {component}
      </I18nProvider>
    );
  };

  test('제작 패널 컴포넌트가 렌더링됨', () => {
    const { container } = renderWithI18n(<Crafting {...defaultProps} />);

    // crafting-panel 클래스가 존재하는지 확인
    expect(container.querySelector('.crafting-panel')).toBeInTheDocument();
  });

  test('닫기 버튼(X) 클릭 동작', () => {
    renderWithI18n(<Crafting {...defaultProps} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});