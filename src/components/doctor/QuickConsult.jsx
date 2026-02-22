// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Quick Consult
//  4-field instant ARIA 2020 recommendation
// ─────────────────────────────────────────────
import { useState } from 'react'
import { Zap, RotateCcw, AlertCircle } from 'lucide-react'

// ── Data ────────────────────────────────────

const DURATIONS = [
  { id: 'intermittent', emoji: '🔵', label: 'Intermittent', sub: '≤4 days/week OR ≤4 weeks/year' },
  { id: 'persistent',   emoji: '🟣', label: 'Persistent',   sub: '>4 days/week AND >4 weeks/year' },
]

const SEVERITIES = [
  { id: 'mild',     emoji: '🟢', label: 'Mild',            sub: 'Sleep & activities unaffected' },
  { id: 'moderate', emoji: '🟠', label: 'Moderate–Severe', sub: 'Sleep or function impaired' },
]

const SYMPTOMS = [
  { id: 'congestion',  emoji: '👃', label: 'Congestion' },
  { id: 'sneeze',      emoji: '🤧', label: 'Sneeze / Rhinorrhoea' },
  { id: 'mixed',       emoji: '🔄', label: 'Mixed / All' },
  { id: 'eye',         emoji: '👁',  label: 'Eye prominent' },
]

const SPECIALS = [
  { id: 'asthma',   emoji: '🫁', label: 'Asthma comorbid' },
  { id: 'pregnant', emoji: '🤰', label: 'Pregnancy' },
  { id: 'child',    emoji: '👶', label: 'Child <12 yrs' },
  { id: 'elderly',  emoji: '👴', label: 'Elderly >65' },
  { id: 'failed',   emoji: '⚠️', label: 'Prior treatment failed' },
  { id: 'driver',   emoji: '🚗', label: 'Driver / Pilot' },
  { id: 'polyps',   emoji: '🔬', label: 'Nasal polyps' },
  { id: 'diabetes', emoji: '🩺', label: 'Diabetes' },
]

// ── Recommendation engine ────────────────────

