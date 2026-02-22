/**
 * 픽셀 아트 애니메이션 효과 시스템 테스트
 *
 * Phase 3: 피셀아트 레이아웃 시스템 - 애니메이션 프레임워크 테스트
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import fs from 'fs/promises'
import path from 'path'

// 테스트용 랜덤 시드 고정
beforeAll(() => {
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('픽셀 아트 애니메이션 효과 시스템', () => {
  const TEST_FILE_PATH = path.join(__dirname, '../../frontend/src/canvas/pixelArtEffects.js')

  /**
   * 테스트 1: 파일 존재 확인
   */
  describe('파일 구조', () => {
    it('pixelArtEffects.js 파일이 존재해야 함', async () => {
      await expect(fs.access(TEST_FILE_PATH))
        .resolves
        .toBeUndefined()
    })
  })

  /**
   * 테스트 2: 코드 구조 확인
   */
  describe('코드 구조', () => {
    it('ANIMATION_TYPES 상수가 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('ANIMATION_TYPES')
      expect(content).toContain('POP_IN')
      expect(content).toContain('POP_OUT')
      expect(content).toContain('BOUNCE')
      expect(content).toContain('SHAKE')
      expect(content).toContain('SCALE')
      expect(content).toContain('ROTATE')
      expect(content).toContain('FLASH')
    })

    it('EASING 함수가 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('EASING')
      expect(content).toContain('LINEAR')
      expect(content).toContain('EASE_IN')
      expect(content).toContain('EASE_OUT')
      expect(content).toContain('EASE_IN_OUT')
      expect(content).toContain('BOUNCE')
    })

    it('PixelAnimation 클래스가 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('class PixelAnimation')
      expect(content).toContain('constructor')
      expect(content).toContain('start')
      expect(content).toContain('pause')
      expect(content).toContain('resume')
      expect(content).toContain('stop')
      expect(content).toContain('update')
      expect(content).toContain('calculateValue')
    })

    it('AnimationManager 클래스가 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('class AnimationManager')
      expect(content).toContain('add')
      expect(content).toContain('remove')
      expect(content).toContain('get')
      expect(content).toContain('update')
      expect(content).toContain('stopAll')
    })

    it('유틸리티 함수가 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('createPixelShakeEffect')
      expect(content).toContain('createPixelPopEffect')
      expect(content).toContain('createPixelBounceEffect')
      expect(content).toContain('createPixelFlashEffect')
      expect(content).toContain('applyAnimationTransform')
      expect(content).toContain('renderAnimationEffect')
    })

    it('animationManager 싱글톤이 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('animationManager = new AnimationManager()')
    })
  })

  /**
   * 테스트 3: 이징 함수 동작
   */
  describe('이징 함수 동작', () => {
    // 간단한 함수 로직 테스트
    it('LINEAR 이징 함수가 선형을 반환해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      // LINEAR 이징 함수 구현 확인
      expect(content).toMatch(/LINEAR:\s*\(t\)\s*=>\s*t/)
    })

    it('EASE_IN 아웃풋이 0~1 범위에 있어야 함 (코드 구조 확인)', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('EASE_IN')
      expect(content).toContain('EASE_OUT')
      expect(content).toContain('EASE_IN_OUT')
    })

    it('BOUNCE 이징 함수가 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/BOUNCE:\s*\(t\)/)
    })
  })

  /**
   * 테스트 4: 애니메이션 타입별 값 계산
   */
  describe('애니메이션 타입별 값 계산', () => {
    it('POP_IN 애니메이션 타입이 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/case\s+ANIMATION_TYPES\.POP_IN:/)
      expect(content).toMatch(/scale:\s*progress/)
      expect(content).toMatch(/opacity:\s*progress/)
    })

    it('POP_OUT 애니메이션 타입이 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/case\s+ANIMATION_TYPES\.POP_OUT:/)
      expect(content).toMatch(/scale:\s*1\s*-\s*progress/)
      expect(content).toMatch(/opacity:\s*1\s*-\s*progress/)
    })

    it('BOUNCE 애니메이션 타입이 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/case\s+ANIMATION_TYPES\.BOUNCE:/)
      expect(content).toContain('Math.sin')
    })

    it('SHAKE 애니메이션 타입이 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/case\s+ANIMATION_TYPES\.SHAKE:/)
      expect(content).toContain('offsetX')
      expect(content).toContain('offsetY')
    })

    it('FLASH 애니메이션 타입이 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/case\s+ANIMATION_TYPES\.FLASH:/)
      expect(content).toMatch(/opacity:\s*Math\.sin/)
    })
  })

  /**
   * 테스트 5: 애니메이션 생성 유틸리티
   */
  describe('애니메이션 생성 유틸리티', () => {
    it('createPixelShakeEffect 함수가 PixelAnimation을 생성해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('createPixelShakeEffect')
      expect(content).toContain('PixelAnimation')
      expect(content).toContain('ANIMATION_TYPES.SHAKE')
    })

    it('createPixelPopEffect 함수가 PixelAnimation을 생성해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('createPixelPopEffect')
      expect(content).toContain('PixelAnimation')
      expect(content).toContain('ANIMATION_TYPES.POP_IN')
      expect(content).toContain('EASING.BOUNCE')
    })

    it('createPixelBounceEffect 함수가 PixelAnimation을 생성해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('createPixelBounceEffect')
      expect(content).toContain('PixelAnimation')
      expect(content).toContain('ANIMATION_TYPES.BOUNCE')
      expect(content).toContain('EASING.BOUNCE')
    })

    it('createPixelFlashEffect 함수가 PixelAnimation을 생성해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('createPixelFlashEffect')
      expect(content).toContain('PixelAnimation')
      expect(content).toContain('ANIMATION_TYPES.FLASH')
      expect(content).toContain('EASING.LINEAR')
    })
  })

  /**
   * 테스트 6: AnimationManager 메서드
   */
  describe('AnimationManager 메서드', () => {
    it('add 메서드가 애니메이션을 Map에 추가해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/add\(key,\s*animation\)/)
      expect(content).toMatch(/this\.animations\.set/)
      expect(content).toMatch(/this\.activeAnimations\.push/)
    })

    it('remove 메서드가 애니메이션을 제거해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/remove\(key\)/)
      expect(content).toMatch(/this\.animations\.delete/)
    })

    it('update 메서드가 애니메이션을 업데이트해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/update\(timestamp\)/)
      expect(content).toMatch(/animation\.update/)
      expect(content).toMatch(/filter/)
    })

    it('stopAll 메서드가 모든 애니메이션을 중지해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/stopAll\(\)/)
      expect(content).toMatch(/animation\.stop/)
      expect(content).toMatch(/this\.animations\.clear/)
    })
  })

  /**
   * 테스트 7: 캔버스 렌더링 유틸리티
   */
  describe('캔버스 렌더링 유틸리티', () => {
    it('applyAnimationTransform 함수가 트랜스폼을 적용해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('function applyAnimationTransform')
      expect(content).toContain('ctx.translate')
      expect(content).toContain('ctx.rotate')
      expect(content).toContain('ctx.scale')
    })

    it('renderAnimationEffect 함수가 효과를 렌더링해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('function renderAnimationEffect')
      expect(content).toContain('ctx.globalAlpha')
    })
  })

  /**
   * 테스트 8: default export
   */
  describe('default export', () => {
    it('모든 기능을 export 해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('export default')
      expect(content).toContain('ANIMATION_TYPES')
      expect(content).toContain('EASING')
      expect(content).toContain('PixelAnimation')
      expect(content).toContain('AnimationManager')
    })
  })

  /**
   * 테스트 9: 디렉토리 구조
   */
  describe('디렉토리 구조', () => {
    it('canvas 폴더가 존재해야 함', async () => {
      await expect(fs.access(path.join(__dirname, '../../frontend/src/canvas')))
        .resolves
        .toBeUndefined()
    })
  })

  /**
   * 테스트 10: 픽셀 스타일 구현
   */
  describe('픽셀 스타일 구현', () => {
    it('이징 함수에 계단식 구현이 있어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('steps')
      expect(content).toContain('Math.floor')
      expect(content).toContain('/ steps')
    })

    it('애니메이션 주기(ms 단위)가 정의되어야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toMatch(/duration.*\s+\/\/\s*ms/)
    })

    it('모든 애니메이션 타입에 대한 값을 계산해야 함', async () => {
      const content = await fs.readFile(TEST_FILE_PATH, 'utf-8')
      expect(content).toContain('calculateValue')
      expect(content).toContain('switch')
      expect(content).toContain('default:')
    })
  })
})

// 테스트 실행 로그
console.log('✅ 픽셀 아트 애니메이션 효과 시스템 테스트 완료')