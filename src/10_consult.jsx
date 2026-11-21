/* ============ KONSULTASI (Halodoc-style: price → checkout → timed chat) ============ */
const sessionActive = (S, did) => (S.sessions[did]?.until || 0) > now();

function useTick(ms = 1000, on = true) {
  const [, setT] = useState(0);
  useEffect(() => { if (!on) return; const i = setInterval(() => setT((x) => x + 1), ms); return () => clearInterval(i); }, [ms, on]);
}
function SessionLeft({ until, className = '' }) {
  useTick(1000);
  const left = Math.max(0, until - now()); const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  return <span className={`tnum ${className}`}>{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</span>;
}

function PriceTag({ d, big }) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5">
        <span className={`${big ? 'text-xl' : 'text-[15px]'} font-extrabold`}>RM{d.price}</span>
        <span className="text-[11.5px] text-ink-mute line-through">RM{d.orig}</span>
        <span className="text-[10px] font-bold text-risk-fg bg-risk-bg rounded px-1">-{Math.round((1 - d.price / d.orig) * 100)}%</span>
      </div>
      {d.points && <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mt-0.5"><Icon n="star" s={11} fill="currentColor" sw={1} />{fill(T('or free with {n} pts', 'atau percuma dengan {n} mata'), { n: d.points })}</div>}
    </div>
  );
}

function DocChips({ d }) {
  return (
    <div className="flex gap-1.5 mt-1.5 flex-wrap">
      <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-slate-100 text-[11px] font-semibold text-ink-soft"><Icon n="briefcase" s={12} />{d.exp} {T('yrs', 'thn')}</span>
      <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-slate-100 text-[11px] font-semibold text-ink-soft"><Icon n="thumb" s={12} />{d.sat}%</span>
    </div>
  );
}

