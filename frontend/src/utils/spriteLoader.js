// 스프라이트 시트 로더 유틸리티
class SpriteLoader {
  constructor() {
    this.cache = new Map(); // 스프라이트 캐시
    this.loading = new Map(); // 로딩 중인 스프라이트 추적
  }

  /**
   * 스프라이트 시트 로드
   * @param {string} path - 에셋 경로 (assets/sprites/... 부분 제외)
   * @param {string} name - 스프라이트 이름
   * @returns {Promise<HTMLImageElement>}
   */
  async loadSpriteSheet(path, name) {
    // 이미 캐싱되어 있으면 바로 반환
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }

    // 이미 로딩 중이면 해당 Promise 반환
    if (this.loading.has(name)) {
      return this.loading.get(name);
    }

    // 새로운 이미지 로드
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(name, img);
        this.loading.delete(name);
        resolve(img);
      };
      img.onerror = () => {
        this.loading.delete(name);
        reject(new Error(`Failed to load sprite: ${path}`));
      };
      // assets/sprites/ 폴더 기준 경로
      img.src = `/assets/sprites/${path}`;
    });

    this.loading.set(name, loadPromise);
    return loadPromise;
  }

  /**
   * 캐싱된 스프라이트 이미지 반환
   * @param {string} name - 스프라이트 이름
   * @returns {HTMLImageElement|null}
   */
  getSprite(name) {
    return this.cache.get(name) || null;
  }

  /**
   * 스프라이트가 로드되었는지 확인
   * @param {string} name - 스프라이트 이름
   * @returns {boolean}
   */
  isLoaded(name) {
    return this.cache.has(name);
  }

  /**
   * 캐싱된 이미지 정리
   */
  cleanup() {
    this.cache.clear();
    this.loading.clear();
  }

  /**
   * 여러 스프라이트 미리 로드
   * @param {Array<{path: string, name: string}>} spriteList - 에셋 목록
   * @returns {Promise<void>}
   */
  async preloadAssets(spriteList) {
    const promises = spriteList.map(({ path, name }) =>
      this.loadSpriteSheet(path, name)
    );
    await Promise.all(promises);
  }

  /**
   * 캐시 상태 확인
   * @returns {number} - 캐싱된 스프라이트 수
   */
  getCacheSize() {
    return this.cache.size;
  }
}

// 싱글톤 인스턴스
const spriteLoader = new SpriteLoader();

export default spriteLoader;