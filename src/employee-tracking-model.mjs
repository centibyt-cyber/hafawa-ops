export const initialTracking = () => ({
  schemaVersion: 1,
  types: [
    { id: 'iqama', name: 'الإقامة', nameEn: 'Iqama', kind: 'expiry', alertDays: 30, all: true, dashboard: true },
    { id: 'run-pass', name: 'الرون باس', nameEn: 'Run pass', kind: 'expiry', alertDays: 10, all: true, dashboard: true },
    { id: 'municipal', name: 'بطاقة البلدية', nameEn: 'Municipal card', kind: 'status', labels: 'possession', all: true, dashboard: true },
    { id: 'analysis', name: 'التحليل', nameEn: 'Medical test', kind: 'status', labels: 'completion', all: true, dashboard: true },
  ],
  employees: [],
});

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
export const blankTrack = () => ({ expiresOn: '', status: null, alertDays: null, notes: '', files: [] });
export const newEmployee = (types, extra = {}) => ({ id: crypto.randomUUID(), name: '', number: '', job: '', department: '', photo: null,
  tracks: Object.fromEntries(types.filter(t => t.all).map(t => [t.id, blankTrack()])), ...extra });

export function trackState(type, track, today = riyadhDate()) {
  if (!track) return { state: 'unassigned', days: null };
  if (type.kind === 'status') return { state: track.status === true ? 'ok' : 'missing', days: null };
  const expiry = dayNumber(track.expiresOn), current = dayNumber(today);
  if (expiry === null || current === null) return { state: 'missing', days: null };
  const days = expiry - current;
  const threshold = track.alertDays == null ? Number(type.alertDays ?? 30) : Number(track.alertDays);
  return { state: days < 0 ? 'expired' : days <= threshold ? 'soon' : 'ok', days, threshold,
    alertOn: new Date((expiry - threshold) * 86400000).toISOString().slice(0, 10) };
}

export function employeeStates(employee, types, today) {
  return types.filter(t => Object.hasOwn(employee.tracks, t.id)).map(type => ({ type, track: employee.tracks[type.id], ...trackState(type, employee.tracks[type.id], today) }));
}

export function summary(data, today = riyadhDate()) {
  const employees = data.employees.map(employee => ({ employee, states: employeeStates(employee, data.types, today) }));
  const count = state => employees.filter(e => e.states.some(t => t.state === state)).length;
  return {
    total: employees.length, expired: count('expired'), soon: count('soon'), missing: count('missing'),
    attention: employees.filter(e => e.states.some(t => ['expired', 'soon', 'missing'].includes(t.state))).length,
    types: Object.fromEntries(data.types.map(type => [type.id, employees.filter(e => e.states.some(t => t.type.id === type.id && t.state === (type.kind === 'expiry' ? 'soon' : 'missing'))).length])),
    alerts: employees.flatMap(({ employee, states }) => states.filter(s => !['ok', 'unassigned'].includes(s.state)).map(s => ({ employee, ...s })))
      .sort((a, b) => ({ expired: 0, soon: 1, missing: 2 }[a.state] - { expired: 0, soon: 1, missing: 2 }[b.state]) || ((a.days ?? 0) - (b.days ?? 0))),
  };
}

export function addType(data, type, employeeIds = []) {
  return { ...data, types: [...data.types, type], employees: data.employees.map(e => type.all || employeeIds.includes(e.id)
    ? { ...e, tracks: { ...e.tracks, [type.id]: blankTrack() } } : e) };
}

export const employeeFiles = employee => [employee.photo, ...Object.values(employee.tracks).flatMap(t => t.files || [])].filter(Boolean);

export function validateEmployee(employee, others) {
  if (!employee.name.trim()) return 'name';
  if (employee.number.trim() && others.some(e => e.id !== employee.id && e.number.trim().toLowerCase() === employee.number.trim().toLowerCase())) return 'duplicate';
  for (const track of Object.values(employee.tracks)) {
    if (track.expiresOn && dayNumber(track.expiresOn) === null) return 'date';
    if (track.alertDays != null && !validDays(track.alertDays)) return 'days';
  }
  return null;
}
