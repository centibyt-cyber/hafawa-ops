export const initialTracking = () => ({
  schemaVersion: 2,
  types: [
    { id: 'iqama', name: 'الإقامة', nameEn: 'Iqama', kind: 'expiry', alertDays: 30, all: true, dashboard: true },
    { id: 'run-pass', name: 'الرون باس', nameEn: 'Run pass', kind: 'expiry', alertDays: 10, all: true, dashboard: true },
    { id: 'municipal', name: 'البطاقة الصحية / البلدية', nameEn: 'Health / municipal card', kind: 'expiry', labels: 'possession', statusRequired: true, alertDays: 30, all: true, dashboard: true },
    { id: 'analysis', name: 'التحليل الطبي', nameEn: 'Medical test', kind: 'expiry', labels: 'completion', statusRequired: true, alertDays: 30, all: true, dashboard: true },
  ],
  employees: [],
});

// Upgrade in memory; write only after an explicit, revision-checked user save.
export function normalizeTracking(source) {
  if (Number(source.schemaVersion || 1) > 2) throw new Error('TRACKING_VERSION');
  const legacy = Number(source.schemaVersion || 1) < 2;
  return { ...source, schemaVersion: 2, types: source.types.map(type => {
    if (legacy && ['municipal', 'analysis'].includes(type.id)) {
      const defaults = initialTracking().types.find(t => t.id === type.id);
      return { ...type, kind: 'expiry', statusRequired: true, labels: type.labels || defaults.labels,
        name: ['بطاقة البلدية','التحليل'].includes(type.name) ? defaults.name : type.name,
        alertDays: validDays(type.alertDays) ? Number(type.alertDays) : 30 };
    }
    return { ...type };
  }), employees: source.employees.map(employee => ({ ...employee, archivedAt: employee.archivedAt || null,
    tracks: Object.fromEntries(Object.entries(employee.tracks || {}).map(([id, track]) => [id, { ...blankTrack(), ...track, history: track.history || [] }])) })) };
}

export function riyadhDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function dayNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const n = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === value ? n / 86400000 : null;
}

export const validDays = value => value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= 3650;
export const blankTrack = () => ({ expiresOn: '', status: null, required: true, alertDays: null, notes: '', files: [], history: [] });
export const newEmployee = (types, extra = {}) => ({ id: crypto.randomUUID(), name: '', number: '', job: '', department: '', photo: null,
  tracks: Object.fromEntries(types.filter(t => t.all).map(t => [t.id, blankTrack()])), ...extra });

export function trackState(type, track, today = riyadhDate()) {
  if (!track) return { state: 'unassigned', days: null };
  if (track.required === false) return { state: 'exempt', days: null };
  if (track.status === false) return { state: 'missing', reason: type.labels === 'completion' ? 'not_done' : 'absent', days: null };
  if (type.kind === 'status') return { state: track.status === true ? 'ok' : 'missing', reason: track.status === true ? null : 'unrecorded', days: null };
  const expiry = dayNumber(track.expiresOn), current = dayNumber(today);
  if (type.statusRequired && track.status !== true) return { state: 'missing', reason: 'unrecorded', missingDate: expiry === null, days: null };
  if (expiry === null || current === null) return { state: 'missing', reason: 'date', days: null };
  const days = expiry - current;
  const threshold = track.alertDays == null ? Number(type.alertDays ?? 30) : Number(track.alertDays);
  return { state: days < 0 ? 'expired' : days <= threshold ? 'soon' : 'ok', days, threshold,
    alertOn: new Date((expiry - threshold) * 86400000).toISOString().slice(0, 10) };
}

export function employeeStates(employee, types, today) {
  return types.filter(t => Object.hasOwn(employee.tracks || {}, t.id)).map(type => ({ type, track: employee.tracks[type.id], ...trackState(type, employee.tracks[type.id], today) }));
}

