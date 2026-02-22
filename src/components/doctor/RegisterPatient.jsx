// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Register New Patient
// ─────────────────────────────────────────────
import { useState }        from 'react'
import { useNavigate }     from 'react-router-dom'
import { useAuth }         from '../../context/AuthContext'
import { registerPatient } from '../../firebase/firestore'
import { UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react'

const Field = ({ label, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
  </div>
)

const RegisterPatient = () => {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState('')
  const [success, setSuccess]   = useState('')

  const [form, setForm] = useState({
    name: '', age: '', gender: '', phone: '', email: '',
    dob: '', address: '', habitat: '', occupation: '',
    ariaClass: '', snot22Score: '', notes: '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ── Validation ──
    if (!form.name.trim()) {
      setError('Patient name is required.')
      return
    }
    if (!form.age || isNaN(form.age)) {
      setError('Valid age is required.')
      return
    }
    if (!user) {
      setError('You are not logged in. Please refresh and try again.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('Registering patient for doctor:', user.uid)

      const patientData = {
        name:        form.name.trim(),
        age:         parseInt(form.age),
        gender:      form.gender      || '',
        phone:       form.phone.trim() || '',
        email:       form.email.trim() || '',
        dob:         form.dob         || '',
        address:     form.address.trim() || '',
        habitat:     form.habitat     || '',
        occupation:  form.occupation  || '',
        ariaClass:   form.ariaClass   || '',
        snot22Score: form.snot22Score ? parseInt(form.snot22Score) : null,
        notes:       form.notes.trim() || '',
        uid:         null,   // linked when patient signs up
      }

      console.log('Patient data:', patientData)

      const id = await registerPatient(user.uid, patientData)

      console.log('Patient registered with ID:', id)

      setSuccess(`Patient "${form.name}" registered successfully!`)

      // Reset form
      setForm({
        name: '', age: '', gender: '', phone: '', email: '',
        dob: '', address: '', habitat: '', occupation: '',
        ariaClass: '', snot22Score: '', notes: '',
      })

      // Navigate to patient detail after 1.5s
      setTimeout(() => navigate(`/doctor/patients/${id}`), 1500)

    } catch (err) {
      console.error('Registration error:', err)

      // Specific error messages
      if (err.code === 'permission-denied') {
        setError('Permission denied. Check Firestore rules — make sure your doctor account has write access.')
      } else if (err.code === 'unavailable') {
        setError('Firestore unavailable. Check your internet connection.')
      } else if (err.code === 'unauthenticated') {
        setError('Session expired. Please log out and log in again.')
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/doctor/patients')}
          className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-serif text-xl text-gray-900">
            Register New Patient
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill in details · Patient can then log in with their email / phone
          </p>
        </div>
      </div>

      {/* Doctor UID debug info — remove after testing */}
      {user && (
        <div className="alert-info text-xs">
          🔐 Logged in as Doctor UID: <code className="font-mono">{user.uid}</code>
        </div>
      )}

      {error   && (
        <div className="alert-danger">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="alert-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-serif text-base text-teal-700 border-b
                         border-gray-100 pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name *">
              <input type="text" required
                value={form.name} onChange={set('name')}
                placeholder="Patient full name" className="input" />
            </Field>
            <Field label="Age (years) *">
              <input type="number" required min="1" max="120"
                value={form.age} onChange={set('age')}
                placeholder="e.g. 34" className="input" />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={set('gender')}
                className="input">
                <option value="">—</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Date of Birth">
              <input type="date" value={form.dob} onChange={set('dob')}
                className="input" />
            </Field>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-5 space-y-4">
          <h3 className="font-serif text-base text-teal-700 border-b
                         border-gray-100 pb-2">
            Contact &amp; Login Details
          </h3>
          <div className="alert-info text-xs">
            📱 The patient will use their <strong>email or mobile number</strong>{' '}
            below to log in and update their trigger calendar.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Mobile Number">
              <input type="tel"
                value={form.phone} onChange={set('phone')}
                placeholder="+919876543210" className="input" />
            </Field>
            <Field label="Email Address">
              <input type="email"
                value={form.email} onChange={set('email')}
                placeholder="patient@email.com" className="input" />
            </Field>
          </div>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h3 className="font-serif text-base text-teal-700 border-b
                         border-gray-100 pb-2">
            Location &amp; Occupation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address / District">
              <input type="text"
                value={form.address} onChange={set('address')}
                placeholder="District, State" className="input" />
            </Field>
            <Field label="Habitat">
              <select value={form.habitat} onChange={set('habitat')}
                className="input">
                <option value="">—</option>
                <option>Urban</option>
                <option>Semi-urban</option>
                <option>Rural</option>
              </select>
            </Field>
            <Field label="Occupation">
              <select value={form.occupation} onChange={set('occupation')}
                className="input">
                <option value="">—</option>
                <option>Agriculture / Farming</option>
                <option>Construction / Labour</option>
                <option>Textile / Garment</option>
                <option>Flour / Grain Mill</option>
                <option>Healthcare worker</option>
                <option>Teacher / Office</option>
                <option>Homemaker</option>
                <option>Student</option>
                <option>Driver / Transport</option>
                <option>Animal husbandry</option>
                <option>Others</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Clinical summary */}
        <div className="card p-5 space-y-4">
          <h3 className="font-serif text-base text-teal-700 border-b
                         border-gray-100 pb-2">
            Initial Clinical Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ARIA Classification">
              <select value={form.ariaClass} onChange={set('ariaClass')}
                className="input">
                <option value="">— Not yet classified</option>
                <option>🟢 Mild Intermittent AR</option>
                <option>🟠 Moderate–Severe Intermittent AR</option>
                <option>🔵 Mild Persistent AR</option>
                <option>🔴 Moderate–Severe Persistent AR</option>
              </select>
            </Field>
            <Field label="SNOT-22 Score (if done)">
              <input type="number" min="0" max="110"
                value={form.snot22Score} onChange={set('snot22Score')}
                placeholder="0–110" className="input" />
            </Field>
          </div>
          <Field label="Clinical Notes">
            <textarea
              value={form.notes} onChange={set('notes')}
              placeholder="Key findings, triggers identified, initial treatment..."
              rows={3} className="input" />
          </Field>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-6">
          <button type="button"
            onClick={() => navigate('/doctor/patients')}
            className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading || !user}
            className="btn-primary">
            {loading
              ? <span className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin" />
              : <><UserPlus className="w-4 h-4" /> Register Patient</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}

export default RegisterPatient