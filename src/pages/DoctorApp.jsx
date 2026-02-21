// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Doctor App Shell
//  Sidebar + nested routing for all OPD tools
// ─────────────────────────────────────────────
import { useState }          from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth }           from '../context/AuthContext'
import {
  LayoutDashboard, Users, FileText, BarChart2,
  Pill, ClipboardList, Calendar, BookOpen,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react'

// Doctor components (we'll build these in Phase 4)
import Dashboard      from '../components/doctor/Dashboard'
import PatientList    from '../components/doctor/PatientList'
import RegisterPatient from '../components/doctor/RegisterPatient'
import PatientDetail  from '../components/doctor/PatientDetail'

// Clinical tools (Phase 5)
import Proforma          from '../components/doctor/Proforma'
import ARIAClassification from '../components/doctor/ARIAClassification'
import TreatmentFlow     from '../components/doctor/TreatmentFlow'
import DrugReference     from '../components/doctor/DrugReference'
import SNOT22            from '../components/doctor/SNOT22'

const NAV = [
  { path: '/doctor',            icon: LayoutDashboard, label: 'Dashboard',       end: true },
  { path: '/doctor/patients',   icon: Users,           label: 'Patients'                   },
  { path: '/doctor/proforma',   icon: FileText,        label: 'Proforma'                   },
  { path: '/doctor/aria',       icon: BarChart2,       label: 'ARIA Classification'        },
  { path: '/doctor/treatment',  icon: Pill,            label: 'Treatment'                  },
  { path: '/doctor/drugs',      icon: BookOpen,        label: 'Drug Reference'             },
  { path: '/doctor/snot22',     icon: ClipboardList,   label: 'SNOT-22'                    },
]

const DoctorApp = () => {
  const { userProfile, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path, end) => end
    ? location.pathname === path
    : location.pathname.startsWith(path)

  return (
    <div className="flex h-screen overflow-hidden bg-cream">

      {/* ── SIDEBAR ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60 bg-teal-900 flex flex-col h-full
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center
                        justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="text-xl">🌿</span>
              <span className="font-serif text-white text-base font-medium">
                RhinoGuide
              </span>
            </div>
            <p className="text-teal-400 text-xs ml-7">by Manish</p>
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center
                            justify-center text-white font-bold text-sm">
              {userProfile?.name?.charAt(0) || 'D'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {userProfile?.name || 'Doctor'}
              </p>
              <p className="text-teal-400 text-xs truncate">
                {userProfile?.qualification || 'OPD'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-0.5">
          <p className="text-teal-500 text-xs font-bold uppercase tracking-wider
                        px-3 py-2">
            Consultation
          </p>
          {NAV.map(({ path, icon: Icon, label, end }) => (
            <button key={path}
              onClick={() => { navigate(path); setSidebarOpen(false) }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all duration-150 group
                ${isActive(path, end)
                  ? 'bg-teal-700/60 text-white'
                  : 'text-teal-300 hover:bg-white/5 hover:text-white'}
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {isActive(path, end) && (
                <ChevronRight className="w-3 h-3 opacity-60" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                       text-sm font-medium text-red-400 hover:bg-red-500/10
                       hover:text-red-300 transition-all duration-150">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
          <p className="text-teal-600 text-xs text-center px-2">
            © 2026 RhinoGuide · Dr. Manish V.
          </p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex
                           items-center px-4 gap-3 flex-shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100
                       text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-base text-gray-900 truncate">
              {NAV.find(n => isActive(n.path, n.end))?.label || 'RhinoGuide'}
            </h1>
          </div>
          <span className="badge badge-teal hidden sm:inline-flex">
            🩺 Doctor
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Routes>
            <Route index                  element={<Dashboard />} />
            <Route path="patients"        element={<PatientList />} />
            <Route path="patients/new"    element={<RegisterPatient />} />
            <Route path="patients/:id"    element={<PatientDetail />} />
            <Route path="proforma"        element={<Proforma />} />
            <Route path="proforma/:id"    element={<Proforma />} />
            <Route path="aria"            element={<ARIAClassification />} />
            <Route path="aria/:id"        element={<ARIAClassification />} />
            <Route path="treatment"       element={<TreatmentFlow />} />
            <Route path="drugs"           element={<DrugReference />} />
            <Route path="snot22"          element={<SNOT22 />} />
            <Route path="snot22/:id"      element={<SNOT22 />} />
            <Route path="*"               element={<Navigate to="/doctor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default DoctorApp