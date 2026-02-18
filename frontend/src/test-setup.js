import { vi } from 'vitest';
import '@testing-library/jest-dom';

// I18nContext 모킹 - vitest 호환
vi.mock('./i18n/I18nContext.jsx', () => {
  const React = require('react');

  // 테스트용 더미 번역 (실제 번역에서 주요 키만 추출)
  // ⚠️ 테스트에서는 영어 텍스트를 찾으므로 영어로 설정
  const mockTranslations = {
    'ui.inventory.title': 'INVENTORY',
    'ui.inventory.empty': 'INVENTORY EMPTY',
    'ui.inventory.emptyMessage': '아이템이 없습니다',
    'ui.inventory.close': '닫기',
    'ui.inventory.use': 'USE',
    'ui.inventory.emptyMessage': '아이템이 없습니다',
    'ui.inventory.close': '닫기',
    'ui.inventory.use': 'USE',
    'ui.inventory.drop': '버리기',
    'ui.inventory.itemDetail': '아이템 상세',
    'ui.inventory.noItem': '아이템 없음',
    'ui.inventory.total': 'TOTAL:',
    'ui.buttons.use': 'USE',
    'ui.buttons.drop': '버리기',
    'ui.buttons.close': '닫기',
    'ui.buttons.refresh': 'REFRESH',
    'ui.dialog.close': '닫기',
    'ui.chat.placeholder': '메시지를 입력하세요...',
    'buttons.use': 'USE',
    'buttons.drop': '버리기',
    'buttons.close': '닫기',
    'buttons.refresh': 'REFRESH',
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
    'app.anonymous': '익명',
    'app.title': 'AI 라이프',
    'app.loading': '로딩 중...',
    'error.default': '오류가 발생했습니다',
    'ui.items.healthPotion': 'HP POTION',
    'ui.items.coin': 'COIN',
    'ui.items.giftBox': 'GIFT BOX',
    'ui.items.experiencePotion': 'EXP POTION',
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