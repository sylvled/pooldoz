import { describe, it, expect } from 'vitest'
import { calculateVolume, calculateDose } from './chemistry'

// ── calculateVolume ──────────────────────────────────────────────────────────

const CALIBRATION = { pixelLength: 0.5, realLength: 5 } // 0.5 unit = 5m → 10m/unit

describe('calculateVolume', () => {
  it('flat-bottom rectangle 10m×5m at 2m depth → 100 m³', () => {
    const plan = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0.5 }, { x: 0, y: 0.5 }]
    const zones = [{ separator: 1.0, depthA: 2, depthB: null }]
    const vol = calculateVolume({ plan, zones, coteCalibrage: CALIBRATION })
    // area normalized = 0.5, metres/unit = 10, areaM2 = 0.5×100 = 50m², vol = 50×2 = 100
    expect(vol).toBeCloseTo(100, 0)
  })

  it('sloped bottom — average of depthA and depthB', () => {
    const plan = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0.5 }, { x: 0, y: 0.5 }]
    const zones = [{ separator: 1.0, depthA: 1.0, depthB: 3.0 }]
    const vol = calculateVolume({ plan, zones, coteCalibrage: CALIBRATION })
    // avg depth = 2m, area = 50m² → 100m³
    expect(vol).toBeCloseTo(100, 0)
  })

  it('two zones with different depths — weighted average', () => {
    const plan = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0.5 }, { x: 0, y: 0.5 }]
    const zones = [
      { separator: 0.5, depthA: 1.0, depthB: null },
      { separator: 1.0, depthA: 2.0, depthB: null },
    ]
    const vol = calculateVolume({ plan, zones, coteCalibrage: CALIBRATION })
    // avg depth = 0.5×1 + 0.5×2 = 1.5m, area = 50m² → 75m³
    expect(vol).toBeCloseTo(75, 0)
  })
})

// ── calculateDose ────────────────────────────────────────────────────────────

describe('calculateDose', () => {
  it('sel below target → returns dose in kg', () => {
    const result = calculateDose({ produit: 'sel', tauxMesure: 2500, tauxCible: 3200, volumeM3: 50 })
    expect(result.dose).toBeGreaterThan(0)
    expect(result.unit).toBe('kg')
    expect(result.optimal).toBe(false)
  })

  it('chlore at target (within 5%) → optimal, no dose', () => {
    const result = calculateDose({ produit: 'chlore', tauxMesure: 1.52, tauxCible: 1.5, volumeM3: 50 })
    expect(result.optimal).toBe(true)
    expect(result.dose).toBeNull()
  })

  it('ph_plus below target → dose returned', () => {
    const result = calculateDose({ produit: 'ph_plus', tauxMesure: 7.0, tauxCible: 7.4, volumeM3: 50 })
    expect(result.dose).toBeGreaterThan(0)
    expect(result.status).not.toBe('optimal')
  })

  it('sel above target → no addition needed', () => {
    const result = calculateDose({ produit: 'sel', tauxMesure: 3500, tauxCible: 3200, volumeM3: 50 })
    expect(result.optimal).toBe(true)
    expect(result.dose).toBeNull()
  })
})
