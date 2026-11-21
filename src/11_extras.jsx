/* ============ BMI · AI HEALTH OUTLOOK · FREE CONSULT VIA ADS ============ */

/* ---------- BMI (Asian vs WHO) ---------- */
const BMI_STD = {
  asian: { cut: 23, obese: 27.5, n: { en: 'Asian (WHO Asia-Pacific)', ms: 'Asia (WHO Asia-Pasifik)' } },
  who: { cut: 25, obese: 30, n: { en: 'WHO international (non-Asian)', ms: 'WHO antarabangsa (bukan Asia)' } },
};
function bmiClass(b, std) {
  const s = BMI_STD[std];
  if (b < 18.5) return { s: 'warn', l: T('Underweight', 'Kurang berat badan') };
  if (b < s.cut) return { s: 'good', l: T('Normal', 'Normal') };
  if (b < s.obese) return { s: 'warn', l: T('Overweight', 'Berlebihan berat badan') };
  return { s: 'risk', l: T('Obese', 'Obes') };
}
function BmiScale({ b, std }) {
  const s = BMI_STD[std]; const lo = 15, hi = 35; const pct = (v) => ((clamp(v, lo, hi) - lo) / (hi - lo)) * 100;
  const segs = [[lo, 18.5, '#9cc3e8'], [18.5, s.cut, '#34b27b'], [s.cut, s.obese, '#f0a92e'], [s.obese, hi, '#ec7461']];
  return (
    <div className="relative mt-2">
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">{segs.map(([a, z, c], i) => <div key={i} style={{ width: pct(z) - pct(a) + '%', background: c, opacity: 0.75 }} />)}</div>
      <div className="absolute -top-1 w-1 h-4.5 rounded-full bg-ink" style={{ left: `calc(${pct(b)}% - 2px)`, height: 18 }} />
      <div className="relative h-4 mt-1 text-[9.5px] text-ink-mute tnum">{[18.5, s.cut, s.obese].map((v) => <span key={v} className="absolute -translate-x-1/2" style={{ left: pct(v) + '%' }}>{v}</span>)}</div>
    </div>
  );
}
function BmiCard({ pt }) {
  const w = latest(pt.metrics.weight)?.v; const h = latest(pt.metrics.height)?.v || pt.height;
  if (!w || !h) return null;
  const b = bmi(w, h);
  return (
    <Card className="p-4 mt-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-ink-soft"><Icon n="weight" s={14} /><span className="text-[12px] font-semibold">{T('Body Mass Index (BMI)', 'Indeks Jisim Badan (BMI)')}</span></div>
          <div className="flex items-baseline gap-1 mt-1"><span className="text-[32px] font-extrabold tnum leading-none">{num(b, 1)}</span><span className="text-xs text-ink-mute font-semibold">kg/m²</span></div>
        </div>
        <div className="text-right text-[11px] text-ink-mute bg-paper rounded-xl px-2.5 py-1.5 tnum leading-snug">
          <div className="font-semibold text-ink-soft">{T('Weight ÷ Height²', 'Berat ÷ Tinggi²')}</div>
          <div>{num(w, 1)} kg ÷ ({num(h / 100, 2)} m)²</div>
        </div>
      </div>
      {['asian', 'who'].map((std) => { const c = bmiClass(b, std); return (
        <div key={std} className={`mt-3 rounded-2xl p-3 ${std === 'asian' ? 'bg-brand-50/60 ring-1 ring-brand-100' : 'bg-paper'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[12.5px] font-bold leading-tight">{L(BMI_STD[std].n)}</div>
              <div className="text-[11px] text-ink-mute">{T('Overweight from', 'Berlebihan dari')} ≥ {BMI_STD[std].cut} · {T('Obese', 'Obes')} ≥ {BMI_STD[std].obese}</div>
            </div>
            <Badge s={c.s}>{c.l}</Badge>
          </div>
          <BmiScale b={b} std={std} />
        </div>); })}
      <div className="text-[11px] text-ink-mute mt-2.5 flex items-start gap-1.5"><Icon n="info" s={12} className="mt-0.5 shrink-0" />{T('Asians develop diabetes and heart disease at a lower BMI, so the Asian cut-off (23) is used for your care plan.', 'Orang Asia berisiko diabetes dan penyakit jantung pada BMI lebih rendah, jadi had Asia (23) digunakan untuk pelan rawatan anda.')}</div>
    </Card>
  );
}

/* ---------- AI health outlook from food history ---------- */
const PATTERNS = [
  { k: 'sweetdrink', ids: ['teh_ais', 'teh_tarik', 'milo_ais'], icon: 'droplet', w: 0.45, n: { en: 'Sweet drinks', ms: 'Minuman manis' },
    short: { en: 'Glucose jumps of +2–3 mmol/L after each drink, more thirst and afternoon tiredness.', ms: 'Gula naik +2–3 mmol/L selepas setiap minuman, lebih dahaga dan letih pada waktu petang.' },
    long: { en: 'Higher risk of nerve damage (tingling or numb feet), diabetic eye disease and kidney damage.', ms: 'Risiko lebih tinggi kerosakan saraf (kaki kebas), penyakit mata diabetik dan kerosakan buah pinggang.' },
    fix: { en: 'Switch to teh O kosong or plain water — this alone cuts ~20 g of sugar a day.', ms: 'Tukar kepada teh O kosong atau air kosong — ini sahaja mengurangkan ~20 g gula sehari.' } },
  { k: 'dessert', ids: ['kolak', 'kuih', 'cendol'], icon: 'cookie', w: 0.35, n: { en: 'Sweet desserts & kuih', ms: 'Pencuci mulut & kuih manis' },
    short: { en: 'Sharp sugar spikes between meals and more cravings.', ms: 'Lonjakan gula mendadak antara waktu makan dan lebih mengidam.' },
    long: { en: 'Weight gain and worse insulin resistance — you may need more medication or insulin sooner.', ms: 'Berat badan naik dan rintangan insulin bertambah — anda mungkin perlukan lebih ubat atau insulin lebih awal.' },
    fix: { en: 'Choose fruit like guava or apple; keep kuih to 2× a week, small portions.', ms: 'Pilih buah seperti jambu batu atau epal; hadkan kuih 2× seminggu, bahagian kecil.' } },
  { k: 'refined', ids: ['rice_white', 'nasi_lemak', 'nasi_goreng', 'nasi_ayam', 'roti_canai'], icon: 'zap', w: 0.25, n: { en: 'White rice & refined carbs', ms: 'Nasi putih & karbohidrat ditapis' },
    short: { en: 'Post-meal glucose often above 10 mmol/L for 1–2 hours.', ms: 'Gula selepas makan selalunya melebihi 10 mmol/L selama 1–2 jam.' },
    long: { en: 'Repeated spikes damage blood vessels — raising heart attack and stroke risk.', ms: 'Lonjakan berulang merosakkan salur darah — meningkatkan risiko serangan jantung dan strok.' },
    fix: { en: 'Swap to brown rice and use the "Suku-Suku Separuh" plate: ¼ rice, ¼ protein, ½ vegetables.', ms: 'Tukar ke nasi perang dan guna pinggan "Suku-Suku Separuh": ¼ nasi, ¼ protein, ½ sayur.' } },
  { k: 'fried', ids: ['fried_chicken', 'murtabak', 'mee_goreng', 'nasi_goreng'], icon: 'flame', w: 0.12, n: { en: 'Fried & oily food', ms: 'Makanan bergoreng & berminyak' },
    short: { en: 'Slower digestion keeps glucose high for longer after meals.', ms: 'Pencernaan lebih perlahan menyebabkan gula kekal tinggi lebih lama.' },
    long: { en: 'LDL cholesterol may rise; heart disease risk is 2–4× higher in people with diabetes.', ms: 'Kolesterol LDL mungkin naik; risiko penyakit jantung 2–4× lebih tinggi bagi pesakit diabetes.' },
    fix: { en: 'Choose grilled, steamed or soup dishes (ikan bakar, sup, soto).', ms: 'Pilih hidangan bakar, kukus atau sup (ikan bakar, sup, soto).' } },
];

function foodOutlook(pt) {
  const days = [...Array(7)].map((_, i) => startOfDay(atDay(i - 6)));
  const meals = pt.meals.filter((m) => m.t >= days[0]);
  const a1c = latest(pt.metrics.hba1c).v;
  const found = PATTERNS.map((p) => {
    const hit = days.map((d) => meals.some((m) => startOfDay(m.t) === d && m.items.some((i) => p.ids.includes(i.id))));
    const count = hit.filter(Boolean).length;
    const sugar = meals.flatMap((m) => m.items).filter((i) => p.ids.includes(i.id)).reduce((a, i) => a + FOOD[i.id].sugar * i.p, 0) / 7;
    const items = [...new Set(meals.flatMap((m) => m.items).filter((i) => p.ids.includes(i.id)).map((i) => L(FOOD[i.id].n)))];
    const rise = r1((p.w * count) / 7);
    return { ...p, hit, count, sugar, items, rise, s: count >= 5 ? 'risk' : count >= 3 ? 'warn' : 'good' };
  }).filter((p) => p.count >= 3).sort((a, b) => b.w * b.count - a.w * a.count);
  const cont = r1(a1c + found.reduce((a, p) => a + p.rise, 0));
  const better = r1(Math.max(6.5, a1c - 0.6));
  return { found, a1c, cont, better, days };
}

function OutlookCard() {
  const { S, nav } = useApp();
  const o = foodOutlook(S.patients.p1);
  if (!o.found.length) return null;
  const top = o.found[0];
  return (
    <Card className="p-4 mt-3" onClick={() => nav.push('outlook')}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-risk-bg text-risk-fg flex items-center justify-center"><Icon n="trend" s={16} /></div>
        <div className="flex-1"><div className="text-xs font-bold text-risk-fg uppercase tracking-wide">{T('AI health outlook', 'Ramalan kesihatan AI')}</div><div className="text-[11px] text-ink-mute">{T('Based on your last 7 days of meals', 'Berdasarkan makanan 7 hari lepas')}</div></div>
        <Icon n="right" s={18} className="text-ink-mute" />
      </div>
      <div className="text-[13.5px] leading-snug mt-2.5">
        {fill(T('You had {p} on {n} of the last 7 days. If you don\'t cut down, your HbA1c could reach about {c}% in 3 months.', 'Anda mengambil {p} pada {n} daripada 7 hari lepas. Jika tidak dikurangkan, HbA1c anda boleh mencecah kira-kira {c}% dalam 3 bulan.'), { p: L(top.n).toLowerCase(), n: top.count, c: num(o.cont, 1) })}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="rounded-2xl bg-risk-bg px-3 py-2"><div className="text-[10.5px] font-semibold text-risk-fg">{T('If you continue', 'Jika diteruskan')}</div><div className="text-lg font-extrabold text-risk-fg tnum">HbA1c {num(o.cont, 1)}%</div></div>
        <div className="rounded-2xl bg-good-bg px-3 py-2"><div className="text-[10.5px] font-semibold text-good-fg">{T('If you change', 'Jika anda berubah')}</div><div className="text-lg font-extrabold text-good-fg tnum">HbA1c {num(o.better, 1)}%</div></div>
      </div>
    </Card>
  );
}

function POutlook() {
  const { S, nav } = useApp();
  const pt = S.patients.p1;
  const o = foodOutlook(pt);
  const W = 320, H = 150, pad = 30;
  const ys = [o.a1c, o.cont, o.better]; const mn = Math.min(...ys, 6.5) - 0.3, mx = Math.max(...ys, 8) + 0.3;
  const x = (i) => pad + (i / 3) * (W - pad - 14); const y = (v) => 14 + (1 - (v - mn) / (mx - mn)) * (H - 40);
  const line = (to) => [0, 1, 2, 3].map((i) => `${i ? 'L' : 'M'}${x(i)} ${y(o.a1c + ((to - o.a1c) * i) / 3)}`).join(' ');
  return (
    <div className="pb-10">
      <Header title={T('AI health outlook', 'Ramalan kesihatan AI')} sub={T('What your recent eating could lead to', 'Kesan daripada pemakanan terkini anda')} />
      <div className="px-4 stagger">
        <Card className="p-4">
          <div className="font-bold text-[15px]">{T('HbA1c projection · next 3 months', 'Unjuran HbA1c · 3 bulan akan datang')}</div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-2" style={{ height: H }}>
            <rect x={pad} width={W - pad - 14} y={y(7)} height={H - 26 - y(7)} fill="#34b27b" opacity=".08" />
            <line x1={pad} x2={W - 14} y1={y(7)} y2={y(7)} stroke="#34b27b" strokeDasharray="4 4" /><text x={pad - 5} y={y(7) + 3} fontSize="10" textAnchor="end" fill="#8a9b98">7.0</text>
            <path d={line(o.cont)} stroke="#ec7461" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6 5" />
            <path d={line(o.better)} stroke="#16a58c" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx={x(0)} cy={y(o.a1c)} r="5" fill="#fff" stroke="#16302c" strokeWidth="2.5" />
            <text x={x(0)} y={y(o.a1c) - 10} fontSize="11" fontWeight="700" textAnchor="middle" fill="#16302c">{o.a1c}%</text>
            <text x={x(3) - 2} y={y(o.cont) - 8} fontSize="11" fontWeight="700" textAnchor="end" fill="#bb4536">{o.cont}%</text>
            <text x={x(3) - 2} y={y(o.better) + 16} fontSize="11" fontWeight="700" textAnchor="end" fill="#1d7f52">{o.better}%</text>
            {[T('Now', 'Kini'), '1m', '2m', '3m'].map((l, i) => <text key={i} x={x(i)} y={H - 6} fontSize="10" textAnchor="middle" fill="#8a9b98">{l}</text>)}
          </svg>
          <div className="flex gap-4 text-[11.5px] font-semibold mt-1">
            <span className="flex items-center gap-1.5 text-risk-fg"><span className="w-4 border-t-2 border-dashed border-risk-dot" />{T('If you continue', 'Jika diteruskan')}</span>
            <span className="flex items-center gap-1.5 text-good-fg"><span className="w-4 border-t-2 border-good-dot" />{T('If you follow the tips', 'Jika ikut cadangan')}</span>
          </div>
        </Card>

        <SectionTitle>{T('Patterns found in your food diary', 'Corak dalam diari makanan anda')}</SectionTitle>
        {o.found.length ? o.found.map((p) => (
          <Card key={p.k} className="p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ST[p.s].soft, color: ST[p.s].hex }}><Icon n={p.icon} s={19} /></div>
              <div className="flex-1 min-w-0"><div className="font-bold text-[14.5px]">{L(p.n)}</div><div className="text-[11.5px] text-ink-mute truncate">{p.items.join(', ')}</div></div>
              <Badge s={p.s}>{p.count}/7 {T('days', 'hari')}</Badge>
            </div>
            <div className="flex gap-1 mt-3">{p.hit.map((h, i) => (
              <div key={i} className="flex-1 text-center"><div className={`h-7 rounded-lg ${h ? '' : 'bg-slate-100'}`} style={h ? { background: ST[p.s].dot, opacity: 0.85 } : {}} /><div className="text-[9.5px] text-ink-mute mt-0.5">{new Date(o.days[i]).toLocaleDateString(locale(), { weekday: 'narrow' })}</div></div>
            ))}</div>
            <div className="text-[13px] font-semibold mt-3">{fill(T('You had {p} on {n} of the last 7 days{g}. If you don\'t stop:', 'Anda mengambil {p} pada {n} daripada 7 hari lepas{g}. Jika tidak berhenti:'), { p: L(p.n).toLowerCase(), n: p.count, g: p.sugar >= 3 ? fill(T(' (~{g} g sugar a day)', ' (~{g} g gula sehari)'), { g: Math.round(p.sugar) }) : '' })}</div>
            <div className="mt-2 space-y-2">
              {[['clock', T('Now', 'Sekarang'), L(p.short)], ['calendar', T('In 3 months', 'Dalam 3 bulan'), fill(T('HbA1c may rise by about {r}% from this habit alone.', 'HbA1c boleh naik kira-kira {r}% daripada tabiat ini sahaja.'), { r: num(Math.max(0.1, p.rise), 1) })], ['alert', T('Long term', 'Jangka panjang'), L(p.long)]].map(([i, l, t]) => (
                <div key={l} className="flex gap-2.5 items-start"><span className="w-7 h-7 rounded-lg bg-risk-bg text-risk-fg flex items-center justify-center shrink-0"><Icon n={i} s={14} /></span><div className="text-[12.5px] leading-snug"><b>{l}:</b> <span className="text-ink-soft">{t}</span></div></div>
              ))}
            </div>
            <div className="mt-3 rounded-2xl bg-good-bg p-3 flex gap-2.5 items-start"><Icon n="leaf" s={16} className="text-good-fg mt-0.5 shrink-0" /><div className="text-[12.5px] text-good-fg leading-snug"><b>{T('What to do instead', 'Apa yang boleh dibuat')}:</b> {L(p.fix)}</div></div>
          </Card>
        )) : <EmptyState icon="shield" title={T('No risky patterns this week', 'Tiada corak berisiko minggu ini')} text={T('Keep logging meals — the outlook updates every day.', 'Teruskan mencatat makanan — ramalan dikemas kini setiap hari.')} />}
        <Btn className="w-full mt-1" v="secondary" icon="chat" onClick={() => nav.push('chat', { pid: 'p1', did: 'd3' })}>{T('Ask a dietitian about this', 'Tanya pegawai dietetik')}</Btn>
        <Disclaimer>{T('AI projection from your food diary — an estimate to guide habits, not a diagnosis.', 'Unjuran AI daripada diari makanan anda — anggaran untuk panduan tabiat, bukan diagnosis.')}</Disclaimer>
      </div>
    </div>
  );
}

/* ---------- Free consultation by sharing an ad ---------- */
const AD_TEMPLATES = [
  { id: 'story', w: 1080, h: 1920, n: { en: 'My journey (Story 9:16)', ms: 'Perjalanan saya (Story 9:16)' } },
  { id: 'scan', w: 1080, h: 1080, n: { en: 'Snap & scan (Post 1:1)', ms: 'Ambil & imbas (Post 1:1)' } },
  { id: 'challenge', w: 1080, h: 1080, n: { en: '#KurangGula challenge (Post 1:1)', ms: 'Cabaran #KurangGula (Post 1:1)' } },
];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function adSvg(id, d) {
  const F = 'font-family="Arial, Helvetica, sans-serif"';
  if (id === 'story') return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16a58c"/><stop offset="1" stop-color="#0f4c45"/></linearGradient></defs>
<rect width="1080" height="1920" fill="url(#g)"/><circle cx="980" cy="160" r="260" fill="#fff" opacity=".07"/><circle cx="80" cy="1700" r="320" fill="#fff" opacity=".06"/>
<rect x="90" y="140" width="120" height="120" rx="34" fill="#fff"/><text x="150" y="222" font-size="70" text-anchor="middle">💧</text>
<text x="240" y="218" ${F} font-size="54" font-weight="700" fill="#fff">${APP_NAME}</text>
<text x="90" y="470" ${F} font-size="92" font-weight="800" fill="#fff">My diabetes,</text>
<text x="90" y="580" ${F} font-size="92" font-weight="800" fill="#ffd77a">under control 💪</text>
<text x="90" y="680" ${F} font-size="40" fill="#d2f5ec">${esc(d.name)} · ${d.age} years old · Type 2</text>
<rect x="90" y="780" width="900" height="380" rx="48" fill="#fff"/>
<text x="150" y="870" ${F} font-size="40" fill="#4d6460">My HbA1c</text>
<text x="150" y="1010" ${F} font-size="130" font-weight="800" fill="#bb4536">${d.from}%</text>
<text x="520" y="995" ${F} font-size="90" fill="#8a9b98">→</text>
<text x="640" y="1010" ${F} font-size="130" font-weight="800" fill="#0b8a76">${d.to}%</text>
<text x="150" y="1100" ${F} font-size="36" fill="#4d6460">${d.streak}-day meal diary streak 🔥</text>
<text x="90" y="1290" ${F} font-size="44" fill="#fff">📸 AI meal scan   📈 CGM   🪪 Health Passport</text>
<rect x="90" y="1560" width="900" height="200" rx="100" fill="#ffd77a"/>
<text x="540" y="1675" ${F} font-size="44" font-weight="700" text-anchor="middle" fill="#3b2a05">Your ads platform here</text></svg>`;
  if (id === 'scan') return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
<rect width="1080" height="1080" fill="#f6f7f3"/><circle cx="900" cy="180" r="220" fill="#d2f5ec"/><circle cx="160" cy="980" r="200" fill="#fff3d9"/>
<text x="80" y="170" ${F} font-size="76" font-weight="800" fill="#16302c">Snap. Scan.</text>
<text x="80" y="260" ${F} font-size="76" font-weight="800" fill="#0b8a76">Know your sugar.</text>
<rect x="80" y="330" width="920" height="470" rx="48" fill="#fff"/>
<circle cx="330" cy="565" r="170" fill="#f7f8f6" stroke="#e5e7e3" stroke-width="6"/><text x="330" y="600" font-size="150" text-anchor="middle">🍛</text>
<text x="560" y="470" ${F} font-size="36" fill="#4d6460">Nasi lemak · AI scan</text>
<text x="560" y="560" ${F} font-size="64" font-weight="800" fill="#16302c">50 g carbs</text>
<text x="560" y="640" ${F} font-size="40" font-weight="700" fill="#bb4536">≈ +4.2 mmol/L</text>
<text x="560" y="720" ${F} font-size="34" fill="#1d7f52">Tip: try brown rice 🌾</text>
<text x="80" y="880" ${F} font-size="38" fill="#4d6460">I log every meal with ${APP_NAME} — ${esc(d.name)}</text>
<rect x="80" y="930" width="920" height="100" rx="50" fill="#0b8a76"/>
<text x="540" y="995" ${F} font-size="38" font-weight="700" text-anchor="middle" fill="#fff">Your ads platform here</text></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
<defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd77a"/><stop offset="1" stop-color="#f6b73c"/></linearGradient></defs>
<rect width="1080" height="1080" fill="url(#a)"/><circle cx="960" cy="120" r="200" fill="#fff" opacity=".25"/>
<text x="80" y="160" ${F} font-size="44" font-weight="700" fill="#3b2a05">#KurangGula CHALLENGE</text>
<text x="80" y="300" ${F} font-size="84" font-weight="800" fill="#16302c">I swapped</text>
<text x="80" y="400" ${F} font-size="84" font-weight="800" fill="#16302c">teh tarik for</text>
<text x="80" y="500" ${F} font-size="84" font-weight="800" fill="#0c6f61">teh O kosong 🍵</text>
<rect x="80" y="570" width="920" height="230" rx="40" fill="#fff"/>
<text x="140" y="670" ${F} font-size="96" font-weight="800" fill="#0b8a76">−22 g</text>
<text x="470" y="650" ${F} font-size="38" fill="#4d6460">sugar every day</text>
<text x="470" y="710" ${F} font-size="38" fill="#4d6460">for ${d.streak} days straight ✅</text>
<text x="80" y="880" ${F} font-size="40" fill="#3b2a05">Join me on ${APP_NAME} — your diabetes diary</text>
<rect x="80" y="930" width="920" height="100" rx="50" fill="#16302c"/>
<text x="540" y="995" ${F} font-size="38" font-weight="700" text-anchor="middle" fill="#ffd77a">Your ads platform here</text></svg>`;
}
const svgUrl = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

function PPromo() {
  const { S, mutate, nav, toast } = useApp();
  const pt = S.patients.p1;
  const [tpl, setTpl] = useState('story');
  const [step, setStep] = useState(1);
  const [proof, setProof] = useState(null);
  const [platform, setPlatform] = useState('Instagram');
  const [checking, setChecking] = useState(false);
  const d = { name: pt.name.split(' ')[0], age: pt.age, from: pt.metrics.hba1c[0].v, to: latest(pt.metrics.hba1c).v, streak: computeStreak(pt.meals), code: 'AHMAD-' + pt.age + 'GP' };
  const T0 = AD_TEMPLATES.find((t) => t.id === tpl); const svg = adSvg(tpl, d);
  const caption = fill(T('Managing my diabetes is easier with {app} 📸📈 — AI meal scan, CGM and my Health Passport in one app. #KurangGula #DiabetesMalaysia #{app}', 'Urus diabetes lebih mudah dengan {app} 📸📈 — imbas makanan AI, CGM dan Pasport Kesihatan dalam satu app. #KurangGula #DiabetesMalaysia #{app}'), { app: APP_NAME, c: d.code });
  const download = () => {
    try {
      const img = new Image();
      img.onload = () => { const c = document.createElement('canvas'); c.width = T0.w; c.height = T0.h; c.getContext('2d').drawImage(img, 0, 0); c.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${APP_NAME}-${tpl}.png`; a.click(); toast(T('Image saved to your device', 'Imej disimpan ke peranti'), 'download'); }); };
      img.src = svgUrl(svg);
    } catch (e) { toast(T('Could not save image', 'Gagal simpan imej'), 'alert'); }
  };
  const copy = () => { try { navigator.clipboard.writeText(caption); } catch (e) {} toast(T('Caption copied', 'Kapsyen disalin'), 'copy'); };
  const submit = async () => {
    setChecking(true); await wait(2200);
    mutate((s) => { s.freeConsults = (s.freeConsults || 0) + 1; s.promoPosts = [...(s.promoPosts || []), { t: now(), platform, tpl }]; });
    setChecking(false); setStep(4);
  };
  const Steps = () => (
    <div className="flex items-center gap-2 mb-4">
      {[T('Pick', 'Pilih'), T('Post', 'Kongsi'), T('Upload proof', 'Muat naik bukti')].map((l, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-1.5"><span className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${step > i + 1 ? 'bg-good-dot text-white' : step === i + 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-ink-mute'}`}>{step > i + 1 ? '✓' : i + 1}</span><span className={`text-[11.5px] font-semibold ${step === i + 1 ? 'text-ink' : 'text-ink-mute'}`}>{l}</span></div>
          {i < 2 && <div className="flex-1 h-0.5 bg-slate-200 rounded" />}
        </React.Fragment>
      ))}
    </div>
  );

  if (step === 4) return (
    <div className="min-h-full flex flex-col px-6 pt-14 pb-8 text-center">
      <div className="pop mx-auto w-24 h-24 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-[0_16px_40px_-12px_rgba(240,169,46,.9)]"><Icon n="gift" s={46} /></div>
      <h2 className="text-2xl font-extrabold mt-6">{T('Free consultation unlocked!', 'Konsultasi percuma dibuka!')}</h2>
      <p className="text-ink-mute text-sm mt-1.5">{T('Thanks for spreading the word 💚 Your post was verified and 1 free 30-min consultation was added to your account.', 'Terima kasih kerana berkongsi 💚 Hantaran anda telah disahkan dan 1 konsultasi percuma 30 minit ditambah ke akaun anda.')}</p>
      <Card className="p-4 mt-6 flex items-center gap-3 text-left">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Icon n="ticket" s={22} /></div>
        <div className="flex-1"><div className="font-bold">{T('Free consultation', 'Konsultasi percuma')}</div><div className="text-xs text-ink-mute">{T('Any doctor · valid 30 days', 'Mana-mana doktor · sah 30 hari')}</div></div>
        <span className="text-lg font-extrabold text-amber-600">×{S.freeConsults || 1}</span>
      </Card>
      <div className="flex-1" />
      <Btn className="w-full mt-8" icon="chat" onClick={() => nav.goTab('consult')}>{T('Choose a doctor', 'Pilih doktor')}</Btn>
    </div>
  );

  return (
    <div className="min-h-full flex flex-col">
      <Header title={T('Free consultation', 'Konsultasi percuma')} sub={T('Share an ad · upload proof · consult free', 'Kongsi iklan · muat naik bukti · konsultasi percuma')} />
      <div className="px-4 pb-6">
        <Steps />
        {step === 1 && <div className="anim-fade">
          <div className="text-[13px] font-semibold text-ink-soft mb-2">{T('Ready-made templates — already personalised for you', 'Templat siap — sudah diperibadikan untuk anda')}</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
            {AD_TEMPLATES.map((t) => <Chip key={t.id} active={tpl === t.id} onClick={() => setTpl(t.id)}>{L(t.n)}</Chip>)}
          </div>
          <div className="mt-3 flex justify-center bg-slate-100 rounded-[22px] p-4">
            <img src={svgUrl(svg)} alt="" className={`rounded-2xl shadow-lift ${tpl === 'story' ? 'h-[420px]' : 'w-full max-w-[320px]'}`} />
          </div>
          
          <Btn className="w-full mt-4" onClick={() => setStep(2)}>{T('Use this template', 'Guna templat ini')}</Btn>
        </div>}
        {step === 2 && <div className="anim-fade">
          <Card className="p-3 flex gap-3 items-center">
            <img src={svgUrl(svg)} alt="" className="w-16 rounded-lg" />
            <div className="flex-1 min-w-0"><div className="font-semibold text-sm">{L(T0.n)}</div><div className="text-xs text-ink-mute">{T0.w}×{T0.h} PNG</div></div>
            <Btn size="sm" icon="download" onClick={download}>{T('Save', 'Simpan')}</Btn>
          </Card>
          <SectionTitle action={T('Copy', 'Salin')} onAction={copy}>{T('Caption', 'Kapsyen')}</SectionTitle>
          <Card className="p-4 text-[13px] leading-relaxed text-ink-soft">{caption}</Card>
          <SectionTitle>{T('How to qualify', 'Syarat kelayakan')}</SectionTitle>
          <Card className="p-4 space-y-2.5">
            {[T('Post the image on Instagram, TikTok, Facebook or X (public account).', 'Kongsi imej di Instagram, TikTok, Facebook atau X (akaun awam).'), T('Paste the caption and keep the post up for at least 7 days.', 'Tampal kapsyen dan kekalkan hantaran sekurang-kurangnya 7 hari.'), T('Take a screenshot of your post and upload it here.', 'Ambil tangkapan skrin hantaran dan muat naik di sini.'), T('1 free consultation per month.', '1 konsultasi percuma sebulan.')].map((s, i) => (
              <div key={i} className="flex gap-2.5 text-[13px] text-ink-soft"><span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>{s}</div>
            ))}
          </Card>
          <Btn className="w-full mt-4" onClick={() => setStep(3)}>{T("I've posted it", 'Saya sudah kongsi')}</Btn>
        </div>}
        {step === 3 && <div className="anim-fade">
          <div className="text-[13px] font-semibold text-ink-soft mb-2">{T('Where did you post it?', 'Di mana anda kongsi?')}</div>
          <div className="flex gap-2 flex-wrap">{['Instagram', 'TikTok', 'Facebook', 'X'].map((p) => <Chip key={p} active={platform === p} onClick={() => setPlatform(p)}>{p}</Chip>)}</div>
          <div className="mt-4">
            {proof ? (
              <div className="relative rounded-[22px] overflow-hidden bg-slate-100 flex justify-center p-3">
                <img src={proof} alt="" className="max-h-[360px] rounded-xl" />
                {checking && <><div className="absolute inset-0 scangrid" /><div className="scanline" /></>}
                {!checking && <button onClick={() => setProof(null)} className="absolute top-3 right-3 h-9 px-3 rounded-full bg-black/55 text-white text-xs font-semibold flex items-center gap-1.5"><Icon n="rotate" s={14} />{T('Change', 'Tukar')}</button>}
              </div>
            ) : (
              <div className="rounded-[22px] border-2 border-dashed border-brand-200 bg-brand-50/50 p-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-soft flex items-center justify-center text-brand-600 mb-3"><Icon n="upload" s={26} /></div>
                <div className="font-bold">{T('Upload a screenshot of your post', 'Muat naik tangkapan skrin hantaran')}</div>
                <div className="text-xs text-ink-mute mt-1 mb-4">{T('Make sure your account name and the post date are visible', 'Pastikan nama akaun dan tarikh hantaran kelihatan')}</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <FileButton onFile={setProof} className="h-12 rounded-2xl bg-brand-600 text-white font-semibold text-sm flex items-center justify-center gap-2"><Icon n="image" s={18} />{T('Gallery', 'Galeri')}</FileButton>
                  <button onClick={() => setProof(svgUrl(svg))} className="h-12 rounded-2xl bg-white border border-slate-200 font-semibold text-sm flex items-center justify-center gap-2">{T('Use demo', 'Guna demo')}<span className="text-[10px] font-bold bg-slate-200 text-ink-soft rounded px-1.5 py-0.5">DEMO</span></button>
                </div>
              </div>
            )}
          </div>
          <Btn className="w-full mt-4" icon={checking ? null : 'shield'} disabled={!proof || checking} onClick={submit}>{checking ? <><span className="w-5 h-5 rounded-full border-[3px] border-white/40 border-t-white animate-spin" />{T('Verifying post…', 'Mengesahkan hantaran…')}</> : T('Submit for verification', 'Hantar untuk pengesahan')}</Btn>
        </div>}
      </div>
    </div>
  );
}

function FreeConsultBanner() {
  const { S, nav } = useApp();
  const n = S.freeConsults || 0;
  return (
    <Card className="p-4 mt-4 relative overflow-hidden" onClick={() => nav.push('promo')}>
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-amber-100" />
      <div className="relative flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-white flex items-center justify-center"><Icon n="megaphone" s={22} /></div>
        <div className="flex-1">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">{n ? fill(T('{n} free consultation available', '{n} konsultasi percuma tersedia'), { n }) : T('Free consultation', 'Konsultasi percuma')}</div>
          <div className="font-bold text-[14px] leading-snug">{T('Share our ad, get a FREE doctor chat', 'Kongsi iklan kami, dapat sembang doktor PERCUMA')}</div>
          <div className="text-[11.5px] text-ink-mute">{T('Ready-made templates · just post & upload proof', 'Templat siap · kongsi & muat naik bukti')}</div>
        </div>
        <Icon n="right" className="text-ink-mute" />
      </div>
    </Card>
  );
}
