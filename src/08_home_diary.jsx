/* ============ HOME (CGM) + DIARY ============ */
function PHome() {
  const { S, nav } = useApp();
  const p = S.patients.p1;
  const [notif, setNotif] = useState(false);
  const todays = p.meals.filter((m) => isToday(m.t));
  const tot = nutri(todays.flatMap((m) => m.items));
  const streak = computeStreak(p.meals);
  const recent = [...p.meals].sort((a, b) => b.t - a.t).slice(0, 3);
  const note = (S.notes.p1 || [])[0];
  const lastToday = todays.length ? todays.reduce((a, b) => (a.t > b.t ? a : b)) : null;
  const carbPct = tot.carbs / p.targets.carbs;
  const cur = cgmCurrent(p, S.exDone);

  let assist;
  const recentHigh = lastToday && now() - lastToday.t < 3 * 3600000 && mealStatus(nutri(lastToday.items)) === 'risk' && !(S.exDone[lastToday.id] || []).length;
  if (!lastToday) assist = { text: T("Don't forget to log your first meal today — snap a photo and I'll estimate how it will affect your glucose.", 'Jangan lupa catat hidangan pertama hari ini — ambil gambar dan saya akan anggarkan kesannya pada gula darah anda.'), cta: { l: T('Log a meal', 'Catat makanan'), icon: 'camera', go: () => nav.push('logmeal') } };
  else if (cur.v > 10 || recentHigh) assist = { text: fill(T('Your glucose is {v} mmol/L {a} after your {mt}. A 10-minute walk now helps your muscles use up that sugar!', 'Gula anda {v} mmol/L {a} selepas {mt}. Jom jalan kaki 10 minit sekarang untuk bantu otot gunakan gula itu!'), { v: num(cur.v, 1), a: cur.arrow, mt: L(MT[lastToday.mt].n).toLowerCase() }), cta: { l: T('Start a 10-min walk', 'Mula jalan 10 minit'), icon: 'walk', go: () => nav.push('exercise', { mealId: lastToday.id, ex: 'walk' }) }, warn: true };
  else if ((S.exDone[lastToday.id] || []).length) assist = { text: fill(T('Great job moving after your {mt}! 💪 Your glucose is {v} mmol/L and steady.', 'Syabas kerana bergerak selepas {mt}! 💪 Gula anda {v} mmol/L dan stabil.'), { mt: L(MT[lastToday.mt].n).toLowerCase(), v: num(cur.v, 1) }) };
  else if (carbPct > 0.75) assist = { text: fill(T("You've used {p}% of today's carb target. Go light on rice at your next meal — add more vegetables instead.", 'Anda sudah guna {p}% sasaran karbohidrat hari ini. Kurangkan nasi pada hidangan seterusnya — tambah sayur.'), { p: Math.round(carbPct * 100) }) };
  else assist = { text: fill(T('Nice — you are in range at {v} mmol/L. Keep choosing plain water over sweet drinks. 💧', 'Bagus — gula anda dalam julat pada {v} mmol/L. Teruskan pilih air kosong berbanding minuman manis. 💧'), { v: num(cur.v, 1) }) };

  return (
    <div className="pb-28">
      <div className="bg-gradient-to-b from-brand-100/70 to-paper px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <Avatar name={p.name} hue={p.hue} size={46} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-ink-soft">{greeting()},</div>
            <div className="font-extrabold text-lg leading-tight truncate">{p.name.split(' ')[0]} 👋</div>
          </div>
          <button onClick={() => nav.push('points')} className="h-10 pl-2 pr-3 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center gap-1.5">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white"><Icon n="star" s={14} fill="#fff" sw={1} /></span>
            <span className="tnum">{num(S.points.balance)}</span>
          </button>
          <button onClick={() => setNotif(true)} className="relative w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center" aria-label="Notifications">
            <Icon n="bell" s={19} /><span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-risk-dot" />
          </button>
        </div>
        <div className="text-xs text-ink-mute mt-3 flex items-center gap-1.5"><Icon n="calendar" s={13} />{fmtLongToday()}</div>
      </div>

      <div className="px-4 stagger">
        <GlucoseCard />

        <div className="grid grid-cols-2 gap-3 mt-3">
          <Card className="p-3.5" onClick={() => nav.goTab('diary')}>
            <div className="flex items-center justify-between"><div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Icon n="utensils" s={16} /></div><span className="text-[11px] text-ink-mute font-semibold">{todays.length}/4 {T('meals', 'hidangan')}</span></div>
            <div className="text-[11px] text-ink-mute mt-2.5">{T('Carbs today', 'Karbo hari ini')}</div>
            <div className="flex items-baseline gap-1"><span className="text-2xl font-extrabold tnum">{Math.round(tot.carbs)}</span><span className="text-[11px] text-ink-mute font-semibold">/ {p.targets.carbs} g</span></div>
            <div className="mt-1.5"><Bar value={tot.carbs} max={p.targets.carbs} h={6} color={carbPct > 1 ? '#ec7461' : carbPct > 0.75 ? '#f0a92e' : '#16a58c'} /></div>
            <div className="text-[11px] text-ink-mute mt-1.5">{T('Sugar', 'Gula')} <b className={tot.sugar > p.targets.sugar ? 'text-risk-fg' : 'text-ink'}>{Math.round(tot.sugar)}</b> / {p.targets.sugar} g</div>
          </Card>
          <Card className="p-3.5 bg-gradient-to-br from-amber-50 to-white" onClick={() => nav.goTab('diary')}>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Icon n="flame" s={17} className="wiggle" /></div>
            <div className="text-2xl font-extrabold mt-2.5 tnum">{streak} <span className="text-sm font-bold">{T('days', 'hari')}</span></div>
            <div className="text-[11px] text-ink-mute leading-tight">{T('diary streak', 'diari berturut-turut')}</div>
            <div className="flex gap-1 mt-2">{[...Array(7)].map((_, i) => <div key={i} className={`flex-1 h-1.5 rounded-full ${i < streak ? 'bg-amber-400' : 'bg-amber-100'}`} />)}</div>
          </Card>
        </div>

        <Card className={`p-4 mt-3 ${assist.warn ? 'ring-1 ring-warn-dot/40' : ''}`}>
          <div className="flex gap-3">
            <AssistantAvatar />
            <div className="flex-1">
              <div className="text-xs font-bold text-brand-700 mb-1 flex items-center gap-1"><Icon n="sparkles" s={13} />{T('Your assistant', 'Pembantu anda')}</div>
              <div className="bg-brand-50 rounded-2xl rounded-tl-md px-3.5 py-2.5 text-[13.5px] leading-snug text-ink">{assist.text}</div>
              {assist.cta && <Btn size="sm" v="soft" className="mt-2.5" icon={assist.cta.icon} onClick={assist.cta.go}>{assist.cta.l}</Btn>}
            </div>
          </div>
        </Card>

        <OutlookCard />

        {note && (
          <Card className="p-4 mt-3 border-l-4 border-brand-500" onClick={() => nav.push('chat', { pid: 'p1', did: note.doc })}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon n="steth" s={16} className="text-brand-700" />
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wide">{T("Doctor's advice", 'Anjuran doktor')}</span>
              <span className="ml-auto text-[11px] text-ink-mute">{relDay(note.t)}</span>
            </div>
            <div className="text-[13.5px] leading-snug">{L(note.text)}</div>
            <div className="text-xs text-ink-mute mt-2">— {DOC[note.doc].name}</div>
          </Card>
        )}

        <button onClick={() => nav.push('logmeal')} className="mt-4 w-full h-16 rounded-[22px] bg-brand-600 text-white font-bold text-base flex items-center justify-center gap-3 shadow-[0_14px_30px_-12px_rgba(11,138,118,.8)] relative overflow-hidden">
          <span className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" /><span className="absolute right-10 -bottom-10 w-20 h-20 rounded-full bg-white/10" />
          <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Icon n="camera" s={21} /></span>
          {T('Report a meal', 'Laporkan makanan')}
          <span className="text-[11px] font-bold bg-amber-300 text-amber-900 rounded-full px-2 py-0.5">+10</span>
        </button>

        <SectionTitle action={T('Open diary', 'Buka diari')} onAction={() => nav.goTab('diary')}>{T('Recent meals', 'Makanan terkini')}</SectionTitle>
        <Card className="p-1.5">
          {recent.length ? recent.map((m) => <MealRow key={m.id} meal={m} showDay onClick={() => nav.push('meal', { pid: 'p1', mealId: m.id })} />)
            : <EmptyState icon="utensils" title={T('No meals yet', 'Belum ada makanan')} text={T('Your logged meals will appear here.', 'Makanan yang dicatat akan dipaparkan di sini.')} />}
        </Card>
      </div>

      <Sheet open={notif} onClose={() => setNotif(false)} title={T('Notifications', 'Pemberitahuan')}>
        {[
          { i: 'pill', c: 'bg-brand-50 text-brand-700', t: T('Time for Metformin 500 mg', 'Masa untuk Metformin 500 mg'), s: T('Today, 20:00 · after dinner', 'Hari ini, 20:00 · selepas makan malam'), go: () => nav.goTab('diary') },
          { i: 'steth', c: 'bg-good-bg text-good-fg', t: T('Dr. Aisyah sent new advice', 'Dr. Aisyah menghantar anjuran baharu'), s: note ? relDay(note.t) : '', go: () => nav.push('chat', { pid: 'p1', did: 'd1' }) },
          { i: 'eye', c: 'bg-risk-bg text-risk-fg', t: T('Fundus (eye) examination is overdue', 'Pemeriksaan fundus (mata) telah lewat'), s: T('Annual screening', 'Saringan tahunan'), go: () => nav.goTab('passport') },
          { i: 'gift', c: 'bg-amber-50 text-amber-700', t: T('You can redeem a reward!', 'Anda boleh tebus ganjaran!'), s: fill(T('{n} points available', '{n} mata tersedia'), { n: num(S.points.balance) }), go: () => nav.push('points') },
        ].map((x, i) => (
          <button key={i} onClick={() => { setNotif(false); x.go && setTimeout(x.go, 250); }} className="w-full flex gap-3 items-center py-3 border-b border-slate-100 last:border-0 text-left">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${x.c}`}><Icon n={x.i} s={18} /></div>
            <div className="flex-1"><div className="text-sm font-semibold">{x.t}</div><div className="text-xs text-ink-mute">{x.s}</div></div>
          </button>
        ))}
      </Sheet>
    </div>
  );
}

/* ---------- DIARY ---------- */
function useDiaryDay(pid, day) {
  const { S } = useApp();
  const pt = S.patients[pid];
  const end = day + DAY;
  const nowT = now();
  const isTodayD = day === startOfDay(nowT);
  const meals = pt.meals.filter((m) => m.t >= day && m.t < end);
  const extras = (S.diary[pid] || []).filter((e) => e.t >= day && e.t < end && e.t <= nowT);
  const entries = [...meals.map((m) => ({ id: m.id, kind: 'meal', t: m.t, meal: m })), ...extras].sort((a, b) => a.t - b.t);
  const n = nutri(meals.flatMap((m) => m.items));
  const activeMin = extras.filter((e) => e.kind === 'exercise').reduce((a, e) => a + (e.mins || 0), 0);
  return { pt, end, nowT, isTodayD, meals, entries, carbs: n.carbs, sugar: n.sugar, activeMin };
}

function WeekStrip({ pid, day, setDay }) {
  const { S } = useApp();
  const pt = S.patients[pid];
  const days = [...Array(7)].map((_, i) => startOfDay(atDay(i - 6)));
  return (
    <div className="flex gap-1.5">
      {days.map((d) => {
        const on = d === day; const has = pt.meals.some((m) => startOfDay(m.t) === d) || (S.diary[pid] || []).some((e) => e.kind === 'exercise' && startOfDay(e.t) === d);
        return (
          <button key={d} onClick={() => setDay(d)} className={`flex-1 h-[62px] rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-colors ${on ? 'bg-ink text-white' : 'bg-white text-ink shadow-soft'}`}>
            <span className={`text-[10.5px] font-semibold ${on ? 'text-white/70' : 'text-ink-mute'}`}>{new Date(d).toLocaleDateString(locale(), { weekday: 'short' }).slice(0, 3)}</span>
            <span className="text-[16px] font-extrabold tnum leading-none">{new Date(d).getDate()}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${has ? (on ? 'bg-amber-300' : 'bg-brand-500') : 'bg-transparent'}`} />
          </button>
        );
      })}
    </div>
  );
}

