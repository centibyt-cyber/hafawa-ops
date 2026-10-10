import ExcelJS from 'exceljs/dist/exceljs.min.js';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import font from './assets/DejaVuSans.base64';
import { stateNames } from './employee-tracking-report-model.mjs';

const metrics = report => [
  [report.isAr ? 'إجمالي الموظفين في التقرير' : 'Employees in report', report.counts.total],
  ...['expired','soon','missing','ok','exempt'].map(s => [stateNames[s][report.isAr ? 0 : 1], report.counts[s]])
];
const safeCell = value => typeof value === 'string' ? value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '') : value;

export async function buildExcel(report) {
  const book = new ExcelJS.Workbook();
  book.creator = 'Hafawa'; book.created = new Date();
  const sheet = book.addWorksheet(report.isAr ? 'تقرير التتبع' : 'Tracking report', { views: [{ rightToLeft: report.isAr, state: 'frozen', ySplit: 8 }], pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '8:8' } });
  sheet.columns = [27,19,25,22,21,36,19,24,18,58,17].map(width => ({ width }));
  const title = sheet.addRow([`حفاوة / Hafawa - ${report.title}`]); sheet.mergeCells('A1:K1'); title.height = 36;
  title.getCell(1).font = { name: 'Arial', size: 19, bold: true, color: { argb: 'FFFFFFFF' } };
  title.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B33' } };
  sheet.addRow([report.isAr ? 'تاريخ التقرير (الرياض)' : 'Generated (Riyadh)', report.generatedAt]); sheet.mergeCells('B2:K2');
  sheet.addRow([report.isAr ? 'التصفية' : 'Filter', `${report.filterLabel} / ${report.archiveLabel}`]); sheet.mergeCells('B3:K3');
  sheet.addRow([]);
  const totals = metrics(report);
  sheet.addRow(totals.map(([label]) => label));
  sheet.addRow(totals.map(([, value]) => value));
  sheet.addRow([report.isAr ? 'العدّادات تخص صفوف هذا التقرير. الأيام السالبة تعني التأخر عن الانتهاء.' : 'Counts apply to the exported rows. Negative days indicate an overdue expiry.']); sheet.mergeCells('A7:K7');
  const header = sheet.addRow(report.labels); header.height = 36;
  header.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B48C7' } }; cell.font = { name: 'Arial', color: { argb: 'FFFFFFFF' }, bold: true, size: 11 }; });
  report.rows.forEach(({ values, state }) => {
    const vals = values.map(safeCell);
    if (vals[6]) vals[6] = new Date(vals[6] + 'T00:00:00Z');
    const row = sheet.addRow(vals);
    row.getCell(7).numFmt = 'yyyy-mm-dd'; row.getCell(2).numFmt = '@';
    row.getCell(8).numFmt = '0'; row.getCell(9).numFmt = '0';
    const lines = Math.max(1, ...values.map((v, i) => String(v ?? '').split('\n').reduce((n, line) => n + Math.max(1, Math.ceil(line.length / (sheet.columns[i].width * .85))), 0)));
    row.height = Math.min(409, Math.max(30, lines * 16));
    const colors = { expired: 'FFFEE2E2', soon: 'FFFEF3C7', missing: 'FFF3E8FF', exempt: 'FFF1F5F9', ok: 'FFDCFCE7' };
    row.getCell(5).fill = { type:'pattern', pattern:'solid', fgColor: { argb: colors[state] } };
  });
  sheet.eachRow((row, index) => row.eachCell({ includeEmpty: true }, cell => {
    if (![1,8].includes(index)) cell.font = { name: 'Arial', size: 11, color: { argb: 'FF1E1B33' }, bold: index === 5 || index === 6 };
    cell.alignment = { vertical: 'middle', horizontal: report.isAr ? 'right' : 'left', wrapText: true, readingOrder: report.isAr ? 'rtl' : 'ltr' };
  }));
  sheet.getRow(5).height = 40; sheet.getRow(6).height = 26; sheet.getRow(7).height = 30;
  sheet.autoFilter = { from: { row: 8, column: 1 }, to: { row: Math.max(8, sheet.rowCount), column: 11 } };
  sheet.headerFooter.oddFooter = '&C&P / &N';
  return book.xlsx.writeBuffer();
}