export const stateOrder = { expired: 0, soon: 1, missing: 2, ok: 3, exempt: 4, unassigned: 5 };
export function compareStates(a, b) { return stateOrder[a.state] - stateOrder[b.state] || ((a.days ?? Infinity) - (b.days ?? Infinity)) || 0; }
export function sortEmployees(employees, types, today) {
  const ranked = employees.map(employee => ({ employee, first: employeeStates(employee, types, today).sort(compareStates)[0] || { state: 'unassigned' } }));
  return ranked.sort((a, b) => compareStates(a.first, b.first) || a.employee.name.localeCompare(b.employee.name, 'ar')).map(e => e.employee);
}

export function typeRows(data, typeId, today = riyadhDate(), { filter = 'all', archive = 'active', query = '' } = {}) {
  const type = data.types.find(t => t.id === typeId);
  if (!type) return [];
  return data.employees.filter(e => (archive === 'all' || (archive === 'archived' ? !!e.archivedAt : !e.archivedAt)) && Object.hasOwn(e.tracks, typeId))
    .filter(e => `${e.name} ${e.number} ${e.job} ${e.department}`.toLowerCase().includes(query.toLowerCase()))
    .map(employee => ({ employee, type, track: employee.tracks[typeId], ...trackState(type, employee.tracks[typeId], today) }))
    .filter(row => filter === 'all' || row.state === filter)
    .sort((a, b) => compareStates(a, b) || a.employee.name.localeCompare(b.employee.name, 'ar'));
}
export function countRows(rows) {
  const counts = { total: rows.length, expired: 0, soon: 0, missing: 0, ok: 0, exempt: 0 };
  for (const row of rows) if (Object.hasOwn(counts, row.state)) counts[row.state]++;
  return counts;
}

export function summary(data, today = riyadhDate()) {
  const employees = data.employees.filter(e => !e.archivedAt).map(employee => ({ employee, states: employeeStates(employee, data.types, today) }));
  const count = state => employees.filter(e => e.states.some(t => t.state === state)).length;
  return {
    total: employees.length, archived: data.employees.length - employees.length, expired: count('expired'), soon: count('soon'), missing: count('missing'),
    attention: employees.filter(e => e.states.some(t => ['expired', 'soon', 'missing'].includes(t.state))).length,
    types: Object.fromEntries(data.types.map(type => [type.id, employees.filter(e => e.states.some(t => t.type.id === type.id && t.state === (type.kind === 'expiry' ? 'soon' : 'missing'))).length])),
    byType: Object.fromEntries(data.types.map(type => [type.id, countRows(typeRows(data, type.id, today))])),
    alerts: employees.flatMap(({ employee, states }) => states.filter(s => ['expired', 'soon', 'missing'].includes(s.state)).map(s => ({ employee, ...s }))).sort(compareStates),
  };
}

export function addType(data, type, employeeIds = []) {
  return { ...data, types: [...data.types, type], employees: data.employees.map(e => type.all || employeeIds.includes(e.id)
    ? { ...e, tracks: { ...e.tracks, [type.id]: blankTrack() } } : e) };
}

export const trackFiles = track => [...(track?.files || []), ...(track?.history || []).flatMap(h => h.files || [])];
export const employeeFiles = employee => [employee.photo, ...Object.values(employee.tracks).flatMap(trackFiles)].filter(Boolean);

export function renewTrack(track, replacement, now = new Date().toISOString()) {
  if (dayNumber(replacement.expiresOn) === null || (track.expiresOn && dayNumber(replacement.expiresOn) <= dayNumber(track.expiresOn))) throw new Error('RENEWAL_DATE');
  const { history = [], ...previous } = structuredClone(track);
  return { ...track, ...replacement, required: true, status: true,
    history: [...history, { ...previous, id: crypto.randomUUID(), renewedAt: now }], renewedAt: now };
}

export function archiveEmployee(employee, archived, now = new Date().toISOString()) {
  return { ...employee, archivedAt: archived ? now : null, updatedAt: now };
}

export function validateEmployee(employee, others) {
  if (!employee.name.trim()) return 'name';
  if (employee.number.trim() && others.some(e => e.id !== employee.id && e.number.trim().toLowerCase() === employee.number.trim().toLowerCase())) return 'duplicate';
  for (const track of Object.values(employee.tracks)) {
    if (track.expiresOn && dayNumber(track.expiresOn) === null) return 'date';
    if (track.alertDays != null && !validDays(track.alertDays)) return 'days';
  }
  return null;
}
