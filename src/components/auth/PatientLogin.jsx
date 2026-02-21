// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Patient Login
//  Supports Email + Password OR Mobile OTP
// ─────────────────────────────────────────────
import { useState, useRef } from 'react'
import { useNavigate }      from 'react-router-dom'
import { useAuth }          from '../../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, Phone, LogIn } from 'lucide-react'

const PatientLogin = () => {
  const { patientEmailLogin, sendOTP, verifyOTP, error, setError } = useAuth()
  const navigate = useNavigate()

  const [method,    setMethod]    = useState('email') // 'email' | 'phone'
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [phone,     setPhone]     = useState('')      // e.g. +919876543210
  const [otp,       setOtp]       = useState('')
  const [otpSent,   setOtpSent]   = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState('')

  const recaptchaRef = useRef(null)

  const clearAll = () => {
    setError(''); setSuccess('')
    setEmail(''); setPassword('')
    setPhone(''); setOtp('')
    setOtpSent(false); setConfirmation(null)
  }

  // ── Email login ──
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      await patientEmailLogin(email, password)
      navigate('/patient')
    } catch { /* error shown via context */ }
    finally { setLoading(false) }
  }

  // ── Send OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!phone.startsWith('+')) {
      setError('Please enter phone with country code e.g. +919876543210')
      return
    }
    setLoading(true); setError(''); setSuccess('')
    try {
      const result = await sendOTP(phone, 'recaptcha-container')
      setConfirmation(result)
      setOtpSent(true)
      setSuccess(`OTP sent to ${phone}`)
    } catch { /* error shown via context */ }
    finally { setLoading(false) }
  }

  // ── Verify OTP ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otp.length < 6) { setError('Please enter the 6-digit OTP'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      await verifyOTP(confirmation, otp)
      navigate('/patient')
    } catch { /* error shown via context */ }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl text-gray-900 mb-1">
        Patient Login
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Sign in to update your symptom calendar
      </p>

      {/* Error / Success */}
      {error   && <div className="alert-danger mb-4">⚠️ {error}</div>}
      {success && <div className="alert-success mb-4">✅ {success}</div>}

      {/* Method toggle */}
      <div className="flex bg-white border border-gray-200
                      rounded-xl p-1 mb-6 shadow-sm">
        <button
          onClick={() => { clearAll(); setMethod('email') }}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold
                      transition-all duration-200 flex items-center
                      justify-center gap-1.5
                      ${method === 'email'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-gray-500 hover:text-teal-700'}`}
        >
          <Mail className="w-3.5 h-3.5" /> Email
        </button>
        <button
          onClick={() => { clearAll(); setMethod('phone') }}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold
                      transition-all duration-200 flex items-center
                      justify-center gap-1.5
                      ${method === 'phone'
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'text-gray-500 hover:text-teal-700'}`}
        >
          <Phone className="w-3.5 h-3.5" /> Mobile OTP
        </button>
      </div>

      {/* ── EMAIL LOGIN ── */}
      {method === 'email' && (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 w-4 h-4" />
              <input type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="patient@email.com"
                className="input pl-9" />
            </div>
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 w-4 h-4" />
              <input type={showPw ? 'text' : 'password'} required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="input pl-9 pr-10" />
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
              : <><LogIn className="w-4 h-4" /> Sign In</>
            }
          </button>
        </form>
      )}

      {/* ── PHONE OTP ── */}
      {method === 'phone' && (
        <div className="space-y-4">
          {/* Step 1 — enter phone */}
          {!otpSent && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="label">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2
                                   text-gray-400 w-4 h-4" />
                  <input type="tel" required
                    value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="input pl-9" />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Include country code e.g. +91 for India
                </p>
              </div>

              {/* Invisible reCAPTCHA container */}
              <div id="recaptcha-container" ref={recaptchaRef} />

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent
                                     rounded-full animate-spin" />
                  : <><Phone className="w-4 h-4" /> Send OTP</>
                }
              </button>
            </form>
          )}

          {/* Step 2 — enter OTP */}
          {otpSent && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="alert-info">
                📱 OTP sent to <strong>{phone}</strong>
              </div>
              <div>
                <label className="label">Enter 6-digit OTP</label>
                <input type="number" required
                  value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="input text-center text-2xl tracking-widest
                             font-mono" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent
                                     rounded-full animate-spin" />
                  : <><LogIn className="w-4 h-4" /> Verify &amp; Sign In</>
                }
              </button>
              <button type="button"
                onClick={() => { clearAll() }}
                className="btn-ghost w-full justify-center text-xs">
                ← Change number
              </button>
            </form>
          )}
        </div>
      )}

      {/* Info note */}
      <div className="mt-6 p-3 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-xs text-teal-700 text-center">
          🏥 Don't have an account yet?
          <br />
          <span className="font-semibold">
            Ask your doctor at your next OPD visit — they will register you.
          </span>
        </p>
      </div>
    </div>
  )
}

export default PatientLogin