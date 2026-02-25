// 컴포넌트 테스트 전용 테스트 헬퍼
import { vi } from 'vitest';

// I18N 모킹 (컴포넌트 테스트에서만 사용)
export function setupI18nMock() {
  vi.mock('../i18n/I18nContext.jsx', () => {
    const React = require('react');

    // 테스트용 더미 번역
    const mockTranslations = {
      'ui.inventory.title': '인벤토리',
      'ui.inventory.empty': '아이템이 없습니다',
      'ui.inventory.close': '닫기',
      'ui.inventory.use': '사용',
      'ui.inventory.drop': '버리기',
      'ui.buttons.use': '사용',
      'ui.buttons.drop': '버리기',
      'character.level': '레벨',
      'character.exp': '경험치',
      'character.hp': 'HP',
      'character.affinity': '호감도',
      'common.yes': '예',
      'common.no': '아니오',
      'common.cancel': '취소',
      'common.confirm': '확인',
      'ui.dialog.close': '닫기',
    };

    const dummyI18n = {
      t: vi.fn((key) => mockTranslations[key] || key),
      locale: 'ko',
      setLocale: vi.fn(),
      translations: mockTranslations,
      isRTL: vi.fn(() => false)
    };

    const I18nContext = React.createContext(dummyI18n);

    return {
      I18nContext: I18nContext,
      I18nProvider: vi.fn(({ children }) => {
        return React.createElement(I18nContext.Provider, { value: dummyI18n }, children);
      }),
      useI18n: vi.fn(() => dummyI18n),
      default: dummyI18n
    };
  });
}