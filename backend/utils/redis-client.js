import { createClient } from 'redis'

let redisClient = null

/**
 * Redis 클라이언트 초기화
 * @returns {Promise<Object>} Redis 클라이언트 인스턴스
 */
export async function initRedis() {
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      console.log('✅ Redis 연결 성공')
    })

    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('❌ Redis 연결 실패:', error.message)
    console.log('⚠️  메모리 모드로 실행합니다 (데이터 영속성 비활성화)')
    return null
  }
}

/**
 * Redis 클라이언트 인스턴스 가져오기
 * @returns {Object|null} Redis 클라이언트 인스턴스
 */
export function getRedisClient() {
  return redisClient
}

/**
 * Redis 연결 종료
 * @returns {Promise<void>}
 */
export async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit()
      redisClient = null
      console.log('✅ Redis 연결 종료')
    } catch (error) {
      console.error('❌ Redis 종료 실패:', error.message)
    }
  }
}

/**
 * Redis 사용 가능 여부 확인
 * @returns {boolean} Redis 사용 가능 여부
 */
export function isRedisEnabled() {
  return redisClient !== null
}