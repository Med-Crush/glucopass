/* ============ CGM: simulated continuous glucose + chart ============ */
// Deterministic simulation: baseline (from FBS) + dawn effect + a gamma-shaped rise after each meal
// (size ∝ glycaemic load, damped if the patient exercised after it) + small sensor noise.
const hashN = (i) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const MIN = 60000;
const glRise = (gl) => r1(gl * 0.085);

function cgmPrep(pt, exDone, from, to) {
  return {
    base: (latest(pt.metrics.fbs)?.v || 7) - 0.8,
    seed: pt.hue,
    meals: pt.meals.filter((m) => m.t > from - 330 * MIN && m.t < to)
      .map((m) => ({ t: m.t, amp: glRise(nutri(m.items).gl) * ((exDone[m.id] || []).length ? 0.72 : 1) })),
  };
}
function cgmModel(P, t, noise = true) {
  const d = new Date(t); const h = d.getHours() + d.getMinutes() / 60;
  let g = P.base + 0.9 * Math.exp(-((h - 6.5) ** 2) / 3) - 0.3 * Math.exp(-((h - 3) ** 2) / 4);
  for (const m of P.meals) { const dt = (t - m.t) / MIN; if (dt > 0 && dt < 330) g += m.amp * (dt / 50) * Math.exp(1 - dt / 50); }
  if (noise) g += (hashN(Math.floor(t / (5 * MIN)) + P.seed) - 0.5) * 0.35 + 0.22 * Math.sin(t / 1.9e6 + P.seed);
  return clamp(r1(g), 2.4, 22);
}
const snap5 = (t) => Math.floor(t / (5 * MIN)) * 5 * MIN;
function cgmSeries(pt, exDone, from, to, stepMin = 5) {
  const P = cgmPrep(pt, exDone, from, to); const out = [];
  for (let t = snap5(from); t <= to; t += stepMin * MIN) out.push({ t, v: cgmModel(P, t) });
  return out;
}
function cgmCurrent(pt, exDone) {
  const t = snap5(now()); const s = cgmSeries(pt, exDone, t - 15 * MIN, t, 5);
  const cur = latest(s); const rate = (cur.v - s[0].v) / 15; // mmol/L per min
  const arrow = rate > 0.11 ? '⇈' : rate > 0.06 ? '↑' : rate > 0.03 ? '↗' : rate < -0.11 ? '⇊' : rate < -0.06 ? '↓' : rate < -0.03 ? '↘' : '→';
  return { ...cur, rate, arrow };
}
function cgmStats(series) {
  if (!series.length) return { tir: 0, avg: 0, hi: 0, lo: 0 };
  const inR = series.filter((p) => p.v >= 3.9 && p.v <= 10).length;
  return { tir: Math.round((inR / series.length) * 100), avg: r1(series.reduce((a, p) => a + p.v, 0) / series.length), hi: series.filter((p) => p.v > 10).length, lo: series.filter((p) => p.v < 3.9).length };
}
// Peaks above 10 mmol/L (for diary "glucose events")
function cgmEvents(series) {
  const ev = []; let cur = null;
  series.forEach((p) => {
    if (p.v > 10) { if (!cur || p.v > cur.v) cur = { ...p }; }
    else if (cur) { ev.push({ ...cur, kind: 'high' }); cur = null; }
    if (p.v < 3.9 && !ev.some((e) => e.kind === 'low' && Math.abs(e.t - p.t) < 90 * MIN)) ev.push({ ...p, kind: 'low' });
  });
  if (cur) ev.push({ ...cur, kind: 'high' });
  return ev;
}

