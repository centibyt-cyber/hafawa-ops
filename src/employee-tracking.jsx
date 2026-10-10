import { cloneElement, useEffect, useId, useRef, useState } from 'react';
import { Users, Plus, Search, Bell, Settings, X, Pencil, Trash2, RefreshCw, FileText, Upload, CheckCircle2, Clock, AlertTriangle, ChevronLeft, Archive, ArchiveRestore, Download } from 'lucide-react';
import { initialTracking, riyadhDate, newEmployee, blankTrack, trackState, employeeStates, summary, addType, employeeFiles, validateEmployee, validDays, sortEmployees, typeRows, trackFiles, renewTrack, archiveEmployee } from './employee-tracking-model.mjs';
import { stateNames, stateDescription, createReport } from './employee-tracking-report-model.mjs';
import { downloadReport } from './employee-tracking-export.mjs';
import { loadTracking, saveTracking, uploadTrackingFile, removeTrackingFiles, downloadTrackingFile, BUCKET } from './employee-tracking-service.mjs';

export function useTrackingStore(sb, enabled) {
  const [row, setRow] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const refresh = async () => {
    if (!sb || !enabled || lock.current) return;
    setError(''); setBusy(true);
    try { setRow(await loadTracking(sb)); } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  useEffect(() => { refresh(); }, [sb, enabled]);
  const commit = async (data, expectedRevision = row?.revision) => {
    if (lock.current || !row) return false;
    lock.current = true; setBusy(true); setError('');
    try { setRow(await saveTracking(sb, data, expectedRevision)); return true; }
    catch (e) { setError(e.message); return false; }
    finally { lock.current = false; setBusy(false); }
  };
  return { row, error, busy, refresh, commit, setError };
}

function useToday() {
  const [today, setToday] = useState(riyadhDate);
  useEffect(() => { const tick = () => setToday(riyadhDate()); const timer = setInterval(tick, 30000); window.addEventListener('focus', tick);
    return () => { clearInterval(timer); window.removeEventListener('focus', tick); }; }, []);
  return today;
}
const word = (ar, en, isAr) => isAr ? ar : en;
const typeName = (type, isAr) => isAr ? type.name : type.nameEn || type.name;
function Badge({ state, isAr, children }) { return <span className={'et-badge et-' + state}>{children || (stateNames[state] || stateNames.empty)[isAr ? 0 : 1]}</span>; }
function Button({ children, primary, danger, ...props }) { return <button type="button" className={'et-btn' + (primary ? ' et-primary' : '') + (danger ? ' et-danger' : '')} {...props}>{children}</button>; }
function Field({ label, children }) { const id = useId(); return <div className="et-field"><label htmlFor={id}>{label}</label>{cloneElement(children, { id })}</div>; }
function Dialog({ title, close, busy, children }) {
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; d.showModal(); return () => d.close(); }, []);
  return <dialog ref={ref} className="et-dialog" onCancel={e => { e.preventDefault(); if (!busy) close(); }}>
    <div className="et-modal-head"><h2>{title}</h2><Button disabled={busy} aria-label="Close / إغلاق" onClick={close}><X size={20} /></Button></div>{children}
  </dialog>;
}
function Photo({ employee, sb }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let alive = true; setUrl('');
    if (employee.photo?.path) sb.storage.from(BUCKET).createSignedUrl(employee.photo.path, 3600).then(({ data }) => { if (alive) setUrl(data?.signedUrl || ''); });
    return () => { alive = false; };
  }, [employee.photo?.path, sb]);
  return <span className="et-avatar">{url ? <img src={url} alt="" onError={() => setUrl('')} /> : employee.name.trim().slice(0, 2) || <Users size={24} />}</span>;
}
function stateText(item, isAr) {
  return stateDescription(item, isAr);
}
function friendlyError(error, isAr) {
  if (error === 'TRACKING_VERSION') return word('البيانات تخص إصدارًا أحدث. حدّث صفحة النظام قبل المتابعة.', 'This data requires a newer version. Refresh the application.', isAr);
  if (error === 'TRACKING_CONFLICT') return word('تغيّرت البيانات من جلسة أخرى. أغلق النموذج وحدّث البيانات، ثم راجع تعديلك وأعد حفظه.', 'Another session changed this data. Close the form, refresh, review your change and save again.', isAr);
  if (error === 'TRACKING_ACCESS') return word('هذا القسم مخصص لمدير النظام. تعذّر الوصول لبيانات المتابعة.', 'Tracking is restricted to the system manager. Access is unavailable.', isAr);
  if (error === 'TRACKING_FILE') return word('اختر صورة JPG أو PNG أو WebP، أو ملف PDF، بحجم لا يتجاوز ٥ ميجابايت.', 'Choose JPG, PNG, WebP or PDF, up to 5 MB.', isAr);
  return word('تعذّر إكمال العملية. لم يتم تأكيد الحفظ؛ تحقق من الاتصال وأعد المحاولة.', 'The operation could not complete. Save is not confirmed; check your connection and retry.', isAr);
}

export function TrackingHomeCard({ store, isAr, go }) {
  const today = useToday();
  if (!store.row) return null;
  const s = summary(store.row.data, today);
  return <button className="et-home-link" onClick={go}><Users size={22} /><span><b>{word('متابعة الموظفين', 'Employee tracking', isAr)}</b><small>{word(`${s.total} موظف · ${s.attention} يحتاج متابعة`, `${s.total} employees · ${s.attention} need attention`, isAr)}</small></span><ChevronLeft size={20} /></button>;
}

