/* ============ CHAT (shared by both roles) ============ */
function msgPreview(m) {
  if (!m) return '';
  if (m.type === 'passport') return '🪪 ' + T('Health Passport', 'Pasport Kesihatan');
  if (m.type === 'meal') return '🍽️ ' + T('Meal log', 'Catatan makan');
  if (m.type === 'image') return '📷 ' + T('Photo', 'Gambar');
  return L(m.text);
}

function PassportChatCard({ snap, mine, onClick }) {
  return (
    <button onClick={onClick} className="w-[248px] text-left rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
      <div className="passport-bg text-white p-3 relative">
        <div className="absolute inset-0 passport-pattern" />
        <div className="relative flex items-center gap-2"><Icon n="shield" s={15} /><span className="text-[10px] font-bold tracking-[.14em] uppercase">{T('Health Passport', 'Pasport Kesihatan')}</span></div>
        <div className="relative font-bold mt-1.5">{snap.name}</div>
        <div className="relative text-[11px] text-white/75 font-mono">{L(snap.type) || snap.typeShort}{snap.age ? ' · ' + snap.age : ''}</div>
      </div>
      <div className="grid grid-cols-2 gap-px bg-slate-100">
        {['hba1c', 'fbs', 'pp2', 'bp'].map((k) => { const s = MET[k].st(snap.vals[k]); return (
          <div key={k} className="bg-white p-2.5">
            <div className="text-[10px] text-ink-mute truncate">{L(MET[k].short || MET[k].n)}</div>
            <div className="flex items-center gap-1.5"><span className="font-extrabold text-[14px] tnum">{fmtMetric(k, snap.vals[k])}</span><span className="w-2 h-2 rounded-full" style={{ background: ST[s].dot }} /></div>
          </div>); })}
      </div>
      <div className="px-3 py-2 flex items-center justify-between text-[11.5px]">
        <span className="flex items-center gap-1.5 text-ink-soft">{T('Status', 'Status')}: <Badge s={snap.status} /></span>
        <span className="font-bold text-brand-700 flex items-center">{mine ? T('Shared', 'Dikongsi') : T('Open', 'Buka')}<Icon n="right" s={14} /></span>
      </div>
    </button>
  );
}

function MealChatCard({ snap, onClick }) {
  return (
    <button onClick={onClick} className="w-[248px] text-left rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
      <div className="relative h-28"><FoodPhoto items={snap.items} photo={snap.photo} seed={snap.mealId} className="w-full h-full" /><div className="absolute top-2 right-2"><Badge s={snap.status} /></div></div>
      <div className="p-3">
        <div className="text-[10px] font-bold uppercase tracking-wide text-brand-700">{T('Meal log', 'Catatan makan')} · {L(MT[snap.mt].n)}</div>
        <div className="font-bold text-[13.5px] leading-tight mt-0.5 truncate">{mealTitle(snap.items)}</div>
        <div className="flex gap-3 mt-1.5 text-[11.5px] text-ink-soft tnum">
          <span><b className="text-ink">{Math.round(snap.n.carbs)}</b> g {T('carbs', 'karbo')}</span><span><b className="text-ink">{Math.round(snap.n.sugar)}</b> g {T('sugar', 'gula')}</span><span>GL <b className="text-ink">{Math.round(snap.n.gl)}</b></span>
        </div>
      </div>
    </button>
  );
}

