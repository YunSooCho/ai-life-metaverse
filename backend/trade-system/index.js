/**
 * Trade System - 거래 시스템 모듈
 * Phase 10: 거래 시스템 (아이템 거래, 상점, 경매장, 코인 시스템)
 */

import TradeManager from './TradeManager.js';
import ShopManager from './ShopManager.js';
import AuctionManager from './AuctionManager.js';
import CoinManager from './CoinManager.js';

class TradeSystem {
  constructor(redisClient) {
    this.tradeManager = new TradeManager(redisClient);
    this.shopManager = new ShopManager(redisClient);
    this.auctionManager = new AuctionManager(redisClient);
    this.coinManager = new CoinManager(redisClient);
  }

  /**
   * 시스템 초기화
   */
  async initialize() {
    await this.shopManager.initialize();
    console.log('Trade System initialized');
  }

  // 하위 모듈 expose
  get trade() { return this.tradeManager; }
  get shop() { return this.shopManager; }
  get auction() { return this.auctionManager; }
  get coin() { return this.coinManager; }
}

// exports
export { TradeSystem, TradeManager, ShopManager, AuctionManager, CoinManager };
export default TradeSystem;