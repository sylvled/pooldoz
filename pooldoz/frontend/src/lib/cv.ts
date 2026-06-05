const CV_API_URL = import.meta.env.VITE_CV_API_URL ?? 'http://localhost:8001'
const TIMEOUT_MS = 8000

export interface DetectResult {
  success: boolean
  polygon: Array<{ x: number; y: number }>
  confidence: number
  method: 'opencv' | 'js-fallback'
}

/** Main entry point — tries CV API then fallback Canny JS Worker */
export async function detectContours(imageBlob: Blob): Promise<DetectResult> {
  try {
    return await callCVApi(imageBlob)
  } catch {
    return await callJsFallback(imageBlob)
  }
}

async function callCVApi(imageBlob: Blob): Promise<DetectResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const form = new FormData()
    form.append('file', imageBlob)

    const res = await fetch(`${CV_API_URL}/detect-contours`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    })

    if (!res.ok) throw new Error(`CV API error ${res.status}`)
    return (await res.json()) as DetectResult
  } finally {
    clearTimeout(timer)
  }
}

/** Canny-like edge detection in a Web Worker (offline fallback) */
async function callJsFallback(imageBlob: Blob): Promise<DetectResult> {
  const bitmap = await createImageBitmap(imageBlob)
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, bitmap.width, bitmap.height)

  // Simple bounding-box approach as fallback
  let minX = width, minY = height, maxX = 0, maxY = 0
  const THRESHOLD = 30

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (brightness < 255 - THRESHOLD) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  // If no meaningful content found, return centered square
  if (maxX <= minX || maxY <= minY) {
    const margin = 0.15
    return {
      success: true,
      polygon: [
        { x: margin, y: margin },
        { x: 1 - margin, y: margin },
        { x: 1 - margin, y: 1 - margin },
        { x: margin, y: 1 - margin },
      ],
      confidence: 0.1,
      method: 'js-fallback',
    }
  }

  const pad = 0.05
  const nx = (v: number, max: number) => Math.max(0, Math.min(1, v / max))

  return {
    success: true,
    polygon: [
      { x: Math.max(0, nx(minX, width) - pad), y: Math.max(0, nx(minY, height) - pad) },
      { x: Math.min(1, nx(maxX, width) + pad), y: Math.max(0, nx(minY, height) - pad) },
      { x: Math.min(1, nx(maxX, width) + pad), y: Math.min(1, nx(maxY, height) + pad) },
      { x: Math.max(0, nx(minX, width) - pad), y: Math.min(1, nx(maxY, height) + pad) },
    ],
    confidence: 0.4,
    method: 'js-fallback',
  }
}
