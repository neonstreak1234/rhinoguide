// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Firestore Helpers
//  All database read/write functions live here
// ─────────────────────────────────────────────
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs, query,
  where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

// ══════════════════════════════════════════════
//  USER PROFILE
// ══════════════════════════════════════════════

// Create user profile after registration
export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

// Get user profile (role, name etc.)
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// ══════════════════════════════════════════════
//  DOCTOR
// ══════════════════════════════════════════════

// Get doctor profile
export const getDoctorProfile = async (doctorId) => {
  const snap = await getDoc(doc(db, 'doctors', doctorId))
  return snap.exists() ? snap.data() : null
}

// Update doctor profile
export const updateDoctorProfile = async (doctorId, data) => {
  await setDoc(doc(db, 'doctors', doctorId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

// ══════════════════════════════════════════════
//  PATIENTS — Doctor side
// ══════════════════════════════════════════════

// Register a new patient (called by doctor)
export const registerPatient = async (doctorId, patientData) => {
  const ref = await addDoc(collection(db, 'patients'), {
    ...patientData,
    assignedDoctorId: doctorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

// Get all patients assigned to a doctor
export const getDoctorPatients = async (doctorId) => {
  const q = query(
    collection(db, 'patients'),
    where('assignedDoctorId', '==', doctorId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Get single patient by ID
export const getPatient = async (patientId) => {
  const snap = await getDoc(doc(db, 'patients', patientId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// Update patient proforma / details
export const updatePatient = async (patientId, data) => {
  await updateDoc(doc(db, 'patients', patientId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// Delete patient record
export const deletePatient = async (patientId) => {
  await deleteDoc(doc(db, 'patients', patientId))
}

// Link patient UID to their patient record (after patient signs up)
export const linkPatientUID = async (patientId, uid) => {
  await updateDoc(doc(db, 'patients', patientId), {
    uid,
    updatedAt: serverTimestamp(),
  })
}

// Get patient record by their auth UID
export const getPatientByUID = async (uid) => {
  const q = query(
    collection(db, 'patients'),
    where('uid', '==', uid)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

// ══════════════════════════════════════════════
//  PROFORMA — Doctor fills, stored per patient
// ══════════════════════════════════════════════

// Save / update full proforma
export const saveProforma = async (patientId, proforma) => {
  await setDoc(
    doc(db, 'patients', patientId, 'proforma', 'main'),
    { ...proforma, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

// Get proforma for a patient
export const getProforma = async (patientId) => {
  const snap = await getDoc(doc(db, 'patients', patientId, 'proforma', 'main'))
  return snap.exists() ? snap.data() : null
}

// ══════════════════════════════════════════════
//  SNOT-22 — Stored per patient per visit
// ══════════════════════════════════════════════

// Save SNOT-22 score
export const saveSNOT22 = async (patientId, scores) => {
  await addDoc(collection(db, 'patients', patientId, 'snot22'), {
    scores,
    total: scores.reduce((a, b) => a + b, 0),
    recordedAt: serverTimestamp(),
  })
}

// Get SNOT-22 history for a patient
export const getSNOT22History = async (patientId) => {
  const q = query(
    collection(db, 'patients', patientId, 'snot22'),
    orderBy('recordedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ══════════════════════════════════════════════
//  TRIGGER CALENDAR — Patient updates, Doctor views
// ══════════════════════════════════════════════

// Save or update a calendar entry for a date (YYYY-MM-DD)
export const saveCalendarEntry = async (patientId, date, entry) => {
  await setDoc(
    doc(db, 'patients', patientId, 'calendarEntries', date),
    { ...entry, updatedAt: serverTimestamp() },
    { merge: true }
  )
}

// Get a single calendar entry
export const getCalendarEntry = async (patientId, date) => {
  const snap = await getDoc(
    doc(db, 'patients', patientId, 'calendarEntries', date)
  )
  return snap.exists() ? snap.data() : null
}

// Get all calendar entries for a patient
export const getAllCalendarEntries = async (patientId) => {
  const snap = await getDocs(
    collection(db, 'patients', patientId, 'calendarEntries')
  )
  const entries = {}
  snap.docs.forEach(d => { entries[d.id] = d.data() })
  return entries
}

// Delete a calendar entry
export const deleteCalendarEntry = async (patientId, date) => {
  await deleteDoc(
    doc(db, 'patients', patientId, 'calendarEntries', date)
  )
}