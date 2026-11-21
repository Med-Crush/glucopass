/* ============ HEALTH PASSPORT (CPG follow-up tests) ============ */
const passportSnap = (pt) => {
  const v = {}; ['hba1c', 'fbs', 'pp2', 'bp'].forEach((k) => (v[k] = latest(pt.metrics[k])?.v));
  const order = { good: 0, warn: 1, risk: 2 };
  const worst = ['hba1c', 'fbs', 'bp'].map((k) => MET[k].st(v[k])).sort((a, b) => order[b] - order[a])[0];
  return { pid: pt.id, name: pt.name, type: pt.type, typeShort: pt.typeShort, age: pt.age, vals: v, status: worst, t: now() };
};
const lastUpdated = (pt) => Math.max(...pt.records.map((r) => r.t), ...METRICS.map((m) => latest(pt.metrics[m.id])?.t || 0));
const followUp = (pt) => METRICS.filter((m) => m.freq !== 'vital').map((m) => ({ m, due: dueInfo(pt.metrics[m.id], m.freq) }));

function PassportCard({ pt }) {
  const fu = followUp(pt); const ok = fu.filter((x) => x.due.s === 'good').length;
  return (
    <div className="passport-bg rounded-[24px] text-white p-4 relative overflow-hidden shadow-lift">
      <div className="absolute inset-0 passport-pattern" />
      <div className="absolute -right-10 -top-14 w-44 h-44 rounded-full border-[18px] border-white/5" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Icon n="shield" s={17} /><span className="text-[11px] font-bold tracking-[.14em] uppercase">{T('Health Passport', 'Pasport Kesihatan')}</span></div>
          <span className="text-[10px] font-semibold bg-white/15 rounded-full px-2 py-0.5">{APP_NAME}</span>
        </div>
        <div className="flex gap-3.5 mt-4 items-center">
          <div className="w-[64px] h-[64px] rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center"><Avatar name={pt.name} hue={pt.hue} size={50} /></div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[18px] leading-tight truncate">{pt.name}</div>
            <div className="text-[12.5px] text-white/80">{L(pt.type)} · {T('since', 'sejak')} {pt.since}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3.5">
          {[[T('Age', 'Umur'), pt.age], [T('Blood', 'Darah'), pt.blood], [T('Sex', 'Jantina'), L(pt.sex)]].map(([k, v], i) => (
            <div key={i} className="bg-white/10 rounded-xl px-2.5 py-1.5"><div className="text-[9.5px] uppercase tracking-wide text-white/60">{k}</div><div className="text-[13px] font-bold">{v}</div></div>
          ))}
        </div>
        <div className="mt-2 bg-white/10 rounded-xl px-2.5 py-1.5"><div className="text-[9.5px] uppercase tracking-wide text-white/60">{T('Medication', 'Ubat')}</div><div className="text-[12.5px] font-semibold">{L(pt.meds)}</div></div>
        <div className="flex items-center justify-between mt-3 text-[11px]">
          <span className="text-white/70">{T('Updated', 'Dikemas kini')}: {fmtDate(lastUpdated(pt))}</span>
          <span className="font-bold bg-white/15 rounded-full px-2.5 py-1">{ok}/{fu.length} {T('tests up to date', 'ujian terkini')}</span>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ pt, id, onClick }) {
  const m = MET[id]; const hist = pt.metrics[id]; const last = latest(hist);
  const s = metricStatus(pt, id, last.v);
  const series = hist.map((h) => metricNum(id, h.v));
  const prev = hist.length > 1 ? metricNum(id, hist[hist.length - 2].v) : null;
  const delta = prev != null ? metricNum(id, last.v) - prev : 0;
  const due = m.freq !== 'vital' ? dueInfo(hist, m.freq) : null;
  return (
    <Card className="p-3.5" onClick={onClick}>
      <div className="flex items-center gap-1.5 text-ink-soft"><Icon n={m.icon} s={14} /><span className="text-[11.5px] font-semibold leading-tight truncate">{L(m.short || m.n)}</span></div>
      <div className="flex items-baseline gap-1 mt-1.5">
        <span className="text-[22px] font-extrabold tnum leading-none">{fmtMetric(id, last.v)}</span>
        <span className="text-[10.5px] text-ink-mute font-semibold">{m.unit}</span>
      </div>
      <div className={`text-[10.5px] font-semibold mt-0.5 ${delta < 0 ? 'text-good-fg' : delta > 0 ? 'text-risk-fg' : 'text-ink-mute'}`}>{delta < 0 ? '▼' : delta > 0 ? '▲' : '•'} {id === 'weight' ? 'BMI ' + bmi(last.v, pt.height) : num(Math.abs(delta), m.d ?? 1) + ' ' + T('vs last', 'vs lepas')}</div>
      <div className="flex items-end justify-between mt-1.5"><Badge s={s} /><Sparkline data={series} color={ST[s].dot} w={58} h={24} /></div>
      {due && <div className={`text-[10.5px] font-semibold mt-1.5 ${ST[due.s].fg}`}>{due.l}</div>}
    </Card>
  );
}