function getRecommendation({ duration, severity, symptom, specials }) {
  const isPregnant = specials.includes('pregnant')
  const isChild    = specials.includes('child')
  const isDriver   = specials.includes('driver')
  const hasAsthma  = specials.includes('asthma')
  const hasPolyps  = specials.includes('polyps')
  const hasDiabetes= specials.includes('diabetes')
  const failed     = specials.includes('failed')

  // Step 1 — Mild Intermittent
  if (duration === 'intermittent' && severity === 'mild' && !failed) {
    const firstLine = isPregnant
      ? 'Loratadine 10mg OD (Lorfast) — Category B; safest oral AH in pregnancy'
      : isChild
        ? 'Levocetirizine syrup (Levocet) weight-based OD HS · Avoid 1st-gen AH (Avil)'
        : isDriver
          ? 'Fexofenadine 120mg OD (Allegra) — truly non-sedating, driver-safe · OR Bilastine 20mg OD fasting (Bilaxten)'
          : 'Levocetirizine 5mg OD HS (Levocet/L-Cet) · OR Fexofenadine 120mg OD (Allegra) · OR Bilastine 20mg OD fasting (Bilaxten)'

    return {
      step: 'STEP 1',
      stepColor: 'green',
      title: 'Mild Intermittent AR — As-Needed Therapy',
      firstLine: [firstLine, 'OR INCS PRN: Mometasone nasal (Nasonex) 2 sprays/nostril OD as-needed'],
      alternatives: ['Cetirizine 10mg OD HS (Alerid/Cetzine) · Note: FDA 2025 pruritus warning on long-term use', symptom === 'eye' ? 'Olopatadine eye drops 0.1% (Olopat) BD' : null].filter(Boolean),
      addons: ['Isotonic saline nasal rinse (Nasomist/Sterimar) BD — Step 0 for all'],
      avoid: ['1st-generation AH (Avil/Phenergan) — sedation, anticholinergic effects', 'Prolonged nasal decongestants (rhinitis medicamentosa)'],
    }
  }

  // Step 2 — Moderate–Severe Intermittent OR Mild Persistent
  if ((duration === 'intermittent' && severity === 'moderate') ||
      (duration === 'persistent'   && severity === 'mild' && !failed)) {
    const incs = isPregnant
      ? 'Budesonide nasal (Budecort Nasal) — Category B, most pregnancy safety data'
      : isChild
        ? 'Mometasone nasal (Nasonex) 1 spray/nostril OD — approved ≥3 yrs'
        : 'Mometasone (Nasonex/Momate) or Fluticasone furoate (Avamys) — 2 sprays/nostril OD'

    const ah = isDriver
      ? 'Fexofenadine 120mg OD (Allegra) or Bilastine 20mg OD fasting (Bilaxten) — driver-safe only'
      : isChild
        ? 'Levocetirizine syrup OD HS (weight-based)'
        : isPregnant
          ? 'Loratadine 10mg OD (Lorfast) or Cetirizine 10mg OD HS — both Category B'
          : 'Levocetirizine 5mg OD HS (Levocet/L-Cet) — for breakthrough sneeze / pruritus'

    return {
      step: 'STEP 2',
      stepColor: 'teal',
      title: 'Regular INCS + Oral Antihistamine',
      firstLine: [`INCS backbone: ${incs}`, `+ Oral AH: ${ah}`],
      alternatives: [
        symptom === 'congestion' ? 'Rupatadine 10mg OD (Rupatall) — dual H1+PAF, best for congestion' : null,
        hasAsthma ? 'Add Montelukast 10mg OD HS (Montair) — especially beneficial with asthma comorbidity' : null,
        'Reinforce INCS spray technique at every review visit',
      ].filter(Boolean),
      addons: [symptom === 'eye' ? 'Olopatadine eye drops 0.1% (Olopat) BD for ocular symptoms' : 'Saline rinse (Nasomist/Sterimar) BD'],
      avoid: [
        hasDiabetes ? 'Systemic steroids — avoid; monitor closely if unavoidable' : null,
        isDriver ? 'Levocetirizine / Cetirizine — sedation risk; stick to driver-safe AH' : null,
        '1st-generation AH (Avil/Phenergan)',
      ].filter(Boolean),
    }
  }

  // Step 3 — Moderate–Severe Persistent OR failed prior
  if ((duration === 'persistent' && severity === 'moderate') || failed) {
    const combo = hasPolyps
      ? 'Dymista (Azelastine + Fluticasone) 1 spray/nostril BD — superior efficacy in polyp patients'
      : 'Dymista (Azelastine + Fluticasone) 1 spray/nostril BD (MENSA trial: superior to either alone) · OR Ryaltris AZ (Azelastine + Mometasone) BD — Glenmark India 2023'

    return {
      step: 'STEP 3',
      stepColor: 'gold',
      title: 'Add-On / Upgrade — Combination Spray or FDC',
      firstLine: [
        combo,
        isDriver
          ? 'FDC: Bilaxten-M (Bilastine + Montelukast) OD fasting — zero sedation, driver-safe'
          : 'FDC: Montair LC / Telekast-L (Montelukast + Levocetirizine) OD HS',
      ],
      alternatives: [
        'Bilaxten-M (Bilastine + Montelukast) OD fasting — newest zero-sedation FDC, Phase III India 2023',
        symptom === 'congestion' ? 'Rupatadine 10mg OD (Rupatall) — add for congestion-dominant; dual H1+PAF' : null,
        hasAsthma ? 'Montelukast 10mg OD HS (Montair/Singulair) — LTRA benefits both AR and asthma' : null,
      ].filter(Boolean),
      addons: [
        hasPolyps ? 'Refer ENT — FESS evaluation if significant polyp burden' : null,
        'Saline rinse (Nasomist/Sterimar) BD–TDS — reduce allergen load',
        'Consider Allergen Immunotherapy (AIT) referral — only disease-modifying therapy',
      ].filter(Boolean),
      avoid: [
        hasDiabetes ? 'Systemic / oral steroids — avoid; use nasal INCS only' : 'Prolonged oral steroids — use only for acute severe flares (≤5 days max)',
        'Oxymetazoline (Nasivion) beyond 5 days — rhinitis medicamentosa risk',
      ],
    }
  }

  // Fallback Step 4
  return {
    step: 'STEP 4',
    stepColor: 'red',
    title: 'Refractory — Specialist Referral Required',
    firstLine: [
      'Review diagnosis — rule out NARES, vasomotor rhinitis, CSF rhinorrhoea, structural causes',
      'Short-course oral Prednisolone 0.5mg/kg OD × 5 days (Omnacortil/Wysolone) for acute severe flare',
    ],
    alternatives: [
      'Allergen Immunotherapy (AIT) — SCIT or SLIT 3–5 years; only disease-modifying treatment',
      hasPolyps ? 'Dupilumab (Dupixent) — if severe CRSwNP / nasal polyps / atopic comorbidity' : null,
      'FESS referral if polyps or CRS confirmed on CT PNS',
    ].filter(Boolean),
    addons: ['Refer Allergist for SPT / specific IgE + AIT planning', 'Refer Pulmonologist if asthma uncontrolled'],
    avoid: [
      hasDiabetes ? 'Prolonged systemic steroids — strict avoidance; GRBS monitoring if unavoidable' : 'Long-term systemic steroids',
      'Oxymetazoline beyond 5 days',
    ],
  }
}

