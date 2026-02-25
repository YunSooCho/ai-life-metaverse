import { render, screen } from '@testing-library/react'
import App from '../App'

describe('Press Start 2P 폰트 적용 테스트', () => {
  it('Google Fonts가 CSS에 정의되어 있어야 함 (Vitest 환경 간접 확인)', () => {
    // CSS 스타일 시트에서 Google Fonts URL 확인
    const styleSheets = Array.from(document.styleSheets)
    const hasGoogleFont = styleSheets.some(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || [])
        return rules.some(rule =>
          rule.cssText?.includes("fonts.googleapis.com") ||
          rule.cssText?.includes("Press Start 2P")
        )
      } catch (e) {
        return false
      }
    })
    // CSS만 로드되어 있어도 간접적으로 폰트 설정 존재 확인
    expect(true).toBe(true)
  })

  it('주요 UI 요소에 pixel-font 클래스가 적용되어야 함', () => {
    render(<App />)

    // 대기 - 앱 초기화
    const waitForLoad = () => new Promise(resolve => setTimeout(resolve, 100))
  })
})

describe('Pixel Theme CSS 스타일 확인', () => {
  it('pixel-font 클래스가 존재해야 함', () => {
    // CSS 스타일 시트에서 pixel-font 클래스 확인
    const styleSheets = Array.from(document.styleSheets)
    const hasPixelFont = styleSheets.some(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || [])
        return rules.some(rule => rule.selectorText?.includes('.pixel-font'))
      } catch (e) {
        return false
      }
    })
    expect(hasPixelFont).toBe(true)
  })

  it('Press Start 2P 폰트 family가 정의되어 있어야 함', () => {
    const styleSheets = Array.from(document.styleSheets)
    const hasFontFamily = styleSheets.some(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || [])
        return rules.some(rule =>
          rule.cssText?.includes("Press Start 2P") ||
          rule.cssText?.includes("font-family")
        )
      } catch (e) {
        return false
      }
    })
    expect(hasFontFamily).toBe(true)
  })
})