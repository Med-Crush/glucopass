/* ============ DATA: food DB, nutrition logic, mock data ============ */

// Per standard portion. gi = glycaemic index (0 when negligible carbs).
const FOODS = [
  { id: 'rice_white', e: '🍚', n: { en: 'White rice', ms: 'Nasi putih' }, kcal: 204, carbs: 45, sugar: 0.1, fiber: 0.6, protein: 4.2, fat: 0.4, gi: 73, swap: 'rice_brown' },
  { id: 'rice_brown', e: '🍚', n: { en: 'Brown rice', ms: 'Nasi perang' }, kcal: 218, carbs: 46, sugar: 0.7, fiber: 3.5, protein: 5, fat: 1.6, gi: 55 },
  { id: 'nasi_lemak', e: '🍛', n: { en: 'Nasi lemak', ms: 'Nasi lemak' }, kcal: 400, carbs: 50, sugar: 3, fiber: 2, protein: 10, fat: 18, gi: 66, swap: 'rice_brown' },
  { id: 'nasi_goreng', e: '🍳', n: { en: 'Fried rice', ms: 'Nasi goreng' }, kcal: 450, carbs: 60, sugar: 3, fiber: 1.5, protein: 12, fat: 17, gi: 70, swap: 'rice_brown' },
  { id: 'nasi_ayam', e: '🍗', n: { en: 'Chicken rice', ms: 'Nasi ayam' }, kcal: 600, carbs: 75, sugar: 2, fiber: 1, protein: 30, fat: 20, gi: 72, swap: 'rice_brown' },
  { id: 'roti_canai', e: '🫓', n: { en: 'Roti canai', ms: 'Roti canai' }, kcal: 300, carbs: 40, sugar: 2, fiber: 1.5, protein: 7, fat: 12, gi: 79, swap: 'bread_wm' },
  { id: 'murtabak', e: '🥙', n: { en: 'Murtabak', ms: 'Murtabak' }, kcal: 600, carbs: 55, sugar: 3, fiber: 2.5, protein: 25, fat: 30, gi: 70 },
  { id: 'mee_goreng', e: '🍜', n: { en: 'Mee goreng mamak', ms: 'Mee goreng mamak' }, kcal: 550, carbs: 70, sugar: 6, fiber: 3, protein: 15, fat: 22, gi: 61 },
  { id: 'soto_ayam', e: '🍲', n: { en: 'Soto ayam', ms: 'Soto ayam' }, kcal: 250, carbs: 20, sugar: 2, fiber: 1.5, protein: 20, fat: 9, gi: 55 },
  { id: 'gado_gado', e: '🥗', n: { en: 'Gado-gado', ms: 'Gado-gado' }, kcal: 320, carbs: 22, sugar: 8, fiber: 6, protein: 14, fat: 20, gi: 40 },
  { id: 'oatmeal', e: '🥣', n: { en: 'Oatmeal', ms: 'Oat' }, kcal: 150, carbs: 27, sugar: 1, fiber: 4, protein: 5, fat: 3, gi: 55 },
  { id: 'bread_wm', e: '🍞', n: { en: 'Wholemeal bread', ms: 'Roti gandum penuh' }, kcal: 140, carbs: 24, sugar: 3, fiber: 4, protein: 6, fat: 2, gi: 51 },
  { id: 'fried_chicken', e: '🍗', n: { en: 'Fried chicken', ms: 'Ayam goreng' }, kcal: 260, carbs: 8, sugar: 0, fiber: 0.5, protein: 22, fat: 15, gi: 0 },
  { id: 'curry_chicken', e: '🍛', n: { en: 'Chicken curry', ms: 'Kari ayam' }, kcal: 280, carbs: 8, sugar: 3, fiber: 1.5, protein: 22, fat: 18, gi: 0 },
  { id: 'grilled_fish', e: '🐟', n: { en: 'Grilled fish', ms: 'Ikan bakar' }, kcal: 220, carbs: 2, sugar: 1, fiber: 0, protein: 30, fat: 10, gi: 0 },
  { id: 'satay', e: '🍢', n: { en: 'Chicken satay', ms: 'Sate ayam' }, kcal: 300, carbs: 10, sugar: 6, fiber: 1, protein: 25, fat: 18, gi: 0 },
  { id: 'tempe', e: '🟫', n: { en: 'Fried tempeh', ms: 'Tempe goreng' }, kcal: 190, carbs: 9, sugar: 0, fiber: 4, protein: 18, fat: 11, gi: 0 },
  { id: 'egg', e: '🥚', n: { en: 'Boiled egg', ms: 'Telur rebus' }, kcal: 78, carbs: 0.6, sugar: 0.6, fiber: 0, protein: 6, fat: 5, gi: 0 },
  { id: 'dhal', e: '🥘', n: { en: 'Dhal curry', ms: 'Kuah dal' }, kcal: 90, carbs: 12, sugar: 2, fiber: 4, protein: 5, fat: 2, gi: 30 },
  { id: 'veg', e: '🥬', n: { en: 'Stir-fried vegetables', ms: 'Sayur campur' }, kcal: 80, carbs: 8, sugar: 3, fiber: 3.5, protein: 3, fat: 4, gi: 15 },
  { id: 'ulam', e: '🥒', n: { en: 'Ulam (raw salad)', ms: 'Ulam-ulaman' }, kcal: 30, carbs: 5, sugar: 2, fiber: 3, protein: 2, fat: 0, gi: 15 },
  { id: 'kolak', e: '🍠', n: { en: 'Banana kolak', ms: 'Pengat pisang' }, kcal: 280, carbs: 55, sugar: 30, fiber: 3, protein: 2, fat: 6, gi: 70 },
  { id: 'kuih', e: '🍮', n: { en: 'Kuih seri muka', ms: 'Kuih seri muka' }, kcal: 180, carbs: 30, sugar: 15, fiber: 0.5, protein: 2, fat: 6, gi: 75 },
  { id: 'cendol', e: '🍧', n: { en: 'Cendol', ms: 'Cendol' }, kcal: 350, carbs: 60, sugar: 40, fiber: 1, protein: 2, fat: 10, gi: 70 },
  { id: 'banana', e: '🍌', n: { en: 'Banana', ms: 'Pisang' }, kcal: 105, carbs: 27, sugar: 14, fiber: 3, protein: 1.3, fat: 0.4, gi: 51 },
  { id: 'apple', e: '🍎', n: { en: 'Apple', ms: 'Epal' }, kcal: 95, carbs: 25, sugar: 19, fiber: 4.4, protein: 0.5, fat: 0.3, gi: 36 },
  { id: 'watermelon', e: '🍉', n: { en: 'Watermelon', ms: 'Tembikai' }, kcal: 46, carbs: 12, sugar: 9, fiber: 0.6, protein: 1, fat: 0.2, gi: 72 },
  { id: 'teh_ais', e: '🧋', drink: true, n: { en: 'Sweet iced tea', ms: 'Teh ais manis' }, kcal: 120, carbs: 30, sugar: 25, fiber: 0, protein: 1, fat: 1, gi: 65, swap: 'teh_o' },
  { id: 'teh_tarik', e: '🍵', drink: true, n: { en: 'Teh tarik', ms: 'Teh tarik' }, kcal: 150, carbs: 24, sugar: 22, fiber: 0, protein: 3, fat: 4, gi: 65, swap: 'teh_o' },
  { id: 'milo_ais', e: '🥤', drink: true, n: { en: 'Iced Milo', ms: 'Milo ais' }, kcal: 190, carbs: 32, sugar: 28, fiber: 1, protein: 5, fat: 5, gi: 60, swap: 'teh_o' },
  { id: 'kopi_o', e: '☕', drink: true, n: { en: 'Black coffee (no sugar)', ms: 'Kopi O kosong' }, kcal: 5, carbs: 1, sugar: 0, fiber: 0, protein: 0.3, fat: 0, gi: 0 },
  { id: 'teh_o', e: '🍵', drink: true, n: { en: 'Plain tea (no sugar)', ms: 'Teh O kosong' }, kcal: 2, carbs: 0.5, sugar: 0, fiber: 0, protein: 0, fat: 0, gi: 0 },
  { id: 'water', e: '💧', drink: true, n: { en: 'Plain water', ms: 'Air kosong' }, kcal: 0, carbs: 0, sugar: 0, fiber: 0, protein: 0, fat: 0, gi: 0 },
];
const FOOD = Object.fromEntries(FOODS.map((f) => [f.id, f]));

