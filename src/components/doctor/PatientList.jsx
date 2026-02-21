// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Patient List
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useAuth }             from '../../context/AuthContext'
import { getDoctorPatients, deletePatient } from '../../firebase/firestore'
import {
  Search, UserPlus, User, Trash2,
  ChevronRight, Phone, Calendar
} from 'lucide-react'

const PatientList = () => {
  const { user }    = useAuth()
  const navigate    = useNavigate()
  const [patients,  setPatients]  = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [query,     setQuery]     = useState('')
  const [loading,   setLoading]   = useState(true)
  const [deleting,  setDeleting]  = useState(null)

  useEffect(() => {
    fetchPatients()
  }, [user])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(
      patients.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.ariaClass?.toLowerCase().includes(q)
      )
    )
  }, [query, patients])

  const fetchPatients = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getDoctorPatients(user.uid)
      setPatients(data)
      setFiltered(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete patient "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await deletePatient(id)
      setPatients(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  const ariaColor = (cls) => {
    if (!cls) return 'bg-gray-100 text-gray-500'
    if (cls.includes('Severe') || cls.includes('Moderate'))
      return 'bg-orange-100 text-orange-700'
    if (cls.includes('Mild')) return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-xl text-gray-900">Patients</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {patients.length} registered patient{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => navigate('/doctor/patients/new')}
          className="btn-primary">
          <UserPlus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, phone or ARIA class..."
          className="input pl-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
              <div className="w-11 h-11 bg-gray-100 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-100 rounded w-36 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-52" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            {query ? 'No patients match your search' : 'No patients registered yet'}
          </p>
          {!query && (
            <button onClick={() => navigate('/doctor/patients/new')}
              className="btn-primary mt-4 mx-auto">
              <UserPlus className="w-4 h-4" /> Register First Patient
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map(p => (
              <div key={p.id}
                className="flex items-center gap-3 px-4 py-3
                           hover:bg-gray-50 transition-colors group">

                {/* Avatar */}
                <div className="w-11 h-11 bg-teal-100 rounded-full flex
                                items-center justify-center text-teal-700
                                font-bold flex-shrink-0">
                  {p.name?.charAt(0) || '?'}
                </div>

                {/* Info — clickable */}
                <button
                  onClick={() => navigate(`/doctor/patients/${p.id}`)}
                  className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {p.age && (
                      <span className="text-xs text-gray-400">
                        {p.age} yrs
                      </span>
                    )}
                    {p.gender && (
                      <span className="text-xs text-gray-400">
                        · {p.gender}
                      </span>
                    )}
                    {p.phone && (
                      <span className="text-xs text-gray-400 flex
                                       items-center gap-1">
                        <Phone className="w-3 h-3" /> {p.phone}
                      </span>
                    )}
                  </div>
                </button>

                {/* ARIA badge */}
                <span className={`badge hidden sm:inline-flex flex-shrink-0
                                  ${ariaColor(p.ariaClass)}`}>
                  {p.ariaClass?.replace('AR', '').trim() || 'Not classified'}
                </span>

                {/* Calendar indicator */}
                {p.uid && (
                  <Calendar className="w-4 h-4 text-teal-400 flex-shrink-0
                                       hidden sm:block"
                    title="Patient has app access" />
                )}

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/doctor/patients/${p.id}`)}
                    className="p-1.5 rounded-lg hover:bg-teal-50
                               text-gray-400 hover:text-teal-600
                               transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deleting === p.id}
                    className="p-1.5 rounded-lg hover:bg-red-50
                               text-gray-300 hover:text-red-500
                               transition-colors opacity-0 group-hover:opacity-100">
                    {deleting === p.id
                      ? <span className="w-4 h-4 border-2 border-red-400
                                         border-t-transparent rounded-full
                                         animate-spin block" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientList