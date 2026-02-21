// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Treatment Flowchart
// ─────────────────────────────────────────────
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const Step = ({ step, color, title, items, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)

  const colors = {
    teal:   'border-teal-500   bg-teal-50   text-teal-800',
    green:  'border-green-500  bg-green-50  text-green-800',
    gold:   'border-yellow-500 bg-yellow-50 text-yellow-800',
    red:    'border-red-500    bg-red-50    text-red-800',
    orange: 'border-orange-500 bg-orange-50 text-orange-800',
    purple: 'border-purple-500 bg-purple-50 text-purple-800',
  }

  const stepColors = {
    teal:   'bg-teal-700',
    green:  'bg-green-700',
    gold:   'bg-yellow-600',
    red:    'bg-red-700',
    orange: 'bg-orange-600',
    purple: 'bg-purple-700',
  }

  return (
    <div className={`border-2 rounded-xl overflow-hidden ${colors[color]}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left">
        <span className={`${stepColors[color]} text-white text-xs
                          font-bold px-2.5 py-1 rounded-lg flex-shrink-0`}>
          {step}
        </span>
        <p className="font-semibold text-sm flex-1">{title}</p>
        {open
          ? <ChevronUp className="w-4 h-4 opacity-60 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 opacity-60 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade-in">
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i}
                className="flex gap-2 text-sm leading-snug">
                <span className="opacity-40 flex-shrink-0 mt-0.5">·</span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const Arrow = ({ label }) => (
  <div className="flex flex-col items-center py-1">
    <div className="w-0.5 h-4 bg-gray-300" />
    <div className="text-gray-400 text-xs italic px-2 py-0.5
                    bg-gray-100 rounded-full">{label || '↓'}</div>
    <div className="w-0.5 h-4 bg-gray-300" />
  </div>
)

const TreatmentFlow = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-2 animate-fade-in">

      {/* Header */}
      <div className="mb-4">
        <h2 className="font-serif text-xl text-gray-900">
          ARIA 2020 Treatment Algorithm
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Indian Market Edition · Tap each step to expand
        </p>
      </div>

      <div className="alert-success text-xs">
        ✅ Based on ARIA 2020 + BSACI + Indian adaptation.
        Treat rhinitis AND asthma together — unified airway.
      </div>

      <Step step="Step 0" color="teal" title="Universal Measures — ALL Patients"
        defaultOpen
        items={[
          'Allergen avoidance — identify and counsel specifically (HDM covers, cockroach control, avoid Parthenium contact, limit agarbatti / biomass exposure)',
          'Isotonic saline nasal rinse — <strong>Nasomist / Sterimar</strong> BD–TDS (reduces allergen load)',
          'Patient education — disease chronicity, medication compliance, spray technique',
          'Tobacco / biomass fuel cessation counselling',
        ]}
      />

      <Arrow label="↓ Mild Intermittent?" />

      <Step step="Step 1" color="green"
        title="Mild Intermittent AR — As-needed therapy"
        items={[
          '<strong>Oral 2nd-gen AH PRN:</strong> Levocetirizine 5mg OD HS (Levocet/L-Cet) <em>or</em> Fexofenadine 120mg OD (Allegra) <em>or</em> Bilastine 20mg OD fasting (Bilaxten)',
          '<strong>OR INCS PRN:</strong> Mometasone nasal (Nasonex/Momate) 2 sprays/nostril OD as-needed',
          'Eye drops if ocular sx: Olopat (Olopatadine 0.1%) BD',
          'No regular INCS needed at this step',
          '<em>If symptoms exceed 4 days/week → step up to Step 2</em>',
        ]}
      />

      <Arrow label="↓ Inadequate after 2 weeks or Moderate–Severe / Persistent" />

      <Step step="Step 2" color="teal"
        title="Moderate–Severe Intermittent / Mild Persistent — Regular INCS"
        items={[
          '<strong>INCS regular daily use (backbone):</strong> Nasonex (Mometasone) or Avamys (Fluticasone furoate) — 2 sprays/nostril OD',
          '+ <strong>Levocetirizine 5mg OD HS</strong> (Levocet/L-Cet) for breakthrough sneeze / rhinorrhoea / pruritus',
          '<em>OR</em> Fexofenadine 120mg OD (Allegra) for driver-safe option',
          'Reinforce INCS technique at every review',
          '<em>Reassess in 2–4 weeks</em>',
        ]}
      />

      <Arrow label="↓ Inadequate at 2–4 weeks" />

      <Step step="Step 3" color="gold"
        title="Add-On / Upgrade — Combination Spray or FDC"
        items={[
          'Upgrade to <strong>Dymista (Azelastine + Fluticasone) 1 spray/nostril BD</strong> — superior to either alone (MENSA trial)',
          '<em>OR</em> <strong>Ryaltris AZ (Azelastine + Mometasone) 1 spray/nostril BD</strong> — Glenmark India 2023',
          'Add <strong>Montair LC / Telekast-L (Montelukast + Levocetirizine) OD HS</strong>',
          '<em>OR</em> <strong>Bilaxten-M (Bilastine + Montelukast) OD fasting</strong> — zero sedation FDC, Phase III India data 2023',
          'Add <strong>Rupatadine 10mg OD (Rupatall)</strong> if congestion predominates — dual H1+PAF',
        ]}
      />

      <Arrow label="↓ Moderate–Severe Persistent, still inadequate" />

      <Step step="Step 4" color="red"
        title="Refractory — Specialist / Escalation"
        items={[
          'Review diagnosis — rule out: NARES, vasomotor rhinitis, CSF rhinorrhoea, structural causes',
          'Short-course oral <strong>Prednisolone 0.5mg/kg OD × 5 days</strong> (Omnacortil/Wysolone) for severe acute flare',
          'Nasal decongestant <strong>Nasivion 0.05%</strong> (Oxymetazoline) max 5 days only — rhinitis medicamentosa risk if prolonged',
          'Refer ENT (FESS if polyps/CRS) / Allergist / Pulmonologist',
          '<strong>Allergen Immunotherapy (AIT)</strong> — SCIT or SLIT for 3–5 years (only disease-modifying therapy)',
          'Biologics: <strong>Dupilumab (Dupixent)</strong> if severe AR + nasal polyps / CRSwNP / severe atopic disease',
        ]}
      />

      {/* India-specific notes */}
      <div className="card p-5 mt-4">
        <h3 className="font-serif text-base text-teal-700 mb-3 pb-2
                       border-b border-gray-100">
          🇮🇳 India-Specific Clinical Notes
        </h3>
        <div className="space-y-3">
          {[
            { emoji: '🌿', title: 'Parthenium sensitization',
              note: 'Avoid the weed; consider AIT; topical INCS for skin lesions' },
            { emoji: '🔥', title: 'Biomass / chulha smoke',
              note: 'Counsel strongly; change to LPG if possible; INCS most effective non-allergen measure' },
            { emoji: '🌧', title: 'Monsoon season',
              note: 'Mold spore peak — increase INCS dose, improve ventilation' },
            { emoji: '🤰', title: 'Pregnancy',
              note: 'Lorfast (Loratadine) or Zyrtec (Cetirizine); Budecort Nasal (Budesonide) — safest INCS (Category B); avoid nasal decongestants' },
            { emoji: '🩺', title: 'Diabetes comorbid',
              note: 'Avoid systemic steroids; short nasal spray courses preferred; monitor GRBS if oral steroids unavoidable' },
            { emoji: '👶', title: 'Child ≥3 yrs',
              note: 'Nasonex 1 spray/nostril OD; Levocet syrup; avoid 1st-gen AH (Avil syrup)' },
            { emoji: '👴', title: 'Elderly',
              note: 'Allegra (Fexofenadine) — non-sedating, no falls; avoid Avil/Phenergan entirely' },
            { emoji: '🚗', title: 'Driver / Pilot',
              note: 'Bilastine (Bilaxten) or Fexofenadine (Allegra) only — zero CNS penetration' },
          ].map(n => (
            <div key={n.title} className="flex gap-3">
              <span className="text-lg flex-shrink-0">{n.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TreatmentFlow