function PConsult() {
  const { S, nav } = useApp();
  const [f, setF] = useState('all');
  const [share, setShare] = useState(false);
  const [q, setQ] = useState('');
  const convos = DOCTORS.map((d) => ({ d, msgs: S.chats['p1|' + d.id] || [] })).filter((c) => c.msgs.length).sort((a, b) => latest(b.msgs).t - latest(a.msgs).t);
  const list = DOCTORS.filter((d) => (f === 'all' || d.spec === f) && (d.name + L(SPEC[d.spec])).toLowerCase().includes(q.toLowerCase()));
  const start = (d) => (sessionActive(S, d.id) ? nav.push('chat', { pid: 'p1', did: d.id }) : nav.push('checkout', { did: d.id }));
  const cats = [['all', 'users', T('All', 'Semua')], ['endo', 'activity', L(SPEC.endo)], ['gp', 'steth', L(SPEC.gp)], ['diet', 'leaf', L(SPEC.diet)]];
  return (
    <div className="pb-28">
      <Header back={false} title={T('Consult a doctor', 'Konsultasi doktor')} sub={T('Chat with diabetes specialists in minutes', 'Sembang dengan pakar diabetes dalam beberapa minit')} />
      <div className="px-4 stagger">
        <div className="relative">
          <Icon n="search" s={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={T('Search doctor or specialty…', 'Cari doktor atau kepakaran…')} className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white shadow-soft outline-none focus:ring-2 ring-brand-300 text-sm" />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {cats.map(([v, i, l]) => (
            <button key={v} onClick={() => setF(v)} className="flex flex-col items-center gap-1.5">
              <span className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${f === v ? 'bg-brand-600 text-white shadow-[0_8px_18px_-8px_rgba(11,138,118,.8)]' : 'bg-white text-brand-700 shadow-soft'}`}><Icon n={i} s={22} /></span>
              <span className={`text-[11px] font-semibold text-center leading-tight ${f === v ? 'text-brand-800' : 'text-ink-soft'}`}>{l}</span>
            </button>
          ))}
        </div>

        <FreeConsultBanner />

        <div className="mt-4 rounded-[20px] p-4 bg-gradient-to-r from-amber-100 to-amber-50 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-6 text-[70px] opacity-30">🩺</div>
          <div className="flex-1 relative">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">{T('Promo', 'Promosi')}</div>
            <div className="font-bold text-[14px] leading-snug">{T('Up to 30% off specialist chats this week', 'Diskaun sehingga 30% sembang pakar minggu ini')}</div>
            <div className="text-[11.5px] text-ink-soft">{T('Prices below already include the discount', 'Harga di bawah sudah termasuk diskaun')}</div>
          </div>
        </div>

        {convos.length > 0 && <>
          <SectionTitle>{T('My consultations', 'Konsultasi saya')}</SectionTitle>
          <Card className="overflow-hidden">
            {convos.map(({ d, msgs }, i) => { const last = latest(msgs); const unread = msgs.filter((m) => m.from === 'doctor' && !m.read).length; const act = sessionActive(S, d.id); return (
              <button key={d.id} onClick={() => nav.push('chat', { pid: 'p1', did: d.id })} className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i < convos.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="relative"><Avatar name={d.name} hue={d.hue} size={46} /><StatusDot status={d.status} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between"><span className="font-semibold text-sm truncate">{d.name}</span>{act ? <span className="text-[10.5px] font-bold text-good-fg bg-good-bg rounded-full px-2 py-0.5 shrink-0 ml-2">{T('Active', 'Aktif')} · <SessionLeft until={S.sessions[d.id].until} /></span> : <span className="text-[11px] text-ink-mute shrink-0 ml-2">{isToday(last.t) ? fmtTime(last.t) : relDay(last.t)}</span>}</div>
                  <div className="flex justify-between items-center"><span className={`text-xs truncate ${unread ? 'text-ink font-semibold' : 'text-ink-mute'}`}>{msgPreview(last)}</span>{unread > 0 && <span className="ml-2 min-w-[20px] h-5 px-1.5 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center">{unread}</span>}</div>
                </div>
              </button>); })}
          </Card>
        </>}

        <SectionTitle>{T('Available doctors', 'Doktor tersedia')}</SectionTitle>
        <div className="space-y-2.5">
          {list.map((d) => (
            <Card key={d.id} className="p-3.5" onClick={() => nav.push('doctor', { did: d.id })}>
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  <div className="w-[76px] h-[90px] rounded-2xl overflow-hidden flex items-end justify-center" style={{ background: `linear-gradient(160deg,hsl(${d.hue} 50% 88%),hsl(${d.hue} 45% 74%))` }}><Avatar name={d.name} hue={d.hue} size={64} className="mb-[-6px]" /></div>
                  <span className={`absolute -top-1.5 -left-1.5 text-[9.5px] font-bold rounded-full px-1.5 py-0.5 border-2 border-white ${d.status === 'online' ? 'bg-good-dot text-white' : d.status === 'busy' ? 'bg-warn-dot text-white' : 'bg-slate-300 text-ink-soft'}`}>{{ online: T('Online', 'Online'), busy: T('Busy', 'Sibuk'), offline: T('Offline', 'Offline') }[d.status]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] leading-tight truncate">{d.name}</div>
                  <div className="text-[12px] text-ink-soft">{L(SPEC[d.spec])}</div>
                  <DocChips d={d} />
                  <div className="flex items-end justify-between mt-2 gap-2">
                    <PriceTag d={d} />
                    <span role="button" onClick={(e) => { e.stopPropagation(); start(d); }} className={`shrink-0 h-9 px-4 rounded-xl text-[13px] font-bold flex items-center ${d.status === 'offline' ? 'bg-slate-100 text-ink-soft' : 'bg-brand-600 text-white'}`}>{sessionActive(S, d.id) ? T('Open', 'Buka') : T('Chat', 'Chat')}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {!list.length && <EmptyState icon="search" title={T('No doctors found', 'Tiada doktor dijumpai')} text={T('Try a different filter or name.', 'Cuba penapis atau nama lain.')} />}
        </div>

        <Card className="p-4 mt-4 bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center gap-3" onClick={() => setShare(true)}>
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center"><Icon n="passport" /></div>
          <div className="flex-1"><div className="font-bold text-sm">{T('Share your Health Passport', 'Kongsi Pasport Kesihatan anda')}</div><div className="text-xs text-white/75">{T('Doctors give better advice with your latest results', 'Doktor beri nasihat lebih tepat dengan keputusan terkini')}</div></div>
          <Icon n="right" />
        </Card>
      </div>
      <DoctorPicker open={share} onClose={() => setShare(false)} onPick={(did) => { setShare(false); setTimeout(() => nav.push('chat', { pid: 'p1', did, auto: 'passport' }), 250); }} />
    </div>
  );
}

function PDoctor({ did }) {
  const { S, nav } = useApp();
  const d = DOC[did]; const act = sessionActive(S, did);
  return (
    <div className="min-h-full flex flex-col">
      <div className="relative pb-6" style={{ background: `linear-gradient(170deg,hsl(${d.hue} 50% 90%),#f6f7f3)` }}>
        <Header title="" transparent />
        <div className="flex flex-col items-center text-center px-6 -mt-4">
          <div className="relative"><Avatar name={d.name} hue={d.hue} size={96} ring /><StatusDot status={d.status} /></div>
          <div className="font-extrabold text-xl mt-3">{d.name}</div>
          <div className="text-sm text-brand-700 font-semibold">{L(SPEC[d.spec])}</div>
          <div className="text-xs text-ink-mute flex items-center gap-1 mt-0.5"><Icon n="pin" s={12} />{d.hospital}</div>
        </div>
      </div>
      <div className="px-4 -mt-3 stagger">
        <Card className="p-3 grid grid-cols-4 text-center divide-x divide-slate-100">
          {[[d.exp + ' ' + T('yrs', 'thn'), T('Experience', 'Pengalaman'), 'briefcase'], [d.sat + '%', T('Satisfied', 'Puas hati'), 'thumb'], [d.rating, T('Rating', 'Penilaian'), 'star'], [d.consults, T('Consults', 'Konsultasi'), 'chat']].map(([v, l, i]) => (
            <div key={l} className="px-1"><Icon n={i} s={16} className="mx-auto text-brand-600" /><div className="font-extrabold text-[15px] mt-1">{v}</div><div className="text-[10px] text-ink-mute leading-tight">{l}</div></div>
          ))}
        </Card>
        <SectionTitle>{T('About', 'Tentang')}</SectionTitle>
        <Card className="p-4 text-[13.5px] leading-relaxed text-ink-soft">{L(d.about)}</Card>
        <SectionTitle>{T('Credentials & practice', 'Kelayakan & amalan')}</SectionTitle>
        <Card className="overflow-hidden">
          <ListRow icon="grad" title={T('Education', 'Pendidikan')} sub={L(d.edu)} />
          <ListRow icon="shield" title={T('Registration no.', 'No. pendaftaran')} sub={(d.spec === 'diet' ? '' : 'MMC ') + d.mmc} />
          <ListRow icon="pin" title={T('Practice', 'Tempat amalan')} sub={d.hospital} />
          <ListRow icon="calendar" title={T('Chat schedule', 'Jadual sembang')} sub={L(d.sched)} last />
        </Card>
        <SectionTitle>{T('What you get', 'Apa yang anda dapat')}</SectionTitle>
        <Card className="p-4 space-y-2.5">
          {[['clock', T('30-minute chat session', 'Sesi sembang 30 minit')], ['passport', T('Doctor can view your Health Passport & CGM', 'Doktor boleh lihat Pasport Kesihatan & CGM anda')], ['note', T('Written advice saved to your diary', 'Nasihat bertulis disimpan dalam diari anda')], ['pill', T('E-prescription if needed', 'E-preskripsi jika perlu')]].map(([i, l]) => (
            <div key={l} className="flex items-center gap-3 text-[13px]"><span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Icon n={i} s={16} /></span>{l}</div>
          ))}
        </Card>
      </div>
      <div className="sticky bottom-0 mt-auto bg-white border-t border-slate-100 px-4 py-3 safe-b flex items-center gap-3 z-20">
        <div className="flex-1"><div className="text-[11px] text-ink-mute">{T('Consultation fee', 'Yuran konsultasi')}</div><PriceTag d={d} big /></div>
        <Btn icon="chat" className="px-7" onClick={() => (act ? nav.push('chat', { pid: 'p1', did }) : nav.push('checkout', { did }))}>{act ? T('Open chat', 'Buka sembang') : T('Chat now', 'Chat sekarang')}</Btn>
      </div>
    </div>
  );
}

function PCheckout({ did }) {
  const { S, mutate, nav } = useApp();
  const d = DOC[did];
  const voucher = S.points.vouchers.find((v) => v.rw === 'rw3' && !v.used);
  const canPoints = d.points && S.points.balance >= d.points;
  const free = S.freeConsults || 0;
  const [promo, setPromo] = useState(free ? 'free' : canPoints ? 'points' : voucher ? 'voucher' : 'none');
  const [pay, setPay] = useState('tng');
  const [step, setStep] = useState('form');
  const [ref] = useState(() => 'INV-' + Math.floor(100000 + Math.random() * 899999));
  const disc = d.orig - d.price;
  const extra = promo === 'points' || promo === 'free' ? d.price : promo === 'voucher' ? Math.round(d.price * 0.3 * 100) / 100 : 0;
  const fee = promo === 'points' || promo === 'free' ? 0 : SERVICE_FEE;
  const total = Math.max(0, d.orig - disc - extra + fee);

  const doPay = async () => {
    setStep('paying'); await wait(1700);
    mutate((s) => {
      s.sessions[did] = { start: now(), until: now() + 30 * MIN, amount: total, method: promo === 'points' ? 'points' : pay, ref };
      if (promo === 'points') { s.points.balance -= d.points; s.points.history.unshift({ t: now(), pts: -d.points, n: { en: 'Consultation: ' + d.name, ms: 'Konsultasi: ' + d.name } }); }
      if (promo === 'free') s.freeConsults = Math.max(0, (s.freeConsults || 0) - 1);
      if (promo === 'voucher') { const v = s.points.vouchers.find((x) => x.id === voucher.id); if (v) v.used = true; }
    });
    setStep('done');
  };

  if (step === 'done') return (
    <div className="min-h-full flex flex-col px-6 pt-14 pb-8 text-center">
      <div className="pop mx-auto w-24 h-24 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-[0_16px_40px_-12px_rgba(22,165,140,.9)]"><Icon n="check" s={48} sw={3} /></div>
      <h2 className="text-2xl font-extrabold mt-6">{T('Payment successful', 'Pembayaran berjaya')}</h2>
      <p className="text-ink-mute text-sm mt-1.5">{fill(T('Your 30-minute chat with {d} starts now.', 'Sesi sembang 30 minit anda dengan {d} bermula sekarang.'), { d: d.name })}</p>
      <Card className="p-4 mt-6 text-left space-y-2 text-sm">
        {[[T('Receipt', 'Resit'), ref], [T('Paid with', 'Dibayar dengan'), promo === 'free' ? T('Free consultation', 'Konsultasi percuma') : promo === 'points' ? fill(T('{n} points', '{n} mata'), { n: d.points }) : L(PAYMENTS.find((p) => p.id === pay).n)], [T('Total', 'Jumlah'), rm(total)], [T('Session ends', 'Sesi tamat'), fmtTime(now() + 30 * MIN)]].map(([k, v]) => (
          <div key={k} className="flex justify-between"><span className="text-ink-soft">{k}</span><span className="font-bold">{v}</span></div>
        ))}
      </Card>
      <div className="flex-1" />
      <Btn className="w-full mt-8" icon="chat" onClick={() => nav.replace('chat', { pid: 'p1', did })}>{T('Start consultation', 'Mula konsultasi')}</Btn>
    </div>
  );

  return (
    <div className="min-h-full flex flex-col">
      <Header title={T('Payment', 'Pembayaran')} sub={T('Chat consultation · 30 min', 'Konsultasi sembang · 30 min')} />
      <div className="px-4 stagger">
        <Card className="p-3.5 flex items-center gap-3">
          <div className="relative"><Avatar name={d.name} hue={d.hue} size={52} /><StatusDot status={d.status} /></div>
          <div className="flex-1 min-w-0"><div className="font-bold truncate">{d.name}</div><div className="text-xs text-ink-mute">{L(SPEC[d.spec])}</div><DocChips d={d} /></div>
        </Card>

        <SectionTitle>{T('Promo & points', 'Promosi & mata')}</SectionTitle>
        <Card className="overflow-hidden">
          {[
            { v: 'none', l: T('No promo', 'Tiada promosi'), s: T('Pay the discounted price', 'Bayar harga diskaun'), ok: true },
            { v: 'free', l: T('Free consultation (ad share reward)', 'Konsultasi percuma (ganjaran kongsi iklan)'), s: free ? fill(T('{n} available', '{n} tersedia'), { n: free }) : T('Share an ad to unlock', 'Kongsi iklan untuk dapatkan'), ok: free > 0 },
            d.points && { v: 'points', l: fill(T('Use {n} points — free consult', 'Guna {n} mata — konsultasi percuma'), { n: d.points }), s: canPoints ? fill(T('Balance: {n} pts', 'Baki: {n} mata'), { n: num(S.points.balance) }) : T('Not enough points', 'Mata tidak mencukupi'), ok: canPoints },
            { v: 'voucher', l: T('30% off consultation voucher', 'Baucar diskaun 30% konsultasi'), s: voucher ? voucher.code : T('Redeem it in Points & Rewards', 'Tebus di Mata & Ganjaran'), ok: !!voucher },
          ].filter(Boolean).map((o, i, a) => (
            <button key={o.v} disabled={!o.ok} onClick={() => setPromo(o.v)} className={`w-full flex items-center gap-3 px-4 py-3 text-left disabled:opacity-50 ${i < a.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${promo === o.v ? 'border-brand-600' : 'border-slate-300'}`}>{promo === o.v && <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />}</span>
              <div className="flex-1"><div className="text-[13.5px] font-semibold">{o.l}</div><div className="text-[11.5px] text-ink-mute">{o.s}</div></div>
              {o.v !== 'none' && <Icon n={o.v === 'points' ? 'star' : o.v === 'free' ? 'megaphone' : 'ticket'} s={18} className="text-amber-500" />}
            </button>
          ))}
        </Card>

        {total > 0 && <>
          <SectionTitle>{T('Payment method', 'Kaedah pembayaran')}</SectionTitle>
          <Card className="overflow-hidden">
            {PAYMENTS.map((p, i) => (
              <button key={p.id} onClick={() => setPay(p.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-left ${i < PAYMENTS.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <span className="w-11 h-8 rounded-lg text-white text-[10px] font-extrabold flex items-center justify-center" style={{ background: p.c }}>{p.l}</span>
                <span className="flex-1 text-[13.5px] font-semibold">{L(p.n)}</span>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pay === p.id ? 'border-brand-600' : 'border-slate-300'}`}>{pay === p.id && <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />}</span>
              </button>
            ))}
          </Card>
        </>}

        <SectionTitle>{T('Payment summary', 'Ringkasan pembayaran')}</SectionTitle>
        <Card className="p-4 space-y-2 text-[13.5px]">
          <div className="flex justify-between"><span className="text-ink-soft">{T('Consultation fee', 'Yuran konsultasi')}</span><span className="font-semibold tnum">{rm(d.orig)}</span></div>
          <div className="flex justify-between"><span className="text-ink-soft">{T('Doctor discount', 'Diskaun doktor')}</span><span className="font-semibold tnum text-good-fg">−{rm(disc)}</span></div>
          {extra > 0 && <div className="flex justify-between"><span className="text-ink-soft">{promo === 'free' ? T('Free consultation', 'Konsultasi percuma') : promo === 'points' ? T('Points redeemed', 'Mata ditebus') : T('Voucher 30%', 'Baucar 30%')}</span><span className="font-semibold tnum text-good-fg">−{rm(extra)}</span></div>}
          <div className="flex justify-between"><span className="text-ink-soft">{T('Service fee', 'Caj perkhidmatan')}</span><span className="font-semibold tnum">{fee ? rm(fee) : T('Free', 'Percuma')}</span></div>
          <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline"><span className="font-bold">{T('Total', 'Jumlah')}</span><span className="text-xl font-extrabold tnum">{rm(total)}</span></div>
        </Card>
        <div className="flex items-center gap-2 text-xs text-ink-mute mt-3 px-1"><Icon n="lock" s={14} />{T('Secure payment · full refund if the doctor does not reply within 10 min', 'Pembayaran selamat · bayaran balik penuh jika doktor tidak membalas dalam 10 min')}</div>
      </div>
      <div className="sticky bottom-0 mt-auto bg-white border-t border-slate-100 px-4 py-3 safe-b flex items-center gap-3 z-20">
        <div className="flex-1"><div className="text-[11px] text-ink-mute">{T('Total payment', 'Jumlah bayaran')}</div><div className="text-xl font-extrabold tnum">{rm(total)}</div></div>
        <Btn className="px-7" icon="lock" onClick={doPay} disabled={step === 'paying'}>{step === 'paying' ? <><span className="w-5 h-5 rounded-full border-[3px] border-white/40 border-t-white animate-spin" />{T('Processing…', 'Memproses…')}</> : total > 0 ? T('Pay now', 'Bayar sekarang') : T('Confirm', 'Sahkan')}</Btn>
      </div>
      {step === 'paying' && <div className="absolute inset-0 z-30 bg-white/60 backdrop-blur-[2px] anim-fade" />}
    </div>
  );
}
