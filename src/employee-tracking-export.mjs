let loading;
async function loadExporter() {
  if (window.HafawaReports) return window.HafawaReports;
  if (!loading) loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const appUrl = document.querySelector('script[data-hf-app]')?.src || document.baseURI;
    script.src = new URL('tracking-reports-v25.js', appUrl).href;
    script.onload = () => window.HafawaReports ? resolve(window.HafawaReports) : reject(new Error('REPORT_LOAD'));
    script.onerror = () => { script.remove(); reject(new Error('REPORT_LOAD')); };
    document.head.appendChild(script);
  }).catch(error => { loading = null; throw error; });
  return loading;
}
export async function downloadReport(report, format) {
  const api = await loadExporter();
  const bytes = format === 'pdf' ? api.buildPdf(report) : await api.buildExcel(report);
  const blob = new Blob([bytes], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = `Hafawa-${report.title.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')}-${report.today}-${report.filter}.${format}`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
