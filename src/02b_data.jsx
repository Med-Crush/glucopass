/* ============ DATA (v2): CPG follow-up tests (mmol/L), patients, doctors, diary ============ */

// Qualitative results (urine albumin, ECG, fundus)
const QUAL = {
  neg: { en: 'Negative', ms: 'Negatif', s: 'good' },
  trace: { en: 'Trace', ms: 'Surih', s: 'warn' },
  pos: { en: '1+ (positive)', ms: '1+ (positif)', s: 'risk' },
  nsr: { en: 'Normal sinus rhythm', ms: 'Ritma sinus normal', s: 'good' },
  lvh: { en: 'Left ventricular hypertrophy', ms: 'Hipertrofi ventrikel kiri', s: 'warn' },
  nodr: { en: 'No diabetic retinopathy', ms: 'Tiada retinopati diabetik', s: 'good' },
  mild: { en: 'Mild NPDR', ms: 'NPDR ringan', s: 'warn' },
};
const FREQ = {
  visit: { d: 90, n: { en: 'Each visit', ms: 'Setiap lawatan' } },
  '6m': { d: 182, n: { en: 'Every 6 months', ms: 'Setiap 6 bulan' } },
  '12m': { d: 365, n: { en: 'Annually', ms: 'Setiap tahun' } },
  vital: { d: 90, n: { en: 'Vitals', ms: 'Tanda vital' } },
};