let chartUid = 0;
function GlucoseChart({ pt, from, to, nowT, h = 210, forecastMin = 0, compact }) {
  const { S } = useApp();
  const [hover, setHover] = useState(null);
  const id = useMemo(() => 'gc' + chartUid++, []);
  const W = 340, padL = 30, padR = 8, padT = 22, padB = 24;
  const pastTo = Math.min(to, nowT);
  const span = to - from;
  const step = span <= 6.5 * 3600000 ? 5 : span <= 12.5 * 3600000 ? 10 : 15;
  const past = cgmSeries(pt, S.exDone, from, pastTo, step);
  const fEnd = Math.min(to, nowT + forecastMin * MIN);
  const P = cgmPrep(pt, S.exDone, nowT, fEnd);
  const fc = []; if (forecastMin && nowT < to) for (let t = snap5(nowT); t <= fEnd; t += 5 * MIN) fc.push({ t, v: cgmModel(P, t, false), w: 0.12 * Math.sqrt(Math.max(0, t - nowT) / MIN) });
  const all = [...past, ...fc];
  const yMax = Math.max(15, ...all.map((p) => p.v + (p.w || 0))) + 0.5, yMin = 2;
  const x = (t) => padL + ((t - from) / span) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);
  const path = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + x(p.t).toFixed(1) + ' ' + y(p.v).toFixed(1)).join(' ');
  const cone = fc.length ? fc.map((p) => `${x(p.t).toFixed(1)},${y(p.v + p.w).toFixed(1)}`).join(' ') + ' ' + [...fc].reverse().map((p) => `${x(p.t).toFixed(1)},${y(p.v - p.w).toFixed(1)}`).join(' ') : '';
  const last = latest(past);
  const showNow = nowT >= from && nowT <= to;
  const tickH = span <= 3.5 * 3600000 ? 1 : span <= 6.5 * 3600000 ? 2 : span <= 12.5 * 3600000 ? 3 : 6;
  const ticks = []; { const d = new Date(from); d.setMinutes(0, 0, 0); let t = d.getTime() + 3600000; while (t < to) { if (new Date(t).getHours() % tickH === 0) ticks.push(t); t += 3600000; } }
  const meals = pt.meals.filter((m) => m.t >= from && m.t <= pastTo);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W;
    const t = from + ((px - padL) / (W - padL - padR)) * span;
    const src = t > nowT && fc.length ? fc : past; if (!src.length) return;
    const p = src.reduce((a, b) => (Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a)); setHover({ ...p, fc: src === fc });
  };
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full touch-none select-none" style={{ height: h }} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}>
      <defs><clipPath id={id}><rect x="0" y="0" width={W} height={y(10)} /></clipPath></defs>
      {showNow && <rect x={x(nowT)} y={padT - 8} width={W - padR - x(nowT)} height={h - padT - padB + 8} fill="#eef1f6" />}
      <rect x={padL} width={W - padL - padR} y={y(10)} height={y(3.9) - y(10)} fill="#34b27b" opacity=".09" />
      {[[13.9, '#ec7461'], [10, '#34b27b'], [3.9, '#ec7461']].map(([v, c]) => (
        <g key={v}><line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke={c} strokeDasharray="4 4" opacity=".65" />
          <text x={padL - 5} y={y(v) + 3.5} textAnchor="end" fontSize="10.5" fill="#8a9b98">{v}</text></g>
      ))}
      {ticks.map((t) => <text key={t} x={x(t)} y={h - 6} textAnchor="middle" fontSize="10" fill="#8a9b98">{fmtTime(t)}</text>)}
      {cone && <polygon points={cone} fill="#9aa9b8" opacity=".28" />}
      {fc.length > 0 && <path d={path(fc)} fill="none" stroke="#3b7a6c" strokeWidth="2.4" strokeDasharray="5 5" strokeLinecap="round" />}
      <path d={path(past)} fill="none" stroke="#2f6f62" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d={path(past)} fill="none" stroke="#e0912a" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#${id})`} />
      {meals.map((m) => (
        <g key={m.id}><line x1={x(m.t)} x2={x(m.t)} y1={padT} y2={h - padB} stroke="#c9d3d0" strokeDasharray="2 3" />
          <circle cx={x(m.t)} cy={h - padB - 9} r="8.5" fill="#fff" stroke="#e2e8f0" /><text x={x(m.t)} y={h - padB - 8.5} fontSize="10" textAnchor="middle" dominantBaseline="central">{FOOD[m.items[0].id]?.e}</text></g>
      ))}
      {showNow && <g><line x1={x(nowT)} x2={x(nowT)} y1={padT - 8} y2={h - padB} stroke="#7f8ea3" strokeWidth="1.3" />
        <text x={x(nowT)} y={padT - 11} textAnchor="middle" fontSize="11" fontWeight="700" fill="#16302c">{T('Now', 'Kini')}</text></g>}
      {last && showNow && <circle cx={x(last.t)} cy={y(last.v)} r="6" fill="#fff" stroke={last.v > 10 ? '#e0912a' : '#2f6f62'} strokeWidth="3" />}
      {hover && (() => { const hx = x(hover.t), hy = y(hover.v); const bx = clamp(hx - 38, padL, W - padR - 76); return (
        <g pointerEvents="none"><line x1={hx} x2={hx} y1={padT} y2={h - padB} stroke="#16302c" strokeWidth="1" opacity=".35" />
          <circle cx={hx} cy={hy} r="4.5" fill="#16302c" />
          <rect x={bx} y={Math.max(2, hy - 40)} width="76" height="30" rx="8" fill="#16302c" />
          <text x={bx + 38} y={Math.max(2, hy - 40) + 13} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{hover.v} mmol/L</text>
          <text x={bx + 38} y={Math.max(2, hy - 40) + 24} textAnchor="middle" fontSize="9" fill="#cbd5d1">{hover.fc ? T('forecast ', 'ramalan ') : ''}{fmtTime(hover.t)}</text></g>); })()}
    </svg>
  );
}