// ── Color maps ───────────────────────────────

const stepColors = {
  green: { badge: 'bg-green-700',  card: 'border-green-400 bg-green-50',  text: 'text-green-800' },
  teal:  { badge: 'bg-teal-700',   card: 'border-teal-400  bg-teal-50',   text: 'text-teal-800'  },
  gold:  { badge: 'bg-yellow-600', card: 'border-yellow-400 bg-yellow-50', text: 'text-yellow-800' },
  red:   { badge: 'bg-red-700',    card: 'border-red-400   bg-red-50',    text: 'text-red-800'   },
}

// ── Sub-components ───────────────────────────

const OptionBtn = ({ selected, onClick, emoji, label, sub }) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left px-3.5 py-3 rounded-xl border-2 transition-all duration-150
      flex items-start gap-3
      ${selected
        ? 'border-teal-500 bg-teal-50 shadow-sm'
        : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40'}
    `}
  >
    <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
    <div>
      <p className={`text-sm font-semibold ${selected ? 'text-teal-800' : 'text-gray-800'}`}>
        {label}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
    <span className={`ml-auto flex-shrink-0 mt-1 w-4 h-4 rounded-full border-2 transition-all
      ${selected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}
    >
      {selected && <span className="flex h-full items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-white block" />
      </span>}
    </span>
  </button>
)

