// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Patient Detail
//  Doctor view: overview + live calendar
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getPatient, getAllCalendarEntries, updatePatient
} from '../../firebase/firestore'
import {
  ArrowLeft, Calendar, FileText, Edit3,
  Phone, MapPin, Briefcase, Save, CheckCircle2
} from 'lucide-react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                'Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const DOT_COLORS = {
  sneeze:     '#3b82f6', congestion: '#ef4444',
  rhinorrhea: '#22c55e', itching:    '#f97316',
  eye:        '#a855f7', cough:      '#8b5cf6',
  pollen:     '#eab308', agarbatti:  '#a16207',
  medication: '#64748b', travel:     '#0891b2',
}

const PatientDetail = () => {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [patient,  setPatient]  = useState(null)
  const [entries,  setEntries]  = useState({})
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('overview') // overview | calendar
  const [calDate,  setCalDate]  = useState(new Date())
  const [selDate,  setSelDate]  = useState(null)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [p, e] = await Promise.all([
        getPatient(id),
        getAllCalendarEntries(id),
      ])
      setPatient(p)
      setEntries(e)
      setEditForm({
        ariaClass:   p?.ariaClass   || '',
        snot22Score: p?.snot22Score || '',
        notes:       p?.notes       || '',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updatePatient(id, editForm)
      setPatient(prev => ({ ...prev, ...editForm }))
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  // ── Calendar helpers ──
  const yr  = calDate.getFullYear()
  const mo  = calDate.getMonth()
  const firstDay = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const today = new Date()

  const calKey = (d) =>
    `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  // Stats for current month
  const monthEntries = Object.entries(entries).filter(([k]) =>
    k.startsWith(`${yr}-${String(mo+1).padStart(2,'0')}`)
  )
  const sympDays  = monthEntries.filter(([,v]) => v.syms?.length).length
  const sevDays   = monthEntries.filter(([,v]) => v.sev === 3).length
  const trigDays  = monthEntries.filter(([,v]) =>
    v.syms?.some(s => ['pollen','agarbatti','travel'].includes(s))
  ).length

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )

  if (!patient) return (
    <div className="text-center py-16">
      <p className="text-gray-500">Patient not found.</p>
      <button onClick={() => navigate('/doctor/patients')}
        className="btn-primary mt-4 mx-auto">
        ← Back to patients
      </button>
    </div>
  )

  return (
    <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/doctor/patients')}
          className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-serif text-xl text-gray-900">
              {patient.name}
            </h2>
            {patient.ariaClass && (
              <span className={`badge text-xs ${
                patient.ariaClass.includes('Moderate') ||
                patient.ariaClass.includes('Severe')
                  ? 'badge-orange'
                  : 'badge-green'
              }`}>
                {patient.ariaClass}
              </span>
            )}
            {patient.uid && (
              <span className="badge badge-teal text-xs">
                📱 App active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {patient.age ? `${patient.age} yrs` : ''}
            {patient.gender ? ` · ${patient.gender}` : ''}
            {patient.phone  ? ` · ${patient.phone}`  : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/doctor/proforma/${id}`)}
            className="btn-secondary">
            <FileText className="w-4 h-4" /> Proforma
          </button>
          <button onClick={() => navigate(`/doctor/snot22/${id}`)}
            className="btn-secondary">
            <FileText className="w-4 h-4" /> SNOT-22
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-gray-200 rounded-xl p-1
                      shadow-sm w-fit">
        {[
          { key: 'overview', label: '📋 Overview' },
          { key: 'calendar', label: '📅 Trigger Calendar' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold
                        transition-all duration-150
                        ${tab === t.key
                          ? 'bg-teal-700 text-white shadow-sm'
                          : 'text-gray-500 hover:text-teal-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {saved && (
            <div className="alert-success flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Saved successfully
            </div>
          )}

          {/* Patient info card */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-base text-teal-700">
                Patient Details
              </h3>
              <button onClick={() => setEditing(e => !e)}
                className="btn-ghost text-xs py-1.5 px-3">
                <Edit3 className="w-3.5 h-3.5" />
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Phone,    label: 'Phone',      val: patient.phone     },
                { icon: MapPin,   label: 'Address',    val: patient.address   },
                { icon: Briefcase,label: 'Occupation', val: patient.occupation},
                { icon: MapPin,   label: 'Habitat',    val: patient.habitat   },
              ].map(({ icon: Icon, label, val }) => val ? (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-gray-700">{val}</p>
                  </div>
                </div>
              ) : null)}
            </div>

            {/* Editable clinical fields */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              {editing ? (
                <>
                  <div>
                    <label className="label">ARIA Classification</label>
                    <select
                      value={editForm.ariaClass}
                      onChange={e => setEditForm(f => ({
                        ...f, ariaClass: e.target.value
                      }))}
                      className="input">
                      <option value="">— Not classified</option>
                      <option>🟢 Mild Intermittent AR</option>
                      <option>🟠 Moderate–Severe Intermittent AR</option>
                      <option>🔵 Mild Persistent AR</option>
                      <option>🔴 Moderate–Severe Persistent AR</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">SNOT-22 Score</label>
                    <input type="number" min="0" max="110"
                      value={editForm.snot22Score}
                      onChange={e => setEditForm(f => ({
                        ...f, snot22Score: e.target.value
                      }))}
                      placeholder="0–110" className="input" />
                  </div>
                  <div>
                    <label className="label">Clinical Notes</label>
                    <textarea rows={3}
                      value={editForm.notes}
                      onChange={e => setEditForm(f => ({
                        ...f, notes: e.target.value
                      }))}
                      className="input" />
                  </div>
                  <button onClick={handleSave} disabled={saving}
                    className="btn-primary">
                    {saving
                      ? <span className="w-4 h-4 border-2 border-white
                                         border-t-transparent rounded-full
                                         animate-spin" />
                      : <><Save className="w-4 h-4" /> Save Changes</>
                    }
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">ARIA Class</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {patient.ariaClass || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">SNOT-22</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {patient.snot22Score
                        ? `${patient.snot22Score}/110`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-700">
                      {patient.notes || '—'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CALENDAR TAB ── */}
      {tab === 'calendar' && (
        <div className="space-y-4">

          {/* Month stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Symptom days', val: sympDays,  color: 'text-teal-700' },
              { label: 'Severe days',  val: sevDays,   color: 'text-red-600'  },
              { label: 'Trigger days', val: trigDays,  color: 'text-orange-600'},
            ].map(s => (
              <div key={s.label} className="card p-3 text-center">
                <p className={`text-2xl font-bold font-mono ${s.color}`}>
                  {s.val}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="card p-4">
            {/* Nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalDate(new Date(yr, mo-1, 1))}
                className="btn-secondary py-1.5 px-3 text-xs">← Prev</button>
              <h3 className="font-serif text-base">
                {MONTHS[mo]} {yr}
              </h3>
              <button onClick={() => setCalDate(new Date(yr, mo+1, 1))}
                className="btn-secondary py-1.5 px-3 text-xs">Next →</button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-bold
                                        text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
              {[...Array(firstDay)].map((_, i) => (
                <div key={`e${i}`} />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const d    = i + 1
                const k    = calKey(d)
                const data = entries[k]
                const isToday = yr === today.getFullYear() &&
                                mo === today.getMonth() &&
                                d  === today.getDate()
                const isSel   = selDate === k

                return (
                  <button key={d}
                    onClick={() => setSelDate(isSel ? null : k)}
                    className={`
                      relative aspect-square rounded-lg border
                      flex flex-col items-center p-1
                      transition-all duration-150 min-h-[40px]
                      ${isToday  ? 'border-teal-500 ring-2 ring-teal-100' : 'border-gray-100'}
                      ${isSel    ? 'border-teal-700 bg-teal-50' : 'hover:bg-gray-50'}
                      ${data     ? 'bg-white' : 'bg-gray-50/50'}
                    `}>
                    <span className={`text-xs font-semibold leading-none
                      ${isToday ? 'text-teal-700' : 'text-gray-600'}`}>
                      {d}
                    </span>
                    {/* Dots */}
                    {data?.syms && (
                      <div className="flex flex-wrap gap-px mt-0.5
                                      justify-center">
                        {data.syms.slice(0,4).map(s => (
                          <span key={s}
                            style={{ background: DOT_COLORS[s] || '#888' }}
                            className="w-1.5 h-1.5 rounded-full" />
                        ))}
                      </div>
                    )}
                    {/* Severity stripe */}
                    {data?.sev && (
                      <div className={`absolute bottom-0 left-0 right-0
                                       h-1 rounded-b-lg
                        ${data.sev === 1 ? 'bg-green-400'  : ''}
                        ${data.sev === 2 ? 'bg-yellow-400' : ''}
                        ${data.sev === 3 ? 'bg-red-500'    : ''}
                      `} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3
                            border-t border-gray-100">
              {Object.entries(DOT_COLORS).slice(0,6).map(([k,c]) => (
                <div key={k} className="flex items-center gap-1">
                  <span style={{ background: c }}
                    className="w-2 h-2 rounded-full" />
                  <span className="text-xs text-gray-400 capitalize">{k}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected day detail */}
          {selDate && entries[selDate] && (
            <div className="card p-4 animate-fade-in">
              <h4 className="font-serif text-sm text-teal-700 mb-3">
                📅 {selDate}
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {entries[selDate].syms?.map(s => (
                  <span key={s}
                    style={{ background: DOT_COLORS[s]+'22',
                             borderColor: DOT_COLORS[s] }}
                    className="text-xs font-medium px-2 py-0.5 rounded-full
                               border capitalize"
                    style={{ background: DOT_COLORS[s]+'22',
                             borderColor: DOT_COLORS[s],
                             color: DOT_COLORS[s] }}>
                    {s}
                  </span>
                ))}
              </div>
              {entries[selDate].sev && (
                <p className="text-xs text-gray-500 mb-1">
                  Severity:{' '}
                  <span className="font-semibold">
                    {entries[selDate].sev === 1 ? '🟢 Mild'
                      : entries[selDate].sev === 2 ? '🟡 Moderate'
                      : '🔴 Severe'}
                  </span>
                </p>
              )}
              {entries[selDate].notes && (
                <p className="text-xs text-gray-600 mt-1 italic">
                  "{entries[selDate].notes}"
                </p>
              )}
            </div>
          )}
          {selDate && !entries[selDate] && (
            <div className="text-center py-4 text-sm text-gray-400">
              No entry logged for {selDate}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PatientDetail