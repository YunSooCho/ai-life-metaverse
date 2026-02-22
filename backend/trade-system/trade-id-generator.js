/**
 * TradeIdGenerator - 거래 및 요청 ID 생성기
 */
export class TradeIdGenerator {
  constructor() {
    this.tradeCounter = 0;
    this.requestCounter = 0;
  }

  /**
   * 거래 ID 생성
   */
  generateTradeId() {
    this.tradeCounter++;
    const timestamp = Date.now();
    return `TRD-${timestamp}-${this.tradeCounter}`;
  }

  /**
   * 거래 요청 ID 생성
   */
  generateRequestId() {
    this.requestCounter++;
    const timestamp = Date.now();
    return `TRQ-${timestamp}-${this.requestCounter}`;
  }

  /**
   * 상점 거래 ID 생성
   */
  generateShopTransactionId() {
    const timestamp = Date.now();
    return `SHP-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 경매 ID 생성
   */
  generateAuctionId() {
    const timestamp = Date.now();
    return `AUC-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 입찰 ID 생성
   */
  generateBidId() {
    const timestamp = Date.now();
    return `BID-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default TradeIdGenerator;