function ScreenRow({ pt, id, onClick, last }) {
  const m = MET[id]; const l = latest(pt.metrics[id]); const s = metricStatus(pt, id, l.v); const due = dueInfo(pt.metrics[id], m.freq);
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${last ? '' : 'border-b border-slate-100'}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: ST[s].soft, color: ST[s].hex }}><Icon n={m.icon} s={18} /></div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13.5px] leading-tight">{L(m.n)}</div>
        {m.note && <div className="text-[10.5px] text-ink-mute italic">({L(m.note)})</div>}
        <div className="text-[12px] mt-0.5 flex items-center gap-1.5 flex-wrap"><span className="font-bold tnum">{fmtMetric(id, l.v)}</span>{m.unit && m.kind !== 'qual' && <span className="text-ink-mute">{m.unit}</span>}<span className="text-ink-mute">· {fmtDate(l.t, { day: 'numeric', month: 'short', year: '2-digit' })}</span></div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Badge s={s} />
        <span className={`text-[10.5px] font-semibold ${ST[due.s].fg}`}>{due.l}</span>
      </div>
    </button>
  );
}

function VitalsSheet({ pt, open, onClose }) {
  const { mutate, toast } = useApp();
  const empty = { sys: '', dia: '', hr: '', weight: '', height: '', waist: '', rcbs: '' };
  const [f, setF] = useState(empty);
  useEffect(() => { if (open) setF(empty); }, [open]);
  const last = (k) => latest(pt.metrics[k])?.v;
  const lb = last('bp');
  const fields = [
    ['hr', T('Heart rate', 'Kadar denyutan jantung'), 'bpm', last('hr')],
    ['weight', T('Weight', 'Berat'), 'kg', last('weight')],
    ['height', T('Height', 'Tinggi'), 'cm', last('height')],
    ['waist', T('Waist circumference', 'Lilitan pinggang'), 'cm', last('waist')],
    ['rcbs', T('Random capillary blood sugar', 'Gula darah kapilari rawak'), 'mmol/L', last('rcbs')],
  ];
  const inp = 'w-full h-12 rounded-xl bg-slate-100 px-3.5 text-[15px] font-semibold outline-none focus:ring-2 ring-brand-300 tnum';
  const save = () => {
    const vals = {};
    const sys = parseInt(f.sys), dia = parseInt(f.dia); if (!isNaN(sys) && !isNaN(dia)) vals.bp = [sys, dia];
    ['hr', 'weight', 'height', 'waist', 'rcbs'].forEach((k) => { const v = parseFloat(f[k]); if (!isNaN(v)) vals[k] = v; });
    if (!Object.keys(vals).length) { toast(T('Enter at least one reading', 'Masukkan sekurang-kurangnya satu bacaan'), 'info'); return; }
    const t = now();
    mutate((d) => {
      const P = d.patients[pt.id];
      Object.entries(vals).forEach(([k, v]) => P.metrics[k].push({ t, v }));
      if (vals.height) P.height = vals.height;
    });
    onClose(); setTimeout(() => toast(T('Vitals updated in your passport', 'Tanda vital dikemas kini dalam pasport'), 'heart'), 250);
  };
  return (
    <Sheet open={open} onClose={onClose} title={T('Update vitals', 'Kemas kini tanda vital')}>
      <div className="text-[12.5px] text-ink-mute -mt-1 mb-3">{T('Fill in only what you measured. Grey numbers are your last readings.', 'Isi hanya yang anda ukur. Nombor kelabu ialah bacaan terakhir anda.')}</div>
      <div className="space-y-3">
        <div>
          <label className="text-[12.5px] font-semibold text-ink-soft">{T('Blood pressure', 'Tekanan darah')} <span className="text-ink-mute font-normal">(mmHg)</span></label>
          <div className="flex items-center gap-2 mt-1.5">
            <input inputMode="numeric" value={f.sys} onChange={(e) => setF({ ...f, sys: e.target.value })} placeholder={lb ? String(lb[0]) : 'SYS'} className={inp} />
            <span className="text-xl text-ink-mute">/</span>
            <input inputMode="numeric" value={f.dia} onChange={(e) => setF({ ...f, dia: e.target.value })} placeholder={lb ? String(lb[1]) : 'DIA'} className={inp} />
          </div>
        </div>
        {fields.map(([k, l, u, p]) => (
          <div key={k}>
            <label className="text-[12.5px] font-semibold text-ink-soft">{l} <span className="text-ink-mute font-normal">({u})</span></label>
            <input inputMode="decimal" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={p != null ? String(p) : ''} className={inp + ' mt-1.5'} />
          </div>
        ))}
      </div>
      <Btn className="w-full mt-4" icon="check" onClick={save}>{T('Save to passport', 'Simpan ke pasport')}</Btn>
    </Sheet>
  );
}