const MEAL_TIMES = [
  { id: 'breakfast', icon: 'coffee', n: { en: 'Breakfast', ms: 'Sarapan' }, h: 8 },
  { id: 'lunch', icon: 'sun', n: { en: 'Lunch', ms: 'Makan tengah hari' }, h: 13 },
  { id: 'dinner', icon: 'moon', n: { en: 'Dinner', ms: 'Makan malam' }, h: 19 },
  { id: 'snack', icon: 'cookie', n: { en: 'Snack', ms: 'Snek' }, h: 16 },
];
const MT = Object.fromEntries(MEAL_TIMES.map((m) => [m.id, m]));
const defaultMealTime = () => { const h = new Date().getHours(); return h < 11 ? 'breakfast' : h < 15 ? 'lunch' : h < 18 ? 'snack' : 'dinner'; };

function nutri(items) {
  const t = { kcal: 0, carbs: 0, sugar: 0, fiber: 0, protein: 0, fat: 0, gl: 0 };
  items.forEach(({ id, p }) => {
    const f = FOOD[id]; if (!f) return;
    ['kcal', 'carbs', 'sugar', 'fiber', 'protein', 'fat'].forEach((k) => (t[k] += f[k] * p));
    t.gl += (f.gi * Math.max(0, f.carbs - f.fiber) * p) / 100;
  });
  Object.keys(t).forEach((k) => (t[k] = Math.round(t[k] * 10) / 10));
  return t;
}
const glLevel = (gl) => (gl <= 20 ? 'good' : gl <= 35 ? 'warn' : 'risk');
const mealStatus = (n) => (n.gl > 35 || n.sugar > 20 ? 'risk' : n.gl > 20 || n.sugar > 10 ? 'warn' : 'good');
const mealTitle = (items) => {
  const names = items.map((i) => L(FOOD[i.id]?.n)).filter(Boolean);
  if (names.length <= 2) return names.join(' + ');
  return names.slice(0, 2).join(', ') + ' +' + (names.length - 2);
};