function GlucoseCard() {
  const { S, nav } = useApp();
  const pt = S.patients.p1;
  const [hrs, setHrs] = useState(6);
  const [, tick] = useState(0);
  const [sensor, setSensor] = useState(false);
  useEffect(() => { const i = setInterval(() => tick((x) => x + 1), 30000); return () => clearInterval(i); }, []);
  const nowT = now();
  const cur = cgmCurrent(pt, S.exDone);
  const fMin = hrs * 60 / 6;
  const P = cgmPrep(pt, S.exDone, nowT, nowT + fMin * MIN);
  const in30 = cgmModel(P, nowT + 30 * MIN, false);
  const day = cgmStats(cgmSeries(pt, S.exDone, nowT - 24 * 3600000, nowT, 15));
  const s = gStatus(cur.v);
  return (
    <Card className="p-4 mt-2">
      <div className="flex items-center justify-between gap-2">
        <div className="font-bold text-[17px]">{T('Glucose', 'Glukosa')}</div>
        <div className="flex p-1 bg-slate-100 rounded-xl">
          {[3, 6, 12, 24].map((hh) => <button key={hh} onClick={() => setHrs(hh)} className={`h-8 px-2.5 rounded-lg text-[12.5px] font-semibold ${hrs === hh ? 'bg-white shadow-sm text-ink' : 'text-ink-mute'}`}>{hh}{T('h', 'j')}</button>)}
        </div>
      </div>
      <div className="flex items-end justify-between mt-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[40px] font-extrabold leading-none tnum" style={{ color: ST[s].hex }}>{num(cur.v, 1)}</span>
            <span className="text-2xl font-bold" style={{ color: ST[s].hex }}>{cur.arrow}</span>
            <span className="text-xs text-ink-mute font-semibold ml-0.5">mmol/L</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5"><Badge s={s}>{gLabel(cur.v)}</Badge><span className="text-[11px] text-ink-mute whitespace-nowrap">{T('just now', 'baru tadi')}</span></div>
        </div>
        <button onClick={() => setSensor(true)} className="flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-good-bg text-good-fg text-[11.5px] font-bold whitespace-nowrap shrink-0">
          <span className="relative w-2 h-2"><span className="absolute inset-0 rounded-full bg-good-dot" /><span className="absolute inset-0 rounded-full bg-good-dot ping2" /></span>CGM {T('live', 'langsung')}
        </button>
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-50 text-brand-800 px-3 h-8 text-[12px] font-semibold">
        <Icon n="sparkles" s={14} />{T('AI forecast', 'Ramalan AI')} · 30 min: <b className="tnum">{num(in30, 1)}</b> mmol/L
      </div>
      <div className="mt-1 -mx-1">
        <GlucoseChart pt={pt} from={nowT - hrs * 3600000} to={nowT + fMin * MIN} nowT={nowT} forecastMin={fMin} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-1">
        {[[day.tir + '%', T('Time in range', 'Masa dalam julat'), day.tir >= 70 ? 'good' : 'warn'], [num(day.avg, 1), T('Average · 24h', 'Purata · 24j'), gStatus(day.avg)], [Math.round(day.hi * 15 / 60 * 10) / 10 + T(' h', ' j'), T('Above 10 mmol/L', 'Melebihi 10 mmol/L'), day.hi > 12 ? 'warn' : 'good']].map(([v, l, st], i) => (
          <button key={i} onClick={() => nav.goTab('diary')} className="bg-paper rounded-2xl py-2.5 px-2 text-center">
            <div className="text-[17px] font-extrabold tnum" style={{ color: ST[st].hex }}>{v}</div><div className="text-[10.5px] text-ink-mute leading-tight">{l}</div>
          </button>
        ))}
      </div>
      <div className="text-[10.5px] text-ink-mute mt-2.5 flex items-center gap-1"><Icon n="info" s={12} />{T('Target range 3.9 – 10.0 mmol/L · tap the chart to inspect', 'Julat sasaran 3.9 – 10.0 mmol/L · ketik carta untuk butiran')}</div>
      <CgmSheet open={sensor} onClose={() => setSensor(false)} />
    </Card>
  );
}