export function buildPdf(report) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  doc.internal.events.subscribe('preProcessText', args => {
    const clean = value => Array.isArray(value) ? value.map(clean) : typeof value === 'string' ? value.replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '') : value;
    args.text = clean(args.text);
    Object.assign(args.options, { isInputVisual: false, isOutputVisual: true, isOutputRtl: false,
      isInputRtl: /[\u0600-\u06ff\ufb50-\ufeff]/.test(JSON.stringify(args.text)), isSymmetricSwapping: true });
  });
  doc.addFileToVFS('DejaVuSans.ttf', font.trim()); doc.addFont('DejaVuSans.ttf', 'Hafawa', 'normal');
  doc.setFont('Hafawa'); doc.setFontSize(17); doc.setTextColor('#1E1B33');
  const W = doc.internal.pageSize.getWidth(), rtl = report.isAr;
  const text = (value, y, size = 10) => { doc.setFontSize(size); doc.setR2L(false); doc.text(value, rtl ? W - 12 : 12, y, { align: rtl ? 'right' : 'left' }); };
  text(`${rtl ? 'حفاوة' : 'Hafawa'} - ${report.title}`, 16, 17);
  text(`${report.generatedAt} (${rtl ? 'توقيت الرياض' : 'Riyadh time'})`, 24);
  text(`${report.filterLabel} / ${report.archiveLabel}`, 31);
  for (let i = 0; i < 2; i++) text(metrics(report).slice(i * 3, i * 3 + 3).map(([label, count]) => `${label}: ${count}`).join('   |   '), 39 + i * 7, 9);
  // Reverse column order for an Arabic report; each cell retains its logical text.
  const widths = [32,20,24,23,22,32,23,23,21,33,20];
  const pdfLabels = [...report.labels];
  if (rtl) { pdfLabels[7] = 'الأيام\n(+ متبقية / - متأخرة)'; pdfLabels[8] = 'التنبيه\n(أيام)'; }
  const columns = pdfLabels.map((header, dataKey) => ({ header, dataKey: `c${dataKey}` }));
  if (rtl) columns.reverse();
  const longNotes = report.rows.filter(row => String(row.values[9] || '').length > 140);
  const rows = report.rows.map(row => Object.fromEntries(row.values.map((v,i) => [`c${i}`, i === 9 && String(v || '').length > 140
    ? (rtl ? 'راجع الملاحظات المفصلة في نهاية التقرير' : 'See detailed notes at the end of this report') : v == null || v === '' ? '-' : String(v)])));
  doc.setR2L(false);
  autoTable(doc, { columns, body: rows, startY: 52, margin: { top: 18, right: 12, bottom: 17, left: 12 },
    styles: { font: 'Hafawa', fontStyle: 'normal', fontSize: 8, cellPadding: 2.4, overflow: 'linebreak', halign: rtl ? 'right' : 'left', valign: 'top', lineColor: [226,223,237], lineWidth: .15 },
    headStyles: { fillColor: [30,27,51], textColor: 255, fontStyle: 'normal' }, alternateRowStyles: { fillColor: [247,246,251] },
    columnStyles: Object.fromEntries(widths.map((w,i) => [`c${i}`, { cellWidth: w }])),
    didParseCell: hook => { if (hook.section === 'body' && ['c1','c6','c7','c8'].includes(hook.column.dataKey)) hook.cell.styles.halign = 'center'; },
    willDrawCell: hook => { doc.setR2L(false); },
    didDrawCell: () => doc.setR2L(false)
  });
  if (!rows.length) text(rtl ? 'لا توجد سجلات مطابقة للتصفية.' : 'No records match this filter.', 80);
  if (longNotes.length) {
    doc.addPage(); doc.setTextColor('#1E1B33'); text(rtl ? 'الملاحظات المفصلة' : 'Detailed notes', 17, 16);
    let y = 29;
    for (const row of longNotes) {
      if (y > 170) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      const label = `${row.values[0]} / ${row.values[1] || '-'}`;
      for (const line of doc.splitTextToSize(label, W - 24)) { text(line,y,11); y += 6; }
      doc.setFontSize(10);
      for (const line of doc.splitTextToSize(row.values[9], W - 24)) {
        if (y > 187) { doc.addPage(); y = 20; text(label,y,11); y += 9; }
        text(line,y,10); y += 6;
      }
      y += 9;
    }
  }
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page); doc.setTextColor('#6B6890'); doc.setFontSize(8); doc.setR2L(false);
    doc.text(`Hafawa / ${report.today} / ${page} / ${doc.getNumberOfPages()}`,12,203);
  }
  doc.setProperties({ title: `Hafawa - ${report.title}`, creator: 'Hafawa', subject: report.filterLabel });
  return doc.output('arraybuffer');
}