// Assistant warnings for a meal; returns [{level, icon, text}]
function mealWarnings(items, n, target) {
  const w = [];
  items.forEach(({ id, p }) => {
    const f = FOOD[id];
    if (f.sugar * p >= 14) w.push({ level: 'risk', icon: 'droplet', text: fill(T('High in added sugar — {name} has ±{g} g of sugar.', 'Tinggi gula tambahan — {name} mengandungi ±{g} g gula.'), { name: L(f.n), g: Math.round(f.sugar * p) }) });
  });
  items.forEach(({ id }) => {
    const f = FOOD[id];
    if (f.gi >= 66 && f.carbs >= 24 && f.swap) w.push({ level: 'warn', icon: 'zap', text: fill(T('{name} has a high glycaemic index — try {alt} next time.', '{name} mempunyai indeks glisemik tinggi — cuba {alt} lain kali.'), { name: L(f.n), alt: L(FOOD[f.swap].n).toLowerCase() }) });
  });
  if (target && n.carbs > target * 0.4) w.push({ level: 'warn', icon: 'target', text: fill(T('This meal uses {p}% of your daily carb target.', 'Hidangan ini menggunakan {p}% sasaran karbohidrat harian anda.'), { p: Math.round((n.carbs / target) * 100) }) });
  if (n.fiber < 3 && n.carbs > 20) w.push({ level: 'warn', icon: 'leaf', text: T('Low in fibre — add vegetables or ulam to slow sugar absorption.', 'Rendah serat — tambah sayur atau ulam untuk melambatkan penyerapan gula.') });
  if (!w.length) w.push({ level: 'good', icon: 'check', text: T('Nicely balanced meal! Keep it up 👏', 'Hidangan yang seimbang! Teruskan 👏') });
  return w;
}

