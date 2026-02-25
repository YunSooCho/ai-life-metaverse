// 테스트 헬퍼 - vitest 호환용 I18nProvider 포트
import React from 'react';
import { render } from '@testing-library/react';

// 테스트용 더미 I18n 컨텍스트
export function createTestI18n() {
  return {
    t: (key) => key,
    locale: 'ko',
    setLocale: () => {},
    translations: {},
    isRTL: () => false
  };
}

// I18nContext를 모킹
jest.mock('../src/i18n/I18nContext.jsx', () => ({
  I18nContext: React.createContext(createTestI18n()),
  I18nProvider: ({ children }) => {
    const value = createTestI18n();
    return React.createElement(I18nContext.Provider, { value }, children);
  },
  useI18n: () => createTestI18n()
}));

// vitest에서 사용할 테스트 유틸리티
export function renderWithI18n(ui, options = {}) {
  return render(ui, options);
}