function PassportContent({ pt, editable }) {
  const { nav } = useApp();
  const [metric, setMetric] = useState(null);
  const [vitals, setVitals] = useState(false);
  const fu = followUp(pt);
  const overdue = fu.filter((x) => x.due.s === 'risk'); const soon = fu.filter((x) => x.due.s === 'warn');
  return (
    <div>
      {(overdue.length > 0 || soon.length > 0) && (
        <div className={`mt-3 rounded-2xl p-3.5 flex gap-3 items-start ${overdue.length ? 'bg-risk-bg' : 'bg-warn-bg'}`}>
          <Icon n="calendar" s={18} className={overdue.length ? 'text-risk-fg mt-0.5' : 'text-warn-fg mt-0.5'} />
          <div className="text-[12.5px] leading-snug">
            <div className={`font-bold ${overdue.length ? 'text-risk-fg' : 'text-warn-fg'}`}>{T('Follow-up reminder', 'Peringatan susulan')}</div>
            {[...overdue, ...soon].map((x) => <div key={x.m.id} className="text-ink-soft">• {L(x.m.n)} — {x.due.l}</div>)}
          </div>
        </div>
      )}

      <SectionTitle action={editable ? '+ ' + T('Update', 'Kemas kini') : null} onAction={() => setVitals(true)}>{T('Vitals & body measurements', 'Tanda vital & ukuran badan')}</SectionTitle>
      <div className="text-[11.5px] text-ink-mute -mt-1.5 mb-2.5 px-0.5">{T('Latest readings', 'Bacaan terkini')} · {fmtDate(Math.max(...VITAL_KEYS.map((k) => latest(pt.metrics[k])?.t || 0)))}</div>
      <div className="grid grid-cols-2 gap-2.5">{VITAL_KEYS.map((id) => <MetricTile key={id} pt={pt} id={id} onClick={() => setMetric(id)} />)}</div>
      <BmiCard pt={pt} />

      <SectionTitle>{T('Glycaemic control', 'Kawalan glisemik')}</SectionTitle>
      <div className="text-[11.5px] text-ink-mute -mt-1.5 mb-2.5 px-0.5">{T('FBS, RBS or 2HPP at each visit · HbA1c every 6 months', 'FBS, RBS atau 2HPP setiap lawatan · HbA1c setiap 6 bulan')}</div>
      <div className="grid grid-cols-2 gap-2.5">{['hba1c', 'fbs', 'rbs', 'pp2'].map((id) => <MetricTile key={id} pt={pt} id={id} onClick={() => setMetric(id)} />)}</div>

      <SectionTitle>{T('Complication screening', 'Saringan komplikasi')}</SectionTitle>
      <div className="text-[11.5px] font-bold text-ink-soft mb-1.5 px-0.5 flex items-center gap-1.5"><Icon n="calendar" s={13} />{L(FREQ['6m'].n)}</div>
      <Card className="overflow-hidden">{['ualb', 'uacr', 'creat'].map((id, i, a) => <ScreenRow key={id} pt={pt} id={id} last={i === a.length - 1} onClick={() => setMetric(id)} />)}</Card>
      <div className="text-[11.5px] font-bold text-ink-soft mb-1.5 mt-4 px-0.5 flex items-center gap-1.5"><Icon n="calendar" s={13} />{L(FREQ['12m'].n)}</div>
      <Card className="overflow-hidden">{['ecg', 'fundus', 'lipid'].map((id, i, a) => <ScreenRow key={id} pt={pt} id={id} last={i === a.length - 1} onClick={() => setMetric(id)} />)}</Card>

      <div className="text-[10.5px] text-ink-mute mt-3 px-0.5 flex items-start gap-1.5"><Icon n="info" s={12} className="mt-0.5" />{T('Follow-up schedule based on the Malaysian CPG for Type 2 Diabetes management in primary care.', 'Jadual susulan berdasarkan CPG Malaysia bagi pengurusan Diabetes Jenis 2 di penjagaan primer.')}</div>

      <SectionTitle action={'+ ' + T('Upload', 'Muat naik')} onAction={() => nav.push('upload')}>{T('Medical records', 'Rekod perubatan')}</SectionTitle>
      <RecordsTimeline pt={pt} />
      <MetricSheet pt={pt} id={metric} onClose={() => setMetric(null)} />
      {editable && <VitalsSheet pt={pt} open={vitals} onClose={() => setVitals(false)} />}
    </div>
  );
}

