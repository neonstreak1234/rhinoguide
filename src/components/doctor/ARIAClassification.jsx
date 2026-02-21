// ─────────────────────────────────────────────
//  RhinoGuide by Manish — ARIA Classification
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useParams }           from 'react-router-dom'
import { useAuth }             from '../../context/AuthContext'
import { getPatient, updatePatient } from '../../firebase/firestore'
import { Save, CheckCircle2 }  from 'lucide-react'

const CLASSES = {
  'intermittent-mild':     '🟢 Mild Intermittent AR',
  'intermittent-moderate': '🟠 Moderate–Severe Intermittent AR',
  'persistent-mild':       '🔵 Mild Persistent AR',
  'persistent-moderate':   '🔴 Moderate–Severe Persistent AR',
}

const Card = ({ title, bullets, selected, onClick }) => (
  <button onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border-2 transition-all
                duration-150 hover:shadow-md
                ${selected
                  ? 'border-teal-600 bg-teal-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200'}`}>
    <p className={`font-semibold text-sm mb-2
                   ${selected ? 'text-teal-800' : 'text-gray-800'}`}>
      {title}
    </p>
    <ul className="space-y-1">
      {bullets.map(b => (
        <li key={b} className="text-xs text-gray-500 flex gap-1.5">
          <span className="text-gray-300 flex-shrink-0">·</span>{b}
        </li>
      ))}
    </ul>
    {selected && (
      <div className="mt-2 flex items-center gap-1 text-teal-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">Selected</span>
      </div>
    )}
  </button>
)

const ARIAClassification = () => {
  const { id }   = useParams()
  const { user } = useAuth()

  const [patient,  setPatient]  = useState(null)
  const [dur,      setDur]      = useState('')
  const [sev,      setSev]      = useState('')
  const [asthma,   setAsthma]   = useState('')
  const [fev1,     setFev1]     = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    if (!id) return
    getPatient(id).then(p => {
      if (!p) return
      setPatient(p)
      // Pre-fill from saved data
      if (p.ariaClass) {
        if (p.ariaClass.includes('Intermittent')) setDur('intermittent')
        else if (p.ariaClass.includes('Persistent')) setDur('persistent')
        if (p.ariaClass.includes('Mild')) setSev('mild')
        else if (p.ariaClass.includes('Moderate')) setSev('moderate')
      }
      if (p.asthma) setAsthma(p.asthma)
      if (p.fev1)   setFev1(p.fev1)
    })
  }, [id])

  const ariaKey   = dur && sev ? `${dur}-${sev}` : null
  const ariaClass = ariaKey ? CLASSES[ariaKey] : null

  const handleSave = async () => {
    if (!id || !ariaClass) return
    setSaving(true)
    try {
      await updatePatient(id, {
        ariaClass,
        asthma,
        fev1,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div>
        <h2 className="font-serif text-xl text-gray-900">
          ARIA 2020 Classification
        </h2>
        {patient && (
          <p className="text-xs text-gray-500 mt-0.5">
            Patient: <span className="font-semibold">{patient.name}</span>
          </p>
        )}
      </div>

      {saved && (
        <div className="alert-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          ARIA classification saved to patient record
        </div>
      )}

      {/* Info */}
      <div className="alert-info text-xs">
        ℹ️ Classify by <strong>Duration</strong> then <strong>Severity</strong>.
        Together these determine the treatment step.
      </div>

      {/* Step 1 — Duration */}
      <div className="card p-5">
        <h3 className="font-serif text-base text-teal-700 mb-3 pb-2
                       border-b border-gray-100">
          Step 1 — Duration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card
            title="🔵 Intermittent"
            bullets={['Symptoms ≤4 days/week', 'OR ≤4 weeks/year']}
            selected={dur === 'intermittent'}
            onClick={() => setDur('intermittent')}
          />
          <Card
            title="🟣 Persistent"
            bullets={['Symptoms >4 days/week', 'AND >4 weeks/year']}
            selected={dur === 'persistent'}
            onClick={() => setDur('persistent')}
          />
        </div>
      </div>

      {/* Step 2 — Severity */}
      <div className="card p-5">
        <h3 className="font-serif text-base text-teal-700 mb-3 pb-2
                       border-b border-gray-100">
          Step 2 — Severity
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card
            title="🟢 Mild"
            bullets={[
              'Sleep quality normal',
              'Activities / sport unaffected',
              'Work / school unaffected',
              'No troublesome symptoms',
            ]}
            selected={sev === 'mild'}
            onClick={() => setSev('mild')}
          />
          <Card
            title="🟠 Moderate–Severe"
            bullets={[
              'One or more impaired:',
              'Sleep disturbance',
              'Impaired activities / sport',
              'Impaired work / school',
              'Troublesome symptoms',
            ]}
            selected={sev === 'moderate'}
            onClick={() => setSev('moderate')}
          />
        </div>
      </div>

      {/* Result */}
      {ariaClass && (
        <div className="bg-teal-900 text-white rounded-2xl p-5
                        animate-fade-in">
          <p className="text-teal-400 text-xs uppercase tracking-wider mb-2">
            ARIA 2020 Classification
          </p>
          <p className="font-serif text-2xl font-medium">{ariaClass}</p>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4
                          border-t border-white/10">
            <div>
              <p className="text-teal-400 text-xs mb-1">Duration</p>
              <p className="font-semibold text-sm capitalize">{dur}</p>
            </div>
            <div>
              <p className="text-teal-400 text-xs mb-1">Severity</p>
              <p className="font-semibold text-sm capitalize">
                {sev === 'moderate' ? 'Moderate–Severe' : 'Mild'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Asthma Screen */}
      <div className="card p-5">
        <h3 className="font-serif text-base text-teal-700 mb-1 pb-2
                       border-b border-gray-100">
          🫁 Asthma Screen — Unified Airway
        </h3>
        <div className="alert-warn text-xs mb-3">
          ⚠️ ARIA mandates asthma screening in ALL AR patients.
          30–40% of AR patients in India have comorbid asthma.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Asthma Status</label>
            <select value={asthma} onChange={e => setAsthma(e.target.value)}
              className="input">
              <option value="">—</option>
              <option>Yes — controlled</option>
              <option>Yes — partially controlled</option>
              <option>Yes — uncontrolled</option>
              <option>Suspected — spirometry pending</option>
              <option>No</option>
            </select>
          </div>
          <div>
            <label className="label">FEV1/FVC Ratio</label>
            <input type="text" value={fev1}
              onChange={e => setFev1(e.target.value)}
              placeholder="e.g. 68% (obstructive if <70%)"
              className="input" />
          </div>
        </div>
      </div>

      {/* Save */}
      {id && (
        <div className="flex justify-end">
          <button onClick={handleSave}
            disabled={!ariaClass || saving}
            className="btn-primary">
            {saving
              ? <span className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin" />
              : <><Save className="w-4 h-4" /> Save to Patient Record</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

export default ARIAClassification