const EXERCISES = [
  { id: 'walk', icon: 'walk', n: { en: 'Easy walk', ms: 'Jalan kaki santai' }, dur: 600, label: { en: '10–15 min', ms: '10–15 min' }, int: { en: 'Light', ms: 'Ringan' },
    steps: [{ en: 'Walk at a comfortable, steady pace', ms: 'Berjalan dengan rentak selesa dan stabil' }, { en: 'Swing your arms gently', ms: 'Hayunkan tangan perlahan-lahan' }, { en: 'You should still be able to talk', ms: 'Anda masih boleh bercakap dengan selesa' }] },
  { id: 'squat', icon: 'dumbbell', n: { en: 'Light squats 2×10', ms: 'Skuat ringan 2×10' }, dur: 180, label: { en: '3 min', ms: '3 min' }, int: { en: 'Moderate', ms: 'Sederhana' },
    steps: [{ en: 'Feet shoulder-width apart, hold a chair if needed', ms: 'Kaki selebar bahu, pegang kerusi jika perlu' }, { en: 'Lower slowly like sitting down, then stand', ms: 'Turun perlahan seperti duduk, kemudian berdiri' }, { en: '10 reps, rest 30 s, repeat once', ms: '10 kali, rehat 30 saat, ulang sekali' }] },
  { id: 'stairs', icon: 'stairs', n: { en: 'Stair steps', ms: 'Naik-turun tangga' }, dur: 300, label: { en: '5 min', ms: '5 min' }, int: { en: 'Moderate', ms: 'Sederhana' },
    steps: [{ en: 'Use the handrail for safety', ms: 'Pegang pemegang tangga untuk keselamatan' }, { en: 'Go up and down 1–2 floors at an easy pace', ms: 'Naik dan turun 1–2 tingkat dengan rentak santai' }, { en: 'Stop if you feel dizzy or breathless', ms: 'Berhenti jika rasa pening atau sesak nafas' }] },
];
const EX = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/* ---------- Health metrics ---------- */
/* ---------- Mock data generation ---------- */
const MEAL_TEMPLATES = {
  breakfast: [['nasi_lemak', 'teh_tarik'], ['roti_canai', 'dhal', 'teh_tarik'], ['oatmeal', 'egg', 'kopi_o'], ['bread_wm', 'egg', 'kopi_o'], ['nasi_lemak', 'egg', 'kopi_o'], ['roti_canai', 'teh_ais']],
  lunch: [['rice_white', 'fried_chicken', 'veg', 'teh_ais'], ['soto_ayam', 'water'], ['gado_gado', 'water'], ['nasi_ayam', 'teh_ais'], ['rice_brown', 'grilled_fish', 'veg', 'water'], ['mee_goreng', 'teh_ais'], ['rice_white', 'curry_chicken', 'veg', 'teh_o']],
  dinner: [['rice_white', 'grilled_fish', 'veg', 'water'], ['murtabak', 'teh_tarik'], ['rice_brown', 'tempe', 'veg', 'water'], ['nasi_goreng', 'water'], ['soto_ayam', 'water'], ['satay', 'ulam', 'water'], ['rice_white', 'curry_chicken', 'ulam', 'water']],
  snack: [['kolak'], ['kuih'], ['banana'], ['cendol'], ['apple'], ['milo_ais'], ['watermelon']],
};
const toItems = (ids) => ids.map((id) => ({ id, p: 1 }));

