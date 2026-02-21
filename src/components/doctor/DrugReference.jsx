// ─────────────────────────────────────────────
//  RhinoGuide by Manish — Drug Reference
// ─────────────────────────────────────────────
import { useState } from 'react'
import { Search }   from 'lucide-react'

const DRUGS = [
  // ── 2nd-gen AH ──
  { cat: '2nd-Gen Oral Antihistamines', name: 'Levocetirizine 5mg',
    brands: 'Levocet · L-Cet · Xyzal · Teczine · Vozet',
    dose: '5mg', freq: 'OD HS', star: 2,
    note: "India's most-prescribed AH; slight sedation — bedtime; long-acting (26h)" },
  { cat: '2nd-Gen Oral Antihistamines', name: 'Fexofenadine 120/180mg',
    brands: 'Allegra · Fexova · Allerfex · Fexidine',
    dose: '120–180mg', freq: 'OD', star: 2,
    note: 'Truly non-sedating; safe for drivers/pilots; avoid grapefruit/apple juice' },
  { cat: '2nd-Gen Oral Antihistamines', name: 'Cetirizine 10mg',
    brands: 'Zyrtec · Cetzine · Alerid · Okacet · CTZ',
    dose: '10mg', freq: 'OD HS', star: 1,
    note: 'Mildly sedating; FDA 2025 note re: pruritus on discontinuation' },
  { cat: '2nd-Gen Oral Antihistamines', name: 'Loratadine 10mg',
    brands: 'Lorfast · Loranil (generic)',
    dose: '10mg', freq: 'OD', star: 1,
    note: 'Non-sedating; Category B in pregnancy (preferred); lower potency' },
  { cat: '2nd-Gen Oral Antihistamines', name: 'Desloratadine 5mg',
    brands: 'Deslor · Aerius · Dazit · Deloday',
    dose: '5mg', freq: 'OD', star: 1,
    note: 'Active metabolite of loratadine; superior potency; non-sedating' },
  { cat: '2nd-Gen Oral Antihistamines', name: 'Bilastine 20mg',
    brands: 'Bilaxten · Ilaxten · Bilasure · Bilastop',
    dose: '20mg', freq: 'OD fasting', star: 3,
    note: 'Zero CNS penetration; driver-safe; fasting absorption; ARIA top preference; ≥12yrs', isNew: false },
  { cat: '2nd-Gen Oral Antihistamines', name: 'Rupatadine 10mg',
    brands: 'Rupatall · Rupafin · Rupanex',
    dose: '10mg', freq: 'OD', star: 3,
    note: 'Dual H1+PAF antagonist; Cochrane NMA 2023 #1 for AR; best oral for congestion' },
  { cat: '2nd-Gen Oral Antihistamines', name: 'Ebastine 10/20mg',
    brands: 'Ebastel · Ebast (Torrent)',
    dose: '10–20mg', freq: 'OD', star: 1,
    note: 'Non-sedating; useful alternative' },

  // ── INCS ──
  { cat: 'Intranasal Corticosteroids (INCS)', name: 'Mometasone furoate nasal 50mcg',
    brands: 'Nasonex · Momate Nasal · Metaspray · Momeflo · Nasonase',
    dose: '2 sprays/nostril', freq: 'OD', star: 2,
    note: '1st-line INCS; negligible systemic absorption; ≥3yrs; OD adherence advantage' },
  { cat: 'Intranasal Corticosteroids (INCS)', name: 'Fluticasone propionate nasal 50mcg',
    brands: 'Flomist · Flixonase · Nasoflo',
    dose: '2 sprays/nostril', freq: 'OD', star: 2,
    note: 'Widely available; approved ≥4yrs; safe in pregnancy' },
  { cat: 'Intranasal Corticosteroids (INCS)', name: 'Fluticasone furoate nasal 27.5mcg',
    brands: 'Avamys · Flutiflo-F',
    dose: '2 sprays/nostril', freq: 'OD', star: 3,
    note: 'Enhanced GR affinity; newer preferred INCS; ≥6yrs; once daily' },
  { cat: 'Intranasal Corticosteroids (INCS)', name: 'Budesonide nasal 64–128mcg',
    brands: 'Budecort Nasal · Rhinocort · Budamate Nasal',
    dose: '2 sprays/nostril', freq: 'OD–BD', star: 2,
    note: 'Preferred INCS in pregnancy (Category B); children' },
  { cat: 'Intranasal Corticosteroids (INCS)', name: 'Beclomethasone dipropionate 50mcg',
    brands: 'Beconase · Beclate Nasal · Rhinase',
    dose: '2 sprays/nostril', freq: 'BD', star: 1,
    note: 'Older INCS; BD dosing; low cost — resource-limited settings' },

  // ── Combo sprays ──
  { cat: 'Combination Nasal Sprays', name: 'Azelastine + Fluticasone',
    brands: 'Dymista (Viatris/Meda)',
    dose: '1 spray/nostril', freq: 'BD', star: 3,
    note: 'Superior to either alone (MENSA trial); Step 3 first-choice; faster onset' },
  { cat: 'Combination Nasal Sprays', name: 'Azelastine + Mometasone',
    brands: 'Ryaltris AZ (Glenmark India)',
    dose: '1 spray/nostril', freq: 'BD', star: 3, isNew: true,
    note: 'Indian Phase III vs fluticasone+azelastine (IJORL 2023); excellent congestion relief' },
  { cat: 'Combination Nasal Sprays', name: 'Azelastine nasal 0.1%',
    brands: 'Azep Nasal · Allergodil · Azenose',
    dose: '1–2 sprays/nostril', freq: 'BD', star: 1,
    note: 'Onset 15 min; bitter taste (lateral spray reduces); acute breakthrough' },
  { cat: 'Combination Nasal Sprays', name: 'Olopatadine nasal 0.6%',
    brands: 'Olopat Nasal · Patanase',
    dose: '2 sprays/nostril', freq: 'BD', star: 1,
    note: 'Dual AH + mast cell stabiliser; useful when eye symptoms co-exist' },

  // ── LTRAs / FDC ──
  { cat: 'LTRAs & Indian FDC Combinations', name: 'Montelukast 10mg',
    brands: 'Montair · Telekast · Singulair · Romilast',
    dose: '10mg', freq: 'OD HS', star: 1,
    note: 'Add-on; FDA Black Box — rare neuropsychiatric SE (counsel patient)' },
  { cat: 'LTRAs & Indian FDC Combinations', name: 'Montelukast + Levocetirizine FDC',
    brands: 'Montair LC · Telekast-L · Levocet-M · Monocet-L',
    dose: '1 tab', freq: 'OD HS', star: 2,
    note: 'Most widely prescribed AR combo in India; cost-effective; multiple generics' },
  { cat: 'LTRAs & Indian FDC Combinations', name: 'Montelukast + Fexofenadine FDC',
    brands: 'Telekast-F · Montair FX · Allerfex-M',
    dose: '1 tab', freq: 'OD morning', star: 1,
    note: 'Non-sedating daytime option' },
  { cat: 'LTRAs & Indian FDC Combinations', name: 'Bilastine + Montelukast FDC',
    brands: 'Bilaxten-M · Bilasure-M · Ilaxten-M',
    dose: '1 tab fasting', freq: 'OD', star: 3, isNew: true,
    note: 'Zero sedation FDC; driver-safe; J Asthma 2023 India trial; emerging preferred combination' },
  { cat: 'LTRAs & Indian FDC Combinations', name: 'Rupatadine + Montelukast FDC',
    brands: 'Rupatall-M · Rupafin-M',
    dose: '1 tab', freq: 'OD HS', star: 2,
    note: 'Dual H1+PAF+LTRA; useful for congestion-dominant + asthma comorbid' },

  // ── Decongestants ──
  { cat: 'Decongestants — Short-term (<5 days)', name: 'Oxymetazoline 0.05%',
    brands: 'Nasivion · Otrivin · Drixoral · Nasivin',
    dose: '2 sprays/nostril', freq: 'BD max 5d', star: 0,
    note: 'Acute congestion relief ONLY; rhinitis medicamentosa if overused; avoid in HTN, IHD, pregnancy' },
  { cat: 'Decongestants — Short-term (<5 days)', name: 'Xylometazoline 0.1%',
    brands: 'Otrivin Adult · Xylo-M · Sinarest Nasal',
    dose: '2 sprays/nostril', freq: 'BD max 5d', star: 0,
    note: '0.05% for children <12; avoid in hypertension' },
  { cat: 'Decongestants — Short-term (<5 days)', name: 'Oral Prednisolone',
    brands: 'Omnacortil · Wysolone · Deltacortril',
    dose: '0.5mg/kg OD (max 40mg)', freq: 'OD × 5d', star: 0,
    note: 'Severe flare only; monitor blood sugar in diabetics; no long-term use' },

  // ── Saline & Adjuncts ──
  { cat: 'Saline & Adjuncts', name: 'Isotonic saline nasal spray',
    brands: 'Nasomist · Sterimar · Nasocare · SOS Nasal',
    dose: '2–3 sprays/nostril', freq: 'BD–TDS', star: 1,
    note: 'Step 0 — all patients; reduces allergen/pollutant load; free use' },
  { cat: 'Saline & Adjuncts', name: 'Olopatadine eye drops 0.1%',
    brands: 'Olopat · Pataday (Alcon)',
    dose: '1 drop/eye', freq: 'BD', star: 2,
    note: 'Allergic conjunctivitis; dual AH + mast cell stabiliser' },
  { cat: 'Saline & Adjuncts', name: 'Ketotifen eye drops 0.025%',
    brands: 'Zaditen · Ketosight · Ketocin',
    dose: '1 drop/eye', freq: 'BD', star: 1,
    note: 'Paediatric allergic conjunctivitis; very safe; OTC in most states' },
]

