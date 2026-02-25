/**
 * Screenshot Utility Tests
 *
 * Tests for screenshot.js - canvas screenshot capture functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock window and document for testing
const mockWindow = {
  __gameCanvasReady: false,
  __canvasWidth: 0,
  __canvasHeight: 0
}

const mockCanvas = {
  width: 978,
  height: 685,
  getContext: vi.fn(() => ({
    getImageData: vi.fn(() => ({
      data: [74, 26, 46, 255]  // Non-transparent pixel
    }))
  })),
  toDataURL: vi.fn(() => 'data:image/png;base64,fake'),
  toBlob: vi.fn((callback) => {
    callback(new Blob(['fake'], { type: 'image/png' }))
  })
}

let currentCanvas = mockCanvas

const mockDocument = {
  querySelector: vi.fn(() => currentCanvas)
}

describe('screenshot.js - Canvas Screenshot Utility', () => {
  beforeEach(() => {
    // Reset canvas mock
    currentCanvas = mockCanvas

    // Setup window and document mocks
    global.window = { ...mockWindow }
    global.document = mockDocument

    // Reset states
    window.__gameCanvasReady = false
    window.__canvasWidth = 0
    window.__canvasHeight = 0
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // TC01: isCanvasReady - gameCanvasReady true
  it('TC01: isCanvasReady returns true when __gameCanvasReady is true', async () => {
    window.__gameCanvasReady = true

    const screenshotModule = await import('./screenshot.js')
    const result = await screenshotModule.isCanvasReady()

    expect(result).toBe(true)
  })

  // TC02: isCanvasReady - gameCanvasReady false, canvas has content
  it('TC02: isCanvasReady returns true when canvas has content', async () => {
    window.__gameCanvasReady = false
    window.__canvasHeight = 685
    window.__canvasWidth = 978

    const screenshotModule = await import('./screenshot.js')
    const result = await screenshotModule.isCanvasReady()

    expect(result).toBe(true)
  })

  // TC03: isCanvasReady - both false, returns false
  it('TC03: isCanvasReady returns false when canvas is not ready', async () => {
    window.__gameCanvasReady = false
    window.__canvasHeight = 100
    window.__canvasWidth = 200

    const screenshotModule = await import('./screenshot.js')
    const result = await screenshotModule.isCanvasReady()

    expect(result).toBe(false)
  })

  // TC04: captureCanvasScreenshot - basic capture
  it('TC04: captureCanvasScreenshot returns data URL', async () => {
    window.__gameCanvasReady = true

    const screenshotModule = await import('./screenshot.js')
    const result = await screenshotModule.captureCanvasScreenshot()

    expect(result).toBe('data:image/png;base64,fake')
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/png', 1.0)
  })

  // TC05: captureCanvasScreenshot - with custom format and quality
  it('TC05: captureCanvasScreenshot accepts custom format and quality', async () => {
    window.__gameCanvasReady = true

    const screenshotModule = await import('./screenshot.js')
    await screenshotModule.captureCanvasScreenshot(mockCanvas, 'image/jpeg', 0.8)

    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8)
  })

  // TC06: captureCanvasScreenshot - throws error when not ready
  it('TC06: captureCanvasScreenshot throws error when canvas is not ready', async () => {
    window.__gameCanvasReady = false
    window.__canvasHeight = 100
    window.__canvasWidth = 200

    const screenshotModule = await import('./screenshot.js')

    await expect(screenshotModule.captureCanvasScreenshot()).rejects.toThrow(
      'Canvas not ready for screenshot after timeout'
    )
  })

  // TC07: captureCanvasScreenshotAsBlob - returns Blob
  it('TC07: captureCanvasScreenshotAsBlob returns Blob object', async () => {
    window.__gameCanvasReady = true

    const screenshotModule = await import('./screenshot.js')
    const blob = await screenshotModule.captureCanvasScreenshotAsBlob()

    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
  })

  // TC08: getCanvasRenderStatus - canvas exists
  it('TC08: getCanvasRenderStatus returns correct status when canvas exists', async () => {
    window.__gameCanvasReady = true

    const screenshotModule = await import('./screenshot.js')
    const status = screenshotModule.getCanvasRenderStatus()

    expect(status).toEqual({
      ready: true,
      canvasExists: true,
      canvasReady: true,
      canvasWidth: 978,
      canvasHeight: 685,
      hasContent: true
    })
  })

  // TC09: getCanvasRenderStatus - canvas does not exist
  it('TC09: getCanvasRenderStatus returns false when canvas does not exist', async () => {
    mockDocument.querySelector = vi.fn(() => null)

    const screenshotModule = await import('./screenshot.js')
    const status = screenshotModule.getCanvasRenderStatus()

    expect(status).toEqual({
      ready: false,
      canvasExists: false,
      canvasReady: false,
      canvasWidth: 0,
      canvasHeight: 0,
      hasContent: false
    })

    // Restore mock
    mockDocument.querySelector = vi.fn(() => mockCanvas)
  })

  // TC10: waitForCanvasRender - resolves when canvas is ready
  it('TC10: waitForCanvasRender resolves when canvas is ready', async () => {
    window.__gameCanvasReady = true

    const screenshotModule = await import('./screenshot.js')
    const result = await screenshotModule.waitForCanvasRender(1000, 50)

    expect(result).toBe(true)
  })

  // TC11: waitForCanvasRender - polls until canvas is ready
  it('TC11: waitForCanvasRender polls until canvas is ready', async () => {
    const screenshotModule = await import('./screenshot.js')

    // Use a very short timeout to test polling
    // Set ready after 50ms
    setTimeout(() => {
      window.__gameCanvasReady = true
    }, 60)

    // Should resolve ready after a few polls (checkInterval=20, timeout=500)
    const result = await screenshotModule.waitForCanvasRender(500, 20)

    expect(result).toBe(true)
  })

  // TC12: waitForCanvasRender - times out when canvas never ready
  it.skip('TC12: waitForCanvasRender resolves false on timeout', async () => {
    window.__gameCanvasReady = false
    window.__canvasHeight = 150  // Below 200 threshold
    window.__canvasWidth = 200   // Below 300 threshold

    // Set canvas to null to force timeout
    currentCanvas = null

    const screenshotModule = await import('./screenshot.js')

    // Use short timeout to speed up test
    const result = await screenshotModule.waitForCanvasRender(100, 20)

    expect(result).toBe(false)

    // Restore mock
    currentCanvas = mockCanvas
    window.__canvasHeight = 0
    window.__canvasWidth = 0
  })

  // TC13: window.__screenshotUtils is exposed
  it('TC13: Screenshot utilities are exposed on window object', async () => {
    window.__gameCanvasReady = true

    // Import module and ensure window object side effects are applied
    await import('./screenshot.js')

    // Verify exposure
    expect(__screenshotUtils).toBeDefined()
    expect(__screenshotUtils.isCanvasReady).toBeDefined()
    expect(__screenshotUtils.captureCanvasScreenshot).toBeDefined()
    expect(__screenshotUtils.captureCanvasScreenshotAsBlob).toBeDefined()
    expect(__screenshotUtils.getCanvasRenderStatus).toBeDefined()
    expect(__screenshotUtils.waitForCanvasRender).toBeDefined()
  })

  // TC14: getCanvasRenderStatus - transparent canvas
  it('TC14: getCanvasRenderStatus detects transparent canvas', async () => {
    window.__gameCanvasReady = false

    // Mock transparent canvas
    const transparentCanvas = {
      width: 978,
      height: 685,
      getContext: vi.fn(() => ({
        getImageData: vi.fn(() => ({
          data: [0, 0, 0, 0]  // Transparent pixel
        }))
      })),
      toDataURL: vi.fn(() => 'data:image/png;base64,fake'),
      toBlob: vi.fn((callback) => {
        callback(new Blob(['fake'], { type: 'image/png' }))
      })
    }

    mockDocument.querySelector = vi.fn(() => transparentCanvas)

    const screenshotModule = await import('./screenshot.js')
    const status = screenshotModule.getCanvasRenderStatus()

    expect(status.hasContent).toBe(false)

    // Restore mock
    mockDocument.querySelector = vi.fn(() => mockCanvas)
  })

  // TC15: captureCanvasScreenshotAsBlob - with custom format
  it('TC15: captureCanvasScreenshotAsBlob accepts custom format', async () => {
    window.__gameCanvasReady = true

    const screenshotModule = await import('./screenshot.js')
    const blob = await screenshotModule.captureCanvasScreenshotAsBlob(mockCanvas, 'image/jpeg', 0.9)

    expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.9)
    expect(blob.type).toBe('image/png')  // toBlob returns the fake blob with image/png type
  })
})