function DiaryEntry({ e, pid, readOnly, last }) {
  const { nav } = useApp();
  let body;
  if (e.kind === 'meal') {
    const n = nutri(e.meal.items); const s = mealStatus(n);
    body = (
      <button onClick={() => nav.push('meal', { pid, mealId: e.meal.id, readOnly })} className="w-full text-left bg-white rounded-2xl shadow-soft p-2.5 flex gap-3 items-center">
        <FoodPhoto items={e.meal.items} photo={e.meal.photo} seed={e.meal.id} className="w-16 h-16 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-brand-700 flex items-center gap-1"><Icon n={MT[e.meal.mt].icon} s={12} />{L(MT[e.meal.mt].n)}</div>
          <div className="font-semibold text-[14px] truncate">{mealTitle(e.meal.items)}</div>
          <div className="text-[11px] text-ink-soft tnum">{Math.round(n.carbs)} g {T('carbs', 'karbo')} · ≈ +{num(glRise(n.gl), 1)} mmol/L</div>
        </div>
        <Badge s={s} />
      </button>
    );
  } else if (e.kind === 'med') {
    body = <div className="flex items-center gap-2.5 bg-white/70 rounded-2xl px-3 py-2.5 border border-slate-100"><div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Icon n="pill" s={16} /></div><span className="text-[13px] font-semibold flex-1">{e.name}</span><span className="text-[11px] font-bold text-good-fg">{T('Taken', 'Diambil')} ✓</span></div>;
  } else if (e.kind === 'exercise') {
    body = <div className="flex items-center gap-2.5 bg-good-bg rounded-2xl px-3 py-2.5"><div className="w-8 h-8 rounded-lg bg-white text-good-fg flex items-center justify-center"><Icon n={ACT[e.act]?.icon || 'walk'} s={16} /></div><span className="text-[13px] font-semibold flex-1">{L(ACT[e.act]?.n)} · {e.mins} min</span><span className="text-[11px] font-bold text-amber-600">+5</span></div>;
  }
  const dot = { meal: '#16a58c', med: '#8a9b98', exercise: '#34b27b' }[e.kind];
  return (
    <div className="flex gap-2.5">
      <div className="w-11 shrink-0 text-right text-[11px] font-bold text-ink-mute pt-3 tnum">{fmtTime(e.t)}</div>
      <div className="relative w-3 shrink-0 flex justify-center">
        {!last && <div className="absolute top-5 bottom-0 w-0.5 bg-slate-200" />}
        <div className="relative mt-3.5 w-3 h-3 rounded-full border-[3px] bg-white" style={{ borderColor: dot }} />
      </div>
      <div className="flex-1 min-w-0 pb-3">{body}</div>
    </div>
  );
}

