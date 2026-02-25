/**
 * GLM-4.7 API Rate Limiter (할당량 초과 방지)
 *
 * 기능:
 * - 토큰 사용량 모니터링
 * - 할당량 초과 시 retry-with-backoff
 * - fallback 응답 제공
 */

// Rate Limiter 클래스
class RateLimiter {
  constructor() {
    this.lastErrorTime = 0 // 마지막 에러 시간 (타임스탬프)
    this.retryAfter = 0 // 재시도까지 남은 시간 (밀리초)
    this.errorCount = 0 // 에러 카운터
    this.maxRetry = 3 // 최대 재시도 횟수
    this.backoffBaseMs = 60000 // 기본 백오프: 60초 (1분)
  }

  // 할당량 초과 에러 여부 확인
  isQuotaExceeded(errorData) {
    return (
      errorData.code === 'token_quota_exceeded' ||
      errorData.type === 'too_many_tokens_error' ||
      errorData.message?.includes('Tokens per minute limit exceeded') ||
      errorData.message?.includes('too many tokens')
    )
  }

  // 할당량 초과 에러 처리
  handleQuotaExceeded(errorData) {
    this.lastErrorTime = Date.now()
    this.errorCount++

    // 지수 백오프: 60초, 120초, 240초
    const backoffMs = this.backoffBaseMs * Math.pow(2, Math.min(this.errorCount - 1, 2))
    const backoffSeconds = Math.ceil(backoffMs / 1000)
    this.retryAfter = backoffMs

    console.log('⚠️ GLM-4.7 할당량 초과 에러:', {
      message: errorData.message,
      code: errorData.code,
      errorCount: this.errorCount,
      retryAfterMs: backoffMs,
      retryAfterSeconds: backoffSeconds
    })

    return {
      shouldWait: true,
      waitTimeMs: backoffMs,
      retryAfterSeconds: backoffSeconds,
      errorCount: this.errorCount
    }
  }

  // 재시도 가능 여부 확인
  canRetry() {
    if (this.errorCount >= this.maxRetry) {
      console.log('❌ GLM-4.7 최대 재시도 횟수 초과:', this.errorCount, '/', this.maxRetry)
      return false
    }

    if (Date.now() < this.lastErrorTime + this.retryAfter) {
      const waitTimeMs = (this.lastErrorTime + this.retryAfter) - Date.now()
      console.log('⏳ GLM-4.7 할당량 회복 대기 중:', {
        waitTimeMs,
        waitTimeSeconds: Math.ceil(waitTimeMs / 1000)
      })
      return false
    }

    // 에러 상태 초기화
    if (this.errorCount > 0) {
      console.log('✅ GLM-4.7 할당량 회복 완료')
      this.errorCount = 0
      this.lastErrorTime = 0
      this.retryAfter = 0
    }

    return true
  }

  // 대기 남은 시간 표시
  getWaitMessage() {
    const waitTimeMs = (this.lastErrorTime + this.retryAfter) - Date.now()
    const waitSeconds = Math.ceil(waitTimeMs / 1000)
    return `GLM-4.7 API 할당량 회복 대기 중... (${waitSeconds}초 남음)`
  }

  // 에러 상태 리셋
  reset() {
    this.errorCount = 0
    this.lastErrorTime = 0
    this.retryAfter = 0
    console.log('🔄 GLM-4.7 Rate Limiter 리셋')
  }
}

// 싱글톤 인스턴스
const rateLimiter = new RateLimiter()

export {
  RateLimiter,
  rateLimiter
}