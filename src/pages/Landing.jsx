// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Landing / Login Page
// ─────────────────────────────────────────────
import { useState } from 'react'
import DoctorLogin  from '../components/auth/DoctorLogin'
import PatientLogin from '../components/auth/PatientLogin'

const Landing = () => {
  const [mode, setMode] = useState('doctor') // 'doctor' | 'patient'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT PANEL — Branding ── */}
      <div className="lg:w-1/2 bg-gradient-to-br from-teal-900 via-teal-800
                      to-teal-700 flex flex-col justify-between p-10 lg:p-16
                      relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full
                        bg-white opacity-5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full
                        bg-teal-500 opacity-10 translate-y-1/3 -translate-x-1/3" />

        {/* Logo + Title */}
        <div className="relative z-10">
          <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center
                          justify-center text-3xl shadow-teal mb-6">
            🌿
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl text-white
                         font-medium leading-tight mb-3">
            RhinoGuide
          </h1>
          <p className="text-teal-300 text-lg font-medium mb-1">
            by Manish
          </p>
          <p className="text-teal-400 text-sm leading-relaxed max-w-sm mt-4">
            ARIA 2020 · Allergic Rhinitis Clinical Assistant
            for the Indian OPD. Guideline-based recommendations,
            patient trigger tracking &amp; seamless care coordination.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4 my-10 lg:my-0">
          {[
            { icon: '💊', text: 'ARIA 2020 step-up treatment algorithm' },
            { icon: '📅', text: 'Patient trigger calendar — updated in real time' },
            { icon: '📋', text: 'Full OPD proforma + SNOT-22 scoring' },
            { icon: '📖', text: 'Indian market drug reference' },
            { icon: '🔒', text: 'Secure doctor + patient login' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="text-xl">{f.icon}</span>
              <span className="text-teal-200 text-sm">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Footer copyright */}
        <div className="relative z-10">
          <p className="text-teal-500 text-xs">
            © 2026 RhinoGuide · Developed by Dr. Manish V.
            <br />All rights reserved · ARIA 2020 Guidelines
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login Form ── */}
      <div className="lg:w-1/2 flex items-center justify-center
                      p-8 lg:p-16 bg-cream min-h-screen lg:min-h-0">
        <div className="w-full max-w-md animate-fade-in">

          {/* Role toggle */}
          <div className="flex bg-white border border-gray-200
                          rounded-xl p-1 mb-8 shadow-sm">
            <button
              onClick={() => setMode('doctor')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold
                          transition-all duration-200 flex items-center
                          justify-center gap-2
                          ${mode === 'doctor'
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'text-gray-500 hover:text-teal-700'}`}
            >
              🩺 Doctor Login
            </button>
            <button
              onClick={() => setMode('patient')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold
                          transition-all duration-200 flex items-center
                          justify-center gap-2
                          ${mode === 'patient'
                            ? 'bg-teal-700 text-white shadow-sm'
                            : 'text-gray-500 hover:text-teal-700'}`}
            >
              👤 Patient Login
            </button>
          </div>

          {/* Login form */}
          {mode === 'doctor'
            ? <DoctorLogin />
            : <PatientLogin />
          }
        </div>
      </div>
    </div>
  )
}

export default Landing