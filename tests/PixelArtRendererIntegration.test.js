/**
 * Test: PixelArtRenderer를 GameCanvas에 통합
 * Issue #73: [feat] 픽셀아트 캐릭터 GameCanvas 통합
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'fs'

// pixelArtRenderer 모듈 테스트
describe('pixelArtRenderer Integration', () => {
  describe('drawPixelCharacter function', () => {
    it('drawPixelCharacter 함수가 존재해야 함', () => {
      // 파일 경로 확인
      const fs = require('fs')
      const filePath = '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/utils/pixelArtRenderer.js'

      expect(fs.existsSync(filePath)).toBe(true)
    })

    it('export된 함수들 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/utils/pixelArtRenderer.js',
        'utf8'
      )

      expect(content).toContain('export function drawPixelCharacter')
      expect(content).toContain('export function createPixelCharacterDataURL')
      expect(content).toContain('export function validateCustomizationOptions')
    })

    it('지원하는 옵션들 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/utils/pixelArtRenderer.js',
        'utf8'
      )

      expect(content).toContain('hairStyle')
      expect(content).toContain('hairColor')
      expect(content).toContain('clothingColor')
      expect(content).toContain('accessory')
      expect(content).toContain('emotion')
    })

    it('헤어 스타일 패턴 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/utils/pixelArtRenderer.js',
        'utf8'
      )

      expect(content).toContain('HAIR_STYLES')
      expect(content).toContain('short')
      expect(content).toContain('medium')
      expect(content).toContain('long')
    })

    it('악세사리 패턴 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/utils/pixelArtRenderer.js',
        'utf8'
      )

      expect(content).toContain('ACCESSORIES')
      expect(content).toContain('glasses')
      expect(content).toContain('hat')
      expect(content).toContain('flowers')
    })

    it('감정 패턴 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/utils/pixelArtRenderer.js',
        'utf8'
      )

      expect(content).toContain('happy')
      expect(content).toContain('sad')
      expect(content).toContain('angry')
      expect(content).toContain('neutral')
    })
  })
})

describe('GameCanvas Integration', () => {
  describe('pixelArtRenderer import', () => {
    it('GameCanvas.jsx에서 pixelArtRenderer import 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      expect(content).toContain("import { drawPixelCharacter } from '../utils/pixelArtRenderer'")
    })
  })

  describe('drawPixelCharacter 사용 확인', () => {
    it('drawPixelCharacter 함수가 사용되고 있는지 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      expect(content).toContain('drawPixelCharacter(')
      expect(content).toContain('pixelArtOptions')
    })

    it('커스터마이징 옵션이 전달되는지 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      expect(content).toContain('hairStyle')
      expect(content).toContain('clothingColor')
      expect(content).toContain('accessory')
      expect(content).toContain('emotion')
    })

    it('색상 매핑이 존재하는지 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      expect(content).toContain('colorMap')
      expect(content).toContain("'blue': 'blue'")
      expect(content).toContain("'red': 'red'")
    })

    it('AI 캐릭터에도 옵션이 적용되는지 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      expect(content).toContain('isAi')
      expect(content).toContain('pixelArtOptions.clothingColor')
      expect(content).toContain('pixelArtOptions.hairColor')
    })
  })
})

describe('커스터마이징 옵션', () => {
  describe('헤어 스타일', () => {
    it('myCharacter customization에서 hairStyle이 사용되는지 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      expect(content).toContain('customization?.hairStyle')
      expect(content).toContain("hairStyle: customization?.hairStyle || 'short'")
    })

    it('기본 헤어 스타일이 short인지 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      expect(content).toContain("'short'")
    })
  })

  describe('옷 색상', () => {
    it('clothingColor 매핑이 존재하는지 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      const colorMapMatch = content.match(/const colorMap = \{[^}]+\}/s)
      expect(colorMapMatch).toBeTruthy()
    })
  })

  describe('악세사리', () => {
    it('accessory 옵션이 전달되는지 확인', () => {
      const content = require('fs').readFileSync(
        '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
        'utf8'
      )

      expect(content).toContain("accessory: customization?.accessory || 'none'")
    })
  })
})

describe('AI 캐릭터 지원', () => {
  it('AI 캐릭터에 기본 스타일이 적용되는지 확인', () => {
    const content = require('fs').readFileSync(
      '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
      'utf8'
    )

    expect(content).toContain('!isMyCharacter && isAi')
    expect(content).toContain("pixelArtOptions.clothingColor = 'red'")
    expect(content).toContain("pixelArtOptions.hairColor = 'brown'")
  })
})

describe('이전 코드 제거 확인', () => {
  it('프로그래매틱 렌더링 코드가 제거되었는지 확인', () => {
    const content = require('fs').readFileSync(
      '/Users/clks001/.openclaw/workspace/ai-life-metaverse/frontend/src/components/GameCanvas.jsx',
      'utf8'
    )

    // 이전 코드에서 삭제되어야 할 패턴들
    expect(content).not.toContain('// 몸통 (옷 색상)')
    expect(content).not.toContain('// 머리 (피부색)')
    expect(content).not.toContain('// 머리카락')
    expect(content).not.toContain('// 눈')
    expect(content).not.toContain('// 다리')

    // drawPixelCharacter가 사용되는지 확인
    expect(content).toContain('drawPixelCharacter(')
  })
})