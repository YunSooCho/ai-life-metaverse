import { vi } from 'vitest';
import '@testing-library/jest-dom';

// I18nContext 모킹 - vitest 호환
vi.mock('./i18n/I18nContext.jsx', () => {
  const React = require('react');

  // 테스트용 더미 번역 (실제 번역에서 주요 키만 추출)
  const mockTranslations = {
    'ui.inventory.title': '인벤토리',
    'ui.inventory.empty': '아이템이 없습니다',
    'ui.inventory.emptyMessage': '아이템이 없습니다',
    'ui.inventory.close': '닫기',
    'ui.inventory.use': '사용',
    'ui.inventory.drop': '버리기',
    'ui.inventory.itemDetail': '아이템 상세',
    'ui.inventory.noItem': '아이템 없음',
    'ui.buttons.use': '사용',
    'ui.buttons.drop': '버리기',
    'ui.buttons.close': '닫기',
    'ui.dialog.close': '닫기',
    'buttons.use': '사용',
    'buttons.drop': '버리기',
    'buttons.close': '닫기',
    'character.level': '레벨',
    'character.exp': '경험치',
    'character.hp': 'HP',
    'character.affinity': '호감도',
    'ui.toast.save': '저장 완료',
    'ui.toast.load': '로드 완료',
    'ui.toast.error': '오류',
    'common.yes': '예',
    'common.no': '아니오',
    'common.cancel': '취소',
    'common.back': '뒤로',
    'common.next': '다음',
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