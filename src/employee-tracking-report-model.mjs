import { typeRows, countRows, riyadhDate } from './employee-tracking-model.mjs';

export const stateNames = { ok: ['مكتمل', 'Complete'], soon: ['قريب الانتهاء', 'Expiring soon'], expired: ['منتهي', 'Expired'], missing: ['ناقص', 'Missing'], exempt: ['غير مطلوب', 'Not required'], empty: ['بلا تتبعات', 'No tracking'] };
export const filterNames = { all: ['جميع الموظفين', 'All employees'], expired: stateNames.expired, soon: stateNames.soon, missing: stateNames.missing, ok: stateNames.ok, exempt: stateNames.exempt };
export const localName = (type, isAr) => isAr ? type.name : type.nameEn || type.name;
export function stateDescription(row, isAr = true) {
  const tr = (ar, en) => isAr ? ar : en;
  if (row.state === 'exempt') return tr('غير مطلوب', 'Not required');
  if (row.state === 'missing') {
    if (row.reason === 'absent') return tr('لا يوجد مستند', 'No document');
    if (row.reason === 'not_done') return tr('لم يتم الإجراء', 'Not completed');
    if (row.reason === 'date') return tr('تاريخ الانتهاء غير مدخل', 'Expiry date not entered');
    return row.missingDate ? tr('الحالة وتاريخ الانتهاء غير مدخلين', 'Status and expiry date not entered') : tr('لم تُدخل الحالة', 'Status not entered');
  }
  if (row.days == null) return tr('مكتمل', 'Complete');
  if (row.days < 0) return tr(`منتهي منذ ${Math.abs(row.days)} يوم`, `Expired ${Math.abs(row.days)} days ago`);
  if (row.days === 0) return tr('ينتهي اليوم', 'Expires today');
  return tr(`باقي ${row.days} يوم`, `${row.days} days remaining`);
}

export function createReport(data, typeId, { filter = 'all', archive = 'active', isAr = true, now = new Date() } = {}) {
  const today = riyadhDate(now), type = data.types.find(t => t.id === typeId);
  if (!type || !filterNames[filter]) throw new Error('REPORT_TYPE');
  const rows = typeRows(data, typeId, today, { filter, archive });
  const labels = isAr ? ['اسم الموظف','الرقم الوظيفي','المسمى الوظيفي','القسم','الحالة','التفاصيل / النواقص','تاريخ الانتهاء','الأيام المتبقية / المتأخرة','أيام التنبيه','الملاحظات','حالة الموظف']
    : ['Employee name','Employee number','Job title','Department','Status','Details / missing data','Expiry date','Days remaining / overdue','Alert days','Notes','Employee state'];
  return { title: localName(type, isAr), typeId, filter, filterLabel: filterNames[filter][isAr ? 0 : 1], isAr, today,
    generatedAt: new Intl.DateTimeFormat(isAr ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', { timeZone: 'Asia/Riyadh', dateStyle: 'medium', timeStyle: 'short' }).format(now),
    archiveLabel: (archive === 'archived' ? ['المؤرشفون', 'Archived employees'] : archive === 'all' ? ['النشطون والمؤرشفون', 'Active and archived'] : ['الموظفون النشطون', 'Active employees'])[isAr ? 0 : 1],
    counts: countRows(rows), labels, rows: rows.map(row => ({ state: row.state, values: [row.employee.name, row.employee.number || '', row.employee.job || '', row.employee.department || '',
      stateNames[row.state][isAr ? 0 : 1], stateDescription(row, isAr), type.kind === 'expiry' ? row.track.expiresOn || '' : '', row.days,
      type.kind === 'expiry' && row.state !== 'exempt' ? Number(row.track.alertDays ?? type.alertDays ?? 30) : null, row.track.notes || '', row.employee.archivedAt ? (isAr ? 'مؤرشف' : 'Archived') : (isAr ? 'نشط' : 'Active')] })) };
}