const METRICS = [
  { id: 'hba1c', icon: 'droplet', n: { en: 'HbA1c', ms: 'HbA1c' }, unit: '%', d: 1, freq: '6m', st: (v) => (v <= 7 ? 'good' : v <= 8 ? 'warn' : 'risk'), ref: '≤ 7.0', band: [4, 7] },
  { id: 'fbs', icon: 'sun', n: { en: 'Fasting blood sugar (FBS)', ms: 'Gula darah puasa (FBS)' }, short: { en: 'Fasting (FBS)', ms: 'Puasa (FBS)' }, unit: 'mmol/L', d: 1, freq: 'visit', st: (v) => (v <= 7 ? 'good' : v <= 10 ? 'warn' : 'risk'), ref: '4.4 – 7.0', band: [4.4, 7] },
  { id: 'rbs', icon: 'droplet', n: { en: 'Random blood sugar (RBS)', ms: 'Gula darah rawak (RBS)' }, short: { en: 'Random (RBS)', ms: 'Rawak (RBS)' }, unit: 'mmol/L', d: 1, freq: 'visit', st: (v) => (v <= 10 ? 'good' : v <= 13.9 ? 'warn' : 'risk'), ref: '4.4 – 10.0', band: [4.4, 10] },
  { id: 'pp2', icon: 'clock', n: { en: '2-hr post-prandial (2HPP)', ms: '2 jam selepas makan (2HPP)' }, short: { en: '2-hr PP (2HPP)', ms: '2 jam PP (2HPP)' }, unit: 'mmol/L', d: 1, freq: 'visit', st: (v) => (v <= 8.5 ? 'good' : v <= 11.1 ? 'warn' : 'risk'), ref: '4.4 – 8.5', band: [4.4, 8.5] },
  { id: 'ualb', icon: 'flask', kind: 'qual', n: { en: 'Urine albumin', ms: 'Albumin air kencing' }, freq: '6m', st: (v) => QUAL[v]?.s || 'good', ref: { en: 'Negative', ms: 'Negatif' } },
  { id: 'uacr', icon: 'flask', n: { en: 'Urine microalbumin (ACR)', ms: 'Mikroalbumin air kencing (ACR)' }, short: { en: 'Microalbumin', ms: 'Mikroalbumin' }, note: { en: 'if urine albumin negative', ms: 'jika albumin air kencing negatif' }, unit: 'mg/mmol', d: 1, freq: '6m', st: (v) => (v < 2.5 ? 'good' : v <= 30 ? 'warn' : 'risk'), ref: '< 2.5', band: [0, 2.5] },
  { id: 'creat', icon: 'activity', n: { en: 'Serum creatinine', ms: 'Kreatinin serum' }, unit: 'µmol/L', d: 0, freq: '6m', st: (v) => (v <= 106 ? 'good' : v <= 150 ? 'warn' : 'risk'), ref: '62 – 106', band: [62, 106] },
  { id: 'ecg', icon: 'heart', kind: 'qual', n: { en: 'ECG', ms: 'ECG' }, freq: '12m', st: (v) => QUAL[v]?.s || 'good', ref: { en: 'Normal', ms: 'Normal' } },
  { id: 'fundus', icon: 'eye', kind: 'qual', n: { en: 'Fundus examination', ms: 'Pemeriksaan fundus' }, freq: '12m', st: (v) => QUAL[v]?.s || 'good', ref: { en: 'No retinopathy', ms: 'Tiada retinopati' } },
  { id: 'lipid', icon: 'activity', kind: 'lipid', n: { en: 'Fasting serum lipid', ms: 'Lipid serum puasa' }, unit: 'mmol/L', d: 1, freq: '12m', st: (v) => (v.ldl <= 2.6 ? 'good' : v.ldl <= 3.4 ? 'warn' : 'risk'), ref: 'LDL ≤ 2.6', band: [0, 2.6] },
  { id: 'bp', icon: 'heart', n: { en: 'Blood pressure', ms: 'Tekanan darah' }, short: { en: 'BP', ms: 'TD' }, unit: 'mmHg', d: 0, freq: 'vital', st: (v) => (v[0] <= 130 && v[1] <= 80 ? 'good' : v[0] < 140 && v[1] < 90 ? 'warn' : 'risk'), ref: '≤ 130/80', band: [90, 130] },
  { id: 'weight', icon: 'weight', n: { en: 'Weight / BMI', ms: 'Berat / BMI' }, short: { en: 'Weight', ms: 'Berat' }, unit: 'kg', d: 1, freq: 'vital', st: (v, h) => { const b = bmi(v, h); return b < 23 ? 'good' : b < 27.5 ? 'warn' : 'risk'; }, ref: 'BMI 18.5–22.9' },
  { id: 'hr', icon: 'activity', n: { en: 'Heart rate', ms: 'Kadar denyutan jantung' }, short: { en: 'Heart rate', ms: 'Nadi' }, unit: 'bpm', d: 0, freq: 'vital', st: (v) => (v >= 60 && v <= 100 ? 'good' : v >= 50 && v <= 110 ? 'warn' : 'risk'), ref: '60 – 100', band: [60, 100] },
  { id: 'height', icon: 'user', n: { en: 'Height', ms: 'Tinggi' }, unit: 'cm', d: 0, freq: 'vital', st: () => 'good', ref: '—' },
  { id: 'waist', icon: 'target', n: { en: 'Waist circumference', ms: 'Lilitan pinggang' }, short: { en: 'Waist', ms: 'Pinggang' }, unit: 'cm', d: 0, freq: 'vital', st: (v, pt) => { const lim = pt?.sex?.en === 'Female' ? 80 : 90; return v < lim ? 'good' : v < lim + 10 ? 'warn' : 'risk'; }, ref: { en: '< 90 (men) · < 80 (women)', ms: '< 90 (lelaki) · < 80 (wanita)' } },
  { id: 'rcbs', icon: 'droplet', n: { en: 'Random capillary blood sugar', ms: 'Gula darah kapilari rawak' }, short: { en: 'Capillary sugar', ms: 'Gula kapilari' }, unit: 'mmol/L', d: 1, freq: 'vital', st: (v) => (v <= 10 ? 'good' : v <= 13.9 ? 'warn' : 'risk'), ref: '4.4 – 10.0', band: [4.4, 10] },
];
const MET = Object.fromEntries(METRICS.map((m) => [m.id, m]));
const bmi = (w, h) => Math.round((w / ((h / 100) ** 2)) * 10) / 10;
const latest = (arr) => (arr && arr.length ? arr[arr.length - 1] : null);
const metricNum = (id, v) => (id === 'bp' ? v[0] : id === 'lipid' ? v.ldl : v);
const metricStatus = (pt, id, v) => (id === 'weight' ? MET.weight.st(v, pt.height) : id === 'waist' ? MET.waist.st(v, pt) : MET[id].st(v));
const VITAL_KEYS = ['bp', 'hr', 'weight', 'height', 'waist', 'rcbs'];
function fmtMetric(id, v) {
  if (v == null) return '—';
  const m = MET[id];
  if (id === 'bp') return `${v[0]}/${v[1]}`;
  if (m?.kind === 'qual') return L(QUAL[v] || v);
  if (id === 'lipid') return 'LDL ' + num(v.ldl, 1);
  return num(v, m?.d ?? 1);
}
function dueInfo(hist, freq) {
  const last = latest(hist);
  if (!last) return { s: 'risk', l: T('Not done yet', 'Belum dibuat'), next: now() };
  const next = last.t + FREQ[freq].d * DAY; const diff = Math.round((next - now()) / DAY);
  if (diff < 0) return { s: 'risk', next, l: fill(T('Overdue {n} days', 'Lewat {n} hari'), { n: -diff }) };
  if (diff <= 30) return { s: 'warn', next, l: fill(T('Due in {n} days', 'Perlu dalam {n} hari'), { n: diff }) };
  return { s: 'good', next, l: T('Next', 'Seterusnya') + ': ' + fmtDate(next, { month: 'short', year: 'numeric' }) };
}
const gStatus = (v) => (v < 3.9 ? 'risk' : v <= 10 ? 'good' : v <= 13.9 ? 'warn' : 'risk');
const gLabel = (v) => (v < 3.9 ? T('Low', 'Rendah') : v <= 10 ? T('In range', 'Dalam julat') : v <= 13.9 ? T('High', 'Tinggi') : T('Very high', 'Sangat tinggi'));

