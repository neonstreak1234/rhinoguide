// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Patient Trigger Calendar
//  Full month view with symptom history
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useAuth }             from '../../context/AuthContext'
import {
  getPatientByUID, getAllCalendarEntries
} from '../../firebase/firestore'

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const DOT_COLORS = {
  sneeze:     '#3b82f6', congestion: '#ef4444',
  rhinorrhea: '#22c55e', itching:    '#f97316',
  eye:        '#a855f7', cough:      '#8b5cf6',
  pollen:     '#eab308', agarbatti:  '#a16207',
  medication: '#64748b', travel:     '#0891b2',
}

const TriggerCalendar = () => {
  const { user }  = useAuth()
  const [patient, setPatient] = useState(null)
  const [entries, setEntries] = useState({})
  const [loading, setLoading] = useState(true)
  const [calDate, setCalDate] = useState(new Date())
  const [selDate, setSelDate] = useState(null)

  const yr  = calDate.getFullYear()
  const mo  = calDate.getMonth()
  const firstDay    = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const today       = new Date()

  const calKey = (d) =>
    `${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  useEffect(() => {
    if (!user) return
    const init = async () => {
      try {
        const p = await getPatientByUID(user.uid)
        setPatient(p)
        if (p) {
          const e = await getAllCalendarEntries(p.id)
          setEntries(e)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [user])

  // Month stats
  const monthEntries = Object.entries(entries).filter(([k]) =>
    k.startsWith(`${yr}-${String(mo+1).padStart(2,'0')}`)
  )
  const sympDays = monthEntries.filter(([,v]) => v.syms?.length).length
  const sevDays  = monthEntries.filter(([,v]) => v.sev === 3).length

  // Top symptom this month
  const symCount = {}
  monthEntries.forEach(([,v]) =>
    v.syms?.forEach(s => symCount[s] = (symCount[s]||0) + 1)
  )
  const topSym = Object.entries(symCount).sort((a,b) => b[1]-a[1])[0]

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div>
        <h2 className="font-serif text-xl text-gray-900">
          My Symptom Calendar
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Tap any day to see details
        </p>
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Symptom days', val: sympDays, col: 'text-teal-700'  },
          { label: 'Severe days',  val: sevDays,  col: 'text-red-600'   },
          { label: 'Top symptom',  val: topSym ? topSym[0] : '—',
            col: 'text-orange-600', small: true },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`font-bold font-mono ${s.col}
                           ${s.small ? 'text-sm' : 'text-2xl'}`}>
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
          <button
            onClick={() => setCalDate(new Date(yr, mo-1, 1))}
            className="btn-secondary py-1.5 px-3 text-xs">
            ← Prev
          </button>
          <h3 className="font-serif text-base">
            {MONTHS[mo]} {yr}
          </h3>
          <button
            onClick={() => setCalDate(new Date(yr, mo+1, 1))}
            className="btn-secondary py-1.5 px-3 text-xs">
            Next →
          </button>
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

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {[...Array(firstDay)].map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const d    = i + 1
            const k    = calKey(d)
            const data = entries[k]
            const isToday = yr === today.getFullYear() &&
                            mo  === today.getMonth()   &&
                            d   === today.getDate()
            const isSel   = selDate === k

            return (
              <button key={d}
                onClick={() => setSelDate(isSel ? null : k)}
                className={`
                  relative aspect-square rounded-xl border-2 flex flex-col
                  items-center justify-start p-1 transition-all duration-150
                  min-h-[44px]
                  ${isToday ? 'border-teal-500 ring-2 ring-teal-100' : ''}
                  ${isSel   ? 'border-teal-700 bg-teal-50 shadow-sm' :
                    isToday ? 'border-teal-500' : 'border-gray-100 bg-white'}
                  ${!isToday && !isSel ? 'hover:border-gray-200 hover:bg-gray-50' : ''}
                `}>
                <span className={`text-xs font-semibold leading-none
                  ${isToday ? 'text-teal-700' : 'text-gray-600'}`}>
                  {d}
                </span>
                {/* Symptom dots */}
                {data?.syms?.length > 0 && (
                  <div className="flex flex-wrap gap-px mt-0.5 justify-center">
                    {data.syms.slice(0,4).map(s => (
                      <span key={s}
                        style={{ background: DOT_COLORS[s] || '#888' }}
                        className="w-1.5 h-1.5 rounded-full" />
                    ))}
                    {data.syms.length > 4 && (
                      <span className="text-gray-400 text-xs leading-none">
                        +
                      </span>
                    )}
                  </div>
                )}
                {/* Severity stripe */}
                {data?.sev && (
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-1 rounded-b-xl
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
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase
                        tracking-wide mb-2">
            Legend
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(DOT_COLORS).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span style={{ background: c }}
                  className="w-2 h-2 rounded-full flex-shrink-0" />
                <span className="text-xs text-gray-500 capitalize">{k}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-3 pt-2 border-t border-gray-50">
            {[
              { c: 'bg-green-400',  l: 'Mild' },
              { c: 'bg-yellow-400', l: 'Moderate' },
              { c: 'bg-red-500',    l: 'Severe' },
            ].map(s => (
              <div key={s.l} className="flex items-center gap-1">
                <span className={`w-4 h-1 rounded-full ${s.c}`} />
                <span className="text-xs text-gray-400">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected day detail */}
      {selDate && (
        <div className="card p-4 animate-fade-in">
          <h4 className="font-serif text-sm text-teal-700 mb-3">
            📅 {new Date(selDate + 'T12:00:00').toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </h4>
          {entries[selDate] ? (
            <>
              {entries[selDate].syms?.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {entries[selDate].syms.map(s => (
                    <span key={s}
                      className="text-xs font-medium px-2.5 py-1 rounded-full
                                 border capitalize"
                      style={{
                        background:  DOT_COLORS[s] + '22',
                        borderColor: DOT_COLORS[s],
                        color:       DOT_COLORS[s],
                      }}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-2">No symptoms logged</p>
              )}
              {entries[selDate].sev > 0 && (
                <p className="text-xs text-gray-600 mb-1">
                  Severity:{' '}
                  <span className="font-semibold">
                    {entries[selDate].sev === 1 ? '🟢 Mild'
                      : entries[selDate].sev === 2 ? '🟡 Moderate'
                      : '🔴 Severe'}
                  </span>
                </p>
              )}
              {entries[selDate].notes && (
                <p className="text-xs text-gray-500 italic mt-1">
                  "{entries[selDate].notes}"
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">
              No symptoms logged for this day.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default TriggerCalendar