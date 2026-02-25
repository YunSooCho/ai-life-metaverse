// Canvas API Mock for jsdom environment
import { vi } from 'vitest'
import '@testing-library/jest-dom'

global.HTMLCanvasElement.prototype.getContext = function() {
  return {
    fillStyle: null,
    strokeStyle: null,
    lineWidth: null,
    font: null,
    textAlign: null,
    textBaseline: null,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createPattern: vi.fn()
  }
}

// Image API Mock
global.Image = class {
  constructor() {
    this.onload = null
    this.onerror = null
    this.complete = false
    this.width = 0
    this.height = 0
  }

  set src(value) {
    setTimeout(() => {
      this.complete = true
      this.width = 32
      this.height = 32
      if (this.onload) this.onload()
    }, 0)
  }
}

// localStorage Mock
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

global.localStorage = localStorageMock

// Node.js에서 JSON import를 위해 Vite의 JSON 플러그인 대응
// 테스트 환경에서는 require로 JSON을 로드하도록 처리
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// JSON 파일 로드 헬퍼
const loadJSON = (filename) => {
  try {
    const jsonPath = join(__dirname, '../i18n', filename)
    const content = readFileSync(jsonPath, 'utf-8')
    return JSON.parse(content)
  } catch (e) {
    console.error(`Failed to load ${filename}:`, e)
    return {}
  }
}

// 전역으로 번역 데이터 제공
global.testTranslations = {
  ko: loadJSON('ko.json'),
  ja: loadJSON('ja.json'),
  en: loadJSON('en.json')
}