// Lab report rows (sample report, record detail, OCR form)
const LAB_TESTS = [
  { k: 'hba1c', n: 'HbA1c', u: '%', ref: '4.0 – 6.4', st: MET.hba1c.st },
  { k: 'fbs', n: 'Fasting Blood Sugar (FBS)', u: 'mmol/L', ref: '3.9 – 6.0', st: MET.fbs.st },
  { k: 'pp2', n: '2-hr Post Prandial (2HPP)', u: 'mmol/L', ref: '< 7.8', st: MET.pp2.st },
  { k: 'creat', n: 'Serum Creatinine', u: 'µmol/L', ref: '62 – 106', st: MET.creat.st },
  { k: 'ualb', n: 'Urine Albumin', u: '', ref: 'Negative', st: MET.ualb.st, qual: true },
  { k: 'uacr', n: 'Urine Microalbumin (ACR)', u: 'mg/mmol', ref: '< 2.5', st: MET.uacr.st },
  { k: 'tc', n: 'Total Cholesterol', u: 'mmol/L', ref: '< 5.2', st: (v) => (v < 5.2 ? 'good' : v < 6.2 ? 'warn' : 'risk') },
  { k: 'ldl', n: 'LDL Cholesterol', u: 'mmol/L', ref: '< 2.6', st: (v) => (v <= 2.6 ? 'good' : v <= 3.4 ? 'warn' : 'risk') },
  { k: 'hdl', n: 'HDL Cholesterol', u: 'mmol/L', ref: '> 1.0', st: (v) => (v >= 1.0 ? 'good' : v >= 0.9 ? 'warn' : 'risk') },
  { k: 'tg', n: 'Triglycerides (fasting)', u: 'mmol/L', ref: '< 1.7', st: (v) => (v < 1.7 ? 'good' : v < 2.3 ? 'warn' : 'risk') },
].map((r, i) => ({ ...r, y: 40.5 + i * 4.4 }));
const LT = Object.fromEntries(LAB_TESTS.map((r) => [r.k, r]));
const fmtLab = (k, v) => (v == null || v === '' ? '—' : LT[k]?.qual ? L(QUAL[v] || v) : String(v));

const SAMPLE_LAB = { lab: 'KlinikMed Diagnostic Lab', vals: { hba1c: 7.3, fbs: 7.1, pp2: 10.1, creat: 90, ualb: 'neg', uacr: 2.3, tc: 5.1, ldl: 2.9, hdl: 1.2, tg: 1.8 } };

