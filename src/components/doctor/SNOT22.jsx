// ─────────────────────────────────────────────
//  RhinoGuide by Manish — SNOT-22
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useParams }           from 'react-router-dom'
import { saveSNOT22, getSNOT22History, getPatient }
  from '../../firebase/firestore'
import { Save, CheckCircle2, History } from 'lucide-react'

const QUESTIONS = [
  { q: 'Need to blow nose',                             d: 'nasal'  },
  { q: 'Sneezing',                                      d: 'nasal'  },
  { q: 'Runny nose / rhinorrhoea',                      d: 'nasal'  },
  { q: 'Cough',                                         d: 'nasal'  },
  { q: 'Post-nasal discharge (mucus down throat)',      d: 'nasal'  },
  { q: 'Thick nasal discharge',                         d: 'nasal'  },
  { q: 'Ear fullness',                                  d: 'nasal'  },
  { q: 'Dizziness',                                     d: 'nasal'  },
  { q: 'Ear pain / pressure',                           d: 'nasal'  },
  { q: 'Facial pain / pressure',                        d: 'nasal'  },
  { q: 'Difficulty falling asleep',                     d: 'sleep'  },
  { q: 'Waking up at night',                            d: 'sleep'  },
  { q: 'Lack of a good night\'s sleep',                 d: 'sleep'  },
  { q: 'Waking up tired',                               d: 'sleep'  },
  { q: 'Fatigue / tiredness',                           d: 'sleep'  },
  { q: 'Reduced productivity at work',                  d: 'emo'    },
  { q: 'Reduced concentration',                         d: 'emo'    },
  { q: 'Frustrated / restless / irritable',             d: 'emo'    },
  { q: 'Sad / depressed',                               d: 'emo'    },
  { q: 'Embarrassed',                                   d: 'emo'    },
  { q: 'Nasal blockage / congestion',                   d: 'nasal'  },
  { q: 'Loss of smell or taste',                        d: 'nasal'  },
]

const DOMAIN_LABELS = {
  nasal: '👃 Nasal',
  sleep: '😴 Sleep',
  emo:   '🧠 Emotional',
}

const severityLabel = (total) => {
  if (total <=  20) return { label: 'Mild',     cls: 'badge-green'  }
  if (total <=  50) return { label: 'Moderate', cls: 'badge-orange' }
  return                   { label: 'Severe',   cls: 'badge-red'    }
}

