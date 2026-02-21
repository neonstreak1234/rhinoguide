// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Doctor Dashboard
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../context/AuthContext'
import { getDoctorPatients }   from '../../firebase/firestore'
import {
  Users, UserPlus, Calendar, ClipboardList,
  TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <button onClick={onClick}
    className="card p-5 text-left hover:shadow-md transition-all
               duration-200 hover:-translate-y-0.5 w-full">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center
                       justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <TrendingUp className="w-4 h-4 text-gray-300" />
    </div>
    <p className="text-2xl font-bold font-mono text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
  </button>
)

const Dashboard = () => {
  const { user, userProfile }  = useAuth()
  const navigate               = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user) return
    getDoctorPatients(user.uid)
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const today     = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const recentPatients = [...patients]
    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    .slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── HERO GREETING ── */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800
                      to-teal-700 rounded-2xl p-6 text-white relative
                      overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full
                        bg-white/5 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-teal-300 text-sm mb-1">{today}</p>
          <h2 className="font-serif text-2xl font-medium mb-1">
            {greeting}, {userProfile?.name?.split(' ')[0] || 'Doctor'} 👋
          </h2>
          <p className="text-teal-300 text-sm">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
            · RhinoGuide OPD Dashboard
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor/patients/new')}
          className="mt-4 relative z-10 inline-flex items-center gap-2
                     bg-white text-teal-800 font-semibold text-sm
                     px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors">
          <UserPlus className="w-4 h-4" />
          Register New Patient
        </button>
      </div>

      {/* ── STATS ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-6 bg-gray-100 rounded w-12 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users} label="Total Patients" value={patients.length}
            color="bg-teal-50 text-teal-600"
            onClick={() => navigate('/doctor/patients')}
          />
          <StatCard
            icon={Calendar} label="Active This Month"
            value={patients.filter(p => {
              const d = p.updatedAt?.seconds
              if (!d) return false
              const now = new Date()
              const upd = new Date(d * 1000)
              return upd.getMonth() === now.getMonth()
            }).length}
            color="bg-green-50 text-green-600"
            onClick={() => navigate('/doctor/patients')}
          />
          <StatCard
            icon={ClipboardList} label="Pending SNOT-22"
            value={patients.filter(p => !p.snot22Score).length}
            color="bg-orange-50 text-orange-600"
            onClick={() => navigate('/doctor/snot22')}
          />
          <StatCard
            icon={AlertCircle} label="Needs Follow-up"
            value={patients.filter(p => p.ariaClass?.includes('Moderate') ||
                                        p.ariaClass?.includes('Severe')).length}
            color="bg-red-50 text-red-600"
            onClick={() => navigate('/doctor/patients')}
          />
        </div>
      )}

      {/* ── RECENT PATIENTS ── */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center
                        justify-between">
          <h3 className="font-serif text-base text-gray-900">
            Recent Patients
          </h3>
          <button onClick={() => navigate('/doctor/patients')}
            className="text-xs text-teal-600 font-semibold hover:underline">
            View all →
          </button>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 bg-gray-100 rounded-full" />
                <div className="flex-1">
                  <div className="h-3.5 bg-gray-100 rounded w-32 mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : recentPatients.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              No patients yet
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Register your first patient to get started
            </p>
            <button onClick={() => navigate('/doctor/patients/new')}
              className="btn-primary mt-4 mx-auto">
              <UserPlus className="w-4 h-4" /> Register Patient
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentPatients.map(p => (
              <button key={p.id}
                onClick={() => navigate(`/doctor/patients/${p.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3
                           hover:bg-gray-50 transition-colors text-left">
                {/* Avatar */}
                <div className="w-9 h-9 bg-teal-100 rounded-full flex
                                items-center justify-center text-teal-700
                                font-bold text-sm flex-shrink-0">
                  {p.name?.charAt(0) || '?'}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {p.age ? `${p.age} yrs` : ''}
                    {p.age && p.gender ? ' · ' : ''}
                    {p.gender || ''}
                    {p.ariaClass ? ` · ${p.ariaClass}` : ''}
                  </p>
                </div>
                {/* Status badge */}
                <div className="flex-shrink-0">
                  {p.ariaClass?.includes('Severe') || p.ariaClass?.includes('Moderate') ? (
                    <span className="badge badge-orange">Moderate–Severe</span>
                  ) : p.ariaClass?.includes('Mild') ? (
                    <span className="badge badge-green">Mild</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-500">
                      Not classified
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── QUICK LINKS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'ARIA Classification', path: '/doctor/aria',      icon: '📊' },
          { label: 'Treatment Guide',     path: '/doctor/treatment', icon: '💊' },
          { label: 'Drug Reference',      path: '/doctor/drugs',     icon: '📖' },
          { label: 'SNOT-22 Tool',        path: '/doctor/snot22',    icon: '📋' },
        ].map(q => (
          <button key={q.path}
            onClick={() => navigate(q.path)}
            className="card p-4 text-left hover:shadow-md hover:-translate-y-0.5
                       transition-all duration-200">
            <span className="text-2xl block mb-2">{q.icon}</span>
            <p className="text-xs font-semibold text-gray-700">{q.label}</p>
          </button>
        ))}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pb-2">
        © 2026 RhinoGuide · Developed by Dr. Manish V. · All rights reserved
      </p>
    </div>
  )
}

export default Dashboard