const STAR_LABELS = { 0: '', 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' }
const CATS = [...new Set(DRUGS.map(d => d.cat))]

const DrugReference = () => {
  const [query,   setQuery]   = useState('')
  const [selCat,  setSelCat]  = useState('All')

  const filtered = DRUGS.filter(d => {
    const q = query.toLowerCase()
    const matchQ = !q || d.name.toLowerCase().includes(q) ||
                   d.brands.toLowerCase().includes(q) ||
                   d.note.toLowerCase().includes(q)
    const matchC = selCat === 'All' || d.cat === selCat
    return matchQ && matchC
  })

  const grouped = CATS.reduce((acc, cat) => {
    const items = filtered.filter(d => d.cat === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header */}
      <div>
        <h2 className="font-serif text-xl text-gray-900">Drug Reference</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Indian market · ⭐⭐⭐ = ARIA top choice · NEW = India launch 2022–24
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           text-gray-400 w-4 h-4" />
        <input type="text" value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search drug name or brand..."
          className="input pl-9" />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {['All', ...CATS].map(cat => {
          const short = cat.split('(')[0].split('—')[0].trim()
            .replace('2nd-Gen Oral ', '')
            .replace('Intranasal ', '')
            .replace(' Combinations', '')
            .replace('LTRAs & Indian FDC', 'LTRAs/FDC')
          return (
            <button key={cat}
              onClick={() => setSelCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold
                          border transition-all duration-150
                          ${selCat === cat
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300'}`}>
              {short}
            </button>
          )
        })}
      </div>

      {/* Drug list */}
      {Object.entries(grouped).map(([cat, drugs]) => (
        <div key={cat} className="card overflow-hidden">
          {/* Category header */}
          <div className="px-4 py-2.5 bg-teal-900 text-white">
            <p className="text-xs font-bold uppercase tracking-wider">
              {cat}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {drugs.map(d => (
              <div key={d.name} className="px-4 py-3 hover:bg-gray-50
                                           transition-colors">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900">
                      {d.name}
                    </p>
                    {d.star > 0 && (
                      <span className="text-xs">{STAR_LABELS[d.star]}</span>
                    )}
                    {d.isNew && (
                      <span className="badge bg-yellow-100 text-yellow-700
                                       border border-yellow-300 text-xs">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-teal-700">{d.dose}</p>
                    <p className="text-xs text-gray-400">{d.freq}</p>
                  </div>
                </div>
                <p className="text-xs text-teal-600 mb-1 font-medium">
                  {d.brands}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {d.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="card p-10 text-center">
          <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No drugs match your search</p>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 pb-2">
        © 2026 RhinoGuide · Developed by Dr. Manish V. · All rights reserved
      </p>
    </div>
  )
}

export default DrugReference