const SNOT22 = () => {
  const { id }   = useParams()
  const [patient, setPatient]  = useState(null)
  const [scores,  setScores]   = useState(new Array(22).fill(0))
  const [history, setHistory]  = useState([])
  const [tab,     setTab]      = useState('score') // score | history
  const [saving,  setSaving]   = useState(false)
  const [saved,   setSaved]    = useState(false)

  useEffect(() => {
    if (!id) return
    getPatient(id).then(setPatient)
    getSNOT22History(id).then(setHistory)
  }, [id])

  const total = scores.reduce((a, b) => a + b, 0)

  const domainScore = (d) => QUESTIONS.reduce((acc, q, i) =>
    q.d === d ? acc + scores[i] : acc, 0
  )

  const setScore = (i, v) =>
    setScores(prev => { const n = [...prev]; n[i] = v; return n })

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await saveSNOT22(id, scores)
      const updated = await getSNOT22History(id)
      setHistory(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => setScores(new Array(22).fill(0))

  const sev = severityLabel(total)

  // Group questions by domain
  const domains = ['nasal', 'sleep', 'emo']

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-xl text-gray-900">SNOT-22</h2>
          {patient && (
            <p className="text-xs text-gray-500 mt-0.5">
              Patient: <span className="font-semibold">{patient.name}</span>
            </p>
          )}
        </div>
        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-xl
                        p-1 shadow-sm">
          {[
            { key: 'score',   label: '📋 Score' },
            { key: 'history', label: <><History className="w-3.5 h-3.5 inline mr-1" />History</> },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold
                          transition-all duration-150
                          ${tab === t.key
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'text-gray-500 hover:text-teal-700'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {saved && (
        <div className="alert-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> SNOT-22 saved to patient record
        </div>
      )}

      {/* ── SCORE TAB ── */}
      {tab === 'score' && (
        <>
          {/* Score summary hero */}
          <div className="bg-gradient-to-br from-teal-900 to-teal-700
                          rounded-2xl p-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-teal-300 text-xs mb-1">Total Score</p>
                <p className="font-mono text-5xl font-bold">{total}</p>
                <p className="text-teal-300 text-xs mt-1">/ 110</p>
              </div>
              <span className={`badge ${sev.cls} text-sm px-3 py-1.5`}>
                {sev.label}
              </span>
            </div>
            {/* Domain scores */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4
                            border-t border-white/10">
              {domains.map(d => (
                <div key={d} className="text-center">
                  <p className="text-2xl font-bold font-mono">
                    {domainScore(d)}
                  </p>
                  <p className="text-teal-400 text-xs mt-0.5">
                    {DOMAIN_LABELS[d]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="alert-info text-xs">
            ℹ️ Rate 0 = No problem → 5 = Worst possible &nbsp;·&nbsp;
            MCID = 8.9 points (a drop ≥9 = meaningful improvement)
          </div>

          {/* Questions by domain */}
          {domains.map(d => (
            <div key={d} className="card overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100
                              flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-700">
                  {DOMAIN_LABELS[d]}
                </h3>
                <span className="badge badge-teal font-mono">
                  {domainScore(d)}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {QUESTIONS.map((item, i) => item.d !== d ? null : (
                  <div key={i}
                    className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xs text-gray-400 font-mono
                                     w-5 flex-shrink-0">
                      {String(i+1).padStart(2,'0')}
                    </span>
                    <p className="flex-1 text-sm text-gray-700">{item.q}</p>
                    <div className="flex gap-1 flex-shrink-0">
                      {[0,1,2,3,4,5].map(v => (
                        <button key={v}
                          onClick={() => setScore(i, v)}
                          className={`
                            w-8 h-8 rounded-lg text-xs font-bold
                            transition-all duration-100 border
                            ${scores[i] === v
                              ? v === 0
                                ? 'bg-gray-200 border-gray-300 text-gray-600'
                                : v <= 2
                                  ? 'bg-teal-600 border-teal-600 text-white'
                                  : v <= 4
                                    ? 'bg-orange-500 border-orange-500 text-white'
                                    : 'bg-red-600 border-red-600 text-white'
                              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                            }
                          `}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Severity reference */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { range: '0–20',   label: 'Mild',     cls: 'bg-green-50 border-green-200 text-green-700'   },
              { range: '21–50',  label: 'Moderate', cls: 'bg-orange-50 border-orange-200 text-orange-700'},
              { range: '51–110', label: 'Severe',   cls: 'bg-red-50 border-red-200 text-red-700'        },
            ].map(s => (
              <div key={s.label}
                className={`border rounded-xl p-3 text-center ${s.cls}`}>
                <p className="font-bold text-sm">{s.label}</p>
                <p className="text-xs opacity-75 mt-0.5">{s.range}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          {id && (
            <div className="flex gap-3 justify-end">
              <button onClick={handleReset}
                className="btn-secondary">
                Reset
              </button>
              <button onClick={handleSave} disabled={saving}
                className="btn-primary">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white
                                     border-t-transparent rounded-full
                                     animate-spin" />
                  : <><Save className="w-4 h-4" /> Save Score</>
                }
              </button>
            </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="card p-10 text-center">
              <History className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No SNOT-22 records yet</p>
            </div>
          ) : (
            history.map((h, i) => {
              const s = severityLabel(h.total)
              return (
                <div key={h.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">
                      {h.recordedAt?.toDate
                        ? h.recordedAt.toDate().toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : 'Unknown date'}
                      {i === 0 && (
                        <span className="ml-2 badge badge-teal text-xs">
                          Latest
                        </span>
                      )}
                    </p>
                    <span className={`badge ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-3xl font-bold font-mono text-gray-800">
                        {h.total}
                      </p>
                      <p className="text-xs text-gray-400">/ 110</p>
                    </div>
                    {/* Delta vs previous */}
                    {i < history.length - 1 && (
                      <div className={`text-sm font-semibold ${
                        h.total < history[i+1].total
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {h.total < history[i+1].total ? '↓' : '↑'}{' '}
                        {Math.abs(h.total - history[i+1].total)} pts
                        {Math.abs(h.total - history[i+1].total) >= 9
                          ? ' ✓ Meaningful'
                          : ''}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default SNOT22