function genMeals(pid, { days = 14, skip = [], bias = 0, today = null } = {}) {
  const r = rng(pid + 'meals');
  const meals = [];
  for (let d = -days + 1; d <= 0; d++) {
    if (skip.includes(d)) continue;
    const plan = d === 0 && today ? today : ['breakfast', 'lunch', 'dinner', ...(r() < 0.55 ? ['snack'] : [])];
    plan.forEach((mt) => {
      let tpl;
      if (d === 0 && mt === 'lunch' && pid === 'p1') tpl = ['rice_white', 'fried_chicken', 'teh_ais'];
      else if (d === 0 && mt === 'breakfast' && pid === 'p1') tpl = ['roti_canai', 'dhal', 'kopi_o'];
      else {
        const list = MEAL_TEMPLATES[mt];
        tpl = list[Math.floor(clamp(r() + bias * r(), 0, 0.999) * list.length)];
      }
      const t = atDay(d, MT[mt].h - 1 + Math.floor(r() * 2), Math.floor(r() * 4) * 15);
      meals.push({ id: `${pid}_m${d}_${mt}`, pid, t, mt, items: toItems(tpl), photo: null });
    });
  }
  return meals.sort((a, b) => a.t - b.t);
}

const SPEC = {
  endo: { en: 'Endocrinologist', ms: 'Pakar Endokrinologi' },
  gp: { en: 'General Practitioner', ms: 'Doktor Am' },
  diet: { en: 'Dietitian', ms: 'Pegawai Dietetik' },
};
const ME_DOC = 'd1';

const REWARDS = [
  { id: 'rw1', e: '🩸', n: { en: 'Blood glucose check voucher', ms: 'Baucar ujian gula darah' }, cost: 300, partner: 'Klinik Setia Alam', bg: '#fde9e6' },
  { id: 'rw2', e: '🥬', n: { en: 'RM10 healthy groceries voucher', ms: 'Baucar barangan sihat RM10' }, cost: 400, partner: 'SegarMart', bg: '#e5f5ec' },
  { id: 'rw3', e: '👩‍⚕️', n: { en: '30% off doctor consultation', ms: 'Diskaun 30% konsultasi doktor' }, cost: 500, partner: APP_NAME, bg: '#d2f5ec' },
  { id: 'rw4', e: '🍎', n: { en: 'Fresh fruit box', ms: 'Kotak buah segar' }, cost: 650, partner: 'Buah Kita', bg: '#fff3d9' },
  { id: 'rw5', e: '📟', n: { en: 'Glucometer test strips (25)', ms: 'Jalur ujian glukometer (25)' }, cost: 900, partner: 'Farmasi Sihat', bg: '#e6eef8' },
  { id: 'rw6', e: '🏃', n: { en: '1-month gym pass', ms: 'Pas gim 1 bulan' }, cost: 1800, partner: 'FitZone', bg: '#efe8fb' },
];

const EARN_WAYS = [
  { icon: 'camera', n: { en: 'Log a meal', ms: 'Catat makanan' }, pts: 10 },
  { icon: 'file', n: { en: 'Upload a medical record', ms: 'Muat naik rekod perubatan' }, pts: 25 },
  { icon: 'walk', n: { en: 'Finish an exercise', ms: 'Selesaikan senaman' }, pts: 5 },
  { icon: 'flame', n: { en: '7-day logging streak', ms: 'Catat 7 hari berturut-turut' }, pts: 50 },
];
const TIERS = [
  { id: 'bronze', n: 'Bronze', min: 0, color: '#b9784a', bg: 'linear-gradient(135deg,#d39a6a,#a8683c)' },
  { id: 'silver', n: 'Silver', min: 500, color: '#7b8a92', bg: 'linear-gradient(135deg,#c3ccd1,#8a989f)' },
  { id: 'gold', n: 'Gold', min: 1500, color: '#c9921a', bg: 'linear-gradient(135deg,#f5c64f,#d08f12)' },
];
const tierOf = (life) => { let t = TIERS[0]; TIERS.forEach((x) => { if (life >= x.min) t = x; }); return t; };