export default function EmployeeTracking({ store, sb, isAr, users = [], roster = {} }) {
  const { row, busy, error, commit, refresh } = store;
  const [tab, setTab] = useState('overview'), [filter, setFilter] = useState('all'), [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null), [typeForm, setTypeForm] = useState(null), [notice, setNotice] = useState('');
  const [archive, setArchive] = useState('active'), [selectedType, setSelectedType] = useState(''), [exporting, setExporting] = useState(null), [exportBusy, setExportBusy] = useState(false);
  const [localBusy, setLocalBusy] = useState(false), [formError, setFormError] = useState('');
  const today = useToday(), data = row?.data || initialTracking(), stats = summary(data, today);
  const text = (ar, en) => word(ar, en, isAr);
  const selected = sortEmployees(data.employees.filter(e => {
    if (archive === 'active' ? !!e.archivedAt : !e.archivedAt) return false;
    if (!`${e.name} ${e.number} ${e.job} ${e.department}`.toLowerCase().includes(query.toLowerCase())) return false;
    const states = employeeStates(e, data.types, today).filter(s => !selectedType || s.type.id === selectedType);
    if (selectedType && !states.length) return false;
    if (filter === 'all') return true;
    if (filter === 'attention') return states.some(s => ['soon', 'expired', 'missing'].includes(s.state));
    if (filter === 'ok') return states.some(s => s.state === 'ok') && states.every(s => ['ok','exempt'].includes(s.state));
    if (filter.startsWith('type:')) { const id = filter.slice(5); return states.some(s => s.type.id === id && s.state === (s.type.kind === 'expiry' ? 'soon' : 'missing')); }
    return states.some(s => s.state === filter);
  }), selectedType ? data.types.filter(t => t.id === selectedType) : data.types, today);
  const openEmployee = employee => { store.setError(''); setFormError(''); setEditing({ employee: structuredClone(employee), revision: row.revision, original: employee, staged: [] }); };
  const closeEmployee = async () => {
    if (busy || localBusy) return;
    if ((editing.renewal || JSON.stringify(editing.employee) !== JSON.stringify(editing.original)) && !window.confirm(text('تجاهل التعديلات غير المحفوظة؟', 'Discard unsaved changes?'))) return;
    try { await removeTrackingFiles(sb, editing.staged); } catch { setNotice(text('لم يكتمل تنظيف المرفقات غير المحفوظة.', 'Uncommitted attachment cleanup was incomplete.')); }
    setEditing(null); store.setError('');
  };
  const updateEmployee = patch => setEditing(e => ({ ...e, employee: { ...e.employee, ...patch } }));
  const updateTrack = (id, patch) => setEditing(e => ({ ...e, employee: { ...e.employee, tracks: { ...e.employee.tracks, [id]: { ...e.employee.tracks[id], ...patch } } } }));
  const upload = async (file, trackId, renewal = false) => {
    if (!file) return;
    setLocalBusy(true); setFormError('');
    try {
      const result = await uploadTrackingFile(sb, editing.employee.id, file, !trackId);
      setEditing(e => renewal ? ({ ...e, staged: [...e.staged, result], renewal: { ...e.renewal, files: [...e.renewal.files, result] } }) : ({ ...e, staged: [...e.staged, result], employee: trackId
        ? { ...e.employee, tracks: { ...e.employee.tracks, [trackId]: { ...e.employee.tracks[trackId], files: [...(e.employee.tracks[trackId].files || []), result] } } }
        : { ...e.employee, photo: result } }));
    } catch (e) { setFormError(friendlyError(e.message, isAr)); }
    finally { setLocalBusy(false); }
  };
  const saveEmployee = async event => {
    event.preventDefault(); const employee = editing.employee;
    if (editing.renewal) { setFormError(text('اعتمد التجديد أو ألغِه قبل حفظ الموظف.', 'Apply or cancel the renewal before saving the employee.')); return; }
    const invalid = validateEmployee(employee, data.employees);
    if (invalid) { setFormError(invalid === 'duplicate' ? text('الرقم الوظيفي مستخدم لموظف آخر.', 'Employee number is already in use.') : text('راجع الاسم والتواريخ وعدد أيام التنبيه.', 'Check the name, dates and alert days.')); return; }
    const saved = { ...employee, name: employee.name.trim(), number: employee.number.trim(), updatedAt: new Date().toISOString() };
    const exists = data.employees.some(e => e.id === saved.id);
    if (await commit({ ...data, employees: exists ? data.employees.map(e => e.id === saved.id ? saved : e) : [...data.employees, saved] }, editing.revision)) {
      const retained = new Set(employeeFiles(saved).map(f => f.path));
      const removed = [...employeeFiles(editing.original), ...editing.staged].filter(f => !retained.has(f.path));
      setEditing(null); setNotice(text('تم حفظ ملف الموظف.', 'Employee saved.'));
      try { await removeTrackingFiles(sb, removed); } catch { setNotice(text('حُفظ الموظف، لكن تنظيف بعض المرفقات القديمة لم يكتمل.', 'Employee saved; some old attachments could not be removed.')); }
    }
  };
  const deleteEmployee = async employee => {
    if (!window.confirm(text(`حذف ${employee.name} وتتبّعاته ومرفقاته من قسم المتابعة؟`, `Delete ${employee.name}, their tracking records and attachments?`))) return;
    if (await commit({ ...data, employees: data.employees.filter(e => e.id !== employee.id) })) {
      setNotice(text('تم حذف الموظف من المتابعة.', 'Employee removed from tracking.'));
      try { await removeTrackingFiles(sb, employeeFiles(employee)); } catch { setNotice(text('حُذف الموظف، لكن حذف بعض المرفقات لم يكتمل.', 'Employee deleted; some attachments could not be removed.')); }
    }
  };
  const toggleArchive = async employee => {
    const archived = !employee.archivedAt;
    if (archived && !window.confirm(text(`أرشفة ${employee.name} وإيقاف تنبيهاته مع الاحتفاظ بملفه؟`, `Archive ${employee.name} and stop alerts while keeping the profile?`))) return;
    if (await commit({ ...data, employees: data.employees.map(e => e.id === employee.id ? archiveEmployee(e, archived) : e) })) setNotice(archived ? text('تمت أرشفة الموظف وحفظ سجله.', 'Employee archived; records retained.') : text('تمت استعادة الموظف للمتابعة.', 'Employee restored.'));
  };
  const applyRenewal = () => {
    try {
      const r = editing.renewal, track = renewTrack(editing.employee.tracks[r.typeId], { expiresOn: r.expiresOn, notes: r.notes, files: r.files });
      setEditing(e => ({ ...e, renewal: null, employee: { ...e.employee, tracks: { ...e.employee.tracks, [r.typeId]: track } } }));
      setFormError('');
    } catch { setFormError(text('اختر تاريخ انتهاء صحيحًا أحدث من السابق.', 'Choose a valid expiry date later than the previous one.')); }
  };
  const exportReport = async format => {
    setExportBusy(true); setFormError('');
    try { await downloadReport(createReport(data, exporting.typeId, { filter: exporting.filter, archive: exporting.archive, isAr }), format); setExporting(null); }
    catch { setFormError(text('تعذّر تجهيز التقرير. تحقق من الاتصال وأعد المحاولة.', 'Report could not be generated. Check your connection and retry.')); }
    finally { setExportBusy(false); }
  };
  const openExport = (typeId, format) => { setFormError(''); setExporting({ typeId, format, filter: selectedType === typeId && ['all','soon','expired','missing','ok','exempt'].includes(filter) ? filter : 'all', archive: 'active' }); };
  const ExportButtons = ({ typeId }) => <div className="et-export-actions"><Button onClick={() => openExport(typeId, 'xlsx')}><Download size={15}/>{text('تصدير Excel','Export Excel')}</Button><Button onClick={() => openExport(typeId, 'pdf')}><FileText size={15}/>{text('تصدير PDF','Export PDF')}</Button></div>;
  const saveType = async e => {
    e.preventDefault(); const type = typeForm.type;
    if (!type.name.trim() || (type.kind === 'expiry' && !validDays(type.alertDays))) return;
    if (data.types.some(t => t.id !== type.id && t.name.trim() === type.name.trim())) { setFormError(text('اسم التتبّع موجود مسبقًا.', 'This tracking name already exists.')); return; }
    const nextType = { ...type, name: type.name.trim(), alertDays: Number(type.alertDays ?? 30) };
    let next;
    if (typeForm.isNew) next = addType(data, nextType, typeForm.employeeIds);
    else {
      next = { ...data, types: data.types.map(t => t.id === type.id ? nextType : t) };
      if (nextType.all || typeForm.employeeIds.length) next.employees = next.employees.map(emp => Object.hasOwn(emp.tracks, type.id) || (!nextType.all && !typeForm.employeeIds.includes(emp.id)) ? emp : { ...emp, tracks: { ...emp.tracks, [type.id]: blankTrack() } });
    }
    if (await commit(next, typeForm.revision)) { setTypeForm(null); setNotice(text('تم حفظ التتبّع وإعدادات التنبيه.', 'Tracking and alert settings saved.')); }
  };
  const deleteType = async type => {
    if (!window.confirm(text(`حذف تتبّع «${type.name}» وبياناته ومرفقاته من جميع الموظفين؟`, `Delete “${typeName(type, isAr)}” and its records and attachments for all employees?`))) return;
    const files = data.employees.flatMap(e => trackFiles(e.tracks[type.id]));
    const next = { ...data, types: data.types.filter(t => t.id !== type.id), employees: data.employees.map(e => { const tracks = { ...e.tracks }; delete tracks[type.id]; return { ...e, tracks }; }) };
    if (await commit(next)) { if (selectedType === type.id) setSelectedType(''); try { await removeTrackingFiles(sb, files); } catch { setNotice(text('حُذف التتبّع؛ تعذّر تنظيف بعض المرفقات.', 'Tracking deleted; some attachment cleanup failed.')); } }
  };
  const setType = patch => setTypeForm(f => ({ ...f, type: { ...f.type, ...patch } }));
  const pickFilter = (value, typeId = '') => { setFilter(value); setSelectedType(typeId); setArchive('active'); setQuery(''); setTab('employees'); };
  const candidates = [...users.map(u => ({ name: u.n, number: u.prn || '', job: u.r || '' })), ...(roster.names || []).filter(n => !users.some(u => u.n === n)).map(name => ({ name, number: '', job: '' }))].filter(u => u.name);
  const download = async file => { try { await downloadTrackingFile(sb, file); } catch (e) { setFormError(friendlyError(e.message, isAr)); } };
  return <section className="et" dir={isAr ? 'rtl' : 'ltr'}>
    <div className="et-heading"><div><span className="et-eyebrow">{text('حفاوة / فريق العمل', 'HAFAWA / TEAM')}</span><h1><Users size={28}/>{text('متابعة الموظفين','Employee tracking')}</h1><p>{text('كل مستند، موعد، وتجديد في مكان واحد.','Every document, due date and renewal in one place.')}</p></div>
      <div className="et-actions"><Button disabled={busy || !!editing || !!typeForm} onClick={refresh} aria-label={text('تحديث البيانات','Refresh data')}><RefreshCw size={17}/></Button><Button primary disabled={!row || busy} onClick={() => openEmployee(newEmployee(data.types))}><Plus size={18}/>{text('إضافة موظف','Add employee')}</Button></div>
    </div>
    <div className="et-tabs" role="tablist" aria-label={text('شاشات المتابعة','Tracking views')}>{[['overview','لوحة المتابعة','Overview',Bell],['employees','الموظفون','Employees',Users],['settings','التتبّعات والتنبيهات','Tracking & alerts',Settings]].map(([id,ar,en,Icon]) => <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}><Icon size={17}/>{text(ar,en)}</button>)}</div>
    {error && <div role="alert" className="et-message et-error">{friendlyError(error,isAr)} <Button disabled={busy || !!editing || !!typeForm} onClick={refresh}>{text('تحديث البيانات','Refresh data')}</Button></div>}
    {notice && <div role="status" className="et-message">{notice}<button aria-label={text('إغلاق الرسالة','Dismiss')} onClick={() => setNotice('')}><X size={16}/></button></div>}
    {!row ? <div className="et-empty">{busy ? text('جارٍ تحميل بيانات المتابعة…','Loading tracking data…') : text('لم يتم تحميل بيانات المتابعة.','Tracking data is unavailable.')}</div> : <>
      {tab === 'overview' && <>
        <div className="et-summary">{[['all',stats.total,'الموظفون النشطون','Active employees',Users],['expired',stats.expired,'لديهم مستند منتهي','With expired documents',AlertTriangle],['soon',stats.soon,'قريب الانتهاء','Expiring soon',Clock],['missing',stats.missing,'لديهم نواقص','With missing items',FileText]].map(([id,count,ar,en,Icon]) => <button key={id} onClick={() => pickFilter(id)}><Icon size={22}/><b className={id === 'expired' ? 'et-red' : ''}>{count}</b><span>{text(ar,en)}</span></button>)}</div>
        <div className="et-section-title"><h2>{text('حسب التتبّع','By tracking type')}</h2><span>{text('العدد = موظفون نشطون','Counts = active employees')}</span></div>
        <div className="et-type-counts">{data.types.filter(t => t.dashboard).map(type => <article className="et-type-card" key={type.id}>
          <div className="et-section-title"><h3>{typeName(type,isAr)}</h3><Clock size={20}/></div>
          <div className="et-type-metrics">{['expired','soon','missing'].map(state => <button key={state} onClick={() => pickFilter(state,type.id)} aria-label={`${typeName(type,isAr)}: ${stateNames[state][isAr ? 0 : 1]}`}><b>{stats.byType[type.id][state]}</b><span>{stateNames[state][isAr ? 0 : 1]}</span></button>)}</div>
          <p className="et-help">{type.kind === 'expiry' ? text(`التنبيه الافتراضي: ${type.alertDays} يومًا`,`Default alert: ${type.alertDays} days`) : text('تتبّع بالحالة','Status tracking')}</p>
          <Button onClick={() => pickFilter('all',type.id)}>{text('عرض القسم','View section')}<ChevronLeft size={15}/></Button><ExportButtons typeId={type.id}/>
        </article>)}</div>
        <div className="et-section-title"><h2>{text('يحتاج متابعة','Needs attention')} <span className="et-count">{stats.attention}</span></h2><Button onClick={() => pickFilter('attention')}>{text('عرض الموظفين','View employees')}</Button></div>
        <div className="et-alerts">{stats.alerts.slice(0,8).map(item => <button key={item.employee.id + item.type.id} onClick={() => openEmployee(item.employee)}><span className={'et-alert-icon et-' + item.state}><Bell size={18}/></span><span><b>{item.employee.name}</b><small>{typeName(item.type,isAr)} · {stateText(item,isAr)}</small></span><Badge state={item.state} isAr={isAr}/></button>)}{!stats.alerts.length && <div className="et-empty"><CheckCircle2 size={30}/><h3>{stats.total ? text('كل التتبّعات محدثة','Tracking is up to date') : text('ابدأ بأول موظف','Add your first employee')}</h3><p>{text('تظهر التنبيهات حسب المدد التي تحددها.','Alerts use the lead times you choose.')}</p></div>}</div>
      </>}
      {tab === 'employees' && <>
        <div className="et-section-title"><h2>{selectedType ? typeName(data.types.find(t => t.id === selectedType) || {name:''},isAr) : text('ملفات الموظفين','Employee profiles')}</h2><Button primary disabled={busy} onClick={() => { const employee = newEmployee(data.types); if (selectedType) employee.tracks[selectedType] = blankTrack(); openEmployee(employee); }}><Plus size={17}/>{text('إضافة موظف لهذا القسم','Add employee to this section')}</Button></div>
        <div className="et-toolbar"><label className="et-search"><Search size={19}/><input aria-label={text('البحث عن موظف','Search employees')} value={query} onChange={e => setQuery(e.target.value)} placeholder={text('ابحث بالاسم أو الرقم الوظيفي','Search name or employee number')}/></label>
          <select aria-label={text('قسم التتبّع','Tracking section')} value={selectedType} onChange={e => setSelectedType(e.target.value)}><option value="">{text('كل التتبّعات','All tracking types')}</option>{data.types.map(t => <option key={t.id} value={t.id}>{typeName(t,isAr)}</option>)}</select>
          <select aria-label={text('تصفية الموظفين','Filter employees')} value={filter} onChange={e => setFilter(e.target.value)}>{[['all','الكل','All'],['attention','يحتاج متابعة','Needs attention'],['soon','قريب الانتهاء','Expiring soon'],['expired','منتهي','Expired'],['missing','نواقص','Missing'],['ok','مكتمل','Complete'],['exempt','غير مطلوب','Not required']].map(([id,ar,en]) => <option key={id} value={id}>{text(ar,en)}</option>)}</select>
          <select aria-label={text('حالة الموظفين','Employee scope')} value={archive} onChange={e => setArchive(e.target.value)}><option value="active">{text('النشطون','Active')}</option><option value="archived">{text(`المؤرشفون (${stats.archived})`,`Archived (${stats.archived})`)}</option></select>
        </div>
        <div className="et-section-title"><p className="et-result-count">{text(`${selected.length} موظف · المنتهي ثم الأقرب للانتهاء`,`${selected.length} employees · overdue first, then nearest expiry`)}</p>{selectedType && <ExportButtons typeId={selectedType}/>}</div>
        <div className="et-employee-grid">{selected.map(employee => { const states = employeeStates(employee,data.types,today).filter(s => !selectedType || s.type.id === selectedType), state = ['expired','soon','missing','ok','exempt'].find(s => states.some(x => x.state === s)) || 'empty'; return <article className="et-employee-card" key={employee.id}>
          <button className="et-employee-open" onClick={() => openEmployee(employee)}><div className="et-employee-top"><Photo employee={employee} sb={sb}/>{employee.archivedAt ? <span className="et-badge et-exempt">{text('مؤرشف','Archived')}</span> : <Badge state={state} isAr={isAr}/>}</div><h3>{employee.name}</h3><p>{[employee.number,employee.job,employee.department].filter(Boolean).join(' · ') || '—'}</p><div className="et-mini-tracks">{states.map(s => <div key={s.type.id}><span>{typeName(s.type,isAr)}</span><Badge state={s.state} isAr={isAr}>{stateText(s,isAr)}</Badge></div>)}</div></button>
          <div className="et-card-footer"><Button onClick={() => openEmployee(employee)}><Pencil size={15}/>{text('فتح الملف','Open profile')}</Button><Button disabled={busy} aria-label={text(`${employee.archivedAt ? 'استعادة' : 'أرشفة'} ${employee.name}`,`${employee.archivedAt ? 'Restore' : 'Archive'} ${employee.name}`)} onClick={() => toggleArchive(employee)}>{employee.archivedAt ? <ArchiveRestore size={16}/> : <Archive size={16}/>}</Button>{employee.archivedAt && <Button danger disabled={busy} aria-label={text(`حذف نهائي ${employee.name}`,`Permanently delete ${employee.name}`)} onClick={() => deleteEmployee(employee)}><Trash2 size={16}/></Button>}</div>
        </article>; })}</div>
        {!selected.length && <div className="et-empty"><Users size={32}/><h3>{text('لا يوجد موظفون بهذه الخيارات','No matching employees')}</h3></div>}
      </>}
      {tab === 'settings' && <>
        <div className="et-section-title"><div><h2>{text('التتبّعات وأيام التنبيه','Tracking types and alert days')}</h2><p>{text('أيام التنبيه قابلة للتخصيص داخل ملف الموظف.','Alert days can be overridden in an employee profile.')}</p></div><Button primary onClick={() => { setFormError(''); setTypeForm({ isNew:true, revision:row.revision, employeeIds:[], type:{ id:crypto.randomUUID(), name:'', nameEn:'', kind:'expiry', alertDays:30, labels:'possession', all:true, dashboard:true } }); }}><Plus size={17}/>{text('إضافة تتبّع','Add tracking')}</Button></div>
        <div className="et-settings-grid">{data.types.map(type => <article className="et-setting-card" key={type.id}><div className="et-section-title"><h3>{typeName(type,isAr)}</h3>{type.kind === 'expiry' ? <Clock size={20}/> : <CheckCircle2 size={20}/>}</div><p>{type.kind === 'expiry' ? text(`التنبيه قبل الانتهاء بـ ${type.alertDays} يومًا`,`Alert ${type.alertDays} days before expiry`) : text('تتبّع بالحالة','Status tracking')}</p><small>{type.all ? text('لجميع الموظفين الحاليين والجدد','All current and new employees') : text('لموظفين تختارهم','Selected employees')}</small><div className="et-card-footer"><Button disabled={busy} onClick={() => { setFormError(''); setTypeForm({ isNew:false, type:structuredClone(type), revision:row.revision, employeeIds:data.employees.filter(e => Object.hasOwn(e.tracks,type.id)).map(e => e.id) }); }}><Settings size={16}/>{text('تعديل','Edit')}</Button><Button onClick={() => pickFilter('all',type.id)}>{text('عرض القسم','View section')}</Button><Button danger disabled={busy} onClick={() => deleteType(type)} aria-label={text(`حذف تتبّع ${type.name}`,`Delete tracking ${typeName(type,isAr)}`)}><Trash2 size={16}/></Button></div><ExportButtons typeId={type.id}/></article>)}</div>
        <p className="et-help">{text('التاريخ ميلادي، والأيام تُحسب بتوقيت الرياض. مدة التنبيه الخاصة بالموظف تتقدّم على الإعداد العام.','Gregorian dates and Riyadh calendar days. Employee alert days override the default.')}</p>
      </>}
    </>}
    {editing && <Dialog title={editing.employee.name || text('إضافة موظف','Add employee')} close={closeEmployee} busy={busy || localBusy}><form onSubmit={saveEmployee}><fieldset disabled={busy || localBusy}><div className="et-modal-body">
      <div className="et-photo-row"><Photo employee={editing.employee} sb={sb} /><label className="et-btn"><Upload size={16} />{text('صورة الموظف','Employee photo')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }} /></label>{editing.employee.photo && <Button danger onClick={() => updateEmployee({ photo: null })}>{text('إزالة الصورة','Remove photo')}</Button>}</div>
      {!data.employees.some(e => e.id === editing.employee.id) && candidates.length > 0 && <Field label={text('اختيار من موظفي النظام (اختياري)','Choose an existing staff member (optional)')}><select defaultValue="" onChange={e => { if (e.target.value !== '') updateEmployee(candidates[Number(e.target.value)]); }}><option value="">{text('أو أدخل البيانات يدويًا','Or enter details manually')}</option>{candidates.map((c,i) => <option key={i} value={i}>{c.name}{c.number ? ' · '+c.number : ''}</option>)}</select></Field>}
      <div className="et-form-grid"><Field label={text('اسم الموظف *','Employee name *')}><input required maxLength={120} value={editing.employee.name} onChange={e => updateEmployee({ name: e.target.value })} /></Field><Field label={text('الرقم الوظيفي','Employee number')}><input maxLength={50} value={editing.employee.number} onChange={e => updateEmployee({ number: e.target.value })} /></Field><Field label={text('المسمى الوظيفي','Job title')}><input maxLength={100} value={editing.employee.job} onChange={e => updateEmployee({ job: e.target.value })} /></Field><Field label={text('القسم','Department')}><input maxLength={100} value={editing.employee.department} onChange={e => updateEmployee({ department: e.target.value })} /></Field></div>
      <div className="et-section-title"><h3>{text('تتبّعات الموظف','Employee tracking')}</h3><select aria-label={text('إضافة تتبّع للموظف','Assign tracking to employee')} value="" onChange={e => { if (e.target.value) updateEmployee({ tracks: { ...editing.employee.tracks, [e.target.value]: blankTrack() } }); }}><option value="">{text('+ إضافة تتبّع','+ Assign tracking')}</option>{data.types.filter(t => !Object.hasOwn(editing.employee.tracks,t.id)).map(t => <option key={t.id} value={t.id}>{typeName(t,isAr)}</option>)}</select></div>
      {data.types.filter(t => Object.hasOwn(editing.employee.tracks,t.id)).map(type => {
        const track = editing.employee.tracks[type.id], status = trackState(type,track,today), renewing = editing.renewal?.typeId === type.id;
        return <article className="et-track-editor" key={type.id}>
          <div className="et-section-title"><h3>{typeName(type,isAr)}</h3><Badge state={status.state} isAr={isAr}/><Button danger disabled={!!editing.renewal} aria-label={text(`إزالة ${type.name} من الموظف`,`Remove ${typeName(type,isAr)} from employee`)} onClick={() => { if (window.confirm(text('إزالة هذا التتبّع ومرفقاته وسجل تجديداته من الموظف عند الحفظ؟','Remove this tracking, its attachments and renewal history when saved?'))) { const tracks = {...editing.employee.tracks}; delete tracks[type.id]; updateEmployee({tracks}); } }}><X size={16}/></Button></div>
          <label className="et-check"><input type="checkbox" checked={track.required === false} disabled={!!editing.renewal} onChange={e => updateTrack(type.id,{required:!e.target.checked})}/>{text('غير مطلوب لهذا الموظف','Not required for this employee')}</label>
          <p className="et-help">{stateText({type,track,...status},isAr)}</p>
          <fieldset disabled={track.required === false || !!editing.renewal}>
            <Field label={text('الحالة','Status')}><select value={track.status == null ? '' : String(track.status)} onChange={e => updateTrack(type.id,{status:e.target.value === '' ? null : e.target.value === 'true'})}><option value="">{text('لم تُدخل البيانات','Not entered')}</option><option value="true">{type.labels === 'completion' ? text('تم الإجراء','Completed') : text('المستند موجود','Document present')}</option><option value="false">{type.labels === 'completion' ? text('لم يتم الإجراء','Not completed') : text('لا يوجد مستند','No document')}</option></select></Field>
            {type.kind === 'expiry' && <><div className="et-form-grid"><Field label={text('تاريخ الانتهاء (ميلادي)','Expiry date (Gregorian)')}><input type="date" min="1900-01-01" max="9999-12-31" value={track.expiresOn || ''} onChange={e => updateTrack(type.id,{ expiresOn:e.target.value, ...(!type.statusRequired && track.status == null && e.target.value ? {status:true} : {}) })}/></Field><Field label={text('التنبيه قبل الانتهاء — أيام','Alert before expiry — days')}><input type="number" min="0" max="3650" step="1" placeholder={String(type.alertDays)} value={track.alertDays ?? ''} onChange={e => updateTrack(type.id,{alertDays:e.target.value === '' ? null : e.target.value})}/></Field></div>
              <p className="et-help">{track.alertDays == null ? text(`الإعداد العام: ${type.alertDays} يومًا. اكتب عددًا لتخصيصه.`,`Default: ${type.alertDays} days. Enter a number to override.`) : text('تنبيه مخصص. أفرغ الحقل لاستخدام الإعداد العام.','Custom alert. Clear the field to use the default.')}{status.alertOn && <><br/>{text(`موعد التنبيه: ${status.alertOn}`,`Alert starts: ${status.alertOn}`)}</>}</p></>}
          </fieldset>
          {type.kind === 'expiry' && !renewing && <Button disabled={!!editing.renewal || track.required === false} onClick={() => { setFormError(''); setEditing(e => ({...e,renewal:{typeId:type.id,expiresOn:'',notes:'',files:[]}})); }}><RefreshCw size={16}/>{text('تجديد','Renew')}</Button>}
          {renewing && <div className="et-renewal"><h4>{text('تجديد المستند','Renew document')}</h4><p>{text('سيبقى التاريخ والمستند السابقان في سجل التجديدات. يُحفظ التجديد عند حفظ الموظف.','Previous expiry and files remain in history. Save the employee to commit this renewal.')}</p>
            <Field label={text('تاريخ الانتهاء الجديد','New expiry date')}><input type="date" min="1900-01-01" max="9999-12-31" value={editing.renewal.expiresOn} onChange={e => setEditing(x => ({...x,renewal:{...x.renewal,expiresOn:e.target.value}}))}/></Field>
            <Field label={text('ملاحظات التجديد','Renewal notes')}><textarea rows={2} maxLength={2000} value={editing.renewal.notes} onChange={e => setEditing(x => ({...x,renewal:{...x.renewal,notes:e.target.value}}))}/></Field>
            <label className="et-btn"><Upload size={16}/>{text('إرفاق المستند الجديد','Attach new document')}<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => {upload(e.target.files?.[0],type.id,true);e.target.value='';}}/></label>
            {editing.renewal.files.map(file => <div className="et-files" key={file.path}><span>{file.name}</span><Button aria-label={text('إزالة المستند الجديد','Remove new document')} onClick={() => setEditing(e => ({...e,renewal:{...e.renewal,files:e.renewal.files.filter(f => f.path !== file.path)}}))}><X size={15}/></Button></div>)}
            <div className="et-actions"><Button primary onClick={applyRenewal}>{text('اعتماد التجديد','Apply renewal')}</Button><Button onClick={() => {setEditing(e => ({...e,renewal:null}));setFormError('');}}>{text('إلغاء التجديد','Cancel renewal')}</Button></div>
          </div>}
          <Field label={text('ملاحظات المتابعة','Follow-up notes')}><textarea rows={2} maxLength={2000} value={track.notes || ''} onChange={e => updateTrack(type.id,{notes:e.target.value})}/></Field>
          <div className="et-files">{(track.files || []).map(file => <div key={file.path}><Button onClick={() => download(file)}><FileText size={15}/>{file.name}</Button><Button danger disabled={!!editing.renewal} aria-label={text('إزالة المرفق','Remove attachment')} onClick={() => updateTrack(type.id,{files:track.files.filter(f => f.path !== file.path)})}><X size={15}/></Button></div>)}{!editing.renewal && <label className="et-btn"><Upload size={16}/>{text('إرفاق مستند','Attach document')}<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => {upload(e.target.files?.[0],type.id);e.target.value='';}}/></label>}</div>
          {(track.history || []).length > 0 && <details className="et-history"><summary>{text(`سجل التجديدات (${track.history.length})`,`Renewal history (${track.history.length})`)}</summary>{[...track.history].reverse().map((entry,index) => <article key={entry.id || index}><b>{text(`تاريخ الانتهاء السابق: ${entry.expiresOn || 'غير مدخل'}`,`Previous expiry: ${entry.expiresOn || 'Not entered'}`)}</b><small>{text('تم التجديد: ','Renewed: ')}{new Intl.DateTimeFormat(isAr ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB',{timeZone:'Asia/Riyadh',dateStyle:'medium',timeStyle:'short'}).format(new Date(entry.renewedAt))}</small>{entry.notes && <p>{entry.notes}</p>}<div className="et-files">{(entry.files || []).map(file => <Button key={file.path} onClick={() => download(file)}><FileText size={15}/>{file.name}</Button>)}</div></article>)}</details>}
        </article>;
      })}
      <p className="et-help">{text('المرفقات: PDF أو صور، بحد أقصى ٥ ميجابايت للملف.','Attachments: PDF or images, up to 5 MB per file.')}</p>
    </div></fieldset>{(formError || error) && <div className="et-message et-error" role="alert">{formError || friendlyError(error,isAr)}</div>}<div className="et-modal-footer"><Button disabled={busy || localBusy} onClick={closeEmployee}>{text('إلغاء','Cancel')}</Button><button type="submit" className="et-btn et-primary" disabled={busy || localBusy}>{busy || localBusy ? text('جارٍ الحفظ…','Saving…') : text('حفظ الموظف','Save employee')}</button></div></form></Dialog>}
    {typeForm && <Dialog title={typeForm.isNew ? text('إضافة تتبّع','Add tracking') : text('إعدادات التتبّع','Tracking settings')} busy={busy} close={() => { setTypeForm(null); store.setError(''); }}><form onSubmit={saveType}><fieldset disabled={busy}><div className="et-modal-body"><div className="et-form-grid"><Field label={text('اسم التتبّع *','Tracking name *')}><input required maxLength={80} value={typeForm.type.name} onChange={e => setType({ name:e.target.value })} /></Field><Field label={text('الاسم بالإنجليزية (اختياري)','English name (optional)')}><input maxLength={80} value={typeForm.type.nameEn} onChange={e => setType({ nameEn:e.target.value })} /></Field></div><Field label={text('نوع التتبّع','Tracking kind')}><select disabled={!typeForm.isNew} value={typeForm.type.kind} onChange={e => setType({ kind:e.target.value })}><option value="expiry">{text('تاريخ انتهاء وتنبيه','Expiry date and alert')}</option><option value="status">{text('حالة: نعم / لا','Status: yes / no')}</option></select></Field>{typeForm.type.kind === 'expiry' ? <Field label={text('التنبيه قبل الانتهاء — أيام *','Alert before expiry — days *')}><input required type="number" min="0" max="3650" step="1" value={typeForm.type.alertDays} onChange={e => setType({ alertDays:e.target.value })} /></Field> : <Field label={text('صياغة الحالة','Status labels')}><select value={typeForm.type.labels} onChange={e => setType({ labels:e.target.value })}><option value="completion">{text('تم / لم يتم','Done / not done')}</option><option value="possession">{text('موجودة / غير موجودة','Present / missing')}</option></select></Field>}
      <label className="et-check"><input type="checkbox" checked={typeForm.type.all} onChange={e => setType({ all:e.target.checked })} />{text('تطبيق على جميع الموظفين الحاليين والجدد','Apply to all current and new employees')}</label><label className="et-check"><input type="checkbox" checked={typeForm.type.dashboard} onChange={e => setType({ dashboard:e.target.checked })} />{text('إظهار عدّاد في لوحة المتابعة','Show a counter on the overview')}</label>
      {!typeForm.type.all && <div className="et-pick-people"><p>{text('اختر الموظفين، أو أضف التتبّع لاحقًا من ملفاتهم.','Choose employees, or assign this tracking from their profiles later.')}</p>{data.employees.map(emp => <label className="et-check" key={emp.id}><input type="checkbox" checked={typeForm.employeeIds.includes(emp.id)} disabled={!typeForm.isNew && Object.hasOwn(emp.tracks,typeForm.type.id)} onChange={e => setTypeForm(f => ({ ...f, employeeIds:e.target.checked ? [...f.employeeIds,emp.id] : f.employeeIds.filter(id => id !== emp.id) }))} />{emp.name}</label>)}</div>}
      {!typeForm.isNew && <p className="et-help">{text('إلغاء التعميم يوقف إضافته للموظفين الجدد فقط. تبقى تتبّعات الموظفين الحالية ويمكن إزالتها من ملفاتهم.','Turning off automatic assignment affects new employees only. Existing assignments remain and can be removed from their profiles.')}</p>}
    </div></fieldset>{(formError || error) && <div role="alert" className="et-message et-error">{formError || friendlyError(error,isAr)}</div>}<div className="et-modal-footer"><Button disabled={busy} onClick={() => { setTypeForm(null); store.setError(''); }}>{text('إلغاء','Cancel')}</Button><button className="et-btn et-primary" type="submit" disabled={busy}>{text('حفظ التتبّع','Save tracking')}</button></div></form></Dialog>}
    {exporting && <Dialog title={text('تصدير تقرير التتبّع','Export tracking report')} busy={exportBusy} close={() => setExporting(null)}><div className="et-modal-body"><fieldset disabled={exportBusy}>
      <h3>{typeName(data.types.find(t => t.id === exporting.typeId),isAr)}</h3>
      <Field label={text('الموظفون في التقرير','Employees in report')}><select value={exporting.filter} onChange={e => setExporting(x => ({...x,filter:e.target.value}))}>{[['all','جميع الموظفين','All employees'],['expired','المنتهي','Expired'],['soon','القريب من الانتهاء','Expiring soon'],['missing','ناقص البيانات','Missing data'],['ok','المكتمل','Complete'],['exempt','غير مطلوب','Not required']].map(([id,ar,en]) => <option key={id} value={id}>{text(ar,en)}</option>)}</select></Field>
      <Field label={text('نطاق التقرير','Report scope')}><select value={exporting.archive} onChange={e => setExporting(x => ({...x,archive:e.target.value}))}><option value="active">{text('النشطون فقط','Active only')}</option><option value="archived">{text('المؤرشفون فقط','Archived only')}</option><option value="all">{text('النشطون والمؤرشفون','Active and archived')}</option></select></Field>
      <p className="et-report-preview">{text(`عدد الموظفين في الملف: ${typeRows(data,exporting.typeId,today,{filter:exporting.filter,archive:exporting.archive}).length}`,`Employees in file: ${typeRows(data,exporting.typeId,today,{filter:exporting.filter,archive:exporting.archive}).length}`)}</p>
      <p className="et-help">{text('ملخص العدّادات يخص الصفوف المصدّرة فقط. التقرير يشمل البيانات المكتوبة دون المرفقات.','Counts describe only the exported rows. Reports include written data, not attachments.')}</p>
    </fieldset></div>{formError && <div role="alert" className="et-message et-error">{formError}</div>}<div className="et-modal-footer"><Button disabled={exportBusy} onClick={() => setExporting(null)}>{text('إلغاء','Cancel')}</Button><Button primary disabled={exportBusy} onClick={() => exportReport(exporting.format)}>{exportBusy ? text('جارٍ تجهيز الملف…','Preparing file…') : text(`تنزيل ${exporting.format === 'pdf' ? 'PDF' : 'Excel'}`,`Download ${exporting.format === 'pdf' ? 'PDF' : 'Excel'}`)}</Button></div></Dialog>}
  </section>;
}
