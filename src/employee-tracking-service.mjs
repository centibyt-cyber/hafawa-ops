import { normalizeTracking } from './employee-tracking-model.mjs';
const TABLE = 'hf_employee_tracking';
export const BUCKET = 'hf-employee-documents';

export async function loadTracking(sb) {
  const { data, error } = await sb.from(TABLE).select('data,revision,updated_at').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('TRACKING_ACCESS');
  return { ...data, data: normalizeTracking(data.data) };
}

export async function saveTracking(sb, data, revision) {
  const { data: row, error } = await sb.from(TABLE).update({ data }).eq('id', 1).eq('revision', revision).select('data,revision,updated_at').maybeSingle();
  if (error) throw error;
  if (!row) throw new Error('TRACKING_CONFLICT');
  return { ...row, data: normalizeTracking(row.data) };
}

export async function uploadTrackingFile(sb, employeeId, file, photo = false) {
  const allowed = photo ? ['image/jpeg', 'image/png', 'image/webp'] : ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('TRACKING_FILE');
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }[file.type];
  const path = `${employeeId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return { path, name: file.name, size: file.size, mime: file.type };
}

export async function removeTrackingFiles(sb, files) {
  const paths = [...new Set(files.map(f => f.path))];
  if (!paths.length) return;
  const { error } = await sb.storage.from(BUCKET).remove(paths);
  if (error) throw error;
}

export async function downloadTrackingFile(sb, file) {
  const { data, error } = await sb.storage.from(BUCKET).download(file.path);
  if (error) throw error;
  const url = URL.createObjectURL(data), a = document.createElement('a');
  a.href = url; a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