/* ---------- patients ---------- */
const mkHist = (vals, gap = 90, offset = 20) => vals.map((v, i) => ({ t: atDay(-(vals.length - 1 - i) * gap - offset, 9), v }));
const r1 = (x) => Math.round(x * 10) / 10;

function buildPatients() {
  const P = {};
  P.p1 = {
    id: 'p1', name: 'Ahmad Zaki', age: 34, sex: { en: 'Male', ms: 'Lelaki' }, type: { en: 'Type 2 diabetes', ms: 'Diabetes jenis 2' }, typeShort: 'T2',
    blood: 'B+', since: 2019, height: 168, phone: '+60 12-345 6789', hue: 168,
    meds: { en: 'Metformin 500 mg, 2× daily', ms: 'Metformin 500 mg, 2× sehari' }, medShort: 'Metformin 500 mg',
    targets: { carbs: 180, sugar: 25 },
    metrics: {
      hba1c: mkHist([8.4, 8.1, 7.9, 7.6]),
      fbs: mkHist([8.4, 8.0, 7.7, 7.4]),
      rbs: mkHist([10.2, 9.4, 8.6, 8.1]),
      pp2: mkHist([12.7, 11.8, 10.9, 10.6]),
      ualb: mkHist(['neg', 'trace', 'neg'], 182),
      uacr: mkHist([3.1, 2.8, 2.3], 182),
      creat: mkHist([86, 89, 92], 182),
      ecg: mkHist(['nsr', 'nsr'], 365, 300),
      fundus: mkHist(['nodr', 'nodr'], 365, 400),
      lipid: mkHist([{ tc: 5.9, ldl: 3.6, hdl: 1.0, tg: 2.1 }, { tc: 5.5, ldl: 3.2, hdl: 1.1, tg: 1.9 }], 365, 110),
      bp: mkHist([[138, 88], [134, 86], [132, 84], [128, 82]]),
      weight: mkHist([74.5, 72.8, 71.0, 69.8]),
      hr: mkHist([84, 82, 80, 78]),
      height: mkHist([168, 168]),
      waist: mkHist([99, 97, 96, 95]),
      rcbs: [],
    },
    records: [
      { id: 'r1', kind: 'lab', t: atDay(-202, 9), lab: 'Makmal Sihat Diagnostics', vals: { hba1c: 8.1, fbs: 8.0, pp2: 11.8, creat: 89, ualb: 'trace', uacr: 2.8 } },
      { id: 'r2', kind: 'lab', t: atDay(-110, 9), lab: 'Klinik Kesihatan Setia Alam', vals: { hba1c: 7.9, fbs: 7.7, pp2: 10.9, tc: 5.5, ldl: 3.2, hdl: 1.1, tg: 1.9 } },
      { id: 'r6', kind: 'letter', t: atDay(-300, 11), lab: 'Hospital Pakar Seri Medik', text: { en: 'ECG: Normal sinus rhythm, rate 76 bpm. No ischaemic changes.', ms: 'ECG: Ritma sinus normal, kadar 76 bpm. Tiada perubahan iskemia.' } },
      { id: 'r7', kind: 'letter', t: atDay(-400, 10), lab: 'Klinik Mata Setia', text: { en: 'Fundus examination (both eyes): No diabetic retinopathy. Repeat yearly.', ms: 'Pemeriksaan fundus (kedua-dua mata): Tiada retinopati diabetik. Ulang setiap tahun.' } },
      { id: 'r4', kind: 'rx', t: atDay(-60, 11), lab: 'Klinik Kesihatan Setia Alam', text: { en: 'Metformin 500 mg — 1 tablet, 2× daily after meals (60 days)', ms: 'Metformin 500 mg — 1 biji, 2× sehari selepas makan (60 hari)' } },
      { id: 'r3', kind: 'lab', t: atDay(-20, 9), lab: 'Makmal Sihat Diagnostics', vals: { hba1c: 7.6, fbs: 7.4, pp2: 10.6, creat: 92, ualb: 'neg', uacr: 2.3 } },
      { id: 'r5', kind: 'letter', t: atDay(-18, 15), lab: 'Hospital Pakar Seri Medik', text: { en: 'Referral to dietitian for medical nutrition therapy. Review in 3 months.', ms: 'Rujukan kepada pegawai dietetik untuk terapi pemakanan perubatan. Semakan dalam 3 bulan.' } },
    ],
    meals: genMeals('p1', { skip: [-5], today: ['breakfast', 'lunch'] }),
  };

  const others = [
    { id: 'p2', name: 'Tan Mei Ling', age: 61, sex: { en: 'Female', ms: 'Perempuan' }, typeShort: 'T2', blood: 'A+', hue: 340, bias: 0.6, risk: 'risk',
      flag: { en: 'RBS > 11.1 mmol/L three times this week', ms: 'RBS > 11.1 mmol/L tiga kali minggu ini' }, h: [8.6, 8.8, 9.1, 9.4], fbs: [9.3, 9.7, 10.1, 10.6], bp: [[136, 84], [138, 86], [140, 88], [142, 88]], w: [64, 65, 65.5, 66] },
    { id: 'p3', name: 'Muthu Krishnan', age: 58, sex: { en: 'Male', ms: 'Lelaki' }, typeShort: 'T2', blood: 'O+', hue: 30, bias: 0.4, risk: 'risk',
      flag: { en: 'HbA1c rose from 7.2% to 8.1%', ms: 'HbA1c naik dari 7.2% ke 8.1%' }, h: [7.0, 7.2, 7.6, 8.1], fbs: [7.1, 7.3, 8.1, 8.8], bp: [[130, 82], [132, 84], [134, 86], [136, 86]], w: [82, 83, 84.5, 86] },
    { id: 'p4', name: 'Faridah Ismail', age: 66, sex: { en: 'Female', ms: 'Perempuan' }, typeShort: 'T2', blood: 'B+', hue: 280, bias: 0.2, risk: 'warn', ecgLvh: true,
      flag: { en: 'Blood pressure 158/96 mmHg', ms: 'Tekanan darah 158/96 mmHg' }, h: [7.4, 7.3, 7.3, 7.2], fbs: [7.7, 7.5, 7.3, 7.2], bp: [[146, 90], [150, 92], [154, 94], [158, 96]], w: [70, 70, 71, 71.5] },
    { id: 'p5', name: 'Wong Kah Hoe', age: 47, sex: { en: 'Male', ms: 'Lelaki' }, typeShort: 'T2', blood: 'AB+', hue: 210, bias: 0.3, risk: 'warn', skip: [-3, -2, -1, 0],
      flag: { en: 'No meals logged for 4 days', ms: 'Tiada catatan makan selama 4 hari' }, h: [7.8, 7.5, 7.4, 7.5], fbs: [7.8, 7.6, 7.4, 7.7], bp: [[128, 80], [126, 80], [128, 82], [130, 82]], w: [88, 87, 86.5, 86] },
    { id: 'p6', name: 'Nur Izzati Hamdan', age: 34, sex: { en: 'Female', ms: 'Perempuan' }, typeShort: 'T1', blood: 'O-', hue: 150, bias: -0.3, risk: 'good',
      flag: null, h: [7.2, 7.0, 6.8, 6.7], fbs: [6.9, 6.7, 6.4, 6.2], bp: [[118, 76], [116, 74], [118, 76], [116, 74]], w: [55, 55, 54.5, 54.5] },
    { id: 'p7', name: 'Daniel Ong', age: 29, sex: { en: 'Male', ms: 'Lelaki' }, typeShort: 'T1', blood: 'A-', hue: 195, bias: -0.2, risk: 'good',
      flag: null, h: [6.9, 6.8, 6.6, 6.5], fbs: [6.6, 6.4, 6.2, 6.1], bp: [[120, 78], [118, 76], [120, 78], [118, 76]], w: [72, 72, 71.5, 71] },
    { id: 'p8', name: 'Kavitha Devi', age: 45, sex: { en: 'Female', ms: 'Perempuan' }, typeShort: 'Pre', blood: 'B-', hue: 12, bias: -0.1, risk: 'good',
      flag: null, h: [6.2, 6.1, 6.0, 5.9], fbs: [6.0, 5.9, 5.8, 5.7], bp: [[124, 80], [122, 78], [122, 78], [120, 78]], w: [68, 67, 66, 65.5] },
  ];
  const typeName = { T1: { en: 'Type 1 diabetes', ms: 'Diabetes jenis 1' }, T2: { en: 'Type 2 diabetes', ms: 'Diabetes jenis 2' }, Pre: { en: 'Prediabetes', ms: 'Pradiabetes' } };
  const labs = ['Makmal Sihat Diagnostics', 'Klinik Kesihatan Ampang', 'Hospital Pakar Seri Medik'];
  others.forEach((o, i) => {
    const r = rng(o.id);
    const ht = 155 + Math.floor(r() * 25); const male = o.sex.en === 'Male';
    const rf = o.risk === 'risk' ? 1 : o.risk === 'warn' ? 0.5 : 0;
    const ldl = r1(2.2 + rf * 1.2 + r() * 0.4);
    const metrics = {
      hba1c: mkHist(o.h), fbs: mkHist(o.fbs), rbs: mkHist(o.fbs.map((f) => r1(f * 1.18))), pp2: mkHist(o.fbs.map((f) => r1(f * 1.42))),
      ualb: mkHist(o.risk === 'risk' ? ['neg', 'trace', 'pos'] : ['neg', 'neg', 'neg'], 182),
      uacr: mkHist(o.risk === 'risk' ? [2.4, 4.8, 8.6] : o.risk === 'warn' ? [2.2, 2.6, 2.9] : [1.4, 1.6, 1.3], 182),
      creat: mkHist([0, 1, 2].map((k) => Math.round(72 + rf * 30 + k * 4 + r() * 8)), 182),
      ecg: mkHist(['nsr', o.ecgLvh ? 'lvh' : 'nsr'], 365, 60 + Math.floor(r() * 250)),
      fundus: mkHist(['nodr', o.risk === 'risk' ? 'mild' : 'nodr'], 365, 40 + Math.floor(r() * 380)),
      lipid: mkHist([{ tc: r1(ldl + 2.4), ldl: r1(ldl + 0.3), hdl: 1.1, tg: r1(1.6 + rf * 0.6) }, { tc: r1(ldl + 2.2), ldl, hdl: r1(1.0 + r() * 0.3), tg: r1(1.4 + rf * 0.7) }], 365, 90 + Math.floor(r() * 200)),
      bp: mkHist(o.bp), weight: mkHist(o.w),
      hr: mkHist([0, 1, 2, 3].map(() => Math.round(68 + (o.risk === 'risk' ? 14 : 0) + r() * 10))),
      height: mkHist([ht, ht]),
      waist: mkHist(o.w.map((w) => Math.round(w * (male ? 1.1 : 1.18) + 4))),
      rcbs: mkHist(o.fbs.map((f) => r1(f * 1.22 + r() * 0.6)), 1, 0),
    };
    P[o.id] = {
      id: o.id, name: o.name, age: o.age, sex: o.sex, type: typeName[o.typeShort], typeShort: o.typeShort, blood: o.blood, hue: o.hue,
      since: 2012 + Math.floor(r() * 12), height: ht,
      phone: '+60 1' + Math.floor(r() * 9) + '-' + (100 + Math.floor(r() * 899)) + ' ' + (1000 + Math.floor(r() * 8999)),
      meds: o.typeShort === 'T1' ? { en: 'Insulin (basal-bolus)', ms: 'Insulin (basal-bolus)' } : o.typeShort === 'Pre' ? { en: 'Lifestyle therapy', ms: 'Terapi gaya hidup' } : { en: 'Metformin 850 mg, 2× daily', ms: 'Metformin 850 mg, 2× sehari' },
      medShort: o.typeShort === 'T1' ? 'Insulin glargine' : o.typeShort === 'Pre' ? null : 'Metformin 850 mg',
      targets: { carbs: 180, sugar: 25 }, risk: o.risk, flag: o.flag, metrics,
      records: [2, 3].map((k) => ({ id: o.id + 'r' + k, kind: 'lab', t: metrics.hba1c[k].t, lab: labs[(i + k) % 3],
        vals: { hba1c: o.h[k], fbs: o.fbs[k], pp2: metrics.pp2[k].v, creat: metrics.creat[k - 1].v, ualb: metrics.ualb[k - 1].v, uacr: metrics.uacr[k - 1].v } })),
      meals: genMeals(o.id, { bias: o.bias, skip: o.skip || [] }),
    };
  });
  return P;
}