function DiaryDay({ pid, day, readOnly }) {
  const d = useDiaryDay(pid, day);
  return (
    <div>
      <SectionTitle>{new Date(day).toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' })}</SectionTitle>
      {d.entries.length ? <div className="stagger">{d.entries.map((e, i) => <DiaryEntry key={e.id} e={e} pid={pid} readOnly={readOnly} last={i === d.entries.length - 1} />)}</div>
        : <EmptyState icon="book" title={T('Nothing written yet', 'Belum ada catatan')} text={T('Meals, medication and activity for this day will appear here.', 'Makanan, ubat dan aktiviti hari ini akan dipaparkan di sini.')} />}
    </div>
  );
}

function DiaryBrowser({ pid, readOnly }) {
  const [day, setDay] = useState(startOfDay(now()));
  return <div><WeekStrip pid={pid} day={day} setDay={setDay} /><DiaryDay pid={pid} day={day} readOnly={readOnly} /></div>;
}

function PDiary() {
  const { S, mutate, nav, toast, award } = useApp();
  const pt = S.patients.p1;
  const [day, setDay] = useState(startOfDay(now()));
  const [sheet, setSheet] = useState(null); // menu | med | act
  const [act, setAct] = useState('walk'); const [mins, setMins] = useState(15);
  const close = () => setSheet(null);
  const add = (entry, msg, pts) => {
    mutate((d) => { (d.diary.p1 ||= []).push({ id: uid('dy'), t: now(), ...entry }); });
    setDay(startOfDay(now())); close();
    setTimeout(() => { if (pts) award(pts, { en: 'Diary: ' + msg.en, ms: 'Diari: ' + msg.ms }); else toast(L(msg), 'book'); }, 300);
  };
  const tookToday = (S.diary.p1 || []).filter((e) => e.kind === 'med' && isToday(e.t));
  const quick = [
    { k: 'meal', i: 'camera', l: T('Meal', 'Makanan'), c: 'bg-brand-600 text-white', go: () => nav.push('logmeal') },
    { k: 'med', i: 'pill', l: T('Medicine', 'Ubat'), c: 'bg-brand-50 text-brand-800', go: () => setSheet('med') },
    { k: 'act', i: 'walk', l: T('Activity', 'Aktiviti'), c: 'bg-good-bg text-good-fg', go: () => setSheet('act') },
  ];
  return (
    <div className="pb-28">
      <Header back={false} title={T('My Diary', 'Diari Saya')} sub={T('Food, medicine & activity — day by day', 'Makanan, ubat & aktiviti — setiap hari')}
        right={<button onClick={() => setSheet('menu')} className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center mr-1 shadow-soft" aria-label="Add"><Icon n="plus" /></button>} />
      <div className="px-4">
        <WeekStrip pid="p1" day={day} setDay={setDay} />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {quick.map((q) => <button key={q.k} onClick={q.go} className={`h-[60px] rounded-2xl flex flex-col items-center justify-center gap-1 text-[11.5px] font-bold ${q.c}`}><Icon n={q.i} s={19} />{q.l}</button>)}
        </div>
        <LeagueCard />
        <DiaryDay pid="p1" day={day} />
      </div>

      <Sheet open={sheet === 'menu'} onClose={close} title={T('Add to diary', 'Tambah ke diari')}>
        <div className="grid grid-cols-3 gap-2.5 pb-1">
          {quick.map((q) => <button key={q.k} onClick={() => { close(); setTimeout(q.go, 280); }} className={`h-24 rounded-2xl flex flex-col items-center justify-center gap-2 text-sm font-bold ${q.c}`}><Icon n={q.i} s={24} />{q.l}</button>)}
        </div>
      </Sheet>

      <Sheet open={sheet === 'med'} onClose={close} title={T('Medication', 'Ubat')}>
        <div className="bg-paper rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"><Icon n="pill" s={22} /></div>
          <div className="flex-1"><div className="font-bold">{pt.medShort}</div><div className="text-xs text-ink-mute">{L(pt.meds)}</div></div>
        </div>
        <div className="flex gap-2 mt-3">
          {[['08:00', T('Morning', 'Pagi')], ['20:00', T('Evening', 'Malam')]].map(([h, l], i) => { const done = tookToday.some((e) => (i === 0 ? new Date(e.t).getHours() < 14 : new Date(e.t).getHours() >= 14)); return (
            <div key={h} className={`flex-1 rounded-2xl p-3 text-center ${done ? 'bg-good-bg text-good-fg' : 'bg-slate-50 text-ink-mute'}`}><div className="text-xs font-semibold">{l} · {h}</div><div className="text-sm font-bold mt-0.5">{done ? T('Taken ✓', 'Diambil ✓') : T('Not yet', 'Belum')}</div></div>); })}
        </div>
        <Btn className="w-full mt-4" icon="check" onClick={() => add({ kind: 'med', name: pt.medShort }, { en: 'Medication recorded', ms: 'Ubat direkodkan' })}>{T('I took it now', 'Saya sudah ambil sekarang')}</Btn>
      </Sheet>

      <Sheet open={sheet === 'act'} onClose={close} title={T('Log activity', 'Catat aktiviti')}>
        <div className="grid grid-cols-3 gap-2">
          {ACTIVITIES.map((a) => <button key={a.k} onClick={() => setAct(a.k)} className={`h-[72px] rounded-2xl flex flex-col items-center justify-center gap-1 text-[12px] font-semibold border-2 ${act === a.k ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-transparent bg-slate-50 text-ink-soft'}`}><Icon n={a.icon} s={20} />{L(a.n)}</button>)}
        </div>
        <div className="flex items-center justify-between mt-4 bg-paper rounded-2xl p-3">
          <span className="font-semibold text-sm">{T('Duration', 'Tempoh')}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setMins(clamp(mins - 5, 5, 120))} className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm"><Icon n="minus" /></button>
            <span className="w-16 text-center text-xl font-extrabold tnum">{mins}<span className="text-xs text-ink-mute"> min</span></span>
            <button onClick={() => setMins(clamp(mins + 5, 5, 120))} className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm"><Icon n="plus" /></button>
          </div>
        </div>
        <Btn className="w-full mt-4" icon="check" onClick={() => add({ kind: 'exercise', act, mins }, { en: ACT[act].n.en + ' ' + mins + ' min', ms: ACT[act].n.ms + ' ' + mins + ' min' }, 5)}>{T('Save activity', 'Simpan aktiviti')} <span className="text-[11px] font-bold bg-amber-300 text-amber-900 rounded-full px-2 py-0.5 ml-1">+5</span></Btn>
      </Sheet>
    </div>
  );
}