function MetricSheet({ pt, id, onClose }) {
  const m = id && MET[id];
  return (
    <Sheet open={!!id} onClose={onClose} title={m ? L(m.n) : ''}>
      {m && (() => {
        const hist = pt.metrics[id]; const last = latest(hist); const s = metricStatus(pt, id, last.v);
        const due = m.freq !== 'vital' ? dueInfo(hist, m.freq) : null;
        return (
          <div>
            <div className="flex items-end justify-between gap-3">
              <div><span className={`${m.kind === 'qual' ? 'text-2xl' : 'text-4xl'} font-extrabold tnum`}>{fmtMetric(id, last.v)}</span> {m.kind !== 'qual' && <span className="text-ink-mute font-semibold">{m.unit}</span>}</div>
              <Badge s={s} />
            </div>
            <div className="text-xs text-ink-mute mt-1">{T('Target', 'Sasaran')}: {L(m.ref)} · {fmtDate(last.t)}</div>
            {due && <div className={`mt-3 rounded-2xl px-3.5 py-2.5 flex items-center justify-between text-[12.5px] ${ST[due.s].bg}`}><span className="font-semibold text-ink-soft">{L(FREQ[m.freq].n)}</span><span className={`font-bold ${ST[due.s].fg}`}>{due.l}</span></div>}
            {m.kind !== 'qual' && hist.length > 1 && <div className="mt-4 -mx-1"><LineChart points={hist.map((h) => ({ t: h.t, v: metricNum(id, h.v) }))} color={ST[s].dot} band={m.band} fmt={(v) => num(v, m.d ?? 1)} /></div>}
            {id === 'bp' && <div className="text-[11px] text-ink-mute text-center -mt-1">{T('Chart shows systolic pressure', 'Carta menunjukkan tekanan sistolik')}</div>}
            {id === 'lipid' && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {['tc', 'ldl', 'hdl', 'tg'].map((k) => { const ls = LT[k].st(last.v[k]); return (
                  <div key={k} className="rounded-2xl py-2 text-center" style={{ background: ST[ls].soft }}><div className="text-[10px] font-semibold text-ink-soft">{k.toUpperCase()}</div><div className="font-extrabold tnum" style={{ color: ST[ls].hex }}>{last.v[k]}</div></div>); })}
              </div>
            )}
            <div className="mt-3 divide-y divide-slate-100">
              {[...hist].reverse().map((h, i) => (
                <div key={i} className="flex justify-between gap-3 py-2.5 text-sm"><span className="text-ink-soft">{fmtDate(h.t)}</span><span className="font-bold tnum text-right">{id === 'lipid' ? `TC ${h.v.tc} · LDL ${h.v.ldl} · HDL ${h.v.hdl} · TG ${h.v.tg}` : fmtMetric(id, h.v) + (m.kind === 'qual' ? '' : ' ' + m.unit)}</span></div>
              ))}
            </div>
          </div>
        );
      })()}
    </Sheet>
  );
}