/* ---------- diary entries (non-meal) ---------- */
const ACTIVITIES = [
  { k: 'walk', icon: 'walk', n: { en: 'Walking', ms: 'Berjalan' } },
  { k: 'squat', icon: 'dumbbell', n: { en: 'Light squats', ms: 'Skuat ringan' } },
  { k: 'stairs', icon: 'stairs', n: { en: 'Stairs', ms: 'Naik tangga' } },
  { k: 'cycle', icon: 'activity', n: { en: 'Cycling', ms: 'Berbasikal' } },
  { k: 'garden', icon: 'leaf', n: { en: 'Gardening', ms: 'Berkebun' } },
];
const ACT = Object.fromEntries(ACTIVITIES.map((a) => [a.k, a]));

function seedDiary(P) {
  const D = {};
  Object.values(P).forEach((pt) => {
    const list = [];
    if (pt.medShort) for (let d = -13; d <= 0; d++) {
      list.push({ id: `${pt.id}_med_am${d}`, kind: 'med', t: atDay(d, 8, 10), name: pt.medShort });
      if (d < 0 && !(pt.id === 'p1' && d === -3)) list.push({ id: `${pt.id}_med_pm${d}`, kind: 'med', t: atDay(d, 20, 15), name: pt.medShort });
    }
    D[pt.id] = list;
  });
  const V = (d, h, m, vals) => {
    const t = atDay(d, h, m);
    Object.entries(vals).forEach(([k, v]) => { P.p1.metrics[k].push({ t, v }); P.p1.metrics[k].sort((a, b) => a.t - b.t); });
  };
  V(-3, 7, 15, { rcbs: 9.8 });
  V(-2, 7, 20, { weight: 69.1, waist: 92, rcbs: 8.6 });
  V(-1, 7, 10, { bp: [132, 84], hr: 80, rcbs: 11.2 });
  V(0, 7, 15, { bp: [128, 82], hr: 76, rcbs: 8.1 });
  D.p1.push(
    { id: 'dx1', kind: 'exercise', t: atDay(0, 9, 5), act: 'walk', mins: 10 },
    { id: 'dx2', kind: 'exercise', t: atDay(-1, 14, 0), act: 'squat', mins: 3 },
    { id: 'dx3', kind: 'exercise', t: atDay(-2, 20, 30), act: 'walk', mins: 15 },
  );
  return D;
}

