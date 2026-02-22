import { TradeIdGenerator } from './trade-id-generator.js';

/**
 * ShopSystem - 상점 시스템
 *
 * 기능:
 * - 기본 상점 (아이템 구매/판매)
 * - 가격 설정 (구매가/판매가)
 * - 상점 재고 관리
 * - 거래 기록
 */
export class ShopSystem {
  constructor() {
    this.idGenerator = new TradeIdGenerator();
    this.shopInventory = new Map(); // itemId -> shop item data
    this.transactions = new Map(); // transactionId -> transaction data
    this.playerTransactions = new Map(); // characterId -> transactions[]
  }

  /**
   * 상점 아이템 추가
   */
  addShopItem(itemId, name, type, buyPrice, sellPrice, stock = Infinity, description = '') {
    const shopItem = {
      itemId,
      name,
      type, // consumable, equipment, currency, material
      buyPrice,
      sellPrice,
      stock,
      description
    };

    this.shopInventory.set(itemId, shopItem);

    return {
      success: true,
      item: shopItem
    };
  }

  /**
   * 상점 아이템 제거
   */
  removeShopItem(itemId) {
    const existed = this.shopInventory.delete(itemId);

    return {
      success: existed,
      message: existed ? 'Item removed from shop' : 'Item not found in shop'
    };
  }

  /**
   * 상점 재고 업데이트
   */
  updateStock(itemId, quantity) {
    const item = this.shopInventory.get(itemId);

    if (!item) {
      return {
        success: false,
        error: 'Item not found in shop'
      };
    }

    item.stock = quantity;

    return {
      success: true,
      item
    };
  }

  /**
   * 상점 재고 감소 (구매 시)
   */
  decreaseStock(itemId, quantity) {
    const item = this.shopInventory.get(itemId);

    if (!item) {
      return {
        success: false,
        error: 'Item not found in shop'
      };
    }

    if (item.stock < quantity) {
      return {
        success: false,
        error: 'Insufficient stock'
      };
    }

    item.stock -= quantity;

    return {
      success: true,
      item
    };
  }

  /**
   * 상점 재고 증가 (판매 시)
   */
  increaseStock(itemId, quantity) {
    const item = this.shopInventory.get(itemId);

    if (!item) {
      return {
        success: false,
        error: 'Item not found in shop'
      };
    }

    item.stock += quantity;

    return {
      success: true,
      item
    };
  }

  /**
   * 상점 아이템 조회
   */
  getShopItem(itemId) {
    return this.shopInventory.get(itemId);
  }

  /**
   * 상점 전체 목록 조회
   */
  getShopList() {
    return Array.from(this.shopInventory.values());
  }

  /**
   * 아이템 구매
   * @param {string} characterId - 캐릭터 ID
   * @param {string} itemId - 아이템 ID
   * @param {number} quantity - 구매 수량
   * @param {object} inventory - 캐릭터 인벤토리 (아이템/코인 충분한지 확인용)
   */
  buyItem(characterId, itemId, quantity, inventory) {
    const item = this.shopInventory.get(itemId);

    if (!item) {
      return {
        success: false,
        error: 'Item not found in shop'
      };
    }

    if (item.stock < quantity) {
      return {
        success: false,
        error: 'Insufficient stock'
      };
    }

    // 재고 무한이 아니면 stock 확인
    if (item.stock !== Infinity && item.stock < quantity) {
      return {
        success: false,
        error: 'Insufficient stock'
      };
    }

    const totalPrice = item.buyPrice * quantity;

    // 코인 확인
    const coinCount = inventory.find(i => i.id === 'coin')?.quantity || 0;

    if (coinCount < totalPrice) {
      return {
        success: false,
        error: 'Insufficient coins'
      };
    }

    // 재고 감소
    this.decreaseStock(itemId, quantity);

    // 거래 기록
    const transactionId = this.idGenerator.generateShopTransactionId();

    const transaction = {
      transactionId,
      characterId,
      type: 'buy',
      itemId,
      itemName: item.name,
      quantity,
      price: item.buyPrice,
      totalPrice,
      timestamp: Date.now()
    };

    this.transactions.set(transactionId, transaction);

    // 플레이어 거래 기록
    this.addPlayerTransaction(characterId, transaction);

    return {
      success: true,
      transaction,
      itemId,
     itemName: item.name,
      quantity,
      totalPrice
    };
  }

  /**
   * 아이템 판매
   * @param {string} characterId - 캐릭터 ID
   * @param {string} itemId - 아이템 ID
   * @param {number} quantity - 판매 수량
   * @param {object} inventory - 캐릭터 인벤토리 (아이템 유무 확인용)
   */
  sellItem(characterId, itemId, quantity, inventory) {
    const item = this.shopInventory.get(itemId);

    if (!item) {
      return {
        success: false,
        error: 'Item not found in shop'
      };
    }

    // 인벤토리에 아이템 있는지 확인
    const invItem = inventory.find(i => i.id === itemId);

    if (!invItem || invItem.quantity < quantity) {
      return {
        success: false,
        error: 'Insufficient items in inventory'
      };
    }

    const totalPrice = item.sellPrice * quantity;

    // 재고 증가
    this.increaseStock(itemId, quantity);

    // 거래 기록
    const transactionId = this.idGenerator.generateShopTransactionId();

    const transaction = {
      transactionId,
      characterId,
      type: 'sell',
      itemId,
      itemName: item.name,
      quantity,
      price: item.sellPrice,
      totalPrice,
      timestamp: Date.now()
    };

    this.transactions.set(transactionId, transaction);

    // 플레이어 거래 기록
    this.addPlayerTransaction(characterId, transaction);

    return {
      success: true,
      transaction,
      itemId,
      itemName: item.name,
      quantity,
      totalPrice
    };
  }

  /**
   * 플레이어 거래 기록 추가
   */
  addPlayerTransaction(characterId, transaction) {
    if (!this.playerTransactions.has(characterId)) {
      this.playerTransactions.set(characterId, []);
    }

    const transactions = this.playerTransactions.get(characterId);
    transactions.push(transaction);

    // 최대 100개 기록 유지
    if (transactions.length > 100) {
      transactions.shift();
    }
  }

  /**
   * 플레이어 거래 기록 조회
   */
  getPlayerTransactions(characterId, limit = 20) {
    const transactions = this.playerTransactions.get(characterId) || [];

    return transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * 시스템 통계
   */
  getSystemStats() {
    let totalBuy = 0;
    let totalSell = 0;

    for (const transaction of this.transactions.values()) {
      if (transaction.type === 'buy') {
        totalBuy += transaction.totalPrice;
      } else if (transaction.type === 'sell') {
        totalSell += transaction.totalPrice;
      }
    }

    return {
      shopItems: this.shopInventory.size,
      totalTransactions: this.transactions.size,
      totalBuyValue: totalBuy,
      totalSellValue: totalSell,
      profit: totalBuy - totalSell // 상점 이익
    };
  }
}

export default ShopSystem;