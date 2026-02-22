/**
 * Rate Limiter 테스트 코드
 *
 * 기능:
 * - 할당량 초과 에러 감지 테스트
 * - retry-with-backoff 로직 테스트
 * - Fallback 응답 테스트
 */

import { rateLimiter } from './agent-rate-limiter.js'
import assert from 'node:assert'

// 테스트 1: 할당량 초과 에러 감지
console.log('🧪 테스트 1: 할당량 초과 에러 감지')

const quotaError1 = {
  message: 'Tokens per minute limit exceeded - too many tokens processed.',
  type: 'too_many_tokens_error',
  param: 'quota',
  code: 'token_quota_exceeded'
}

assert.ok(rateLimiter.isQuotaExceeded(quotaError1), '할당량 초과 에러 감지 실패')
console.log('✅ 테스트 1 통과: 할당량 초과 에러 감지')

// 테스트 2: 할당량 초과가 아닌 에러
console.log('\n🧪 테스트 2: 할당량 초과가 아닌 에러')

const nonQuotaError = {
  message: 'Invalid API key',
  code: 'invalid_api_key'
}

assert.strictEqual(rateLimiter.isQuotaExceeded(nonQuotaError), false, '할당량 초과 아닌 에러가 할당량 초과로 판단됨')
console.log('✅ 테스트 2 통과: 할당량 초과가 아닌 에러 판별')

// 테스트 3: 할당량 초과 에러 처리
console.log('\n🧪 테스트 3: 할당량 초과 에러 처리')

rateLimiter.reset() // 상태 초기화

const handleResult1 = rateLimiter.handleQuotaExceeded(quotaError1)
assert.ok(handleResult1.shouldWait, 'shouldWait가 true여야 함')
assert.ok(handleResult1.waitTimeMs > 0, 'waitTimeMs가 0보다 커야 함')
assert.strictEqual(handleResult1.errorCount, 1, 'errorCount가 1이어야 함')

console.log('✅ 테스트 3 통과:', {
  waitTimeMs: handleResult1.waitTimeMs,
  waitTimeSeconds: handleResult1.retryAfterSeconds,
  errorCount: handleResult1.errorCount
})

// 테스트 4: 최대 재시도 횟수 초과
console.log('\n🧪 테스트 4: 최대 재시도 횟수 초과')

rateLimiter.reset() // 상태 초기화

// 최대 재시도 횟수만큼 에러 발생
for (let i = 0; i < 3; i++) {
  rateLimiter.handleQuotaExceeded(quotaError1)
}

assert.ok(!rateLimiter.canRetry(), '최대 재시도 횟수 초과 시 canRetry()가 false여야 함')
console.log('✅ 테스트 4 통과: 최대 재시도 횟수 초과')

// 테스트 5: 할당량 회복 대기 메시지
console.log('\n🧪 테스트 5: 할당량 회복 대기 메시지')

rateLimiter.reset() // 상태 초기화
rateLimiter.handleQuotaExceeded(quotaError1)

const waitMessage = rateLimiter.getWaitMessage()
assert.ok(waitMessage.includes('GLM-4.7 API 할당량 회복 대기 중'), '대기 메시지가 올바르지 않음')
assert.ok(waitMessage.includes('초 남음'), '대기 메시지에 시간 정보가 있어야 함')

console.log('✅ 테스트 5 통과:', waitMessage)

// 테스트 6: 에러 상태 리셋
console.log('\n🧪 테스트 6: 에러 상태 리셋')

rateLimiter.reset()
assert.strictEqual(rateLimiter.errorCount, 0, '에러 카운트가 0이어야 함')
assert.strictEqual(rateLimiter.lastErrorTime, 0, '마지막 에러 시간이 0이어야 함')
assert.strictEqual(rateLimiter.retryAfter, 0, '재시도 대기 시간이 0이어야 함')

console.log('✅ 테스트 6 통과: 에러 상태 리셋')

// 테스트 7: canRetry() - 할당량 회복 대기 중
console.log('\n🧪 테스트 7: canRetry() - 할당량 회복 대기 중')

rateLimiter.reset()
rateLimiter.handleQuotaExceeded(quotaError1)

// 즉시 확인 (아직 대기 중)
assert.ok(!rateLimiter.canRetry(), '할당량 회복 대기 중에는 canRetry()가 false여야 함')

console.log('✅ 테스트 7 통과: 할당량 회복 대기 중')

// 테스트 8: 지수 백오프 계산
console.log('\n🧪 테스트 8: 지수 백오프 계산')

rateLimiter.reset()

const results = []
for (let i = 0; i < 3; i++) {
  const result = rateLimiter.handleQuotaExceeded(quotaError1)
  results.push(result.retryAfterSeconds)
}

// 백오프: 60초, 120초, 240초
assert.strictEqual(results[0], 60, '1회차 백오프: 60초')
assert.strictEqual(results[1], 120, '2회차 백오프: 120초')
assert.strictEqual(results[2], 240, '3회차 백오프: 240초 (최대)')

console.log('✅ 테스트 8 통과: 지수 백오프', results)

// 테스트 9: 최대 백오프 제한
console.log('\n🧪 테스트 9: 최대 백오프 제한')

rateLimiter.reset()

// 최대 백오프 초과 테스트
for (let i = 0; i < 5; i++) {
  rateLimiter.handleQuotaExceeded(quotaError1)
}

// 4회차 이후는 최대 백오프 (240초)로 유지
assert.strictEqual(rateLimiter.retryAfter, 240000, '최대 백오프 240초로 제한')

console.log('✅ 테스트 9 통과: 최대 백오프 제한')

// 전체 테스트 완료
console.log('\n🎉 모든 테스트 통과!')
console.log('✅ Rate Limiter 정상 작동')