function ChatScreen({ pid, did, auto }) {
  const { S, mutate, nav, role, sendMessage } = useApp();
  const key = pid + '|' + did;
  const msgs = S.chats[key] || [];
  const typing = S.typing[key];
  const isDoc = role === 'doctor';
  const pt = S.patients[pid]; const doc = DOC[did];
  const other = isDoc ? 'patient' : 'doctor';
  const me = isDoc ? 'doctor' : 'patient';
  const [text, setText] = useState('');
  const [attach, setAttach] = useState(false);
  const [mealPick, setMealPick] = useState(false);
  const [info, setInfo] = useState(false);
  const endRef = useRef(); const fileRef = useRef(); const autoDone = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs.length, typing]);
  useEffect(() => {
    if (msgs.some((m) => m.from === other && !m.read)) mutate((d) => { (d.chats[key] || []).forEach((m) => { if (m.from === other) m.read = true; }); });
  }, [msgs.length]);
  const sendPassport = () => sendMessage(key, { type: 'passport', snap: passportSnap(S.patients[pid]) }, me);
  useEffect(() => { if (auto === 'passport' && !autoDone.current) { autoDone.current = true; setTimeout(sendPassport, 450); } }, []);

  const send = (t) => { const v = (t ?? text).trim(); if (!v) return; sendMessage(key, { type: 'text', text: v }, me); setText(''); };
  const sendMeal = (m) => { const n = nutri(m.items); sendMessage(key, { type: 'meal', snap: { mealId: m.id, pid, items: m.items, photo: m.photo, mt: m.mt, t: m.t, n, status: mealStatus(n) } }, me); };

  useTick(1000, !isDoc);
  const active = isDoc || sessionActive(S, did);
  const title = isDoc ? pt.name : doc.name;
  const sub = typing && !isDoc ? T('typing…', 'sedang menaip…') : isDoc ? `${L(pt.type)} · ${pt.age} ${T('yrs', 'thn')}` : { online: T('Online', 'Dalam talian'), busy: T('Busy', 'Sibuk'), offline: T('Offline', 'Luar talian') }[doc.status];

  let lastDay = null;
  return (
    <div className="h-full flex flex-col bg-[#eef2ef]">
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 z-20">
        <div className="h-16 px-2 flex items-center gap-2">
          <button onClick={nav.back} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5" aria-label="Back"><Icon n="left" s={22} /></button>
          <div className="relative">{isDoc ? <Avatar name={pt.name} hue={pt.hue} size={40} /> : <><Avatar name={doc.name} hue={doc.hue} size={40} /><StatusDot status={doc.status} /></>}</div>
          <div className="flex-1 min-w-0"><div className="font-bold text-[15px] truncate">{title}</div><div className={`text-xs truncate ${typing && !isDoc ? 'text-brand-600 font-semibold' : 'text-ink-mute'}`}>{sub}</div></div>
          <button onClick={() => (isDoc ? nav.push('patient', { pid }) : setInfo(true))} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5" aria-label="Info"><Icon n="info" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3">
        <div className="mx-auto mb-3 max-w-[290px] text-center text-[11px] text-ink-mute bg-white/70 rounded-xl px-3 py-2 flex items-start gap-1.5"><Icon n="lock" s={13} className="mt-0.5" />{T('Messages are end-to-end encrypted. For emergencies call 999.', 'Mesej disulitkan hujung ke hujung. Untuk kecemasan hubungi 999.')}</div>
        {!msgs.length && <EmptyState icon="chat" title={fill(T('Start chatting with {n}', 'Mula bersembang dengan {n}'), { n: title })} text={T('Ask a question, or share your passport and meal logs.', 'Tanya soalan, atau kongsi pasport dan catatan makan anda.')} />}
        {msgs.map((m) => {
          const mine = m.from === me; const day = startOfDay(m.t); const showDay = day !== lastDay; lastDay = day;
          return (
            <React.Fragment key={m.id}>
              {showDay && <div className="text-center my-3"><span className="text-[11px] font-semibold text-ink-mute bg-white/80 rounded-full px-3 py-1">{relDay(m.t)}</span></div>}
              <div className={`flex mb-2 anim-fade ${mine ? 'justify-end' : 'justify-start'}`}>
                {m.type === 'text' && (
                  <div className={`max-w-[78%] px-3.5 py-2 rounded-[18px] text-[14px] leading-snug shadow-sm ${mine ? 'bg-brand-600 text-white rounded-br-md' : 'bg-white rounded-bl-md'}`}>
                    {L(m.text)}
                    <div className={`text-[10px] mt-0.5 text-right flex items-center justify-end gap-1 ${mine ? 'text-white/70' : 'text-ink-mute'}`}>{fmtTime(m.t)}{mine && <span>{m.read ? '✓✓' : '✓'}</span>}</div>
                  </div>
                )}
                {m.type === 'image' && (
                  <div className={`p-1 rounded-[18px] shadow-sm ${mine ? 'bg-brand-600' : 'bg-white'}`}>
                    <img src={m.url} className="w-52 h-52 object-cover rounded-[14px]" alt="" />
                    <div className={`text-[10px] px-2 py-0.5 text-right ${mine ? 'text-white/70' : 'text-ink-mute'}`}>{fmtTime(m.t)}</div>
                  </div>
                )}
                {m.type === 'passport' && (
                  <div>
                    <PassportChatCard snap={m.snap} mine={mine} onClick={() => (isDoc ? nav.push('patient', { pid: m.snap.pid, tab: 'passport' }) : nav.goTab('passport'))} />
                    <div className={`text-[10px] text-ink-mute mt-0.5 ${mine ? 'text-right' : ''}`}>{fmtTime(m.t)}</div>
                  </div>
                )}
                {m.type === 'meal' && (
                  <div>
                    <MealChatCard snap={m.snap} onClick={() => nav.push('meal', { pid: m.snap.pid, mealId: m.snap.mealId, readOnly: isDoc })} />
                    <div className={`text-[10px] text-ink-mute mt-0.5 ${mine ? 'text-right' : ''}`}>{fmtTime(m.t)}</div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
        {typing && !isDoc && (
          <div className="flex mb-2 anim-fade"><div className="bg-white rounded-[18px] rounded-bl-md px-4 py-3 shadow-sm flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-ink-mute tdot" style={{ animationDelay: i * 0.15 + 's' }} />)}</div></div>
        )}
        <div ref={endRef} />
      </div>

      {isDoc && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pt-2 bg-white/90">
          {QUICK_REPLIES.map((q, i) => <button key={i} onClick={() => send(L(q))} className="shrink-0 h-9 px-3 rounded-full bg-brand-50 text-brand-800 text-[12.5px] font-semibold border border-brand-100">{L(q)}</button>)}
        </div>
      )}
      {!isDoc && active && (
        <div className="bg-good-bg text-good-fg text-[12px] font-semibold px-4 py-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><Icon n="clock" s={13} />{T('Consultation active', 'Konsultasi aktif')}</span>
          <span>{T('Ends in', 'Tamat dalam')} <SessionLeft until={S.sessions[did].until} className="font-extrabold" /></span>
        </div>
      )}
      {!active ? (
        <div className="bg-white border-t border-slate-100 px-4 py-3 safe-b">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[13px] font-bold">{S.sessions[did] ? T('Consultation ended', 'Konsultasi tamat') : T('Start a 30-min consultation', 'Mulakan konsultasi 30 minit')}</div>
              <PriceTag d={doc} />
            </div>
            <Btn size="md" icon="chat" onClick={() => nav.push('checkout', { did })}>{S.sessions[did] ? T('Consult again', 'Konsultasi lagi') : T('Chat now', 'Chat sekarang')}</Btn>
          </div>
        </div>
      ) : (
      <div className="bg-white/90 backdrop-blur-md px-3 py-2.5 safe-b flex items-end gap-2">
        <button onClick={() => setAttach(true)} className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-ink-soft shrink-0" aria-label="Attach"><Icon n="plus" /></button>
        <textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={T('Type a message…', 'Taip mesej…')} className="flex-1 resize-none max-h-28 min-h-[44px] rounded-[22px] bg-slate-100 px-4 py-3 text-[14px] outline-none focus:ring-2 ring-brand-300" />
        <button onClick={() => send()} disabled={!text.trim()} className="w-11 h-11 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 disabled:bg-slate-300" aria-label="Send"><Icon n="send" s={18} /></button>
      </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) sendMessage(key, { type: 'image', url: URL.createObjectURL(f) }, me); e.target.value = ''; }} />
      <Sheet open={attach} onClose={() => setAttach(false)} title={T('Attach', 'Lampirkan')}>
        <div className="grid grid-cols-3 gap-3 pb-2">
          {[
            !isDoc && { i: 'passport', c: 'bg-brand-50 text-brand-700', l: T('Send Passport', 'Hantar Pasport'), go: () => sendPassport() },
            !isDoc && { i: 'utensils', c: 'bg-amber-50 text-amber-700', l: T('Send meal log', 'Hantar catatan makan'), go: () => setTimeout(() => setMealPick(true), 280) },
            { i: 'image', c: 'bg-indigo-50 text-indigo-600', l: T('Photo', 'Gambar'), go: () => fileRef.current.click() },
            isDoc && { i: 'note', c: 'bg-brand-50 text-brand-700', l: T("Patient's passport", 'Pasport pesakit'), go: () => nav.push('patient', { pid, tab: 'passport' }) },
            isDoc && { i: 'utensils', c: 'bg-amber-50 text-amber-700', l: T('Diary', 'Diari'), go: () => nav.push('patient', { pid, tab: 'diary' }) },
          ].filter(Boolean).map((o, i) => (
            <button key={i} onClick={() => { setAttach(false); o.go(); }} className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-slate-50">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${o.c}`}><Icon n={o.i} s={24} /></div>
              <span className="text-[12px] font-semibold text-center leading-tight">{o.l}</span>
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet open={mealPick} onClose={() => setMealPick(false)} title={T('Choose a meal to send', 'Pilih makanan untuk dihantar')}>
        {[...pt.meals].sort((a, b) => b.t - a.t).slice(0, 8).map((m) => <MealRow key={m.id} meal={m} showDay onClick={() => { setMealPick(false); sendMeal(m); }} />)}
      </Sheet>
      {!isDoc && (
        <Sheet open={info} onClose={() => setInfo(false)}>
          <div className="text-center pt-1">
            <div className="relative inline-block"><Avatar name={doc.name} hue={doc.hue} size={84} /><StatusDot status={doc.status} /></div>
            <div className="font-bold text-lg mt-3">{doc.name}</div>
            <div className="text-sm text-brand-700 font-semibold">{L(SPEC[doc.spec])}</div>
            <div className="text-xs text-ink-mute">{doc.hospital}</div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[[doc.rating + '★', T('Rating', 'Penilaian')], [doc.exp + ' ' + T('yrs', 'thn'), T('Experience', 'Pengalaman')], [doc.points ? doc.points + ' ' + T('pts', 'mata') : 'RM' + doc.price, T('Per session', 'Setiap sesi')]].map(([a, b], i) => (
                <div key={i} className="bg-paper rounded-2xl py-3"><div className="font-extrabold">{a}</div><div className="text-[11px] text-ink-mute">{b}</div></div>
              ))}
            </div>
            <Btn className="w-full mt-4" icon="passport" onClick={() => { setInfo(false); sendPassport(); }}>{T('Share my passport', 'Kongsi pasport saya')}</Btn>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// Simulated doctor reply (bilingual) based on what the patient sent.
let replyIdx = 0;
function autoReply(m, did, d) {
  const isDiet = DOC[did].spec === 'diet';
  if (m.type === 'passport') {
    const v = m.snap.vals;
    return { en: `Thank you for sharing your passport. HbA1c ${v.hba1c}% and fasting glucose ${v.fbs} mmol/L — ${v.hba1c < 7 ? 'excellent control, keep it up!' : "you're improving. Let's aim for HbA1c below 7%."} I'll add notes to your record.`, ms: `Terima kasih kerana berkongsi pasport. HbA1c ${v.hba1c}% dan gula puasa ${v.fbs} mmol/L — ${v.hba1c < 7 ? 'kawalan yang sangat baik, teruskan!' : 'anda semakin baik. Mari sasarkan HbA1c bawah 7%.'} Saya akan tambah nota ke rekod anda.` };
  }
  if (m.type === 'meal') {
    const s = m.snap.status; const hasSweet = m.snap.items.some((i) => FOOD[i.id].sugar >= 14);
    if (s === 'good') return { en: 'This looks like a well-balanced meal 👍 Good portion of protein and fibre.', ms: 'Hidangan ini nampak seimbang 👍 Protein dan serat yang baik.' };
    if (hasSweet) return { en: `I can see ${Math.round(m.snap.n.sugar)} g of sugar here, mostly from the drink. Try teh O kosong or plain water instead — it makes a big difference.`, ms: `Saya nampak ${Math.round(m.snap.n.sugar)} g gula di sini, kebanyakannya dari minuman. Cuba teh O kosong atau air kosong — ia memberi perbezaan besar.` };
    return { en: 'Quite high in carbs. Next time try half the rice and fill half your plate with vegetables (the "Suku-Suku Separuh" plate).', ms: 'Agak tinggi karbohidrat. Lain kali cuba separuh nasi dan isi separuh pinggan dengan sayur (pinggan "Suku-Suku Separuh").' };
  }
  if (m.type === 'image') return { en: "Thanks, I've received the photo. I'll take a look and get back to you.", ms: 'Terima kasih, saya sudah terima gambar. Saya akan semak dan maklumkan semula.' };
  const generic = isDiet ? [
    { en: 'Great question! Aim for the "Suku-Suku Separuh" plate: ¼ carbs, ¼ protein, ½ vegetables.', ms: 'Soalan yang bagus! Sasarkan pinggan "Suku-Suku Separuh": ¼ karbohidrat, ¼ protein, ½ sayur.' },
    { en: 'For snacks, choose fruit like apple or guava instead of kuih.', ms: 'Untuk snek, pilih buah seperti epal atau jambu batu berbanding kuih.' },
  ] : [
    { en: 'Noted. How have your fasting readings been this week?', ms: 'Baik. Bagaimana bacaan gula puasa anda minggu ini?' },
    { en: 'Please continue Metformin as prescribed and keep logging your meals — it really helps me advise you.', ms: 'Sila teruskan Metformin seperti ditetapkan dan terus catat makanan — ia sangat membantu saya memberi nasihat.' },
    { en: 'If you feel dizzy, sweaty or very thirsty, check your glucose and let me know right away.', ms: 'Jika anda rasa pening, berpeluh atau sangat dahaga, periksa gula anda dan maklumkan segera.' },
  ];
  return generic[replyIdx++ % generic.length];
}

/* ============ DOCTOR SIDE ============ */
function patientRisk(S, pid) {
  const pt = S.patients[pid];
  if (pid !== 'p1') return { level: pt.risk, flag: pt.flag };
  const week = pt.meals.filter((m) => m.t > now() - 7 * DAY);
  const high = week.filter((m) => mealStatus(nutri(m.items)) === 'risk').length;
  return high >= 4
    ? { level: 'warn', flag: { en: `Frequent high-sugar meals (${high} this week)`, ms: `Kerap makan tinggi gula (${high} minggu ini)` } }
    : { level: 'good', flag: null };
}
const riskOrder = { risk: 0, warn: 1, good: 2 };

function DHome() {
  const { S, nav } = useApp();
  const doc = DOC[ME_DOC];
  const pids = Object.keys(S.patients);
  const risks = pids.map((id) => ({ id, ...patientRisk(S, id) })).filter((r) => r.level !== 'good').sort((a, b) => riskOrder[a.level] - riskOrder[b.level]);
  const waiting = pids.filter((id) => (S.chats[id + '|' + ME_DOC] || []).some((m) => m.from === 'patient' && !m.read)).length;
  const [appt, setAppt] = useState(null);
  return (
    <div className="pb-28">
      <div className="bg-gradient-to-b from-brand-100/70 to-paper px-5 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <Avatar name={doc.name} hue={doc.hue} size={46} />
          <div className="flex-1"><div className="text-[13px] text-ink-soft">{greeting()},</div><div className="font-extrabold text-lg leading-tight">{doc.name}</div></div>
          <button onClick={() => nav.goTab('chat')} className="relative w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center" aria-label="Messages"><Icon n="bell" s={19} />{waiting > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-risk-dot" />}</button>
        </div>
        <div className="text-xs text-ink-mute mt-3 flex items-center gap-1.5"><Icon n="calendar" s={13} />{fmtLongToday()}</div>
      </div>
      <div className="px-4 stagger">
        <div className="grid grid-cols-3 gap-2.5 mt-2">
          {[
            { v: pids.length, l: T('Active patients', 'Pesakit aktif'), i: 'users', c: 'bg-brand-50 text-brand-700', go: () => nav.goTab('patients') },
            { v: waiting, l: T('Consults waiting', 'Konsultasi menunggu'), i: 'chat', c: 'bg-warn-bg text-warn-fg', go: () => nav.goTab('chat') },
            { v: risks.filter((r) => r.level === 'risk').length, l: T('High-risk patients', 'Pesakit berisiko tinggi'), i: 'alert', c: 'bg-risk-bg text-risk-fg', go: () => nav.goTab('patients', { filter: 'risk' }) },
          ].map((s, i) => (
            <Card key={i} className="p-3" onClick={s.go}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.c}`}><Icon n={s.i} s={18} /></div>
              <div className="text-[26px] font-extrabold mt-2 leading-none tnum">{s.v}</div>
              <div className="text-[11px] text-ink-mute mt-1 leading-tight">{s.l}</div>
            </Card>
          ))}
        </div>

        <SectionTitle action={T('All patients', 'Semua pesakit')} onAction={() => nav.goTab('patients')}>{T('Needs attention', 'Perlu perhatian')}</SectionTitle>
        <Card className="overflow-hidden">
          {risks.map((r, i) => { const pt = S.patients[r.id]; return (
            <button key={r.id} onClick={() => nav.push('patient', { pid: r.id })} className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i < risks.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <div className="w-1.5 self-stretch rounded-full" style={{ background: ST[r.level].dot }} />
              <Avatar name={pt.name} hue={pt.hue} size={42} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{pt.name} <span className="text-ink-mute font-normal text-xs">· {pt.age}, {pt.typeShort}</span></div>
                <div className={`text-xs font-medium flex items-center gap-1 ${ST[r.level].fg}`}><Icon n="alert" s={13} />{L(r.flag)}</div>
              </div>
              <Badge s={r.level}>{r.level === 'risk' ? T('High', 'Tinggi') : T('Medium', 'Sederhana')}</Badge>
            </button>); })}
          {!risks.length && <EmptyState icon="shield" title={T('All patients stable', 'Semua pesakit stabil')} />}
        </Card>

        <SectionTitle>{T("Today's consultations", 'Konsultasi hari ini')}</SectionTitle>
        <div className="space-y-2">
          {APPOINTMENTS.map((a) => { const pt = S.patients[a.pid]; return (
            <Card key={a.id} className="p-3 flex items-center gap-3" onClick={() => setAppt(a)}>
              <div className="w-14 text-center"><div className="font-extrabold tnum">{a.time}</div><div className="text-[10px] text-ink-mute uppercase font-semibold">{a.kind === 'video' ? T('Video', 'Video') : T('Chat', 'Sembang')}</div></div>
              <div className="w-px self-stretch bg-slate-100" />
              <Avatar name={pt.name} hue={pt.hue} size={38} />
              <div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{pt.name}</div><div className="text-xs text-ink-mute truncate">{L(a.reason)}</div></div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${a.kind === 'video' ? 'bg-indigo-50 text-indigo-600' : 'bg-brand-50 text-brand-700'}`}><Icon n={a.kind === 'video' ? 'video' : 'chat'} s={17} /></div>
            </Card>); })}
        </div>
      </div>
      <Sheet open={!!appt} onClose={() => setAppt(null)} title={T('Consultation', 'Konsultasi')}>
        {appt && (() => { const pt = S.patients[appt.pid]; return (
          <div>
            <div className="flex items-center gap-3"><Avatar name={pt.name} hue={pt.hue} size={52} /><div><div className="font-bold">{pt.name}</div><div className="text-sm text-ink-mute">{appt.time} · {L(appt.reason)}</div></div></div>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <Btn v="secondary" size="md" icon="passport" onClick={() => { setAppt(null); setTimeout(() => nav.push('patient', { pid: pt.id }), 250); }}>{T('Open record', 'Buka rekod')}</Btn>
              <Btn size="md" icon="chat" onClick={() => { setAppt(null); setTimeout(() => nav.push('chat', { pid: pt.id, did: ME_DOC }), 250); }}>{T('Start chat', 'Mula sembang')}</Btn>
            </div>
          </div>); })()}
      </Sheet>
    </div>
  );
}

function DPatients({ filter: initF }) {
  const { S, nav } = useApp();
  const [q, setQ] = useState('');
  const [f, setF] = useState(initF || 'all');
  const rows = Object.keys(S.patients).map((id) => ({ pt: S.patients[id], r: patientRisk(S, id) }))
    .filter(({ pt, r }) => pt.name.toLowerCase().includes(q.toLowerCase()) && (f === 'all' || (f === 'risk' ? r.level !== 'good' : r.level === 'good')))
    .sort((a, b) => riskOrder[a.r.level] - riskOrder[b.r.level]);
  return (
    <div className="pb-28">
      <Header back={false} title={T('Patients', 'Pesakit')} sub={fill(T('{n} under your care', '{n} di bawah jagaan anda'), { n: Object.keys(S.patients).length })} />
      <div className="px-4">
        <div className="relative">
          <Icon n="search" s={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T('Search patient name…', 'Cari nama pesakit…')} className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white shadow-soft outline-none focus:ring-2 ring-brand-300 text-sm" />
        </div>
        <Segmented className="mt-3" value={f} onChange={setF} options={[{ v: 'all', l: T('All', 'Semua') }, { v: 'risk', l: T('At risk', 'Berisiko') }, { v: 'stable', l: T('Stable', 'Stabil') }]} />
        <div className="space-y-2 mt-3 stagger" key={f + q}>
          {rows.map(({ pt, r }) => { const h = latest(pt.metrics.hba1c); const lastMeal = latest([...pt.meals].sort((a, b) => a.t - b.t)); return (
            <Card key={pt.id} className="p-3 flex items-center gap-3" onClick={() => nav.push('patient', { pid: pt.id })}>
              <Avatar name={pt.name} hue={pt.hue} size={46} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{pt.name}</div>
                <div className="text-xs text-ink-mute">{pt.age} {T('yrs', 'thn')} · {L(pt.type)}</div>
                <div className="text-[11px] text-ink-mute mt-0.5">{T('Last log', 'Catatan terakhir')}: {lastMeal ? relDay(lastMeal.t) : '—'}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-ink-mute">HbA1c</div>
                <div className="font-extrabold tnum">{h.v}%</div>
                <Badge s={r.level} className="mt-0.5">{r.level === 'good' ? T('Stable', 'Stabil') : r.level === 'risk' ? T('High', 'Tinggi') : T('Watch', 'Perhatian')}</Badge>
              </div>
            </Card>); })}
          {!rows.length && <EmptyState icon="users" title={T('No patients found', 'Tiada pesakit dijumpai')} text={T('Try another name or filter.', 'Cuba nama atau penapis lain.')} />}
        </div>
      </div>
    </div>
  );
}

function DPatient({ pid, tab: initTab }) {
  const { S, mutate, nav, toast } = useApp();
  const pt = S.patients[pid];
  const [tab, setTab] = useState(initTab || 'passport');
  const [metric, setMetric] = useState(null);
  const [note, setNote] = useState('');
  const r = patientRisk(S, pid);
  const notes = S.notes[pid] || [];

  // weekly diary summary
  const days = [...Array(7)].map((_, i) => startOfDay(atDay(i - 6)));
  const week = pt.meals.filter((m) => m.t >= days[0]);
  const perDay = days.map((d) => { const ms = week.filter((m) => startOfDay(m.t) === d); return { d, n: nutri(ms.flatMap((m) => m.items)), c: ms.length }; });
  const logged = perDay.filter((x) => x.c);
  const avgCarbs = logged.length ? logged.reduce((a, b) => a + b.n.carbs, 0) / logged.length : 0;
  const highPct = week.length ? Math.round((week.filter((m) => mealStatus(nutri(m.items)) === 'risk').length / week.length) * 100) : 0;

  const saveNote = () => {
    if (!note.trim()) return;
    mutate((d) => { (d.notes[pid] ||= []).unshift({ id: uid('n'), t: now(), doc: ME_DOC, text: note.trim() }); });
    setNote(''); toast(pid === 'p1' ? T("Saved — visible to patient as Doctor's Advice", 'Disimpan — dipaparkan kepada pesakit sebagai Anjuran Doktor') : T('Note saved', 'Nota disimpan'), 'note');
  };

  return (
    <div className="pb-10">
      <Header title={pt.name} sub={`${pt.age} ${T('yrs', 'thn')} · ${L(pt.type)}`} right={<button onClick={() => nav.push('chat', { pid, did: ME_DOC })} className="w-11 h-11 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mr-1" aria-label="Chat"><Icon n="chat" s={19} /></button>} />
      <div className="px-4">
        {r.flag && <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 mb-3 text-[13px] font-semibold ${ST[r.level].bg} ${ST[r.level].fg}`}><Icon n="alert" s={16} />{L(r.flag)}</div>}
        <Segmented value={tab} onChange={setTab} options={[{ v: 'passport', l: T('Passport', 'Pasport') }, { v: 'diary', l: T('Diary', 'Diari') }, { v: 'notes', l: T("Doctor's notes", 'Nota doktor') }]} />

        {tab === 'passport' && (
          <div className="mt-3 stagger" key="p">
            <PassportCard pt={pt} />
            <PassportContent pt={pt} />
            <SectionTitle>{T('Trends', 'Trend')}</SectionTitle>
            {['hba1c', 'fbs', 'pp2'].map((k) => { const h = pt.metrics[k]; const s = MET[k].st(latest(h).v); return (
              <Card key={k} className="p-4 mb-2.5">
                <div className="flex justify-between items-center"><div className="font-bold text-sm">{L(MET[k].n)} <span className="text-ink-mute font-medium text-xs">({MET[k].unit})</span></div><Badge s={s} /></div>
                <LineChart points={h} color={ST[s].dot} h={140} fmt={(v) => num(v, MET[k].d)} band={MET[k].band} />
              </Card>); })}
          </div>
        )}

        {tab === 'diary' && (
          <div className="mt-3 stagger" key="d">
            <div className="grid grid-cols-2 gap-2.5">
              <Card className="p-3.5"><div className="text-[11px] text-ink-mute">{T('Avg. carbs / day', 'Purata karbo / hari')}</div><div className="text-2xl font-extrabold tnum">{Math.round(avgCarbs)} <span className="text-sm text-ink-mute">g</span></div><div className="text-[11px] text-ink-mute">{T('Target', 'Sasaran')} {pt.targets.carbs} g</div></Card>
              <Card className="p-3.5"><div className="text-[11px] text-ink-mute">{T('High-sugar meals', 'Makanan tinggi gula')}</div><div className={`text-2xl font-extrabold tnum ${highPct > 40 ? 'text-risk-fg' : highPct > 20 ? 'text-warn-fg' : 'text-good-fg'}`}>{highPct}%</div><div className="text-[11px] text-ink-mute">{week.length} {T('meals this week', 'hidangan minggu ini')}</div></Card>
            </div>
            <Card className="p-4 mt-2.5">
              <div className="font-bold text-sm mb-3">{T('Daily carbs — last 7 days', 'Karbohidrat harian — 7 hari lepas')}</div>
              <BarChart target={pt.targets.carbs} data={perDay.map((x) => ({ v: x.n.carbs, l: new Date(x.d).toLocaleDateString(locale(), { weekday: 'narrow' }), c: x.n.carbs > pt.targets.carbs ? '#ec7461' : x.n.carbs > pt.targets.carbs * 0.85 ? '#f0a92e' : '#36bfa5' }))} />
            </Card>
            <SectionTitle>{T("Patient's diary", 'Diari pesakit')}</SectionTitle>
            <DiaryBrowser pid={pid} readOnly />
          </div>
        )}

        {tab === 'notes' && (
          <div className="mt-3 stagger" key="n">
            <Card className="p-4">
              <div className="font-bold text-sm mb-2">{T('New recommendation', 'Cadangan baharu')}</div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder={T('Write a note or recommendation for the patient…', 'Tulis nota atau cadangan untuk pesakit…')} className="w-full rounded-2xl bg-slate-100 px-3.5 py-3 text-sm outline-none focus:ring-2 ring-brand-300 resize-none" />
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mt-2">
                {QUICK_REPLIES.map((q, i) => <button key={i} onClick={() => setNote((n) => (n ? n + ' ' : '') + L(q))} className="shrink-0 h-8 px-3 rounded-full bg-brand-50 text-brand-800 text-[12px] font-semibold">+ {L(q)}</button>)}
              </div>
              <Btn className="w-full mt-3" size="md" icon="check" disabled={!note.trim()} onClick={saveNote}>{T('Save & share with patient', 'Simpan & kongsi dengan pesakit')}</Btn>
            </Card>
            <SectionTitle>{T('Previous notes', 'Nota terdahulu')}</SectionTitle>
            {notes.length ? notes.map((n) => (
              <Card key={n.id} className="p-4 mb-2.5 border-l-4 border-brand-400">
                <div className="flex justify-between text-[11px] text-ink-mute mb-1"><span className="font-semibold text-brand-700">{DOC[n.doc].name}</span><span>{relDay(n.t)}, {fmtTime(n.t)}</span></div>
                <div className="text-[13.5px] leading-snug">{L(n.text)}</div>
                <div className="text-[11px] text-good-fg font-semibold mt-2 flex items-center gap-1"><Icon n="eye" s={12} />{T('Visible to patient', 'Dilihat oleh pesakit')}</div>
              </Card>
            )) : <EmptyState icon="note" title={T('No notes yet', 'Belum ada nota')} text={T('Notes you save appear here and on the patient\'s home screen.', 'Nota yang disimpan dipaparkan di sini dan di skrin utama pesakit.')} />}
          </div>
        )}
      </div>
      <MetricSheet pt={pt} id={metric} onClose={() => setMetric(null)} />
    </div>
  );
}

function DChats() {
  const { S, nav } = useApp();
  const [q, setQ] = useState('');
  const convos = Object.keys(S.chats).filter((k) => k.endsWith('|' + ME_DOC) && S.chats[k].length)
    .map((k) => { const pid = k.split('|')[0]; const msgs = S.chats[k]; return { pid, pt: S.patients[pid], last: latest(msgs), unread: msgs.filter((m) => m.from === 'patient' && !m.read).length }; })
    .filter((c) => c.pt.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.last.t - a.last.t);
  return (
    <div className="pb-28">
      <Header back={false} title={T('Chats', 'Sembang')} sub={fill(T('{n} unread', '{n} belum dibaca'), { n: convos.reduce((a, c) => a + c.unread, 0) })} />
      <div className="px-4">
        <div className="relative mb-3">
          <Icon n="search" s={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T('Search conversations…', 'Cari perbualan…')} className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white shadow-soft outline-none focus:ring-2 ring-brand-300 text-sm" />
        </div>
        <Card className="overflow-hidden stagger">
          {convos.map((c, i) => (
            <button key={c.pid} onClick={() => nav.push('chat', { pid: c.pid, did: ME_DOC })} className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i < convos.length - 1 ? 'border-b border-slate-100' : ''} ${c.unread ? 'bg-brand-50/40' : ''}`}>
              <Avatar name={c.pt.name} hue={c.pt.hue} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between"><span className={`text-sm truncate ${c.unread ? 'font-bold' : 'font-semibold'}`}>{c.pt.name}</span><span className={`text-[11px] shrink-0 ml-2 ${c.unread ? 'text-brand-700 font-bold' : 'text-ink-mute'}`}>{isToday(c.last.t) ? fmtTime(c.last.t) : relDay(c.last.t)}</span></div>
                <div className="flex justify-between items-center gap-2"><span className={`text-xs truncate ${c.unread ? 'text-ink font-semibold' : 'text-ink-mute'}`}>{c.last.from === 'doctor' ? T('You: ', 'Anda: ') : ''}{msgPreview(c.last)}</span>{c.unread > 0 && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center">{c.unread}</span>}</div>
              </div>
            </button>
          ))}
          {!convos.length && <EmptyState icon="chat" title={T('No conversations', 'Tiada perbualan')} text={T('Patient messages will appear here.', 'Mesej pesakit akan dipaparkan di sini.')} />}
        </Card>
      </div>
    </div>
  );
}

function DProfile() {
  const { S, mutate, toast, setLang, logout } = useApp();
  const doc = DOC[ME_DOC];
  const av = S.docAvail;
  const daysL = CUR_LANG === 'ms' ? ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Ahd'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="pb-28">
      <div className="passport-bg text-white px-5 pt-6 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 passport-pattern" />
        <div className="relative flex items-center gap-4">
          <Avatar name={doc.name} hue={doc.hue} size={68} ring />
          <div><div className="font-extrabold text-xl">{doc.name}</div><div className="text-sm text-white/80">{L(SPEC[doc.spec])}</div><div className="text-xs text-white/70">{doc.hospital}</div></div>
        </div>
      </div>
      <div className="px-4 -mt-10 relative stagger">
        <Card className="p-4 grid grid-cols-3 text-center divide-x divide-slate-100">
          {[[Object.keys(S.patients).length, T('Patients', 'Pesakit')], [doc.rating + '★', T('Rating', 'Penilaian')], [doc.exp, T('Years', 'Tahun')]].map(([a, b], i) => <div key={i}><div className="text-xl font-extrabold">{a}</div><div className="text-[11px] text-ink-mute">{b}</div></div>)}
        </Card>
        <SectionTitle>{T('Professional info', 'Maklumat profesional')}</SectionTitle>
        <Card className="overflow-hidden">
          {[[T('MMC registration no.', 'No. pendaftaran MMC'), '48213'], [T('APC year', 'Tahun APC'), '2026'], [T('Specialty', 'Kepakaran'), L(SPEC[doc.spec])], [T('Sub-specialty', 'Subkepakaran'), T('Diabetes & Metabolism', 'Diabetes & Metabolisme')], [T('Practice', 'Tempat amalan'), doc.hospital]].map(([k, v], i, a) => (
            <div key={i} className={`flex justify-between gap-4 px-4 py-3 text-sm ${i < a.length - 1 ? 'border-b border-slate-100' : ''}`}><span className="text-ink-soft">{k}</span><span className="font-semibold text-right">{v}</span></div>
          ))}
        </Card>
        <SectionTitle>{T('Availability', 'Ketersediaan')}</SectionTitle>
        <Card className="overflow-hidden">
          <ListRow icon="chat" title={T('Accepting chat consultations', 'Terima konsultasi sembang')} sub={av.online ? T('Patients see you as Online', 'Pesakit melihat anda Dalam talian') : T('Shown as Offline', 'Dipaparkan Luar talian')}
            right={<Toggle on={av.online} onChange={(v) => { mutate((d) => { d.docAvail.online = v; }); toast(v ? T('You are now online', 'Anda kini dalam talian') : T('You are now offline', 'Anda kini luar talian'), 'bell'); }} />} />
          <ListRow icon="video" title={T('Video consultations', 'Konsultasi video')} sub="09:00 – 17:00" last right={<Toggle on={av.video} onChange={(v) => mutate((d) => { d.docAvail.video = v; })} />} />
        </Card>
        <div className="text-[13px] font-semibold text-ink-soft mt-4 mb-2 px-0.5">{T('Clinic days', 'Hari klinik')}</div>
        <div className="grid grid-cols-7 gap-1.5">
          {daysL.map((d, i) => (
            <button key={i} onClick={() => mutate((s) => { s.docAvail.days[i] = !s.docAvail.days[i]; })} className={`h-14 rounded-2xl text-[12px] font-bold flex flex-col items-center justify-center gap-0.5 ${av.days[i] ? 'bg-brand-600 text-white' : 'bg-white text-ink-mute shadow-soft'}`}>
              {d}<span className={`w-1.5 h-1.5 rounded-full ${av.days[i] ? 'bg-white' : 'bg-slate-200'}`} />
            </button>
          ))}
        </div>
        <SectionTitle>{T('Language', 'Bahasa')}</SectionTitle>
        <Segmented value={CUR_LANG} onChange={setLang} options={[{ v: 'en', l: 'English' }, { v: 'ms', l: 'Bahasa Melayu' }]} />
        <Card className="overflow-hidden mt-5">
          <ListRow icon="logout" iconBg="bg-risk-bg text-risk-fg" title={<span className="text-risk-fg">{T('Log out', 'Log keluar')}</span>} onClick={logout} last right={<span />} />
        </Card>
      </div>
    </div>
  );
}
