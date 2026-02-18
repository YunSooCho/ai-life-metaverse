/**
 * Screenshot Utility for AI Life Metaverse
 *
 * Purpose: Capture canvas screenshots with proper timing
 * Problem: Canvas is rendered asynchronously, so screenshots must wait
 *
 * Usage:
 * ```js
 * import { captureCanvasScreenshot, isCanvasReady } from './screenshot.js';
 *
 * // Check if canvas is ready
 * if (await isCanvasReady()) {
 *   const dataUrl = await captureCanvasScreenshot();
 *   // Use dataUrl
 * }
 * ```
 */

/**
 * Check if canvas is ready for screenshot
 * @returns {Promise<boolean>} true if canvas is ready
 */
export async function isCanvasReady() {
  const maxAttempts = 30  // 3 seconds max (100ms * 30)
  const checkInterval = 100  // 100ms

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Check if GameCanvas exposed canvas ready state
    if (window.__gameCanvasReady === true) {
      return true
    }

    // Check if canvas element exists and has content
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Try to get a pixel to verify rendering
        const pixel = ctx.getImageData(0, 0, 1, 1)
        if (pixel && pixel.data && pixel.data[3] !== 0) {
          const height = window.__canvasHeight || canvas.height
          const width = window.__canvasWidth || canvas.width
          // Canvas must have minimum size (300x200)
          if (height >= 200 && width >= 300) {
            return true
          }
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, checkInterval))
  }

  return false
}

/**
 * Capture canvas screenshot as data URL
 * @param {HTMLCanvasElement} canvasElement - Optional canvas element (default: find first canvas)
 * @param {string} format - Image format (default: 'image/png')
 * @param {number} quality - Quality 0-1 (default: 1.0)
 * @returns {Promise<string>} Data URL
 */
export async function captureCanvasScreenshot(canvasElement = null, format = 'image/png', quality = 1.0) {
  // Wait for canvas to be ready
  const ready = await isCanvasReady()
  if (!ready) {
    throw new Error('Canvas not ready for screenshot after timeout')
  }

  // Get canvas element
  const canvas = canvasElement || document.querySelector('canvas')
  if (!canvas) {
    throw new Error('Canvas element not found')
  }

  // Return data URL
  return canvas.toDataURL(format, quality)
}

/**
 * Capture canvas screenshot as Blob
 * @param {HTMLCanvasElement} canvasElement - Optional canvas element
 * @param {string} format - Image format (default: 'image/png')
 * @param {number} quality - Quality 0-1 (default: 1.0)
 * @returns {Promise<Blob>} Blob object
 */
export async function captureCanvasScreenshotAsBlob(canvasElement = null, format = 'image/png', quality = 1.0) {
  // Get data URL first (which waits for canvas to be ready)
  const dataUrl = await captureCanvasScreenshot(canvasElement, format, quality)

  // Convert to Blob
  return new Promise((resolve, reject) => {
    const canvas = canvasElement || document.querySelector('canvas')
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to convert canvas to Blob'))
      }
    }, format, quality)
  })
}

/**
 * Get canvas render status (for debugging)
 * @returns {Object} Render status information
 */
export function getCanvasRenderStatus() {
  const canvas = document.querySelector('canvas')
  if (!canvas) {
    return {
      ready: false,
      canvasExists: false,
      canvasReady: false,
      canvasWidth: 0,
      canvasHeight: 0,
      hasContent: false
    }
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return {
      ready: false,
      canvasExists: true,
      canvasReady: false,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      hasContent: false
    }
  }

  // Check if canvas has content (not transparent)
  const pixel = ctx.getImageData(0, 0, 1, 1)
  const hasContent = pixel && pixel.data && pixel.data[3] !== 0

  return {
    ready: window.__gameCanvasReady || false,
    canvasExists: true,
    canvasReady: window.__gameCanvasReady || false,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    hasContent
  }
}

/**
 * Wait for canvas to render (polling approach)
 * @param {number} maxTime - Maximum wait time in ms (default: 3000)
 * @param {number} checkInterval - Check interval in ms (default: 100)
 * @returns {Promise<boolean>} true if canvas rendered successfully
 */
export function waitForCanvasRender(maxTime = 3000, checkInterval = 100) {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const check = () => {
      if (window.__gameCanvasReady) {
        resolve(true)
        return
      }

      const canvas = document.querySelector('canvas')
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const pixel = ctx.getImageData(0, 0, 1, 1)
          if (pixel && pixel.data && pixel.data[3] !== 0) {
            const height = window.__canvasHeight || canvas.height
            const width = window.__canvasWidth || canvas.width
            if (height >= 200 && width >= 300) {
              resolve(true)
              return
            }
          }
        }
      }

      if (Date.now() - startTime >= maxTime) {
        resolve(false)
        return
      }

      setTimeout(check, checkInterval)
    }

    check()
  })
}

/**
 * Export as global window object for browser automation
 */
if (typeof window !== 'undefined') {
  window.__screenshotUtils = {
    isCanvasReady,
    captureCanvasScreenshot,
    captureCanvasScreenshotAsBlob,
    getCanvasRenderStatus,
    waitForCanvasRender
  }
}

// Also export to globalThis for broader support
if (typeof globalThis !== 'undefined') {
  globalThis.__screenshotUtils = {
    isCanvasReady,
    captureCanvasScreenshot,
    captureCanvasScreenshotAsBlob,
    getCanvasRenderStatus,
    waitForCanvasRender
  }
}

export default {
  isCanvasReady,
  captureCanvasScreenshot,
  captureCanvasScreenshotAsBlob,
  getCanvasRenderStatus,
  waitForCanvasRender
}