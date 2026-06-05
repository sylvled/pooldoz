/**
 * OnboardingScreen — 2-screen entry flow.
 *
 * Screen 1: choose method (photo / maps / manual drawing).
 * Screen 2: choose starting shape (6 options).
 *
 * Balnéa: cream bg, violet header with blobs, gradient cards.
 * Brutale: black bg, acid accents, hard borders, no gradients.
 *
 * CSS variables only.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '@/store/settings.store'
import { AppHeader } from '@/components/AppHeader'
import { CanvasEditor } from '@/features/piscine/canvas/CanvasEditor'

type Method = 'photo' | 'maps' | 'dessin' | null
type Screen = 'entry' | 'shapes'

const SHAPES = [
  {
    label: 'Rectangle', svg: (
      <svg viewBox="0 0 64 48" width={64} height={48}>
        <rect x={6} y={8} width={52} height={32} rx={4} fill="rgba(61,184,184,0.15)" stroke="#3DB8B8" strokeWidth={2} />
      </svg>
    )
  },
  {
    label: 'Ovale', svg: (
      <svg viewBox="0 0 64 48" width={64} height={48}>
        <ellipse cx={32} cy={24} rx={26} ry={17} fill="rgba(45,27,105,0.08)" stroke="#8B7BA8" strokeWidth={2} />
      </svg>
    )
  },
  {
    label: 'Haricot', svg: (
      <svg viewBox="0 0 64 48" width={64} height={48}>
        <path d="M12,28 C10,18 16,8 26,8 C32,8 34,12 38,12 C46,12 54,16 54,24 C54,34 46,40 38,40 C30,40 28,36 22,36 C16,36 14,38 12,28 Z"
          fill="rgba(45,27,105,0.08)" stroke="#8B7BA8" strokeWidth={2} />
      </svg>
    )
  },
  {
    label: 'Forme en L', svg: (
      <svg viewBox="0 0 64 48" width={64} height={48}>
        <path d="M8,8 L38,8 L38,24 L54,24 L54,40 L8,40 Z" fill="rgba(45,27,105,0.08)" stroke="#8B7BA8" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: 'Forme en T', svg: (
      <svg viewBox="0 0 64 48" width={64} height={48}>
        <path d="M6,8 L58,8 L58,22 L38,22 L38,40 L26,40 L26,22 L6,22 Z" fill="rgba(45,27,105,0.08)" stroke="#8B7BA8" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: 'Forme libre', svg: (
      <svg viewBox="0 0 64 48" width={64} height={48}>
        <path d="M32,36 C36,28 42,32 44,24 C46,16 40,14 44,10" fill="none" stroke="#8B7BA8" strokeWidth={1.8} strokeDasharray="3,2" strokeLinecap="round" />
        <text x={20} y={30} fontSize={20} fill="#8B7BA8" opacity={0.7}>✏️</text>
      </svg>
    )
  },
]

export function OnboardingScreen() {
  const navigate = useNavigate()
  const isBrutale = useSettingsStore((s) => s.theme) === 'brutale'
  const [method, setMethod] = useState<Method>(null)
  const [screen, setScreen] = useState<Screen>('entry')
  const [selectedShape, setSelectedShape] = useState(0)
  const [imageUrl, setImageUrl] = useState<string | undefined>()

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, mode: Method) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUrl(URL.createObjectURL(file))
    setMethod(mode)
  }

  if (method === 'dessin' && screen === 'shapes') return <CanvasEditor />
  if (method === 'photo' && imageUrl) return <CanvasEditor backgroundImage={imageUrl} />
  if (method === 'maps' && imageUrl) return <CanvasEditor backgroundImage={imageUrl} />

  const cardBase: React.CSSProperties = {
    background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'white',
    borderRadius: isBrutale ? 0 : 'var(--radius-card)',
    padding: '18px 18px 18px 16px',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: isBrutale ? 'none' : 'var(--shadow-sm)',
    border: isBrutale ? '1px solid var(--border-color)' : '2px solid transparent',
    cursor: 'pointer', position: 'relative', overflow: 'hidden', flexShrink: 0,
  }
  const cardPrimary: React.CSSProperties = {
    ...cardBase,
    background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'linear-gradient(135deg, white 60%, rgba(61,184,184,0.04) 100%)',
    border: isBrutale ? '2px solid var(--accent)' : '2px solid rgba(61,184,184,0.35)',
  }
  const iconWrap: React.CSSProperties = {
    width: 56, height: 56, flexShrink: 0,
    borderRadius: isBrutale ? 0 : 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
    background: isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, rgba(61,184,184,0.15), rgba(61,184,184,0.05))',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg)' }}>
      <AppHeader>
        {screen === 'entry' ? (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: isBrutale ? 36 : 26, fontWeight: 700, color: isBrutale ? 'var(--accent)' : '#fff', lineHeight: 1.2, textTransform: isBrutale ? 'uppercase' : 'none' }}>
              {isBrutale ? 'PISCINE' : <>{`Configurons`}<br /><em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>votre piscine</em></>}
            </div>
            <div style={{ fontSize: 13, color: isBrutale ? 'var(--text-secondary)' : 'rgba(255,255,255,0.55)', marginTop: 4, fontFamily: 'var(--font-ui)' }}>
              Comment voulez-vous démarrer ?
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setScreen('entry')} style={{ background: 'none', border: 'none', color: isBrutale ? 'var(--accent)' : 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 8, textAlign: 'left', fontFamily: 'var(--font-ui)', minHeight: 0, minWidth: 0 }}>
              ← Retour
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: isBrutale ? 36 : 26, fontWeight: 700, color: isBrutale ? 'var(--accent)' : '#fff', lineHeight: 1.2, textTransform: isBrutale ? 'uppercase' : 'none' }}>
              {isBrutale ? 'FORME' : <>{`Forme de`}<br /><em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>départ</em></>}
            </div>
            <div style={{ fontSize: 13, color: isBrutale ? 'var(--text-secondary)' : 'rgba(255,255,255,0.55)', marginTop: 4, fontFamily: 'var(--font-ui)' }}>
              Ajustable à tout moment
            </div>
          </>
        )}
      </AppHeader>

      {/* ── Screen 1 — Entry ── */}
      {screen === 'entry' && (
        <div style={{ flex: 1, padding: '60px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 4, fontFamily: 'var(--font-ui)' }}>
            Choisir la méthode
          </p>

          {/* Photo (recommended) */}
          <label style={cardPrimary}>
            {!isBrutale && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(61,184,184,0.12)', color: 'var(--accent-deep, #2A9090)', fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 8, border: '1px solid rgba(61,184,184,0.2)' }}>
                Recommandé
              </div>
            )}
            {isBrutale && (
              <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent)', color: 'var(--ink, #0A0A0A)', fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '3px 8px' }}>
                RECOMMANDÉ
              </div>
            )}
            <div style={{ ...iconWrap }}>📸</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3, fontFamily: 'var(--font-ui)' }}>Depuis une photo</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>Prenez la piscine depuis la terrasse — l'app détecte les contours</div>
            </div>
            <div style={{ fontSize: 18, color: 'var(--accent)', flexShrink: 0 }}>→</div>
            <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileInput(e, 'photo')} style={{ display: 'none' }} />
          </label>

          {/* Maps */}
          <label style={cardBase}>
            <div style={{ ...iconWrap, background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'linear-gradient(135deg, rgba(255,126,95,0.15), rgba(255,126,95,0.05))', border: isBrutale ? '1px solid var(--border-color)' : 'none' }}>🗺️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3, fontFamily: 'var(--font-ui)' }}>Depuis Maps</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>Importez une capture satellite — détection automatique identique</div>
            </div>
            <div style={{ fontSize: 18, color: 'var(--text-secondary)', flexShrink: 0 }}>→</div>
            <input type="file" accept="image/jpeg,image/png" onChange={(e) => handleFileInput(e, 'maps')} style={{ display: 'none' }} />
          </label>

          {/* Manual */}
          <button style={{ ...cardBase, textAlign: 'left' } as React.CSSProperties} onClick={() => setScreen('shapes')}>
            <div style={{ ...iconWrap, background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'linear-gradient(135deg, rgba(45,27,105,0.12), rgba(45,27,105,0.04))', border: isBrutale ? '1px solid var(--border-color)' : 'none' }}>✏️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 3, fontFamily: 'var(--font-ui)' }}>Dessin manuel</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>Choisissez une forme de départ et affinez à la main</div>
            </div>
            <div style={{ fontSize: 18, color: 'var(--text-secondary)', flexShrink: 0 }}>→</div>
          </button>

          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', marginTop: 'auto', fontFamily: 'var(--font-ui)', minHeight: 0 }}>
            ← Retour à mes piscines
          </button>
        </div>
      )}

      {/* ── Screen 2 — Shape selection ── */}
      {screen === 'shapes' && (
        <div style={{ flex: 1, padding: '60px 20px 20px', display: 'flex', flexDirection: 'column' }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5, fontFamily: 'var(--font-ui)' }}>
            Toutes les formes sont ajustables. Étirez, déplacez les points, ajoutez des coins librement.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {SHAPES.map((shape, i) => {
              const active = selectedShape === i
              return (
                <button key={shape.label} onClick={() => setSelectedShape(i)} style={{
                  background: isBrutale
                    ? (active ? 'var(--dark-gray, #1E1E1E)' : 'var(--bg)')
                    : (active ? 'linear-gradient(135deg, white, rgba(61,184,184,0.05))' : 'white'),
                  borderRadius: isBrutale ? 0 : 'var(--radius-lg)',
                  padding: '12px 8px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  border: active
                    ? (isBrutale ? '2px solid var(--accent)' : '2px solid var(--accent)')
                    : (isBrutale ? '1px solid var(--border-color)' : '2px solid transparent'),
                  boxShadow: active ? (isBrutale ? '4px 4px 0 var(--accent)' : '0 4px 16px rgba(61,184,184,0.2)') : 'var(--shadow-xs)',
                  cursor: 'pointer', aspectRatio: '1', justifyContent: 'center',
                }}>
                  {shape.svg}
                  <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-secondary)', textAlign: 'center', fontFamily: 'var(--font-ui)', textTransform: isBrutale ? 'uppercase' : 'none', letterSpacing: isBrutale ? '0.5px' : 'normal' }}>
                    {shape.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Magnet hint */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: isBrutale ? 'var(--dark-gray, #1E1E1E)' : 'rgba(61,184,184,0.07)', border: `1px solid ${isBrutale ? 'var(--border-color)' : 'rgba(61,184,184,0.18)'}`, borderRadius: isBrutale ? 0 : 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>🧲</span>
            <p style={{ fontSize: 11, color: isBrutale ? 'var(--accent)' : 'var(--accent-deep, #2A9090)', fontWeight: 500, lineHeight: 1.4, fontFamily: 'var(--font-ui)' }}>
              Magnets légers activés — les bords s'alignent automatiquement
            </p>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => { setMethod('dessin'); setScreen('shapes') }}
              style={{
                width: '100%', border: isBrutale ? '3px solid var(--accent)' : 'none',
                borderRadius: isBrutale ? 0 : 'var(--radius-md)',
                padding: '17px 20px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                background: isBrutale ? 'var(--accent)' : 'linear-gradient(135deg, var(--aqua, #3DB8B8) 0%, var(--aqua-deep, #2A9090) 100%)',
                color: isBrutale ? 'var(--ink, #0A0A0A)' : 'white',
                boxShadow: isBrutale ? '4px 4px 0 var(--ink, #0A0A0A)' : 'var(--shadow-cta)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                textTransform: isBrutale ? 'uppercase' : 'none',
                letterSpacing: isBrutale ? '1px' : 'normal',
                minHeight: 52,
              }}>
              Commencer le dessin →
            </button>
            <button onClick={() => setScreen('entry')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', textDecoration: 'underline', width: '100%', marginTop: 10, fontFamily: 'var(--font-ui)', minHeight: 0 }}>
              Choisir une autre méthode
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
