/* ============ LEAGUE: weekly healthy-eating leaderboard + friends (Duolingo-style) ============ */
const LEAGUE_TIERS = [
  { id: 'bronze', n: { en: 'Bronze', ms: 'Gangsa' }, c1: '#e0a877', c2: '#a8683c' },
  { id: 'silver', n: { en: 'Silver', ms: 'Perak' }, c1: '#bfc9cf', c2: '#74838b' },
  { id: 'gold', n: { en: 'Gold', ms: 'Emas' }, c1: '#f7d36a', c2: '#d08f12' },
  { id: 'emerald', n: { en: 'Emerald', ms: 'Zamrud' }, c1: '#6fe0b4', c2: '#13906a' },
  { id: 'diamond', n: { en: 'Diamond', ms: 'Berlian' }, c1: '#a5dcff', c2: '#4a7fe0' },
];
const MY_TIER = 1;
const PROMOTE = 5;
const DEMOTE = 3;

// XP rules: a healthy plate is worth the most, but every honest log still counts.
const XP_RULES = [
  { k: 'good', icon: 'leaf', n: { en: 'Healthy meal', ms: 'Hidangan sihat' }, xp: 20, c: 'bg-good-bg text-good-fg' },
  { k: 'warn', icon: 'utensils', n: { en: 'Moderate meal', ms: 'Hidangan sederhana' }, xp: 10, c: 'bg-amber-50 text-amber-700' },
  { k: 'risk', icon: 'alert', n: { en: 'High-sugar meal', ms: 'Hidangan tinggi gula' }, xp: 3, c: 'bg-rose-50 text-rose-600' },
  { k: 'exercise', icon: 'walk', n: { en: 'Activity', ms: 'Aktiviti' }, xp: 5, c: 'bg-brand-50 text-brand-800' },
  { k: 'med', icon: 'pill', n: { en: 'Medicine taken', ms: 'Ubat diambil' }, xp: 5, c: 'bg-slate-100 text-ink-soft' },
];
const XP = Object.fromEntries(XP_RULES.map((r) => [r.k, r.xp]));
const mealXp = (m) => XP[mealStatus(nutri(m.items))];