function seedPoints() {
  const h = [
    { t: atDay(-13, 9), pts: 10, n: { en: 'Logged breakfast', ms: 'Catat sarapan' } },
    { t: atDay(-12, 20), pts: 50, n: { en: '7-day streak bonus', ms: 'Bonus 7 hari berturut-turut' } },
    { t: atDay(-11, 13), pts: 5, n: { en: 'Easy walk completed', ms: 'Jalan kaki santai selesai' } },
    { t: atDay(-10, 10), pts: -300, n: { en: 'Redeemed: Blood glucose check voucher', ms: 'Tebus: Baucar ujian gula darah' } },
    { t: atDay(-20, 10), pts: 25, n: { en: 'Uploaded lab result', ms: 'Muat naik keputusan makmal' } },
    { t: atDay(-4, 13), pts: 10, n: { en: 'Logged lunch', ms: 'Catat makan tengah hari' } },
    { t: atDay(-2, 19), pts: 10, n: { en: 'Logged dinner', ms: 'Catat makan malam' } },
    { t: atDay(-1, 14), pts: 5, n: { en: 'Light squats completed', ms: 'Skuat ringan selesai' } },
    { t: atDay(0, 8), pts: 10, n: { en: 'Logged breakfast', ms: 'Catat sarapan' } },
    { t: atDay(0, 13), pts: 10, n: { en: 'Logged lunch', ms: 'Catat makan tengah hari' } },
  ].sort((a, b) => b.t - a.t);
  return { balance: 1180, lifetime: 1340, history: h, vouchers: [] };
}

function seedChats() {
  const m = (from, t, text, extra = {}) => ({ id: uid('msg'), from, t, type: 'text', text, read: true, ...extra });
  return {
    'p1|d1': [
      m('doctor', atDay(-8, 10, 2), { en: 'Hi Encik Ahmad, I reviewed your latest lab results. HbA1c 7.6% — good progress from 7.9%!', ms: 'Hai Encik Ahmad, saya sudah semak keputusan makmal terkini. HbA1c 7.6% — kemajuan yang baik dari 7.9%!' }),
      m('patient', atDay(-8, 10, 15), { en: 'Thank you doctor. I have been walking after dinner.', ms: 'Terima kasih doktor. Saya sudah mula berjalan selepas makan malam.' }),
      m('doctor', atDay(-8, 10, 18), { en: 'Excellent. Please try to cut down on sweet drinks too — teh tarik adds a lot of sugar.', ms: 'Bagus. Cuba kurangkan minuman manis juga — teh tarik menambah banyak gula.' }),
    ],
    'p1|d3': [
      m('doctor', atDay(-3, 15, 30), { en: 'Hello! I am Nurul, your dietitian. Feel free to send me your meal logs anytime 😊', ms: 'Hai! Saya Nurul, pegawai dietetik anda. Hantar catatan makan anda bila-bila masa 😊' }),
    ],
    'p2|d1': [
      m('patient', atDay(0, 8, 12), { en: 'Doctor, my sugar was 12.8 mmol/L this morning. Should I be worried?', ms: 'Doktor, gula saya 12.8 mmol/L pagi ini. Perlu risau ke?' }, { read: false }),
      m('patient', atDay(0, 8, 13), { en: 'I also feel very thirsty.', ms: 'Saya juga rasa sangat dahaga.' }, { read: false }),
    ],
    'p3|d1': [
      m('doctor', atDay(-1, 16), { en: 'Your HbA1c went up to 8.1%. Let us review your diet and medication.', ms: 'HbA1c anda naik ke 8.1%. Mari kita semak diet dan ubat anda.' }),
      m('patient', atDay(0, 9, 40), { en: 'OK doctor, can we talk today?', ms: 'Baik doktor, boleh kita bincang hari ini?' }, { read: false }),
    ],
    'p6|d1': [
      m('patient', atDay(-2, 11), { en: 'Thanks doctor, my readings are much better now!', ms: 'Terima kasih doktor, bacaan saya jauh lebih baik sekarang!' }),
      m('doctor', atDay(-2, 11, 20), { en: 'Great to hear, Izzati. Keep it up!', ms: 'Gembira mendengarnya, Izzati. Teruskan!' }),
    ],
  };
}

