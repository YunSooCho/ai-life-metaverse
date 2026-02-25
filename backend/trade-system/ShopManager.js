/**
 * ShopManager - 상점 시스템 메니저
 * NPC 상점, 아이템 구매/판매 관리
 */

class ShopManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.shops = new Map(); // 메모리에 상점 데이터 저장
    this.defaultShops = {
      general: {
        shopId: 'general',
        name: '일반 상점',
        description: '기본 아이템 판매',
        items: [
          { itemId: 'potion_hp', name: 'HP 포션', buyPrice: 50, sellPrice: 25, stock: 100 },
          { itemId: 'potion_mp', name: 'MP 포션', buyPrice: 50, sellPrice: 25, stock: 100 },
          { itemId: 'food_apple', name: '사과', buyPrice: 10, sellPrice: 5, stock: 200 },
          { itemId: 'food_bread', name: '빵', buyPrice: 20, sellPrice: 10, stock: 150 }
        ]
      },
      weapon: {
        shopId: 'weapon',
        name: '무기 상점',
        description: '무기와 방어구 판매',
        items: [
          { itemId: 'weapon_sword', name: '검', buyPrice: 500, sellPrice: 250, stock: 20 },
          { itemId: 'weapon_bow', name: '활', buyPrice: 450, sellPrice: 225, stock: 20 },
          { itemId: 'armor_shield', name: '방패', buyPrice: 300, sellPrice: 150, stock: 30 }
        ]
      }
    };
  }

  /**
   * 상점 초기화
   */
  async initialize() {
    // 기본 상점 로드
    for (const [shopId, shopData] of Object.entries(this.defaultShops)) {
      this.shops.set(shopId, { ...shopData });

      // Redis가 있는 경우에만 재고 복원 시도
      if (this.redis) {
        try {
          const shopRedisData = await this.redis.get(`shop:${shopId}`);
          if (shopRedisData) {
            const redisShop = JSON.parse(shopRedisData);
            const items = this.shops.get(shopId).items;
            const redisItems = {};
            redisShop.items.forEach(item => {
              redisItems[item.itemId] = item.stock;
            });
            items.forEach(item => {
              if (redisItems[item.itemId] !== undefined) {
                item.stock = redisItems[item.itemId];
              }
            });
          }
        } catch (err) {
          console.warn('Shop Redis load failed:', err);
        }
      }
    }
  }

  /**
   * 상점 조회
   * @param {string} shopId - 상점 ID
   * @returns {Object|null} 상점 객체
   */
  getShop(shopId) {
    return this.shops.get(shopId) || null;
  }

  /**
   * 모든 상점 목록 조회
   * @returns {Array} 상점 목록
   */
  getAllShops() {
    return Array.from(this.shops.values()).map(shop => ({
      shopId: shop.shopId,
      name: shop.name,
      description: shop.description
    }));
  }

  /**
   * 상점 아이템 목록 조회
   * @param {string} shopId - 상점 ID
   * @returns {Array} 아이템 목록
   */
  getShopItems(shopId) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      throw new Error('상점을 찾을 수 없습니다');
    }

    return shop.items.filter(item => item.stock > 0);
  }

  /**
   * 아이템 구매
   * @param {string} userId - 사용자 ID
   * @param {string} shopId - 상점 ID
   * @param {string} itemId - 아이템 ID
   * @param {number} quantity - 수량
   * @param {Object} userManager - 사용자 코인 관리 객체
   * @returns {Object} 구매 결과
   */
  async buyItem(userId, shopId, itemId, quantity = 1, userManager) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      throw new Error('상점을 찾을 수 없습니다');
    }

    const item = shop.items.find(i => i.itemId === itemId);
    if (!item) {
      throw new Error('아이템을 찾을 수 없습니다');
    }

    if (item.stock < quantity) {
      throw new Error('재고가 부족합니다');
    }

    const totalPrice = item.buyPrice * quantity;

    // 코인 차감 확인 필요 (외에서 처리 또는 여기서 처리)
    const userCoins = await userManager.getUserCoins(userId);
    if (userCoins < totalPrice) {
      throw new Error('코인이 부족합니다');
    }

    // 아이템 추가
    await userManager.addToInventory(userId, itemId, quantity);

    // 코인 차감
    await userManager.removeCoins(userId, totalPrice);

    // 재고 감소
    item.stock -= quantity;

    // Redis에 재고 저장
    try {
      await this.redis.setex(
        `shop:${shopId}`,
        86400, // 24시간
        JSON.stringify({ ...shop })
      );
    } catch (err) {
      console.warn('Shop save failed:', err);
    }

    return {
      success: true,
      item: {
        itemId,
        name: item.name,
        quantity,
        pricePerUnit: item.buyPrice,
        totalPrice
      },
      remainingCoins: await userManager.getUserCoins(userId)
    };
  }

  /**
   * 아이템 판매
   * @param {string} userId - 사용자 ID
   * @param {string} shopId - 상점 ID
   * @param {string} itemId - 아이템 ID
   * @param {number} quantity - 수량
   * @param {Object} userManager - 사용자 인벤토리/코인 관리 객체
   * @returns {Object} 판매 결과
   */
  async sellItem(userId, shopId, itemId, quantity = 1, userManager) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      throw new Error('상점을 찾을 수 없습니다');
    }

    const item = shop.items.find(i => i.itemId === itemId);
    if (!item) {
      throw new Error('이 상점에서 판매할 수 없는 아이템입니다');
    }

    // 인벤토리 확인
    const inventory = await userManager.getInventory(userId);
    const userItem = inventory.find(i => i.itemId === itemId);

    if (!userItem || userItem.quantity < quantity) {
      throw new Error('인벤토리에 아이템이 부족합니다');
    }

    // 아이템 제거
    await userManager.removeFromInventory(userId, itemId, quantity);

    // 코인 추가
    const totalPrice = item.sellPrice * quantity;
    await userManager.addCoins(userId, totalPrice);

    // 재고 증가
    item.stock += quantity;

    // Redis에 재고 저장
    try {
      await this.redis.setex(
        `shop:${shopId}`,
        86400,
        JSON.stringify({ ...shop })
      );
    } catch (err) {
      console.warn('Shop save failed:', err);
    }

    return {
      success: true,
      item: {
        itemId,
        name: item.name,
        quantity,
        pricePerUnit: item.sellPrice,
        totalPrice
      },
      newCoins: await userManager.getUserCoins(userId)
    };
  }

  /**
   * 상점 관리자용 아이템 추가
   * @param {string} shopId - 상점 ID
   * @param {Object} itemData - 아이템 데이터
   */
  addShopItem(shopId, itemData) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      throw new Error('상점을 찾을 수 없습니다');
    }

    const item = {
      itemId: itemData.itemId,
      name: itemData.name,
      buyPrice: itemData.buyPrice || 0,
      sellPrice: itemData.sellPrice || 0,
      stock: itemData.stock || 0
    };

    const existingIndex = shop.items.findIndex(i => i.itemId === item.itemId);
    if (existingIndex >= 0) {
      shop.items[existingIndex] = item;
    } else {
      shop.items.push(item);
    }

    try {
      this.redis.setex(
        `shop:${shopId}`,
        86400,
        JSON.stringify({ ...shop })
      );
    } catch (err) {
      console.warn('Shop save failed:', err);
    }

    return item;
  }

  /**
   * 상점 관리자용 재고 설정
   * @param {string} shopId - 상점 ID
   * @param {string} itemId - 아이템 ID
   * @param {number} stock - 재고
   */
  setStock(shopId, itemId, stock) {
    const shop = this.shops.get(shopId);
    if (!shop) {
      throw new Error('상점을 찾을 수 없습니다');
    }

    const item = shop.items.find(i => i.itemId === itemId);
    if (!item) {
      throw new Error('아이템을 찾을 수 없습니다');
    }

    item.stock = stock;

    try {
      this.redis.setex(
        `shop:${shopId}`,
        86400,
        JSON.stringify({ ...shop })
      );
    } catch (err) {
      console.warn('Shop save failed:', err);
    }

    return item;
  }

  /**
   * 모든 상점 초기화 (테스트용)
   */
  clearAllShops() {
    this.shops.clear();
  }
}

export default ShopManager;