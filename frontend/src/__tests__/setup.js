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