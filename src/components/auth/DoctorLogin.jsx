// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Doctor Login
// ─────────────────────────────────────────────
import { useState }       from 'react'
import { useNavigate }    from 'react-router-dom'
import { useAuth }        from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus } from 'lucide-react'

const DoctorLogin = () => {
  const { doctorLogin, registerDoctor, resetPassword, error, setError } = useAuth()
  const navigate = useNavigate()

  const [tab,      setTab]      = useState('login')   // 'login' | 'register' | 'reset'
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [qual,     setQual]     = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState('')

  const clearAll = () => {
    setError(''); setSuccess('')
    setEmail(''); setPassword('')
    setName(''); setQual('')
  }

  // ── Login ──
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      await doctorLogin(email, password)
      navigate('/doctor')
    } catch { /* error shown via context */ }
    finally { setLoading(false) }
  }

  // ── Register ──
  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !qual) { setError('Please fill in all fields.'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      await registerDoctor(email, password, name, qual)
      navigate('/doctor')
    } catch { /* error shown via context */ }
    finally { setLoading(false) }
  }

  // ── Password Reset ──
  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      await resetPassword(email)
      setSuccess('Password reset email sent. Check your inbox.')
    } catch { /* error shown via context */ }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl text-gray-900 mb-1">
        {tab === 'login'    && 'Welcome back, Doctor'}
        {tab === 'register' && 'Create Doctor Account'}
        {tab === 'reset'    && 'Reset Password'}
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        {tab === 'login'    && 'Sign in to access your OPD dashboard'}
        {tab === 'register' && 'Register your RhinoGuide doctor account'}
        {tab === 'reset'    && 'We\'ll send a reset link to your email'}
      </p>

      {/* Error / Success */}
      {error   && <div className="alert-danger mb-4">⚠️ {error}</div>}
      {success && <div className="alert-success mb-4">✅ {success}</div>}

      {/* ── LOGIN FORM ── */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 w-4 h-4" />
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="doctor@hospital.com"
                className="input pl-9"
              />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 w-4 h-4" />
              <input
                type={showPw ? 'text' : 'password'} required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-9 pr-10"
              />
              <button type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-teal-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button"
              onClick={() => { clearAll(); setTab('reset') }}
              className="text-xs text-teal-600 hover:underline">
              Forgot password?
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-3">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent
                                 rounded-full animate-spin" />
              : <><LogIn className="w-4 h-4" /> Sign In</>
            }
          </button>
        </form>
      )}

      {/* ── REGISTER FORM ── */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" required
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Dr. Manish V." className="input" />
          </div>
          <div>
            <label className="label">Qualifications</label>
            <input type="text" required
              value={qual} onChange={e => setQual(e.target.value)}
              placeholder="MBBS, MD, DLO..." className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 w-4 h-4" />
              <input type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="doctor@hospital.com" className="input pl-9" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 w-4 h-4" />
              <input type={showPw ? 'text' : 'password'} required
                minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters" className="input pl-9 pr-10" />
              <button type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-teal-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-3">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent
                                 rounded-full animate-spin" />
              : <><UserPlus className="w-4 h-4" /> Create Account</>
            }
          </button>
        </form>
      )}

      {/* ── RESET FORM ── */}
      {tab === 'reset' && (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 w-4 h-4" />
              <input type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="doctor@hospital.com" className="input pl-9" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-3">
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent
                                 rounded-full animate-spin" />
              : 'Send Reset Email'
            }
          </button>
        </form>
      )}

      {/* ── Tab switcher ── */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {tab === 'login' && (
          <>
            New doctor?{' '}
            <button onClick={() => { clearAll(); setTab('register') }}
              className="text-teal-600 font-semibold hover:underline">
              Create account
            </button>
          </>
        )}
        {(tab === 'register' || tab === 'reset') && (
          <>
            Already registered?{' '}
            <button onClick={() => { clearAll(); setTab('login') }}
              className="text-teal-600 font-semibold hover:underline">
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default DoctorLogin