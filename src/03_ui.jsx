/* ============ SHARED UI ============ */
const Ctx = createContext(null);
const useApp = () => useContext(Ctx);

const ST = {
  good: { bg: 'bg-good-bg', fg: 'text-good-fg', dot: '#34b27b', hex: '#1d7f52', soft: '#e5f5ec' },
  warn: { bg: 'bg-warn-bg', fg: 'text-warn-fg', dot: '#f0a92e', hex: '#a8670f', soft: '#fff3d9' },
  risk: { bg: 'bg-risk-bg', fg: 'text-risk-fg', dot: '#ec7461', hex: '#bb4536', soft: '#fde9e6' },
};
const stLabel = (s) => ({ good: T('Safe', 'Selamat'), warn: T('Watch', 'Perhatian'), risk: T('High', 'Tinggi') }[s]);
const glLabel = (s) => ({ good: T('Low', 'Rendah'), warn: T('Medium', 'Sederhana'), risk: T('High', 'Tinggi') }[s]);

function Badge({ s = 'good', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${ST[s].bg} ${ST[s].fg} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ST[s].dot }} />
      {children ?? stLabel(s)}
    </span>
  );
}

function Btn({ v = 'primary', className = '', children, icon, size = 'lg', ...p }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl select-none disabled:opacity-45';
  const sizes = { lg: 'h-14 px-5 text-[15px]', md: 'h-12 px-4 text-sm', sm: 'h-10 px-3.5 text-[13px] rounded-xl' };
  const vars = {
    primary: 'bg-brand-600 text-white shadow-[0_8px_20px_-8px_rgba(11,138,118,.7)] hover:bg-brand-700',
    secondary: 'bg-white text-ink border border-slate-200 hover:bg-slate-50',
    soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
    amber: 'bg-amber-400 text-amber-950 shadow-[0_8px_20px_-8px_rgba(240,169,46,.8)] hover:bg-amber-300',
    ghost: 'text-brand-700 hover:bg-brand-50',
    danger: 'bg-risk-bg text-risk-fg',
  };
  return <button className={`${base} ${sizes[size]} ${vars[v]} ${className}`} {...p}>{icon && <Icon n={icon} s={size === 'sm' ? 16 : 18} />}{children}</button>;
}

function Card({ className = '', children, onClick, ...p }) {
  const C = onClick ? 'button' : 'div';
  return <C onClick={onClick} className={`block w-full text-left bg-white rounded-[20px] shadow-soft ${className}`} {...p}>{children}</C>;
}