function PPassport() {
  const { S, nav } = useApp();
  const pt = S.patients.p1;
  const [share, setShare] = useState(false);
  return (
    <div className="pb-28">
      <Header back={false} title={T('Health Passport', 'Pasport Kesihatan')} right={<button onClick={() => setShare(true)} className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-black/5" aria-label="Share"><Icon n="share" /></button>} />
      <div className="px-4 stagger">
        <PassportCard pt={pt} />
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          <Btn size="md" icon="upload" onClick={() => nav.push('upload')}>{T('Upload record', 'Muat naik rekod')}</Btn>
          <Btn size="md" v="secondary" icon="share" onClick={() => setShare(true)}>{T('Share passport', 'Kongsi pasport')}</Btn>
        </div>
        <PassportContent pt={pt} editable />
      </div>
      <DoctorPicker open={share} onClose={() => setShare(false)} onPick={(did) => { setShare(false); setTimeout(() => nav.push('chat', { pid: 'p1', did, auto: 'passport' }), 250); }} />
    </div>
  );
}

/* ---------- lab report document + OCR ---------- */
const OCR_BOXES = [
  { k: 'lab', x: 7, y: 5, w: 60, h: 7 },
  { k: 'date', x: 58.5, y: 22.3, w: 35, h: 4 },
  ...LAB_TESTS.map((r) => ({ k: r.k, x: 46.5, y: r.y - 2, w: 21, h: 4 })),
];
function LabDoc({ lab, t, vals, pt }) {
  const name = (pt?.name || 'Ahmad Zaki').toUpperCase(); const sex = pt ? (pt.sex.en === 'Male' ? 'M' : 'F') : 'M';
  return (
    <div className="absolute inset-0 bg-[#fdfdfb] paper-lines text-[#25302e] overflow-hidden" style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
      <div className="absolute left-[7%] top-[5%] flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold">+</div>
        <div><div className="text-[11px] font-bold leading-tight">{lab}</div><div className="text-[7px] text-slate-500">Accredited Medical Laboratory · MS ISO 15189</div></div>
      </div>
      <div className="absolute left-[7%] right-[7%] top-[15%] border-t border-slate-300" />
      <div className="absolute left-[7%] top-[17%] text-[9px] font-bold tracking-wide">LABORATORY REPORT · DIABETES FOLLOW-UP</div>
      <div className="absolute left-[7%] top-[23%] text-[8px] leading-[1.6]"><div>Patient : {name}</div><div>Age/Sex : {pt?.age || 34} / {sex}</div><div>Ref Dr. : Dr. Aisyah Rahman</div></div>
      <div className="absolute left-[60%] top-[23%] text-[8px] leading-[1.6]"><div>Date : {fmtDate(t, { day: '2-digit', month: '2-digit', year: 'numeric' })}</div><div>Lab No: {String(t).slice(-6)}</div></div>
      <div className="absolute left-[7%] right-[7%] top-[34%] border-y border-slate-300 py-[1.2%] text-[7.5px] font-bold flex">
        <span className="w-[46%]">TEST</span><span className="w-[24%]">RESULT</span><span>REF. RANGE</span>
      </div>
      {LAB_TESTS.map((r) => (
        <div key={r.k} className="absolute left-[7%] right-[7%] text-[7.5px] flex items-center" style={{ top: r.y - 1.2 + '%' }}>
          <span className="w-[46%] truncate pr-1">{r.n}</span><span className="w-[24%] font-bold truncate">{vals[r.k] == null ? '—' : r.qual ? (QUAL[vals[r.k]]?.en || vals[r.k]) : vals[r.k]} <span className="font-normal text-[6px]">{vals[r.k] != null && !r.qual ? r.u : ''}</span></span><span className="text-slate-500 truncate">{r.ref}</span>
        </div>
      ))}
      <div className="absolute left-[7%] right-[7%] top-[87%] border-t border-slate-300 pt-1 text-[6.5px] text-slate-500 leading-snug">Results verified by: Dr. K. Chandran (Pathologist). This report is computer generated.</div>
      <div className="absolute right-[8%] bottom-[2.5%] w-10 h-10 rounded-full border-2 border-brand-600/40 text-brand-700/50 text-[6px] font-bold flex items-center justify-center rotate-[-14deg] text-center leading-tight">VERIFIED<br />LAB</div>
    </div>
  );
}

function PRecord({ pid, rid }) {
  const { S } = useApp();
  const pt = S.patients[pid]; const r = pt.records.find((x) => x.id === rid);
  const [zoom, setZoom] = useState(false);
  if (!r) return <div><Header title="—" /></div>;
  const K = REC_KIND[r.kind];
  const Doc = () => (r.image ? <img src={r.image} className="absolute inset-0 w-full h-full object-cover" alt="" /> : r.kind === 'lab' ? <LabDoc lab={r.lab} t={r.t} vals={r.vals} pt={pt} /> : <TextDoc rec={r} name={pt.name.toUpperCase()} />);
  return (
    <div className="pb-10">
      <Header title={L(K.n)} sub={r.lab} />
      <div className="px-4 stagger">
        <button onClick={() => setZoom(true)} className="relative w-full aspect-[3/4] rounded-[20px] overflow-hidden shadow-soft bg-white block">
          <Doc />
          <span className="absolute bottom-3 right-3 h-8 px-3 rounded-full bg-black/55 text-white text-xs font-semibold flex items-center gap-1.5"><Icon n="eye" s={14} />{T('View', 'Lihat')}</span>
        </button>
        <Card className="p-4 mt-3">
          <div className="flex items-center gap-2 mb-2"><Icon n="scan" s={17} className="text-brand-600" /><span className="font-bold text-[15px]">{T('Extracted data', 'Data diekstrak')}</span></div>
          <div className="divide-y divide-slate-100">
            <div className="flex justify-between py-2.5 text-sm"><span className="text-ink-soft">{T('Facility', 'Fasiliti')}</span><span className="font-semibold text-right">{r.lab}</span></div>
            <div className="flex justify-between py-2.5 text-sm"><span className="text-ink-soft">{T('Date', 'Tarikh')}</span><span className="font-semibold">{fmtDate(r.t)}</span></div>
            {r.vals && LAB_TESTS.filter((x) => r.vals[x.k] != null).map((x) => { const v = r.vals[x.k]; const s = x.st(v); return (
              <div key={x.k} className="flex justify-between items-center gap-3 py-2.5 text-sm">
                <span className="text-ink-soft">{x.n}</span>
                <span className="flex items-center gap-2 shrink-0"><span className="font-bold tnum">{fmtLab(x.k, v)} <span className="text-ink-mute font-medium text-xs">{x.qual ? '' : x.u}</span></span><Badge s={s} /></span>
              </div>); })}
            {r.text && <div className="py-2.5 text-sm"><div className="text-ink-soft mb-1">{T('Content', 'Kandungan')}</div><div className="font-medium whitespace-pre-line">{L(r.text)}</div></div>}
          </div>
        </Card>
      </div>
      {zoom && (
        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4 anim-fade" onClick={() => setZoom(false)}>
          <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden"><Doc /></div>
          <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/15 text-white flex items-center justify-center"><Icon n="x" /></button>
        </div>
      )}
    </div>
  );
}

function PUpload() {
  const { S, mutate, nav, award, toast } = useApp();
  const pt = S.patients.p1;
  const [step, setStep] = useState('choose');
  const [kind, setKind] = useState('lab');
  const [src, setSrc] = useState(null);
  const [form, setForm] = useState(null);
  const [scanTxt, setScanTxt] = useState(0);
  const conf = { lab: 97, date: 99, hba1c: 98, fbs: 96, pp2: 84, creat: 95, ualb: 93, uacr: 79, tc: 96, ldl: 94, hdl: 90, tg: 88, text: 88 };
  const toISO = (t) => new Date(t - new Date(t).getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const start = async (s) => {
    setSrc(s); setStep('scan'); setScanTxt(0);
    await wait(1100); setScanTxt(1); await wait(1400);
    if (kind === 'lab') {
      const base = s.sample ? SAMPLE_LAB : (() => { const r = Math.random; const h = latest(pt.metrics.hba1c).v; return { lab: 'Klinik Kesihatan Setia Alam', vals: { hba1c: r1(h - 0.1 - r() * 0.4), fbs: r1(6.8 + r() * 0.8), pp2: r1(9.4 + r() * 1.4), creat: Math.round(86 + r() * 8), ualb: 'neg', uacr: r1(1.9 + r() * 0.8), tc: r1(4.9 + r() * 0.6), ldl: r1(2.6 + r() * 0.6), hdl: r1(1.0 + r() * 0.3), tg: r1(1.5 + r() * 0.5) } }; })();
      setForm({ lab: base.lab, date: toISO(now()), ...Object.fromEntries(Object.entries(base.vals).map(([k, v]) => [k, String(v)])) });
    } else {
      setForm({ lab: 'Klinik Kesihatan Setia Alam', date: toISO(now()), text: kind === 'rx' ? 'Metformin 500 mg — 1 tab BD (60 days)\nAtorvastatin 10 mg — 1 tab ON' : T('ECG: normal sinus rhythm. Fundus: no diabetic retinopathy. Review in 6 months with HbA1c, urine albumin and serum creatinine.', 'ECG: ritma sinus normal. Fundus: tiada retinopati diabetik. Semakan dalam 6 bulan dengan HbA1c, albumin air kencing dan kreatinin serum.') });
    }
    setStep('form');
  };

  const save = () => {
    const t = new Date(form.date + 'T09:00:00').getTime() || now();
    mutate((d) => {
      const P = d.patients.p1;
      P.records.forEach((r) => delete r.isNew);
      if (kind === 'lab') {
        const vals = {};
        LAB_TESTS.forEach(({ k, qual }) => { if (qual) { if (form[k]) vals[k] = form[k]; } else { const v = parseFloat(form[k]); if (!isNaN(v)) vals[k] = v; } });
        P.records.push({ id: uid('rec'), kind, t, lab: form.lab, vals, image: src.url || null, isNew: true });
        const push = (k, v) => { P.metrics[k].push({ t, v }); P.metrics[k].sort((a, b) => a.t - b.t); };
        ['hba1c', 'fbs', 'pp2', 'creat', 'uacr', 'ualb'].forEach((k) => { if (vals[k] != null) push(k, vals[k]); });
        if (['tc', 'ldl', 'hdl', 'tg'].some((k) => vals[k] != null)) { const prev = latest(P.metrics.lipid).v; push('lipid', { tc: vals.tc ?? prev.tc, ldl: vals.ldl ?? prev.ldl, hdl: vals.hdl ?? prev.hdl, tg: vals.tg ?? prev.tg }); }
      } else {
        P.records.push({ id: uid('rec'), kind, t, lab: form.lab, text: form.text, image: src.url || null, isNew: true });
      }
    });
    nav.back();
    setTimeout(() => { award(25, { en: 'Uploaded ' + REC_KIND[kind].n.en.toLowerCase(), ms: 'Muat naik ' + REC_KIND[kind].n.ms.toLowerCase() }); toast(T('Saved to your passport', 'Disimpan ke pasport anda'), 'shield'); }, 350);
  };

  const Doc = () => (src?.url ? <img src={src.url} className="absolute inset-0 w-full h-full object-cover" alt="" /> : <LabDoc lab={SAMPLE_LAB.lab} t={now()} vals={SAMPLE_LAB.vals} pt={pt} />);
  const Thumb = ({ w }) => <div style={{ transform: `scale(${w})`, transformOrigin: 'top left', width: 100 / w + '%', height: 100 / w + '%' }} className="relative"><LabDoc lab={SAMPLE_LAB.lab} t={now()} vals={SAMPLE_LAB.vals} pt={pt} /></div>;

  if (step === 'choose') return (
    <div className="pb-10">
      <Header title={T('Upload medical record', 'Muat naik rekod perubatan')} />
      <div className="px-4 stagger">
        <div className="text-[13px] font-semibold text-ink-soft mb-2">{T('Document type', 'Jenis dokumen')}</div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(REC_KIND).map(([k, K]) => (
            <button key={k} onClick={() => setKind(k)} className={`h-[78px] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-[12px] font-semibold border-2 ${kind === k ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-transparent bg-white shadow-soft text-ink-soft'}`}>
              <Icon n={K.icon} s={21} />{L(K.n)}
            </button>
          ))}
        </div>
        <Card className="p-5 mt-4 text-center">
          <div className="relative w-24 h-28 mx-auto mb-3">
            <div className="absolute inset-0 rounded-xl bg-brand-50 rotate-[-8deg]" /><div className="absolute inset-0 rounded-xl bg-white border border-slate-200 shadow-soft flex items-center justify-center text-brand-600"><Icon n="scan" s={36} sw={1.6} /></div>
          </div>
          <div className="font-bold">{T('Scan your document', 'Imbas dokumen anda')}</div>
          <div className="text-xs text-ink-mute mt-1 mb-4">{T('OCR reads HbA1c, FBS, 2HPP, creatinine, urine albumin/microalbumin and lipid profile automatically.', 'OCR membaca HbA1c, FBS, 2HPP, kreatinin, albumin/mikroalbumin air kencing dan profil lipid secara automatik.')}</div>
          <div className="grid grid-cols-2 gap-2.5">
            <FileButton capture onFile={(url) => start({ url })} className="h-12 rounded-2xl bg-brand-600 text-white font-semibold text-sm flex items-center justify-center gap-2"><Icon n="camera" s={18} />{T('Take photo', 'Ambil gambar')}</FileButton>
            <FileButton onFile={(url) => start({ url })} className="h-12 rounded-2xl bg-white border border-slate-200 font-semibold text-sm flex items-center justify-center gap-2"><Icon n="image" s={18} />{T('Gallery', 'Galeri')}</FileButton>
          </div>
        </Card>
        <button onClick={() => { setKind('lab'); start({ sample: true }); }} className="mt-3 w-full flex items-center gap-3 p-3 rounded-[20px] bg-white shadow-soft text-left">
          <div className="relative w-14 h-[74px] rounded-lg overflow-hidden border border-slate-200 shrink-0"><Thumb w={0.18} /></div>
          <div className="flex-1"><div className="flex items-center gap-2"><span className="font-semibold text-sm">{T('Use sample lab report', 'Guna laporan makmal contoh')}</span><span className="text-[10px] font-bold bg-slate-200 text-ink-soft rounded px-1.5 py-0.5">DEMO</span></div><div className="text-xs text-ink-mute">{SAMPLE_LAB.lab}</div></div>
          <Icon n="right" s={18} className="text-ink-mute" />
        </button>
        <div className="flex items-center gap-2 text-xs text-ink-mute mt-4 px-1"><Icon n="lock" s={14} />{T('Encrypted and only shared with doctors you choose.', 'Disulitkan dan hanya dikongsi dengan doktor pilihan anda.')}</div>
      </div>
    </div>
  );

  if (step === 'scan') return (
    <div className="pb-10">
      <Header title={T('Reading document', 'Membaca dokumen')} onBack={() => setStep('choose')} />
      <div className="px-4">
        <div className="relative w-full aspect-[3/4] rounded-[20px] overflow-hidden shadow-lift bg-white">
          <Doc />
          <div className="absolute inset-0 bg-brand-900/10" />
          {(kind === 'lab' ? OCR_BOXES : OCR_BOXES.slice(0, 2)).map((b, i) => (
            <div key={b.k} className="absolute rounded-md border-2 border-brand-400 bg-brand-300/20 ocrbox" style={{ left: b.x + '%', top: b.y + '%', width: b.w + '%', height: b.h + '%', animationDelay: 0.3 + i * 0.18 + 's' }} />
          ))}
          <div className="scanline" />
        </div>
        <div className="flex items-center gap-3 mt-5 bg-white rounded-2xl p-4 shadow-soft">
          <div className="w-10 h-10 rounded-full border-[3px] border-brand-200 border-t-brand-600 animate-spin" />
          <div><div className="font-bold text-sm anim-fade" key={scanTxt}>{[T('Detecting text regions…', 'Mengesan kawasan teks…'), T('Extracting lab values…', 'Mengekstrak nilai makmal…')][scanTxt]}</div><div className="text-xs text-ink-mute">OCR · {T('on-device demo', 'demo dalam peranti')}</div></div>
        </div>
      </div>
    </div>
  );

  const fields = kind === 'lab'
    ? [['lab', T('Lab name', 'Nama makmal'), 'text'], ['date', T('Date', 'Tarikh'), 'date'], ...LAB_TESTS.map((x) => [x.k, x.n + (x.u ? ` (${x.u})` : ''), x.qual ? 'select' : 'decimal'])]
    : [['lab', T('Clinic / hospital', 'Klinik / hospital'), 'text'], ['date', T('Date', 'Tarikh'), 'date'], ['text', kind === 'rx' ? T('Medication', 'Ubat') : T('Letter content', 'Kandungan surat'), 'area']];
  const low = fields.filter(([k]) => conf[k] < 85).length;
  const inCls = (lowc) => `w-full h-12 rounded-xl px-3.5 text-[15px] font-semibold outline-none focus:ring-2 ring-brand-300 tnum ${lowc ? 'bg-warn-bg/60 ring-1 ring-warn-dot/50' : 'bg-slate-100'}`;
  return (
    <div className="min-h-full flex flex-col">
      <Header title={T('Confirm details', 'Sahkan butiran')} sub={L(REC_KIND[kind].n)} onBack={() => setStep('choose')} />
      <div className="px-4 stagger">
        <div className="flex gap-3 items-center bg-white rounded-[20px] p-3 shadow-soft">
          <div className="relative w-16 h-[84px] rounded-lg overflow-hidden border border-slate-200 shrink-0">{src?.url ? <img src={src.url} className="w-full h-full object-cover" alt="" /> : <Thumb w={0.2} />}</div>
          <div className="flex-1">
            <div className="font-bold text-sm flex items-center gap-1.5"><Icon n="check" s={16} className="text-brand-600" />{fill(T('{n} fields extracted', '{n} medan diekstrak'), { n: fields.length })}</div>
            <div className="text-xs text-ink-mute mt-0.5">{low ? fill(T('{n} need your review — check the highlighted fields.', '{n} perlu semakan anda — semak medan yang ditanda.'), { n: low }) : T('Please confirm the values are correct.', 'Sila sahkan nilai adalah betul.')}</div>
          </div>
        </div>
        <Card className="p-4 mt-3 space-y-3.5">
          {fields.map(([k, label, type]) => {
            const c = conf[k] ?? 90; const lowc = c < 85;
            return (
              <div key={k}>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <label className="text-[12.5px] font-semibold text-ink-soft">{label}</label>
                  <span className={`text-[10.5px] font-bold flex items-center gap-1 shrink-0 ${lowc ? 'text-warn-fg' : 'text-good-fg'}`}>
                    <span className="flex gap-0.5">{[0, 1, 2].map((i) => <span key={i} className="w-1 h-2.5 rounded-sm" style={{ background: i < (c >= 95 ? 3 : c >= 85 ? 2 : 1) ? (lowc ? '#f0a92e' : '#34b27b') : '#e2e8f0' }} />)}</span>
                    {c}%{lowc && ' · ' + T('check', 'semak')}
                  </span>
                </div>
                {type === 'area' ? <textarea rows={3} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 ring-brand-300 ${lowc ? 'bg-warn-bg/60 ring-1 ring-warn-dot/50' : 'bg-slate-100'}`} />
                  : type === 'select' ? <select value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inCls(lowc)}>{['neg', 'trace', 'pos'].map((q) => <option key={q} value={q}>{L(QUAL[q])}</option>)}</select>
                  : <input type={type === 'date' ? 'date' : 'text'} inputMode={type === 'decimal' ? 'decimal' : undefined} value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={inCls(lowc)} />}
              </div>
            );
          })}
        </Card>
        <Disclaimer>{T('OCR results may contain errors. Always confirm against your original document.', 'Hasil OCR mungkin mengandungi ralat. Sentiasa sahkan dengan dokumen asal anda.')}</Disclaimer>
      </div>
      <div className="sticky bottom-0 mt-auto p-4 bg-gradient-to-t from-paper via-paper to-paper/0 safe-b z-20">
        <Btn className="w-full" icon="shield" onClick={save}>{T('Save to passport', 'Simpan ke pasport')} <span className="text-[11px] font-bold bg-amber-300 text-amber-900 rounded-full px-2 py-0.5 ml-1">+25</span></Btn>
      </div>
    </div>
  );
}