const SpecialChip = ({ selected, onClick, emoji, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
      transition-all duration-150
      ${selected
        ? 'border-teal-500 bg-teal-600 text-white shadow-sm'
        : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:text-teal-700'}
    `}
  >
    <span>{emoji}</span>
    <span>{label}</span>
  </button>
)

const Section = ({ emoji, title, items, color }) => (
  <div>
    <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${color}`}>
      {emoji} {title}
    </p>
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm leading-snug text-gray-700">
          <span className="opacity-30 flex-shrink-0 mt-0.5">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
)

// ── Main component ───────────────────────────

const QuickConsult = () => {
  const [duration, setDuration] = useState(null)
  const [severity, setSeverity] = useState(null)
  const [symptom,  setSymptom]  = useState(null)
  const [specials, setSpecials] = useState([])

  const toggleSpecial = (id) =>
    setSpecials(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const reset = () => {
    setDuration(null); setSeverity(null)
    setSymptom(null);  setSpecials([])
  }

  const filled = duration && severity && symptom
  const rec    = filled ? getRecommendation({ duration, severity, symptom, specials }) : null
  const colors = rec ? stepColors[rec.stepColor] : null

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-teal-600" />
            Quick Consult
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill 4 fields · Get instant ARIA 2020 guideline-based recommendation
          </p>
        </div>
        {(duration || severity || symptom || specials.length > 0) && (
          <button onClick={reset}
            className="btn-ghost text-xs px-3 py-1.5 flex-shrink-0 no-print">
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="alert-info text-xs">
        ⚡ <strong>Express Mode</strong> — Select 3 required fields below.
        Special situations (field 4) are optional but improve recommendation accuracy.
      </div>

      {/* ── Field 1: Duration ── */}
      <div className="card p-4 space-y-2">
        <p className="label flex items-center gap-1.5">
          <span className="w-5 h-5 bg-teal-600 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
          Duration
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DURATIONS.map(d => (
            <OptionBtn key={d.id} selected={duration === d.id}
              onClick={() => setDuration(d.id)}
              emoji={d.emoji} label={d.label} sub={d.sub} />
          ))}
        </div>
      </div>

      {/* ── Field 2: Severity ── */}
      <div className="card p-4 space-y-2">
        <p className="label flex items-center gap-1.5">
          <span className="w-5 h-5 bg-teal-600 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
          Severity
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SEVERITIES.map(s => (
            <OptionBtn key={s.id} selected={severity === s.id}
              onClick={() => setSeverity(s.id)}
              emoji={s.emoji} label={s.label} sub={s.sub} />
          ))}
        </div>
      </div>

      {/* ── Field 3: Dominant Symptom ── */}
      <div className="card p-4 space-y-2">
        <p className="label flex items-center gap-1.5">
          <span className="w-5 h-5 bg-teal-600 text-white rounded-full text-xs flex items-center justify-center font-bold">3</span>
          Dominant Symptom
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SYMPTOMS.map(s => (
            <OptionBtn key={s.id} selected={symptom === s.id}
              onClick={() => setSymptom(s.id)}
              emoji={s.emoji} label={s.label} />
          ))}
        </div>
      </div>

      {/* ── Field 4: Special Situations ── */}
      <div className="card p-4 space-y-2">
        <p className="label flex items-center gap-1.5">
          <span className="w-5 h-5 bg-gray-400 text-white rounded-full text-xs flex items-center justify-center font-bold">4</span>
          Special Situations
          <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">
            — optional, select all that apply
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SPECIALS.map(s => (
            <SpecialChip key={s.id} selected={specials.includes(s.id)}
              onClick={() => toggleSpecial(s.id)}
              emoji={s.emoji} label={s.label} />
          ))}
        </div>
      </div>

      {/* ── Incomplete nudge ── */}
      {!filled && (duration || severity || symptom) && (
        <div className="alert-warn flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Fill all 3 required fields (Duration · Severity · Dominant Symptom) to get a recommendation.
        </div>
      )}

      {/* ── Result card ── */}
      {rec && colors && (
        <div className={`border-2 rounded-2xl overflow-hidden animate-fade-in ${colors.card}`}>
          {/* Result header */}
          <div className={`px-5 py-4 flex items-center gap-3 border-b border-black/10`}>
            <span className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-lg`}>
              {rec.step}
            </span>
            <p className={`font-serif font-semibold text-sm flex-1 ${colors.text}`}>
              {rec.title}
            </p>
          </div>

          <div className="px-5 py-4 space-y-4">
            <Section
              emoji="✅" title="First-line / Preferred"
              items={rec.firstLine}
              color={colors.text}
            />
            {rec.alternatives?.length > 0 && (
              <Section
                emoji="🔄" title="Alternatives"
                items={rec.alternatives}
                color="text-gray-500"
              />
            )}
            {rec.addons?.length > 0 && (
              <Section
                emoji="➕" title="Add-on / Step-up"
                items={rec.addons}
                color="text-gray-500"
              />
            )}
            {rec.avoid?.length > 0 && (
              <Section
                emoji="🚫" title="Avoid"
                items={rec.avoid}
                color="text-red-600"
              />
            )}
          </div>

          <div className="px-5 py-2.5 bg-black/5 text-xs text-gray-500 border-t border-black/10">
            ARIA 2020 · Indian Market Edition · For clinical decision support only
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickConsult
