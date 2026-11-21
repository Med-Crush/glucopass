/* ============ APP SHELL: store, router, splash, login ============ */
function initialState() {
  const patients = buildPatients();
  const diary = seedDiary(patients);
  return {
    patients,
    points: seedPoints(),
    chats: seedChats(),
    notes: seedNotes(),
    typing: {},
    exDone: { p1_m0_breakfast: ['walk'], 'p1_m-1_lunch': ['squat'], 'p1_m-2_dinner': ['walk'] },
    reminders: { meals: true, meds: true, exercise: true, lab: false },
    diary,
    league: seedLeague(patients, diary),
    sessions: { d1: { start: Date.now() - 6 * 60000, until: Date.now() + 24 * 60000, amount: 46, method: 'tng', ref: 'INV-204118' } },
    freeConsults: 0,
    docAvail: { online: true, video: true, days: [true, true, true, true, true, false, false] },
  };
}

const TABS = {
  patient: [
    { id: 'home', icon: 'home', l: () => T('Home', 'Utama') },
    { id: 'passport', icon: 'passport', l: () => T('Passport', 'Pasport') },
    { id: 'diary', icon: 'book', l: () => T('Diary', 'Diari'), center: true },
    { id: 'consult', icon: 'chat', l: () => T('Consult', 'Konsultasi') },
    { id: 'profile', icon: 'user', l: () => T('Profile', 'Profil') },
  ],
  doctor: [
    { id: 'home', icon: 'home', l: () => T('Home', 'Utama') },
    { id: 'patients', icon: 'users', l: () => T('Patients', 'Pesakit') },
    { id: 'chat', icon: 'chat', l: () => T('Chat', 'Sembang') },
    { id: 'profile', icon: 'user', l: () => T('Profile', 'Profil') },
  ],
};

const SCREENS = {
  patient: {
    home: PHome, diary: PDiary, passport: PPassport, consult: PConsult, profile: PProfile,
    exercise: PExercise, logmeal: PLog, outlook: POutlook, promo: PPromo, league: PLeague, doctor: PDoctor, checkout: PCheckout, meal: PMealDetail, record: PRecord, upload: PUpload, points: PPoints, voucher: PVoucher, chat: ChatScreen,
  },
  doctor: {
    home: DHome, patients: DPatients, chat: DChats, profile: DProfile,
    patient: DPatient, meal: PMealDetail, record: PRecord, chatroom: ChatScreen,
  },
};

function App() {
  const [S, setS] = useState(initialState);
  const [lang, setLangState] = useState(() => { try { return localStorage.getItem('gp_lang') || 'en'; } catch (e) { return 'en'; } });
  const [phase, setPhase] = useState('splash'); // splash | login | app
  const [role, setRole] = useState('patient');
  const [nav, setNav] = useState({ patient: { tab: 'home', tp: {}, stack: [] }, doctor: { tab: 'home', tp: {}, stack: [] }, dir: 'fade' });
  const [hideNav, setHideNav] = useState(false);
  const [toastS, setToast] = useState(null);
  const [burst, setBurst] = useState(null);
  CUR_LANG = lang;
  DOC[ME_DOC].status = S.docAvail.online ? 'online' : 'offline'; // doctor's availability toggle is reflected on the patient side

  const mutate = useCallback((fn) => setS((s) => { const d = structuredClone(s); fn(d); return d; }), []);
  const setLang = (l) => { setLangState(l); try { localStorage.setItem('gp_lang', l); } catch (e) {} };
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const toastT = useRef();
  const toast = useCallback((msg, icon) => { clearTimeout(toastT.current); setToast({ msg, icon, k: Math.random() }); toastT.current = setTimeout(() => setToast(null), 2600); }, []);
  const burstT = useRef();
  const award = useCallback((pts, label) => {
    mutate((d) => { d.points.balance += pts; d.points.lifetime += pts; d.points.history.unshift({ t: now(), pts, n: label }); });
    clearTimeout(burstT.current); setBurst({ pts, k: Math.random() }); burstT.current = setTimeout(() => setBurst(null), 1900);
  }, [mutate]);

  const sendMessage = useCallback((key, msg, from) => {
    const m = { id: uid('msg'), from, t: now(), read: false, type: 'text', ...msg };
    mutate((d) => { (d.chats[key] ||= []).push(m); });
    if (from === 'patient') {
      const did = key.split('|')[1];
      const delay = DOC[did].status === 'offline' ? 3600 : 2300;
      setTimeout(() => mutate((d) => { d.typing[key] = true; }), 800);
      setTimeout(() => mutate((d) => {
        d.typing[key] = false;
        (d.chats[key] ||= []).push({ id: uid('msg'), from: 'doctor', t: now(), read: false, type: 'text', text: autoReply(m, did, d) });
      }), delay + Math.random() * 900);
    }
  }, [mutate]);

  // role-aware navigation; the doctor's chat room is registered as "chatroom" since "chat" is a tab there
  const navApi = useMemo(() => ({
    push: (name, params = {}) => setNav((n) => {
      const nm = role === 'doctor' && name === 'chat' ? 'chatroom' : name;
      return { ...n, dir: 'push', [role]: { ...n[role], stack: [...n[role].stack, { name: nm, params, key: uid('s') }] } };
    }),
    back: () => setNav((n) => ({ ...n, dir: 'pop', [role]: { ...n[role], stack: n[role].stack.slice(0, -1) } })),
    replace: (name, params = {}) => setNav((n) => ({ ...n, dir: 'push', [role]: { ...n[role], stack: [...n[role].stack.slice(0, -1), { name, params, key: uid('s') }] } })),
    goTab: (tab, tp = {}) => setNav((n) => ({ ...n, dir: 'fade', [role]: { tab, tp, stack: [] } })),
  }), [role]);

  const enter = (r) => { setRole(r); setNav((n) => ({ ...n, dir: 'fade', [r]: { tab: 'home', tp: {}, stack: [] } })); setPhase('app'); setHideNav(false); };
  const logout = () => { setPhase('login'); };
  const switchRole = () => { const r = role === 'patient' ? 'doctor' : 'patient'; setRole(r); setHideNav(false); setNav((n) => ({ ...n, dir: 'fade' })); if (phase !== 'app') setPhase('app'); toast(r === 'doctor' ? T('Switched to Doctor view', 'Tukar ke paparan Doktor') : T('Switched to Patient view', 'Tukar ke paparan Pesakit'), 'swap'); };

  useEffect(() => { if (phase === 'splash') { const t = setTimeout(() => setPhase('login'), 1700); return () => clearTimeout(t); } }, [phase]);

  const ctx = { S, mutate, nav: navApi, role, toast, award, sendMessage, setHideNav, lang, setLang, logout };

  let body;
  if (phase === 'splash') body = <Splash />;
  else if (phase === 'login') body = <Login onEnter={enter} />;
  else {
    const cur = nav[role];
    const screens = [{ name: cur.tab, params: cur.tp, key: role + '-root-' + cur.tab, root: true }, ...cur.stack];
    const unreadP = Object.keys(S.chats).filter((k) => k.startsWith('p1|')).reduce((a, k) => a + S.chats[k].filter((m) => m.from === 'doctor' && !m.read).length, 0);
    const unreadD = Object.keys(S.chats).filter((k) => k.endsWith('|' + ME_DOC)).reduce((a, k) => a + S.chats[k].filter((m) => m.from === 'patient' && !m.read).length, 0);
    const badges = role === 'patient' ? { consult: unreadP } : { chat: unreadD };
    body = (
      <>
        {screens.map((sc, i) => {
          const top = i === screens.length - 1;
          const C = SCREENS[role][sc.name];
          const anim = !top ? '' : nav.dir === 'push' ? 'anim-push' : nav.dir === 'pop' ? 'anim-pop' : 'anim-fade';
          return (
            <div key={sc.key} className={`absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar bg-paper ${top ? anim : 'hidden'}`}>
              {C ? <C {...sc.params} /> : <EmptyState title="Screen not found" />}
            </div>
          );
        })}
        {cur.stack.length === 0 && !hideNav && <BottomNav tabs={TABS[role]} active={cur.tab} onTab={navApi.goTab} badges={badges} />}
      </>
    );
  }

  return (
    <Ctx.Provider value={ctx}>
      <div className="relative mx-auto h-[100dvh] max-w-[430px] bg-paper overflow-hidden md:shadow-[0_0_60px_rgba(16,48,44,.15)]">
        {body}
        <div id="overlay-root" className="absolute inset-0 pointer-events-none z-50" />
        <Toast toast={toastS} />
        <PointsBurst burst={burst} />
      </div>
      {phase !== 'splash' && <DevToggle role={role} onSwitch={switchRole} />}
      <DesktopCaption />
    </Ctx.Provider>
  );
}

function BottomNav({ tabs, active, onTab, badges }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-white/92 backdrop-blur-lg border-t border-slate-100 safe-b" style={{ background: 'rgba(255,255,255,.93)' }}>
      <div className="flex items-end h-[68px] px-1">
        {tabs.map((t) => {
          const on = t.id === active;
          if (t.center) return (
            <button key={t.id} onClick={() => onTab(t.id)} className="flex-1 flex flex-col items-center justify-end h-full pb-2" aria-label={t.l()}>
              <span className={`-mt-6 w-[58px] h-[58px] rounded-[20px] flex items-center justify-center text-white shadow-[0_10px_24px_-8px_rgba(11,138,118,.9)] border-4 border-paper ${on ? 'bg-brand-700' : 'bg-brand-600'}`}><Icon n={t.icon} s={25} /></span>
              <span className={`text-[10.5px] font-semibold mt-0.5 ${on ? 'text-brand-700' : 'text-ink-mute'}`}>{t.l()}</span>
            </button>
          );
          return (
            <button key={t.id} onClick={() => onTab(t.id)} className="flex-1 flex flex-col items-center justify-center h-full gap-1 relative" aria-label={t.l()}>
              <span className={`relative w-12 h-8 rounded-full flex items-center justify-center transition-colors ${on ? 'bg-brand-100 text-brand-700' : 'text-ink-mute'}`}>
                <Icon n={t.icon} s={21} sw={on ? 2.3 : 2} />
                {badges[t.id] > 0 && <span className="absolute -top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-risk-dot text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">{badges[t.id]}</span>}
              </span>
              <span className={`text-[10.5px] font-semibold ${on ? 'text-brand-700' : 'text-ink-mute'}`}>{t.l()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Logo({ size = 72 }) {
  return (
    <div className="relative rounded-[28%] bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-[0_14px_34px_-10px_rgba(11,138,118,.8)]" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size * 0.62} height={size * 0.62}>
        <path d="M24 7c-5 7-11 13-11 20a11 11 0 0 0 22 0c0-7-6-13-11-20z" fill="#fff" />
        <path d="M18.5 28h4l2-4 2.5 7 1.5-3h3" fill="none" stroke="#0b8a76" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute -top-1 -right-1 rounded-full bg-amber-400 border-[3px] border-white" style={{ width: size * 0.26, height: size * 0.26 }} />
    </div>
  );
}

function Splash() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 via-paper to-paper">
      <div className="logo-in"><Logo size={96} /></div>
      <div className="mt-5 text-3xl font-extrabold tracking-tight anim-fade" style={{ animationDelay: '.3s', animationFillMode: 'both' }}>{APP_NAME}</div>
      <div className="text-sm text-ink-mute mt-1 anim-fade" style={{ animationDelay: '.45s', animationFillMode: 'both' }}>{T('Meal diary & health passport for diabetes', 'Diari makanan & pasport kesihatan untuk diabetes')}</div>
      <div className="absolute bottom-14 flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-brand-400 tdot" style={{ animationDelay: i * 0.15 + 's' }} />)}</div>
    </div>
  );
}

function Login({ onEnter }) {
  const { setLang } = useApp();
  const [loading, setLoading] = useState(null);
  const go = (r) => { setLoading(r); setTimeout(() => onEnter(r), 900); };
  return (
    <div className="absolute inset-0 overflow-y-auto no-scrollbar bg-paper anim-fade">
      <div className="relative bg-gradient-to-b from-brand-100 to-paper px-6 pt-6 pb-4 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand-200/40" /><div className="absolute -left-10 top-40 w-28 h-28 rounded-full bg-amber-100/70" />
        <div className="relative flex justify-end">
          <div className="flex bg-white/80 rounded-full p-1 shadow-soft">
            {[['en', 'EN'], ['ms', 'BM']].map(([v, l]) => <button key={v} onClick={() => setLang(v)} className={`h-8 px-3.5 rounded-full text-xs font-bold ${CUR_LANG === v ? 'bg-brand-600 text-white' : 'text-ink-soft'}`}>{l}</button>)}
          </div>
        </div>
        <div className="relative mt-6"><Logo size={64} /></div>
        <h1 className="relative text-[28px] font-extrabold leading-tight mt-5">{T('Eat well,', 'Makan dengan bijak,')}<br /><span className="text-brand-700">{T('live in control.', 'hidup terkawal.')}</span></h1>
        <p className="relative text-sm text-ink-soft mt-2 max-w-[300px]">{T('Log meals by photo, keep your health records in one passport, and chat with your doctor.', 'Catat makanan dengan gambar, simpan rekod kesihatan dalam satu pasport, dan sembang dengan doktor anda.')}</p>
        <div className="relative flex gap-2 mt-5">
          {[['camera', T('AI meal scan', 'Imbas makanan AI')], ['passport', T('Health passport', 'Pasport kesihatan')], ['gift', T('Rewards', 'Ganjaran')]].map(([i, l]) => (
            <div key={i} className="flex-1 bg-white/80 rounded-2xl py-2.5 flex flex-col items-center gap-1 shadow-soft"><Icon n={i} s={18} className="text-brand-600" /><span className="text-[10.5px] font-semibold text-ink-soft text-center leading-tight px-1">{l}</span></div>
          ))}
        </div>
      </div>
      <div className="px-6 pb-10 pt-4">
        <div className="text-[13px] font-semibold text-ink-soft mb-3">{T('Continue as', 'Teruskan sebagai')}</div>
        {[
          { r: 'patient', icon: 'user', t: T('Sign in as Patient', 'Masuk sebagai Pesakit'), s: 'Ahmad Zaki · ' + T('demo account', 'akaun demo'), c: 'from-brand-500 to-brand-700' },
          { r: 'doctor', icon: 'steth', t: T('Sign in as Doctor', 'Masuk sebagai Doktor'), s: 'Dr. Aisyah Rahman · ' + T('demo account', 'akaun demo'), c: 'from-indigo-400 to-indigo-600' },
        ].map((o) => (
          <button key={o.r} onClick={() => go(o.r)} disabled={!!loading} className="w-full mb-3 flex items-center gap-4 p-4 rounded-[22px] bg-white shadow-soft text-left border-2 border-transparent hover:border-brand-200">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${o.c} text-white flex items-center justify-center`}><Icon n={o.icon} s={26} /></div>
            <div className="flex-1"><div className="font-bold text-[15px]">{o.t}</div><div className="text-xs text-ink-mute">{o.s}</div></div>
            {loading === o.r ? <div className="w-6 h-6 rounded-full border-[3px] border-brand-200 border-t-brand-600 animate-spin" /> : <Icon n="right" className="text-ink-mute" />}
          </button>
        ))}
        <div className="flex items-center gap-2 text-xs text-ink-mute mt-4 justify-center"><Icon n="lock" s={13} />{T('Protected under PDPA 2010 · prototype', 'Dilindungi di bawah PDPA 2010 · prototaip')}</div>
      </div>
    </div>
  );
}

function DevToggle({ role, onSwitch }) {
  return (
    <button onClick={onSwitch} title="Dev: switch role"
      className="fixed z-[90] left-0 bottom-[92px] md:bottom-auto md:left-auto md:top-5 md:right-5 h-9 pl-1 pr-1.5 md:pl-2 md:pr-3 rounded-r-full md:rounded-full bg-ink/70 text-white text-[11px] font-bold flex items-center gap-1 md:gap-1.5 shadow-lift backdrop-blur opacity-60 hover:opacity-100">
      <span className="w-6 h-6 md:w-5 md:h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center"><Icon n="swap" s={12} sw={2.6} /></span>
      <span className="hidden md:inline">DEV · {role === 'patient' ? T('Patient', 'Pesakit') : T('Doctor', 'Doktor')}</span>
      <span className="md:hidden">{role === 'patient' ? 'P' : 'D'}</span>
    </button>
  );
}

function DesktopCaption() {
  return (
    <div className="hidden lg:block fixed left-8 bottom-8 max-w-[260px] text-ink-soft">
      <div className="flex items-center gap-2 mb-2"><Logo size={32} /><span className="font-extrabold text-ink">{APP_NAME}</span></div>
      <div className="text-xs leading-relaxed">{T('Interactive prototype · mock data, simulated AI & OCR. Use the DEV toggle to switch between patient and doctor.', 'Prototaip interaktif · data contoh, AI & OCR disimulasikan. Guna togol DEV untuk tukar antara pesakit dan doktor.')}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
