// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Auth Context
//  Manages login state for Doctor + Patient
// ─────────────────────────────────────────────
import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { createUserProfile, getUserProfile } from '../firebase/firestore'

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export const AuthProvider = ({ children }) => {
  const [user,        setUser]        = useState(null)   // Firebase user object
  const [userProfile, setUserProfile] = useState(null)   // Firestore profile { role, name... }
  const [loading,     setLoading]     = useState(true)   // Auth state loading
  const [error,       setError]       = useState('')

  // ── Listen to Firebase auth state changes ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const profile = await getUserProfile(firebaseUser.uid)
        setUserProfile(profile)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Doctor: Email + Password Login ──
  const doctorLogin = async (email, password) => {
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getUserProfile(cred.user.uid)
      if (profile?.role !== 'doctor') {
        await signOut(auth)
        throw new Error('Access denied. Not a doctor account.')
      }
      return cred.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // ── Doctor: Register new doctor account ──
  const registerDoctor = async (email, password, name, qualification) => {
    setError('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await createUserProfile(cred.user.uid, {
        role:          'doctor',
        name,
        qualification,
        email,
      })
      return cred.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // ── Patient: Email + Password Login ──
  const patientEmailLogin = async (email, password) => {
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const profile = await getUserProfile(cred.user.uid)
      if (profile?.role !== 'patient') {
        await signOut(auth)
        throw new Error('Access denied. Not a patient account.')
      }
      return cred.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // ── Patient: Phone OTP — Step 1 send OTP ──
  const sendOTP = async (phoneNumber, recaptchaContainerId) => {
    setError('')
    try {
      // Create invisible reCAPTCHA
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
      })
      const confirmationResult = await signInWithPhoneNumber(
        auth, phoneNumber, verifier
      )
      return confirmationResult   // caller stores this, then calls verifyOTP
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // ── Patient: Phone OTP — Step 2 verify OTP ──
  const verifyOTP = async (confirmationResult, otp) => {
    setError('')
    try {
      const cred = await confirmationResult.confirm(otp)
      // Check if profile exists; if not, it's a new phone login
      const profile = await getUserProfile(cred.user.uid)
      if (!profile) {
        // Create a basic patient profile on first OTP login
        await createUserProfile(cred.user.uid, {
          role:  'patient',
          phone: cred.user.phoneNumber,
          email: '',
        })
      }
      return cred.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // ── Password Reset ──
  const resetPassword = async (email) => {
    setError('')
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // ── Logout ──
  const logout = async () => {
    setError('')
    await signOut(auth)
  }

  // ── Helpers ──
  const isDoctor  = userProfile?.role === 'doctor'
  const isPatient = userProfile?.role === 'patient'

  const value = {
    user,
    userProfile,
    loading,
    error,
    setError,
    isDoctor,
    isPatient,
    doctorLogin,
    registerDoctor,
    patientEmailLogin,
    sendOTP,
    verifyOTP,
    resetPassword,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}