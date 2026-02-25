/**
 * Phase 3: UI 컴포넌트 레트로 스타일링 테스트
 * Issue #46 테스트 코드
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('pixel-theme.css 존재 및 구조 검증', () => {
  const cssPath = path.join(__dirname, '../frontend/src/styles/pixel-theme.css')

  it('pixel-theme.css 파일이 존재해야 함', () => {
    expect(fs.existsSync(cssPath)).toBe(true)
  })

  it('pixel-theme.css에 @import Press Start 2P 폰트 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('Press Start 2P')
    expect(cssContent).toContain('fonts.googleapis.com')
  })

  it('pixel-theme.css에 32색 색상 팔레트 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('--pixel-bg-primary')
    expect(cssContent).toContain('--pixel-accent-green')
    expect(cssContent).toContain('--pixel-accent-orange')
    expect(cssContent).toContain('--pixel-accent-red')
    expect(cssContent).toContain('--pixel-accent-blue')
    expect(cssContent).toContain('--pixel-accent-purple')
  })

  it('pixel-theme.css에 pixel-button 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-button')
  })

  it('pixel-theme.css에 pixel-input 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-input')
  })

  it('pixel-theme.css에 pixel-panel 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-panel')
  })

  it('pixel-theme.css에 pixel-menu 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-menu')
  })

  it('pixel-theme.css에 pixel-grid 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-grid')
  })

  it('pixel-theme.css에 pixel-scroll 스타일이 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-scroll')
  })

  it('pixel-theme.css에 webkit-scrollbar 스타일이 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('::-webkit-scrollbar')
  })
})

describe('React 컴포넌트 파일 존성 검증', () => {
  it('ChatBubble.jsx 파일이 존재해야 함', () => {
    const filePath = path.join(__dirname, '../frontend/src/components/ChatBubble.jsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('ChatInput.jsx 파일이 존재해야 함', () => {
    const filePath = path.join(__dirname, '../frontend/src/components/ChatInput.jsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('InteractionMenu.jsx 파일이 존재해야 함', () => {
    const filePath = path.join(__dirname, '../frontend/src/components/InteractionMenu.jsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('Inventory.jsx 파일이 존재해야 함', () => {
    const filePath = path.join(__dirname, '../frontend/src/components/Inventory.jsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('Quest.jsx 파일이 존재해야 함', () => {
    const filePath = path.join(__dirname, '../frontend/src/components/Quest.jsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })

  it('App.jsx 파일이 존재해야 함', () => {
    const filePath = path.join(__dirname, '../frontend/src/App.jsx')
    expect(fs.existsSync(filePath)).toBe(true)
  })
})

describe('ChatBubble.jsx 픽셀 스타일 내용 검증', () => {
  const filePath = path.join(__dirname, '../frontend/src/components/ChatBubble.jsx')

  it('ChatBubble.jsx에 Press Start 2P 폰트 참고 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('Press Start 2P')
  })

  it('ChatBubble.jsx에 pixel 스타일 주석 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toMatch(/pixel/i)
  })

  it('ChatBubble.jsx에 픽셀 스타일 rect 렌더링 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('<rect')
  })

  it('ChatBubble.jsx에 픽셀 스타일 path 렌더링 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('<path')
  })
})

describe('ChatInput.jsx 픽셀 스타일 내용 검증', () => {
  const filePath = path.join(__dirname, '../frontend/src/components/ChatInput.jsx')

  it('ChatInput.jsx에 pixel-panel 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-panel')
  })

  it('ChatInput.jsx에 pixel-input 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-input')
  })

  it('ChatInput.jsx에 pixel-button-green 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-button-green')
  })
})

describe('InteractionMenu.jsx 픽셀 스타일 내용 검증', () => {
  const filePath = path.join(__dirname, '../frontend/src/components/InteractionMenu.jsx')

  it('InteractionMenu.jsx에 pixel-menu 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-menu')
  })

  it('InteractionMenu.jsx에 pixel-pop 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-pop')
  })

  it('InteractionMenu.jsx에 pixel-menu-item 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-menu-item')
  })
})

describe('Inventory.jsx 픽셀 스타일 내용 검증', () => {
  const filePath = path.join(__dirname, '../frontend/src/components/Inventory.jsx')

  it('Inventory.jsx에 pixel-overlay 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-overlay')
  })

  it('Inventory.jsx에 pixel-panel 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-panel')
  })

  it('Inventory.jsx에 pixel-pop 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-pop')
  })

  it('Inventory.jsx에 pixel-grid 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-grid')
  })

  it('Inventory.jsx에 pixel-grid-item 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-grid-item')
  })

  it('Inventory.jsx에 pixel-icon-lg 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-icon-lg')
  })

  it('Inventory.jsx에 pixel-badge-orange 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-badge-orange')
  })
})

describe('Quest.css 픽셀 스타일 검증', () => {
  const cssPath = path.join(__dirname, '../frontend/src/components/Quest.css')

  it('Quest.css 파일이 존재해야 함', () => {
    expect(fs.existsSync(cssPath)).toBe(true)
  })

  it('Quest.css에 Press Start 2P 폰트 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('Press Start 2P')
  })

  it('Quest.css에 pixel-badge 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-badge')
  })

  it('Quest.css에 pixel-button 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-button')
  })

  it('Quest.css에 pixel-grid 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-grid')
  })

  it('Quest.css에 pixel-pop 애니메이션이 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('@keyframes pixel-pop')
  })
})

describe('App.jsx CSS import 검증', () => {
  const filePath = path.join(__dirname, '../frontend/src/App.jsx')

  it('App.jsx에 pixel-theme.css import 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain("import './styles/pixel-theme.css'")
  })
})

describe('픽셀 애니메이션 검증', () => {
  const cssPath = path.join(__dirname, '../frontend/src/styles/pixel-theme.css')

  it('pixel-theme.css에 pixel-pop 애니메이션이 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('@keyframes pixel-pop')
  })

  it('pixel-theme.css에 pixel-bounce 애니메이션이 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('@keyframes pixel-bounce')
  })

  it('pixel-theme.css에 pixel-shake 애니메이션이 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('@keyframes pixel-shake')
  })
})

describe('픽셀 폰트 클래스 검증', () => {
  const cssPath = path.join(__dirname, '../frontend/src/styles/pixel-theme.css')

  it('pixel-theme.css에 pixel-font 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-font')
  })

  it('pixel-theme.css에 pixel-text-sm 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-text-sm')
  })

  it('pixel-theme.css에 pixel-text-md 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-text-md')
  })

  it('pixel-theme.css에 pixel-text-lg 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-text-lg')
  })
})

describe('픽셀 보더 클래스 검증', () => {
  const cssPath = path.join(__dirname, '../frontend/src/styles/pixel-theme.css')

  it('pixel-theme.css에 pixel-border-sm 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-border-sm')
  })

  it('pixel-theme.css에 pixel-border-md 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-border-md')
  })

  it('pixel-theme.css에 pixel-border-lg 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-border-lg')
  })
})

describe('컬러 버튼 클래스 검증', () => {
  const cssPath = path.join(__dirname, '../frontend/src/styles/pixel-theme.css')

  it('pixel-theme.css에 pixel-button-green 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-button-green')
  })

  it('pixel-theme.css에 pixel-button-orange 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-button-orange')
  })

  it('pixel-theme.css에 pixel-button-red 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-button-red')
  })

  it('pixel-theme.css에 pixel-button-blue 클래스가 있어야 함', () => {
    const cssContent = fs.readFileSync(cssPath, 'utf-8')
    expect(cssContent).toContain('.pixel-button-blue')
  })
})

describe('Quest.jsx 픽셀 스타일 내용 검증', () => {
  const filePath = path.join(__dirname, '../frontend/src/components/Quest.jsx')

  it('Quest.jsx에 Quest.css import 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain("import './Quest.css'")
  })

  it('Quest.jsx에 pixel-overlay 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-overlay')
  })

  it('Quest.jsx에 pixel-panel 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-panel')
  })

  it('Quest.jsx에 pixel-pop 클래스 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-pop')
  })

  it('Quest.jsx에 pixel-badge 클래스가 있어야 함', () => {
    const content = fs.readFileSync(filePath, 'utf-8')
    expect(content).toContain('pixel-badge')
  })
})