function CgmSheet({ open, onClose }) {
  const { toast } = useApp();
  const [syncing, setSyncing] = useState(false);
  const rows = [
    [T('Device', 'Peranti'), T('CGM sensor (14-day)', 'Sensor CGM (14 hari)')],
    [T('Connection', 'Sambungan'), 'Bluetooth · ' + T('connected', 'bersambung')],
    [T('Sensor started', 'Sensor dimulakan'), fmtDate(atDay(-5, 8))],
    [T('Sensor ends', 'Sensor tamat'), fmtDate(atDay(9, 8)) + ' (' + T('9 days left', '9 hari lagi') + ')'],
    [T('Reading interval', 'Selang bacaan'), T('every 5 minutes', 'setiap 5 minit')],
    [T('Alerts', 'Amaran'), T('Low < 3.9 · High > 13.9', 'Rendah < 3.9 · Tinggi > 13.9')],
  ];
  return (
    <Sheet open={open} onClose={onClose} title={T('CGM sensor', 'Sensor CGM')}>
      <div className="flex items-center gap-3 bg-good-bg rounded-2xl p-3.5 mb-3">
        <div className="w-11 h-11 rounded-full bg-white text-good-fg flex items-center justify-center"><Icon n="sensor" /></div>
        <div><div className="font-bold text-sm text-good-fg">{T('Connected & streaming', 'Bersambung & menghantar data')}</div><div className="text-xs text-ink-soft">{T('Readings sync to your doctor automatically', 'Bacaan disegerakkan kepada doktor secara automatik')}</div></div>
      </div>
      {rows.map(([k, v], i) => <div key={i} className="flex justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0 text-sm"><span className="text-ink-soft">{k}</span><span className="font-semibold text-right">{v}</span></div>)}
      <Btn className="w-full mt-4" icon={syncing ? null : 'rotate'} disabled={syncing} onClick={async () => { setSyncing(true); await wait(1400); setSyncing(false); toast(T('Sensor synced', 'Sensor disegerakkan'), 'bluetooth'); }}>
        {syncing ? <><span className="w-5 h-5 rounded-full border-[3px] border-white/40 border-t-white animate-spin" />{T('Syncing…', 'Menyegerak…')}</> : T('Sync now', 'Segerak sekarang')}
      </Btn>
    </Sheet>
  );
}