function Header({ title, sub, back = true, right, onBack, transparent }) {
  const { nav } = useApp();
  return (
    <div className={`sticky top-0 z-20 ${transparent ? '' : 'bg-paper/85 backdrop-blur-md'} `}>
      <div className="h-14 px-2 flex items-center gap-1">
        {back ? (
          <button onClick={onBack || nav.back} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5" aria-label="Back"><Icon n="left" s={22} /></button>
        ) : <div className="w-3" />}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[17px] truncate leading-tight">{title}</div>
          {sub && <div className="text-xs text-ink-mute truncate">{sub}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

function SectionTitle({ children, action, onAction }) {
  return (
    <div className="flex items-end justify-between mb-2.5 mt-6 px-0.5">
      <h3 className="font-bold text-[15px]">{children}</h3>
      {action && <button onClick={onAction} className="text-[13px] font-semibold text-brand-700 h-8 px-1">{action}</button>}
    </div>
  );
}

function Avatar({ name, hue = 170, size = 44, ring, photo, className = '' }) {
  const ini = name.replace(/^(Dr\.|Pn\.|En\.)\s*/, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
  return (
    <div className={`relative shrink-0 rounded-full flex items-center justify-center font-bold text-white ${ring ? 'ring-2 ring-white' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg,hsl(${hue} 55% 62%),hsl(${hue + 25} 50% 42%))` }}>
      {ini}
    </div>
  );
}

function StatusDot({ status }) {
  const c = { online: '#34b27b', busy: '#f0a92e', offline: '#b8c2c0' }[status];
  return (
    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: c }}>
      {status === 'online' && <span className="absolute inset-0 rounded-full ping2" style={{ background: c }} />}
    </span>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${on ? 'bg-brand-500' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}

function Segmented({ options, value, onChange, className = '', small }) {
  return (
    <div className={`flex p-1 bg-slate-100 rounded-2xl ${className}`}>
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`flex-1 ${small ? 'h-8 text-xs' : 'h-10 text-[13px]'} rounded-xl font-semibold transition-all ${value === o.v ? 'bg-white text-ink shadow-sm' : 'text-ink-mute'}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Chip({ active, children, onClick, icon }) {
  return (
    <button onClick={onClick} className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-semibold border transition-colors ${active ? 'bg-ink text-white border-ink' : 'bg-white text-ink-soft border-slate-200'}`}>
      {icon && <Icon n={icon} s={15} />}{children}
    </button>
  );
}

function Sheet({ open, onClose, title, children, footer }) {
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (open) { setMounted(true); const r = requestAnimationFrame(() => requestAnimationFrame(() => setShow(true))); return () => cancelAnimationFrame(r); }
    setShow(false); const t = setTimeout(() => setMounted(false), 300); return () => clearTimeout(t);
  }, [open]);
  const root = document.getElementById('overlay-root');
  if (!mounted || !root) return null;
  return ReactDOM.createPortal(
    <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
      <div onClick={onClose} className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`relative bg-white rounded-t-[28px] max-h-[90%] flex flex-col transition-transform duration-300 ease-out ${show ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="pt-2.5 pb-1 flex justify-center"><div className="w-10 h-1.5 rounded-full bg-slate-200" /></div>
        {title && (
          <div className="px-5 pt-1 pb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold text-lg leading-tight">{title}</h3>
            <button onClick={onClose} className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center hover:bg-slate-100" aria-label="Close"><Icon n="x" /></button>
          </div>
        )}
        <div className="overflow-y-auto no-scrollbar px-5 pb-5">{children}</div>
        {footer && <div className="px-5 pb-5 pt-2 safe-b border-t border-slate-100">{footer}</div>}
      </div>
    </div>, root);
}

function EmptyState({ icon = 'sparkles', title, text, action }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6">
      <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-4 relative">
        <Icon n={icon} s={34} sw={1.6} />
        <span className="absolute -right-1 top-2 w-4 h-4 rounded-full bg-amber-200" />
        <span className="absolute left-0 bottom-1 w-2.5 h-2.5 rounded-full bg-brand-200" />
      </div>
      <div className="font-bold">{title}</div>
      {text && <div className="text-sm text-ink-mute mt-1 max-w-[260px]">{text}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function Skeleton({ className = '' }) { return <div className={`skel ${className}`} />; }

/* ---------- Charts ---------- */
function Ring({ value, max, size = 120, stroke = 12, color = '#16a58c', track = '#e8efec', children }) {
  const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
  const pct = clamp(value / max, 0, 1);
  const [p, setP] = useState(0);
  useEffect(() => { const t = setTimeout(() => setP(pct), 60); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} className="ring-anim" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function Bar({ value, max, color = '#16a58c', h = 8 }) {
  const pct = clamp(value / max, 0, 1) * 100;
  return (
    <div className="w-full rounded-full bg-slate-100 overflow-hidden" style={{ height: h }}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: pct + '%', background: color }} />
    </div>
  );
}

function Sparkline({ data, color = '#16a58c', w = 90, h = 30 }) {
  if (!data || data.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data), max = Math.max(...data); const rg = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * (w - 6) + 3, h - 4 - ((v - min) / rg) * (h - 8)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={d + ` L${last[0]} ${h} L3 ${h} Z`} fill={color} opacity=".1" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill="#fff" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function LineChart({ points, color = '#16a58c', h = 160, band, fmt = (v) => v, labels }) {
  const W = 320, H = h, padL = 34, padR = 12, padT = 14, padB = 26;
  const vals = points.map((p) => p.v);
  let min = Math.min(...vals, band ? band[0] : Infinity), max = Math.max(...vals, band ? band[1] : -Infinity);
  const pad = (max - min) * 0.18 || 1; min -= pad; max += pad;
  const x = (i) => padL + (i / Math.max(1, points.length - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const d = points.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)).join(' ');
  const ticks = [min + pad, (min + max) / 2, max - pad];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: h }}>
      {band && <rect x={padL} width={W - padL - padR} y={y(band[1])} height={Math.max(0, y(band[0]) - y(band[1]))} fill="#34b27b" opacity=".08" rx="4" />}
      {ticks.map((t, i) => (
        <g key={i}><line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#e6ebe9" strokeDasharray="3 4" />
          <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#8a9b98">{fmt(t)}</text></g>
      ))}
      <path d={d + ` L${x(points.length - 1)} ${H - padB} L${padL} ${H - padB} Z`} fill={color} opacity=".08" />
      <path d={d} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="draw" style={{ strokeDasharray: 1000, '--len': 1000 }} />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.v)} r="4" fill="#fff" stroke={color} strokeWidth="2.2" />
          <text x={x(i)} y={y(p.v) - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#16302c">{fmt(p.v)}</text>
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#8a9b98">{labels ? labels[i] : fmtDate(p.t, { month: 'short', year: '2-digit' })}</text>
        </g>
      ))}
    </svg>
  );
}

function BarChart({ data, target, h = 150, unit = 'g' }) {
  const max = Math.max(target || 0, ...data.map((d) => d.v)) * 1.15 || 1;
  return (
    <div className="relative" style={{ height: h }}>
      {target && (
        <div className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400/80 z-10" style={{ bottom: `${(target / max) * (h - 22) + 22}px` }}>
          <span className="absolute right-0 -top-5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 rounded">{T('Target', 'Sasaran')} {target}{unit}</span>
        </div>
      )}
      <div className="absolute inset-0 flex items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="text-[10px] font-semibold text-ink-soft mb-1 tnum">{d.v ? Math.round(d.v) : ''}</div>
            <div className="w-full max-w-[28px] rounded-t-lg bar-grow" style={{ height: `${(d.v / max) * (h - 40)}px`, background: d.c || '#36bfa5', animationDelay: i * 0.05 + 's' }} />
            <div className="text-[10px] text-ink-mute mt-1.5 h-4">{d.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Food photo illustration ---------- */
const PLATE_BG = ['#f1dfc4', '#e3ece0', '#f2e1dc', '#e2ebf0', '#efe6d6'];
function FoodPhoto({ items, photo, className = '', seed = 'x' }) {
  if (photo) return <img src={photo} alt="" className={`object-cover ${className}`} />;
  const r = rng(seed);
  const foods = items.filter((i) => !FOOD[i.id]?.drink).slice(0, 4);
  const drinks = items.filter((i) => FOOD[i.id]?.drink).slice(0, 1);
  const POS = { 0: [], 1: [[48, 54, 30]], 2: [[37, 52, 22], [60, 58, 22]], 3: [[48, 40, 20], [35, 63, 19], [62, 63, 19]], 4: [[37, 41, 17], [60, 41, 17], [37, 64, 17], [60, 64, 17]] };
  const bg = PLATE_BG[Math.floor(r() * PLATE_BG.length)];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="100" height="100" fill={bg} />
      {[...Array(6)].map((_, i) => <rect key={i} y={i * 18 - 4} width="100" height="1.2" fill="#000" opacity=".035" />)}
      <ellipse cx="50" cy="58" rx="38" ry="36" fill="#000" opacity=".07" />
      <circle cx="48" cy="53" r="37" fill="#fff" />
      <circle cx="48" cy="53" r="29" fill="#f7f8f6" stroke="#eceeea" strokeWidth=".8" />
      {foods.map((f, i) => { const [x, y, s] = POS[foods.length][i]; return <text key={i} x={x} y={y} fontSize={s} textAnchor="middle" dominantBaseline="central">{FOOD[f.id].e}</text>; })}
      {drinks.map((f, i) => (<g key={'d' + i}><circle cx="85" cy="17" r="13" fill="#fff" opacity=".7" /><text x="85" y="18" fontSize="16" textAnchor="middle" dominantBaseline="central">{FOOD[f.id].e}</text></g>))}
      <text x="8" y="92" fontSize="12" opacity=".9">🥄</text>
    </svg>
  );
}

/* ---------- Pseudo QR code ---------- */
function QRCode({ seed = 'x', size = 76 }) {
  const N = 25; const r = rng(seed); const cells = [];
  const finder = (x, y) => (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!finder(x, y) && r() > 0.52) cells.push([x, y]);
  const F = ({ x, y }) => (<g><rect x={x} y={y} width="7" height="7" fill="#0f2a27" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" fill="#0f2a27" /></g>);
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} width={size} height={size} className="bg-white rounded-lg" shapeRendering="crispEdges">
      {cells.map(([x, y], i) => <rect key={i} x={x} y={y} width="1" height="1" fill="#0f2a27" />)}
      <F x={0} y={0} /><F x={N - 7} y={0} /><F x={0} y={N - 7} />
    </svg>
  );
}

/* ---------- Lab report document (sample / record image) ---------- */
// Row y-positions (percent) — shared with the OCR overlay so boxes line up.
function TextDoc({ rec, name = 'AHMAD ZAKI' }) {
  return (
    <div className="absolute inset-0 bg-[#fdfdfb] paper-lines text-[#25302e] p-[7%] overflow-hidden" style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
      <div className="text-[11px] font-bold">{rec.lab}</div>
      <div className="text-[7px] text-slate-500 mb-3">Tel: 03-5511 2200 · {fmtDate(rec.t)}</div>
      <div className="border-t border-slate-300 pt-2 text-[10px] font-bold tracking-wide mb-2">{rec.kind === 'rx' ? 'PRESCRIPTION  ℞' : 'MEDICAL LETTER'}</div>
      <div className="text-[8px] mb-3">Patient: {name}</div>
      <div className="text-[9px] leading-relaxed">{L(rec.text)}</div>
      <div className="absolute bottom-[10%] right-[8%] text-right text-[8px]"><div className="italic text-[13px] text-brand-800" style={{ fontFamily: 'cursive' }}>A. Rahman</div><div>Dr. Aisyah Rahman</div><div className="text-slate-500">MMC 48213</div></div>
    </div>
  );
}

/* ---------- Points burst overlay ---------- */
function PointsBurst({ burst }) {
  if (!burst) return null;
  const colors = ['#f0a92e', '#16a58c', '#ec7461', '#6fd8c1', '#f5c64f', '#7c9cf5'];
  return (
    <div key={burst.k} className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none">
      <div className="relative">
        {[...Array(28)].map((_, i) => {
          const a = (i / 28) * Math.PI * 2; const d = 90 + (i % 5) * 24;
          return <span key={i} className="confetti" style={{ left: '50%', top: '50%', background: colors[i % colors.length], '--x': Math.cos(a) * d + 'px', '--y': Math.sin(a) * d + 40 + 'px', '--r': (i * 47) + 'deg', animationDelay: (i % 4) * 0.03 + 's' }} />;
        })}
        <div className="pop flex flex-col items-center bg-white/95 rounded-[28px] px-8 py-5 shadow-lift">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(240,169,46,.9)] mb-2">
            <Icon n="star" s={30} fill="#fff" sw={1.5} />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tnum">+{burst.pts}</div>
          <div className="text-sm font-semibold text-ink-soft">{T('points earned!', 'mata diperoleh!')}</div>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="absolute top-3 left-3 right-3 z-[80] flex justify-center pointer-events-none" key={toast.k}>
      <div className="toast flex items-center gap-2.5 bg-ink text-white rounded-2xl px-4 py-3 shadow-lift text-sm font-medium max-w-full">
        <Icon n={toast.icon || 'check'} s={18} className="text-brand-300" />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}

function Disclaimer({ children }) {
  return (
    <div className="flex items-start gap-2 text-[12px] text-ink-mute bg-slate-100/70 rounded-xl px-3 py-2.5 mt-4">
      <Icon n="info" s={15} className="mt-0.5" />
      <span>{children || T('AI estimate — not a substitute for medical advice.', 'Anggaran AI — bukan pengganti nasihat perubatan.')}</span>
    </div>
  );
}

function AssistantAvatar({ size = 44 }) {
  return (
    <div className="relative shrink-0 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-white" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size * 0.72} height={size * 0.72}>
        <rect x="8" y="11" width="24" height="19" rx="9" fill="#fff" />
        <circle cx="16" cy="20" r="2.4" fill="#0c6f61" /><circle cx="24" cy="20" r="2.4" fill="#0c6f61" />
        <path d="M16.5 25c2 1.6 5 1.6 7 0" stroke="#0c6f61" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <line x1="20" y1="11" x2="20" y2="6" stroke="#fff" strokeWidth="2" /><circle cx="20" cy="5" r="2.2" fill="#f5c64f" />
      </svg>
    </div>
  );
}

function FileButton({ capture, onFile, children, className = '' }) {
  const ref = useRef();
  return (
    <>
      <input ref={ref} type="file" accept="image/*" {...(capture ? { capture: 'environment' } : {})} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(URL.createObjectURL(f)); e.target.value = ''; }} />
      <button className={className} onClick={() => ref.current.click()}>{children}</button>
    </>
  );
}

function ListRow({ icon, iconBg = 'bg-brand-50 text-brand-700', title, sub, right, onClick, last }) {
  const C = onClick ? 'button' : 'div';
  return (
    <C onClick={onClick} className={`w-full flex items-center gap-3 px-4 min-h-[60px] py-2.5 text-left ${last ? '' : 'border-b border-slate-100'}`}>
      {icon && <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}><Icon n={icon} s={19} /></div>}
      <div className="flex-1 min-w-0"><div className="font-semibold text-[14px] truncate">{title}</div>{sub && <div className="text-xs text-ink-mute truncate">{sub}</div>}</div>
      {right ?? (onClick && <Icon n="right" s={18} className="text-ink-mute" />)}
    </C>
  );
}