/* ---------- doctors (Halodoc-style pricing) ---------- */
const DOCTORS = [
  { id: 'd1', name: 'Dr. Aisyah Rahman', spec: 'endo', rating: 4.9, sat: 98, reviews: 312, consults: '2.1k', status: 'online', price: 45, orig: 60, points: null, hue: 170, exp: 14, hospital: 'Hospital Pakar Seri Medik', mmc: '48213',
    edu: { en: 'MBBS (UM), MRCP (UK), Fellowship in Endocrinology (NUH)', ms: 'MBBS (UM), MRCP (UK), Fellowship Endokrinologi (NUH)' }, sched: { en: 'Mon – Fri · 09:00 – 17:00', ms: 'Isn – Jum · 09:00 – 17:00' },
    about: { en: 'Consultant endocrinologist focusing on type 2 diabetes, insulin initiation and thyroid disorders.', ms: 'Pakar endokrinologi perunding yang menumpukan diabetes jenis 2, permulaan insulin dan masalah tiroid.' } },
  { id: 'd2', name: 'Dr. Lim Wei Jie', spec: 'gp', rating: 4.7, sat: 96, reviews: 198, consults: '1.4k', status: 'online', price: 15, orig: 20, points: null, hue: 210, exp: 8, hospital: 'Klinik Setia Alam', mmc: '61022',
    edu: { en: 'MD (UKM), Dip. in Family Medicine', ms: 'MD (UKM), Dip. Perubatan Keluarga' }, sched: { en: 'Daily · 08:00 – 22:00', ms: 'Setiap hari · 08:00 – 22:00' },
    about: { en: 'Family physician experienced in chronic disease follow-up, medication refills and general health checks.', ms: 'Doktor keluarga berpengalaman dalam susulan penyakit kronik, ubat ulangan dan pemeriksaan kesihatan am.' } },
  { id: 'd3', name: 'Pn. Nurul Huda', spec: 'diet', rating: 4.8, sat: 99, reviews: 156, consults: '860', status: 'online', price: 25, orig: 35, points: 300, hue: 330, exp: 10, hospital: 'Pusat Nutrisi Sihat', mmc: 'MDA 0291',
    edu: { en: 'BSc Dietetics (UKM), Certified Diabetes Educator', ms: 'BSc Dietetik (UKM), Pendidik Diabetes Bertauliah' }, sched: { en: 'Mon – Sat · 10:00 – 18:00', ms: 'Isn – Sab · 10:00 – 18:00' },
    about: { en: 'Registered dietitian helping patients plan Malaysian meals with the "Suku-Suku Separuh" plate method.', ms: 'Pegawai dietetik berdaftar yang membantu pesakit merancang hidangan Malaysia dengan kaedah pinggan "Suku-Suku Separuh".' } },
  { id: 'd4', name: 'Dr. Rajesh Kumar', spec: 'endo', rating: 4.8, sat: 97, reviews: 241, consults: '1.8k', status: 'offline', price: 50, orig: 65, points: null, hue: 30, exp: 18, hospital: 'Hospital Pakar Seri Medik', mmc: '39377',
    edu: { en: 'MBBS (Manipal), MRCP (UK), CCT Diabetes & Endocrinology', ms: 'MBBS (Manipal), MRCP (UK), CCT Diabetes & Endokrinologi' }, sched: { en: 'Tue, Thu · 14:00 – 20:00', ms: 'Sel, Kha · 14:00 – 20:00' },
    about: { en: 'Senior endocrinologist with special interest in diabetic kidney disease.', ms: 'Pakar endokrinologi kanan dengan minat khusus dalam penyakit buah pinggang diabetik.' } },
  { id: 'd5', name: 'Dr. Siti Mariam', spec: 'gp', rating: 4.6, sat: 95, reviews: 88, consults: '540', status: 'busy', price: 12, orig: 15, points: 200, hue: 260, exp: 6, hospital: 'Klinik Kesihatan Ampang', mmc: '70115',
    edu: { en: 'MBBS (USM)', ms: 'MBBS (USM)' }, sched: { en: 'Mon – Fri · 18:00 – 23:00', ms: 'Isn – Jum · 18:00 – 23:00' },
    about: { en: 'Medical officer for after-hours consultations and quick health questions.', ms: 'Pegawai perubatan untuk konsultasi selepas waktu pejabat dan soalan kesihatan ringkas.' } },
];
const DOC = Object.fromEntries(DOCTORS.map((d) => [d.id, d]));
const SERVICE_FEE = 1;
const PAYMENTS = [
  { id: 'fpx', l: 'FPX', c: '#1f4e9c', n: { en: 'FPX online banking', ms: 'Perbankan dalam talian FPX' } },
  { id: 'tng', l: 'TNG', c: '#1765d8', n: { en: "Touch 'n Go eWallet", ms: "Touch 'n Go eWallet" } },
  { id: 'grab', l: 'Grab', c: '#00a650', n: { en: 'GrabPay', ms: 'GrabPay' } },
  { id: 'card', l: 'VISA', c: '#334155', n: { en: 'Credit / debit card', ms: 'Kad kredit / debit' } },
];
const rm = (v) => 'RM' + Number(v).toFixed(2);
