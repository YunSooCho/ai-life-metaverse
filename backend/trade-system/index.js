import { TradeManager } from './trade-manager.js';
import { ShopSystem } from './shop-system.js';
import { AuctionSystem } from './auction-system.js';

/**
 * TradeSystem - 통합 거래 시스템
 *
 * 모든 거래 관련 기능을 통합한 메인 모듈
 */
export class TradeSystem {
  constructor() {
    this.tradeManager = new TradeManager();
    this.shopSystem = new ShopSystem();
    this.auctionSystem = new AuctionSystem();
    this.initialized = false;
  }

  /**
   * 시스템 초기화
   */
  initialize() {
    if (this.initialized) {
      return this.getSystemStats();
    }

    // 상점 기본 아이템 등록
    this.initializeShop();

    this.initialized = true;

    console.log('✅ TradeSystem 초기화 완료');
    console.log('   - 거래 관리 시스템: 활성');
    console.log('   - 상점 시스템: 활성');
    console.log('   - 경매장 시스템: 활성');

    return this.getSystemStats();
  }

  /**
   * 상점 기본 아이템 등록
   */
  initializeShop() {
    // 기본 아이템 등록
    const defaultItems = [
      { id: 'healthPotion', name: '체력 포션', type: 'consumable', buyPrice: 100, sellPrice: 50, stock: 100, description: 'HP를 50 회복합니다' },
      { id: 'coin', name: '코인', type: 'currency', buyPrice: 1, sellPrice: 1, stock: Infinity, description: '화폐로 사용됩니다' },
      { id: 'giftBox', name: '선물 상자', type: 'consumable', buyPrice: 200, sellPrice: 100, stock: 50, description: '호감도가 10 증가합니다' },
      { id: 'experiencePotion', name: '경험치 포션', type: 'consumable', buyPrice: 300, sellPrice: 150, stock: 30, description: '경험치가 100 증가합니다' },
      { id: 'sword', name: '검', type: 'equipment', buyPrice: 1000, sellPrice: 500, stock: 10, description: '기본 검' },
      { id: 'shield', name: '방패', type: 'equipment', buyPrice: 800, sellPrice: 400, stock: 10, description: '기본 방패' },
      { id: 'ring', name: '반지', type: 'equipment', buyPrice: 1500, sellPrice: 750, stock: 5, description: '마법 반지' },
      { id: 'amulet', name: '목걸이', type: 'equipment', buyPrice: 1200, sellPrice: 600, stock: 5, description: '보호 목걸이' },
      { id: 'iron', name: '철', type: 'material', buyPrice: 50, sellPrice: 25, stock: 200, description: '재료: 철' },
      { id: 'gold', name: '금', type: 'material', buyPrice: 200, sellPrice: 100, stock: 100, description: '재료: 금' }
    ];

    for (const item of defaultItems) {
      this.shopSystem.addShopItem(
        item.id,
        item.name,
        item.type,
        item.buyPrice,
        item.sellPrice,
        item.stock,
        item.description
      );
    }

    console.log(`🏪 기본 상점 아이템 ${defaultItems.length}개 등록 완료`);
  }

  /**
   * 시스템 통계
   */
  getSystemStats() {
    return {
      initialized: this.initialized,
      tradeManager: this.tradeManager.getSystemStats(),
      shopSystem: this.shopSystem.getSystemStats(),
      auctionSystem: this.auctionSystem.getSystemStats()
    };
  }
}

// 기본 인스턴스 생성
export const tradeSystem = new TradeSystem();

export default TradeSystem;
export { TradeManager } from './trade-manager.js';
export { ShopSystem } from './shop-system.js';
export { AuctionSystem } from './auction-system.js';