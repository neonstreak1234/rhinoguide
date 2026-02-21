// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Patient Dashboard
//  Quick symptom log for today
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../context/AuthContext'
import { getPatientByUID, saveCalendarEntry, getCalendarEntry }
  from '../../firebase/firestore'
import { Calendar, CheckCircle2, Save } from 'lucide-react'

const SYMPTOMS = [
  { key: 'sneeze',     label: 'Sneezing',        emoji: '🤧', color: '#3b82f6' },
  { key: 'congestion', label: 'Congestion',       emoji: '👃', color: '#ef4444' },
  { key: 'rhinorrhea', label: 'Rhinorrhoea',      emoji: '💧', color: '#22c55e' },
  { key: 'itching',    label: 'Nasal Itching',    emoji: '😣', color: '#f97316' },
  { key: 'eye',        label: 'Eye Symptoms',     emoji: '👁',  color: '#a855f7' },
  { key: 'cough',      label: 'Cough',            emoji: '😮‍💨', color: '#8b5cf6' },
  { key: 'pollen',     label: 'Pollen Exposure',  emoji: '🌸', color: '#eab308' },
  { key: 'agarbatti',  label: 'Smoke/Agarbatti',  emoji: '🪔', color: '#a16207' },
  { key: 'medication', label: 'Took Medication',  emoji: '💊', color: '#64748b' },
  { key: 'travel',     label: 'Outdoor/Travel',   emoji: '🚗', color: '#0891b2' },
]

const SEV = [
  { val: 1, label: 'Mild',     emoji: '🟢', cls: 'border-green-400  bg-green-50  text-green-700'  },
  { val: 2, label: 'Moderate', emoji: '🟡', cls: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { val: 3, label: 'Severe',   emoji: '🔴', cls: 'border-red-400    bg-red-50    text-red-700'    },
]

const PatientDashboard = () => {
  const { user, userProfile }  = useAuth()
  const navigate               = useNavigate()

  const [patient,  setPatient]  = useState(null)
  const [selSyms,  setSelSyms]  = useState([])
  const [sev,      setSev]      = useState(0)
  const [notes,    setNotes]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  const todayKey = new Date().toISOString().split('T')[0]
  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  useEffect(() => {
    if (!user) return
    const init = async () => {
      try {
        const p = await getPatientByUID(user.uid)
        setPatient(p)
        if (p) {
          // Load today's existing entry
          const entry = await getCalendarEntry(p.id, todayKey)
          if (entry) {
            setSelSyms(entry.syms || [])
            setSev(entry.sev || 0)
            setNotes(entry.notes || '')
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [user])

  const toggleSym = (key) => {
    setSelSyms(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const handleSave = async () => {
    if (!patient) return
    setSaving(true)
    try {
      await saveCalendarEntry(patient.id, todayKey, {
        syms: selSyms, sev, notes
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => {
    setSelSyms([]); setSev(0); setNotes('')
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )

  if (!patient) return (
    <div className="card p-8 text-center animate-fade-in">
      <p className="text-4xl mb-3">🏥</p>
      <h3 className="font-serif text-lg text-gray-800 mb-2">
        Account not linked yet
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        Your login is not yet linked to a patient record.
        <br />
        Please visit your doctor's OPD and ask them to register you
        in RhinoGuide using this mobile number or email.
      </p>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Greeting */}
      <div className="bg-gradient-to-br from-teal-900 to-teal-700
                      rounded-2xl p-5 text-white">
        <p className="text-teal-300 text-xs mb-1">{todayStr}</p>
        <h2 className="font-serif text-xl mb-1">
          Hello, {patient.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-teal-300 text-sm">
          How are you feeling today? Log your symptoms below.
        </p>
        {patient.ariaClass && (
          <div className="mt-3 inline-flex items-center gap-1.5
                          bg-white/15 rounded-full px-3 py-1">
            <span className="text-xs font-medium">{patient.ariaClass}</span>
          </div>
        )}
      </div>

      {/* Saved confirmation */}
      {saved && (
        <div className="alert-success flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          Today's symptoms saved! Your doctor can now see this.
        </div>
      )}

      {/* Symptoms */}
      <div className="card p-4">
        <h3 className="font-serif text-base text-gray-900 mb-3">
          Today's Symptoms
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {SYMPTOMS.map(s => (
            <button key={s.key}
              onClick={() => toggleSym(s.key)}
              className={`
                flex items-center gap-2.5 p-3 rounded-xl border-2
                text-left transition-all duration-150 text-sm font-medium
                ${selSyms.includes(s.key)
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'}
              `}>
              <span className="text-lg flex-shrink-0">{s.emoji}</span>
              <span className="leading-tight text-xs">{s.label}</span>
              {selSyms.includes(s.key) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600
                                         ml-auto flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div className="card p-4">
        <h3 className="font-serif text-base text-gray-900 mb-3">
          Overall Severity
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {SEV.map(s => (
            <button key={s.val}
              onClick={() => setSev(sev === s.val ? 0 : s.val)}
              className={`
                py-3 rounded-xl border-2 text-sm font-bold
                transition-all duration-150 flex flex-col items-center gap-1
                ${sev === s.val ? s.cls : 'border-gray-100 bg-white text-gray-500'}
              `}>
              <span className="text-lg">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="card p-4">
        <h3 className="font-serif text-base text-gray-900 mb-2">
          Notes <span className="text-xs font-normal text-gray-400">(optional)</span>
        </h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Visited temple, heavy traffic, dusty office..."
          rows={3}
          className="input text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex-1 justify-center py-3">
          {saving
            ? <span className="w-4 h-4 border-2 border-white
                               border-t-transparent rounded-full animate-spin" />
            : <><Save className="w-4 h-4" /> Save Today's Log</>
          }
        </button>
        <button onClick={handleClear}
          className="btn-secondary px-4">
          Clear
        </button>
      </div>

      {/* Calendar link */}
      <button onClick={() => navigate('/patient/calendar')}
        className="w-full card p-4 flex items-center gap-3
                   hover:shadow-md transition-all duration-200
                   hover:-translate-y-0.5">
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center
                        justify-center text-teal-600">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-gray-800">
            View Symptom Calendar
          </p>
          <p className="text-xs text-gray-400">See your full history</p>
        </div>
        <span className="text-gray-300 text-lg">→</span>
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pb-2">
        © 2026 RhinoGuide · Developed by Dr. Manish V.
      </p>
    </div>
  )
}

export default PatientDashboard