const weekStart = (t = now()) => { const d = new Date(startOfDay(t)); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
const weekLeft = () => {
  const ms = Math.max(0, weekStart() + 7 * DAY - now());
  const d = Math.floor(ms / DAY); const h = Math.floor((ms % DAY) / 3600000); const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return fill(T('{d}d {h}h left', '{d} hari {h} jam lagi'), { d, h });
  return fill(T('{h}h {m}m left', '{h} jam {m} min lagi'), { h, m });
};

// This week's XP for the signed-in patient, derived from the diary so it updates as they log.
function myWeek(S) {
  const ws = weekStart(); const t1 = now();
  const meals = S.patients.p1.meals.filter((m) => m.t >= ws && m.t <= t1);
  const extra = (S.diary.p1 || []).filter((e) => e.t >= ws && e.t <= t1);
  let xp = 0; let healthy = 0;
  meals.forEach((m) => { const s = mealStatus(nutri(m.items)); xp += XP[s]; if (s === 'good') healthy++; });
  extra.forEach((e) => { xp += XP[e.kind] || 0; });
  return { xp, healthy, meals: meals.length };
}

const LEAGUE_PEOPLE = [
  ['u1', 'Siti Aminah', 330, 1.82, 12], ['u2', 'Raj Kumar', 25, 1.5, 30], ['u3', 'Nurul Izzah', 300, 1.28, 8],
  ['u4', 'Jason Tan', 200, 1.06, 5], ['u5', 'Aisyah Rahim', 160, 0.92, 4], ['u6', 'Kavitha Suresh', 45, 0.83, 9],
  ['u7', 'Hafiz Musa', 120, 0.7, 2], ['u8', 'Lim Wei Jie', 220, 0.59, 6], ['u9', 'Zulkifli Abu', 95, 0.48, 1],
  ['u10', 'Priya Nair', 350, 0.37, 3], ['u11', 'Daniel Wong', 185, 0.26, 0], ['u12', 'Fatimah Zahra', 270, 0.15, 2],
  ['u13', 'Ong Mei Xin', 240, 0.07, 0], ['u14', 'Azman Yusof', 60, 0.02, 0],
];

function seedLeague(patients, diary) {
  const me = myWeek({ patients, diary });
  const base = Math.max(me.xp, 160);
  const others = LEAGUE_PEOPLE.map(([id, name, hue, f, streak], i) => ({ id, name, hue, streak, xp: Math.max(0, Math.round(base * f + ((i * 7) % 5))) }));
  const friends = [
    { id: 'f1', name: 'Siti Aminah', rel: { en: 'Same clinic', ms: 'Klinik sama' }, hue: 330, tier: 1, xp: others[0].xp, streak: 12, today: true },
    { id: 'f2', name: 'Faizal Hamid', rel: { en: 'Gym buddy', ms: 'Rakan gim' }, hue: 210, tier: 2, xp: Math.round(base * 1.36), streak: 21, today: true },
    { id: 'f3', name: 'Rosnah Zaki', rel: { en: 'Sister', ms: 'Kakak' }, hue: 20, tier: 0, xp: Math.round(base * 0.55), streak: 3, today: false },
    { id: 'f4', name: 'Mei Ling', rel: { en: 'Colleague', ms: 'Rakan sekerja' }, hue: 280, tier: 1, xp: Math.round(base * 0.31), streak: 0, today: false },
  ];
  return {
    others, friends, nudged: {}, duels: {},
    quest: { with: 'f1', theirs: 7, goal: me.healthy + 7 + 3, claimed: false },
    suggest: [
      { id: 's1', name: 'Hafiz Rahman', hue: 150, mutual: 3 },
      { id: 's2', name: 'Kavitha S.', hue: 45, mutual: 2 },
      { id: 's3', name: 'Daniel Wong', hue: 185, mutual: 1 },
      { id: 's4', name: 'Norazlina Idris', hue: 310, mutual: 1 },
    ],
  };
}

// Sorted league table with the patient merged in.
function useBoard() {
  const { S } = useApp();
  const pt = S.patients.p1;
  const me = myWeek(S);
  const rows = [{ id: 'me', name: pt.name, hue: pt.hue, xp: me.xp, me: true, streak: computeStreak(pt.meals) }, ...S.league.others]
    .sort((a, b) => b.xp - a.xp || (a.me ? -1 : b.me ? 1 : 0));
  const rank = rows.findIndex((r) => r.me) + 1;
  const above = rows[rank - 2];
  return { rows, rank, me, above, gap: above ? above.xp - me.xp + 1 : 0 };
}

function LeagueShield({ tier = MY_TIER, size = 44, locked }) {
  const t = LEAGUE_TIERS[tier]; const gid = useMemo(() => uid('lg'), []);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="shrink-0">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={locked ? '#e5e9ea' : t.c1} /><stop offset="1" stopColor={locked ? '#b9c2c4' : t.c2} /></linearGradient></defs>
      <path d="M24 3 41 9v13c0 11-7.4 19.4-17 23C14.4 41.4 7 33 7 22V9z" fill={`url(#${gid})`} />
      <path d="M24 7.5 37 12v10c0 8.6-5.6 15.4-13 18.5C16.6 37.4 11 30.6 11 22V12z" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" />
      {locked ? <path d="M19 24h10v8H19zM21 24v-3a3 3 0 0 1 6 0v3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        : <path d="m24 15 2.6 5.4 5.9.8-4.3 4.1 1 5.8L24 28.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z" fill="#fff" />}
    </svg>
  );
}

/* ---------- compact card on the Diary tab ---------- */
function LeagueCard() {
  const { S, nav } = useApp();
  const b = useBoard();
  const tier = LEAGUE_TIERS[MY_TIER];
  const line = b.rank === 1 ? T("You're leading the league! 👑", 'Anda mendahului liga! 👑')
    : fill(T('{n} XP to pass {who}', '{n} XP untuk potong {who}'), { n: b.gap, who: b.above.name.split(' ')[0] });
  return (
    <button onClick={() => nav.push('league')} className="w-full mt-3 bg-white rounded-2xl shadow-soft p-3 flex items-center gap-3 text-left">
      <LeagueShield tier={MY_TIER} size={46} />
      <div className="flex-1 min-w-0">
        <div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-mute truncate">{fill(T('{t} League', 'Liga {t}'), { t: L(tier.n) })} · {weekLeft()}</div>
        <div className="font-extrabold text-[15px] leading-tight mt-0.5">#{b.rank} <span className="text-ink-mute font-semibold text-[13px] tnum">· {b.me.xp} XP {T('this week', 'minggu ini')}</span></div>
        <div className="text-[11.5px] text-brand-700 font-semibold mt-0.5 leading-snug">{b.rank > 1 && b.rank <= PROMOTE && '▲ '}{line}</div>
      </div>
      <div className="flex -space-x-2.5">{S.league.friends.slice(0, 3).map((f) => <Avatar key={f.id} name={f.name} hue={f.hue} size={26} ring />)}</div>
      <Icon n="right" s={18} className="text-ink-mute" />
    </button>
  );
}

const shortName = (n) => { const w = n.split(' '); return w.length > 1 ? w[0] + ' ' + w[w.length - 1][0] + '.' : n; };

function RankRow({ rank, r, right, sub, short }) {
  const medal = ['#f2b927', '#a9b4ba', '#cd8a55'][rank - 1];
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl ${r.me ? 'bg-brand-50 ring-2 ring-brand-500/60' : ''}`}>
      <div className="w-7 text-center shrink-0">
        {medal ? <span className="inline-flex w-7 h-7 rounded-full items-center justify-center text-[12px] font-extrabold text-white" style={{ background: medal }}>{rank}</span>
          : <span className="text-[13px] font-bold text-ink-mute tnum">{rank}</span>}
      </div>
      <Avatar name={r.name} hue={r.hue} size={38} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] truncate">{short && !r.me ? shortName(r.name) : r.name}{r.me && <span className="text-brand-700"> ({T('You', 'Anda')})</span>}</div>
        <div className="text-[11px] text-ink-mute flex items-center gap-1.5">
          {sub}
          {r.streak > 0 && <span className="inline-flex items-center gap-0.5 text-amber-600 font-semibold"><Icon n="flame" s={11} />{r.streak}</span>}
        </div>
      </div>
      {right || <span className="font-extrabold text-[14px] tnum shrink-0">{r.xp} <span className="text-[11px] text-ink-mute font-semibold">XP</span></span>}
    </div>
  );
}

function ZoneLine({ up }) {
  return (
    <div className={`flex items-center gap-2 my-1.5 px-2 text-[10.5px] font-bold uppercase tracking-wide ${up ? 'text-good-fg' : 'text-rose-500'}`}>
      <span className="flex-1 h-px bg-current opacity-30" />
      <Icon n={up ? 'trend' : 'down'} s={13} />
      {up ? fill(T('Promotion zone · top {n}', 'Zon naik liga · {n} teratas'), { n: PROMOTE }) : T('Demotion zone', 'Zon turun liga')}
      <span className="flex-1 h-px bg-current opacity-30" />
    </div>
  );
}

/* ---------- full leaderboard screen ---------- */
function PLeague({ tab: tab0 = 'league' }) {
  const { S, mutate, toast, award } = useApp();
  const [tab, setTab] = useState(tab0);
  const [sheet, setSheet] = useState(null); // rules | add | duel:<fid>
  const [q, setQ] = useState('');
  const b = useBoard();
  const lg = S.league;
  const tier = LEAGUE_TIERS[MY_TIER];
  const close = () => setSheet(null);

  // friends board: me + friends, sorted by weekly XP
  const fRows = [{ id: 'me', name: S.patients.p1.name, hue: S.patients.p1.hue, xp: b.me.xp, me: true, tier: MY_TIER, streak: b.rows.find((r) => r.me).streak, today: S.patients.p1.meals.some((m) => isToday(m.t)) }, ...lg.friends]
    .sort((a, c) => c.xp - a.xp);
  const quest = lg.quest; const qf = lg.friends.find((f) => f.id === quest.with);
  const qDone = b.me.healthy + quest.theirs;
  const duelFid = sheet?.startsWith('duel:') ? sheet.slice(5) : null;
  const duelF = lg.friends.find((f) => f.id === duelFid);
  const duelProgress = (fid) => { const d = lg.duels[fid]; const mins = Math.floor((now() - d.start) / 60000); return { me: Math.max(0, b.me.xp - d.mine0), them: Math.min(140, mins * 3) }; };

  const nudge = (f) => { mutate((d) => { d.league.nudged[f.id] = true; }); toast(fill(T('Nudge sent to {n} 👋', 'Cuitan dihantar kepada {n} 👋'), { n: f.name.split(' ')[0] }), 'bell'); };
  const addFriend = (s) => {
    mutate((d) => {
      d.league.suggest = d.league.suggest.filter((x) => x.id !== s.id);
      d.league.friends.push({ id: s.id, name: s.name, hue: s.hue, rel: { en: 'New friend', ms: 'Rakan baharu' }, tier: 0, xp: 40 + ((s.name.length * 13) % 90), streak: 1, today: false });
    });
    toast(fill(T('{n} added as a friend', '{n} ditambah sebagai rakan'), { n: s.name.split(' ')[0] }), 'users');
  };
  const startDuel = (f) => { mutate((d) => { d.league.duels[f.id] = { start: now(), mine0: b.me.xp }; }); close(); setTimeout(() => toast(fill(T('Challenge sent to {n} ⚔️', 'Cabaran dihantar kepada {n} ⚔️'), { n: f.name.split(' ')[0] }), 'zap'), 300); };
  const claimQuest = () => { mutate((d) => { d.league.quest.claimed = true; }); setTimeout(() => award(50, { en: 'Friend quest completed', ms: 'Misi rakan selesai' }), 200); };
  const copyInvite = () => { try { navigator.clipboard.writeText('https://glucopass.my/invite/ahmadzaki'); } catch (e) {} toast(T('Invite link copied', 'Pautan jemputan disalin'), 'copy'); };

  return (
    <div className="pb-10">
      <Header title={T('Leaderboard', 'Papan Kedudukan')} sub={T('Eat healthy, earn XP, climb the league', 'Makan sihat, kumpul XP, naik liga')}
        right={<button onClick={() => setSheet('rules')} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5 mr-1" aria-label="How XP works"><Icon n="info" /></button>} />
      <div className="px-4">
        <Segmented value={tab} onChange={setTab} options={[{ v: 'league', l: T('League', 'Liga') }, { v: 'friends', l: T('Friends', 'Rakan') }]} />

        {tab === 'league' && (
          <div className="anim-fade">
            {/* tier ladder */}
            <div className="flex items-end justify-center gap-2 mt-5">
              {LEAGUE_TIERS.map((t, i) => <div key={t.id} className={i === MY_TIER ? '' : 'opacity-90'}><LeagueShield tier={i} size={i === MY_TIER ? 62 : 40} locked={i > MY_TIER} /></div>)}
            </div>
            <div className="text-center mt-2">
              <div className="font-extrabold text-xl">{fill(T('{t} League', 'Liga {t}'), { t: L(tier.n) })}</div>
              <div className="text-[12.5px] text-ink-mute mt-0.5">{fill(T('Top {n} move up to {next} League', '{n} teratas naik ke Liga {next}'), { n: PROMOTE, next: L(LEAGUE_TIERS[MY_TIER + 1].n) })}</div>
              <div className="inline-flex items-center gap-1.5 mt-2 h-7 px-3 rounded-full bg-amber-50 text-amber-700 text-[12px] font-bold"><Icon n="clock" s={13} />{weekLeft()}</div>
            </div>

            {/* my status */}
            <div className="mt-4 rounded-2xl p-3.5 text-white flex items-center gap-3" style={{ background: 'linear-gradient(135deg,#1f8a74,#0f5e50)' }}>
              <div className="text-center w-12"><div className="text-[10px] font-bold uppercase opacity-70">{T('Rank', 'Kedudukan')}</div><div className="text-2xl font-extrabold leading-none mt-0.5">#{b.rank}</div></div>
              <div className="w-px self-stretch bg-white/20" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold">{b.me.xp} XP · {fill(T('{n} healthy meals', '{n} hidangan sihat'), { n: b.me.healthy })}</div>
                <div className="text-[11.5px] opacity-80 mt-0.5">{b.rank === 1 ? T('Keep it up to stay on top!', 'Teruskan untuk kekal di atas!') : fill(T('One healthy meal (+20 XP) could beat {who}', 'Satu hidangan sihat (+20 XP) boleh potong {who}'), { who: b.above.name.split(' ')[0] })}</div>
              </div>
            </div>

            {/* table */}
            <div className="bg-white rounded-3xl shadow-soft p-1.5 mt-4 stagger">
              {b.rows.map((r, i) => (
                <React.Fragment key={r.id}>
                  {i === PROMOTE && <ZoneLine up />}
                  {i === b.rows.length - DEMOTE && <ZoneLine />}
                  <RankRow rank={i + 1} r={r} short />
                </React.Fragment>
              ))}
            </div>
            <p className="text-[11.5px] text-ink-mute text-center mt-3 px-4">{T('Leagues reset every Monday. Other players are shown by first name and initial only, to protect privacy.', 'Liga ditetapkan semula setiap Isnin. Pemain lain hanya dipaparkan dengan nama pertama dan inisial, untuk privasi.')}</p>
          </div>
        )}

        {tab === 'friends' && (
          <div className="anim-fade">
            {/* friend quest */}
            <div className="mt-4 rounded-3xl p-4 bg-white shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3"><Avatar name={S.patients.p1.name} hue={S.patients.p1.hue} size={38} ring /><Avatar name={qf.name} hue={qf.hue} size={38} ring /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10.5px] font-bold uppercase tracking-wide text-brand-700">{T('Friend quest', 'Misi rakan')}</div>
                  <div className="font-bold text-[14px] leading-tight">{fill(T('Eat {g} healthy meals together with {n}', 'Makan {g} hidangan sihat bersama {n}'), { g: quest.goal, n: qf.name.split(' ')[0] })}</div>
                </div>
              </div>
              <div className="mt-3"><Bar value={Math.min(qDone, quest.goal)} max={quest.goal} color="#16a58c" /></div>
              <div className="flex items-center justify-between mt-2 text-[12px]">
                <span className="text-ink-soft tnum">{T('You', 'Anda')} {b.me.healthy} · {qf.name.split(' ')[0]} {quest.theirs} · <b>{Math.min(qDone, quest.goal)}/{quest.goal}</b></span>
                {quest.claimed ? <span className="font-bold text-good-fg">{T('Claimed ✓', 'Dituntut ✓')}</span>
                  : qDone >= quest.goal ? <Btn size="sm" icon="gift" onClick={claimQuest}>{T('Claim +50', 'Tuntut +50')}</Btn>
                    : <span className="font-bold text-amber-600">+50 {T('pts', 'mata')}</span>}
              </div>
            </div>

            {/* active duels */}
            {Object.keys(lg.duels).map((fid) => { const f = lg.friends.find((x) => x.id === fid); if (!f) return null; const p = duelProgress(fid); const lead = p.me >= p.them; return (
              <div key={fid} className="mt-3 rounded-3xl p-4 text-white" style={{ background: 'linear-gradient(135deg,#3a3f8f,#22265e)' }}>
                <div className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-wide opacity-80"><span>⚔️ {T('7-day healthy plate duel', 'Duel pinggan sihat 7 hari')}</span><span>{fill(T('{d}d left', '{d} hari lagi'), { d: Math.max(0, 7 - Math.floor((now() - lg.duels[fid].start) / DAY)) })}</span></div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 text-center"><Avatar name={S.patients.p1.name} hue={S.patients.p1.hue} size={40} className="mx-auto" /><div className="text-xl font-extrabold mt-1 tnum">+{p.me}</div><div className="text-[11px] opacity-70">{T('You', 'Anda')}</div></div>
                  <div className="text-xs font-extrabold opacity-60">VS</div>
                  <div className="flex-1 text-center"><Avatar name={f.name} hue={f.hue} size={40} className="mx-auto" /><div className="text-xl font-extrabold mt-1 tnum">+{p.them}</div><div className="text-[11px] opacity-70">{f.name.split(' ')[0]}</div></div>
                </div>
                <div className="text-center text-[12px] font-semibold mt-2 opacity-90">{lead ? T("You're ahead — log a healthy meal to keep the lead", 'Anda mendahului — catat hidangan sihat untuk kekal di depan') : T('Behind! A healthy meal is worth +20 XP', 'Ketinggalan! Hidangan sihat bernilai +20 XP')}</div>
              </div>
            ); })}

            <SectionTitle action={T('+ Add friends', '+ Tambah rakan')} onAction={() => setSheet('add')}>{T('Friends this week', 'Rakan minggu ini')}</SectionTitle>
            <div className="bg-white rounded-3xl shadow-soft p-1.5 stagger">
              {fRows.map((r, i) => (
                <RankRow key={r.id} rank={i + 1} r={r}
                  sub={<span className="inline-flex items-center gap-1 whitespace-nowrap"><LeagueShield tier={r.tier} size={13} />{L(LEAGUE_TIERS[r.tier].n)}</span>}
                  right={r.me ? <span className="font-extrabold text-[14px] tnum">{r.xp} <span className="text-[11px] text-ink-mute font-semibold">XP</span></span> : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-extrabold text-[13px] tnum mr-1">{r.xp}<span className="text-[10px] text-ink-mute font-semibold"> XP</span></span>
                      {!r.today && <button onClick={() => !lg.nudged[r.id] && nudge(r)} aria-label={T('Nudge', 'Cuit')} className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] ${lg.nudged[r.id] ? 'bg-slate-100 text-ink-mute' : 'bg-amber-50'}`}>{lg.nudged[r.id] ? <Icon n="check" s={15} /> : '👋'}</button>}
                      {!lg.duels[r.id] && <button onClick={() => setSheet('duel:' + r.id)} className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center" aria-label="Challenge"><Icon n="zap" s={15} /></button>}
                    </div>
                  )} />
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-2 text-[11px] text-ink-mute"><span>👋 {T("Nudge friends who haven't logged today", 'Cuit rakan yang belum mencatat hari ini')}</span><span className="inline-flex items-center gap-1"><Icon n="zap" s={12} />{T('Duel', 'Duel')}</span></div>
            <button onClick={() => setSheet('add')} className="w-full mt-3 h-14 rounded-2xl border-2 border-dashed border-brand-300 text-brand-700 font-bold text-[14px] flex items-center justify-center gap-2"><Icon n="users" s={18} />{T('Invite friends to compete', 'Jemput rakan untuk bersaing')}</button>
          </div>
        )}
      </div>

      <Sheet open={sheet === 'rules'} onClose={close} title={T('How to earn XP', 'Cara kumpul XP')}>
        <div className="space-y-2">
          {XP_RULES.map((r) => (
            <div key={r.k} className="flex items-center gap-3 bg-paper rounded-2xl px-3 py-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${r.c}`}><Icon n={r.icon} s={17} /></div>
              <span className="flex-1 text-[13.5px] font-semibold">{L(r.n)}</span>
              <span className="font-extrabold text-[14px] text-brand-700">+{r.xp} XP</span>
            </div>
          ))}
        </div>
        <p className="text-[12px] text-ink-mute mt-3 leading-relaxed">{fill(T('The AI rates each meal photo as healthy, moderate or high-sugar. Each week the top {p} in your league move up and the bottom {d} move down. XP is separate from reward points.', 'AI menilai setiap foto makanan sebagai sihat, sederhana atau tinggi gula. Setiap minggu {p} teratas dalam liga anda naik dan {d} terbawah turun. XP berasingan daripada mata ganjaran.'), { p: PROMOTE, d: DEMOTE })}</p>
      </Sheet>

      <Sheet open={sheet === 'add'} onClose={close} title={T('Add friends', 'Tambah rakan')}>
        <div className="bg-paper rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"><Icon n="share" s={18} /></div>
          <div className="flex-1 min-w-0"><div className="font-semibold text-[13.5px]">{T('Share your invite link', 'Kongsi pautan jemputan')}</div><div className="text-[11.5px] text-ink-mute truncate">glucopass.my/invite/ahmadzaki</div></div>
          <Btn size="sm" icon="copy" onClick={copyInvite}>{T('Copy', 'Salin')}</Btn>
        </div>
        <div className="mt-3 flex items-center gap-2 h-11 px-3 rounded-2xl bg-slate-100">
          <Icon n="search" s={17} className="text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T('Search by name', 'Cari mengikut nama')} className="flex-1 bg-transparent outline-none text-[14px]" />
        </div>
        <div className="text-[11.5px] font-bold uppercase tracking-wide text-ink-mute mt-4 mb-1.5">{T('People you may know', 'Mungkin anda kenal')}</div>
        {lg.suggest.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).map((s) => (
          <div key={s.id} className="flex items-center gap-3 py-2">
            <Avatar name={s.name} hue={s.hue} size={40} />
            <div className="flex-1 min-w-0"><div className="font-semibold text-[14px] truncate">{s.name}</div><div className="text-[11.5px] text-ink-mute">{fill(T('{n} mutual friends', '{n} rakan bersama'), { n: s.mutual })}</div></div>
            <Btn size="sm" v="secondary" icon="plus" onClick={() => addFriend(s)}>{T('Add', 'Tambah')}</Btn>
          </div>
        ))}
        {!lg.suggest.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())).length && <div className="text-[13px] text-ink-mute text-center py-4">{T('No one found', 'Tiada dijumpai')}</div>}
      </Sheet>

      <Sheet open={!!duelF} onClose={close} title={T('Challenge a friend', 'Cabar rakan')}>
        {duelF && <>
          <div className="flex items-center justify-center gap-4 py-2">
            <Avatar name={S.patients.p1.name} hue={S.patients.p1.hue} size={56} />
            <span className="text-lg font-extrabold text-indigo-600">VS</span>
            <Avatar name={duelF.name} hue={duelF.hue} size={56} />
          </div>
          <div className="text-center font-bold text-[16px] mt-2">{fill(T('7-day healthy plate duel with {n}', 'Duel pinggan sihat 7 hari dengan {n}'), { n: duelF.name.split(' ')[0] })}</div>
          <p className="text-center text-[13px] text-ink-mute mt-1.5 leading-relaxed">{T('Whoever earns more XP from meals and activity in the next 7 days wins 100 reward points.', 'Sesiapa yang kumpul lebih banyak XP daripada makanan dan aktiviti dalam 7 hari akan datang menang 100 mata ganjaran.')}</p>
          <Btn className="w-full mt-4" icon="zap" onClick={() => startDuel(duelF)}>{T('Send challenge', 'Hantar cabaran')}</Btn>
        </>}
      </Sheet>
    </div>
  );
}
