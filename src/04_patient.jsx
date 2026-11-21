/* ============ PATIENT SIDE ============ */

/* ---------- shared meal pieces ---------- */
function MealRow({ meal, onClick, showDay }) {
  const n = nutri(meal.items); const s = mealStatus(n);
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2.5 pr-3 text-left rounded-2xl hover:bg-slate-50">
      <FoodPhoto items={meal.items} photo={meal.photo} seed={meal.id} className="w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[14px] truncate">{mealTitle(meal.items)}</div>
        <div className="text-xs text-ink-mute mt-0.5 flex items-center gap-1.5">
          <Icon n={MT[meal.mt].icon} s={13} />{L(MT[meal.mt].n)} · {showDay ? relDay(meal.t) + ', ' : ''}{fmtTime(meal.t)}
        </div>
        <div className="text-[11px] text-ink-soft mt-1 tnum">{Math.round(n.carbs)} g {T('carbs', 'karbo')} · {Math.round(n.sugar)} g {T('sugar', 'gula')}</div>
      </div>
      <Badge s={s} />
    </button>
  );
}

function NutritionPanel({ n }) {
  const gl = glLevel(n.gl);
  const rows = [
    { k: 'carbs', l: T('Carbs', 'Karbohidrat'), max: 90, c: '#16a58c' },
    { k: 'sugar', l: T('Sugar', 'Gula'), max: 40, c: '#ec7461' },
    { k: 'fiber', l: T('Fibre', 'Serat'), max: 12, c: '#7cb342' },
    { k: 'protein', l: T('Protein', 'Protein'), max: 45, c: '#6c8cf0' },
    { k: 'fat', l: T('Fat', 'Lemak'), max: 40, c: '#f0a92e' },
  ];
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-ink-mute uppercase tracking-wide">{T('Nutrition estimate', 'Anggaran nutrisi')}</div>
          <div className="mt-1 flex items-baseline gap-1"><span className="text-4xl font-extrabold tnum">{Math.round(n.kcal)}</span><span className="text-sm text-ink-mute font-semibold">kcal</span></div>
        </div>
        <div className={`rounded-2xl px-3 py-2 text-right ${ST[gl].bg}`}>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">{T('Glycaemic load', 'Beban glisemik')}</div>
          <div className={`text-lg font-extrabold leading-tight ${ST[gl].fg}`}>{Math.round(n.gl)} · {glLabel(gl)}</div>
          <div className="text-[10.5px] font-semibold text-ink-soft mt-0.5">{T('Est. glucose rise', 'Anggaran kenaikan gula')} ≈ +{num(glRise(n.gl), 1)} mmol/L</div>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full flex overflow-hidden gap-0.5">
        <div className="flex-[20] bg-good-dot/70" /><div className="flex-[15] bg-warn-dot/70" /><div className="flex-[25] bg-risk-dot/70" />
      </div>
      <div className="relative h-3"><div className="absolute -top-1 w-0 h-0 border-x-[6px] border-x-transparent border-b-[7px] border-b-ink transition-all duration-700" style={{ left: `calc(${clamp(n.gl / 60, 0, 1) * 100}% - 6px)` }} /></div>
      <div className="grid grid-cols-1 gap-2.5 mt-2">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center gap-3">
            <div className="w-24 text-[13px] text-ink-soft">{r.l}</div>
            <div className="flex-1"><Bar value={n[r.k]} max={r.max} color={r.c} /></div>
            <div className="w-14 text-right text-[13px] font-bold tnum">{num(n[r.k], n[r.k] < 10 ? 1 : 0)} g</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WarningList({ items, n, target }) {
  const w = mealWarnings(items, n, target);
  return (
    <div className="space-y-2.5">
      {w.map((x, i) => (
        <div key={i} className={`flex gap-3 items-start rounded-2xl p-3.5 ${ST[x.level].bg}`}>
          <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shrink-0" style={{ color: ST[x.level].hex }}><Icon n={x.icon} s={17} /></div>
          <div className={`text-[13.5px] leading-snug font-medium ${ST[x.level].fg}`}>{x.text}</div>
        </div>
      ))}
    </div>
  );
}

function ExerciseList({ mealId, gl, readOnly }) {
  const { S, nav } = useApp();
  const done = S.exDone[mealId] || [];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"><Icon n="activity" /></div>
        <div>
          <div className="font-bold text-[15px]">{T('Help your muscles use this sugar', 'Bantu otot anda gunakan gula ini')}</div>
          <div className="text-xs text-ink-mute">{T('Light movement within 30 min after eating lowers glucose spikes', 'Gerakan ringan dalam 30 min selepas makan kurangkan lonjakan gula')}</div>
        </div>
      </div>
      <div className="space-y-2">
        {EXERCISES.map((e) => {
          const isDone = done.includes(e.id);
          return (
            <div key={e.id} className={`flex items-center gap-3 rounded-2xl p-3 ${isDone ? 'bg-good-bg' : 'bg-paper'}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDone ? 'bg-white text-good-fg' : 'bg-white text-brand-700'}`}><Icon n={isDone ? 'check' : e.icon} s={20} /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px]">{L(e.n)}{e.id === 'walk' && gl > 35 ? ' ⭐' : ''}</div>
                <div className="text-xs text-ink-mute">{e.id === 'walk' && gl > 35 ? '15 min' : L(e.label)} · {L(e.int)}</div>
              </div>
              {isDone ? <span className="text-xs font-bold text-good-fg px-2">{T('Done', 'Selesai')} ✓</span>
                : !readOnly && <Btn size="sm" v="primary" icon="play" onClick={() => nav.push('exercise', { mealId, ex: e.id })}>{T('Start', 'Mula')}</Btn>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------- BERANDA / HOME ---------- */
/* ---------- CATAT / LOG MEAL FLOW ---------- */
function PLog() {
  const { S, mutate, nav, award } = useApp();
  const p = S.patients.p1;
  const [step, setStep] = useState('choose');
  const [mt, setMt] = useState(defaultMealTime());
  const [src, setSrc] = useState(null); // {sample} | {url}
  const [items, setItems] = useState([]);
  const [draftId, setDraftId] = useState(() => uid('meal'));
  const [scanMsg, setScanMsg] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState('');
  const [saved, setSaved] = useState(null);


  const srcItems = src?.sample ? toItems(SAMPLE_MEALS.find((s) => s.id === src.sample).items) : items;
  const analyze = async () => {
    setStep('scan'); setScanMsg(0);
    const det = src.sample ? toItems(SAMPLE_MEALS.find((s) => s.id === src.sample).items) : toItems(pick(Math.random, MEAL_TEMPLATES[mt]));
    for (let i = 1; i < 3; i++) { await wait(750); setScanMsg(i); }
    await wait(700);
    setItems(det); setStep('result');
  };
  const n = nutri(items);
  const save = () => {
    const meal = { id: draftId, pid: 'p1', t: now(), mt, items, photo: src.url || null };
    mutate((d) => { d.patients.p1.meals.push(meal); });
    setSaved(meal); setStep('saved');
    setTimeout(() => award(10, { en: 'Logged ' + MT[mt].n.en.toLowerCase(), ms: 'Catat ' + MT[mt].n.ms.toLowerCase() }), 350);
  };
  const reset = () => { setStep('choose'); setSrc(null); setItems([]); setDraftId(uid('meal')); setSaved(null); };
  const setPortion = (i, pv) => setItems((it) => it.map((x, k) => (k === i ? { ...x, p: pv } : x)));

  if (step === 'choose') return (
    <div className="pb-10">
      <Header title={T('Log a meal', 'Catat makanan')} sub={T('Snap it — AI does the counting', 'Ambil gambar — AI kira untuk anda')} />
      <div className="px-4 stagger">
        <div className="text-[13px] font-semibold text-ink-soft mb-2 mt-1">{T('Which meal is this?', 'Hidangan apakah ini?')}</div>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TIMES.map((m) => (
            <button key={m.id} onClick={() => setMt(m.id)} className={`h-[72px] rounded-2xl flex flex-col items-center justify-center gap-1 text-[11.5px] font-semibold border-2 transition-colors ${mt === m.id ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-transparent bg-white text-ink-soft shadow-soft'}`}>
              <Icon n={m.icon} s={20} /><span className="leading-tight text-center px-1">{L(m.n)}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          {src ? (
            <div className="relative rounded-[22px] overflow-hidden aspect-[4/3] shadow-soft bg-slate-200">
              <FoodPhoto items={srcItems} photo={src.url} seed={src.sample || 'u'} className="w-full h-full" />
              <button onClick={() => setSrc(null)} className="absolute top-3 right-3 h-9 px-3 rounded-full bg-black/55 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur"><Icon n="rotate" s={14} />{T('Change', 'Tukar')}</button>
              <div className="absolute bottom-3 left-3 h-8 px-3 rounded-full bg-white/90 text-xs font-bold flex items-center gap-1.5"><Icon n="check" s={14} className="text-brand-600" />{T('Photo ready', 'Gambar sedia')}</div>
            </div>
          ) : (
            <div className="rounded-[22px] border-2 border-dashed border-brand-200 bg-brand-50/50 p-5 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-soft flex items-center justify-center text-brand-600 mb-3"><Icon n="camera" s={30} sw={1.7} /></div>
              <div className="font-bold">{T('Add a photo of your meal', 'Tambah gambar makanan anda')}</div>
              <div className="text-xs text-ink-mute mt-1 mb-4">{T('Make sure all food & drinks are visible', 'Pastikan semua makanan & minuman kelihatan')}</div>
              <div className="grid grid-cols-2 gap-2.5">
                <FileButton capture onFile={(url) => setSrc({ url })} className="h-12 rounded-2xl bg-brand-600 text-white font-semibold text-sm flex items-center justify-center gap-2"><Icon n="camera" s={18} />{T('Take photo', 'Ambil gambar')}</FileButton>
                <FileButton onFile={(url) => setSrc({ url })} className="h-12 rounded-2xl bg-white border border-slate-200 font-semibold text-sm flex items-center justify-center gap-2"><Icon n="image" s={18} />{T('Gallery', 'Galeri')}</FileButton>
              </div>
            </div>
          )}
        </div>

        <div className="text-[13px] font-semibold text-ink-soft mb-2 mt-5 flex items-center gap-2">{T('Or try a sample photo', 'Atau cuba gambar contoh')}<span className="text-[10px] font-bold bg-slate-200 text-ink-soft rounded px-1.5 py-0.5">DEMO</span></div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {SAMPLE_MEALS.map((s) => (
            <button key={s.id} onClick={() => setSrc({ sample: s.id })} className={`shrink-0 w-[108px] text-left rounded-2xl p-1.5 bg-white shadow-soft border-2 ${src?.sample === s.id ? 'border-brand-500' : 'border-transparent'}`}>
              <FoodPhoto items={toItems(s.items)} seed={s.id} className="w-full h-[84px] rounded-xl" />
              <div className="text-[11.5px] font-semibold mt-1.5 px-1 leading-tight h-8">{L(s.n)}</div>
            </button>
          ))}
        </div>

        <Btn className="w-full mt-5" icon="sparkles" disabled={!src} onClick={analyze}>{T('Analyse with AI', 'Analisis dengan AI')}</Btn>
      </div>
    </div>
  );

  if (step === 'scan') {
    const msgs = [T('Detecting food items…', 'Mengesan jenis makanan…'), T('Estimating portions…', 'Menganggar saiz hidangan…'), T('Calculating nutrition…', 'Mengira nutrisi…')];
    return (
      <div className="min-h-full flex flex-col">
        <Header title={T('Analysing', 'Menganalisis')} onBack={() => setStep('choose')} />
        <div className="px-4">
          <div className="relative rounded-[22px] overflow-hidden aspect-[4/3] bg-slate-900">
            <FoodPhoto items={srcItems.length ? srcItems : [{ id: 'rice_white', p: 1 }]} photo={src.url} seed={src.sample || 'u'} className="w-full h-full opacity-90" />
            <div className="absolute inset-0 scangrid" />
            <div className="scanline" />
            {['top-3 left-3 border-t-4 border-l-4 rounded-tl-xl', 'top-3 right-3 border-t-4 border-r-4 rounded-tr-xl', 'bottom-3 left-3 border-b-4 border-l-4 rounded-bl-xl', 'bottom-3 right-3 border-b-4 border-r-4 rounded-br-xl'].map((c, i) => <div key={i} className={`absolute w-8 h-8 border-white ${c}`} />)}
          </div>
          <div className="flex flex-col items-center text-center mt-6">
            <AssistantAvatar size={52} />
            <div className="font-bold text-lg mt-3">{T('AI is analysing your meal…', 'AI sedang menganalisis makanan anda…')}</div>
            <div className="text-sm text-brand-700 font-semibold mt-1 h-5 anim-fade" key={scanMsg}>{msgs[scanMsg]}</div>
            <div className="flex gap-1.5 mt-4">{msgs.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= scanMsg ? 'w-8 bg-brand-500' : 'w-4 bg-slate-200'}`} />)}</div>
          </div>
          <div className="mt-6 space-y-3"><Skeleton className="h-16" /><Skeleton className="h-28" /><Skeleton className="h-12 w-2/3" /></div>
        </div>
      </div>
    );
  }

  if (step === 'saved') {
    const today = nutri(p.meals.filter((m) => isToday(m.t)).flatMap((m) => m.items));
    const sn = nutri(saved.items); const ss = mealStatus(sn);
    return (
      <div className="min-h-full flex flex-col px-6 pt-14 pb-8 text-center">
        <div className="pop mx-auto w-24 h-24 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-[0_16px_40px_-12px_rgba(22,165,140,.9)]"><Icon n="check" s={48} sw={3} /></div>
        <h2 className="text-2xl font-extrabold mt-6">{T('Meal saved!', 'Makanan disimpan!')}</h2>
        <p className="text-ink-mute text-sm mt-1.5">{fill(T('Your {mt} has been added to your diary and shared with your care team.', '{mt} anda telah ditambah ke diari dan dikongsi dengan pasukan penjagaan anda.'), { mt: L(MT[saved.mt].n).toLowerCase() })}</p>
        <Card className="p-3 mt-6 text-left flex items-center gap-3">
          <FoodPhoto items={saved.items} photo={saved.photo} seed={saved.id} className="w-16 h-16 rounded-xl" />
          <div className="flex-1 min-w-0"><div className="font-semibold truncate">{mealTitle(saved.items)}</div><div className="text-xs text-ink-mute tnum">{Math.round(sn.carbs)} g {T('carbs', 'karbo')} · {Math.round(sn.sugar)} g {T('sugar', 'gula')}</div></div>
          <Badge s={ss} />
        </Card>
        <Card className="p-4 mt-3 text-left">
          <div className="flex justify-between text-[13px] mb-1.5"><span className="text-ink-soft">{T("Today's carbs", 'Karbohidrat hari ini')}</span><span className="font-bold tnum">{Math.round(today.carbs)} / {p.targets.carbs} g</span></div>
          <Bar value={today.carbs} max={p.targets.carbs} color={today.carbs > p.targets.carbs ? '#ec7461' : '#16a58c'} />
          <div className="flex items-center gap-2 mt-3 text-[13px] font-semibold text-amber-700"><Icon n="star" s={16} fill="#f0a92e" className="text-amber-500" />+10 {T('points added to your balance', 'mata ditambah ke baki anda')}</div>
          <div className="flex items-center gap-2 mt-1.5 text-[13px] font-semibold text-brand-700"><Icon n="zap" s={16} />+{XP[ss]} XP · {ss === 'good' ? T('Healthy plate! Climbing the league', 'Pinggan sihat! Naik liga') : fill(T('{t} League', 'Liga {t}'), { t: L(LEAGUE_TIERS[MY_TIER].n) })}</div>
        </Card>
        <div className="flex-1" />
        <div className="space-y-2.5 mt-8">
          <Btn className="w-full" icon="book" onClick={() => nav.goTab('diary')}>{T('See it in my diary', 'Lihat dalam diari')}</Btn>
          <Btn v="secondary" className="w-full" onClick={() => nav.goTab('home')}>{T('Back to home', 'Kembali ke utama')}</Btn>
          <button className="text-sm font-semibold text-brand-700 h-11 w-full" onClick={reset}>+ {T('Log another meal', 'Catat makanan lain')}</button>
        </div>
      </div>
    );
  }

  // RESULT
  const shown = FOODS.filter((f) => L(f.n).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="min-h-full flex flex-col">
      <Header title={T('Analysis result', 'Hasil analisis')} sub={L(MT[mt].n) + ' · ' + fmtTime(now())} onBack={() => setStep('choose')} />
      <div className="px-4 space-y-3 stagger">
        <div className="relative rounded-[22px] overflow-hidden aspect-[16/10] shadow-soft">
          <FoodPhoto items={items} photo={src.url} seed={src.sample || 'u'} className="w-full h-full" />
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between">
            <span className="text-white text-xs font-semibold flex items-center gap-1.5"><Icon n="sparkles" s={14} />{fill(items.length === 1 ? T('AI detected {n} item', 'AI mengesan {n} item') : T('AI detected {n} items', 'AI mengesan {n} item'), { n: items.length })}</span>
            <Badge s={mealStatus(n)} />
          </div>
        </div>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-[15px]">{T('Detected food', 'Makanan dikesan')}</div>
            <span className="text-[11px] text-ink-mute">{T('Tap to adjust', 'Ketik untuk ubah')}</span>
          </div>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-paper rounded-2xl p-2 pl-3">
                <span className="text-2xl">{FOOD[it.id].e}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold truncate">{L(FOOD[it.id].n)}</div>
                  <div className="text-[11px] text-ink-mute tnum">{Math.round(FOOD[it.id].carbs * it.p)} g {T('carbs', 'karbo')} · {Math.round(FOOD[it.id].sugar * it.p)} g {T('sugar', 'gula')}</div>
                </div>
                <div className="flex bg-white rounded-xl p-0.5 shadow-sm">
                  {[0.5, 1, 1.5].map((pv) => <button key={pv} onClick={() => setPortion(i, pv)} className={`w-9 h-8 rounded-lg text-xs font-bold ${it.p === pv ? 'bg-brand-600 text-white' : 'text-ink-soft'}`}>{pv === 0.5 ? '½' : pv === 1.5 ? '1½' : '1'}</button>)}
                </div>
                <button onClick={() => setItems(items.filter((_, k) => k !== i))} className="w-9 h-9 rounded-full flex items-center justify-center text-ink-mute hover:bg-white" aria-label="Remove"><Icon n="x" s={16} /></button>
              </div>
            ))}
            {!items.length && <div className="text-sm text-ink-mute text-center py-3">{T('No items — add food below', 'Tiada item — tambah makanan di bawah')}</div>}
          </div>
          <button onClick={() => setAddOpen(true)} className="mt-2.5 w-full h-11 rounded-2xl border-2 border-dashed border-brand-200 text-brand-700 font-semibold text-sm flex items-center justify-center gap-1.5"><Icon n="plus" s={16} />{T('Add food', 'Tambah makanan')}</button>
        </Card>

        <NutritionPanel n={n} />
        <div>
          <div className="flex items-center gap-2 mb-2 mt-1"><AssistantAvatar size={28} /><span className="font-bold text-[15px]">{T('Assistant notes', 'Nota pembantu')}</span></div>
          <WarningList items={items} n={n} target={p.targets.carbs} />
        </div>
        <ExerciseList mealId={draftId} gl={n.gl} />
        <Disclaimer />
      </div>

      <div className="sticky bottom-0 mt-auto p-4 bg-gradient-to-t from-paper via-paper to-paper/0 safe-b z-20">
        <Btn className="w-full" icon="check" disabled={!items.length} onClick={save}>{T('Save', 'Simpan')} <span className="text-[11px] font-bold bg-amber-300 text-amber-900 rounded-full px-2 py-0.5 ml-1">+10 {T('pts', 'mata')}</span></Btn>
      </div>

      <Sheet open={addOpen} onClose={() => { setAddOpen(false); setQ(''); }} title={T('Add food', 'Tambah makanan')}>
        <div className="relative mb-3">
          <Icon n="search" s={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T('Search food or drink…', 'Cari makanan atau minuman…')} className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100 outline-none focus:ring-2 ring-brand-300 text-sm" />
        </div>
        <div className="divide-y divide-slate-100">
          {shown.map((f) => (
            <button key={f.id} onClick={() => { setItems([...items, { id: f.id, p: 1 }]); setAddOpen(false); setQ(''); }} className="w-full flex items-center gap-3 py-2.5 text-left">
              <span className="text-2xl w-9 text-center">{f.e}</span>
              <div className="flex-1"><div className="text-sm font-semibold">{L(f.n)}</div><div className="text-[11px] text-ink-mute tnum">{f.kcal} kcal · {f.carbs} g {T('carbs', 'karbo')} · {f.sugar} g {T('sugar', 'gula')}</div></div>
              <Icon n="plus" s={18} className="text-brand-600" />
            </button>
          ))}
          {!shown.length && <EmptyState icon="search" title={T('No match', 'Tiada padanan')} text={T('Try another name', 'Cuba nama lain')} />}
        </div>
      </Sheet>
    </div>
  );
}

/* ---------- Exercise timer ---------- */
function PExercise({ mealId, ex }) {
  const { S, mutate, nav, award } = useApp();
  const e = EX[ex];
  const already = (S.exDone[mealId] || []).includes(ex);
  const [left, setLeft] = useState(e.dur);
  const [run, setRun] = useState(false);
  const [done, setDone] = useState(already);
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setLeft((l) => { if (l <= 1) { clearInterval(t); return 0; } return l - 1; }), 1000);
    return () => clearInterval(t);
  }, [run]);
  useEffect(() => { if (left === 0 && !done) finish(); }, [left]);
  const finish = () => {
    setRun(false); setDone(true);
    if (already) return;
    mutate((d) => {
      d.exDone[mealId] = [...(d.exDone[mealId] || []), ex];
      (d.diary.p1 ||= []).push({ id: uid('dy'), kind: 'exercise', t: now(), act: ex, mins: e.dur - left >= 60 ? Math.round((e.dur - left) / 60) : Math.round(e.dur / 60) });
    });
    setTimeout(() => award(5, { en: e.n.en + ' completed', ms: e.n.ms + ' selesai' }), 200);
  };
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');

  if (done) return (
    <div className="min-h-full flex flex-col">
      <Header title={L(e.n)} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pb-10">
        <div className="pop w-28 h-28 rounded-full bg-good-bg text-good-fg flex items-center justify-center"><Icon n="award" s={54} sw={1.6} /></div>
        <h2 className="text-2xl font-extrabold mt-6">{T('Well done! 🎉', 'Syabas! 🎉')}</h2>
        <p className="text-ink-mute mt-2 text-sm">{T('Moving after meals helps your muscles absorb glucose and lowers your sugar spike.', 'Bergerak selepas makan membantu otot menyerap glukosa dan mengurangkan lonjakan gula.')}</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 text-amber-700 font-bold rounded-full px-4 h-10 text-sm"><Icon n="star" s={16} fill="#f0a92e" className="text-amber-500" />+5 {T('points', 'mata')}</div>
        <Btn className="w-full mt-10" onClick={nav.back}>{T('Done', 'Selesai')}</Btn>
      </div>
    </div>
  );

  return (
    <div className="min-h-full flex flex-col">
      <Header title={L(e.n)} sub={L(e.int) + ' · ' + L(e.label)} />
      <div className="flex-1 flex flex-col items-center px-6 pb-8">
        <div className="mt-4">
          <Ring value={e.dur - left} max={e.dur} size={236} stroke={16} color="#16a58c">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mb-2"><Icon n={e.icon} s={28} className={run ? 'wiggle' : ''} /></div>
            <div className="text-5xl font-extrabold tnum tracking-tight">{mm}:{ss}</div>
            <div className="text-xs text-ink-mute mt-1 font-semibold">{run ? T('Keep going!', 'Teruskan!') : left === e.dur ? T('Ready?', 'Bersedia?') : T('Paused', 'Dijeda')}</div>
          </Ring>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button onClick={() => { setRun(false); setLeft(e.dur); }} className="w-14 h-14 rounded-full bg-white shadow-soft flex items-center justify-center" aria-label="Reset"><Icon n="rotate" /></button>
          <button onClick={() => setRun(!run)} className="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-[0_14px_30px_-10px_rgba(11,138,118,.9)]" aria-label="Play/pause"><Icon n={run ? 'pause' : 'play'} s={30} fill="#fff" sw={1} /></button>
          <button onClick={finish} className="w-14 h-14 rounded-full bg-white shadow-soft flex items-center justify-center text-brand-700" aria-label="Finish"><Icon n="check" sw={2.5} /></button>
        </div>
        <Card className="p-4 mt-7 w-full">
          <div className="font-bold text-sm mb-2">{T('How to do it', 'Cara melakukannya')}</div>
          {e.steps.map((s, i) => (
            <div key={i} className="flex gap-3 items-start py-1.5"><span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span><span className="text-[13.5px] text-ink-soft">{L(s)}</span></div>
          ))}
        </Card>
        <button onClick={finish} className="mt-4 text-sm font-semibold text-brand-700 h-11">{T('I already finished — mark as done', 'Saya sudah selesai — tandakan selesai')}</button>
      </div>
    </div>
  );
}

/* ---------- Meal detail & history ---------- */
function PMealDetail({ pid, mealId, readOnly }) {
  const { S } = useApp();
  const pt = S.patients[pid]; const meal = pt.meals.find((m) => m.id === mealId);
  if (!meal) return <div><Header title="—" /><EmptyState title={T('Meal not found', 'Makanan tidak dijumpai')} /></div>;
  const n = nutri(meal.items);
  return (
    <div className="pb-10">
      <Header title={mealTitle(meal.items)} sub={L(MT[meal.mt].n) + ' · ' + relDay(meal.t) + ', ' + fmtTime(meal.t)} />
      <div className="px-4 space-y-3 stagger">
        <div className="relative rounded-[22px] overflow-hidden aspect-[16/10] shadow-soft">
          <FoodPhoto items={meal.items} photo={meal.photo} seed={meal.id} className="w-full h-full" />
          <div className="absolute top-3 right-3"><Badge s={mealStatus(n)} /></div>
        </div>
        <Card className="p-4">
          <div className="font-bold text-[15px] mb-2">{T('Food items', 'Item makanan')}</div>
          <div className="flex flex-wrap gap-2">
            {meal.items.map((it, i) => <span key={i} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-paper text-[13px] font-semibold">{FOOD[it.id].e} {L(FOOD[it.id].n)}{it.p !== 1 && <span className="text-ink-mute">×{it.p}</span>}</span>)}
          </div>
        </Card>
        <NutritionPanel n={n} />
        <WarningList items={meal.items} n={n} target={pt.targets.carbs} />
        <ExerciseList mealId={meal.id} gl={n.gl} readOnly={readOnly || !isToday(meal.t)} />
        <Disclaimer />
      </div>
    </div>
  );
}

/* ---------- PASSPORT ---------- */
const REC_KIND = {
  lab: { icon: 'flask', c: 'bg-brand-50 text-brand-700', n: { en: 'Lab result', ms: 'Keputusan makmal' } },
  rx: { icon: 'pill', c: 'bg-amber-50 text-amber-700', n: { en: 'Prescription', ms: 'Preskripsi' } },
  letter: { icon: 'mail', c: 'bg-indigo-50 text-indigo-600', n: { en: "Doctor's letter", ms: 'Surat doktor' } },
};

function RecordsTimeline({ pt }) {
  const { nav } = useApp();
  const recs = [...pt.records].sort((a, b) => b.t - a.t);
  return (
    <div className="relative pl-5">
      <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-brand-100 rounded" />
      {recs.map((r) => (
        <div key={r.id} className="relative mb-2.5">
          <div className="absolute -left-5 top-5 w-[18px] h-[18px] rounded-full bg-white border-[3px] border-brand-400" />
          <Card className="p-3 flex items-center gap-3" onClick={() => nav.push('record', { pid: pt.id, rid: r.id })}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${REC_KIND[r.kind].c}`}><Icon n={REC_KIND[r.kind].icon} /></div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">{L(REC_KIND[r.kind].n)}{r.isNew && <span className="ml-2 text-[10px] font-bold bg-brand-500 text-white rounded px-1.5 py-0.5 align-middle">{T('NEW', 'BAHARU')}</span>}</div>
              <div className="text-xs text-ink-mute truncate">{r.lab}</div>
              <div className="text-[11px] text-ink-mute">{fmtDate(r.t)}</div>
            </div>
            {r.vals?.hba1c != null && <div className="text-right"><div className="text-[10px] text-ink-mute">HbA1c</div><div className="font-bold text-sm tnum">{r.vals.hba1c}%</div></div>}
            <Icon n="right" s={18} className="text-ink-mute" />
          </Card>
        </div>
      ))}
    </div>
  );
}

function DoctorPicker({ open, onClose, onPick }) {
  return (
    <Sheet open={open} onClose={onClose} title={T('Share passport with…', 'Kongsi pasport dengan…')}>
      <div className="text-[13px] text-ink-mute -mt-1 mb-3">{T('Your latest metrics will be sent as a secure card in chat.', 'Metrik terkini anda akan dihantar sebagai kad selamat dalam sembang.')}</div>
      {DOCTORS.map((d) => (
        <button key={d.id} onClick={() => onPick(d.id)} className="w-full flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 text-left">
          <div className="relative"><Avatar name={d.name} hue={d.hue} size={44} /><StatusDot status={d.status} /></div>
          <div className="flex-1 min-w-0"><div className="font-semibold text-sm">{d.name}</div><div className="text-xs text-ink-mute">{L(SPEC[d.spec])}</div></div>
          <span className="h-9 px-3 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold flex items-center gap-1"><Icon n="send" s={14} />{T('Send', 'Hantar')}</span>
        </button>
      ))}
    </Sheet>
  );
}

/* ---------- Upload record (OCR) ---------- */
/* ---------- POINTS & REWARDS ---------- */
function PPoints({ tab: initTab }) {
  const { S, mutate, nav } = useApp();
  const pts = S.points;
  const [tab, setTab] = useState(initTab || 'rewards');
  const [sel, setSel] = useState(null);
  const tier = tierOf(pts.lifetime);
  const next = TIERS[TIERS.indexOf(tier) + 1];
  const redeem = () => {
    const rw = sel; const code = 'GP-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 8999);
    const vid = uid('v');
    mutate((d) => {
      d.points.balance -= rw.cost;
      d.points.history.unshift({ t: now(), pts: -rw.cost, n: { en: 'Redeemed: ' + rw.n.en, ms: 'Tebus: ' + rw.n.ms } });
      d.points.vouchers.unshift({ id: vid, rw: rw.id, code, t: now(), exp: now() + 60 * DAY });
    });
    setSel(null);
    setTimeout(() => nav.push('voucher', { vid }), 260);
  };
  return (
    <div className="pb-10">
      <Header title={T('Points & Rewards', 'Mata & Ganjaran')} />
      <div className="px-4 stagger">
        <div className="rounded-[24px] p-5 text-amber-950 relative overflow-hidden shadow-lift" style={{ background: 'linear-gradient(135deg,#ffd77a,#f6b73c 60%,#ec9a1f)' }}>
          <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-white/20" /><div className="absolute right-16 -bottom-14 w-32 h-32 rounded-full bg-white/15" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold opacity-80">{T('Your balance', 'Baki anda')}</span>
              <span className="h-7 px-2.5 rounded-full text-[11px] font-bold text-white flex items-center gap-1" style={{ background: tier.bg }}><Icon n="award" s={13} />{tier.n}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1"><span className="text-[44px] font-extrabold tnum leading-none">{num(pts.balance)}</span><span className="font-bold">{T('points', 'mata')}</span></div>
            {next ? (
              <div className="mt-4">
                <div className="flex justify-between text-[12px] font-semibold mb-1.5"><span>{tier.n}</span><span>{fill(T('{n} pts to {t}', '{n} mata ke {t}'), { n: num(next.min - pts.lifetime), t: next.n })}</span></div>
                <div className="h-2.5 rounded-full bg-white/40 overflow-hidden"><div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${((pts.lifetime - tier.min) / (next.min - tier.min)) * 100}%` }} /></div>
              </div>
            ) : <div className="mt-3 text-sm font-semibold">{T('Top tier reached 🎉', 'Tahap tertinggi dicapai 🎉')}</div>}
          </div>
        </div>

        <SectionTitle>{T('How to earn', 'Cara kumpul mata')}</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          {EARN_WAYS.map((w, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 shadow-soft flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Icon n={w.icon} s={19} /></div>
              <div className="min-w-0"><div className="text-[12px] font-semibold leading-tight">{L(w.n)}</div><div className="text-[13px] font-extrabold text-amber-600">+{w.pts}</div></div>
            </div>
          ))}
        </div>

        <Segmented className="mt-5" value={tab} onChange={setTab} options={[{ v: 'rewards', l: T('Rewards', 'Ganjaran') }, { v: 'vouchers', l: T('My vouchers', 'Baucar saya') }, { v: 'history', l: T('History', 'Sejarah') }]} />

        {tab === 'rewards' && (
          <div className="grid grid-cols-2 gap-2.5 mt-3 stagger" key="r">
            {REWARDS.map((rw) => {
              const can = pts.balance >= rw.cost;
              return (
                <button key={rw.id} disabled={!can} onClick={() => setSel(rw)} className="bg-white rounded-[20px] p-2.5 shadow-soft text-left flex flex-col disabled:opacity-100">
                  <div className={`h-24 rounded-2xl flex items-center justify-center text-[44px] ${can ? '' : 'grayscale opacity-60'}`} style={{ background: rw.bg }}>{rw.e}</div>
                  <div className="text-[12.5px] font-semibold leading-tight mt-2 px-0.5 min-h-[32px]">{L(rw.n)}</div>
                  <div className="text-[10.5px] text-ink-mute px-0.5">{rw.partner}</div>
                  <div className="flex items-center justify-between mt-2 px-0.5">
                    <span className={`font-extrabold text-[14px] flex items-center gap-1 ${can ? 'text-amber-600' : 'text-ink-mute'}`}><Icon n="star" s={13} fill="currentColor" sw={1} />{num(rw.cost)}</span>
                    {can ? <span className="text-[11px] font-bold text-brand-700">{T('Redeem', 'Tebus')}</span> : <span className="text-[10px] font-semibold text-ink-mute flex items-center gap-0.5"><Icon n="lock" s={11} />{fill(T('{n} more', 'lagi {n}'), { n: num(rw.cost - pts.balance) })}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {tab === 'vouchers' && (
          <div className="mt-3 space-y-2.5 stagger" key="v">
            {pts.vouchers.length ? pts.vouchers.map((v) => { const rw = REWARDS.find((x) => x.id === v.rw); return (
              <Card key={v.id} className="p-3 flex items-center gap-3" onClick={() => nav.push('voucher', { vid: v.id })}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: rw.bg }}>{rw.e}</div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{L(rw.n)}</div><div className="text-xs font-mono text-brand-700">{v.code}</div></div>
                <Icon n="right" s={18} className="text-ink-mute" />
              </Card>); })
              : <EmptyState icon="ticket" title={T('No vouchers yet', 'Belum ada baucar')} text={T('Redeem a reward and your voucher codes will show up here.', 'Tebus ganjaran dan kod baucar anda akan dipaparkan di sini.')} action={<Btn size="sm" v="soft" onClick={() => setTab('rewards')}>{T('Browse rewards', 'Lihat ganjaran')}</Btn>} />}
          </div>
        )}
        {tab === 'history' && (
          <Card className="mt-3 px-1" key="h">
            {pts.history.map((h, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-3 ${i < pts.history.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${h.pts > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-ink-soft'}`}><Icon n={h.pts > 0 ? 'plus' : 'gift'} s={16} /></div>
                <div className="flex-1 min-w-0"><div className="text-[13.5px] font-semibold truncate">{L(h.n)}</div><div className="text-[11px] text-ink-mute">{relDay(h.t)} · {fmtTime(h.t)}</div></div>
                <span className={`font-extrabold tnum text-sm ${h.pts > 0 ? 'text-amber-600' : 'text-ink-soft'}`}>{h.pts > 0 ? '+' : ''}{num(h.pts)}</span>
              </div>
            ))}
          </Card>
        )}
      </div>

      <Sheet open={!!sel} onClose={() => setSel(null)} title={T('Redeem reward', 'Tebus ganjaran')}>
        {sel && (
          <div>
            <div className="h-36 rounded-3xl flex items-center justify-center text-7xl" style={{ background: sel.bg }}>{sel.e}</div>
            <div className="font-bold text-lg mt-4">{L(sel.n)}</div>
            <div className="text-sm text-ink-mute">{sel.partner} · {T('valid 60 days', 'sah 60 hari')}</div>
            <div className="bg-paper rounded-2xl p-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-soft">{T('Current balance', 'Baki semasa')}</span><span className="font-bold tnum">{num(pts.balance)}</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">{T('Cost', 'Kos')}</span><span className="font-bold text-risk-fg tnum">−{num(sel.cost)}</span></div>
              <div className="border-t border-slate-200 pt-2 flex justify-between"><span className="font-semibold">{T('Balance after', 'Baki selepas')}</span><span className="font-extrabold tnum">{num(pts.balance - sel.cost)}</span></div>
            </div>
            <Btn v="amber" className="w-full mt-4" icon="gift" onClick={redeem}>{fill(T('Redeem for {n} points', 'Tebus dengan {n} mata'), { n: num(sel.cost) })}</Btn>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function PVoucher({ vid }) {
  const { S, nav, toast } = useApp();
  const v = S.points.vouchers.find((x) => x.id === vid);
  if (!v) return <div><Header title="—" /></div>;
  const rw = REWARDS.find((x) => x.id === v.rw);
  const copy = () => { try { navigator.clipboard.writeText(v.code); } catch (e) {} toast(T('Code copied', 'Kod disalin'), 'copy'); };
  return (
    <div className="pb-10 min-h-full bg-gradient-to-b from-amber-50 to-paper">
      <Header title={T('Your voucher', 'Baucar anda')} transparent />
      <div className="px-5 text-center">
        <div className="pop inline-flex items-center gap-2 bg-good-bg text-good-fg font-bold text-sm rounded-full px-4 h-9 mt-2"><Icon n="check" s={16} />{T('Redeemed successfully!', 'Berjaya ditebus!')}</div>
        <div className="mt-5 bg-white rounded-[24px] shadow-lift overflow-hidden text-left anim-fade">
          <div className="p-5 flex items-center gap-4" style={{ background: rw.bg }}>
            <div className="text-5xl">{rw.e}</div>
            <div><div className="font-bold leading-tight">{L(rw.n)}</div><div className="text-xs text-ink-soft mt-0.5">{rw.partner}</div></div>
          </div>
          <div className="relative h-0 border-t-2 border-dashed border-slate-200 mx-4"><span className="absolute -left-7 -top-3 w-6 h-6 rounded-full bg-amber-50" /><span className="absolute -right-7 -top-3 w-6 h-6 rounded-full bg-amber-50" /></div>
          <div className="p-5 text-center">
            <div className="text-xs text-ink-mute font-semibold uppercase tracking-wide">{T('Voucher code', 'Kod baucar')}</div>
            <div className="font-mono text-2xl font-extrabold tracking-[.12em] mt-1 text-brand-800">{v.code}</div>
            <div className="flex justify-center mt-4"><QRCode seed={v.code} size={120} /></div>
            <div className="text-xs text-ink-mute mt-3">{T('Valid until', 'Sah sehingga')} {fmtDate(v.exp)}</div>
            <Btn v="soft" size="sm" icon="copy" className="mt-3" onClick={copy}>{T('Copy code', 'Salin kod')}</Btn>
          </div>
        </div>
        <Card className="p-4 mt-4 text-left">
          <div className="font-bold text-sm mb-2">{T('How to use', 'Cara guna')}</div>
          {[T('Show this QR code or code at the partner counter.', 'Tunjukkan kod QR atau kod ini di kaunter rakan kongsi.'), T('Staff will scan and validate it.', 'Kakitangan akan imbas dan sahkan.'), T('One-time use only.', 'Sekali guna sahaja.')].map((s, i) => <div key={i} className="flex gap-2.5 py-1 text-[13px] text-ink-soft"><span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>{s}</div>)}
        </Card>
        <Btn className="w-full mt-5" onClick={nav.back}>{T('Done', 'Selesai')}</Btn>
      </div>
    </div>
  );
}

/* ---------- KONSULTASI ---------- */
/* ---------- PROFIL ---------- */
function PProfile() {
  const { S, mutate, nav, toast, setLang, logout } = useApp();
  const p = S.patients.p1;
  const [edit, setEdit] = useState(false);
  const [tg, setTg] = useState(p.targets);
  const rem = S.reminders;
  const remList = [
    ['meals', 'utensils', T('Meal logging reminders', 'Peringatan catat makanan'), '08:00 · 13:00 · 19:00'],
    ['meds', 'pill', T('Medication reminder', 'Peringatan ubat'), 'Metformin · 08:00, 20:00'],
    ['exercise', 'walk', T('Post-meal movement nudges', 'Galakan bergerak selepas makan'), T('After high-sugar meals', 'Selepas makanan tinggi gula')],
    ['lab', 'flask', T('Lab check reminder', 'Peringatan ujian makmal'), T('Every 3 months', 'Setiap 3 bulan')],
  ];
  const tier = tierOf(S.points.lifetime);
  return (
    <div className="pb-28">
      <div className="passport-bg text-white px-5 pt-6 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 passport-pattern" />
        <div className="relative flex items-center gap-4">
          <Avatar name={p.name} hue={p.hue} size={68} ring />
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-xl truncate">{p.name}</div>
            <div className="text-sm text-white/75">{p.phone}</div>
            <div className="flex gap-1.5 mt-1.5"><span className="text-[11px] font-semibold bg-white/15 rounded-full px-2 py-0.5">{L(p.type)}</span><span className="text-[11px] font-semibold bg-white/15 rounded-full px-2 py-0.5">{T('Blood', 'Darah')} {p.blood}</span></div>
          </div>
        </div>
      </div>
      <div className="px-4 -mt-10 relative stagger">
        <Card className="p-4 flex items-center gap-3" onClick={() => nav.push('points')}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-white"><Icon n="star" s={22} fill="#fff" sw={1} /></div>
          <div className="flex-1"><div className="text-xs text-ink-mute">{T('Points & Rewards', 'Mata & Ganjaran')} · {tier.n}</div><div className="text-xl font-extrabold tnum">{num(S.points.balance)} <span className="text-sm font-semibold text-ink-mute">{T('pts', 'mata')}</span></div></div>
          <span className="text-sm font-bold text-brand-700 flex items-center">{T('Redeem', 'Tebus')}<Icon n="right" s={16} /></span>
        </Card>

        <SectionTitle>{T('Health profile', 'Profil kesihatan')}</SectionTitle>
        <Card className="overflow-hidden">
          {[[T('Diabetes type', 'Jenis diabetes'), L(p.type)], [T('Diagnosed since', 'Didiagnosis sejak'), p.since], [T('Age · Sex', 'Umur · Jantina'), `${p.age} · ${L(p.sex)}`], [T('Blood type', 'Jenis darah'), p.blood], [T('Height · Weight', 'Tinggi · Berat'), `${p.height} cm · ${latest(p.metrics.weight).v} kg`], [T('Medication', 'Ubat'), L(p.meds)]].map(([k, v], i, a) => (
            <div key={i} className={`flex justify-between gap-4 px-4 py-3 text-sm ${i < a.length - 1 ? 'border-b border-slate-100' : ''}`}><span className="text-ink-soft">{k}</span><span className="font-semibold text-right">{v}</span></div>
          ))}
        </Card>

        <SectionTitle action={T('Edit', 'Ubah')} onAction={() => { setTg(p.targets); setEdit(true); }}>{T('Daily targets', 'Sasaran harian')}</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <Card className="p-4" onClick={() => { setTg(p.targets); setEdit(true); }}><div className="text-xs text-ink-mute">{T('Carbohydrates', 'Karbohidrat')}</div><div className="text-2xl font-extrabold tnum mt-0.5">{p.targets.carbs} <span className="text-sm text-ink-mute">g</span></div></Card>
          <Card className="p-4" onClick={() => { setTg(p.targets); setEdit(true); }}><div className="text-xs text-ink-mute">{T('Added sugar', 'Gula tambahan')}</div><div className="text-2xl font-extrabold tnum mt-0.5">{p.targets.sugar} <span className="text-sm text-ink-mute">g</span></div></Card>
        </div>

        <SectionTitle>{T('Reminders', 'Peringatan')}</SectionTitle>
        <Card className="overflow-hidden">
          {remList.map(([k, ic, t, s], i) => (
            <ListRow key={k} icon={ic} title={t} sub={s} last={i === remList.length - 1}
              right={<Toggle on={rem[k]} onChange={(v) => { mutate((d) => { d.reminders[k] = v; }); toast(v ? T('Reminder turned on', 'Peringatan dihidupkan') : T('Reminder turned off', 'Peringatan dimatikan'), 'bell'); }} />} />
          ))}
        </Card>

        <SectionTitle>{T('Language', 'Bahasa')}</SectionTitle>
        <Segmented value={CUR_LANG} onChange={setLang} options={[{ v: 'en', l: 'English' }, { v: 'ms', l: 'Bahasa Melayu' }]} />

        <SectionTitle>{T('More', 'Lain-lain')}</SectionTitle>
        <Card className="overflow-hidden">
          <ListRow icon="book" title={T('My diary', 'Diari saya')} onClick={() => nav.goTab('diary')} />
          <ListRow icon="ticket" title={T('My vouchers', 'Baucar saya')} onClick={() => nav.push('points', { tab: 'vouchers' })} />
          <ListRow icon="passport" title={T('Health Passport', 'Pasport Kesihatan')} onClick={() => nav.goTab('passport')} />
          <ListRow icon="logout" iconBg="bg-risk-bg text-risk-fg" title={<span className="text-risk-fg">{T('Log out', 'Log keluar')}</span>} onClick={logout} last right={<span />} />
        </Card>
        <div className="text-center text-[11px] text-ink-mute mt-5">{APP_NAME} v0.9 · {T('Prototype — mock data only', 'Prototaip — data contoh sahaja')}</div>
      </div>

      <Sheet open={edit} onClose={() => setEdit(false)} title={T('Daily targets', 'Sasaran harian')}>
        <div className="text-[13px] text-ink-mute -mt-1 mb-4">{T('Set together with your doctor or dietitian.', 'Tetapkan bersama doktor atau pegawai dietetik anda.')}</div>
        {[['carbs', T('Carbohydrates per day', 'Karbohidrat sehari'), 10, 80, 300], ['sugar', T('Added sugar per day', 'Gula tambahan sehari'), 5, 5, 60]].map(([k, l, step, mn, mx]) => (
          <div key={k} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div><div className="font-semibold text-sm">{l}</div><div className="text-xs text-ink-mute">{T('grams', 'gram')}</div></div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTg({ ...tg, [k]: clamp(tg[k] - step, mn, mx) })} className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center"><Icon n="minus" /></button>
              <span className="w-14 text-center text-xl font-extrabold tnum">{tg[k]}</span>
              <button onClick={() => setTg({ ...tg, [k]: clamp(tg[k] + step, mn, mx) })} className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center"><Icon n="plus" /></button>
            </div>
          </div>
        ))}
        <Btn className="w-full mt-4" onClick={() => { mutate((d) => { d.patients.p1.targets = tg; }); setEdit(false); toast(T('Targets updated', 'Sasaran dikemas kini')); }}>{T('Save targets', 'Simpan sasaran')}</Btn>
      </Sheet>
    </div>
  );
}
