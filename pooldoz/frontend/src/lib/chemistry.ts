/**
 * PoolDoz chemistry calculations — pure functions, zero side-effects.
 * All geometry uses normalized coordinates [0..1]; scale converts to real metres.
 */

export interface Point {
  x: number
  y: number
}

export interface DepthZone {
  separator: number // fraction of bounding box
  depthA: number // metres
  depthB: number | null // null = flat; non-null = sloped
}

export interface CalibrationData {
  pixelLength: number // distance in normalized space [0..1]
  realLength: number // metres
}

export interface VolumeInput {
  plan: Point[] // normalized polygon [0..1]
  zones: DepthZone[]
  coteCalibrage: CalibrationData
}

/** Shoelace formula for polygon area in normalized space */
function polygonArea(points: Point[]): number {
  const n = points.length
  let area = 0
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  return Math.abs(area) / 2
}

/**
 * Calculate pool volume in m³.
 * Uses shoelace area × weighted average depth × scale².
 */
export function calculateVolume({ plan, zones, coteCalibrage }: VolumeInput): number {
  if (plan.length < 3 || zones.length === 0) return 0

  // Scale: how many metres per unit in normalized space
  const metresPerUnit = coteCalibrage.realLength / coteCalibrage.pixelLength

  // Area in normalized space → convert to m²
  const areaNorm = polygonArea(plan)
  const areaM2 = areaNorm * metresPerUnit * metresPerUnit

  // Weighted average depth across zones
  let totalWeight = 0
  let weightedDepth = 0
  let prevSep = 0

  for (const zone of zones) {
    const fraction = zone.separator - prevSep
    const avgDepth = zone.depthB != null ? (zone.depthA + zone.depthB) / 2 : zone.depthA
    weightedDepth += fraction * avgDepth
    totalWeight += fraction
    prevSep = zone.separator
  }

  const avgDepth = totalWeight > 0 ? weightedDepth / totalWeight : 0

  return Math.round(areaM2 * avgDepth * 100) / 100
}

// ── Dosage calculations ─────────────────────────────────────────────────────

export type Produit = 'sel' | 'chlore' | 'ph_plus' | 'ph_moins' | 'tac' | 'algicide' | 'stabilisant'

export interface DefaultTargets {
  sel: number      // PPM
  chlore: number   // mg/L
  ph_plus: number  // pH unit
  ph_moins: number // pH unit
  tac: number      // mg/L
}

export const DEFAULT_TARGETS: DefaultTargets = {
  sel: 3200,
  chlore: 1.5,
  ph_plus: 7.4,
  ph_moins: 7.4,
  tac: 120,
}

export interface DoseInput {
  produit: Produit
  tauxMesure: number
  tauxCible: number
  volumeM3: number
}

export interface DoseResult {
  dose: number | null // kg or L; null if no addition needed
  unit: 'kg' | 'L'
  optimal: boolean
  status: 'optimal' | 'low' | 'high' | 'critical'
  conditionnements: string[]
}

/** Dosage coefficients: grams of product per m³ per unit of deficit */
const DOSE_COEFFICIENTS: Partial<Record<Produit, number>> = {
  sel: 7.5,        // 7.5 kg to raise by 1000 PPM per m³
  chlore: 2.0,     // 2g/m³ per 0.1 mg/L
  ph_plus: 15.0,   // 15g/m³ per 0.1 pH unit
  ph_moins: 20.0,  // 20g/m³ per 0.1 pH unit
  tac: 10.0,       // 10g/m³ per 10 mg/L
}

function calcStatus(measured: number, target: number, produit: Produit): DoseResult['status'] {
  const ratio = Math.abs(measured - target) / target
  if (produit === 'ph_plus' || produit === 'ph_moins') {
    const diff = Math.abs(measured - target)
    if (diff <= 0.2) return 'optimal'
    if (diff <= 0.5) return 'low'
    return 'critical'
  }
  if (ratio <= 0.05) return 'optimal'
  if (ratio <= 0.2) return 'low'
  return 'critical'
}

function conditionnements(doseKg: number): string[] {
  const sacs = [25, 10, 5, 1]
  const result: string[] = []
  let remaining = Math.ceil(doseKg * 10) / 10
  for (const sac of sacs) {
    const count = Math.floor(remaining / sac)
    if (count > 0) {
      result.push(`${count} sac${count > 1 ? 's' : ''} ${sac} kg`)
      remaining = Math.round((remaining - count * sac) * 10) / 10
    }
  }
  if (remaining > 0.1) result.push(`${remaining.toFixed(1)} kg`)
  return result
}

export function calculateDose({ produit, tauxMesure, tauxCible, volumeM3 }: DoseInput): DoseResult {
  const status = calcStatus(tauxMesure, tauxCible, produit)

  // Preventive products — no measurement
  if (produit === 'algicide') {
    const dose = Math.round(volumeM3 * 0.015 * 10) / 10 // 15 mL/m³
    return { dose, unit: 'L', optimal: false, status: 'low', conditionnements: [`${dose} L`] }
  }
  if (produit === 'stabilisant') {
    const dose = Math.round(volumeM3 * 0.015 * 10) / 10
    return { dose, unit: 'kg', optimal: false, status: 'low', conditionnements: conditionnements(dose) }
  }

  const deficit = tauxCible - tauxMesure
  if (deficit <= 0) {
    return { dose: null, unit: 'kg', optimal: true, status, conditionnements: [] }
  }

  const coeff = DOSE_COEFFICIENTS[produit] ?? 10
  const doseGrams = deficit * coeff * volumeM3
  const doseKg = Math.round(doseGrams / 100) / 10

  return {
    dose: doseKg,
    unit: 'kg',
    optimal: false,
    status,
    conditionnements: conditionnements(doseKg),
  }
}
