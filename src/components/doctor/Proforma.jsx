// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Full OPD Proforma
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useParams }           from 'react-router-dom'
import { getPatient, saveProforma, getProforma }
  from '../../firebase/firestore'
import { Save, CheckCircle2, ChevronDown, ChevronUp, Printer }
  from 'lucide-react'

// ── Chip toggle component ──
const Chip = ({ label, selected, onToggle }) => (
  <button type="button" onClick={onToggle}
    className={`inline-flex items-center px-3 py-1.5 rounded-full border
                text-xs font-medium transition-all duration-150
                ${selected
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
    {selected && <span className="mr-1 text-teal-600">✓</span>}
    {label}
  </button>
)

// ── Collapsible section ──
const Section = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5
                   bg-gray-50 hover:bg-gray-100 transition-colors border-b
                   border-gray-100 text-left">
        <span className="text-lg">{icon}</span>
        <span className="font-serif text-base text-gray-800 flex-1">
          {title}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />
        }
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  )
}

// ── Field ──
const F = ({ label, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
  </div>
)

// ── Chip group ──
const ChipGroup = ({ items, selected, onToggle }) => (
  <div className="flex flex-wrap gap-2 mt-1">
    {items.map(item => (
      <Chip key={item} label={item}
        selected={selected.includes(item)}
        onToggle={() => onToggle(item)} />
    ))}
  </div>
)

const NASAL_SX = [
  'Sneezing','Nasal congestion / blockage','Watery rhinorrhoea',
  'Thick/mucoid discharge','Nasal itching / pruritus','Post-nasal drip',
  'Anosmia / hyposmia','Nasal bleeding / epistaxis','Crusting',
]
const OCULAR_SX = [
  'Eye itching','Watering eyes','Red eyes','Eye swelling / periorbital oedema','Photophobia',
]
const SYSTEMIC_SX = [
  'Headache / facial pain','Ear fullness / pain','Cough',
  'Wheeze / breathlessness','Palatal itching','Throat itching',
  'Sleep disturbance','Snoring / mouth breathing',
  'Fatigue / daytime somnolence','School / work impairment',
  'Skin rash / urticaria',
]
const INDOOR_ALLERGENS = [
  'House dust mites (HDM)','Cockroach (Periplaneta / Blatella)',
  'Rat / mouse dander','Dog dander','Cat dander',
  'Cow / buffalo dander','Goat / sheep dander',
  'Feather (pillow / bedding)','Mold spores (Aspergillus, Cladosporium)',
  'Kapok fibre (mattress / pillow)','Stored grain weevil / grain dust',
]
const POLLEN_ALLERGENS = [
  'Parthenium (Congress grass) ★','Prosopis juliflora (Vilayati babool) ★',
  'Cassia spp. (Senna / Amaltas)','Amaranthus (Chaulai)',
  'Cannabis sativa (Bhang)','Ricinus communis (Castor)',
  'Sorghum / Jowar','Wheat / paddy / rice',
  'Cynodon (Doob grass) ★','Chenopodium (Bathua)',
  'Eucalyptus','Acacia / Babool','Casuarina (South India)',
  'Mango (spring)',
]
const IRRITANTS = [
  'Agarbatti / incense smoke ★','Dhoop / Camphor fumes ★',
  'Biomass smoke / chulha ★','Tobacco smoke — active ★',
  'Tobacco smoke — passive ★','Bidi / hookah smoke',
  'Mosquito coil / liquidator','Strong perfumes / attar',
  'Phenyl / cleaning agents','Paint / varnish fumes',
  'Construction dust / cement','Outdoor air pollution ★',
  'Cold air / sudden temperature change ★','Exercise-induced',
]
const COMORBIDITIES = [
  'Bronchial asthma','Atopic dermatitis / eczema','Allergic conjunctivitis',
  'Food allergy','Urticaria / angioedema','Drug allergy','Anaphylaxis history',
  'Chronic sinusitis / CRS','Nasal polyps','DNS',
  'Otitis media / OME','Adenoid hypertrophy','OSA',
  'Samter\'s triad (NSAID sensitivity)','Diabetes mellitus ★',
  'Hypertension ★','Hypothyroidism ★','GERD / acid reflux',
  'Pregnancy','Anxiety / depression',
]
const EXAM_FACE = [
  'Allergic shiners','Allergic salute / nasal crease','Mouth breathing',
  'Dennie–Morgan lines','Facial oedema','High arched palate',
  'Adenoidal facies','Conjunctival injection / chemosis',
]
const ADVICE = [
  'INCS spray technique demonstrated','Allergen avoidance counselled',
  'Saline irrigation instructed','Disease chronicity explained',
  'Regular INCS compliance explained','Tobacco cessation advised',
  'Biomass smoke avoidance','AIT discussed',
  'Asthma screen performed','Red flags explained',
  'Written instructions given',
]

const EMPTY = {
  nasalSx: [], ocularSx: [], systemicSx: [],
  indoorAllergens: [], pollenAllergens: [], irritants: [],
  comorbidities: [], examFace: [], advice: [],
  onset: '', onsetAge: '', freqWk: '', freqYr: '',
  pattern: '', timing: '', season: '', geo: '',
  bp: '', pulse: '', spo2: '', temp: '',
  mucosa: '', turbinates: '', discharge: '', polyps: '', dns: '',
  pns: '', chest: '', pefr: '', spirometry: '',
  ige: '', aec: '', eos: '', hb: '', sige: '',
  spt: '', sptDetail: '', cytology: '', feno: '',
  xray: '', ct: '', mri: '',
  famHistory: '', drugs: '', nsaid: '', prevRx: '', surg: '',
  smoking: '', packYrs: '', gutka: '', biomass: '', passive: '',
  drName: '', drQual: '', drReg: '',
  ariaClass: '', ait: '', referral: '',
  instructions: '', followup: '', notes: '',
}

const Proforma = () => {
  const { id }      = useParams()
  const [patient,   setPatient]  = useState(null)
  const [form,      setForm]     = useState(EMPTY)
  const [loading,   setLoading]  = useState(!!id)
  const [saving,    setSaving]   = useState(false)
  const [saved,     setSaved]    = useState(false)

  useEffect(() => {
    if (!id) return
    const init = async () => {
      const [p, pf] = await Promise.all([
        getPatient(id), getProforma(id)
      ])
      setPatient(p)
      if (pf) setForm(f => ({ ...f, ...pf }))
      setLoading(false)
    }
    init()
  }, [id])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleChip = (key, val) =>
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val)
        ? f[key].filter(v => v !== val)
        : [...f[key], val],
    }))

  const handleSave = async () => {
    if (!id) return
    setSaving(true)
    try {
      await saveProforma(id, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-serif text-xl text-gray-900">
            Full OPD Proforma
          </h2>
          {patient && (
            <p className="text-xs text-gray-500 mt-0.5">
              Patient: <span className="font-semibold">{patient.name}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="btn-secondary no-print">
            <Printer className="w-4 h-4" /> Print
          </button>
          {id && (
            <button onClick={handleSave} disabled={saving}
              className="btn-primary no-print">
              {saving
                ? <span className="w-4 h-4 border-2 border-white
                                   border-t-transparent rounded-full animate-spin" />
                : <><Save className="w-4 h-4" /> Save</>
              }
            </button>
          )}
        </div>
      </div>

      {saved && (
        <div className="alert-success flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Proforma saved successfully
        </div>
      )}

      {/* ── SYMPTOMS ── */}
      <Section icon="🤧" title="Chief Complaints & Symptoms" defaultOpen>
        <div className="space-y-4">
          <div>
            <p className="label mb-1">Nasal Symptoms</p>
            <ChipGroup items={NASAL_SX} selected={form.nasalSx}
              onToggle={v => toggleChip('nasalSx', v)} />
          </div>
          <div>
            <p className="label mb-1">Ocular Symptoms</p>
            <ChipGroup items={OCULAR_SX} selected={form.ocularSx}
              onToggle={v => toggleChip('ocularSx', v)} />
          </div>
          <div>
            <p className="label mb-1">Systemic / Other</p>
            <ChipGroup items={SYSTEMIC_SX} selected={form.systemicSx}
              onToggle={v => toggleChip('systemicSx', v)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2
                          border-t border-gray-100">
            <F label="Symptom Onset">
              <input className="input" value={form.onset} onChange={set('onset')}
                placeholder="e.g. 3 months, 2 years" />
            </F>
            <F label="Age of Onset">
              <input className="input" value={form.onsetAge} onChange={set('onsetAge')}
                placeholder="e.g. childhood, 12 yrs" />
            </F>
            <F label="Frequency / Week">
              <select className="input" value={form.freqWk} onChange={set('freqWk')}>
                <option value="">—</option>
                <option value="le4">≤4 days/week</option>
                <option value="gt4">&gt;4 days/week</option>
              </select>
            </F>
            <F label="Weeks / Year">
              <select className="input" value={form.freqYr} onChange={set('freqYr')}>
                <option value="">—</option>
                <option value="le4">≤4 weeks/year</option>
                <option value="gt4">&gt;4 weeks/year</option>
              </select>
            </F>
            <F label="Pattern">
              <select className="input" value={form.pattern} onChange={set('pattern')}>
                <option value="">—</option>
                <option>Seasonal only</option>
                <option>Perennial only</option>
                <option>Seasonal exacerbation on perennial base</option>
              </select>
            </F>
            <F label="Timing">
              <select className="input" value={form.timing} onChange={set('timing')}>
                <option value="">—</option>
                <option>Morning predominant</option>
                <option>Night predominant</option>
                <option>Throughout day</option>
                <option>On exposure</option>
              </select>
            </F>
            <F label="Seasonal Peak">
              <input className="input" value={form.season} onChange={set('season')}
                placeholder="e.g. Feb–May, Oct–Nov" />
            </F>
            <F label="Geographic Variation">
              <input className="input" value={form.geo} onChange={set('geo')}
                placeholder="Worse at home / office / native?" />
            </F>
          </div>
        </div>
      </Section>

      {/* ── ALLERGENS ── */}
      <Section icon="🌾" title="Allergen Exposure & Trigger Factors">
        <div className="space-y-4">
          <div>
            <p className="label mb-1">🏠 Indoor / Household Allergens</p>
            <ChipGroup items={INDOOR_ALLERGENS} selected={form.indoorAllergens}
              onToggle={v => toggleChip('indoorAllergens', v)} />
          </div>
          <div>
            <p className="label mb-1">🌸 Pollens (India-specific)</p>
            <ChipGroup items={POLLEN_ALLERGENS} selected={form.pollenAllergens}
              onToggle={v => toggleChip('pollenAllergens', v)} />
          </div>
          <div>
            <p className="label mb-1">🔥 Irritants & Indoor Air Pollutants</p>
            <ChipGroup items={IRRITANTS} selected={form.irritants}
              onToggle={v => toggleChip('irritants', v)} />
          </div>
        </div>
      </Section>

      {/* ── HISTORY ── */}
      <Section icon="📋" title="Past History & Comorbidities">
        <div className="space-y-4">
          <div>
            <p className="label mb-1">Comorbidities</p>
            <ChipGroup items={COMORBIDITIES} selected={form.comorbidities}
              onToggle={v => toggleChip('comorbidities', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2
                          border-t border-gray-100">
            <F label="Family History of Allergy">
              <select className="input" value={form.famHistory}
                onChange={set('famHistory')}>
                <option value="">—</option>
                <option>Yes – AR/rhinitis</option><option>Yes – Asthma</option>
                <option>Yes – Eczema</option><option>Yes – Multiple atopy</option>
                <option>No</option><option>Unknown</option>
              </select>
            </F>
            <F label="Current Medications">
              <input className="input" value={form.drugs} onChange={set('drugs')}
                placeholder="e.g. Metformin, Amlodipine" />
            </F>
            <F label="NSAID / Aspirin Sensitivity">
              <select className="input" value={form.nsaid} onChange={set('nsaid')}>
                <option value="">—</option>
                <option>Yes — rhinorrhoea on NSAID</option>
                <option>Yes — bronchospasm</option>
                <option>No</option><option>Not tested</option>
              </select>
            </F>
            <F label="Previous AR Treatment">
              <input className="input" value={form.prevRx} onChange={set('prevRx')}
                placeholder="e.g. Levocet, Flomist — response?" />
            </F>
            <F label="Surgical History (ENT)">
              <input className="input" value={form.surg} onChange={set('surg')}
                placeholder="e.g. FESS, septoplasty, tonsillectomy" />
            </F>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2
                          border-t border-gray-100">
            <F label="Smoking Status">
              <select className="input" value={form.smoking} onChange={set('smoking')}>
                <option value="">—</option>
                <option>Never smoker</option><option>Current — cigarette</option>
                <option>Current — bidi</option><option>Current — hookah</option>
                <option>Ex-smoker</option>
              </select>
            </F>
            <F label="Pack-Years">
              <input className="input" value={form.packYrs} onChange={set('packYrs')} />
            </F>
            <F label="Smokeless Tobacco">
              <select className="input" value={form.gutka} onChange={set('gutka')}>
                <option value="">—</option>
                <option>Yes</option><option>No</option>
              </select>
            </F>
            <F label="Indoor Biomass Fuel">
              <select className="input" value={form.biomass} onChange={set('biomass')}>
                <option value="">—</option>
                <option>Chulha — wood / cowdung</option>
                <option>Kerosene stove</option><option>LPG only</option>
              </select>
            </F>
            <F label="Passive Smoke Exposure">
              <select className="input" value={form.passive} onChange={set('passive')}>
                <option value="">—</option>
                <option>Heavy (daily)</option>
                <option>Occasional</option><option>None</option>
              </select>
            </F>
          </div>
        </div>
      </Section>

      {/* ── EXAMINATION ── */}
      <Section icon="🔍" title="Clinical Examination">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <F label="BP (mmHg)">
              <input className="input" value={form.bp} onChange={set('bp')} placeholder="122/78" />
            </F>
            <F label="Pulse (bpm)">
              <input className="input" value={form.pulse} onChange={set('pulse')} />
            </F>
            <F label="SpO₂ (%)">
              <input className="input" value={form.spo2} onChange={set('spo2')} />
            </F>
            <F label="Temp (°F)">
              <input className="input" value={form.temp} onChange={set('temp')} />
            </F>
          </div>
          <div>
            <p className="label mb-1">Facial / External Features</p>
            <ChipGroup items={EXAM_FACE} selected={form.examFace}
              onToggle={v => toggleChip('examFace', v)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <F label="Nasal Mucosa">
              <select className="input" value={form.mucosa} onChange={set('mucosa')}>
                <option value="">—</option>
                <option>Pale / bluish (classic AR)</option>
                <option>Erythematous / congested</option>
                <option>Normal pink</option><option>Atrophic / dry</option>
              </select>
            </F>
            <F label="Inferior Turbinates">
              <select className="input" value={form.turbinates} onChange={set('turbinates')}>
                <option value="">—</option>
                <option>Hypertrophied — bilateral</option>
                <option>Hypertrophied — unilateral</option>
                <option>Normal</option><option>Atrophied</option>
              </select>
            </F>
            <F label="Nasal Discharge">
              <select className="input" value={form.discharge} onChange={set('discharge')}>
                <option value="">—</option>
                <option>Clear / watery (allergic)</option>
                <option>Mucoid</option>
                <option>Mucopurulent (infective)</option>
                <option>Absent</option>
              </select>
            </F>
            <F label="Nasal Polyps">
              <select className="input" value={form.polyps} onChange={set('polyps')}>
                <option value="">—</option>
                <option>Absent</option>
                <option>Grade I — limited to middle meatus</option>
                <option>Grade II — reaching inferior turbinate</option>
                <option>Grade III — total obstruction</option>
              </select>
            </F>
            <F label="DNS">
              <select className="input" value={form.dns} onChange={set('dns')}>
                <option value="">—</option>
                <option>Absent</option>
                <option>Left deviation</option>
                <option>Right deviation</option>
                <option>S-shaped</option>
              </select>
            </F>
            <F label="Chest Auscultation">
              <select className="input" value={form.chest} onChange={set('chest')}>
                <option value="">—</option>
                <option>Normal vesicular</option>
                <option>Wheeze / rhonchi</option>
                <option>Prolonged expiration</option>
                <option>Crackles</option><option>Silent chest</option>
              </select>
            </F>
          </div>
        </div>
      </Section>

      {/* ── INVESTIGATIONS ── */}
      <Section icon="🧪" title="Investigations">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <F label="Total IgE (IU/mL)">
            <input className="input" value={form.ige} onChange={set('ige')} placeholder="Normal <100" />
          </F>
          <F label="AEC (/μL)">
            <input className="input" value={form.aec} onChange={set('aec')} placeholder="Normal <500" />
          </F>
          <F label="Eosinophil %">
            <input className="input" value={form.eos} onChange={set('eos')} placeholder="Normal <6%" />
          </F>
          <F label="Hb (g/dL)">
            <input className="input" value={form.hb} onChange={set('hb')} />
          </F>
          <F label="SPT Result">
            <select className="input" value={form.spt} onChange={set('spt')}>
              <option value="">—</option>
              <option>Positive — HDM</option>
              <option>Positive — Cockroach</option>
              <option>Positive — Parthenium</option>
              <option>Positive — Prosopis juliflora</option>
              <option>Positive — Cynodon grass</option>
              <option>Positive — Pet dander</option>
              <option>Multiple positives</option>
              <option>Negative</option><option>Not done</option>
            </select>
          </F>
          <F label="SPT Wheal Size Details">
            <input className="input" value={form.sptDetail} onChange={set('sptDetail')}
              placeholder="e.g. HDM: 6mm, Parthenium: 8mm" />
          </F>
          <F label="Nasal Cytology">
            <select className="input" value={form.cytology} onChange={set('cytology')}>
              <option value="">—</option>
              <option>Eosinophilia (NARES / AR)</option>
              <option>Neutrophilia (infective)</option>
              <option>Normal / non-diagnostic</option>
              <option>Not done</option>
            </select>
          </F>
          <F label="X-Ray PNS">
            <select className="input" value={form.xray} onChange={set('xray')}>
              <option value="">—</option>
              <option>Normal</option>
              <option>Mucosal thickening — maxillary</option>
              <option>Mucosal thickening — bilateral</option>
              <option>Air-fluid level</option>
              <option>Opacification</option>
              <option>Not done</option>
            </select>
          </F>
          <F label="CT PNS (Lund-Mackay)">
            <select className="input" value={form.ct} onChange={set('ct')}>
              <option value="">—</option>
              <option>Normal (score 0–3)</option>
              <option>Mild (score 4–8)</option>
              <option>Severe (score &gt;8)</option>
              <option>Polyps visible</option>
              <option>Not done</option>
            </select>
          </F>
        </div>
      </Section>

      {/* ── PLAN ── */}
      <Section icon="✍️" title="Doctor Details & Treatment Plan">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <F label="Doctor Name">
              <input className="input" value={form.drName} onChange={set('drName')}
                placeholder="Dr. " />
            </F>
            <F label="Qualifications">
              <input className="input" value={form.drQual} onChange={set('drQual')}
                placeholder="MBBS, MD, DLO…" />
            </F>
            <F label="Reg. No.">
              <input className="input" value={form.drReg} onChange={set('drReg')} />
            </F>
          </div>
          <div>
            <p className="label mb-1">Patient Advice Checklist</p>
            <ChipGroup items={ADVICE} selected={form.advice}
              onToggle={v => toggleChip('advice', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <F label="ARIA Classification">
              <select className="input" value={form.ariaClass} onChange={set('ariaClass')}>
                <option value="">—</option>
                <option>🟢 Mild Intermittent AR</option>
                <option>🟠 Moderate–Severe Intermittent AR</option>
                <option>🔵 Mild Persistent AR</option>
                <option>🔴 Moderate–Severe Persistent AR</option>
              </select>
            </F>
            <F label="Referral To">
              <select className="input" value={form.referral} onChange={set('referral')}>
                <option value="">—</option>
                <option>ENT</option><option>Pulmonologist</option>
                <option>Allergist / Immunologist</option>
                <option>Ophthalmologist</option>
                <option>Dermatologist</option>
                <option>No referral</option>
              </select>
            </F>
            <F label="AIT (Immunotherapy)">
              <select className="input" value={form.ait} onChange={set('ait')}>
                <option value="">—</option>
                <option>Recommended — SCIT</option>
                <option>Recommended — SLIT</option>
                <option>Deferred (needs SPT first)</option>
                <option>Not indicated currently</option>
              </select>
            </F>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Special Instructions">
              <textarea rows={3} className="input" value={form.instructions}
                onChange={set('instructions')}
                placeholder="e.g. Use Nasonex at night, tilt head forward; avoid agarbatti…" />
            </F>
            <F label="Follow-up Plan">
              <textarea rows={3} className="input" value={form.followup}
                onChange={set('followup')}
                placeholder="e.g. Review in 4 weeks; SNOT-22 at follow-up…" />
            </F>
          </div>
        </div>
      </Section>

      {/* Save button */}
      {id && (
        <div className="flex justify-end gap-3 pb-6 no-print">
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent
                                 rounded-full animate-spin" />
              : <><Save className="w-4 h-4" /> Save Proforma</>
            }
          </button>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 pb-4">
        © 2026 RhinoGuide · Developed by Dr. Manish V. · All rights reserved
      </p>
    </div>
  )
}

export default Proforma