function seedNotes() {
  return {
    p1: [{ id: 'n1', t: atDay(-8, 10, 30), doc: 'd1', text: { en: 'Reduce sweet drinks (teh tarik, teh ais) to max 3× a week. Walk 10–15 min after dinner. Repeat HbA1c in 3 months.', ms: 'Kurangkan minuman manis (teh tarik, teh ais) kepada maksimum 3× seminggu. Jalan kaki 10–15 min selepas makan malam. Ulang HbA1c dalam 3 bulan.' } }],
    p3: [{ id: 'n2', t: atDay(-1, 16, 10), doc: 'd1', text: { en: 'Consider increasing Metformin to 1 g BD. Refer to dietitian.', ms: 'Pertimbangkan menaikkan Metformin ke 1 g BD. Rujuk pegawai dietetik.' } }],
  };
}

const APPOINTMENTS = [
  { id: 'a1', time: '10:30', pid: 'p2', kind: 'video', reason: { en: 'High morning glucose', ms: 'Gula pagi tinggi' } },
  { id: 'a2', time: '11:15', pid: 'p3', kind: 'chat', reason: { en: 'HbA1c review', ms: 'Semakan HbA1c' } },
  { id: 'a3', time: '14:00', pid: 'p1', kind: 'chat', reason: { en: 'Monthly follow-up', ms: 'Susulan bulanan' } },
  { id: 'a4', time: '16:30', pid: 'p4', kind: 'video', reason: { en: 'Blood pressure check', ms: 'Semakan tekanan darah' } },
];

const QUICK_REPLIES = [
  { en: 'Reduce white rice, switch to brown rice.', ms: 'Kurangkan nasi putih, tukar ke nasi perang.' },
  { en: "Let's schedule an HbA1c check next month.", ms: 'Jadualkan ujian HbA1c bulan depan.' },
  { en: 'Please swap sweet drinks for plain water.', ms: 'Sila tukar minuman manis kepada air kosong.' },
  { en: 'Walk 10–15 min after each main meal.', ms: 'Jalan kaki 10–15 min selepas setiap hidangan utama.' },
  { en: 'Continue your medication as prescribed.', ms: 'Teruskan ubat seperti yang ditetapkan.' },
];

// Sample meal "photos" for demo (rendered as illustrations).
const SAMPLE_MEALS = [
  { id: 's1', items: ['nasi_lemak', 'egg', 'teh_tarik'], n: { en: 'Nasi lemak set', ms: 'Set nasi lemak' } },
  { id: 's2', items: ['rice_white', 'fried_chicken', 'teh_ais'], n: { en: 'Rice & fried chicken', ms: 'Nasi & ayam goreng' } },
  { id: 's3', items: ['rice_brown', 'grilled_fish', 'veg', 'water'], n: { en: 'Brown rice & fish', ms: 'Nasi perang & ikan' } },
  { id: 's4', items: ['roti_canai', 'dhal', 'teh_tarik'], n: { en: 'Roti canai set', ms: 'Set roti canai' } },
];

// Values the "OCR" reads from the sample lab report.
function computeStreak(meals) {
  const days = new Set(meals.map((m) => startOfDay(m.t)));
  let s = 0; let d = startOfDay(now());
  if (!days.has(d)) d -= DAY;
  while (days.has(d)) { s++; d -= DAY; }
  return s;
}
