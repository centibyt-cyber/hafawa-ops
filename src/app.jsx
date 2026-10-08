import { useState, useMemo, useEffect, useRef, Fragment } from "react";
import EmployeeTracking, { useTrackingStore, TrackingHomeCard } from "./employee-tracking.jsx";
import {
  LayoutDashboard, ClipboardList, Boxes, FileText, Settings, Thermometer, Snowflake,
  UtensilsCrossed, Shirt, Wine, Trash2, Printer, Share2, Plus, Minus, Search,
  AlertTriangle, CheckCircle2, Languages, X, Download, ArrowLeft, ArrowRight, Copy,
  Droplets, Sun, Coffee, Martini, ChefHat, HeartPulse, Package, Sparkles,
  ClipboardCheck, Flame, GlassWater, Users, Info, Pencil, LogOut, BarChart3, Send, Bell,
  UserPlus, Building2, ShieldCheck, ArrowDownToLine, TrendingUp, CheckCheck,
  History, Calendar, Moon, Image as ImageIcon, Upload, RefreshCw, CalendarDays, Handshake, RotateCcw, XCircle,
  ArrowUpFromLine, ArrowLeftRight, Warehouse, KeyRound, ScanLine, ScanBarcode, Barcode, Flashlight, SwitchCamera, Camera, MapPin
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

/* ================= HAFAWA LOUNGE OPS — INTERACTIVE PROTOTYPE =================
   White-label build: identity + environment live in CFG (Admin > Settings).
   TRIAL mode shows the ribbon on every screen and a watermark on every print.
============================================================================= */

const STYLE = `
  .hf-root{font-family:"Segoe UI",Tahoma,system-ui,-apple-system,sans-serif;}
  .tabular{font-variant-numeric:tabular-nums;}
  .hf-ribbon{background:repeating-linear-gradient(-45deg,#B8934E 0 14px,#A37E3B 14px 28px);}
  .hf-scroll::-webkit-scrollbar{height:6px;width:6px}
  .hf-scroll::-webkit-scrollbar-thumb{background:#D9D2EC;border-radius:6px}
  .clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
  input,select,textarea{outline:none}
  input:focus,select:focus,textarea:focus{box-shadow:0 0 0 2px #C9BEF5}
  @media print{
    #hf-shell{display:none !important;}
    .print-veil{position:static !important;background:#fff !important;padding:0 !important;}
    .print-sheet{box-shadow:none !important;margin:0 !important;width:100% !important;max-width:none !important;}
    .no-print{display:none !important;}
  }
`;

/* ---------------- demo staff (placeholder — replaced at handover) --------- */
const ROSTER_SEED = {"weekStart": "2026-08-06", "positions": ["Entrance (4hrs)", "Air France (4hrs)", "Roaming", "Garden", "Executive Dining", "Executive Bar", "Coffee Barista", "Buffet & Social Dining", "Beverage Center", "Dishwasher", "Wash Room", "P.A Roaming"], "names": ["AHMED", "ANGELO", "CRESTINA", "DANILO", "GALIB", "JENN", "JOHN PAUL", "JONG", "JORDON", "KENNETH", "LEO", "MARIA", "MARIEL 9183747329", "MARVIN", "MIKE", "RACHEL", "SHERWIN", "SOLIB", "TAMANG", "TARLUCAD", "TOLUCAD"], "data": {"2026-08-06": {"Entrance (4hrs)": ["LEO"], "Air France (4hrs)": ["ANGELO"], "Roaming": ["AHMED"], "Garden": ["KENNETH", "ANGELO"], "Executive Dining": ["RACHEL", "MIKE"], "Executive Bar": ["MARIEL"], "Coffee Barista": ["DANILO"], "Buffet & Social Dining": ["TOLUCAD", "JENN"], "Dishwasher": ["JOHN PAUL", "MARVIN", "TAMANG"], "Wash Room": ["CRESTINA", "SHERWIN"]}, "2026-08-07": {"Entrance (4hrs)": ["RACHEL"], "Air France (4hrs)": ["JENN"], "Roaming": ["JONG"], "Garden": ["TARLUCAD", "JENN"], "Executive Dining": ["LEO", "TOLUCAD"], "Executive Bar": ["MARIA"], "Coffee Barista": ["JENN"], "Buffet & Social Dining": ["JORDON", "MIKE"], "Dishwasher": ["GALIB", "TAMANG"], "Wash Room": ["JOHN PAUL", "CRESTINA"]}, "2026-08-08": {"Entrance (4hrs)": ["DANILO"], "Air France (4hrs)": ["LEO"], "Roaming": ["JONG"], "Garden": ["JORDON", "LEO"], "Executive Dining": ["ANGELO", "MARIA"], "Executive Bar": ["KENNETH"], "Coffee Barista": ["MARIEL"], "Buffet & Social Dining": ["RACHEL", "TOLUCAD"], "Dishwasher": ["JOHN PAUL", "SHERWIN"], "Wash Room": ["CRESTINA", "SOLIB"]}, "2026-08-09": {"Entrance (4hrs)": ["MIKE"], "Air France (4hrs)": ["MARIEL"], "Roaming": ["JONG"], "Garden": ["MARIEL", "DANILO"], "Executive Dining": ["KENNETH", "ANGELO"], "Executive Bar": ["JORDON"], "Coffee Barista": ["MARIA"], "Buffet & Social Dining": ["RACHEL", "JORDON"], "Beverage Center": ["MIKE"], "Dishwasher": ["SOLIB", "TAMANG"], "Wash Room": ["CRESTINA", "MARVIN"]}, "2026-08-10": {"Entrance (4hrs)": ["ANGELO"], "Air France (4hrs)": ["RACHEL"], "Roaming": ["JONG"], "Garden": ["MIKE", "RACHEL"], "Executive Dining": ["DANILO", "TARLUCAD"], "Executive Bar": ["MIKE"], "Coffee Barista": ["LEO"], "Buffet & Social Dining": ["MARIEL", "JORDON"], "Beverage Center": ["JORDON"], "Dishwasher": ["MARVIN", "JOHN PAUL"], "Wash Room": ["SHERWIN", "SOLIB"]}, "2026-08-11": {"Entrance (4hrs)": ["TARLUCAD"], "Air France (4hrs)": ["JENN"], "Roaming": ["JONG"], "Garden": ["TARLUCAD", "JENN"], "Executive Dining": ["JORDON", "MARIA"], "Executive Bar": ["KENNETH"], "Coffee Barista": ["JENN"], "Buffet & Social Dining": ["RACHEL", "DANILO"], "Dishwasher": ["TAMANG", "SOLIB"], "Wash Room": ["CRESTINA", "MARVIN"]}, "2026-08-12": {"Air France (4hrs)": ["KENNETH"], "Roaming": ["JONG"], "Garden": ["KENNETH", "MARIA"], "Executive Dining": ["JENN", "MIKE"], "Executive Bar": ["LEO"], "Coffee Barista": ["DANILO"], "Buffet & Social Dining": ["TARLUCAD", "MARIEL"], "Dishwasher": ["SHERWIN", "MARVIN"], "Wash Room": ["CRESTINA", "TAMANG"]}}};

const STAFF = [
  { n: "Ahmed",  r: "Team Leader",      prn: "TL-1001" },
  { n: "Sharm",  r: "Supervisor",       prn: "SV-2044" },
  { n: "Jera",   r: "F&B Attendant",    prn: "AT-3102" },
  { n: "Rina",   r: "F&B Attendant",    prn: "AT-3117" },
  { n: "Kumar",  r: "Public Attendant", prn: "PA-4021" },
  { n: "Noura",  r: "Barista",          prn: "BR-3555" },
];

/* ---------------- temperature devices (demo readings for today) ----------- */
const CHILL_TIMES = ["20:00", "00:00", "04:00", "08:00", "12:00", "16:00"];
const FRZ_TIMES   = ["20:00", "00:00", "04:00"];
const DEVICES_INIT = [
  { id: "C1", kind: "chiller", en: "Chiller 1 — Kitchen",       ar: "شيلر 1 — المطبخ",
    r: { "20:00": { t: 3.2, by: "Jera" }, "00:00": { t: 2.8, by: "Kumar" }, "04:00": { t: 3.5, by: "Kumar" }, "08:00": { t: 2.9, by: "Sharm" } } },
  { id: "C2", kind: "chiller", en: "Chiller 2 — Buffet",        ar: "شيلر 2 — البوفيه",
    r: { "20:00": { t: 3.9, by: "Jera" }, "00:00": { t: 4.1, by: "Kumar" }, "04:00": { t: 4.4, by: "Kumar" },
         "08:00": { t: 5.6, by: "Sharm", ca: "Check door & reorganize" } } },
  { id: "C3", kind: "chiller", en: "Chiller 3 — Café",          ar: "شيلر 3 — المقهى",
    r: { "20:00": { t: 2.6, by: "Noura" }, "00:00": { t: 2.9, by: "Kumar" }, "04:00": { t: 3.1, by: "Kumar" }, "08:00": { t: 3.4, by: "Noura" } } },
  { id: "C4", kind: "chiller", en: "Chiller 4 — Executive Bar", ar: "شيلر 4 — البار التنفيذي",
    r: { "20:00": { t: 3.0, by: "Rina" }, "00:00": { t: 3.3, by: "Kumar" }, "04:00": { t: 3.2, by: "Kumar" } } },
  { id: "F1", kind: "freezer", en: "Freezer 1 — Kitchen",       ar: "فريزر 1 — المطبخ",
    r: { "20:00": { t: -19.4, by: "Jera" }, "00:00": { t: -19.1, by: "Kumar" } } },
  { id: "F2", kind: "freezer", en: "Freezer 2 — Dry Store",     ar: "فريزر 2 — المستودع الجاف",
    r: { "20:00": { t: -20.2, by: "Jera" }, "00:00": { t: -19.8, by: "Kumar" }, "04:00": { t: -19.5, by: "Kumar" } } },
];

/* ---------------- meals temperature control (demo — BRF) ------------------ */
const MEALS_INIT = [
  { n: "Shakshuka",              type: "HOT",  del: { tm: "05:40", t: 4.2, q: "2 GN" },
    rh: [{ ch: "05:55 / 4.3°", ov: "06:25 / 82°" }], disp: [{ tm: "06:30", t: 76 }, { tm: "08:30", t: 71 }] },
  { n: "Foul Medames",           type: "HOT",  del: { tm: "05:40", t: 3.8, q: "2 GN" },
    rh: [{ ch: "05:58 / 4.0°", ov: "06:28 / 84°" }], disp: [{ tm: "06:30", t: 78 }, { tm: "08:30", t: 66 }] },
  { n: "Chicken Sausage",        type: "HOT",  del: { tm: "05:40", t: 4.5, q: "1 GN" },
    rh: [{ ch: "06:00 / 4.6°", ov: "06:30 / 79°" }], disp: [{ tm: "06:35", t: 72 }] },
  { n: "Greek Yogurt Parfait",   type: "COLD", del: { tm: "05:40", t: 3.1, q: "24 pc" },
    rh: [], disp: [{ tm: "06:30", t: 3.6 }, { tm: "08:30", t: 4.8 }] },
  { n: "Seasonal Fruit Platter", type: "COLD", del: { tm: "05:40", t: 3.4, q: "3 tray" },
    rh: [], disp: [{ tm: "06:30", t: 4.1 }] },
];

/* ---------------- cleaning checklists (from the paper forms) -------------- */
const T_TASKS = [
  ["تنظيف وتعقيم المغسلة", "Clean & Sanitize Sink"],
  ["تنظيف وتعقيم البانيو", "Clean & Sanitize Tub"],
  ["تنظيف المرآة", "Clean Mirror"],
  ["تعقيم أرضية الحمام", "Disinfect Bathroom Floor"],
  ["تعقيم غرفة الاستحمام", "Disinfect Shower Room"],
  ["ورق التواليت / غطاء المقعد", "Toilet Paper / Seat Cover"],
  ["المناشف", "Towels"],
  ["سلة المهملات", "Garbage Bin"],
  ["مسح الجدران / السقف / مخارج التكييف", "Wipe Walls / Ceiling / AC Diffuser"],
  ["معطر الجو", "Air Aroma"],
  ["غسول وصابون اليدين", "Hand Wash & Hand Soap"],
  ["التأكد من اتباع كل التعليمات بدقة", "All instructions followed precisely"],
];
const G_AREAS = [
  ["كاونتر الاستقبال", "Reception Counter"],
  ["مدخل نجد", "NAJD Entrance"],
  ["تنظيف المكاتب (غبار / مكنسة / تلميع)", "Office Cleaning (dust / vacuum / polish)"],
  ["غرف التخزين", "Storage Rooms"],
  ["منطقة الجلوس / السجاد والأثاث", "Seating Area / Carpet & Furniture"],
  ["منطقة الطعام / الطاولات والكراسي", "Dining Area / Tables & Chairs"],
  ["كاونتر البوفيه والمشروبات", "Buffet & Beverage Counter"],
  ["البانتري / السقف ومخارج التكييف", "Pantry / Ceiling & AC Diffusers"],
  ["غرف الصلاة", "Prayer Rooms"],
  ["سلال القمامة وتبديل الأكياس", "Garbage Bins & Liners"],
  ["كنس ومسح الأرضيات والكاونترات", "Sweeping & Mopping / Counters"],
  ["غسيل أواني المطبخ", "Wash Kitchen Dishes"],
  ["تعبئة المناديل ولفائف التواليت", "Replenish Paper Towels / Toilet Rolls"],
  ["الأبواب الزجاجية والخشبية", "Glass & Wooden Doors / Frames"],
  ["دورة مياه ذوي الإعاقة: تنظيف وتعبئة", "Accessible Toilet: Cleaning & Refills"],
];
const TOILETS = [
  ["رجال", "Men"],
  ["سيدات", "Women"],
];
const mkSlots = (start, n) => {
  const out = []; let [h, m] = start.split(":").map(Number);
  for (let i = 0; i < n; i++) {
    out.push(String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"));
    m += 30; if (m >= 60) { m = 0; h = (h + 1) % 24; }
  }
  return out;
};
const NIGHT = mkSlots("20:00", 21), MORNING = mkSlots("06:30", 21);
/* الجولة العامة: ورديتان بـ12 ساعة — 07:00→19:00 و 19:00→07:00 */
const R_DAY = mkSlots("07:00", 25), R_NIGHT = mkSlots("19:00", 25);

/* ---------------- linen / breakage (demo seed rows) ----------------------- */
const LINEN_INIT = {
  towel:  [["2026-08-14", 120, 112, 80, 74], ["2026-08-15", 130, 121, 60, 58], ["2026-08-16", 110, 64, 0, 0]],
  napkin: [["2026-08-14", 200, 182, 150, 141], ["2026-08-15", 220, 208, 120, 117], ["2026-08-16", 180, 95, 0, 0]],
};
const BREAK_INIT = [
  ["2026-08-13", "Espresso Cup", "Chinaware", 2, "AM", "Jera", "Slipped from tray while clearing", ""],
  ["2026-08-14", "Highball Glass", "Glassware", 1, "PM", "Rina", "Knocked over at Executive Bar", ""],
  ["2026-08-15", "Dinner Plate 27cm", "Chinaware", 3, "AM", "Kumar", "Dropped during dishwashing", "Replacement requested"],
];
const BREAK_CATS = ["Chinaware", "Glassware", "Cutlery", "Linen", "Equipment", "Other"];
const ARCHIVE_INIT = [
  { d: "2026-08-15", k: "temp",  ar: "سجل حرارة الشيلرات — يوم كامل", en: "Chiller temperature record — full day", by: "Sharm" },
  { d: "2026-08-15", k: "clean", ar: "تشيك ليست دورات المياه — وردية صباحية", en: "Toilet checklist — morning shift", by: "Kumar" },
  { d: "2026-08-14", k: "order", ar: "طلبية المستودع الجاف — 12 صنفاً", en: "Dry Store order — 12 lines", by: "Ahmed" },
  { d: "2026-08-14", k: "linen", ar: "سجل المناشف اليومي", en: "Face towel daily log", by: "Rina" },
];

/* ---------------- helpers ------------------------------------------------- */
const MAIN_WH = "dry"; /* the main store — every other area draws its items from here */
const WH_ICONS = { garden: Droplets, terrace: Sun, rx: Package, bev: GlassWater, dry: Boxes,
  buffet: UtensilsCrossed, cafe: Coffee, exec: Martini, kitchen: ChefHat, pa: Sparkles, firstaid: HeartPulse };

const todayISO = () => { const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
/* اليوم التشغيلي: الوردية المسائية تمتد 20:00 → 06:00، فما يُسجَّل بين منتصف الليل والسادسة
   ينتمي لورقة اليوم الذي بدأت فيه الوردية — لا لليوم التقويمي الجديد. */
const OP_START_HOUR = 6;
const opDay = () => { const d = new Date();
  if (d.getHours() < OP_START_HOUR) d.setDate(d.getDate() - 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const inNightCarry = () => new Date().getHours() < OP_START_HOUR;
const nowHM = () => { const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const daysTo = (exp) => Math.ceil((new Date(exp) - new Date()) / 864e5);
const expState = (exp) => { if (!exp) return null; const d = daysTo(exp); return d < 0 ? "exp" : d <= 30 ? "soon" : "ok"; };
const lowState = (it) => {
  const q = it[2], min = it[4], st = String(it[5] || "").toLowerCase();
  if (st.includes("out")) return "out";
  if (min != null && typeof q === "number" && q <= min) return "low";
  if (st.includes("low")) return "low";
  return null;
};
const rangeOf = (d) => d && d.lo != null && d.hi != null ? [d.lo, d.hi]
  : d && d.kind === "freezer" ? [-99, -18] : [-99, 5];
const devState = (d, t) => { const [lo, hi] = rangeOf(d); return t < lo || t > hi ? "bad" : "ok"; };
const tState = (kind, t) => kind === "chiller"
  ? (t <= 4 ? "ok" : t < 5 ? "warn" : "bad")
  : (t <= -19 ? "ok" : t <= -18 ? "warn" : "bad");

/* Status is LIVE-COMPUTED from expiry date + quantity + minimum (never typed). */
const calcStatus = (r) => {
  const q = r[2], exp = r[3], min = r[4], legacy = String(r[5] || "").toLowerCase();
  const d = exp ? daysTo(exp) : null;
  if (d != null && d < 0) return "exp";
  if (q === 0 || (q == null && legacy.includes("out"))) return "out";
  if ((min != null && typeof q === "number" && q <= min) || legacy.includes("low")) return "low";
  if (d != null && d <= 30) return "soon";
  return "ok";
};
/* ------------------------------ item batches -----------------------------
   One row per item; every expiry date it holds is a batch inside r[8]:
   { q, exp, d, by }. While batches exist they are the source of truth:
   r[2] (quantity) is their sum and r[3] (expiry) is the earliest one left,
   so the table never shows the same item twice and FEFO is automatic.
   ------------------------------------------------------------------------ */
const btOf = (r) => (Array.isArray(r[8]) ? r[8] : []).filter(b => b && +b.q > 0);
const btSum = (bs) => bs.reduce((a, b) => a + (+b.q || 0), 0);
const btSort = (bs) => bs.slice().sort((a, b) => String(a.exp || "9999-12-31") < String(b.exp || "9999-12-31") ? -1 : 1);
const btEarliest = (bs) => { const w = btSort(bs).find(b => b.exp); return w ? w.exp : null; };
const btWrite = (r, bs) => { const n = [...r]; n[8] = btSort(bs).filter(b => +b.q > 0); n[2] = btSum(n[8]); n[3] = btEarliest(n[8]); return n; };
/* stock that predates batching becomes one opening batch so totals never jump */
const btSeed = (r) => { const bs = btOf(r); if (bs.length) return bs;
  const q = typeof r[2] === "number" ? r[2] : 0;
  return q > 0 ? [{ q, exp: r[3] || null, d: null, by: null, open: true }] : []; };
const btAdd = (r, q, exp, d, by) => {
  const bs = btSeed(r).slice(), k = exp || "", i = bs.findIndex(b => (b.exp || "") === k);
  if (i >= 0) bs[i] = { ...bs[i], q: (+bs[i].q || 0) + q };
  else bs.push({ q, exp: exp || null, d: d || todayISO(), by: by || null });
  return btWrite(r, bs);
};
/* first expired, first out */
const btTake = (r, q) => {
  const bs = btSort(btSeed(r)).map(b => ({ ...b })); let left = q; const took = [];
  bs.forEach(b => { if (left <= 0) return; const t = Math.min(left, +b.q || 0);
    if (t > 0) { b.q = (+b.q) - t; left -= t; took.push({ exp: b.exp || null, q: t }); } });
  return { row: btWrite(r, bs), took, left };
};
/* a hand-typed quantity stays consistent with the batches behind it */
const btSet = (r, q) => {
  const bs = btSeed(r); if (!bs.length) { const n = [...r]; n[2] = q; return n; }
  const cur = btSum(bs), d = (q == null ? 0 : q) - cur;
  if (q == null) { const n = [...r]; n[2] = null; return n; }
  if (d === 0) return btWrite(r, bs);
  if (d > 0) return btAdd(r, d, null, todayISO(), null);
  return btTake(r, -d).row;
};
const ST_LBL = {
  exp:  ["منتهي الصلاحية", "Expired", "bad"],
  out:  ["غير متوفر", "Out of stock", "bad"],
  low:  ["تحت الحد الأدنى", "Below minimum", "warn"],
  soon: ["قرب الانتهاء", "Expiring ≤ 30d", "warn"],
  ok:   ["متوفر", "In stock", "ok"],
};
const secOfIdx = (rows, idx) => { let x = null; for (let i = 0; i <= idx; i++) if (typeof rows[i] === "string") x = rows[i].slice(2); return x; };
const insertRow = (rows, sec, row) => {
  if (!sec) return [...rows, row];
  const hi = rows.findIndex(r => r === "H:" + sec);
  if (hi < 0) return [...rows, row];
  let end = rows.length;
  for (let i = hi + 1; i < rows.length; i++) if (typeof rows[i] === "string") { end = i; break; }
  return [...rows.slice(0, end), row, ...rows.slice(end)];
};
function useSave(save, key, val) {
  const first = useRef(true);
  useEffect(() => {
    if (!save) return;
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => save(key, val), 700);
    return () => clearTimeout(t);
  }, [val]);
}

/* Brand theme — inline styles (artifacts ship a prebuilt Tailwind sheet,
   so arbitrary-value classes such as bg-[#1E1B33] would not resolve). */
const T = {
  ink: "#1E1B33", ink2: "#3A3560", mute: "#6B6890",
  surf: "#F7F6FB", card: "#FFFFFF", line: "#E6E3F2",
  brass: "#B8934E", brassSoft: "#F5EDDC", brassLine: "#E5D5AE", brassText: "#8A6A2F",
  vio: "#5B48C7", vioSoft: "#EFEBFF", vioLine: "#DCD4F7", vioText: "#4B3BA8",
  ok: "#047857", okSoft: "#ECFDF5", okLine: "#A7F3D0", okText: "#047857",
  bad: "#DC2626", badSoft: "#FEF2F2", badLine: "#FECACA",
  warn: "#B45309", warnSoft: "#FFFBEB", warnLine: "#FDE68A",
};
const TONE = {
  ok:    { background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0" },
  warn:  { background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" },
  bad:   { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" },
  mut:   { background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" },
  vio:   { background: T.vioSoft, color: T.vioText, border: "1px solid " + T.vioLine },
  brass: { background: T.brassSoft, color: T.brassText, border: "1px solid " + T.brassLine },
};
const WAREHOUSES=[{"id":"garden","en":"Hydration – Garden Area","ar":"هايدريشن – الحديقة","d":"June 28,2026","by":"Sharm @5:15pm","rows":[["Berain Sparkling Water","Bottle",12,"2027-05-18",null,"OK","estimated expiry (prod+12 mo)",null],["Berain Still Water","Bottle",10,"2027-06-14",null,"OK","estimated expiry (prod+12 mo)",null],["Dates: Sagai","Piece",12,"2027-02-22",null,"OK",null,null],["Dates: Sukari","Piece",6,"2026-11-26",null,"OK",null,null],["TWG Chamomile Tea","Sachet",52,"2027-11-28",null,"OK","Including open box under hydration",null],["TWG Earl Grey Tea","Sachet",60,"2028-05-28",null,"OK","Including open box under hydration",null],["TWG English Breakfast Tea","Sachet",48,"2028-08-15",null,"OK","Including open box under hydration",null],["TWG Grand Jasmine Tea","Sachet",70,"2028-05-28",null,"OK","Including open box under hydration",null],["TWG Sencha","Sachet",3,"2027-11-28",null,"OK","Including open box under hydration",null]]},{"id":"terrace","en":"Hydration – Open Terrace","ar":"هايدريشن – التراس المفتوح","d":"June 28,2026","by":"Sharm @5:15pm","rows":[["Ajwa Dates","Piece",6,"2026-11-09","OK",null,null,null],["Berain Sparkling Water","Bottle",12,"2027-05-18","OK","estimated expiry (pr…",null,null],["Berain Still Water","Bottle",12,"2027-06-14","OK","estimated expiry (pr…",null,null],["Cubes: Brown Sugar","Jar",1,"2026-12-24","OK",null,null,null],["Cubes: White Sugar","Jar",1,"2030-01-24","OK",null,null,null],["Riyadh Air Complimentary Dates","Box",6,"2027-02-21","OK",null,null,null],["Stevia Sugar (Steviana)","Piece",30,null,"OK","Labeled as 06/2027 e…",null,null],["TWG Chamomile Tea","Sachet",12,"2027-11-28","OK",null,null,null],["TWG Earl Grey Tea","Sachet",9,"2028-05-28","OK",null,null,null],["TWG English Breakfast Tea","Sachet",13,"2028-08-15","OK",null,null,null],["TWG Grand Jasmine Tea","Sachet",11,"2028-05-28","OK",null,null,null]]},{"id":"rx","en":"RX Items","ar":"أصناف وتجهيزات RX","d":"July 30, 2026","by":"Sharm","rows":["H:BUFFET AREA",["Tall Glass Cylinder Jar (Wooden Cap)","Piece",15,null,null,"In stock",null,null],["Short Glass Cylinder Jar","Piece",6,null,null,"In stock",null,null],["Tall Display Bread Stand (wide)","Piece",4,null,null,"In stock",null,null],["Tall Glass Cylinder Jar (Glass Cap)","Piece",15,null,null,"In stock",null,null],["Cereal Glass Display","Piece",2,null,null,"In stock",null,null],["Triangular Dessert Display","Piece",1,null,null,"In stock",null,null],["Short Display Bread Stand","Piece",2,null,null,"In stock",null,null],["Cake Stand","Piece",8,null,null,"In stock",null,null],["Big Cake Glass Lid","Piece",3,null,null,"In stock",null,null],["Short Cake Glass Lid","Piece",2,null,null,"In stock",null,null],["Acrylic Containers","Piece",4,null,null,"In stock",null,null],["Big  White Charger Plate","Piece",1,null,null,"In stock",null,null],["Condiments Jar Sets","Piece",12,null,null,"In stock",null,null],["Board Display","Piece",4,null,null,"In stock",null,null],["Wooden Box","Piece",5,null,null,"In stock",null,null],["Oil Jar","Piece",4,null,null,"In stock",null,null],["Allergen Stand","Piece",2,null,null,"In stock",null,null],["Cold Buffet: Black Flat Board","Piece",24,null,null,"In stock",null,null],["Cube Stands","Piece",82,null,null,"In stock",null,null],["Induction Safe Pots","Piece",8,null,null,"In stock",null,null],["Stainless Steel Ceramic Spoon Dripper","Piece",8,null,null,"In stock",null,null],["Black Display Plate","Piece",19,null,null,"In stock",null,null],["Black Cheese Plate","Piece",null,null,null,"Out of stock",null,null],"H:CAFÉ",["Glass Cold Drip Tower","Piece",1,null,null,"In stock",null,null],["Riyadh Puzzle Board","Piece",3,null,null,"In stock",null,null],["Assorted Vases","Piece",10,null,null,"In stock",null,null],["Coral Reefs Designs","Piece",2,null,null,"In stock",null,null],["Purple Vase","Piece",1,null,null,"In stock",null,null],["Assorted Traditional Coffee Makers","Piece",6,null,null,"In stock",null,null],["Nouva Simounili Coffee Machine","Piece",1,null,null,"In stock",null,null],["Mahlkonig V60 Grinder Machine","Piece",1,null,null,"In stock",null,null],["Nouva Simounili Espresso Grinder","Piece",1,null,null,"In stock",null,null],["Coffee Pitcher","Piece",2,null,null,"In stock",null,null],["Deem Dallah Saudi Coffee Maker","Piece",1,null,null,"In stock",null,null],["V60 Coffee Dripper","Piece",2,null,null,"In stock",null,null],["Serving Tray","Piece",4,null,null,"In stock",null,null],["Coffee Knock Box","Piece",2,null,null,"In stock",null,null],["Wooden Display Box","Piece",1,null,null,"In stock",null,null],["Short Cylinder Jar","Piece",1,null,null,"In stock",null,null],["Condiments Jars","Piece",4,null,null,"In stock",null,null],["Electronic Weighing Scale","Piece",1,null,null,"In stock",null,null],["Coffee Stamper","Piece",1,null,null,"In stock",null,null],["Coffee Tamping Matt","Piece",2,null,null,"In stock",null,null],["Brewista Gooseneck Variable Heater","Piece",3,null,null,"In stock",null,null],["Vacuum Jug","Piece",2,null,null,"In stock",null,null],["Mug Elevator","Piece",3,null,null,"In stock",null,null],["Display Black Slim Plate","Piece",2,null,null,null,null,null],["Small Saudi Coffee Maker","Piece",2,null,null,null,null,null],["Storage Filters","Piece",1,null,null,null,null,null],["Steaming Pitcher","Piece",1,null,null,null,null,null],["Turkish Coffee Makers","Piece",4,null,null,null,null,null],["Tea Filter Jars","Piece",2,null,null,null,null,null],["First Aids","Piece",1,null,null,null,null,null],"H:DRY STORAGE",["Organizing Shelves","Piece",2,null,null,null,null,null],["Chiller","Piece",1,null,null,null,null,null],["Open Boxes","Piece",6,null,null,null,null,null],["Baby Chairs","Piece",1,null,null,null,null,null],["Mop Container","Piece",1,null,null,null,null,null],["Dates Container","Piece",1,null,null,null,null,null],["First Aids","Piece",1,null,null,null,null,null],["Emergency equipments set","Piece",1,null,null,null,null,null],["Fire Extinguisher","Piece",2,null,null,null,null,null],["Response Unit Jacket","Piece",1,null,null,null,null,null],"H:SOCIAL DINING",["Vase Display","Piece",1,null,null,null,null,null],"H:SOCIAL LOUNGE",["Assorted Books","Piece",5,null,null,null,null,null],["Short Lamps","Piece",3,null,null,null,null,null],["Long Cylindrical Lamps","Piece",8,null,null,null,null,null],["Cactus Display","Piece",2,null,null,null,null,null],["Wifi Cube Display","Piece",1,null,null,null,null,null],["Assorted Vases","Piece",8,null,null,null,null,null],"H:FAMILY ROOM",["Assorted Books","Piece",8,null,null,null,null,null],["Big Plushies","Piece",2,null,null,null,null,null],["Play Matts","Piece",47,null,null,null,null,null],["Toy Cars Sets","Piece",12,null,null,null,null,null],["Cubes","Piece",3,null,null,null,null,null],["Ring Color Arranger","Piece",1,null,null,null,null,null],["BYO Castle House","Piece",1,null,null,null,null,null],["Kids Toy Display Set","Piece",1,null,null,null,null,null],"H:BEVERAGE CORNER",["Beverage Menu","Piece",3,null,null,null,null,null],["Beverage High Glass Display","Piece",3,null,null,null,null,null],["Flower Vintage Vases","Piece",2,null,null,null,null,null],["Wine Storsint Glass","Piece",8,null,null,null,null,null],["Bourbon Bottle Glass","Piece",2,null,null,null,null,null],["Bar Mat","Piece",2,null,null,null,null,null],["Bar Place Mat","Piece",1,null,null,null,null,null],["Bar Organizer","Piece",1,null,null,null,null,null],["Thongs","Piece",1,null,null,null,null,null],["Steel Muddler","Piece",1,null,null,null,null,null],["Bottle Pourer","Piece",1,null,null,null,null,null],["Grater","Piece",1,null,null,null,null,null],["Bar Spoon","Piece",1,null,null,null,null,null],["Hawthorn Strainer","Piece",1,null,null,null,null,null],["Shaker","Piece",1,null,null,null,null,null],["Jigger","Piece",1,null,null,null,null,null],["Lime Squeezer","Piece",1,null,null,null,null,null],["Lamps","Piece",8,null,null,null,null,null],"H:EXECUTIVE BAR",["Hamilton Beach Blender","Piece",1,null,null,null,null,null],["Espresso Grinder Machine","Piece",1,null,null,null,null,null],["Mahlkhonhg V60 grinder","Piece",1,null,null,null,null,null],["Coffee Knock Off","Piece",1,null,null,null,null,null],["Rubber Coffee Tamper","Piece",1,null,null,null,null,null],["Simonelli Machine","Piece",1,null,null,null,null,null],["Black Display Plate","Piece",2,null,null,null,null,null],["Nua Display Organizer","Piece",2,null,null,null,null,null],["Black Flat Display","Piece",1,null,null,null,null,null],["V60 Coffee Filter Glass","Piece",2,null,null,null,null,null],["Bar Mat","Piece",2,null,null,null,null,null],["Grater","Piece",1,null,null,null,null,null],["Steaming Pitcher","Piece",1,null,null,null,null,null],["Lime Squeeze","Piece",2,null,null,null,null,null],["Bar Spoon","Piece",1,null,null,null,null,null],["Garnish Trays","Piece",4,null,null,null,null,null],["Bar Organizer","Piece",1,null,null,null,null,null],["Strainer","Piece",1,null,null,null,null,null],["Hawthorn Strainer","Piece",1,null,null,null,null,null],["Picker Thongs","Piece",1,null,null,null,null,null],["Glass Short Jars","Piece",5,null,null,null,null,null],["Glass Long Jars","Piece",3,null,null,null,null,null],["Cylinder Garnish Glass","Piece",3,null,null,null,null,null],["Weighing Scale","Piece",2,null,null,null,null,null],["Garnish Bar Storage","Piece",1,null,null,null,null,null],["Shaker","Piece",1,null,null,null,null,null],["Jigger","Piece",1,null,null,null,null,null],["Brewista Water Kettle","Piece",1,null,null,null,null,null],["V60 Filter Storage","Piece",1,null,null,null,null,null],["Thongs","Piece",1,null,null,null,null,null],["Ice Scooper","Piece",1,null,null,null,null,null],["Wide Black Plates","Piece",2,null,null,null,null,null],["Salt Shaker","Piece",24,null,null,null,null,null],["Pepper Shaker","Piece",26,null,null,null,null,null],["QR Code Cubes","Piece",3,null,null,null,null,null],["Tissue Boxes","Piece",2,null,null,null,null,null],["Trays","Piece",8,null,null,null,null,null],["Alacarte Menus","Piece",6,null,null,null,null,null],["Beverage Menu","Piece",5,null,null,null,null,null],["Menu QR Codes","Piece",17,null,null,null,null,null],["Assorted Vases","Piece",4,null,null,null,null,null],["Wooden Vallet Stand","Piece",2,null,null,null,null,null],["Wine Storsint Glass","Piece",10,null,null,null,null,null],["Bourbon Bottle Glass","Piece",8,null,null,null,null,null],["Baby Chairs","Piece",2,null,null,null,null,null],["Label Mark Gun","Piece",1,null,null,null,null,null],["Emergency Sets","Piece",1,null,null,null,null,null],"H:HYDRATION STATION 1",["Coffee Machine","Piece",1,null,null,null,null,null],["Wooden Display Box","Piece",1,null,null,null,null,null],["Vase Display","Piece",1,null,null,null,null,null],["Vacummed Dallah","Piece",1,null,null,null,null,null],["High Wooden Display Box","Piece",1,null,null,null,null,null],["Nua Display Box","Piece",1,null,null,null,null,null],["Black Plate Tea Display","Piece",1,null,null,null,null,null],["Tissue Boxes","Piece",1,null,null,null,null,null],["Assorted White Vases","Piece",1,null,null,null,null,null],["Trash Cans","Piece",1,null,null,null,null,null],"H:GARDEN",["Assorted Books","Piece",10,null,null,null,null,null],["Castle Design","Piece",1,null,null,null,null,null],["Assorted Vases","Piece",8,null,null,null,null,null],["QR Code Boxes","Piece",3,null,null,null,null,null],["Bonsai Trees","Piece",2,null,null,null,null,null],["Deco 79 Abstract Polystone","Piece",2,null,null,null,null,null],["Wooden Valet Stand","Piece",2,null,null,null,null,null],["Sfeer Membership Info Cards","Piece",1,null,null,null,null,null],["Prayer Mats","Piece",4,null,null,null,null,null],["Trash cans","Piece",2,null,null,null,null,null],["Lamps","Piece",4,null,null,null,null,null],["QUIET ROOM","Piece",null,null,null,null,null,null],["Small Pillows","Piece",9,null,null,null,null,null],["Big Pillows","Piece",9,null,null,null,null,null],["Small Trash Cans","Piece",3,null,null,null,null,null],"H:TERRACE — HYDRATION 2",["Coffee Machine","Piece",1,null,null,null,null,null],["Wooden Display Box","Piece",1,null,null,null,null,null],["Vase Display","Piece",1,null,null,null,null,null],["Trash Cans","Piece",1,null,null,null,null,null],["High Wooden Display Box","Piece",1,null,null,null,null,null],["Tissue Boxes","Piece",1,null,null,null,null,null],["Black Plate Tea Display","Piece",1,null,null,null,null,null],"H:PRAYER ROOM",["Qur'an Book","Piece",2,null,null,null,null,null],["Trash Bin Towel","Piece",1,null,null,null,null,null],["Black Plate","Piece",1,null,null,null,null,null],"H:OFFICE",["Towel Warmer Machine","Piece",1,null,null,null,null,null],["Boarding Gate Signage Pillars","Piece",4,null,null,null,null,null],["Trash Bins","Piece",13,null,null,null,null,null],["Mosquito Racket","Piece",1,null,null,null,null,null],["Vase","Piece",1,null,null,null,null,null],["Wall Decor","Piece",14,null,null,null,null,null],["Small Printer Label","Piece",1,null,null,null,null,null],["Lounge Signages","Piece",3,null,null,null,null,null],["Water Kettle","Piece",2,null,null,null,null,null],["Iphone Boxes","Piece",4,null,null,null,null,null],["Cold Brew Ornaments","Piece",1,null,null,null,null,null],["Lavender Vase","Piece",2,null,null,null,null,null],["Adaptors Chargers","Piece",5,null,null,null,null,null],["Alacarte Menu","Piece",6,null,null,null,null,null],["Beverage Menu","Piece",5,null,null,null,null,null],["Buffet Labels Sets","Piece",2,null,null,null,null,null],["Lavender Flowers","Piece",1,null,null,null,null,null],["Lavender Seeds Jars","Piece",4,null,null,null,null,null],["Two-Way Radio","Piece",3,null,null,null,null,null],["First Aid Kits","Piece",2,null,null,null,null,null],["Steamer","Piece",4,null,null,null,null,null]]},{"id":"bev","en":"Beverage Corner","ar":"ركن المشروبات","d":"August 07, 2026","by":"Sharm @6am","rows":[["Coca-Cola Regular","Piece",22,"2026-10-11",null,"OK",null,null],["Al Rabie Alphonso Mango","Piece",5,"2026-12-06",null,"OK",null,null],["Al Rabie Apple Juice","Piece",2,"2027-02-04",null,"OK",null,null],["Al Rabie Pineapple Juice","Piece",1,"2026-12-01",null,"OK",null,null],["Belli·No","Piece",7,"2028-05-31",null,"OK",null,null],["Berain Sparkling Water","Piece",25,"2027-04-27",null,"OK",null,null],["Berain Still Water","Piece",14,"2027-05-19",null,"OK",null,null],["Juhayna Pineapple Juice","Piece",2,"2026-10-11",null,"OK",null,null],["Fabbri Passion Fruit Plus","Bottle",1,"2028-09-22",null,"OK",null,null],["Fanta Orange","Piece",5,"2026-09-17",null,"OK",null,null],["Coca-Cola Regular","Piece",2,"2026-12-25",null,"OK",null,null],["Milaf Cola","Piece",12,"2027-06-18",null,"OK",null,null],["Monin Blueberry 750 ml (Premium Gourmet Syrup)","Bottle",4,"2027-02-16",null,"OK",null,null],["Monin Blueberry 750 ml","Bottle",1,"2026-11-03",null,"OK",null,null],["Monin Butterfly Pea","Bottle",2,"2028-02-26",null,"OK",null,null],["Monin Coconut Puree","Bottle",2,"2027-04-11",null,"OK",null,null],["Monin Hazelnut","Bottle",1,"2026-11-04",null,"OK",null,null],["Monin Lavender","Bottle",1,"2028-05-27",null,"OK",null,null],["Monin Pomegranate","Box",1,"2026-08-28",null,"Expiring soon",null,null],["Monin Pure Cane Sugar","Bottle",2,"2028-07-30",null,"OK",null,null],["Monin Vanilla","Bottle",1,"2028-07-30",null,"OK",null,null],["Monin Wild Mint","Bottle",1,"2028-07-08",null,"OK",null,null],["Monin Yuzu","Bottle",2,"2027-07-07",null,"OK",null,null],["Philadelphia Cream Cheese","Piece",9,"2026-10-31",null,"OK",null,null],["Rossi·No","Piece",7,"2028-05-31",null,"OK",null,null],["Schweppes Ginger Ale","Piece",6,"2026-12-07",null,"OK",null,null],["Schweppes Tonic Water","Piece",0,"2026-07-30",null,"Out of stock",null,null],["Sprite","Piece",2,"2026-09-24",null,"OK",null,null],["Vimto","Piece",6,"2027-01-13",null,"OK",null,null],["Coke Light","Piece",6,"2026-09-21",null,"OK",null,null],["BritviC Tonic Water","Piece",12,"2027-07-12",null,"OK",null,null],["Mountain Dew","Piece",6,"2026-09-19",null,"OK",null,null],["7-up Regular","Piece",6,"2027-01-31",null,"OK",null,null],["Pepsi Diet","Piece",6,"2026-09-18",null,"OK",null,null],["Mirinda citrus","Piece",6,"2027-01-14",null,"OK",null,null],["Soda water","Piece",5,"2027-02-18",null,"OK",null,null]]},{"id":"dry","en":"Dry Store","ar":"المستودع الجاف","d":"August 16, 2026)","by":"Jera @6:02am","rows":[["MILK: Saudia Oat Milk","Piece",3,"2026-10-18",null,"OK",null,null],["MILK: Alpro Soya milk","Piece",11,"2027-02-08",null,"OK",null,null],["MILK: Condense","Piece",25,"2027-03-31",null,"OK","Expired label: 11/2026",null],["MILK: Full-fat","Piece",3,"2027-03-18",null,"OK",null,null],["Milk: Lowfat","Piece",16,"2027-01-31",null,"OK",null,null],["Milk: Alpro Coconut","Piece",11,"2026-12-28",null,"OK",null,null],["MILK: Alpro Oat Barista","Piece",11,"2026-10-12",null,"OK",null,null],["MILK: Saudia Almond Milk","Piece",6,"2026-10-05",null,"OK",null,null],["BEVERAGE: Milaf always dates","Piece",24,"2027-05-15",null,"OK",null,null],["BEVERAGE: Milaf lemon","Piece",24,"2027-05-07",null,"OK",null,null],["BEVERAGE: Milaf citrus","Piece",24,"2027-06-27",null,"OK",null,null],["BEVERAGE: Milaf Cola","Piece",32,"2026-11-25",null,"OK",null,null],["BEVERAGE: Bud Zero","Piece",27,"2026-12-11",null,"OK",null,null],["BEVERAGE: Coke Regular","Piece",24,"2027-03-10",null,"OK",null,null],["BEVERAGE: Schweppes Tonic Water","Piece",null,null,null,"Out of stock",null,null],["BEVERAGE: BritviC Tonic Water","Box",24,"2027-07-12",null,"OK",null,null],["BEVERAGE: Fanta","Piece",24,"2026-09-17",null,"OK",null,null],["BEVERAGE: Coke Light","Piece",86,"2026-10-11",null,"OK",null,null],["BEVERAGE: Mirinda Orange","Piece",24,"2027-02-17",null,"OK",null,null],["BEVERAGE: Pepsi Diet","Piece",48,"2027-11-17",null,"OK",null,null],["BEVERAGE: 7-UP Regular","Piece",24,"2027-01-31",null,"OK",null,null],["BEVERAGE: Pepsi Regular","Piece",52,"2027-03-11",null,"OK",null,null],["BEVERAGE: Sprite","Piece",42,"2026-09-23",null,"OK",null,null],["BEVERAGE: Milaf Cola","Piece",55,"2027-06-18",null,"OK",null,null],["BEVERAGE: 7-UP Zero","Piece",84,"2026-09-11",null,"Expiring soon",null,null],["BEVERAGE: Mirinda Orange","Piece",15,"2027-02-17",null,"OK",null,null],["BEVERAGE: Fanta Orange","Piece",24,"2026-09-17",null,"OK",null,null],["BEVERAGE: Mountain Dew","Piece",47,"2026-09-12",null,"Expiring soon",null,null],["BEVERAGE: Mirinda Citrus","Piece",74,"2027-02-13",null,"OK",null,null],["BEVERAGE: Pepsi Diet","Piece",28,"2026-09-18",null,"OK",null,null],["BEVERAGE: Ginger Ale","Piece",12,"2027-02-25",null,"OK",null,null],["COFFEE :Jazean Coffee-Al Majaz Mountain espresso beans 1kg","Piece",6,"2027-01-01",null,"OK",null,null],["COFFEE: Caffeine Lab","Bag",5,"2027-06-08",null,"OK",null,null],["COFFEE: Jazean Coffee — Manjad Mountain (saudi coffee)","Piece",5,"2027-05-13",null,"OK","use within a year of production date",null],["COFFEE: Jazean Coffee — 250 g Al Majaz Mountain (espresso)","Piece",0,"2027-04-19",null,"Out of stock","Finished",null],["COFFEE: Jazean Coffee  — Faifa Mountain (Cold Brew)","Piece",13,"2027-01-05",null,"OK","use within a year of production date",null],["COFFEE: Jazean Coffee — Al Aswad Mountain (V60)","Piece",13,"2027-07-07",null,"OK","use within a year of production date",null],["COFEE: Jazean Coffee — 1 kg Al Majaz Mountain (espresso)","Piece",0,"2027-04-19",null,"Out of stock","Finished",null],["COFFEE: Piacetto Traditionale Grey","Bag",5,"2027-09-07",null,"OK",null,null],["COFFEE: Daliat Aliazera — Saudi Coffee","Box",1,"2027-12-01",null,"OK",null,null],["COFFEE: Nescafe Decaf","Box",2,"2028-01-30",null,"OK",null,null],["HOT CHOCOLATE POWDER","Bag",4,"2027-01-18",null,"OK",null,null],["TEA: TWG Jasmine","Box",10,"2028-05-28",null,"OK","Item located in chamber: I put it here for the mean time",null],["TEA: TWG Chamomile","Box",10,"2027-11-28",null,"OK","Item located in chamber: I put it here for the mean time",null],["TEA: TWG English Breakfast","Box",10,"2028-08-15",null,"OK","Item located in chamber: I put it here for the mean time",null],["TEA: TWG Sencha","Box",10,"2027-11-28",null,"OK","Item located in chamber: I put it here for the mean time",null],["MOCKTAIL: Lavender Syrup","Bottle",2,"2028-05-27",null,"OK",null,null],["MOCKTAIL: Wild Mint Syrup","Bottle",2,"2028-07-08",null,"OK",null,null],["MOCKTAIL: Passion Fruit Puree","Bottle",2,"2028-09-22",null,"OK",null,null],["MOCKTAIL: Butterfly Pea Syrup","Bottle",3,"2028-02-26",null,"OK",null,null],["MOCKTAIL: Yuzo Pureé","Bottle",1,"2027-07-07",null,"OK",null,null],["MOCKTAIL:coconut Puree","Bottle",2,"2027-04-11",null,"OK",null,null],"H:CONDIMENTS: White Sugar Sachet",["CONDIMENTS: Pepper","Sachet",1000,"2028-01-01",null,"OK","Month only (no day)",null],["CONDIMENTS: RX Sugar","Sachet",1000,"2028-07-01",null,"OK","Month only (no day)",null],["CONDIMENTS: Salt","Sachet",1000,"2028-04-01",null,"OK","Month only (no day)",null],["CONDIMENTS: White Sugar Cubes","Sachet",1000,"2027-01-24",null,"OK","4 Big Cans inside boxes",null],["CONDIMENTS: Brown Sugar Cubes","Box",29,"2026-12-24",null,"OK",null,null],["CONDIMENTS: Marmalade Jam","Piece",60,"2027-06-17",null,"OK",null,null],["CONDIMENTS: Strawberry Jam","Piece",60,"2027-11-27",null,"OK",null,null],["CONDIMENTS: Tabasco","Piece",293,"2027-04-30",null,"OK",null,null],["CONDIMENTS:Brown Sugar sachet","Box",1,null,null,"OK",null,null],["KITCHEN: White Sugar 5kls","Bag",4,"2030-09-15",null,"OK",null,null],["KITCHEN: Garlic Powder","Bag",6,"2027-05-31",null,"OK",null,null],["KITCHEN: Aljouf Olive Oil","Piece",216,"2027-11-01",null,"OK",null,null],["KITCHEN: Tomato Ketchup","Piece",21,"2027-04-01",null,"OK",null,null],["KITCHEN: Fig Jam","Piece",12,"2028-06-09",null,"OK",null,null],["KITCHEN: Mara Olive oil","Bottle",3,"2028-01-29",null,"OK",null,null],["KITCHEN: Cardamom Medium","Box",1,"2027-10-01",null,"OK",null,null],["KITCHEN: Oregano Leaves","Piece",6,"2029-06-01",null,"OK",null,null],["KITCHEN: Tumeric Powder","Piece",5,null,null,"OK",null,null],["KITCHEN: Aljameel Olive Oil","Gallon",18,"2028-06-07",null,"OK",null,null],["KITCHEN: Carrs:-Water Crackers","Box",4,"2026-10-17",null,"OK",null,null],["KITCHEN: Arabic Sweets","Piece",100,"2026-10-07",null,"OK",null,null],["KITCHEN: Herman French Dressing","Piece",84,"2027-01-20",null,"OK",null,null],["KITCHEN: Hernan Italian Dressing","Piece",80,"2026-12-10",null,"OK",null,null],["KITCHEN: Afia Cardamon","Box",1,"2027-10-31",null,"OK",null,null],["KITCHEN: Black Lime","Jar",1,"2027-09-07",null,"OK",null,null],["KITCHEN: Sesame Seeds","Bag",4,"2026-09-01",null,"Expiring soon",null,null],["KITCHEN: Coriander Powder","Bottle",1,"2027-03-31",null,"OK","Expired label: 03/2027",null],["KITCHEN: Peep Baked Beans","Box",2,"2027-05-01",null,"OK",null,null],["JUICES: Mango Juice","Carton",9,"2027-04-27",null,"OK",null,null],["JUICES: Apple Juice","Carton",11,"2027-03-05",null,"OK",null,null],["JUICE: Pineapple Juice","Carton",1,"2026-12-01",null,"OK",null,null],["CHILLER: 7-Up Zero","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Sprite","Piece",2,"2026-09-24",null,"OK",null,null],["CHILLER: Coke Light","Piece",2,"2026-09-21",null,"OK",null,null],["CHILLER: Fanta Orange","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Mirinda Citrus","Piece",0,"2026-08-24",null,"Out of stock","Finished",null],["CHILLER: Bud Zero","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Coke Regular","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Fanta","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Mountain Dew","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Pepsi Diet","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Pepsi Blue","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Ginger Ale","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Tonic Water","Piece",null,null,null,"Out of stock",null,null],["CHILLER: 7-up Zero","Piece",null,null,null,"Out of stock",null,null],["CHILLER: Milaf Cola","Piece",null,null,null,"Out of stock",null,null],["Philadelphia Cream cheese","Piece",21,"2026-11-30",null,"OK",null,null],["Carrs: Selection of Biscuits","Box",1,"2026-10-10",null,"OK",null,null],["Granola Bio Crunchy","Box",4,"2027-04-07",null,"OK",null,null],["Complimentary Dates","Box",8,"2027-02-21",null,"OK",null,null],["Black Lentils","Bag",1,"2027-09-09",null,"OK",null,null],["Nestle Country Flakes","Box",13,"2027-05-19",null,"OK",null,null],["Monbana Chocolate Powder","Bag",320,"2027-04-07",null,"OK",null,null],["Cookie Soft Choco Chunks","Box",8,"2027-01-20",null,"OK",null,null],["Vimto","Piece",5,"2027-01-13",null,"OK",null,null],["Juhayna Pineapple Juice","Piece",9,"2026-12-25",null,"OK",null,null],["Tomato Juice","Piece",24,"2027-02-07",null,"OK",null,null],["Honey Jar","Piece",28,"2027-05-31",null,"OK",null,null],["SCC Alwadi Blend Filter — V60",null,8,"2028-01-03",null,"OK",null,null],["SCC Alwadi Espresso Blend","Piece",1,"2028-01-03",null,"OK",null,null],["Muesli Crunchy Corn Flakes","Piece",4,"2027-04-07",null,"OK",null,null],["Nature Valley crunchy","Box",1,"2026-11-15",null,"OK",null,null],["Fitness Granola","Carton",1,"2027-02-25",null,"OK",null,null],["MULTIPURPOSE CREAM ALTERNATIVE 8 X 1LTR","Box",1,"2027-05-19",null,"OK",null,null],["COFFEE: Jazean Al Majaz Coffee Beans","Piece",2,"2027-01-13",null,"OK",null,null],["Schweppes Sparkling Water","Box",4,"2027-03-24",null,"OK",null,null],["Schweppes Sparkling Water","Box",1,null,null,null,null,null],["Yuzu Puree","Piece",1,"2027-07-30",null,"OK",null,null],["KITCHEN: Burrata Frozen","Piece",28,"2027-05-13",null,"OK",null,null],["KITCHEN: Vegan Mayonnaise","Piece",15,"2027-06-19",null,"OK",null,null],["KITCHEN: Oriental Sweet","Box",2,"2026-10-07",null,"OK",null,null],["KITCHEN: Knorr Hollandaise Sauce","Piece",15,"2027-02-18",null,"OK",null,null],["BEVERAGE: Milaf Up","Piece",24,"2027-06-28",null,"OK",null,null],["BEVERAGE: Milaf Loumi","Piece",24,"2027-05-07",null,"OK",null,null]]},{"id":"buffet","en":"Buffet","ar":"البوفيه","d":"August 7, 2026","by":"Sharm @6am","rows":[["7-up Regular","Piece",21,"2027-01-31",null,"OK",null,null],["7-up Zero","Piece",18,"2026-08-29",null,"Expiring soon",null,null],["Bud Zero","Piece",24,"2026-12-11",null,"OK",null,null],["Milaf Cola","Piece",52,"2026-11-23",null,"OK",null,null],["Milaf Loumi","Piece",0,"2026-11-28",null,"Out of stock",null,null],["Milaf Up","Piece",5,"2026-12-19",null,"OK",null,null],["Mirinda Citrus","Piece",25,"2027-02-13",null,"OK",null,null],["Mirinda Orange","Piece",22,"2027-01-27",null,"OK",null,null],["Mountain Dew","Piece",12,"2026-09-19",null,"OK",null,null],["Pepsi Diet","Piece",24,"2026-08-29",null,"Expiring soon",null,null],["Pepsi Regular","Piece",3,"2026-09-14",null,"Expiring soon",null,null],["Pepsi Regular","Piece",15,"2027-03-11",null,"OK",null,null],["Pepsi Regular","Piece",2,"2027-02-28",null,"OK",null,null],["Pepsi Regular","Piece",7,"2027-01-29",null,"OK",null,null],["MILK: Saudia Oat Milk","Piece",3,"2026-10-18",null,"OK",null,null],["MILK: Alpro Soy milk","Carton",1,"2027-02-08",null,"OK",null,null],["MILK: Condense","Carton",1,null,null,"OK",null,null],["MILK: Full-fat","Carton",4,"2027-03-18",null,"OK",null,null],["Milk: Lowfat","Carton",2,"2027-01-31",null,"OK",null,null],["Milk: Alpro Coconut","Carton",1,"2026-12-28",null,"OK",null,null],["MILK: Alpro Oat Barista","Carton",1,"2026-10-12",null,"OK",null,null],["MILK: Saudia Almond Milk","Carton",1,"2026-11-17",null,"OK",null,null]]},{"id":"cafe","en":"Café","ar":"المقهى","d":"August 7,2026","by":"Sharm @5am","rows":[["Almarai Fullfat","Piece",3,"2027-03-15",null,"OK",null,null],["Almarai Lowfat","Piece",2,"2027-01-31",null,"OK",null,null],["Alpro Coconut Milk","Piece",1,"2026-12-28",null,"OK",null,null],["Alpro Oat Milk","Piece",2,"2026-10-13",null,"OK",null,null],["Honey","Piece",15,"2029-01-31",null,"OK",null,null],["Caffein Lab Coffee Beans","Bag",1,"2027-06-08",null,"OK",null,null],["Complimentary Dates Box","Piece",10,"2027-02-21",null,"OK",null,null],["Cubes: Brown Sugar","Box",2,"2026-12-24",null,"OK",null,null],["Cubes: White Sugar","Box",2,"2030-01-24",null,"OK",null,null],["Kayanee Dark Chocolate (Coffee)","Bottle",0,"2026-07-21",null,"Out of stock",null,null],["Nescafe Decaf","Piece",30,"2028-01-01",null,"OK",null,null],["Pure Selection Chocolate Powder","Jar",1,"2026-09-28",null,"OK",null,null],["Saudi Coffee (Dallat Aliazera)","Box",1,null,null,"OK",null,null],["Saudia Almond Milk","Carton",2,"2026-11-13",null,"OK",null,null],["Saudia Soy Milk","Carton",0,"2026-08-21",null,"Out of stock",null,null],["Stevia","Sachet",30,null,null,"OK",null,null],["TWG Chamomile Tea","Sachet",10,"2027-11-28",null,"OK",null,null],["TWG Earl Grey Tea","Sachet",9,"2028-05-28",null,"OK",null,null],["TWG English Breakfast Tea","Sachet",6,"2028-08-15",null,"OK",null,null],["TWG Grand Jasmine Tea","Sachet",7,"2028-05-28",null,"OK",null,null],["TWG Sencha","Piece",13,"2027-11-28",null,"OK",null,null],["Saffron Box","Box",1,null,null,"OK",null,null],["Saudia Oat Milk","Carton",2,"2026-10-18",null,"OK",null,null],["Almarai Condensed Milk","Piece",1,null,null,"OK",null,null],["Jazean Coffee  — Faifa Mountain","Piece",2,"2027-01-05",null,"OK",null,null],["Jazean Coffee — Al Aswad Mountain","Piece",2,"2027-06-14",null,"OK",null,null]]},{"id":"exec","en":"Executive Bar","ar":"البار التنفيذي","d":"August 7, 2026","by":"Sharm@6 am","rows":[["Caffein Lab Coffee","Bag",4,"2027-05-25",null,"OK",null,null],["Piacetto Traditionale Grey","Bag",1,"2027-09-17",null,"OK",null,null],["Al Rabie Apple Juice","Carton",1,"2027-03-05",null,"OK",null,null],["Al Rabie Mango Juice","Carton",1,"2026-09-03",null,"Expiring soon",null,null],["Juhayna Pineapple Juice","Piece",1,"2026-12-25",null,"OK",null,null],["Almarai Condensed Milk","Piece",1,"2026-11-01",null,"OK",null,null],["Almarai Full Fat Milk","Carton",3,"2027-03-18",null,"OK",null,null],["Almarai Lowfat Milk","Carton",2,"2027-02-17",null,"OK",null,null],["Alpro Barista Oat","Carton",1,"2026-10-12",null,"OK",null,null],["Alpro Coconut Milk","Carton",1,"2026-12-18",null,"OK",null,null],["Alpro Nutty Almond","Carton",1,"2026-11-13",null,"OK",null,null],["Complimentary dates","Box",30,"2027-02-21",null,"OK",null,null],["Cubes: Brown Sugar","Jar",1,"2026-12-24",null,"OK",null,null],["Cubes: White Sugar","Jar",1,"2030-01-24",null,"OK",null,null],["Fabbri Passion Fruit","Box",1,"2028-09-22",null,"OK",null,null],["Ginger Ale","Piece",20,"2026-12-07",null,"OK",null,null],["Kayanee Dark Chocolate (Coffee)","Bottle",0,"2026-07-21",null,"Out of stock",null,null],["Monin Butterfly Pea","Bottle",1,"2028-02-26",null,"OK",null,null],["Monin Coconut Puree","Bottle",1,"2027-04-11",null,"OK",null,null],["Monin Lavender Syrup","Bottle",1,"2028-05-27",null,"OK",null,null],["Monin Wild Mint Syrup","Bottle",1,"2028-07-08",null,"OK",null,null],["Monin Yuzu Puree","Bottle",1,"2027-07-07",null,"OK",null,null],["Nescafe Decaf","Piece",32,"2028-01-01",null,"OK",null,null],["Kayanee Hydration Selection","Box",0,"2026-08-31",null,"Out of stock",null,null],["Philadelphia Cream Cheese","Piece",2,"2026-10-31",null,"OK",null,null],["Saudia Almond Milk","Piece",1,"2026-11-13",null,"OK",null,null],["Saudia Oat Milk","Piece",1,"2027-07-26",null,"OK",null,null],["Alpro Soya Milk","Piece",0,"2026-08-21",null,"Out of stock",null,null],["Steviana S.","Piece",28,"2027-06-01",null,"OK",null,null],["Tomato Juice","Piece",1,"2027-02-17",null,"OK",null,null],["TWG Chamomile Tea","Sachet",9,"2027-11-28",null,"OK",null,null],["TWG Earl Grey","Sachet",8,"2028-05-28",null,"OK",null,null],["TWG English Breakfast Tea","Sachet",12,"2028-08-15",null,"OK",null,null],["TWG Grand Jasmine Tea","Sachet",15,"2028-05-28",null,"OK",null,null],["TWG Sencha","Sachet",11,"2027-11-28",null,"OK",null,null],["SODAS: Coca Cola Regular","Piece",12,"2027-01-07",null,"OK",null,null],["SODAS: Coke Light","Piece",13,"2026-09-21",null,"OK",null,null],["SODAS: 7-Up Regular","Piece",14,"2026-09-25",null,"OK",null,null],["SODAS: 7-Up Zero Sugar","Piece",14,"2026-08-29",null,"Expiring soon",null,null],["SODAS: Bud Zero","Bottle",9,"2026-12-11",null,"OK",null,null],["SODAS: Fanta Orange","Bottle",12,"2026-09-17",null,"OK",null,null],["SODAS: Milaf Cola","Piece",18,"2027-04-02",null,"OK",null,null],["SODAS: Mirinda C.","Piece",15,"2027-02-13",null,"OK",null,null],["SODAS: Vimto","Piece",0,"2027-01-13",null,"Out of stock",null,null],["SODAS: Mirinda Orange","Piece",18,"2027-01-27",null,"OK",null,null],["SODAS: Mountain Dew","Piece",14,"2026-09-19",null,"OK",null,null],["SODAS: Pepsi Diet","Piece",17,"2026-11-17",null,"OK",null,null],["SODAS: Pepsi Reg.","Piece",12,"2027-02-28",null,"OK",null,null],["SODAS: Sprite","Bottle",13,"2026-09-24",null,"OK",null,null],["Schweppes Tonic Water","Piece",0,"2026-07-30",null,"Out of stock",null,null],["BritviC Tonic Water","Piece",8,"2027-07-12",null,"OK",null,null],["Kayanee Electrolytes Raspberry","Piece",null,"2026-08-01",null,"Out of stock",null,null],["Kayanee Electrolytes Jasmine Plum","Piece",null,"2026-08-01",null,"Out of stock",null,null]]},{"id":"kitchen","en":"Kitchen","ar":"المطبخ","d":null,"by":null,"rows":[]},{"id":"pa","en":"Public Attendant Materials","ar":"مواد النظافة العامة","d":"August 7, 2026","by":"Sharm 6 am","rows":[["A8.8 Washing","Gallon",6,null,null,"In stock","Housekeeping Room","General"],["Aluminium foil","Roll",2,null,null,"In stock",null,"Kitchen"],["Black garbage bags","Roll",17,null,null,"In stock","Housekeeping Room","Kitchen"],["Blue bags","Roll",9,null,null,"In stock",null,"Kitchen"],["Clear apron","Piece",4,null,null,"In stock",null,"Kitchen"],["Clear bags (L)","Roll",6,null,null,"In stock","Housekeeping Room","Kitchen"],["Clear bags (S)","Roll",30,null,null,"In stock",null,"Kitchen"],["D-12 Dishwashing","Gallon",3,null,null,"In stock","Housekeeping Room","General"],["D-4 Rinse sanitizer","Box","More than half",null,null,"In stock",null,"Kitchen"],["D-9 Oven/Grill sanitizer","Box","1.5 bottle",null,null,"In stock",null,"General"],["E1e Cleaner (Sprint Flower)","Gallon",1,null,null,"In stock","Housekeeping Room","General"],["Gloves","Box",38,null,null,"In stock",null,"Kitchen"],["H5 Sanitizer","Box",1,null,null,"In stock","Housekeeping Room","General"],["Head cover","Bag",4,null,null,"In stock",null,"Kitchen"],["L6 Rinsing","Gallon",5,null,null,"In stock","Housekeeping Room","General"],["Large tissue roll","Roll",8,null,null,"In stock",null,"Kitchen"],["Room Care R-1 Plus","Sachet",2,null,null,"In stock","Housekeeping Room","Bathroom"],["Room Care R-3 Plus","Sachet",3,null,null,"In stock","Housekeeping Room","Bathroom"],["Fam Natural Cotton","Bag",5,null,null,"In stock",null,"Bathroom"],["Master Care Laying Pad","Bag",5,null,null,"In stock",null,"Bathroom"],["Pampers","Bag",3,null,null,"In stock",null,"Bathroom"],["Toilet Tissue Rolls","Bag",1,null,null,"In stock",null,"Bathroom"],["Mop Head","Piece",1,null,null,"In stock",null,"Bathroom"],["Facial Tissues","Box",8,null,null,"In stock",null,"Bathroom"],["G 70 g","Box",1,null,null,"In stock",null,"Bathroom"],["AUTOCUT TISSUE ROLL","Box",2,null,null,"In stock",null,"Bathroom"]]},{"id":"firstaid","en":"First Aid Kits","ar":"حقائب الإسعافات الأولية","d":null,"by":null,"rows":["H:OFFICE ROOM",["Cleansing wipe","Piece",2,"2028-02-01",null,"OK",null,null],["Plaster Strips","Piece",2,"2028-03-01",null,"OK",null,null],["Eye Pad","Piece",6,"2028-03-01",null,"OK",null,null],["Conforming Bandage","Piece",1,null,null,"In stock",null,null],["Plaster Strips","Carton",2,null,null,"In stock",null,null],["Eye Pads (2x3)","Carton",6,"2028-03-01",null,"OK",null,null],["Elastic Plaster Strips","Carton",1,"2028-03-01",null,"OK",null,null],["Wipes","Piece",1,"2028-02-01",null,"OK",null,null],["Wipes •",null,null,"2026-06-30",null,null,null,null],["Wipes •",null,null,"2027-02-12",null,null,null,null],"H:DRY STORAGE",["Eye Pad (3x3)","Carton",6,"2028-03-01",null,"OK",null,null],["Medical Tape","Carton",1,null,null,"In stock",null,null],["Cleansing Wipes","Carton",1,"2028-02-01",null,"OK",null,null],["Plaster Strips","Bottle",1,"2028-03-01",null,"OK",null,null],"H:EXECUTIVE DINING",["Eye Pads (3x3)","Box","-","2028-03-01",null,"OK",null,null],["Eye Pads (2x3)","Bottle","-","2028-03-01",null,"OK",null,null],["Cleansing Wipes","Piece","-","2028-02-01",null,"OK",null,null],["Plaster Strips (7x20 cm)","Bottle","-","2028-03-01",null,"OK",null,null],["Triangular Bandage","Piece",1,null,null,"In stock",null,null],["Medical Gloves","Piece",1,"2027-02-13",null,"OK",null,null],["Medical Gloves •","Piece",null,"2027-01-14",null,null,null,null],["Medical Gloves •","Piece",null,"2027-01-27",null,null,null,null],"H:BEVERAGE CORNER",["Eye Pads","Bottle",6,"2028-03-01",null,"OK",null,null],["Cleansing Wipes","Bottle","-","2028-02-01",null,"OK",null,null],["Plaster Strips","Bottle","-","2026-10-01",null,"OK",null,null],["Plaster Strips Elastic","Bottle","-","2028-03-01",null,"OK",null,null],"H:STAFF ROOM",["Zigzag Cotton","Piece",1,null,null,"In stock",null,null],["Emergency Blanket","Piece",2,null,null,"In stock",null,null],["First Aid Dressing","Bottle",2,"2027-07-01",null,"OK",null,null],["Gauze Sponges (3x3)","Piece",3,"2027-07-01",null,"OK",null,null],["Swab-stick","Piece",11,"2027-07-01",null,"OK",null,null],["Ice Pack","Carton","-","2029-01-01",null,"OK",null,null],["Tongue Depressor","Carton","-","2029-08-01",null,"OK",null,null],["Tongue Depressor •","Carton",3,"2029-06-01",null,null,null,null],["Elastic Badge (10cmx45m)","Carton",2,"2030-02-01",null,"OK",null,null],["Topical Cream","Sachet",1,"2026-12-01",null,"OK",null,null],["Prep Pads","Bottle",1,"2029-02-01",null,"OK",null,null],["Gauze Swabs","Piece",2,"2026-10-01",null,"OK",null,null],["Sterile Latex Surgical Gloves","Carton",1,"2030-01-01",null,"OK",null,null],["Elastic Badge (5cmx4.5m)","Piece",1,"2027-09-01",null,"OK",null,null],["Crepe Bandage (10cmx4.5m)","Sachet",1,"2027-06-01",null,"OK",null,null],["Alcohol Anti-septic Wipe","Sachet",20,null,null,null,null,null],["Betadine Anti-septic Swap","Sachet",5,null,null,null,null,null],["Sterile Gloves","Sachet",1,null,null,null,null,null],["Gauze Swabs","Sachet",4,null,null,null,null,null],["Burn Ointment/ Flamazine","Piece",1,null,null,null,null,null],["Plastic Tongs","Piece",2,null,null,null,null,null],["Colored Plaster","Piece",5,null,null,null,null,null],["Gauze Roll","Piece",4,null,null,null,null,null],["Gauze Roll Large","Piece",4,null,null,null,null,null],["Elastic Crepe Bandage","Piece",2,null,null,null,null,null],["Elastic Crepe Bandage Large","Piece",2,null,null,null,null,null],["Triangular Bandage","Piece",3,null,null,null,null,null],["Bandage Scissor","Piece",1,null,null,null,null,null],["Tape Plaster","Piece",1,null,null,null,null,null],["H Medi Plasts","Piece",10,null,null,null,null,null],["Dressing Roll","Piece",2,null,null,null,null,null],["Leuko Plaster","Piece",1,null,null,null,null,null]]}];
const WASTAGE=[["2026-07-01","Dry Store","Alpro Coconut Milk","06/07/2026 — 02/07/2026",9,"Expired","Expired","Sharm","Disposed on July 02 — Ermando"],["2026-07-01","Executive Bar","Alpro Coconut Milk","06/07/2026 — 02/07/2026",1,"Expired","Expired","Sharm","Disposed on July 02 — Ermando"],["2026-07-13","Dry Store","Nestle Country Corn Flakes","24/07/2026 — 13/07/2026",14,"Expired","Expired","Sharm","Disposed on July 13 — Ermando"],["2026-07-18","Dry Store","Tomato Juice","21/07/2026 — 18/07/2026",33,"Expired","Expired","Sharm","Disposed on July 18 — Jhong"],["2026-07-18","Café","Kayanee Dark Chocolate","21/07/2026 — 18/07/2026",5,"Expired","Expired","Sharm","Disposed on July 18 — Jhong"],["2026-07-18","Executive Bar","Kayanee Dark Chocolate","21/07/2026 — 18/07/2026",3,"Expired","Expired","Sharm","Disposed on July 18 — Jhong"],["2026-08-07","Dry Store","Ginger Ale","2026-08-02 00:00:00",5,"Damaged / Broken","Damaged","Sharm","Placed in wastage box — Sham"],["2026-08-07","Dry Store","Pepsi Diet","2026-08-02 00:00:00",3,"Damaged / Broken","Damaged","Sharm","Placed in wastage box — Sham"],["2026-08-07","Dry Store","Mirinda Citrus","2026-08-02 00:00:00",1,"Damaged / Broken","Damaged","Sharm","Placed in wastage box — Sham"],["2026-08-07","Dry Store","Mirinda Orange","2026-08-02 00:00:00",1,"Damaged / Broken","Damaged","Sharm","Placed in wastage box — Sham"],["2026-08-07","Dry Store","Coke Light","2026-08-06 00:00:00",4,"Damaged / Broken","Damaged","Sharm","Placed in wastage box — Sham"],["2026-08-07","Dry Store","Pepsi Diet","2026-08-06 00:00:00",1,"Damaged / Broken","Damaged","Sharm","Placed in wastage box — Sham"]];
const CATALOGS={"garden":[["Ajwa Dates","Piece",6],["Berain Sparkling Water","Bottle",12],["Berain Still Water","Bottle",12],["Cubes: Brown Sugar","Jar",1],["Cubes: White Sugar","Jar",1],["Riyadh Air Complimentary Dates","Box",6],["Stevia Sugar (Steviana)","Piece",30],["TWG Chamomile Tea","Sachet",12],["TWG Earl Grey Tea","Sachet",9],["TWG English Breakfast Tea","Sachet",13],["TWG Grand Jasmine Tea","Sachet",11]],"bev":[["Coca-Cola Regular","Piece",22]],"dry":[["MILK: Saudia Oat Milk","Piece",3],["MILK: Alpro Soya milk","Piece",11],["MILK: Condense","Piece",25],["MILK: Full-fat","Piece",3],["Milk: Lowfat","Piece",16],["Milk: Alpro Coconut","Piece",11],["MILK: Alpro Oat Barista","Piece",11],["MILK: Saudia Almond Milk","Piece",6],["BEVERAGE: Milaf Cola","Piece",32],["BEVERAGE: Bud Zero","Piece",27],["Caffein Lab Coffee","Bag",4],["BEVERAGE: Schweppes Tonic Water","Piece",null],["BEVERAGE: BritviC Tonic Water","Box",24],["BEVERAGE: Fanta","Piece",24],["BEVERAGE: Coke Light","Piece",86],["BEVERAGE: Mirinda Orange","Piece",24],["BEVERAGE: Pepsi Diet","Piece",48],["BEVERAGE: 7-UP Regular","Piece",24],["BEVERAGE: Pepsi Regular","Piece",52],["BEVERAGE: Sprite","Piece",42],["BEVERAGE: Milaf Cola","Piece",55],["BEVERAGE: 7-UP Zero","Piece",84],["BEVERAGE: Mirinda Orange","Piece",15],["BEVERAGE: Fanta Orange","Piece",24],["BEVERAGE: Mountain Dew","Piece",47],["BEVERAGE: Mirinda Citrus","Piece",74],["BEVERAGE: Pepsi Diet","Piece",28],["BEVERAGE: Ginger Ale","Piece",12],["COFFEE :Jazean Coffee-Al Majaz Mountain espresso beans 1kg","Piece",6],["COFFEE: Caffeine Lab","Bag",5],["COFFEE: Jazean Coffee — Manjad Mountain (saudi coffee)","Piece",5],["COFFEE: Jazean Coffee — 250 g Al Majaz Mountain (espresso)","Piece",0],["COFFEE: Jazean Coffee  — Faifa Mountain (Cold Brew)","Piece",13],["COFFEE: Jazean Coffee — Al Aswad Mountain (V60)","Piece",13],["COFEE: Jazean Coffee — 1 kg Al Majaz Mountain (espresso)","Piece",0],["#REF!","#REF!","#REF!"],["COFFEE: Daliat Aliazera — Saudi Coffee","Box",1],["COFFEE: Nescafe Decaf","Box",2],["HOT CHOCOLATE POWDER","Bag",4],["TEA: TWG Jasmine","Box",10],["TEA: TWG Chamomile","Box",10],["TEA: TWG English Breakfast","Box",10],["TEA: TWG Sencha","Box",10],["MOCKTAIL: Lavender Syrup","Bottle",2]],"buffet":[["7-up Regular","Piece",21],["7-up Zero","Piece",18],["Bud Zero","Piece",24],["Milaf Cola","Piece",52],["Milaf Loumi","Piece",0],["Milaf Up","Piece",5],["Mirinda Citrus","Piece",25],["Mirinda Orange","Piece",22],["Mountain Dew","Piece",12],["Pepsi Diet","Piece",24],["Pepsi Regular","Piece",3],["Pepsi Regular","Piece",15],["Pepsi Regular","Piece",2],["Pepsi Regular","Piece",7],["MILK: Saudia Oat Milk","Piece",3],["MILK: Alpro Soy milk","Carton",1],["MILK: Condense","Carton",1],["MILK: Full-fat","Carton",4],["Milk: Lowfat","Carton",2],["Milk: Alpro Coconut","Carton",1],["MILK: Alpro Oat Barista","Carton",1],["MILK: Saudia Almond Milk","Carton",1]],"cafe":[["Almarai Fullfat","Piece",3],["Almarai Lowfat","Piece",2],["Alpro Coconut Milk","Piece",1],["Alpro Oat Milk","Piece",2],["Honey","Piece",15],["Caffein Lab Coffee Beans","Bag",1],["Complimentary Dates Box","Piece",10],["Cubes: Brown Sugar","Box",2],["Cubes: White Sugar","Box",2],["Kayanee Dark Chocolate (Coffee)","Bottle",0],["Nescafe Decaf","Piece",30],["Pure Selection Chocolate Powder","Jar",1],["Saudi Coffee (Dallat Aliazera)","Box",1],["Saudia Almond Milk","Carton",2],["Saudia Soy Milk","Carton",0],["Stevia","Sachet",30],["TWG Chamomile Tea","Sachet",10],["TWG Earl Grey Tea","Sachet",9],["TWG English Breakfast Tea","Sachet",6],["TWG Grand Jasmine Tea","Sachet",7],["TWG Sencha","Piece",13],["Saffron Box","Box",1],["Saudia Oat Milk","Carton",2],["Almarai Condensed Milk","Piece",1],["Jazean Coffee  — Faifa Mountain","Piece",2],["Jazean Coffee — Al Aswad Mountain","Piece",2]],"exec":[["Caffein Lab Coffee","Bag",4],["Piacetto Traditionale Grey","Bag",1],["Al Rabie Apple Juice","Carton",1],["Al Rabie Mango Juice","Carton",1],["Juhayna Pineapple Juice","Piece",1],["Almarai Condensed Milk","Piece",1],["Almarai Full Fat Milk","Carton",3],["Almarai Lowfat Milk","Carton",2],["Almarai Lowfat Milk","Carton",2],["Alpro Barista Oat","Carton",1],["Alpro Coconut Milk","Carton",1],["Alpro Coconut Milk","Carton",1],["Alpro Nutty Almond","Carton",1],["Alpro Nutty Almond","Carton",1],["Complimentary dates","Box",30],["Philadelphia Cream Cheese","Piece",2],["Cubes: White Sugar","Jar",1],["Fabbri Passion Fruit","Box",1],["Ginger Ale","Piece",20],["Kayanee Dark Chocolate (Coffee)","Bottle",0],["Monin Butterfly Pea","Bottle",1],["Monin Coconut Puree","Bottle",1],["Monin Lavender Syrup","Bottle",1],["Monin Wild Mint Syrup","Bottle",1],["Monin Wild Mint Syrup","Bottle",1],["Nescafe Decaf","Piece",32],["Kayanee Hydration Selection","Box",0],["Philadelphia Cream Cheese","Piece",2],["Saudia Almond Milk","Piece",1],["Saudia Oat Milk","Piece",1],["Alpro Soya Milk","Piece",0],["Steviana S.","Piece",28],["Tomato Juice","Piece",1],["TWG Chamomile Tea","Sachet",9],["TWG Earl Grey","Sachet",8],["TWG English Breakfast Tea","Sachet",12],["TWG Grand Jasmine Tea","Sachet",15],["TWG Sencha","Sachet",11],["SODAS: Coca Cola Regular","Piece",12],["SODAS: Coke Light","Piece",13],["SODAS: 7-Up Regular","Piece",14],["SODAS: 7-Up Zero Sugar","Piece",14],["SODAS: Bud Zero","Bottle",9],["SODAS: Fanta Orange","Bottle",12],["SODAS: Milaf Cola","Piece",18],["SODAS: Mirinda C.","Piece",15],["SODAS: Vimto","Piece",0],["SODAS: Mirinda Orange","Piece",18],["SODAS: Milaf Cola","Piece",18],["SODAS: Mirinda C.","Piece",15],["SODAS: Vimto","Piece",0],["SODAS: Mirinda Orange","Piece",18],["SODAS: Mountain Dew","Piece",14],["SODAS: Pepsi Diet","Piece",17],["SODAS: Pepsi Reg.","Piece",12],["SODAS: Sprite","Bottle",13],["1.0","1.0",1],["BritviC Tonic Water","Piece",8],["Kayanee Electrolytes Raspberry","Piece",null],["Kayanee Electrolytes Jasmine Plum","Piece",null]],"pa":[["A8.8 Washing","Gallon",6],["Aluminium foil","Roll",2],["Black garbage bags","Roll",17],["Blue bags","Roll",9],["Clear apron","Piece",4],["Clear bags (L)","Roll",6],["Clear bags (S)","Roll",30],["D-12 Dishwashing","Gallon",3],["D-4 Rinse sanitizer","Box","More than half"],["D-9 Oven/Grill sanitizer","Box","1.5 bottle"],["E1e Cleaner (Sprint Flower)","Gallon",1],["Gloves","Box",38],["H5 Sanitizer","Box",1],["Head cover","Bag",4],["L6 Rinsing","Gallon",5],["Large tissue roll","Roll",8],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2],["1.0","2.0",2]]};
const DRAFTS_INIT={"dry":[["MILK: Saudia Oat Milk","Piece",5],["Caffein Lab Coffee","Bag",5],["BEVERAGE: Fanta","Piece",5]]};
/* ============================ UI PRIMITIVES ============================== */
function Chip({ tone = "mut", children, style }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ ...TONE[tone], ...style }}>{children}</span>
  );
}
function Card({ children, className = "", style, pad = true }) {
  return (
    <div className={"rounded-xl " + className} style={{ background: T.card, border: "1px solid " + T.line, ...style }}>
      <div className={pad ? "p-4" : ""}>{children}</div>
    </div>
  );
}
function Btn({ children, onClick, kind = "ghost", size = "md", title, disabled }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-40";
  const sz = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";
  const st = kind === "solid" ? { background: T.ink, color: "#fff", border: "1px solid " + T.ink }
    : kind === "brass" ? { background: T.brass, color: "#fff", border: "1px solid " + T.brass }
    : kind === "soft" ? { background: T.vioSoft, color: T.vioText, border: "1px solid " + T.vioLine }
    : { background: "#fff", color: T.ink2, border: "1px solid " + T.line };
  return <button title={title} disabled={disabled} onClick={onClick} className={base + " " + sz} style={st}>{children}</button>;
}
function SectionTitle({ ar, en, isAr, sub, right, icon: Icon }) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
      <div className="flex items-start gap-2.5">
        {Icon && <span className="rounded-lg p-2 shrink-0" style={{ background: T.vioSoft, color: T.vio }}><Icon size={17} /></span>}
        <div>
          <h2 className="text-lg font-bold leading-tight" style={{ color: T.ink }}>{isAr ? ar : en}</h2>
          <div className="text-xs mt-0.5" style={{ color: T.mute }}>{sub || (isAr ? en : ar)}</div>
        </div>
      </div>
      {right}
    </div>
  );
}
function Empty({ ar, en, isAr }) {
  return <div className="text-center py-10 text-sm" style={{ color: T.mute }}>{isAr ? ar : en}</div>;
}
const inputCls = "w-full rounded-lg px-2.5 py-1.5 text-sm";
const inputSty = { border: "1px solid " + T.line, background: "#fff", color: T.ink };

/* ============================ ROLES / DEPARTMENTS ========================= */
const ROLES = {
  admin:   { ar: "مدير النظام",   en: "System manager", c: "#5B48C7" },
  ops:     { ar: "التشغيل",        en: "Operations",     c: "#B8934E" },
  ra:      { ar: "طيران الرياض",   en: "Riyadh Air",     c: "#1E1B33" },
  catrion: { ar: "كاتريون",        en: "Catrion",        c: "#047857" },
};
const DEPTS = [
  ["kitchen", "المطبخ", "Kitchen"], ["service", "الخدمة والصالة", "Service & floor"],
  ["cafe", "المقهى والبار", "Café & bar"], ["house", "النظافة العامة", "Housekeeping"],
  ["store", "المستودعات", "Stores"], ["maint", "الصيانة", "Maintenance"],
];
const T_STATUS = {
  new:  { ar: "جديدة", en: "New", tone: "warn" },
  work: { ar: "قيد التنفيذ", en: "In progress", tone: "vio" },
  done: { ar: "منجزة", en: "Done", tone: "ok" },
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const monthKey = (d) => String(d).slice(0, 7);
const weekKey = (d) => {
  const dt = new Date(d + "T00:00:00"); const day = (dt.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - day); return dt.toISOString().slice(0, 10);
};
const shiftDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const lastDays = (n) => Array.from({ length: n }, (_, i) => shiftDays(-(n - 1 - i)));
const shortD = (d) => String(d).slice(5);
const numOf = (v) => (typeof v === "number" && isFinite(v) ? v : 0);

/* ============================== CHART PRIMITIVES ========================== */
function ChartBox({ title, sub, children, right, tall }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <b className="text-sm block" style={{ color: T.ink }}>{title}</b>
          {sub && <div className="text-xs mt-0.5" style={{ color: T.mute }}>{sub}</div>}
        </div>
        {right}
      </div>
      <div style={{ minHeight: tall ? 200 : undefined }}>{children}</div>
    </Card>
  );
}

function VBars({ data, color = T.vio, h = 150, fmt = (v) => v }) {
  const max = Math.max(1, ...data.map(d => numOf(d.v)));
  if (!data.length) return <Empty isAr ar="لا توجد بيانات بعد" en="No data yet" />;
  return (
    <div className="flex items-end gap-1" style={{ height: h + 34 }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ minWidth: 0 }}>
          <span className="text-xs font-bold tabular" style={{ color: d.v ? T.ink : T.mute, fontSize: 10 }}>{d.v ? fmt(d.v) : ""}</span>
          <div title={d.l + ": " + d.v} style={{
            width: "100%", maxWidth: 42, borderRadius: "5px 5px 0 0",
            height: Math.max(d.v ? 3 : 0, (numOf(d.v) / max) * h),
            background: d.c || color, opacity: d.v ? 1 : .25,
          }} />
          <span className="tabular text-center" style={{ fontSize: 9.5, color: T.mute, lineHeight: 1.15 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

function GroupBars({ labels, series, h = 160 }) {
  const max = Math.max(1, ...series.flatMap(s => s.vals.map(numOf)));
  return (
    <div>
      <div className="flex items-end gap-2" style={{ height: h + 30 }}>
        {labels.map((l, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ minWidth: 0 }}>
            <div className="flex items-end justify-center gap-0.5 w-full" style={{ height: h }}>
              {series.map((s, j) => (
                <div key={j} title={s.name + " · " + l + ": " + s.vals[i]}
                  style={{ width: "30%", maxWidth: 26, borderRadius: "4px 4px 0 0", background: s.color,
                           height: Math.max(s.vals[i] ? 3 : 0, (numOf(s.vals[i]) / max) * h), opacity: s.vals[i] ? 1 : .2 }} />
              ))}
            </div>
            <span className="text-center" style={{ fontSize: 9.5, color: T.mute, lineHeight: 1.15 }}>{l}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {series.map((s, j) => (
          <span key={j} className="inline-flex items-center gap-1.5 text-xs" style={{ color: T.ink2 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />{s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function HBars({ data, color = T.brass, fmt = (v) => v, max: mx }) {
  const max = Math.max(1, mx || 0, ...data.map(d => numOf(d.v)));
  if (!data.length) return <Empty isAr ar="لا توجد بيانات بعد" en="No data yet" />;
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs truncate" style={{ color: T.ink2, maxWidth: "72%" }}>{d.l}</span>
            <span className="text-xs font-bold tabular shrink-0" style={{ color: T.ink }}>{fmt(d.v)}</span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: T.surf, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: d.c || color, width: (numOf(d.v) / max) * 100 + "%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Donut({ data, size = 148, unitAr = "", unitEn = "", isAr = true }) {
  const total = data.reduce((a, d) => a + numOf(d.v), 0);
  const R = 54, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-4 flex-wrap justify-center">
      <svg width={size} height={size} viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={R} fill="none" stroke={T.surf} strokeWidth="18" />
        {total > 0 && data.map((d, i) => {
          const frac = numOf(d.v) / total;
          const el = <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={d.c} strokeWidth="18"
            strokeDasharray={`${frac * C} ${C}`} strokeDashoffset={-acc * C} />;
          acc += frac; return el;
        })}
      </svg>
      <div className="space-y-1.5">
        <div className="text-xs" style={{ color: T.mute }}>{isAr ? "الإجمالي" : "Total"}</div>
        <div className="text-2xl font-bold tabular" style={{ color: T.ink }}>{total}<span className="text-xs font-semibold" style={{ color: T.mute }}> {isAr ? unitAr : unitEn}</span></div>
        {data.filter(d => d.v).map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: T.ink2 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: d.c }} />
            <span>{d.l}</span>
            <b className="tabular">{d.v}</b>
            <span style={{ color: T.mute }}>({total ? Math.round(d.v / total * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Trend({ series, labels, h = 150 }) {
  const all = series.flatMap(s => s.vals.map(numOf));
  const max = Math.max(1, ...all);
  const n = Math.max(2, labels.length);
  const X = (i) => (i / (n - 1)) * 100;
  const Y = (v) => 100 - (numOf(v) / max) * 92;
  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: h, overflow: "visible" }}>
        {[0, 25, 50, 75, 100].map(g => <line key={g} x1="0" x2="100" y1={g} y2={g} stroke={T.line} strokeWidth="0.4" />)}
        {series.map((s, j) => (
          <polyline key={j} fill="none" stroke={s.color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            points={s.vals.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} />
        ))}
      </svg>
      <div className="flex justify-between mt-1" style={{ fontSize: 9.5, color: T.mute }}>
        {labels.map((l, i) => <span key={i} className="tabular">{i % Math.ceil(n / 7) === 0 ? l : ""}</span>)}
      </div>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {series.map((s, j) => (
          <span key={j} className="inline-flex items-center gap-1.5 text-xs" style={{ color: T.ink2 }}>
            <span style={{ width: 14, height: 3, borderRadius: 2, background: s.color }} />{s.name} <b className="tabular">{s.vals.reduce((a, b) => a + numOf(b), 0)}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function KPI({ label, value, sub, tone = "vio", icon: I }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-1.5">
        {I && <span className="rounded-lg p-1.5" style={TONE[tone]}><I size={14} /></span>}
        <span className="text-xs font-semibold" style={{ color: T.mute }}>{label}</span>
      </div>
      <div className="text-2xl font-bold tabular" style={{ color: T.ink }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: T.mute }}>{sub}</div>}
    </Card>
  );
}

/* ============================== PRINT ENGINE ============================== */
function PrintModal({ doc, cfg, isAr, onClose }) {
  if (!doc) return null;
  const trial = false;
  return (
    <div className="print-veil fixed inset-0 z-50 overflow-auto p-4" style={{ background: "rgba(20,18,40,.55)" }}>
      <div className="mx-auto" style={{ maxWidth: 860 }}>
        <div className="no-print flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="text-white text-sm font-semibold">
            {isAr ? "معاينة الطباعة / حفظ PDF" : "Print preview / Save as PDF"}
          </div>
          <div className="flex gap-2">
            <Btn kind="brass" size="sm" onClick={() => window.print()}><Printer size={14} />{isAr ? "طباعة" : "Print"}</Btn>
            <Btn kind="soft" size="sm" onClick={() => window.print()}><Download size={14} />PDF</Btn>
            <Btn size="sm" onClick={onClose}><X size={14} />{isAr ? "إغلاق" : "Close"}</Btn>
          </div>
        </div>

        <div className="print-sheet bg-white rounded-lg p-8 relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
          {trial && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: .08 }}>
              <div style={{ transform: "rotate(-32deg)", fontSize: 74, fontWeight: 800, color: T.ink, letterSpacing: 4 }}>
                {cfg.watermark}
              </div>
            </div>
          )}
          <div className="flex items-start justify-between gap-4 pb-3" style={{ borderBottom: "2px solid " + T.brass }}>
            <div className="flex items-center gap-2.5">
              {cfg.logoUrl && <img src={cfg.logoUrl} alt="logo" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />}
              <div>
                <div className="text-base font-bold" style={{ color: T.ink }}>{isAr ? cfg.nameAr : cfg.nameEn}</div>
                <div className="text-xs" style={{ color: T.mute }}>{isAr ? cfg.nameEn : cfg.nameAr} · {cfg.domain}</div>
              </div>
            </div>
            <div className={isAr ? "text-left" : "text-right"}>
              <div className="text-sm font-bold" style={{ color: T.ink }}>{isAr ? doc.ar : doc.en}</div>
              <div className="text-xs" style={{ color: T.mute }}>{isAr ? doc.en : doc.ar}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 py-3 text-xs" style={{ color: T.ink2 }}>
            {(doc.meta || []).map(([k, v], i) => (
              <div key={i}><span style={{ color: T.mute }}>{k}: </span><b>{v}</b></div>
            ))}
          </div>

          {doc.cols && (
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: T.brassSoft }}>
                  {doc.cols.map((c, i) => (
                    <th key={i} className="px-2 py-1.5 font-bold"
                      style={{ border: "1px solid " + T.brassLine, color: T.brassText, textAlign: isAr ? "right" : "left" }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doc.rows.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className="px-2 py-1.5 tabular"
                        style={{ border: "1px solid " + T.line, color: T.ink2, textAlign: isAr ? "right" : "left" }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {doc.note && <div className="mt-3 text-xs" style={{ color: T.mute }}>{doc.note}</div>}

          {doc.sections && (
            <div className="space-y-3 mt-3">
              {doc.sections.map((sec, i) => (
                <div key={i} style={{ breakInside: "avoid" }}>
                  <div className="text-xs font-bold px-1.5 py-1" style={{ background: T.brassSoft, color: T.brassText }}>{sec.title}</div>
                  {sec.cols && sec.rows && sec.rows.length > 0 && (
                    <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                      <thead>
                        <tr>{sec.cols.map((c, j) => (
                          <th key={j} className="px-2 py-1 font-bold" style={{ border: "1px solid " + T.line, color: T.mute, textAlign: isAr ? "right" : "left" }}>{c}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {sec.rows.map((r, ri) => (
                          <tr key={ri}>{r.map((c, ci) => (
                            <td key={ci} className="px-2 py-1 tabular" style={{ border: "1px solid " + T.line, color: T.ink2, textAlign: isAr ? "right" : "left" }}>{c}</td>
                          ))}</tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {sec.cols && (!sec.rows || !sec.rows.length) && (
                    <div className="text-xs px-1.5 py-1" style={{ color: T.mute, border: "1px solid " + T.line, borderTop: "none" }}>{isAr ? "لا يوجد" : "None"}</div>
                  )}
                  {sec.text !== undefined && (
                    <div className="text-xs px-1.5 py-1.5 whitespace-pre-wrap" style={{ color: T.ink2, border: "1px solid " + T.line, borderTop: "none" }}>{sec.text}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-6 mt-10 text-xs" style={{ color: T.mute }}>
            {[[isAr ? "أعدّه" : "Prepared by", doc.by || ""], [isAr ? "راجعه" : "Checked by", ""], [isAr ? "اعتمده" : "Verified by", ""]].map(([l, v], i) => (
              <div key={i}>
                <div style={{ borderTop: "1px solid " + T.line, paddingTop: 4 }}>{l}</div>
                <div className="font-semibold" style={{ color: T.ink2 }}>{v || "\u00A0"}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-2 text-center" style={{ borderTop: "1px solid " + T.line, fontSize: 10, color: T.mute }}>
            {cfg.footer}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================ DASHBOARD =============================== */
function Dashboard({ isAr, go, devices, meals, warehouses, orders, linen, cfg, tasks = [], setTasks, me, isAdmin, receipts = [], roster }) {
  const alerts = useMemo(() => {
    const out = [];
    devices.forEach(d => Object.entries(d.r).forEach(([tm, v]) => {
      const s = devState(d, v.t);
      if (s !== "ok") out.push({ sev: s, ar: `${isAr ? d.ar : d.en} — ${v.t}° عند ${tm}`, en: `${d.en} — ${v.t}° at ${tm}`, go: "temp" });
    }));
    const expected = devices.reduce((a, d) => a + (d.kind === "chiller" ? 4 : 2), 0);
    const done = devices.reduce((a, d) => a + Object.keys(d.r).length, 0);
    if (done < expected) out.push({ sev: "warn", ar: `${expected - done} قراءة حرارة لم تُسجّل بعد اليوم`, en: `${expected - done} temperature readings not yet recorded today`, go: "temp" });
    let low = 0, soon = 0, expd = 0, outc = 0;
    warehouses.forEach(w => w.rows.forEach(r => {
      if (typeof r === "string") return;
      const st = calcStatus(r);
      if (st === "low") low++; if (st === "out") outc++; if (st === "soon") soon++; if (st === "exp") expd++;
    }));
    if (expd) out.push({ sev: "bad", ar: `${expd} صنف منتهي الصلاحية — يجب الإتلاف والتسجيل`, en: `${expd} expired items — dispose and log`, go: "wh" });
    if (soon) out.push({ sev: "warn", ar: `${soon} صنف تنتهي صلاحيته خلال 30 يوماً`, en: `${soon} items expiring within 30 days`, go: "wh" });
    if (low + outc) out.push({ sev: "warn", ar: `${low + outc} صنف تحت الحد الأدنى أو غير متوفر`, en: `${low + outc} items at or below minimum / out of stock`, go: "wh" });
    const openOrders = Object.entries(orders).filter(([, v]) => Object.keys(v).length).length;
    if (openOrders) out.push({ sev: "info", ar: `${openOrders} طلبية مفتوحة بانتظار الإرسال`, en: `${openOrders} draft orders awaiting submission`, go: "wh" });
    return out;
  }, [devices, warehouses, orders, isAr]);

  const totalItems = warehouses.reduce((a, w) => a + w.rows.filter(r => typeof r !== "string").length, 0);
  const D0 = todayISO();
  const recToday = receipts.filter(r => r.d === D0 && !r.src).reduce((a, r) => a + (r.q || 0), 0);
  const openT = tasks.filter(t => t.status !== "done");
  const kpis = [
    { ar: "أصناف مُدارة", en: "Items managed", v: totalItems, i: Boxes, tone: "vio" },
    { ar: "مستودعات", en: "Warehouses", v: warehouses.length, i: Package, tone: "brass" },
    { ar: "تنبيهات اليوم", en: "Alerts today", v: alerts.length, i: AlertTriangle, tone: alerts.some(a => a.sev === "bad") ? "bad" : "warn" },
    { ar: "مستلم اليوم", en: "Received today", v: recToday, i: ArrowDownToLine, tone: "ok" },
  ];
  const quick = [
    { ar: "المهام الواردة", en: "Incoming tasks", i: Bell, k: "tasks" },
    { ar: "الإحصائيات", en: "Statistics", i: BarChart3, k: "stats" },
    { ar: "تسجيل حرارة", en: "Log temperature", i: Thermometer, k: "temp" },
    { ar: "تشيك ليست النظافة", en: "Cleaning checklist", i: ClipboardCheck, k: "clean" },
    { ar: "جرد وطلبيات", en: "Stock & orders", i: Boxes, k: "wh" },
    { ar: "سجل الكسر", en: "Breakage log", i: Wine, k: "break" },
    { ar: "المفروشات", en: "Linen logs", i: Shirt, k: "linen" },
    { ar: "الهدر والإتلاف", en: "Wastage", i: Trash2, k: "waste" },
  ];

  return (
    <div>
      <SectionTitle isAr={isAr} icon={LayoutDashboard} ar="لوحة التشغيل" en="Operations dashboard"
        sub={(isAr ? "كل ما يحتاج انتباهك اليوم — " : "Everything needing attention today — ") + todayISO()} />

      {openT.length > 0 && (
        <Card className="mb-4" style={{ borderColor: T.badLine, background: "#FFFDFD" }}>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="rounded-lg p-2" style={TONE.bad}><Bell size={16} /></span>
            <b className="text-sm" style={{ color: T.ink }}>
              {isAr ? openT.length + " مهمة واردة بانتظار التوزيع" : openT.length + " incoming tasks awaiting routing"}
            </b>
            <Btn size="sm" kind="brass" onClick={() => go("tasks")}>{isAr ? "فتح المهام" : "Open tasks"}</Btn>
          </div>
          {openT.slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center gap-2 py-1.5 text-sm" style={{ borderTop: "1px solid " + T.line }}>
              {t.pri === "high" && <Chip tone="bad">{isAr ? "عاجلة" : "urgent"}</Chip>}
              <span className="font-semibold truncate" style={{ color: T.ink }}>{t.title}</span>
              <span className="text-xs truncate" style={{ color: T.mute }}>
                {isAr ? "من" : "from"} {t.from} · {(ROLES[t.fromRole] || {})[isAr ? "ar" : "en"]} · <span className="tabular">{t.at}</span>
              </span>
              {t.dept && <Chip tone="brass">{(DEPTS.find(d => d[0] === t.dept) || [])[isAr ? 1 : 2]}</Chip>}
            </div>
          ))}
          {openT.length > 3 && <div className="text-xs mt-2" style={{ color: T.mute }}>
            {isAr ? "و" + (openT.length - 3) + " مهمة أخرى…" : "and " + (openT.length - 3) + " more…"}</div>}
        </Card>
      )}

      {(() => { const R = roster || {}; const positions = (R.positions && R.positions.length) ? R.positions : ROSTER_SEED.positions;
        const td = (R.data && R.data[todayISO()]) || {};
        const assigned = positions.filter(p => (td[p] || []).length);
        if (!assigned.length) return null;
        return (
          <Card className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-lg p-2" style={TONE.vio}><CalendarDays size={16} /></span>
              <b className="text-sm" style={{ color: T.ink }}>{isAr ? "فريق اليوم" : "Today's team"}</b>
              <button onClick={() => go("roster")} className="text-xs font-semibold ms-auto" style={{ color: T.vio }}>
                {isAr ? "فتح الجدول" : "Open roster"}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {assigned.map(pos => (
                <div key={pos} className="rounded-lg p-2 flex items-center gap-2 flex-wrap" style={{ background: T.surf }}>
                  <span className="text-xs font-bold" style={{ color: T.mute, minWidth: 110 }}>{pos}</span>
                  <div className="flex flex-wrap gap-1">
                    {td[pos].map(n => <span key={n} className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "#fff", color: T.ink }}>{n}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {kpis.map((k, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold tabular" style={{ color: T.ink }}>{k.v}</div>
                <div className="text-xs mt-0.5" style={{ color: T.mute }}>{isAr ? k.ar : k.en}</div>
              </div>
              <span className="rounded-lg p-2" style={TONE[k.tone]}><k.i size={18} /></span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <Card pad={false}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid " + T.line }}>
              <AlertTriangle size={16} style={{ color: T.brass }} />
              <b className="text-sm" style={{ color: T.ink }}>{isAr ? "تنبيهات تحتاج إجراء" : "Alerts needing action"}</b>
            </div>
            <div>
              {alerts.length === 0 && <Empty isAr={isAr} ar="لا توجد تنبيهات — كل شيء منضبط." en="No alerts — everything is within limits." />}
              {alerts.map((a, i) => (
                <button key={i} onClick={() => go(a.go)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-start hover:bg-slate-50"
                  style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
                  <Chip tone={a.sev === "bad" ? "bad" : a.sev === "info" ? "vio" : "warn"}>
                    {a.sev === "bad" ? (isAr ? "حرج" : "Critical") : a.sev === "info" ? (isAr ? "معلومة" : "Info") : (isAr ? "تنبيه" : "Warning")}
                  </Chip>
                  <span className="text-sm flex-1" style={{ color: T.ink2 }}>{isAr ? a.ar : a.en}</span>
                  {isAr ? <ArrowLeft size={14} style={{ color: T.mute }} /> : <ArrowRight size={14} style={{ color: T.mute }} />}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <b className="text-sm block mb-2" style={{ color: T.ink }}>{isAr ? "إجراءات سريعة" : "Quick actions"}</b>
            <div className="grid grid-cols-2 gap-2">
              {quick.map((q, i) => (
                <button key={i} onClick={() => go(q.k)}
                  className="rounded-lg p-2.5 text-xs font-semibold flex flex-col items-center gap-1.5 hover:opacity-80"
                  style={{ background: T.surf, border: "1px solid " + T.line, color: T.ink2 }}>
                  <q.i size={16} style={{ color: T.vio }} />
                  <span className="text-center leading-tight">{isAr ? q.ar : q.en}</span>
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <b className="text-sm block mb-2" style={{ color: T.ink }}>{isAr ? "حالة النماذج اليوم" : "Today's forms status"}</b>
            {[
              { ar: "حرارة الشيلرات", en: "Chiller temps", d: devices.filter(d => d.kind === "chiller").reduce((a, d) => a + Object.keys(d.r).length, 0), t: 24 },
              { ar: "حرارة الفريزرات", en: "Freezer temps", d: devices.filter(d => d.kind === "freezer").reduce((a, d) => a + Object.keys(d.r).length, 0), t: 6 },
              { ar: "حرارة الوجبات", en: "Meal temps", d: meals.filter(m => m.disp.length).length, t: Math.max(1, meals.length) },
              { ar: "سجل المفروشات", en: "Linen logs",
                d: (linen.cats || []).filter(c => ((linen.data || {})[c.id] || []).some(r => (r.d || (Array.isArray(r) && r[0])) === todayISO())).length,
                t: Math.max(1, (linen.cats || []).length) },
            ].map((s, i) => {
              const pct = Math.min(100, Math.round((s.d / s.t) * 100));
              return (
                <div key={i} className="mb-2.5">
                  <div className="flex justify-between text-xs mb-1" style={{ color: T.ink2 }}>
                    <span>{isAr ? s.ar : s.en}</span><span className="tabular">{s.d}/{s.t}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: T.line }}>
                    <div className="h-1.5 rounded-full" style={{ width: pct + "%", background: pct === 100 ? "#10B981" : T.brass }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================== TEMPERATURE =============================== */
function TempScreen({ isAr, devices, setDevices, meals, setMeals, print, user }) {
  const [tab, setTab] = useState("chiller");
  const [cell, setCell] = useState(null);
  const [val, setVal] = useState(""); const [ca, setCa] = useState("");
  const [devForm, setDevForm] = useState(null);
  const [delDev, setDelDev] = useState(null);
  const [mealForm, setMealForm] = useState(null);
  const [dispFor, setDispFor] = useState(null);
  const [askClearTemp, setAskClearTemp] = useState(false);
  const [delMeal, setDelMeal] = useState(null);

  const list = devices.filter(d => d.kind === tab);
  const times = tab === "chiller" ? CHILL_TIMES : FRZ_TIMES;
  const limit = tab === "chiller" ? "1–4 °C · " + (isAr ? "الحد الحرج" : "critical") + " < 5 °C"
                                  : "-19 °C · " + (isAr ? "الحد الحرج" : "critical") + " -18 °C";

  const dev = cell ? devices.find(d => d.id === cell.id) : null;
  const save = () => {
    const t = parseFloat(val); if (isNaN(t)) return;
    const bad = devState(dev, t) !== "ok";
    setDevices(devices.map(d => d.id !== cell.id ? d
      : { ...d, r: { ...d.r, [cell.tm]: { t, by: user.n, ...(bad && ca.trim() ? { ca: ca.trim() } : {}) } } }));
    setCell(null); setVal(""); setCa("");
  };

  const printGrid = () => print({
    ar: tab === "chiller" ? "سجل مراقبة حرارة الشيلرات" : "سجل مراقبة حرارة الفريزرات",
    en: tab === "chiller" ? "Chiller Temperature Monitoring Record" : "Freezer Temperature Monitoring Record",
    meta: [[isAr ? "التاريخ" : "Date", todayISO()], [isAr ? "الحد المستهدف" : "Target", limit], [isAr ? "الوردية" : "Shift", isAr ? "24 ساعة" : "24 hours"]],
    cols: [isAr ? "الجهاز" : "Device", ...times, isAr ? "الإجراء التصحيحي" : "Corrective action"],
    rows: list.map(d => [isAr ? d.ar : d.en, ...times.map(tm => d.r[tm] ? d.r[tm].t + "°" : "—"),
      Object.values(d.r).filter(v => v.ca).map(v => v.ca).join("; ") || "—"]),
    by: user.n,
  });

  return (
    <div>
      {inNightCarry() && (
        <Card className="mb-3" style={{ borderColor: T.vioLine, background: T.vioSoft }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: T.vioText }}>
            <Moon size={15} />
            <span>{isAr ? "قراءتا 00:00 و04:00 تخصان ورقة يوم " : "The 00:00 and 04:00 readings belong to the sheet dated "}
              <b className="tabular">{opDay()}</b>{isAr ? " — الوردية المسائية مستمرة." : " — night shift in progress."}</span>
          </div>
        </Card>
      )}
      <SectionTitle isAr={isAr} icon={Thermometer} ar="سجلات الحرارة" en="Temperature records"
        sub={isAr ? "الشيلرات والفريزرات وحرارة الوجبات — إدخال رقمي بتنبيه فوري"
                  : "Chillers, freezers and meal temperatures — digital entry with instant alerting"}
        right={<Btn kind="brass" size="sm" onClick={printGrid}><Printer size={14} />{isAr ? "طباعة السجل" : "Print record"}</Btn>} />

      <div className="flex gap-2 mb-3 flex-wrap">
        {[["chiller", "الشيلرات", "Chillers", Snowflake], ["freezer", "الفريزرات", "Freezers", Snowflake], ["meals", "حرارة الوجبات", "Meal temps", Flame]].map(([k, a, e, I]) => (
          <button key={k} onClick={() => setTab(k)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={tab === k ? { background: T.ink, color: "#fff" } : { background: "#fff", color: T.ink2, border: "1px solid " + T.line }}>
            <I size={14} />{isAr ? a : e}
          </button>
        ))}
        <span className="flex-1" />
        {tab !== "meals" && <Btn size="sm" onClick={() => setAskClearTemp(true)}><Trash2 size={13} />{isAr ? "مسح قراءات اليوم" : "Clear today's readings"}</Btn>}
        {tab !== "meals"
          ? <Btn kind="brass" size="sm" onClick={() => setDevForm({ ar: "", en: "", lo: tab === "chiller" ? "1" : "-25", hi: tab === "chiller" ? "5" : "-18" })}><Plus size={14} />{isAr ? "إضافة جهاز" : "Add device"}</Btn>
          : <Btn kind="brass" size="sm" onClick={() => setMealForm({ n: "", type: "HOT", tm: nowHM(), t: "", q: "" })}><Plus size={14} />{isAr ? "إضافة وجبة" : "Add meal"}</Btn>}
      </div>

      {tab !== "meals" ? (
        <>
          <Card>
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: T.mute }}>
              <Info size={14} style={{ color: T.brass }} />
              {isAr ? "اضغط أي خانة لإدخال القراءة. القراءة خارج الحد تُلزمك بكتابة إجراء تصحيحي قبل الحفظ." 
                    : "Tap any cell to record a reading. Out-of-range values require a corrective action before saving."}
              <span className="font-semibold" style={{ color: T.ink2 }}>{limit}</span>
            </div>
            <div className="overflow-x-auto hf-scroll">
              <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 560 }}>
                <thead>
                  <tr>
                    <th className="text-start px-2 py-2 text-xs font-bold" style={{ color: T.mute }}>{isAr ? "الجهاز" : "Device"}</th>
                    {times.map(tm => <th key={tm} className="px-1 py-2 text-xs font-bold tabular" style={{ color: T.mute }}>{tm}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {list.map(d => (
                    <tr key={d.id}>
                      <td className="px-2 py-1.5 text-xs font-semibold" style={{ color: T.ink2, borderTop: "1px solid " + T.line }}>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setDelDev(d)} title={isAr ? "حذف الجهاز" : "Delete device"}
                            className="rounded p-1 shrink-0" style={{ background: "#FEF2F2", color: "#DC2626" }}><Trash2 size={11} /></button>
                          <span>{isAr ? d.ar : d.en}</span>
                        </div>
                      </td>
                      {times.map(tm => {
                        const rd = d.r[tm], s = rd ? devState(d, rd.t) : null;
                        return (
                          <td key={tm} className="px-1 py-1.5 text-center" style={{ borderTop: "1px solid " + T.line }}>
                            <button onClick={() => { setCell({ ...d, tm }); setVal(rd ? String(rd.t) : ""); setCa(rd && rd.ca ? rd.ca : ""); }}
                              className="w-full rounded-md py-1.5 text-xs font-bold tabular"
                              style={rd ? TONE[s === "ok" ? "ok" : s === "warn" ? "warn" : "bad"]
                                        : { background: T.surf, color: T.mute, border: "1px dashed " + T.line }}>
                              {rd ? rd.t + "°" : "+"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {list.some(d => Object.values(d.r).some(v => v.ca)) && (
            <Card className="mt-3">
              <b className="text-sm block mb-2" style={{ color: T.ink }}>{isAr ? "الإجراءات التصحيحية المسجّلة" : "Recorded corrective actions"}</b>
              {list.map(d => Object.entries(d.r).filter(([, v]) => v.ca).map(([tm, v]) => (
                <div key={d.id + tm} className="flex items-start gap-2 py-1.5 text-xs" style={{ color: T.ink2 }}>
                  <Chip tone="bad">{v.t}°</Chip>
                  <span><b>{isAr ? d.ar : d.en}</b> · {tm} — {v.ca} <span style={{ color: T.mute }}>({v.by})</span></span>
                </div>
              )))}
            </Card>
          )}

          {cell && (
            <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
              <Card className="w-full" style={{ maxWidth: 380 }}>
                <div className="flex items-center justify-between mb-3">
                  <b style={{ color: T.ink }}>{isAr ? cell.ar : cell.en} · {cell.tm}</b>
                  <button onClick={() => setCell(null)}><X size={18} style={{ color: T.mute }} /></button>
                </div>
                <label className="text-xs font-semibold" style={{ color: T.mute }}>
                  {isAr ? "القراءة (°م) — أي رقم مقبول" : "Reading (°C) — any value accepted"}
                  <span className="tabular" style={{ color: T.brass }}> · {isAr ? "النطاق" : "range"} {rangeOf(dev)[0]}…{rangeOf(dev)[1]}</span>
                </label>
                <input autoFocus type="number" step="any" value={val} onChange={e => setVal(e.target.value)}
                  className={inputCls + " mt-1 text-lg font-bold tabular"} style={inputSty} />
                {val !== "" && !isNaN(parseFloat(val)) && devState(dev, parseFloat(val)) !== "ok" && (
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: "#DC2626" }}>
                      <AlertTriangle size={13} />{isAr ? "خارج النطاق — سجّل الإجراء التصحيحي (اختياري)" : "Out of range — log a corrective action (optional)"}
                    </div>
                    <textarea rows={2} value={ca} onChange={e => setCa(e.target.value)}
                      placeholder={isAr ? "ضبط الثرموستات، فحص الباب، إبلاغ الصيانة…" : "Adjust thermostat, check door, call engineer…"}
                      className={inputCls} style={inputSty} />
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <Btn kind="solid" onClick={save}><CheckCircle2 size={14} />{isAr ? "حفظ القراءة" : "Save reading"}</Btn>
                  <Btn onClick={() => setCell(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
                </div>
                <div className="text-xs mt-2" style={{ color: T.mute }}>
                  {isAr ? "يُسجَّل باسم " : "Recorded as "}<b>{user.n}</b> · {user.prn} · {nowHM()}
                </div>
              </Card>
            </div>
          )}
        </>
      ) : (
        <Card pad={false}>
          <div className="px-4 py-3 text-xs" style={{ borderBottom: "1px solid " + T.line, color: T.mute }}>
            {isAr ? "استلام → إعادة تسخين → عرض على البوفيه. ساخن ≥ 63° · بارد ≤ 8° · حد أقصى 4 ساعات على البوفيه."
                  : "Delivery → reheating → buffet display. Hot ≥ 63° · Cold ≤ 8° · max 4 hrs at buffet."}
          </div>
          <div className="overflow-x-auto hf-scroll">
            <table className="w-full text-xs" style={{ minWidth: 640 }}>
              <thead style={{ background: T.surf }}>
                <tr>{[isAr ? "الوجبة" : "Meal", isAr ? "النوع" : "Type", isAr ? "الاستلام" : "Delivery",
                      isAr ? "إعادة التسخين" : "Reheating", isAr ? "قراءات العرض" : "Display readings", ""].map((h, i) => (
                  <th key={i} className="text-start px-3 py-2 font-bold" style={{ color: T.mute }}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {meals.map((m, i) => (
                  <tr key={i} style={{ borderTop: "1px solid " + T.line }}>
                    <td className="px-3 py-2 font-semibold" style={{ color: T.ink }}>{m.n}</td>
                    <td className="px-3 py-2"><Chip tone={m.type === "HOT" ? "warn" : "vio"}>{m.type}</Chip></td>
                    <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>{m.del.tm} · {m.del.t == null ? "—" : m.del.t + "°"} · {m.del.q}</td>
                    <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>
                      {m.rh.length ? m.rh.map((r, j) => <div key={j}>{r.ch} → {r.ov}</div>) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 flex-wrap">
                        {m.disp.map((d, j) => {
                          const ok = m.type === "HOT" ? d.t >= 63 : d.t <= 8;
                          return <Chip key={j} tone={ok ? "ok" : "bad"}>{d.tm} · {d.t}°</Chip>;
                        })}
                        {!m.disp.length && <span style={{ color: T.mute }}>—</span>}
                        <button onClick={() => setDispFor({ i, t: "" })} className="rounded-full px-2 py-0.5 font-bold"
                          style={{ background: T.vioSoft, color: T.vioText, border: "1px solid " + T.vioLine }}>+ {isAr ? "قراءة" : "reading"}</button>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => setDelMeal(i)} className="rounded p-1.5" style={{ background: "#FEF2F2", color: "#DC2626" }}
                        title={isAr ? "حذف" : "Delete"}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {devForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 380 }}>
            <div className="flex items-center justify-between mb-3">
              <b style={{ color: T.ink }}>{isAr ? "إضافة جهاز جديد" : "Add new device"}</b>
              <button onClick={() => setDevForm(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الاسم (عربي)" : "Name (Arabic)"}</label>
            <input value={devForm.ar} onChange={e => setDevForm({ ...devForm, ar: e.target.value })} className={inputCls + " mb-2"} style={inputSty}
              placeholder={tab === "chiller" ? "شيلر 5 — المطبخ" : "فريزر 3 — البوفيه"} />
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</label>
            <input value={devForm.en} onChange={e => setDevForm({ ...devForm, en: e.target.value })} className={inputCls} style={inputSty}
              placeholder={tab === "chiller" ? "Chiller 5 — Kitchen" : "Freezer 3 — Buffet"} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "أدنى حرارة مقبولة" : "Min accepted °C"}</label>
                <input type="number" step="any" value={devForm.lo} onChange={e => setDevForm({ ...devForm, lo: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "أعلى حرارة مقبولة" : "Max accepted °C"}</label>
                <input type="number" step="any" value={devForm.hi} onChange={e => setDevForm({ ...devForm, hi: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
              </div>
            </div>
            <div className="text-xs mt-2" style={{ color: T.mute }}>
              {isAr ? "النطاق يخص هذا الجهاز وحده — أي قراءة خارجه تُقبل وتُعلَّم بالأحمر فقط."
                    : "The range belongs to this device alone — readings outside it are accepted and simply flagged red."}
            </div>
            <div className="flex gap-2 mt-4">
              <Btn kind="solid" disabled={!devForm.ar.trim() && !devForm.en.trim()} onClick={() => {
                const nm = devForm.en.trim() || devForm.ar.trim();
                setDevices([...devices, { id: "D" + Date.now(), kind: tab, ar: devForm.ar.trim() || nm, en: nm,
                  lo: devForm.lo === "" ? null : +devForm.lo, hi: devForm.hi === "" ? null : +devForm.hi, r: {} }]);
                setDevForm(null);
              }}><CheckCircle2 size={14} />{isAr ? "إضافة" : "Add"}</Btn>
              <Btn onClick={() => setDevForm(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {askClearTemp && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 360 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "مسح قراءات اليوم؟" : "Clear today's readings?"}</b>
            <div className="text-sm mb-4" style={{ color: T.ink2 }}>
              {isAr ? "يمسح كل قراءات " + (tab === "chiller" ? "الشيلرات" : "الفريزرات") + " المسجَّلة اليوم — الأجهزة نفسها تبقى."
                    : "Clears all today's " + (tab === "chiller" ? "chiller" : "freezer") + " readings — the devices themselves stay."}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                setDevices(devices.map(d => d.kind === tab ? { ...d, r: {} } : d));
                setAskClearTemp(false);
              }} className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: "#DC2626" }}>
                <Trash2 size={14} />{isAr ? "مسح" : "Clear"}</button>
              <Btn onClick={() => setAskClearTemp(false)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {delDev && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 340 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف الجهاز؟" : "Delete this device?"}</b>
            <div className="text-sm mb-4" style={{ color: T.ink2 }}>{isAr ? delDev.ar : delDev.en} — {isAr ? "تُحذف قراءات اليوم معه" : "today's readings go with it"}</div>
            <div className="flex gap-2">
              <button onClick={() => { setDevices(devices.filter(x => x.id !== delDev.id)); setDelDev(null); }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: "#DC2626" }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setDelDev(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {mealForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 420 }}>
            <div className="flex items-center justify-between mb-3">
              <b style={{ color: T.ink }}>{isAr ? "إضافة وجبة للمراقبة" : "Add meal to monitoring"}</b>
              <button onClick={() => setMealForm(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="col-span-2">
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "اسم الوجبة *" : "Meal name *"}</label>
                <input autoFocus value={mealForm.n} onChange={e => setMealForm({ ...mealForm, n: e.target.value })} className={inputCls} style={inputSty} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "النوع" : "Type"}</label>
                <select value={mealForm.type} onChange={e => setMealForm({ ...mealForm, type: e.target.value })} className={inputCls} style={inputSty}>
                  <option value="HOT">HOT</option><option value="COLD">COLD</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "وقت الاستلام" : "Delivery time"}</label>
                <input value={mealForm.tm} onChange={e => setMealForm({ ...mealForm, tm: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "حرارة الاستلام °م" : "Delivery temp °C"}</label>
                <input type="number" step="0.1" value={mealForm.t} onChange={e => setMealForm({ ...mealForm, t: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الكمية / الحاويات" : "Qty / containers"}</label>
                <input value={mealForm.q} onChange={e => setMealForm({ ...mealForm, q: e.target.value })} placeholder="2 GN" className={inputCls} style={inputSty} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Btn kind="solid" disabled={!mealForm.n.trim()} onClick={() => {
                setMeals([...meals, { n: mealForm.n.trim(), type: mealForm.type,
                  del: { tm: mealForm.tm || nowHM(), t: mealForm.t === "" ? null : +mealForm.t, q: mealForm.q || "—" }, rh: [], disp: [] }]);
                setMealForm(null);
              }}><CheckCircle2 size={14} />{isAr ? "إضافة" : "Add"}</Btn>
              <Btn onClick={() => setMealForm(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {dispFor && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 340 }}>
            <div className="flex items-center justify-between mb-3">
              <b style={{ color: T.ink }}>{meals[dispFor.i] && meals[dispFor.i].n} — {isAr ? "قراءة عرض" : "Display reading"}</b>
              <button onClick={() => setDispFor(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الحرارة °م — الوقت " : "Temp °C — time "}{nowHM()}</label>
            <input autoFocus type="number" step="0.1" value={dispFor.t} onChange={e => setDispFor({ ...dispFor, t: e.target.value })}
              className={inputCls + " text-lg font-bold tabular"} style={inputSty} />
            <div className="flex gap-2 mt-4">
              <Btn kind="solid" disabled={dispFor.t === "" || isNaN(+dispFor.t)} onClick={() => {
                setMeals(meals.map((m, j) => j !== dispFor.i ? m : { ...m, disp: [...m.disp, { tm: nowHM(), t: +dispFor.t }] }));
                setDispFor(null);
              }}><CheckCircle2 size={14} />{isAr ? "حفظ" : "Save"}</Btn>
              <Btn onClick={() => setDispFor(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {delMeal != null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 340 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف الوجبة؟" : "Delete this meal?"}</b>
            <div className="text-sm mb-4" style={{ color: T.ink2 }}>{meals[delMeal] && meals[delMeal].n}</div>
            <div className="flex gap-2">
              <button onClick={() => { setMeals(meals.filter((_, j) => j !== delMeal)); setDelMeal(null); }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: "#DC2626" }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setDelMeal(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
/* ============================ CLEANING CHECKLISTS ========================= */
function CleanScreen({ isAr, checks, setChecks, rounds, setRounds, print, user, staff,
  ckTpl, setCkTpl, ckDay, setCkDay, ckWeek, setCkWeek, ckWk, tasks, setTasks, isAdmin, canEdit = true }) {
  const PEOPLE = (staff && staff.length ? staff : [user]);
  const [tab, setTab] = useState("home");
  const [toilet, setToilet] = useState(0);
  const [shift, setShift] = useState("morning");
  const [who, setWho] = useState(user.n);
  const [askClearToilet, setAskClearToilet] = useState(false);
  const [askClearRounds, setAskClearRounds] = useState(false);
  const [rShift, setRShift] = useState(() => inNightCarry() ? "night" : "day");
  const [ckPh, setCkPh] = useState("S");
  const rSlots = rShift === "night" ? R_NIGHT : R_DAY;
  const prnOf = (n) => (PEOPLE.find(x => x.n === n) || {}).prn || "";
  const slots = shift === "night" ? NIGHT : MORNING;
  const key = (ti, si) => `${toilet}|${shift}|${ti}|${si}`;

  const toggle = (ti, si) => {
    const k = key(ti, si); const n = { ...checks };
    if (n[k]) delete n[k]; else n[k] = { by: who, prn: prnOf(who), at: nowHM() };
    setChecks(n);
  };
  const gToggle = (ai, tm) => {
    const k = ai + "|" + rShift + "|" + tm; const n = { ...rounds };
    if (n[k]) delete n[k]; else n[k] = { by: who, prn: prnOf(who), at: nowHM() };
    setRounds(n);
  };
  /* one tap per column: tick every row for that time slot; if the column is already full, clear it */
  const colToggle = (si) => {
    const n = { ...checks }; const stamp = { by: who, prn: prnOf(who), at: nowHM() };
    const full = T_TASKS.every((_, ti) => n[key(ti, si)]);
    T_TASKS.forEach((_, ti) => { const k = key(ti, si); if (full) delete n[k]; else if (!n[k]) n[k] = stamp; });
    setChecks(n);
  };
  const gColToggle = (tm) => {
    const n = { ...rounds }; const stamp = { by: who, prn: prnOf(who), at: nowHM() };
    const full = G_AREAS.every((_, ai) => n[ai + "|" + rShift + "|" + tm]);
    G_AREAS.forEach((_, ai) => { const k = ai + "|" + rShift + "|" + tm; if (full) delete n[k]; else if (!n[k]) n[k] = stamp; });
    setRounds(n);
  };
  const colBtnSty = (done, all) => ({ height: 22, background: done === all ? "#047857" : done ? "#ECFDF5" : "#fff",
    border: "1px solid " + (done === all ? "#047857" : done ? "#A7F3D0" : T.line), color: done === all ? "#fff" : "#047857" });
  const doneCount = T_TASKS.reduce((a, _, ti) => a + slots.filter((_, si) => checks[key(ti, si)]).length, 0);
  const total = T_TASKS.length * slots.length;
  const rKey = (ai, tm) => ai + "|" + rShift + "|" + tm;
  const roundHit = (tm) => { for (let ai = 0; ai < G_AREAS.length; ai++) { const h = rounds[rKey(ai, tm)]; if (h) return h; } return null; };
  const roundDone = (tm) => G_AREAS.filter((_, ai) => rounds[rKey(ai, tm)]).length;

  /* a non-compliant item opens a maintenance task straight away */
  const ckIssue = (sec, it, ph) => {
    if (!setTasks) return null;
    const id = uid();
    setTasks([{ id, at: todayISO(), tm: nowHM(),
      title: (isAr ? (it.ar || it.en) : it.en),
      desc: (isAr ? "بند غير مطابق في تشيك ليست النظافة — " : "Non-compliant cleaning checklist item — ")
            + (isAr ? sec.ar : sec.en) + " · " + (isAr ? CK_PH[ph][0] : CK_PH[ph][1])
            + " · " + (ph === "W" ? ckWk : opDay()) + " · " + who,
      pri: "normal", due: null, from: who, fromRole: user.role, dept: null, status: "new", src: "clean", log: [] },
      ...(tasks || [])]);
    return id;
  };
  const printCk = () => {
    const secId = tab.startsWith("sec:") ? tab.slice(4) : null;
    const recOf = (p) => (p === "W" ? ckWeek : ckDay);
    if (secId) {
      /* one location, item by item */
      const sec = (ckTpl.secs || []).find(x => x.id === secId); if (!sec) return;
      const rec = recOf(ckPh), items = ckItemsOf(sec, ckPh), c = ckSecCount(sec, rec, ckPh), sg = (rec.s || {})[ckKey(ckPh, sec.id)];
      print({
        k: "clean",
        ar: "تشيك ليست النظافة — " + (sec.ar || sec.en), en: "Cleaning checklist — " + sec.en,
        meta: [[isAr ? "التاريخ" : "Date", ckPh === "W" ? ckWk + " → +6" : opDay()],
               [isAr ? "المرحلة" : "Phase", isAr ? CK_PH[ckPh][0] : CK_PH[ckPh][1]],
               [isAr ? "نسخة القالب" : "Template version", "v" + ckTpl.v],
               [isAr ? "الإنجاز" : "Completion", c.done + "/" + c.total],
               [isAr ? "المنفّذ" : "Performed by", sg ? sg.by + " · " + sg.prn : "—"],
               [isAr ? "وقت التوقيع" : "Signed at", sg ? sg.at : "—"]],
        cols: ["#", isAr ? "البند" : "Item", isAr ? "الحالة" : "Status"],
        rows: items.map((it, i) => { const v = (rec.t || {})[ckKey(ckPh, it.id)];
          return [String(i + 1), isAr ? (it.ar || it.en) : it.en, v === 1 ? "✓" : v === -1 ? (isAr ? "⚠ غير مطابق" : "⚠ not compliant") : ""]; }),
        note: [(rec.n || {})[ckKey(ckPh, sec.id)] || "",
               isAr ? "البنود غير المطابقة مفتوحة كمهام صيانة في شاشة المهام." : "Non-compliant items are opened as maintenance tasks in the Tasks screen."].filter(Boolean).join(" — "),
        by: who,
      });
      return;
    }
    /* the whole lounge: one row per location per phase */
    const rows = [];
    let done = 0, total = 0, issue = 0, signed = 0, sheets = 0;
    (ckTpl.secs || []).forEach(sec => {
      CK_PHL.forEach(p => {
        const items = ckItemsOf(sec, p); if (!items.length) return;
        const rec = recOf(p), c = ckSecCount(sec, rec, p), sg = (rec.s || {})[ckKey(p, sec.id)];
        const iss = items.filter(i => (rec.t || {})[ckKey(p, i.id)] === -1).map(i => (isAr ? (i.ar || i.en) : i.en));
        const note = [(rec.n || {})[ckKey(p, sec.id)] || "", iss.length ? "⚠ " + iss.join(" / ") : ""].filter(Boolean).join(" — ");
        done += c.done; total += c.total; issue += c.issue; sheets++; if (sg) signed++;
        rows.push([isAr ? (sec.ar || sec.en) : sec.en, isAr ? CK_PH[p][0] : CK_PH[p][1], c.done + "/" + c.total,
                   sg ? sg.by : "", sg ? sg.prn : "", sg ? sg.at : "", note]);
      });
    });
    print({
      k: "clean",
      ar: "تشيك ليست النظافة والصيانة — كل المواقع", en: "Cleaning & maintenance checklist — all locations",
      meta: [[isAr ? "التاريخ" : "Date", opDay()], [isAr ? "أسبوع" : "Week", ckWk],
             [isAr ? "نسخة القالب" : "Template version", "v" + ckTpl.v],
             [isAr ? "البنود المنجزة" : "Items done", done + "/" + total],
             [isAr ? "توقيعات" : "Signed", signed + "/" + sheets],
             [isAr ? "بنود غير مطابقة" : "Non-compliant", String(issue)]],
      cols: [isAr ? "الموقع" : "Location", isAr ? "المرحلة" : "Phase", isAr ? "الإنجاز" : "Done",
             isAr ? "المنفّذ" : "By", "PRN", isAr ? "الوقت" : "Time", isAr ? "ملاحظات" : "Observations"],
      rows,
      note: isAr ? "كل موقع يُوقَّع على حدة باسم منفّذه ورقم PRN ووقت التوقيع؛ والأسبوعي يُحتسب من سبت ذلك الأسبوع."
                 : "Each location is signed separately with its performer, PRN and time; the weekly sheet runs from that week's Saturday.",
      by: who,
    });
  };
  const printToilet = () => print({
    ar: "تشيك ليست المراقبة اليومية لدورات المياه — نهاية الوردية", en: "Toilet Daily Monitoring Checklist — End of shift",
    meta: [[isAr ? "التاريخ" : "Date", todayISO()], [isAr ? "الموقع" : "Location", isAr ? TOILETS[toilet][0] : TOILETS[toilet][1]],
           [isAr ? "الوردية" : "Shift", shift === "night" ? "20:00 – 06:00" : "06:30 – 16:30"],
           [isAr ? "المنفّذ" : "Performed by", who + " · " + prnOf(who)],
           [isAr ? "الإنجاز" : "Completion", `${doneCount}/${total}`]],
    cols: [isAr ? "المهمة" : "Task", ...slots.filter((_, i) => i % 2 === 0)],
    rows: T_TASKS.map((t, ti) => [isAr ? t[0] : t[1], ...slots.filter((_, i) => i % 2 === 0).map((_, si) => checks[key(ti, si * 2)] ? "✓" : "")]),
    note: isAr ? "الأعمدة معروضة كل ساعة للطباعة؛ السجل الرقمي يحتفظ بكل نصف ساعة مع اسم المنفّذ ووقت التنفيذ."
               : "Printed hourly for space; the digital record keeps every 30-minute slot with executor name and timestamp.",
    by: who,
  });
  const printRounds = () => print({
    ar: "التشيك ليست العام — نهاية الوردية", en: "General Checklist — End of shift",
    meta: [[isAr ? "التاريخ" : "Date", opDay()],
           [isAr ? "الوردية" : "Shift", rShift === "night" ? "19:00 – 07:00" : "07:00 – 19:00"],
           [isAr ? "عدد الجولات" : "Rounds", rSlots.length],
           [isAr ? "الجولات المكتملة" : "Rounds complete", rSlots.filter(tm => roundDone(tm) === G_AREAS.length).length]],
    cols: [isAr ? "الوقت" : "Timing", isAr ? "الاسم" : "Name", "PRN", isAr ? "المناطق ✓" : "Areas ✓", isAr ? "التوقيع" : "Sign"],
    rows: rSlots.map(tm => { const h = roundHit(tm); return [tm, h ? h.by : "", h ? h.prn : "", roundDone(tm) + "/" + G_AREAS.length, roundDone(tm) === G_AREAS.length ? "✓" : ""]; }),
    note: isAr ? "المناطق الخمس عشرة مفصّلة في السجل الرقمي لكل جولة بعلامة ✓ واسم المنفّذ."
               : "All 15 areas are detailed per round in the digital record with a ✓ and the performer name.",
    by: who,
  });

  const performerBar = (
    <div className="flex items-center gap-1.5">
      <Users size={14} style={{ color: T.vio }} />
      <label className="text-xs font-semibold" style={{ color: T.mute }}>{isAr ? "المنفّذ:" : "Name:"}</label>
      <select value={who} onChange={e => setWho(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm font-semibold" style={inputSty}>
        {PEOPLE.map(x => <option key={x.email || x.prn} value={x.n}>{x.n} — {x.prn}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      {inNightCarry() && (
        <Card className="mb-3" style={{ borderColor: T.vioLine, background: T.vioSoft }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: T.vioText }}>
            <Moon size={15} />
            <span>{isAr ? "الوردية المسائية مستمرة — تُسجَّل على ورقة يوم " : "Night shift in progress — recording on the sheet dated "}
              <b className="tabular">{opDay()}</b>{isAr ? " حتى الساعة 06:00." : " until 06:00."}</span>
          </div>
        </Card>
      )}
      <SectionTitle isAr={isAr} icon={ClipboardCheck} ar="تشيك ليست النظافة" en="Cleaning checklists"
        sub={isAr ? "دورات المياه كل 30 دقيقة + الجولة العامة + تشيك ليست النظافة والصيانة (13 قسماً) — كل توقيع باسم منفّذه"
                  : "Toilets every 30 min + the general round + the 13-section cleaning & maintenance checklist — every signature carries its performer"}
        right={<Btn kind="brass" size="sm" onClick={tab === "toilet" ? printToilet : tab === "general" ? printRounds : printCk}>
          <Printer size={14} />{isAr ? "طباعة" : "Print"}</Btn>} />

      {(tab === "toilet" || tab === "general") && (
        <div className="mb-3">
          <Btn size="sm" kind="ghost" onClick={() => setTab("home")}>{isAr ? "‹ المواقع" : "‹ Locations"}</Btn>
        </div>
      )}

      {tab === "home" ? (
        <CkHome isAr={isAr} tpl={ckTpl} setTpl={setCkTpl} day={ckDay} week={ckWeek} canEdit={canEdit}
          onOpen={(k) => { setTab(k); }} />
      ) : tab === "toilet" ? (
        <Card pad={false}>
          <div className="p-3 flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid " + T.line }}>
            {performerBar}
            <select value={toilet} onChange={e => setToilet(+e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={inputSty}>
              {TOILETS.map((t, i) => <option key={i} value={i}>{isAr ? t[0] : t[1]}</option>)}
            </select>
            <select value={shift} onChange={e => setShift(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={inputSty}>
              <option value="morning">{isAr ? "صباحية 06:30–16:30" : "Morning 06:30–16:30"}</option>
              <option value="night">{isAr ? "ليلية 20:00–06:00" : "Night 20:00–06:00"}</option>
            </select>
            <Chip tone={doneCount === total ? "ok" : "brass"}>{doneCount}/{total}</Chip>
          </div>
          <div className="overflow-x-auto hf-scroll">
            <table className="text-xs" style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 900 }}>
              <thead>
                <tr>
                  <th className="text-start px-3 py-2 sticky font-bold" style={{ color: T.mute, background: "#fff", insetInlineStart: 0, minWidth: 190 }}>
                    {isAr ? "المهمة" : "Task"}
                  </th>
                  {slots.map((x, si) => {
                    const cd = T_TASKS.filter((_, ti) => checks[key(ti, si)]).length;
                    return (
                      <th key={x} className="px-0.5 py-1.5 font-bold tabular" style={{ color: T.mute, minWidth: 46 }}>
                        <div>{x}</div>
                        <button onClick={() => colToggle(si)} title={isAr ? "تعليم العمود كاملاً" : "Tick the whole column"}
                          className="mt-1 w-full rounded flex items-center justify-center" style={colBtnSty(cd, T_TASKS.length)}>
                          <CheckCheck size={13} />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {T_TASKS.map((t, ti) => (
                  <tr key={ti}>
                    <td className="px-3 py-1 sticky" style={{ color: T.ink2, background: "#fff", insetInlineStart: 0, borderTop: "1px solid " + T.line }}>
                      {isAr ? t[0] : t[1]}
                    </td>
                    {slots.map((x, si) => {
                      const on = checks[key(ti, si)];
                      return (
                        <td key={x} className="p-0.5" style={{ borderTop: "1px solid " + T.line }}>
                          <button onClick={() => toggle(ti, si)} title={on ? `${on.by} · ${on.at}` : ""}
                            className="w-full rounded flex items-center justify-center"
                            style={{ height: 26, background: on ? "#ECFDF5" : T.surf, border: "1px solid " + (on ? "#A7F3D0" : T.line) }}>
                            {on && <CheckCircle2 size={13} style={{ color: "#047857" }} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 flex items-center justify-between flex-wrap gap-2" style={{ borderTop: "1px solid " + T.line }}>
            <span className="text-xs" style={{ color: T.mute }}>
              {isAr ? "زر ✓✓ أعلى كل ساعة يعلّم العمود كاملاً بضغطة واحدة، والضغط مرة أخرى يمسحه. كل ✓ مختومة باسم المنفّذ ووقتها." : "The ✓✓ button above each slot ticks the whole column in one tap; tap again to clear it. Every ✓ carries the performer and time."}
            </span>
            <div className="flex gap-2">
              <Btn size="sm" onClick={() => setAskClearToilet(true)}><Trash2 size={13} />{isAr ? "مسح هذا التشيك ليست" : "Clear this checklist"}</Btn>
              <Btn kind="brass" size="sm" onClick={printToilet}><Printer size={14} />{isAr ? "طباعة نهاية الوردية" : "Print end of shift"}</Btn>
            </div>
          </div>
        </Card>
      ) : tab === "general" ? (
        <Card pad={false}>
          <div className="p-3 flex flex-wrap items-center gap-3" style={{ borderBottom: "1px solid " + T.line }}>
            {performerBar}
            <select value={rShift} onChange={e => setRShift(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm" style={inputSty}>
              <option value="day">{isAr ? "نهارية 07:00–19:00" : "Day 07:00–19:00"}</option>
              <option value="night">{isAr ? "ليلية 19:00–07:00" : "Night 19:00–07:00"}</option>
            </select>
            <Chip tone="brass">{rSlots.filter(tm => roundDone(tm) === G_AREAS.length).length}/{rSlots.length} {isAr ? "جولة مكتملة" : "rounds complete"}</Chip>
            <span className="text-xs" style={{ color: T.mute }}>{isAr ? "زر ✓✓ أعلى الجولة يعلّم المناطق الخمس عشرة دفعة واحدة" : "The ✓✓ button above a round ticks all 15 areas at once"}</span>
          </div>
          <div className="overflow-x-auto hf-scroll">
            <table className="text-xs" style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 960 }}>
              <thead>
                <tr>
                  <th className="text-start px-3 py-2 sticky font-bold" style={{ color: T.mute, background: "#fff", insetInlineStart: 0, minWidth: 215 }}>
                    {isAr ? "المنطقة" : "Area"}
                  </th>
                  {rSlots.map(tm => (
                    <th key={tm} className="px-0.5 py-1.5 font-bold tabular" style={{ color: T.mute, minWidth: 46 }}>
                      {tm}
                      <div style={{ fontSize: 9, fontWeight: 600, color: roundDone(tm) === G_AREAS.length ? "#047857" : T.mute }}>
                        {roundDone(tm)}/{G_AREAS.length}
                      </div>
                      <button onClick={() => gColToggle(tm)} title={isAr ? "تعليم الجولة كاملة" : "Tick the whole round"}
                        className="mt-1 w-full rounded flex items-center justify-center" style={colBtnSty(roundDone(tm), G_AREAS.length)}>
                        <CheckCheck size={13} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {G_AREAS.map((a, ai) => (
                  <tr key={ai}>
                    <td className="px-3 py-1 sticky" style={{ color: T.ink2, background: "#fff", insetInlineStart: 0, borderTop: "1px solid " + T.line }}>
                      <span className="tabular font-bold" style={{ color: T.brass }}>{String(ai + 1).padStart(2, "0")}</span> {isAr ? a[0] : a[1]}
                    </td>
                    {rSlots.map(tm => {
                      const on = rounds[rKey(ai, tm)];
                      return (
                        <td key={tm} className="p-0.5" style={{ borderTop: "1px solid " + T.line }}>
                          <button onClick={() => gToggle(ai, tm)} title={on ? `${on.by} · ${on.at}` : ""}
                            className="w-full rounded flex items-center justify-center"
                            style={{ height: 24, background: on ? "#ECFDF5" : T.surf, border: "1px solid " + (on ? "#A7F3D0" : T.line) }}>
                            {on && <CheckCircle2 size={12} style={{ color: "#047857" }} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 flex items-center justify-between flex-wrap gap-2" style={{ borderTop: "1px solid " + T.line }}>
            <span className="text-xs" style={{ color: T.mute }}>
              {isAr ? "الطباعة تُخرج جدول نهاية الوردية: الوقت، الاسم، PRN، والتوقيع — كما في النموذج الورقي." : "Printing produces the end-of-shift table: timing, name, PRN and sign — matching the paper form."}
            </span>
            <div className="flex gap-2">
              <Btn size="sm" onClick={() => setAskClearRounds(true)}><Trash2 size={13} />{isAr ? "مسح هذا التشيك ليست" : "Clear this checklist"}</Btn>
              <Btn kind="brass" size="sm" onClick={printRounds}><Printer size={14} />{isAr ? "طباعة نهاية الوردية" : "Print end of shift"}</Btn>
            </div>
          </div>
        </Card>
      ) : (
        <div>
          <Card className="mb-3"><div className="flex flex-wrap items-center gap-3">{performerBar}</div></Card>
          <CkArea isAr={isAr} tpl={ckTpl} setTpl={setCkTpl} secId={tab.slice(4)}
            day={ckDay} setDay={setCkDay} week={ckWeek} setWeek={setCkWeek} ckWk={ckWk}
            ph={ckPh} setPh={setCkPh} who={who} prnOf={prnOf} canEdit={canEdit}
            onIssue={ckIssue} onToilets={() => setTab("toilet")} onBack={() => setTab("home")} />
        </div>
      )}

      {askClearToilet && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 360 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "مسح هذا التشيك ليست بالكامل؟" : "Clear this entire checklist?"}</b>
            <div className="text-sm mb-4" style={{ color: T.ink2 }}>
              {(isAr ? TOILETS[toilet][0] : TOILETS[toilet][1])} · {shift === "night" ? (isAr ? "الوردية المسائية" : "PM shift") : (isAr ? "الوردية الصباحية" : "AM shift")} — {doneCount}/{total} {isAr ? "علامة ستُحذف" : "ticks will be removed"}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const n = { ...checks }; const pfx = toilet + "|" + shift + "|";
                Object.keys(n).forEach(k => { if (k.startsWith(pfx)) delete n[k]; });
                setChecks(n); setAskClearToilet(false);
              }} className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: "#DC2626" }}>
                <Trash2 size={14} />{isAr ? "مسح" : "Clear"}</button>
              <Btn onClick={() => setAskClearToilet(false)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {askClearRounds && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 360 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "مسح جولات هذه الوردية؟" : "Clear this shift's rounds?"}</b>
            <div className="text-sm mb-4" style={{ color: T.ink2 }}>
              {Object.keys(rounds).filter(k => k.split("|")[1] === rShift).length} {isAr ? "علامة ستُحذف من الوردية المعروضة فقط" : "ticks will be removed from the displayed shift only"}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const n = { ...rounds };
                Object.keys(n).forEach(k => { if (k.split("|")[1] === rShift) delete n[k]; });
                setRounds(n); setAskClearRounds(false);
              }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: "#DC2626" }}>
                <Trash2 size={14} />{isAr ? "مسح" : "Clear"}</button>
              <Btn onClick={() => setAskClearRounds(false)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ===================== CLEANING & MAINTENANCE CHECKLIST ===================
   Source: HAFAWA LOUNGE — CLEANING & MAINTENANCE CHECKLIST (Restricted).
   13 sections, 99 items. Phase letters: S = start of shift, W = weekly,
   E = end of shift. The English text is the source wording; the Arabic is a
   working translation and both are editable from the template tab, so this
   array is only the seed used the first time the checklist is opened.
   ========================================================================= */
const CK_SEED = [
  { id: "drec", en: "Downstairs Reception", ar: "الاستقبال السفلي", it: [
    ["All Signage: No dust and mark free — logos on outside of escalator cove", "جميع اللوحات: بلا غبار ولا آثار — شعارات واجهة السلم المتحرك", "S"],
    ["No rubbish seen on ground", "لا توجد مخلفات على الأرض", "SE"],
    ["Desks clear from rubbish on top and inside, no dust", "المكاتب خالية من المخلفات من فوق ومن الداخل وبلا غبار", "S"],
    ["Escalator: Bottom free from rubbish and dirt build up, fingerprints", "السلم المتحرك: أسفله خالٍ من المخلفات وتراكم الأوساخ وبصمات الأصابع", "S"],
  ] },
  { id: "rec", en: "Reception Area", ar: "منطقة الاستقبال", it: [
    ["Reception desk: No dust", "كاونتر الاستقبال: بلا غبار", "S"],
    ["Reception desk: No fingerprints", "كاونتر الاستقبال: بلا بصمات أصابع", "S"],
    ["Reception desk: No rubbish", "كاونتر الاستقبال: بلا مخلفات", "SWE"],
    ["Lights: All working", "الإضاءة: جميعها تعمل", "SE"],
    ["Floor: Swept/Mopped and mark free", "الأرضية: مكنوسة وممسوحة وبلا آثار", "S"],
    ["All Signage: No dust and mark free", "جميع اللوحات: بلا غبار ولا آثار", "S"],
    ["Lounge entry scanner: Dry wipe, no fingerprints", "جهاز مسح الدخول: مسح جاف وبلا بصمات", "W"],
    ["Fire alarm: Observe no dust or build up", "إنذار الحريق: التأكد من خلوه من الغبار والتراكمات", "WE"],
    ["Elevator: Interior and exterior glass door clean, silver panels", "المصعد: نظافة الباب الزجاجي من الداخل والخارج واللوحات الفضية", "S"],
    ["Flowers: dust free", "الزهور: خالية من الغبار", "WE"],
    ["Escalator: Top free from rubbish and dirt build up", "السلم المتحرك: أعلاه خالٍ من المخلفات وتراكم الأوساخ", "S"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "gdn", en: "Garden Lounge Seating Area (incl. self serve coffee area)", ar: "صالة الحديقة ومنطقة الجلوس (وركن القهوة الذاتي)", it: [
    ["Plants: No dead leaves, dust-free, clean pots (report replacement if needed)", "النباتات: بلا أوراق ميتة، خالية من الغبار، أصص نظيفة (بلّغ عند الحاجة للاستبدال)", "SE"],
    ["Floor including room corners: Dust-free, rubbish free", "الأرضية وزوايا المكان: بلا غبار ولا مخلفات", "SE"],
    ["Sofas and seating: Vacuumed, no dust marks or signs of recent use", "الكنب والمقاعد: مشفوطة وبلا آثار غبار أو استخدام سابق", "SE"],
    ["Carpet: Vacuumed, corners flat to avoid tripping, check no stains", "السجاد: مشفوط وأطرافه مستوية منعاً للتعثر وبلا بقع", "SE"],
    ["Cabinets: No fingerprints, wipe", "الخزائن: بلا بصمات، تُمسح", "E"],
    ["No passenger belongings on seats or tables", "لا توجد متعلقات ضيوف على المقاعد أو الطاولات", "W"],
    ["Clear tables of used items", "إخلاء الطاولات من الأدوات المستعملة", "SE"],
    ["Windows: No fingerprints, wipe. Check for stains in curtains", "النوافذ: بلا بصمات وتُمسح، وفحص الستائر من البقع", "S"],
    ["Ensure glass shelves above hydration station are dust free", "التأكد من خلو الأرفف الزجاجية أعلى ركن المشروبات من الغبار", "SE"],
    ["Lights: Ensure all working", "الإضاءة: التأكد من عملها بالكامل", "WE"],
    ["Wipe tables and coffee station: No dirt or fingerprints", "مسح الطاولات وركن القهوة: بلا أوساخ ولا بصمات", "E"],
    ["Empty coffee table trash bin and clean inside the bin to avoid pests", "إفراغ سلة ركن القهوة وتنظيفها من الداخل منعاً للحشرات", "E"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "rlx", en: "Relaxation / Wellness / Quiet Lounge Area", ar: "منطقة الاسترخاء والعافية والهدوء", it: [
    ["Clean wall signs with dry cloth or dust brush", "تنظيف لوحات الجدران بقطعة قماش جافة أو فرشاة غبار", "SE"],
    ["Floor: No dust or dirt, especially corners", "الأرضية: بلا غبار أو أوساخ وخاصة الزوايا", "SE"],
    ["Cabinet near massage chair: No passenger belongings, top dusted", "الخزانة بجانب كرسي المساج: بلا متعلقات ضيوف وسطحها منظف", "SWE"],
    ["Massage chair: Vacuum to remove dirt, food residues, fingerprints", "كرسي المساج: شفط الأوساخ وبقايا الطعام وإزالة البصمات", "SWE"],
    ["Replace headphones disposable covers", "استبدال أغطية السماعات المستهلكة", "SWE"],
    ["Lights working + wipe tables", "الإضاءة تعمل + مسح الطاولات", "E"],
    ["Emergency exit sign: Always lit", "لوحة مخرج الطوارئ: مضاءة دائماً", "SWE"],
    ["Kayanee mat: ensure clean", "سجادة كيانة: التأكد من نظافتها", "SE"],
    ["Lights at floor level: Clean to remove dirt", "إضاءة مستوى الأرضية: تنظيفها من الأوساخ", "S"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "pray", en: "Prayer Rooms", ar: "غرف الصلاة", it: [
    ["Replace missing handtowels in triangle stack", "تعويض مناشف اليد الناقصة بطيّة المثلث", "SWE"],
    ["Ensure bin is empty and clean", "التأكد من أن السلة فارغة ونظيفة", "SWE"],
    ["Ensure nothing is left on the floor", "التأكد من عدم ترك أي شيء على الأرضية", "SWE"],
    ["Ensure floor is dry near ablution and slip mat is in place", "التأكد من جفاف الأرضية قرب الوضوء ووجود سجادة منع الانزلاق", "SE"],
    ["Vacuum floor, no dirt", "شفط الأرضية وخلوها من الأوساخ", "SE"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "chmb", en: "Chambers (Nap Rooms)", ar: "غرف الراحة (القيلولة)", it: [
    ["Floor is vacuumed", "الأرضية مشفوطة", "SE"],
    ["Furniture is crumb free and stain free", "الأثاث خالٍ من الفتات والبقع", "SE"],
    ["Ensure no dust on speakers or light shade", "التأكد من خلو السماعات وأباجورة الإضاءة من الغبار", "SE"],
    ["Wipe windows, no fingerprints", "مسح النوافذ وخلوها من البصمات", "SE"],
    ["Pillows are placed well (2 x group of 3)", "الوسائد مرتبة بشكل صحيح (مجموعتان من ثلاث)", "SE"],
    ["Bins are empty", "السلال فارغة", "SE"],
    ["Curtains properly hung and at day/night setting", "الستائر معلّقة بشكل صحيح وعلى وضع النهار/الليل", "SE"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "rst", en: "Restrooms", ar: "دورات المياه", it: [
    ["Ensure no bad odors", "التأكد من خلو المكان من الروائح", "S"],
    ["Sinks and mirrors: Clean regularly, replace hand towels, no dirt", "المغاسل والمرايا: تنظيف دوري وتعويض المناشف وخلوها من الأوساخ", "SWE"],
    ["No finger prints on push pads or sensors", "لا بصمات على أزرار الدفع أو الحساسات", "SWE"],
    ["Clean toilets and bidet holders regularly", "تنظيف المراحيض وحوامل الشطاف بشكل دوري", "SWE"],
    ["Showers: Clean, no standing water, replace towels, no belongings", "غرف الاستحمام: نظيفة، بلا مياه راكدة، تعويض المناشف، بلا متعلقات", "SWE"],
    ["Rubbish bins: emptied and relined", "سلال المهملات: تُفرغ ويُركَّب كيس جديد", "SE"],
    ["Baby change tables restocked", "طاولات تغيير الأطفال مجهزة بالمستلزمات", "SE"],
    ["Tissue box holders filled with triangle fold", "حوامل المناديل ممتلئة وبطيّة المثلث", "S"],
    ["Toilet paper restocked and tip folded into triangle", "ورق التواليت معبأ وطرفه مطوي كالمثلث", "SE"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "sdn", en: "Social Dining and Café", ar: "الطعام الاجتماعي والمقهى", it: [
    ["Align tables and chairs", "ترتيب الطاولات والكراسي", "S"],
    ["Ensure no dust or footprints on table bottoms", "التأكد من خلو قواعد الطاولات من الغبار وآثار الأقدام", "E"],
    ["Leather chairs wiped, no crumbs in furniture corners", "مسح الكراسي الجلدية وخلو زوايا الأثاث من الفتات", "E"],
    ["Glass shelves dusted", "تنظيف الأرفف الزجاجية من الغبار", "SE"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "bev", en: "Beverage Corner", ar: "ركن المشروبات", it: [
    ["Wipe chairs including lower columns, no fingerprints", "مسح الكراسي بما فيها الأعمدة السفلية وبلا بصمات", "SE"],
    ["Vacuum chairs, no food residues", "شفط الكراسي وخلوها من بقايا الطعام", "E"],
    ["Wooden floor: Special cleaning, mopping", "الأرضية الخشبية: تنظيف خاص ومسح", "E"],
    ["Glassware behind bar: Wipe, no dust or marks", "الزجاجيات خلف البار: تُمسح وبلا غبار أو آثار", "SE"],
    ["Clean drains with hot water end of shift", "تنظيف المصارف بالماء الساخن نهاية الوردية", "E"],
    ["Dishwasher: Ensure working, clean", "غسالة الصحون: التأكد من عملها ونظافتها", "SE"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "dgt", en: "Digital Room", ar: "الغرفة الرقمية", warnEn: "NEVER wipe the screen wall", warnAr: "ممنوع منعاً باتاً مسح جدار الشاشات", it: [
    ["Vacuum chairs and floor", "شفط الكراسي والأرضية", "SE"],
    ["Signage before entry: dust free", "اللوحة قبل المدخل: خالية من الغبار", "E"],
    ["Ensure lights are working (report any not working)", "التأكد من عمل الإضاءة (بلّغ عن أي لمبة لا تعمل)", "E"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "kid", en: "Kids Room", ar: "غرفة الأطفال", it: [
    ["Organize toys regularly and store in cabinet", "ترتيب الألعاب بشكل دوري وحفظها في الخزانة", "SE"],
    ["Sanitized toys, report any broken or hazardous items", "تعقيم الألعاب والتبليغ عن أي قطعة مكسورة أو خطرة", "SWE"],
    ["Clean glass", "تنظيف الزجاج", "S"],
    ["Clean tables, door, and handles", "تنظيف الطاولات والباب والمقابض", "SE"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "ter", en: "Indoor Terrace", ar: "التراس الداخلي", it: [
    ["Wipe and clean chairs and tables", "مسح وتنظيف الكراسي والطاولات", "SE"],
    ["Plants: Clean, no dead leaves, tidy pots", "النباتات: نظيفة، بلا أوراق ميتة، أصص مرتبة", "SE"],
    ["Coffee machine: Clean, all supplies available", "ماكينة القهوة: نظيفة وجميع مستلزماتها متوفرة", "SWE"],
    ["Remove used plates, glassware", "رفع الأطباق والزجاجيات المستعملة", "WE"],
    ["Empty bins and reline them", "إفراغ السلال وتركيب أكياس جديدة", "W"],
    ["Wipe glass doors and windows", "مسح الأبواب والنوافذ الزجاجية", "E"],
    ["Wipe glass overlooking airport, no fingerprints", "مسح الزجاج المطل على المطار وخلوه من البصمات", "SE"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
  { id: "alc", en: "A la Carte Restaurant", ar: "مطعم الطلبات", it: [
    ["Clean and align tables and chairs (including bases)", "تنظيف وترتيب الطاولات والكراسي (وقواعدها)", "SE"],
    ["Vacuum carpet, ensure no raised corners", "شفط السجاد والتأكد من عدم ارتفاع أطرافه", "SE"],
    ["Clean bar regularly, ensure no leaks", "تنظيف البار بشكل دوري والتأكد من عدم وجود تسريب", "SE"],
    ["Clean bar table, no fingerprints on chairs", "تنظيف طاولة البار وخلو الكراسي من البصمات", "SE"],
    ["Ensure shelves dust-free above coffee machine", "التأكد من خلو الأرفف أعلى ماكينة القهوة من الغبار", "SE"],
    ["Ensure curtains properly installed and dust-free, neat", "التأكد من تركيب الستائر بشكل صحيح وخلوها من الغبار وترتيبها", "E"],
    ["Lights: Check all bulbs working, replace any blown", "الإضاءة: فحص جميع اللمبات واستبدال التالف", "SE"],
  ] },
];
/* seed → editable template document */
const ckSeedDoc = () => ({ v: 1, secs: CK_SEED.map(s => ({
  id: s.id, en: s.en, ar: s.ar, warnEn: s.warnEn || "", warnAr: s.warnAr || "",
  items: s.it.map(([en, ar, ph], i) => ({ id: s.id + "." + (i + 1), en, ar, ph })),
})) });

/* -------------------------- checklist helpers --------------------------- */
const CK_PH = { S: ["بداية الوردية", "Start of shift"], W: ["أسبوعي", "Weekly"], E: ["نهاية الوردية", "End of shift"] };
const CK_PHL = ["S", "E", "W"];
const ckKey = (ph, id) => ph + "|" + id;
/* the weekly sheet runs Saturday → Friday; this returns that week's Saturday */
const ckWeek0 = (iso) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() - ((d.getDay() + 1) % 7)); return d.toISOString().slice(0, 10); };
const ckItemsOf = (sec, ph) => (sec && sec.items ? sec.items : []).filter(i => i.ph.includes(ph));
const ckPhSecs = (tpl, ph) => (tpl.secs || []).map(s => ({ ...s, items: ckItemsOf(s, ph) })).filter(s => s.items.length);
const ckCount = (secs, rec, ph) => {
  let done = 0, issue = 0, total = 0, signed = 0;
  secs.forEach(s => { s.items.forEach(i => { total++; const v = (rec.t || {})[ckKey(ph, i.id)]; if (v === 1) done++; else if (v === -1) issue++; });
    if ((rec.s || {})[ckKey(ph, s.id)]) signed++; });
  return { done, issue, total, signed, secs: secs.length };
};
const ckSecCount = (sec, rec, ph) => ckCount([{ ...sec, items: ckItemsOf(sec, ph) }], rec, ph);

/* --------------------- the list of cleaning locations -------------------- */
function CkHome({ isAr, tpl, setTpl, day, week, canEdit, onOpen }) {
  const [edit, setEdit] = useState(false), [del, setDel] = useState(null);
  const put = (secs) => setTpl({ ...tpl, v: (tpl.v || 1) + 1, secs });
  const move = (i, dir) => { const a = tpl.secs.slice(), j = i + dir; if (j < 0 || j >= a.length) return; const x = a[i]; a[i] = a[j]; a[j] = x; put(a); };
  const addSec = () => put([...tpl.secs, { id: "s" + Date.now().toString(36).slice(-5), en: "New location", ar: "موقع جديد", warnEn: "", warnAr: "", items: [] }]);
  const legacy = [["toilet", "دورات المياه — كل 30 دقيقة", "Toilets — every 30 min", TOILETS.length + (isAr ? " مواقع" : " locations")],
                  ["general", "الجولة العامة", "General round", G_AREAS.length + (isAr ? " منطقة" : " areas")]];
  const chip = (sec, ph) => {
    const c = ckSecCount(sec, ph === "W" ? week : day, ph);
    if (!c.total) return null;
    const full = c.done === c.total;
    return (
      <span key={ph} className="text-xs tabular rounded-lg px-1.5 py-0.5"
        style={{ color: c.issue ? T.bad : full ? "#047857" : T.mute, background: c.issue ? T.badSoft : full ? "#ECFDF5" : T.surf }}>
        {(isAr ? CK_PH[ph][0] : CK_PH[ph][1]).split(" ")[0]} {c.done}/{c.total}{c.issue ? " ⚠" : ""}
      </span>
    );
  };
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-2 mb-4">
        {legacy.map(([k, a, e, sub]) => (
          <button key={k} onClick={() => onOpen(k)} className="text-start rounded-xl p-3"
            style={{ background: T.card, border: "1px solid " + T.line }}>
            <div className="text-sm font-bold" style={{ color: T.ink }}>{isAr ? a : e}</div>
            <div className="text-xs mt-0.5" style={{ color: T.mute }}>{sub}</div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs font-bold" style={{ color: T.mute }}>
          {isAr ? "مواقع النظافة والصيانة" : "Cleaning & maintenance locations"} ({tpl.secs.length})
        </div>
        <div className="flex-1" />
        {canEdit && <Btn size="sm" kind={edit ? "solid" : "ghost"} onClick={() => { setEdit(!edit); setDel(null); }}>
          <Pencil size={13} />{isAr ? "ترتيب المواقع" : "Edit locations"}</Btn>}
      </div>

      <div className="flex flex-col gap-2">
        {tpl.secs.map((sec, i) => (
          <div key={sec.id} className="flex items-center gap-1 rounded-xl" style={{ background: T.card, border: "1px solid " + T.line }}>
            <button onClick={() => onOpen("sec:" + sec.id)} className="flex-1 text-start p-3 min-w-0">
              <div className="text-sm font-bold leading-tight" style={{ color: T.ink }}>{isAr ? (sec.ar || sec.en) : sec.en}</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-xs" style={{ color: T.mute }}>{sec.items.length} {isAr ? "بنداً" : "items"}</span>
                {CK_PHL.map(ph => chip(sec, ph))}
              </div>
            </button>
            {edit && canEdit && (
              <div className="flex items-center gap-0.5 pe-2">
                <button onClick={() => move(i, -1)} className="p-1 text-xs" style={{ color: T.mute }}>▲</button>
                <button onClick={() => move(i, 1)} className="p-1 text-xs" style={{ color: T.mute }}>▼</button>
                {del === sec.id
                  ? <button onClick={() => { put(tpl.secs.filter(x => x.id !== sec.id)); setDel(null); }}
                      className="rounded px-1.5 py-0.5 text-xs font-bold" style={{ background: T.bad, color: "#fff" }}>{isAr ? "حذف" : "Delete"}</button>
                  : <button onClick={() => setDel(sec.id)} className="p-1" style={{ color: T.mute }}><Trash2 size={13} /></button>}
              </div>
            )}
          </div>
        ))}
      </div>

      {edit && canEdit && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Btn size="sm" kind="ghost" onClick={addSec}><Plus size={13} />{isAr ? "موقع جديد" : "New location"}</Btn>
          <Btn size="sm" kind="ghost" onClick={() => setTpl({ ...ckSeedDoc(), v: (tpl.v || 1) + 1 })}>
            <RotateCcw size={13} />{isAr ? "إعادة المواقع الأصلية" : "Reset to original"}</Btn>
          <span className="text-xs" style={{ color: T.mute }}>{isAr ? "نسخة القالب" : "Version"} v{tpl.v}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------- one location and its own checklist ------------------ */
function CkArea({ isAr, tpl, setTpl, secId, day, setDay, week, setWeek, ckWk, ph, setPh, who, prnOf, canEdit, onIssue, onToilets, onBack }) {
  const [edit, setEdit] = useState(false), [del, setDel] = useState(null);
  const si = (tpl.secs || []).findIndex(s => s.id === secId), sec = tpl.secs[si];
  if (!sec) return <Card><Btn size="sm" onClick={onBack}>{isAr ? "رجوع" : "Back"}</Btn></Card>;
  const rec = ph === "W" ? week : day, setRec = ph === "W" ? setWeek : setDay;
  const t = rec.t || {}, sg = rec.s || {}, nt = rec.n || {}, xs = rec.x || {};
  const items = ckItemsOf(sec, ph), c = ckSecCount(sec, rec, ph), signed = sg[ckKey(ph, sec.id)];

  const putRec = (patch) => setRec({ ...rec, v: tpl.v, ...patch });
  const tick = (id) => { const o = { ...t }, k = ckKey(ph, id); if (o[k] === 1) delete o[k]; else o[k] = 1; putRec({ t: o }); };
  const flag = (it) => {
    const k = ckKey(ph, it.id), o = { ...t }, x = { ...xs };
    if (o[k] === -1) { delete o[k]; putRec({ t: o }); return; }
    o[k] = -1;
    const tid = onIssue && onIssue(sec, it, ph);
    if (tid) x[k] = tid;
    putRec({ t: o, x });
  };
  const tickAll = () => { const o = { ...t }, full = items.every(i => o[ckKey(ph, i.id)] === 1);
    items.forEach(i => { const k = ckKey(ph, i.id); if (full) delete o[k]; else o[k] = 1; }); putRec({ t: o }); };
  const sign = () => { const o = { ...sg }, k = ckKey(ph, sec.id);
    if (o[k]) delete o[k]; else o[k] = { by: who, prn: prnOf(who), at: nowHM() }; putRec({ s: o }); };
  const note = (v) => { const o = { ...nt }, k = ckKey(ph, sec.id); if (v) o[k] = v; else delete o[k]; putRec({ n: o }); };

  const putTpl = (patch) => setTpl({ ...tpl, v: (tpl.v || 1) + 1, secs: tpl.secs.map((s, i) => i === si ? { ...s, ...patch } : s) });
  const itSet = (id, patch) => putTpl({ items: sec.items.map(x => x.id === id ? { ...x, ...patch } : x) });
  const itDel = (id) => { putTpl({ items: sec.items.filter(x => x.id !== id) }); setDel(null); };
  const itAdd = () => {
    const n = sec.items.reduce((m, x) => Math.max(m, +String(x.id).split(".")[1] || 0), 0) + 1;
    putTpl({ items: [...sec.items, { id: sec.id + "." + n, en: "New item", ar: "بند جديد", ph }] });
  };
  const phTog = (it, ch) => itSet(it.id, { ph: it.ph.includes(ch) ? it.ph.replace(ch, "") : (it.ph + ch).split("").sort((a, b) => "SWE".indexOf(a) - "SWE".indexOf(b)).join("") });

  return (
    <div>
      <Card className="mb-3">
        <div className="flex items-start gap-2">
          <Btn size="sm" kind="ghost" onClick={onBack}>{isAr ? "‹ المواقع" : "‹ Locations"}</Btn>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold leading-tight" style={{ color: T.ink }}>{isAr ? (sec.ar || sec.en) : sec.en}</div>
            <div className="text-xs mt-0.5 tabular" style={{ color: T.mute }}>{ph === "W" ? (isAr ? "أسبوع " : "Week ") + ckWk : opDay()}</div>
          </div>
          {canEdit && <Btn size="sm" kind={edit ? "solid" : "ghost"} onClick={() => { setEdit(!edit); setDel(null); }}>
            <Pencil size={13} />{isAr ? "تعديل البنود" : "Edit items"}</Btn>}
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {CK_PHL.map(p => {
            const n = ckItemsOf(sec, p).length;
            return (
              <button key={p} onClick={() => setPh(p)} className="rounded-lg px-3 py-1.5 text-sm font-semibold"
                style={ph === p ? { background: T.ink, color: "#fff" } : { background: "#fff", color: n ? T.ink2 : T.mute, border: "1px solid " + T.line }}>
                {isAr ? CK_PH[p][0] : CK_PH[p][1]} <span className="tabular text-xs">({n})</span>
              </button>
            );
          })}
        </div>
      </Card>

      {sec.warnAr && !edit && (
        <div className="rounded-lg p-2.5 text-xs font-bold mb-3 flex items-center gap-1.5"
          style={{ background: T.badSoft, color: T.bad, border: "1px solid " + T.badLine }}>
          <AlertTriangle size={14} />{isAr ? sec.warnAr : sec.warnEn}
        </div>
      )}
      {sec.id === "rst" && onToilets && !edit && (
        <div className="mb-3">
          <Btn size="sm" kind="ghost" onClick={onToilets}>
            <ClipboardCheck size={13} />{isAr ? "فتح تشيك ليست دورات المياه (كل 30 دقيقة)" : "Open the 30-minute toilet checklist"}</Btn>
        </div>
      )}

      {edit && (
        <Card className="mb-3">
          <div className="text-xs font-bold mb-2" style={{ color: T.mute }}>{isAr ? "بيانات الموقع" : "Location details"}</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <input value={sec.ar} onChange={e => putTpl({ ar: e.target.value })} placeholder="اسم الموقع بالعربية" className={inputCls} style={inputSty} />
            <input value={sec.en} onChange={e => putTpl({ en: e.target.value })} placeholder="Location name in English" className={inputCls} style={inputSty} dir="ltr" />
            <input value={sec.warnAr || ""} onChange={e => putTpl({ warnAr: e.target.value })} placeholder="تحذير (اختياري)" className={inputCls} style={inputSty} />
            <input value={sec.warnEn || ""} onChange={e => putTpl({ warnEn: e.target.value })} placeholder="Warning (optional)" className={inputCls} style={inputSty} dir="ltr" />
          </div>
        </Card>
      )}

      <Card pad={false}>
        <div className="p-3 flex items-center gap-2 flex-wrap" style={{ borderBottom: "1px solid " + T.line }}>
          <span className="text-xs font-bold tabular rounded-lg px-1.5 py-0.5"
            style={{ color: c.total && c.done === c.total ? "#047857" : T.mute, background: c.total && c.done === c.total ? "#ECFDF5" : T.surf }}>
            {c.done}/{c.total}
          </span>
          {c.issue > 0 && <span className="text-xs font-bold" style={{ color: T.bad }}>⚠ {c.issue} {isAr ? "غير مطابق" : "non-compliant"}</span>}
          <div className="flex-1" />
          {!edit && !!items.length && (
            <Btn size="sm" kind="ghost" onClick={tickAll} disabled={!canEdit}>
              <CheckCircle2 size={13} />{c.done === c.total ? (isAr ? "إلغاء التحديد" : "Clear all") : (isAr ? "تحديد الكل" : "Tick all")}</Btn>
          )}
        </div>

        <div className="p-3 flex flex-col gap-1.5">
          {!items.length && (
            <div className="text-xs py-2" style={{ color: T.mute }}>
              {isAr ? "لا توجد بنود في هذه المرحلة — أضفها من «تعديل البنود»." : "No items in this phase — add them from \"Edit items\"."}
            </div>
          )}
          {items.map(it => {
            const v = t[ckKey(ph, it.id)], task = xs[ckKey(ph, it.id)];
            if (edit) return (
              <div key={it.id} className="rounded-lg p-2" style={{ background: T.surf, border: "1px solid " + T.line }}>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input value={it.ar} onChange={e => itSet(it.id, { ar: e.target.value })} placeholder="النص بالعربية" className={inputCls} style={inputSty} />
                  <input value={it.en} onChange={e => itSet(it.id, { en: e.target.value })} placeholder="English text" className={inputCls} style={inputSty} dir="ltr" />
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {CK_PHL.map(ch => (
                    <button key={ch} onClick={() => phTog(it, ch)} className="rounded-lg px-2 py-1 text-xs font-semibold"
                      style={it.ph.includes(ch) ? { background: T.ink, color: "#fff" } : { background: "#fff", color: T.mute, border: "1px solid " + T.line }}>
                      {isAr ? CK_PH[ch][0] : CK_PH[ch][1]}
                    </button>
                  ))}
                  <div className="flex-1" />
                  {del === it.id
                    ? <button onClick={() => itDel(it.id)} className="rounded px-1.5 py-0.5 text-xs font-bold" style={{ background: T.bad, color: "#fff" }}>{isAr ? "حذف" : "Delete"}</button>
                    : <button onClick={() => setDel(it.id)} className="p-1" style={{ color: T.mute }}><Trash2 size={13} /></button>}
                </div>
              </div>
            );
            return (
              <div key={it.id} className="flex items-start gap-2 rounded-lg p-1.5"
                style={{ background: v === 1 ? "#ECFDF5" : v === -1 ? T.badSoft : "transparent" }}>
                <button onClick={() => canEdit && tick(it.id)} disabled={!canEdit} className="shrink-0 rounded-md mt-0.5" title={isAr ? "تم" : "Done"}
                  style={{ width: 24, height: 24, border: "1px solid " + (v === 1 ? "#047857" : T.line), background: v === 1 ? "#047857" : "#fff", color: "#fff", fontSize: 14, lineHeight: "22px" }}>
                  {v === 1 ? "✓" : ""}
                </button>
                <span className="flex-1 text-xs leading-snug" style={{ color: v === -1 ? T.bad : T.ink }}>
                  {isAr ? (it.ar || it.en) : it.en}
                  {task && <b className="block" style={{ color: T.mute }}>{isAr ? "أُنشئت مهمة صيانة" : "Maintenance task created"}</b>}
                </span>
                <button onClick={() => canEdit && flag(it)} disabled={!canEdit} className="shrink-0 rounded-md mt-0.5"
                  title={isAr ? "غير مطابق — ينشئ مهمة صيانة" : "Not compliant — creates a maintenance task"}
                  style={{ width: 24, height: 24, border: "1px solid " + (v === -1 ? T.bad : T.line), background: v === -1 ? T.bad : "#fff", color: v === -1 ? "#fff" : T.mute, fontSize: 13, lineHeight: "22px" }}>✗</button>
              </div>
            );
          })}
          {edit && canEdit && (
            <Btn size="sm" kind="ghost" onClick={itAdd}><Plus size={13} />{isAr ? "إضافة بند لهذه المرحلة" : "Add an item to this phase"}</Btn>
          )}
        </div>

        {!edit && (
          <div className="p-3" style={{ borderTop: "1px solid " + T.line }}>
            <textarea rows={2} value={nt[ckKey(ph, sec.id)] || ""} onChange={e => note(e.target.value)} disabled={!canEdit}
              placeholder={isAr ? "ملاحظات هذا الموقع" : "Observations for this location"} className={inputCls} style={inputSty} />
            <div className="flex gap-2 flex-wrap items-center mt-2">
              <Btn size="sm" kind={signed ? "ghost" : "solid"} onClick={sign} disabled={!canEdit}>
                <Pencil size={13} />{signed ? (isAr ? "إلغاء التوقيع" : "Remove signature") : (isAr ? "توقيع الموقع" : "Sign this location")}</Btn>
              {signed && <span className="text-xs" style={{ color: "#047857" }}>{signed.by} · {signed.prn} · <span className="tabular">{signed.at}</span></span>}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ================================= LINEN ================================== */
function LinenScreen({ isAr, linen, setLinen, print, user, canEdit }) {
  const cats = linen.cats && linen.cats.length ? linen.cats : [{ id: "towel", ar: "مناشف الوجه", en: "Face towels" }];
  const [tab, setTab] = useState(cats[0].id);
  const active = cats.find(c => c.id === tab) || cats[0];
  const rawRows = (linen.data && linen.data[active.id]) || [];
  // migrate legacy flat rows [d, ar, au, pr, pu] -> {d, am:{r,u,by,at}|null, pm:{...}|null}
  const rows = rawRows.map(r => Array.isArray(r)
    ? { d: r[0], am: (r[1] || r[2]) ? { r: r[1] || 0, u: r[2] || 0, by: null, at: null } : null,
              pm: (r[3] || r[4]) ? { r: r[3] || 0, u: r[4] || 0, by: null, at: null } : null }
    : r);
  const [catForm, setCatForm] = useState(null);
  const [delCat, setDelCat] = useState(null);
  const [ask, setAsk] = useState(null);
  const blankShift = { d: opDay(), r: "", u: "" };
  const [amForm, setAmForm] = useState(blankShift);
  const [pmForm, setPmForm] = useState(blankShift);

  const setRows = (id, next) => setLinen({ ...linen, cats, data: { ...(linen.data || {}), [id]: next } });
  const saveShift = (which, form) => {
    if (!form.d) return;
    const shift = { r: +form.r || 0, u: +form.u || 0, by: user.n, at: nowHM() };
    const existing = rows.find(x => x.d === form.d);
    const next = existing
      ? rows.map(x => x.d === form.d ? { ...x, [which]: shift } : x)
      : [...rows, { d: form.d, am: which === "am" ? shift : null, pm: which === "pm" ? shift : null }];
    setRows(active.id, next.sort((a, b) => a.d.localeCompare(b.d)));
    if (which === "am") setAmForm(blankShift); else setPmForm(blankShift);
  };
  const editingAM = rows.some(x => x.d === amForm.d && x.am);
  const editingPM = rows.some(x => x.d === pmForm.d && x.pm);

  const withBal = rows.map(x => ({ x, bal: (x.am?.r || 0) + (x.pm?.r || 0) - (x.am?.u || 0) - (x.pm?.u || 0) }));
  const tot = rows.reduce((a, x) => [a[0] + (x.am?.r || 0) + (x.pm?.r || 0), a[1] + (x.am?.u || 0) + (x.pm?.u || 0)], [0, 0]);
  const balance = tot[0] - tot[1];

  return (
    <div>
      <SectionTitle isAr={isAr} icon={Shirt} ar="سجلات المفروشات" en="Linen logs"
        sub={isAr ? "كل وردية تُدخل رقمها بشكل مستقل — الرصيد يُحتسب تلقائياً من الاثنتين معاً"
                  : "Each shift enters its own numbers independently — balance is calculated automatically from both"}
        right={<Btn kind="brass" size="sm" onClick={() => print({
          ar: "سجل " + active.ar, en: active.en + " Inventory Log",
          meta: [[isAr ? "الفترة" : "Period", rows.length ? rows[0].d + " → " + rows[rows.length - 1].d : "—"],
                 [isAr ? "إجمالي المستلم" : "Total received", tot[0]], [isAr ? "إجمالي المستخدم" : "Total used", tot[1]],
                 [isAr ? "الرصيد" : "Balance", balance]],
          cols: [isAr ? "التاريخ" : "Date", isAr ? "مستلم ص" : "AM rec.", isAr ? "مستخدم ص" : "AM used", isAr ? "بواسطة" : "By",
                 isAr ? "مستلم م" : "PM rec.", isAr ? "مستخدم م" : "PM used", isAr ? "بواسطة" : "By", isAr ? "الرصيد" : "Balance"],
          rows: withBal.map(({ x, bal }) => [x.d, x.am?.r ?? "—", x.am?.u ?? "—", x.am?.by || "—", x.pm?.r ?? "—", x.pm?.u ?? "—", x.pm?.by || "—", bal]),
          by: user.n,
        })}><Printer size={14} />{isAr ? "طباعة" : "Print"}</Btn>} />

      <div className="flex gap-2 mb-3 flex-wrap items-center">
        {cats.map(c => (
          <button key={c.id} onClick={() => { setTab(c.id); setAmForm(blankShift); setPmForm(blankShift); }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={tab === c.id ? { background: T.ink, color: "#fff" } : { background: "#fff", color: T.ink2, border: "1px solid " + T.line }}>
            {isAr ? c.ar : c.en}
            {canEdit && cats.length > 1 && tab === c.id && (
              <span onClick={(e) => { e.stopPropagation(); setDelCat(c); }} title={isAr ? "حذف القسم" : "Delete category"}
                className="rounded p-0.5" style={{ background: "rgba(255,255,255,.18)" }}><X size={11} /></span>
            )}
          </button>
        ))}
        {canEdit && (
          <Btn kind="brass" size="sm" onClick={() => setCatForm({ ar: "", en: "" })}>
            <Plus size={14} />{isAr ? "إضافة قسم" : "Add category"}
          </Btn>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {[[isAr ? "إجمالي المستلم" : "Total received", tot[0], T.ok], [isAr ? "إجمالي المستخدم" : "Total used", tot[1], T.brass],
          [isAr ? "الرصيد الحالي" : "Current balance", balance, T.vio], [isAr ? "عدد الأيام" : "Days logged", rows.length, T.mute]].map(([l, v, c], i) => (
          <Card key={i}>
            <div className="text-xs" style={{ color: T.mute }}>{l}</div>
            <div className="text-xl font-bold tabular" style={{ color: c }}>{v}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <Card style={{ borderColor: T.brassLine }}>
          <b className="text-sm flex items-center gap-1.5 mb-3" style={{ color: T.ink }}>
            <Sun size={15} style={{ color: T.brass }} />
            {editingAM ? (isAr ? "تحديث الوردية الصباحية" : "Update AM shift") : (isAr ? "إدخال الوردية الصباحية" : "Enter AM shift")}
          </b>
          <div className="grid grid-cols-3 gap-2.5 items-end">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "التاريخ" : "Date"}</label>
              <input type="date" value={amForm.d} onChange={e => setAmForm({ ...amForm, d: e.target.value })} className={inputCls} style={inputSty} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "مستلم" : "Received"}</label>
              <input type="number" min="0" value={amForm.r} onChange={e => setAmForm({ ...amForm, r: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "مستخدم" : "Used"}</label>
              <input type="number" min="0" value={amForm.u} onChange={e => setAmForm({ ...amForm, u: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Btn kind="solid" onClick={() => saveShift("am", amForm)}>
              {editingAM ? <CheckCircle2 size={14} /> : <Plus size={14} />}{editingAM ? (isAr ? "تحديث" : "Update") : (isAr ? "حفظ" : "Save")}
            </Btn>
            <span className="text-xs" style={{ color: T.mute }}>{isAr ? "لا حاجة لمعرفة رقم الوردية المسائية" : "No need to know the PM numbers"}</span>
          </div>
        </Card>

        <Card style={{ borderColor: T.vioLine }}>
          <b className="text-sm flex items-center gap-1.5 mb-3" style={{ color: T.ink }}>
            <Moon size={15} style={{ color: T.vio }} />
            {editingPM ? (isAr ? "تحديث الوردية المسائية" : "Update PM shift") : (isAr ? "إدخال الوردية المسائية" : "Enter PM shift")}
          </b>
          <div className="grid grid-cols-3 gap-2.5 items-end">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "التاريخ" : "Date"}</label>
              <input type="date" value={pmForm.d} onChange={e => setPmForm({ ...pmForm, d: e.target.value })} className={inputCls} style={inputSty} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "مستلم" : "Received"}</label>
              <input type="number" min="0" value={pmForm.r} onChange={e => setPmForm({ ...pmForm, r: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "مستخدم" : "Used"}</label>
              <input type="number" min="0" value={pmForm.u} onChange={e => setPmForm({ ...pmForm, u: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Btn kind="solid" onClick={() => saveShift("pm", pmForm)}>
              {editingPM ? <CheckCircle2 size={14} /> : <Plus size={14} />}{editingPM ? (isAr ? "تحديث" : "Update") : (isAr ? "حفظ" : "Save")}
            </Btn>
            <span className="text-xs" style={{ color: T.mute }}>{isAr ? "لا حاجة لمعرفة رقم الوردية الصباحية" : "No need to know the AM numbers"}</span>
          </div>
        </Card>
      </div>

      <Card pad={false}>
        <div className="overflow-x-auto hf-scroll">
          <table className="w-full text-sm" style={{ minWidth: 760 }}>
            <thead style={{ background: T.surf }}>
              <tr>
                <th rowSpan={2} className="text-start px-3 py-2 text-xs font-bold align-bottom" style={{ color: T.mute, borderBottom: "1px solid " + T.line }}>{isAr ? "التاريخ" : "Date"}</th>
                <th colSpan={3} className="px-3 py-1.5 text-xs font-bold text-center" style={{ color: T.brassText, background: T.brassSoft }}>
                  <span className="inline-flex items-center gap-1"><Sun size={11} />{isAr ? "الوردية الصباحية" : "AM shift"}</span>
                </th>
                <th colSpan={3} className="px-3 py-1.5 text-xs font-bold text-center" style={{ color: T.vioText, background: T.vioSoft }}>
                  <span className="inline-flex items-center gap-1"><Moon size={11} />{isAr ? "الوردية المسائية" : "PM shift"}</span>
                </th>
                <th rowSpan={2} className="text-start px-3 py-2 text-xs font-bold align-bottom" style={{ color: T.mute, borderBottom: "1px solid " + T.line }}>{isAr ? "الرصيد" : "Balance"}</th>
                <th rowSpan={2}></th>
              </tr>
              <tr>
                {[isAr ? "مستلم" : "Rec.", isAr ? "مستخدم" : "Used", isAr ? "بواسطة" : "By"].map((h, i) => (
                  <th key={"am" + i} className="text-start px-3 py-1.5 text-xs font-semibold" style={{ color: T.brassText, borderBottom: "1px solid " + T.line }}>{h}</th>))}
                {[isAr ? "مستلم" : "Rec.", isAr ? "مستخدم" : "Used", isAr ? "بواسطة" : "By"].map((h, i) => (
                  <th key={"pm" + i} className="text-start px-3 py-1.5 text-xs font-semibold" style={{ color: T.vioText, borderBottom: "1px solid " + T.line }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {withBal.slice().reverse().map(({ x, bal }) => (
                <tr key={x.d} style={{ borderTop: "1px solid " + T.line }}>
                  <td className="px-3 py-2 font-semibold tabular" style={{ color: T.ink }}>{x.d}</td>
                  <td className="px-3 py-2 tabular" style={{ color: x.am ? T.ink2 : T.mute }}>{x.am?.r ?? "—"}</td>
                  <td className="px-3 py-2 tabular" style={{ color: x.am ? T.ink2 : T.mute }}>{x.am?.u ?? "—"}</td>
                  <td className="px-3 py-2" style={{ color: T.mute, fontSize: 12 }}>{x.am?.by || "—"}</td>
                  <td className="px-3 py-2 tabular" style={{ color: x.pm ? T.ink2 : T.mute }}>{x.pm?.r ?? "—"}</td>
                  <td className="px-3 py-2 tabular" style={{ color: x.pm ? T.ink2 : T.mute }}>{x.pm?.u ?? "—"}</td>
                  <td className="px-3 py-2" style={{ color: T.mute, fontSize: 12 }}>{x.pm?.by || "—"}</td>
                  <td className="px-3 py-2"><Chip tone={bal > 0 ? "vio" : "mut"}>{bal}</Chip></td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => setAmForm({ d: x.d, r: String(x.am?.r || 0), u: String(x.am?.u || 0) })} title={isAr ? "تعديل الصباحية" : "Edit AM"}
                        className="rounded p-1.5" style={{ background: T.brassSoft, color: T.brassText }}><Sun size={12} /></button>
                      <button onClick={() => setPmForm({ d: x.d, r: String(x.pm?.r || 0), u: String(x.pm?.u || 0) })} title={isAr ? "تعديل المسائية" : "Edit PM"}
                        className="rounded p-1.5" style={{ background: T.vioSoft, color: T.vioText }}><Moon size={12} /></button>
                      <button onClick={() => setAsk(x.d)} className="rounded p-1.5" style={{ background: T.badSoft, color: T.bad }}
                        title={isAr ? "حذف اليوم كاملاً" : "Delete whole day"}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && <Empty isAr={isAr} ar="لا توجد سجلات في هذا القسم بعد — سجّل أول وردية من الأعلى." en="No records in this category yet — record the first shift above." />}
      </Card>

      {catForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 380 }}>
            <div className="flex items-center justify-between mb-3">
              <b style={{ color: T.ink }}>{isAr ? "قسم مفروشات جديد" : "New linen category"}</b>
              <button onClick={() => setCatForm(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الاسم (عربي) *" : "Name (Arabic) *"}</label>
            <input autoFocus value={catForm.ar} onChange={e => setCatForm({ ...catForm, ar: e.target.value })}
              placeholder={isAr ? "مثال: مفارش الطاولات" : ""} className={inputCls + " mb-2"} style={inputSty} />
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</label>
            <input value={catForm.en} onChange={e => setCatForm({ ...catForm, en: e.target.value })} placeholder="e.g. Table cloths" className={inputCls} style={inputSty} />
            <div className="flex gap-2 mt-4">
              <Btn kind="solid" disabled={!catForm.ar.trim() && !catForm.en.trim()} onClick={() => {
                const ar = catForm.ar.trim() || catForm.en.trim(), en = catForm.en.trim() || catForm.ar.trim();
                const id = "L" + uid();
                setLinen({ ...linen, cats: [...cats, { id, ar, en }], data: { ...(linen.data || {}), [id]: [] } });
                setTab(id); setCatForm(null); setAmForm(blankShift); setPmForm(blankShift);
              }}><CheckCircle2 size={14} />{isAr ? "إضافة" : "Add"}</Btn>
              <Btn onClick={() => setCatForm(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {delCat && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 360 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف قسم المفروشات؟" : "Delete this linen category?"}</b>
            <div className="text-sm mb-3" style={{ color: T.ink2 }}>{isAr ? delCat.ar : delCat.en}</div>
            <div className="text-xs mb-4 rounded-lg p-2" style={{ background: T.badSoft, color: T.bad }}>
              {isAr ? "ستُحذف " + ((linen.data || {})[delCat.id] || []).length + " سجلاً يومياً معه."
                    : ((linen.data || {})[delCat.id] || []).length + " daily records will be deleted with it."}
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                const nd = { ...(linen.data || {}) }; delete nd[delCat.id];
                const nc = cats.filter(c => c.id !== delCat.id);
                setLinen({ ...linen, cats: nc, data: nd });
                setTab(nc[0].id); setDelCat(null); setAmForm(blankShift); setPmForm(blankShift);
              }} className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: T.bad }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setDelCat(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {ask && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 340 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف سجل هذا اليوم كاملاً؟" : "Delete this entire day's record?"}</b>
            <div className="text-sm mb-2 tabular" style={{ color: T.ink2 }}>{ask}</div>
            <div className="text-xs mb-4" style={{ color: T.mute }}>{isAr ? "يحذف الوردية الصباحية والمسائية معاً." : "Removes both the AM and PM entries."}</div>
            <div className="flex gap-2">
              <button onClick={() => { setRows(active.id, rows.filter(x => x.d !== ask)); setAsk(null); }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: T.bad }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setAsk(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ============================ BREAKAGE & WASTAGE ========================== */
function BreakScreen({ isAr, breaks, setBreaks, print, user }) {
  const blank = { d: opDay(), it: "", cat: BREAK_CATS[0], q: "1", sh: inNightCarry() ? "PM" : "AM", why: "", note: "" };
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [ask, setAsk] = useState(null);
  const rowOf = (v) => [v.d, v.it.trim(), v.cat, +v.q || 1, v.sh, v.by || user.n, v.why.trim(), v.note.trim()];
  const add = () => {
    if (!f.it.trim()) return;
    if (edit != null) { setBreaks(breaks.map((b, i) => i === edit ? rowOf({ ...f, by: b[5] }) : b)); setEdit(null); }
    else setBreaks([rowOf(f), ...breaks]);
    setF(blank);
  };
  const load = (i) => { const b = breaks[i];
    setF({ d: b[0], it: b[1], cat: b[2], q: String(b[3]), sh: b[4], why: b[6] || "", note: b[7] || "" }); setEdit(i); };
  const byCat = BREAK_CATS.map(c => [c, breaks.filter(b => b[2] === c).reduce((a, b) => a + b[3], 0)]).filter(x => x[1]);
  const M0 = monthKey(todayISO());
  const thisMonth = breaks.filter(b => monthKey(b[0]) === M0).reduce((a, b) => a + b[3], 0);

  return (
    <div>
      <SectionTitle isAr={isAr} icon={Wine} ar="سجل الكسر والتوالف" en="Breakage items log"
        sub={isAr ? "كل قطعة مكسورة تُسجَّل بالسبب والوردية والمبلِّغ — قابلة للتعديل والحذف"
                  : "Every broken piece logged with reason, shift and reporter — editable and deletable"}
        right={<Btn kind="brass" size="sm" onClick={() => print({
          ar: "سجل الكسر — لاونج حفاوة", en: "Breakage Items Log — Hafawa Lounge",
          meta: [[isAr ? "عدد السجلات" : "Records", breaks.length], [isAr ? "إجمالي القطع" : "Total pieces", breaks.reduce((a, b) => a + b[3], 0)],
                 [isAr ? "هذا الشهر" : "This month", thisMonth]],
          cols: [isAr ? "التاريخ" : "Date", isAr ? "الصنف" : "Item", isAr ? "الفئة" : "Category", isAr ? "الكمية" : "Qty",
                 isAr ? "الوردية" : "Shift", isAr ? "المبلِّغ" : "Reported by", isAr ? "السبب" : "Reason", isAr ? "ملاحظات" : "Notes"],
          rows: breaks, by: user.n,
        })}><Printer size={14} />{isAr ? "طباعة" : "Print"}</Btn>} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Card><div className="text-xs" style={{ color: T.mute }}>{isAr ? "إجمالي القطع" : "Total pieces"}</div>
          <div className="text-xl font-bold tabular" style={{ color: T.bad }}>{breaks.reduce((a, b) => a + b[3], 0)}</div></Card>
        <Card><div className="text-xs" style={{ color: T.mute }}>{isAr ? "هذا الشهر" : "This month"}</div>
          <div className="text-xl font-bold tabular" style={{ color: T.brass }}>{thisMonth}</div></Card>
        <Card><div className="text-xs" style={{ color: T.mute }}>{isAr ? "عدد السجلات" : "Records"}</div>
          <div className="text-xl font-bold tabular" style={{ color: T.ink }}>{breaks.length}</div></Card>
        <Card><div className="text-xs" style={{ color: T.mute }}>{isAr ? "الفئة الأعلى" : "Top category"}</div>
          <div className="text-sm font-bold mt-1" style={{ color: T.vio }}>{byCat.length ? byCat.slice().sort((a, b) => b[1] - a[1])[0][0] : "—"}</div></Card>
      </div>

      <Card className="mb-3">
        <b className="text-sm block mb-3" style={{ color: T.ink }}>
          {edit != null ? (isAr ? "تعديل سجل الكسر" : "Edit breakage record") : (isAr ? "تسجيل كسر جديد" : "Log a new breakage")}
        </b>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "التاريخ" : "Date"}</label>
            <input type="date" value={f.d} onChange={e => setF({ ...f, d: e.target.value })} className={inputCls} style={inputSty} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الصنف المكسور *" : "Broken item *"}</label>
            <input value={f.it} onChange={e => setF({ ...f, it: e.target.value })}
              placeholder={isAr ? "مثال: كوب إسبريسو" : "e.g. Espresso cup"} className={inputCls} style={inputSty} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الفئة" : "Category"}</label>
            <select value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })} className={inputCls} style={inputSty}>
              {BREAK_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الكمية" : "Qty"}</label>
            <input type="number" min="1" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الوردية" : "Shift"}</label>
            <select value={f.sh} onChange={e => setF({ ...f, sh: e.target.value })} className={inputCls} style={inputSty}>
              <option>AM</option><option>PM</option>
            </select>
          </div>
          <div className="col-span-2 lg:col-span-3">
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "سبب الكسر" : "Reason"}</label>
            <input value={f.why} onChange={e => setF({ ...f, why: e.target.value })}
              placeholder={isAr ? "سقوط أثناء التنظيف…" : "Dropped while cleaning…"} className={inputCls} style={inputSty} />
          </div>
          <div className="col-span-2 lg:col-span-3">
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "ملاحظات / إجراء" : "Notes / action"}</label>
            <input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} className={inputCls} style={inputSty} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Btn kind="solid" disabled={!f.it.trim()} onClick={add}>
            {edit != null ? <CheckCircle2 size={14} /> : <Plus size={14} />}
            {edit != null ? (isAr ? "حفظ التعديل" : "Save changes") : (isAr ? "إضافة" : "Add")}
          </Btn>
          {edit != null && <Btn onClick={() => { setEdit(null); setF(blank); }}>{isAr ? "إلغاء" : "Cancel"}</Btn>}
          <span className="text-xs" style={{ color: T.mute }}>{isAr ? "يُسجَّل باسم " : "Logged as "}<b>{user.n}</b> · {user.prn}</span>
        </div>
      </Card>

      <div className="flex gap-2 flex-wrap mb-3">
        {byCat.map(([c, n]) => <Chip key={c} tone="brass">{c}: {n}</Chip>)}
      </div>

      <Card pad={false}>
        <div className="overflow-x-auto hf-scroll">
          <table className="w-full text-sm" style={{ minWidth: 780 }}>
            <thead style={{ background: T.surf }}>
              <tr>{[isAr ? "التاريخ" : "Date", isAr ? "الصنف" : "Item", isAr ? "الفئة" : "Category", isAr ? "الكمية" : "Qty",
                    isAr ? "الوردية" : "Shift", isAr ? "المبلِّغ" : "Reported by", isAr ? "السبب" : "Reason", ""].map((h, i) => (
                <th key={i} className="text-start px-3 py-2 text-xs font-bold" style={{ color: T.mute }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {breaks.map((b, i) => (
                <tr key={i} style={{ borderTop: "1px solid " + T.line, background: edit === i ? T.vioSoft : undefined }}>
                  <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>{b[0]}</td>
                  <td className="px-3 py-2 font-semibold" style={{ color: T.ink }}>{b[1]}</td>
                  <td className="px-3 py-2"><Chip tone="vio">{b[2]}</Chip></td>
                  <td className="px-3 py-2 tabular font-bold" style={{ color: T.ink }}>{b[3]}</td>
                  <td className="px-3 py-2" style={{ color: T.ink2 }}>{b[4]}</td>
                  <td className="px-3 py-2" style={{ color: T.ink2 }}>{b[5]}</td>
                  <td className="px-3 py-2 clamp2" style={{ color: T.mute, maxWidth: 220 }}>{b[6]}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => load(i)} className="rounded p-1.5" style={{ background: T.vioSoft, color: T.vioText }}
                        title={isAr ? "تعديل" : "Edit"}><Pencil size={13} /></button>
                      <button onClick={() => setAsk(i)} className="rounded p-1.5" style={{ background: T.badSoft, color: T.bad }}
                        title={isAr ? "حذف" : "Delete"}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!breaks.length && <Empty isAr={isAr} ar="لا توجد سجلات كسر — سجّل أول قطعة من النموذج أعلاه." en="No breakage records — log the first piece above." />}
      </Card>

      {ask != null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 340 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف سجل الكسر؟" : "Delete this breakage record?"}</b>
            <div className="text-sm mb-4" style={{ color: T.ink2 }}>{breaks[ask] && breaks[ask][1]}</div>
            <div className="flex gap-2">
              <button onClick={() => { setBreaks(breaks.filter((_, j) => j !== ask)); if (edit === ask) { setEdit(null); setF(blank); } setAsk(null); }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: T.bad }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setAsk(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function WasteScreen({ isAr, waste, setWaste, print, user, warehouses }) {
  const blank = { d: opDay(), sec: (warehouses[0] || {}).en || "Dry Store", it: "", exp: "", q: "1", why: "Expired", note: "", sh: inNightCarry() ? "PM" : "AM" };
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [ask, setAsk] = useState(null);
  const rowOf = (v, by) => [v.d, v.sec, v.it.trim(), v.exp ? v.exp + " — " + v.d : "—", +v.q || 1, v.why, v.why, by || user.n, v.note.trim(), v.sh || "AM"];
  const add = () => {
    if (!f.it.trim()) return;
    if (edit != null) { setWaste(waste.map((w, i) => i === edit ? rowOf(f, w[7]) : w)); setEdit(null); }
    else setWaste([rowOf(f), ...waste]);
    setF(blank);
  };
  const load = (i) => { const w = waste[i];
    setF({ d: w[0], sec: w[1], it: w[2], exp: String(w[3] || "").slice(0, 10).match(/^\d{4}-\d{2}-\d{2}$/) ? String(w[3]).slice(0, 10) : "",
           q: String(w[4]), why: ["Expired", "Damaged", "Broken", "Returned", "Other"].includes(w[5]) ? w[5] : "Other", note: w[8] || "", sh: w[9] === "PM" ? "PM" : "AM" });
    setEdit(i);
  };
  const totals = waste.reduce((a, w) => { a.q += w[4] || 0; a[w[5]] = (a[w[5]] || 0) + 1; return a; }, { q: 0 });
  return (
    <div>
      <SectionTitle isAr={isAr} icon={Trash2} ar="الهدر والإتلاف" en="Wastage & disposal"
        sub={isAr ? "سجّل كل صنف يُتلف — بالسبب والكمية والقسم" : "Log every disposed item — reason, quantity and section"}
        right={<Btn kind="brass" size="sm" onClick={() => print({
          ar: "سجل الهدر والإتلاف", en: "Wastage & Disposal Record",
          meta: [[isAr ? "السجلات" : "Records", waste.length], [isAr ? "إجمالي الكميات" : "Total qty", totals.q]],
          cols: [isAr ? "التاريخ" : "Date", isAr ? "القسم" : "Section", isAr ? "الصنف" : "Item", isAr ? "الصلاحية — الإتلاف" : "Expiry — Disposed",
                 isAr ? "الكمية" : "Qty", isAr ? "الوردية" : "Shift", isAr ? "السبب" : "Reason", isAr ? "الحالة" : "Condition", isAr ? "المبلِّغ" : "Reported by"],
          rows: waste.map(w => [w[0], w[1], w[2], w[3], w[4], w[9] || "—", w[5], w[6], w[7]].map(x => x == null ? "" : x)), by: user.n,
        })}><Printer size={14} />{isAr ? "طباعة" : "Print"}</Btn>} />

      <div className="flex gap-2 flex-wrap mb-3">
        <Chip tone="bad">{isAr ? "إجمالي المُتلَف" : "Total disposed"}: {totals.q}</Chip>
        {Object.entries(totals).filter(([k]) => k !== "q").map(([k, v]) => <Chip key={k} tone="warn">{k}: {v}</Chip>)}
      </div>

      <Card className="mb-3">
        <div className="grid grid-cols-2 lg:grid-cols-8 gap-2 items-end">
          <div><label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "التاريخ" : "Date"}</label>
            <input type="date" value={f.d} onChange={e => setF({ ...f, d: e.target.value })} className={inputCls} style={inputSty} /></div>
          <div><label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "القسم" : "Section"}</label>
            <select value={f.sec} onChange={e => setF({ ...f, sec: e.target.value })} className={inputCls} style={inputSty}>
              {warehouses.map(w => <option key={w.id} value={w.en}>{isAr ? w.ar : w.en}</option>)}
              {!warehouses.some(w => w.en === f.sec) && <option value={f.sec}>{f.sec}</option>}</select></div>
          <div className="col-span-2"><label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الصنف المُتلَف *" : "Disposed item *"}</label>
            <input value={f.it} onChange={e => setF({ ...f, it: e.target.value })} className={inputCls} style={inputSty} /></div>
          <div><label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "صلاحيته" : "Its expiry"}</label>
            <input type="date" value={f.exp} onChange={e => setF({ ...f, exp: e.target.value })} className={inputCls} style={inputSty} /></div>
          <div><label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الكمية" : "Qty"}</label>
            <input type="number" min="1" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} className={inputCls + " tabular"} style={inputSty} /></div>
          <div><label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "السبب" : "Reason"}</label>
            <select value={f.why} onChange={e => setF({ ...f, why: e.target.value })} className={inputCls} style={inputSty}>
              {["Expired", "Damaged", "Broken", "Returned", "Other"].map(x => <option key={x}>{x}</option>)}</select></div>
          <div><label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الوردية" : "Shift"}</label>
            <select value={f.sh} onChange={e => setF({ ...f, sh: e.target.value })} className={inputCls} style={inputSty}>
              <option value="AM">AM</option><option value="PM">PM</option></select></div>
          <Btn kind="solid" disabled={!f.it.trim()} onClick={add}>
            {edit != null ? <CheckCircle2 size={14} /> : <Plus size={14} />}
            {edit != null ? (isAr ? "حفظ التعديل" : "Save changes") : (isAr ? "تسجيل الإتلاف" : "Log disposal")}
          </Btn>
          <div className="col-span-2 lg:col-span-8"><label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "ملاحظات / إجراء" : "Notes / action"}</label>
            <input value={f.note} onChange={e => setF({ ...f, note: e.target.value })} className={inputCls} style={inputSty} /></div>
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {edit != null && <Btn size="sm" onClick={() => { setEdit(null); setF(blank); }}>{isAr ? "إلغاء التحرير" : "Cancel edit"}</Btn>}
          <span className="text-xs" style={{ color: T.mute }}>{isAr ? "يُسجَّل باسم " : "Logged as "}<b>{user.n}</b> · {user.prn}</span>
        </div>
      </Card>

      <Card pad={false}>
        <div className="overflow-x-auto hf-scroll">
          <table className="w-full text-sm" style={{ minWidth: 800 }}>
            <thead style={{ background: T.surf }}>
              <tr>{[isAr ? "التاريخ" : "Date", isAr ? "القسم" : "Section", isAr ? "الصنف" : "Item", isAr ? "الكمية" : "Qty", isAr ? "الوردية" : "Shift",
                    isAr ? "السبب" : "Reason", isAr ? "المبلِّغ" : "Reported by", isAr ? "الإجراء" : "Action", ""].map((h, i) => (
                <th key={i} className="text-start px-3 py-2 text-xs font-bold" style={{ color: T.mute }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {waste.map((w, i) => (
                <tr key={i} style={{ borderTop: "1px solid " + T.line, background: edit === i ? T.vioSoft : undefined }}>
                  <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>{w[0]}</td>
                  <td className="px-3 py-2"><Chip tone="vio">{w[1]}</Chip></td>
                  <td className="px-3 py-2 font-semibold" style={{ color: T.ink }}>{w[2]}</td>
                  <td className="px-3 py-2 tabular font-bold" style={{ color: T.ink }}>{w[4]}</td>
                  <td className="px-3 py-2"><Chip tone="mut">{w[9] || "—"}</Chip></td>
                  <td className="px-3 py-2"><Chip tone={String(w[5]).toLowerCase().includes("expir") ? "bad" : "warn"}>{w[5]}</Chip></td>
                  <td className="px-3 py-2" style={{ color: T.ink2 }}>{w[7]}</td>
                  <td className="px-3 py-2 clamp2" style={{ color: T.mute, maxWidth: 240 }}>{w[8]}</td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => load(i)} className="rounded p-1.5" style={{ background: T.vioSoft, color: T.vioText }}
                        title={isAr ? "تعديل" : "Edit"}><Pencil size={13} /></button>
                      <button onClick={() => setAsk(i)} className="rounded p-1.5" style={{ background: T.badSoft, color: T.bad }}
                        title={isAr ? "حذف" : "Delete"}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {ask != null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 340 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف سجل الإتلاف؟" : "Delete this disposal record?"}</b>
            <div className="text-sm mb-4" style={{ color: T.ink2 }}>{waste[ask] && waste[ask][2]}</div>
            <div className="flex gap-2">
              <button onClick={() => { setWaste(waste.filter((_, j) => j !== ask)); setAsk(null); }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: "#DC2626" }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setAsk(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
/* ============================ BARCODE SCANNING ============================
   barcodes doc (app_state key "barcodes"): { [code]: { names: [itemName, ...], at, by } }
   Shared across all warehouses; the item name is the identity used everywhere else. */
const nameKey = (v) => String(v || "").trim().toLowerCase().replace(/\s+/g, " ");
const bcEntry = (bc, code) => (bc && bc[code]) || null;
const bcBind = (bc, code, name, mode, by) => {
  const n = { ...(bc || {}) }; const cur = n[code] || { names: [] };
  const names = mode === "move" ? [name] : [...(cur.names || []).filter(x => nameKey(x) !== nameKey(name)), name];
  n[code] = { names, at: todayISO(), by }; return n;
};
const bcUnbind = (bc, code, name) => {
  const n = { ...(bc || {}) }; const cur = n[code]; if (!cur) return n;
  const names = (cur.names || []).filter(x => nameKey(x) !== nameKey(name));
  if (names.length) n[code] = { ...cur, names }; else delete n[code];
  return n;
};
const bcRowIdx = (bc, code, rows) => {
  const e = bcEntry(bc, code); if (!e) return -1;
  const keys = new Set((e.names || []).map(nameKey));
  return rows.findIndex(r => typeof r !== "string" && keys.has(nameKey(r[0])));
};
const bcRowIdxs = (bc, code, rows) => {
  const e = bcEntry(bc, code); if (!e) return [];
  const keys = new Set((e.names || []).map(nameKey)); const out = [];
  rows.forEach((r, i) => { if (typeof r !== "string" && keys.has(nameKey(r[0]))) out.push(i); });
  return out;
};
const bcTail = (c) => (c.length > 4 ? "…" + c.slice(-4) : c);
let HF_AUDIO = null;
/* call from a tap handler: browsers (Safari especially) only allow sound started by a user gesture */
const audioUnlock = () => {
  try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    if (!HF_AUDIO) HF_AUDIO = new C();
    if (HF_AUDIO.state === "suspended") HF_AUDIO.resume();
    const b = HF_AUDIO.createBuffer(1, 1, 22050), src = HF_AUDIO.createBufferSource(); src.buffer = b; src.connect(HF_AUDIO.destination); src.start(0);
  } catch (e) {}
};
const beep = () => {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    if (C) { const ctx = HF_AUDIO || (HF_AUDIO = new C()); if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 1400; g.gain.value = 0.12; o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.09); }
  } catch (e) {}
  try { if (navigator.vibrate) navigator.vibrate(70); } catch (e) {}
};
const scanErrMsg = (e, isAr) => {
  const t = String((e && (e.name || e.message)) || e || "");
  if (/NotAllowed|Permission|denied/i.test(t)) return isAr ? "تم رفض إذن الكاميرا — فعّله من إعدادات المتصفح، أو استخدم «التقاط صورة»." : "Camera permission denied — enable it in browser settings, or use “Take photo”.";
  if (/NotFound|no camera|device not found/i.test(t)) return isAr ? "لا توجد كاميرا على هذا الجهاز — استخدم «التقاط صورة» أو قارئ USB." : "No camera on this device — use “Take photo” or a USB scanner.";
  if (/NotReadable|in use|busy|Could not start|AbortError/i.test(t)) return isAr ? "الكاميرا مشغولة بتطبيق آخر — أغلقه ثم أعد المحاولة." : "The camera is busy in another app — close it and retry.";
  return (isAr ? "تعذّر تشغيل الكاميرا: " : "Could not start the camera: ") + t;
};
const SCAN_OPTS = { experimentalFeatures: { useBarCodeDetectorIfSupported: true }, verbose: false };
const SCAN_CFG = { fps: 12, qrbox: (w, h) => ({ width: Math.max(50, Math.floor(w * 0.88)), height: Math.max(50, Math.floor(h * 0.5)) }) };
let HF_SCANNER = null; /* the only camera instance in the app */
const scannerStop = async () => {
  const sc = HF_SCANNER; HF_SCANNER = null; if (!sc) return;
  try { if (sc.isScanning) await sc.stop(); } catch (e) {}
  try { sc.clear(); } catch (e) {}
};

function ScanSheet({ isAr, title, hint, onCode, onClose }) {
  const [err, setErr] = useState("");
  const [running, setRunning] = useState(false);
  const [cams, setCams] = useState([]);
  const [camIdx, setCamIdx] = useState(-1);
  const [torch, setTorch] = useState(false);
  const [flash, setFlash] = useState(false);
  const [manual, setManual] = useState("");
  const last = useRef({ code: "", t: 0 }), pauseUntil = useRef(0), fileRef = useRef(null);
  const cb = useRef(onCode); cb.current = onCode;
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const onDecode = (text) => {
    const now = Date.now();
    if (now < pauseUntil.current) return;
    if (text === last.current.code && now - last.current.t < 2500) return;
    last.current = { code: text, t: now }; pauseUntil.current = now + 600;
    beep(); setFlash(true); setTimeout(() => setFlash(false), 350);
    cb.current(text);
  };
  const alive = useRef(true);
  /* Start the camera. Android often reports the camera as "busy" for a moment after a previous
     stream was released, so a NotReadable/AbortError is retried twice with a short pause. */
  const start = async (camId, attempt = 0) => {
    await scannerStop(); setErr("");
    if (!alive.current || !document.getElementById("hf-scan")) return;
    try {
      const sc = new Html5Qrcode("hf-scan", SCAN_OPTS); HF_SCANNER = sc;
      await sc.start(camId ? { deviceId: { exact: camId } } : { facingMode: "environment" }, SCAN_CFG, onDecode, () => {});
      if (!alive.current) { await scannerStop(); return; }
      setRunning(true); setTorch(false);
      /* list cameras without opening a second stream (labels are available once permission is granted) */
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devs = await navigator.mediaDevices.enumerateDevices();
          if (alive.current) setCams(devs.filter(d => d.kind === "videoinput").map(d => ({ id: d.deviceId, label: d.label })));
        }
      } catch (e) {}
    } catch (e) {
      await scannerStop(); setRunning(false);
      const t = String((e && (e.name || e.message)) || e || "");
      if (attempt < 2 && alive.current && /NotReadable|Could not start|AbortError|Starting video failed|busy|in use/i.test(t)) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        return start(camId, attempt + 1);
      }
      if (alive.current) setErr(scanErrMsg(e, isAr));
    }
  };
  useEffect(() => {
    alive.current = true;
    start(null);
    const vis = () => { if (document.visibilityState === "hidden") { scannerStop(); closeRef.current(); } };
    document.addEventListener("visibilitychange", vis);
    return () => { alive.current = false; document.removeEventListener("visibilitychange", vis); scannerStop(); };
  }, []);
  const switchCam = () => { if (cams.length < 2) return; const i = (camIdx + 1) % cams.length; setCamIdx(i); start(cams[i].id); };
  const toggleTorch = async () => {
    const sc = HF_SCANNER; if (!sc || !sc.isScanning) return;
    try { await sc.applyVideoConstraints({ advanced: [{ torch: !torch }] }); setTorch(!torch); }
    catch (e) { setErr(isAr ? "الفلاش غير مدعوم على هذا الجهاز/المتصفح." : "Torch is not supported on this device/browser."); }
  };
  const onFile = async (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = ""; if (!f) return;
    const wasRunning = running; setErr("");
    await scannerStop(); setRunning(false);
    try {
      const sc = new Html5Qrcode("hf-scan", SCAN_OPTS); HF_SCANNER = sc;
      const r = await sc.scanFileV2(f, false);
      await scannerStop(); beep(); cb.current(r.decodedText);
    } catch (e2) {
      await scannerStop();
      setErr(isAr ? "الصورة لا تحتوي باركوداً واضحاً — قرّب الكاميرا وثبّتها ثم أعد الالتقاط." : "No clear barcode in the photo — move closer, hold steady and retake.");
      if (wasRunning) start(camIdx >= 0 && cams[camIdx] ? cams[camIdx].id : null);
    }
  };
  const ctl = (on) => ({ background: on ? T.brass : "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.25)" });
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(20,18,40,.72)" }}>
      <div className="w-full" style={{ maxWidth: 520, background: "#141226", color: "#fff", borderRadius: "16px 16px 0 0", boxShadow: "0 -8px 30px rgba(0,0,0,.4)" }}>
        <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <b className="text-sm flex items-center gap-1.5"><ScanLine size={16} style={{ color: T.brass }} />{title}</b>
          <button onClick={() => { scannerStop(); onClose(); }} className="rounded-lg px-2.5 py-1 text-xs font-bold" style={ctl(false)}>
            <span className="inline-flex items-center gap-1"><X size={13} />{isAr ? "إغلاق" : "Close"}</span></button>
        </div>
        <div className="relative" style={{ background: "#000" }}>
          <div id="hf-scan" style={{ width: "100%", minHeight: 240 }} />
          {flash && <div className="absolute inset-0 pointer-events-none" style={{ border: "6px solid #22C55E", boxShadow: "inset 0 0 40px rgba(34,197,94,.55)" }} />}
          {!running && !err && <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: "#bbb" }}>{isAr ? "جارٍ تشغيل الكاميرا…" : "Starting camera…"}</div>}
        </div>
        {err && (
          <div className="mx-3 mt-2 rounded-lg px-3 py-2 text-xs flex items-start gap-1.5" style={{ background: "#FEF2F2", color: "#DC2626" }}>
            <AlertTriangle size={13} className="shrink-0 mt-0.5" /><span>{err}</span>
          </div>
        )}
        <div className="px-3 pt-2 flex gap-2 items-center">
          <input value={manual} onChange={e => setManual(e.target.value)} dir="ltr" inputMode="numeric" autoComplete="off"
            onKeyDown={e => { if (e.key === "Enter" && manual.trim()) { e.preventDefault(); const c = manual.trim(); setManual(""); beep(); cb.current(c); } }}
            placeholder={isAr ? "أو اكتب الباركود يدوياً…" : "…or type the barcode"}
            className="flex-1 rounded-lg px-2.5 py-1.5 text-sm" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontFamily: "ui-monospace,Menlo,Consolas,monospace" }} />
          <button disabled={!manual.trim()} onClick={() => { const c = manual.trim(); setManual(""); beep(); cb.current(c); }}
            className="rounded-lg px-3 py-1.5 text-xs font-bold" style={{ background: manual.trim() ? T.brass : "rgba(255,255,255,.12)", color: "#fff" }}>{isAr ? "بحث" : "Find"}</button>
        </div>
        <div className="px-3 py-2 text-xs" style={{ color: "#B9B4D6" }}>{hint}</div>
        <div className="flex gap-2 px-3 pb-3 flex-wrap">
          <button onClick={toggleTorch} className="rounded-lg px-2.5 py-1.5 text-xs font-bold inline-flex items-center gap-1" style={ctl(torch)}><Flashlight size={13} />{isAr ? "فلاش" : "Torch"}</button>
          {cams.length > 1 && <button onClick={switchCam} className="rounded-lg px-2.5 py-1.5 text-xs font-bold inline-flex items-center gap-1" style={ctl(false)}><SwitchCamera size={13} />{isAr ? "تبديل الكاميرا" : "Switch camera"}</button>}
          <button onClick={() => fileRef.current && fileRef.current.click()} className="rounded-lg px-2.5 py-1.5 text-xs font-bold inline-flex items-center gap-1" style={ctl(false)}><Camera size={13} />{isAr ? "التقاط صورة" : "Take photo"}</button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}

/* Top-of-list barcode bar: type/paste a code, or open the camera */
function BarcodeBar({ isAr, value, onChange, onSubmit, onScan, linked, total }) {
  return (
    <Card className="mb-3" pad={false} style={{ borderColor: T.vioLine }}>
      <div className="p-2 flex gap-2 items-center flex-wrap">
        <span className="rounded-lg p-1.5 shrink-0" style={{ background: T.vioSoft, color: T.vioText }}><Barcode size={16} /></span>
        <input value={value} onChange={e => onChange(e.target.value)} dir="ltr" inputMode="numeric" autoComplete="off"
          onKeyDown={e => { if (e.key === "Enter" && value.trim()) { e.preventDefault(); onSubmit(); } }}
          placeholder={isAr ? "اكتب أو الصق الباركود ثم Enter…" : "Type or paste a barcode, then Enter…"}
          className="flex-1 rounded-lg px-2.5 py-1.5 text-sm" style={{ ...inputSty, minWidth: 160, fontFamily: "ui-monospace,Menlo,Consolas,monospace" }} />
        <Btn kind="solid" size="sm" disabled={!value.trim()} onClick={onSubmit}><Search size={14} />{isAr ? "بحث" : "Find"}</Btn>
        <Btn kind="brass" size="sm" onClick={onScan}><ScanLine size={14} />{isAr ? "مسح بالكاميرا" : "Scan"}</Btn>
      </div>
      <div className="px-3 pb-2 text-xs" style={{ color: T.mute }}>
        {isAr ? `${linked} من ${total} صنفاً مرتبط بباركود — الكود المعروف ينزل بك للصنف مباشرة، وغير المعروف يفتح لك اختيار الصنف لربطه.`
              : `${linked} of ${total} items have a barcode — a known code jumps to the item; an unknown one lets you pick the item to link.`}
      </div>
    </Card>
  );
}

/* All linked barcodes across the system, with lookup */
function BarcodesPanel({ isAr, barcodes, setBarcodes, warehouses, open, canEdit }) {
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const entries = Object.entries(barcodes || {}).map(([code, e]) => ({ code, names: e.names || [], at: e.at, by: e.by }));
  const qq = q.trim().toLowerCase();
  const list = entries.filter(e => !qq || e.code.toLowerCase().includes(qq) || e.names.some(n => n.toLowerCase().includes(qq)));
  const whOf = (name) => warehouses.filter(w => (w.rows || []).some(r => typeof r !== "string" && nameKey(r[0]) === nameKey(name)));
  const shown = showAll || qq ? list : list.slice(0, 8);
  return (
    <Card className="mt-4" pad={false}>
      <div className="px-3 py-2.5 flex items-center justify-between gap-2 flex-wrap" style={{ borderBottom: "1px solid " + T.line }}>
        <b className="text-sm flex items-center gap-1.5" style={{ color: T.ink }}><Barcode size={15} style={{ color: T.vio }} />{isAr ? "الباركودات المرتبطة" : "Linked barcodes"}</b>
        <Chip tone="vio">{entries.length} {isAr ? "كود" : "codes"}</Chip>
      </div>
      <div className="p-3">
        <input value={q} onChange={e => setQ(e.target.value)} dir="ltr" autoComplete="off"
          placeholder={isAr ? "ابحث بالكود أو باسم الصنف…" : "Search by code or item name…"}
          className={inputCls + " mb-2"} style={{ ...inputSty, fontFamily: "ui-monospace,Menlo,Consolas,monospace" }} />
        {!entries.length && <Empty isAr={isAr} ar="لا باركود مرتبط بعد — افتح أي مستودع واضغط أيقونة الباركود بجانب الصنف." en="No barcodes yet — open a warehouse and tap the barcode icon next to an item." />}
        {entries.length > 0 && !list.length && (
          <div className="text-sm rounded-lg px-3 py-2" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}>
            {isAr ? "لا يوجد كود مطابق — باركود غير معروف. اربطه من داخل المستودع." : "No match — unknown barcode. Link it from inside a warehouse."}
          </div>
        )}
        {shown.map((e, i) => (
          <div key={e.code} className="py-2" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
            <div className="flex items-center gap-2">
              <span className="tabular text-sm font-bold" dir="ltr" style={{ color: T.ink, fontFamily: "ui-monospace,Menlo,Consolas,monospace" }}>{e.code}</span>
              <span className="text-xs" style={{ color: T.mute }}>{e.at || ""}{e.by ? " · " + e.by : ""}</span>
            </div>
            {e.names.map(n => (
              <div key={n} className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-sm" style={{ color: T.ink2 }}>{n}</span>
                {whOf(n).map(w => (
                  <button key={w.id} onClick={() => open(w.id)} className="rounded px-1.5 py-0.5 text-xs font-semibold"
                    style={{ background: T.brassSoft, color: T.brassText, border: "1px solid " + T.brassLine }}>{isAr ? w.ar : w.en}</button>
                ))}
                {!whOf(n).length && <span className="text-xs" style={{ color: "#B45309" }}>{isAr ? "الاسم غير موجود في أي مستودع الآن" : "name not found in any warehouse"}</span>}
                {canEdit && <button onClick={() => setBarcodes(bcUnbind(barcodes, e.code, n))} className="rounded p-0.5 ms-auto" title={isAr ? "فك الربط" : "Unlink"}
                  style={{ background: "#FEF2F2", color: "#DC2626" }}><Trash2 size={12} /></button>}
              </div>
            ))}
          </div>
        ))}
        {!showAll && !qq && list.length > 8 && (
          <button onClick={() => setShowAll(true)} className="text-xs font-semibold mt-2" style={{ color: T.vio }}>
            {isAr ? `عرض الكل (${list.length})` : `Show all (${list.length})`}</button>
        )}
      </div>
    </Card>
  );
}

/* USB / Bluetooth scanners type fast and end with Enter; capture that when no field is focused */
function useWedge(onCode, enabled) {
  const ref = useRef(onCode); ref.current = onCode;
  useEffect(() => {
    if (!enabled) return;
    let buf = "", last = 0;
    const h = (e) => {
      const t = e.target, tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      const now = Date.now(); if (now - last > 80) buf = ""; last = now;
      if (e.key === "Enter") { const c = buf; buf = ""; if (c.length >= 4) { e.preventDefault(); ref.current(c); } return; }
      if (e.key && e.key.length === 1) buf += e.key;
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [enabled]);
}

/* =============================== WAREHOUSES =============================== */
function whStats(w) {
  const items = w.rows.filter(r => typeof r !== "string");
  const c = { n: items.length, low: 0, soon: 0, exp: 0, out: 0 };
  items.forEach(r => { const st = calcStatus(r); if (st !== "ok") c[st]++; });
  return c;
}

function WarehouseList({ isAr, warehouses, orders, open, addWh, delWh, receipts, canEdit, barcodes = {}, setBarcodes }) {
  const [form, setForm] = useState(null);
  const [ask, setAsk] = useState(null);
  const D0 = todayISO(), W0 = weekKey(D0), M0 = monthKey(D0);
  const recStat = (id) => {
    const rs = receipts.filter(r => r.wh === id);
    return { d: rs.filter(r => r.d === D0).reduce((a, r) => a + r.q, 0),
             w: rs.filter(r => weekKey(r.d) === W0).reduce((a, r) => a + r.q, 0),
             m: rs.filter(r => monthKey(r.d) === M0).reduce((a, r) => a + r.q, 0) };
  };
  const issued = () => {
    const rs = receipts.filter(r => r.src === MAIN_WH);
    return { d: rs.filter(r => r.d === D0).reduce((a, r) => a + r.q, 0),
             w: rs.filter(r => weekKey(r.d) === W0).reduce((a, r) => a + r.q, 0),
             m: rs.filter(r => monthKey(r.d) === M0).reduce((a, r) => a + r.q, 0) };
  };
  const main = warehouses.find(w => w.id === MAIN_WH);
  const others = warehouses.filter(w => w.id !== MAIN_WH);
  return (
    <div>
      <SectionTitle isAr={isAr} icon={Boxes} ar="المستودعات والطلبيات" en="Warehouses & orders"
        sub={isAr ? "المستودع الجاف هو المستودع الرئيسي في المنتصف — بقية المناطق تستورد أصنافها منه بزر الصرف"
                  : "Dry Store is the main store at the centre — every other area draws its items from it via the issue button"}
        right={canEdit && <Btn kind="brass" size="sm" onClick={() => setForm({ ar: "", en: "" })}>
          <Plus size={14} />{isAr ? "إضافة منطقة" : "Add area"}</Btn>} />

      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gridAutoFlow: "dense" }}>
        {main && (() => {
          const s = whStats(main), ord = Object.keys(orders[main.id] || {}).length, out = issued();
          return (
            <button key={main.id} onClick={() => open(main.id)} className="text-start"
              style={{ gridColumn: "2", gridRow: (others.length >= 6 ? 2 : 1) + " / span 2" }}>
              <Card className="h-full" pad={false} style={{ borderColor: T.brassLine, background: "linear-gradient(180deg,#FFFBF2 0%,#FFFFFF 100%)", boxShadow: "0 0 0 3px " + T.brassSoft }}>
                <div className="p-3 flex flex-col items-center text-center h-full">
                  <span className="rounded-xl p-2.5 mb-2" style={{ background: T.brass, color: "#fff" }}><Warehouse size={22} /></span>
                  <Chip tone="brass">{isAr ? "المستودع الرئيسي" : "Main store"}</Chip>
                  <div className="font-bold text-sm leading-tight mt-1.5" style={{ color: T.ink }}>{isAr ? main.ar : main.en}</div>
                  <div className="text-xs" style={{ color: T.mute }}>{isAr ? main.en : main.ar}</div>
                  <div className="text-2xl font-bold tabular mt-2" style={{ color: T.brassText }}>{s.n}</div>
                  <div className="text-xs -mt-0.5" style={{ color: T.mute }}>{isAr ? "صنف" : "items"}</div>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {s.out > 0 && <Chip tone="bad">{s.out} {isAr ? "غير متوفر" : "out"}</Chip>}
                    {s.low > 0 && <Chip tone="warn">{s.low} {isAr ? "تحت الحد" : "low"}</Chip>}
                    {s.soon > 0 && <Chip tone="brass">{s.soon} {isAr ? "قرب الانتهاء" : "expiring"}</Chip>}
                    {s.exp > 0 && <Chip tone="bad">{s.exp} {isAr ? "منتهي" : "expired"}</Chip>}
                    {ord > 0 && <Chip tone="vio">{ord} {isAr ? "بالطلب" : "on order"}</Chip>}
                  </div>
                  <div className="mt-auto pt-3 w-full">
                    <div className="rounded-lg px-2 py-1.5 text-xs" style={{ background: "#fff", border: "1px solid " + T.brassLine }}>
                      <div className="font-semibold flex items-center justify-center gap-1" style={{ color: T.brassText }}>
                        <ArrowUpFromLine size={11} />{isAr ? "صادر للمناطق" : "Issued to areas"}</div>
                      <div className="flex justify-between mt-1 tabular" style={{ color: T.ink2 }}>
                        <span>{isAr ? "اليوم" : "today"} <b>{out.d}</b></span>
                        <span>{isAr ? "الأسبوع" : "week"} <b>{out.w}</b></span>
                        <span>{isAr ? "الشهر" : "month"} <b>{out.m}</b></span>
                      </div>
                    </div>
                    {main.d && <div className="text-xs mt-2" style={{ color: T.mute }}>{isAr ? "آخر جرد" : "Last count"}: <b style={{ color: T.ink2 }}>{main.d}</b></div>}
                  </div>
                </div>
              </Card>
            </button>
          );
        })()}
        {others.map(w => {
          const s = whStats(w), Icon = WH_ICONS[w.id] || Package;
          const ord = Object.keys(orders[w.id] || {}).length, r = recStat(w.id);
          const alerts = s.out + s.low + s.exp;
          return (
            <button key={w.id} onClick={() => open(w.id)} className="text-start">
              <Card className="h-full hover:shadow-md transition-shadow" pad={false}>
                <div className="p-2 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-1">
                    <span className="rounded-lg p-1.5 shrink-0" style={{ background: T.brassSoft, color: T.brassText }}><Icon size={14} /></span>
                    {canEdit && <span onClick={(e) => { e.stopPropagation(); setAsk(w); }} title={isAr ? "حذف" : "Delete"}
                      className="rounded p-0.5 cursor-pointer" style={{ background: "#FEF2F2", color: "#DC2626" }}><Trash2 size={10} /></span>}
                  </div>
                  <div className="font-bold leading-tight mt-1.5 clamp2" style={{ color: T.ink, fontSize: 12 }}>{isAr ? w.ar : w.en}</div>
                  <div className="flex flex-wrap items-center gap-1 mt-1.5 text-xs tabular">
                    <span style={{ color: T.mute }}>{s.n} {isAr ? "صنف" : "items"}</span>
                    {alerts > 0 && <span className="rounded px-1 font-bold" style={{ background: "#FEF2F2", color: "#DC2626" }} title={isAr ? "غير متوفر / تحت الحد / منتهي" : "out / low / expired"}>{alerts}</span>}
                    {s.soon > 0 && <span className="rounded px-1 font-bold" style={{ background: T.brassSoft, color: T.brassText }} title={isAr ? "قرب الانتهاء" : "expiring"}>{s.soon}</span>}
                    {ord > 0 && <span className="rounded px-1 font-bold" style={{ background: T.vioSoft, color: T.vioText }}>{ord}↑</span>}
                  </div>
                  {r.d > 0 && <div className="text-xs mt-auto pt-1.5 flex items-center gap-1" style={{ color: T.okText }}>
                    <ArrowDownToLine size={10} />{isAr ? "واصل اليوم" : "in today"} <b className="tabular">{r.d}</b></div>}
                </div>
              </Card>
            </button>
          );
        })}
      </div>
      <div className="text-xs mt-2 flex items-center gap-1.5" style={{ color: T.mute }}>
        <ArrowLeftRight size={12} />{isAr ? "الأرقام الملوّنة على المناطق: أحمر = غير متوفر/تحت الحد/منتهي، ذهبي = قرب الانتهاء، بنفسجي = بنود بالطلب." : "Coloured numbers on areas: red = out/low/expired, gold = expiring, violet = lines on order."}
      </div>
      <BarcodesPanel isAr={isAr} barcodes={barcodes} setBarcodes={setBarcodes} warehouses={warehouses} open={open} canEdit={canEdit} />

      {form && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 400 }}>
            <div className="flex items-center justify-between mb-3">
              <b style={{ color: T.ink }}>{isAr ? "مستودع جديد" : "New warehouse"}</b>
              <button onClick={() => setForm(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الاسم (عربي) *" : "Name (Arabic) *"}</label>
            <input autoFocus value={form.ar} onChange={e => setForm({ ...form, ar: e.target.value })} className={inputCls + " mb-2"} style={inputSty} />
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الاسم (إنجليزي)" : "Name (English)"}</label>
            <input value={form.en} onChange={e => setForm({ ...form, en: e.target.value })} className={inputCls} style={inputSty} />
            <div className="flex gap-2 mt-4">
              <Btn kind="solid" disabled={!form.ar.trim() && !form.en.trim()} onClick={() => {
                const ar = form.ar.trim() || form.en.trim(), en = form.en.trim() || form.ar.trim();
                addWh({ id: "w" + uid(), ar, en, d: todayISO(), by: null, rows: [] }); setForm(null);
              }}><CheckCircle2 size={14} />{isAr ? "إنشاء" : "Create"}</Btn>
              <Btn onClick={() => setForm(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}

      {ask && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 360 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف المستودع نهائياً؟" : "Delete this warehouse?"}</b>
            <div className="text-sm mb-3" style={{ color: T.ink2 }}>{isAr ? ask.ar : ask.en}</div>
            <div className="text-xs mb-4 rounded-lg p-2" style={{ background: "#FEF2F2", color: "#DC2626" }}>
              {isAr ? "سيُحذف " + (ask.rows || []).filter(r => Array.isArray(r)).length + " صنفاً داخله ولا يمكن التراجع."
                    : (ask.rows || []).filter(r => Array.isArray(r)).length + " items inside will be deleted. This cannot be undone."}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { delWh(ask.id); setAsk(null); }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: "#DC2626" }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setAsk(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ------ Add / edit item — status always computed, never typed ------------ */
function ItemForm({ isAr, init, sections, showLoc, editing, onSave, onClose }) {
  const [f, setF] = useState(init);
  const set = (k, v) => setF({ ...f, [k]: v });
  const qn = f.qty === "" || isNaN(+f.qty) ? null : +f.qty;
  const mn = f.min === "" || isNaN(+f.min) ? null : +f.min;
  const st = calcStatus([f.name, f.unit, qn, f.exp || null, mn, null]);
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 overflow-auto" style={{ background: "rgba(20,18,40,.5)" }}>
      <Card className="w-full" style={{ maxWidth: 460 }}>
        <div className="flex items-center justify-between mb-3">
          <b style={{ color: T.ink }}>{editing ? (isAr ? "تعديل صنف" : "Edit item") : (isAr ? "إضافة صنف جديد" : "Add new item")}</b>
          <button onClick={onClose}><X size={18} style={{ color: T.mute }} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2">
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "اسم الصنف *" : "Item name *"}</label>
            <input autoFocus value={f.name} onChange={e => set("name", e.target.value)} className={inputCls} style={inputSty} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الوحدة" : "Unit"}</label>
            <input value={f.unit} onChange={e => set("unit", e.target.value)} placeholder="Piece / Box / Bottle" className={inputCls} style={inputSty} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الكمية الحالية" : "Current qty"}</label>
            <input type="number" min="0" value={f.qty} onChange={e => set("qty", e.target.value)} className={inputCls + " tabular"} style={inputSty} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "تاريخ الصلاحية" : "Expiry date"}</label>
            <input type="date" value={f.exp} onChange={e => set("exp", e.target.value)} className={inputCls} style={inputSty} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الحد الأدنى للطلب" : "Reorder minimum"}</label>
            <input type="number" min="0" value={f.min} onChange={e => set("min", e.target.value)} className={inputCls + " tabular"} style={inputSty} />
          </div>
          {sections.length > 0 && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "القسم داخل المستودع" : "Section"}</label>
              <select value={f.sec} onChange={e => set("sec", e.target.value)} className={inputCls} style={inputSty}>
                {sections.map(x => <option key={x}>{x}</option>)}
              </select>
            </div>
          )}
          {showLoc && (
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الموقع" : "Location"}</label>
              <input value={f.loc} onChange={e => set("loc", e.target.value)} className={inputCls} style={inputSty} />
            </div>
          )}
          <div className="col-span-2">
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "ملاحظات" : "Notes"}</label>
            <input value={f.notes} onChange={e => set("notes", e.target.value)} className={inputCls} style={inputSty} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 rounded-lg px-3 py-2 flex-wrap" style={{ background: T.surf, border: "1px solid " + T.line }}>
          <span className="text-xs font-semibold" style={{ color: T.mute }}>{isAr ? "الحالة المحسوبة:" : "Computed status:"}</span>
          <Chip tone={ST_LBL[st][2]}>{isAr ? ST_LBL[st][0] : ST_LBL[st][1]}</Chip>
          <span className="text-xs" style={{ color: T.mute }}>{isAr ? "تتحدّث تلقائياً من الصلاحية والكمية والحد الأدنى" : "auto-derived from expiry, quantity and minimum"}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Btn kind="solid" disabled={!f.name.trim()} onClick={() => onSave({ ...f, qty: qn, min: mn })}>
            <CheckCircle2 size={14} />{isAr ? "حفظ الصنف" : "Save item"}
          </Btn>
          <Btn onClick={onClose}>{isAr ? "إلغاء" : "Cancel"}</Btn>
        </div>
      </Card>
    </div>
  );
}

function WarehouseDetail({ isAr, w, orders, setOrders, back, print, user, catalog, updateW, receipts, addReceipt, warehouses = [], transfer, barcodes = {}, setBarcodes, isAdmin }) {
  const [tab, setTab] = useState("stock");
  /* ---- barcode state ---- */
  const [scan, setScan] = useState(null);       // { mode: "find" } | { mode: "bind", idx, name }
  const [hit, setHit] = useState(null);         // { idx, cont, q } — row located by a scan, qty typed manually
  const [unknown, setUnknown] = useState(null); // { code, known, q }
  const [conflict, setConflict] = useState(null); // { code, idx, name, names }
  const [manage, setManage] = useState(null);   // { idx, name }
  const [pick, setPick] = useState(null);       // { code, idxs } — same product, several batches/expiries
  const [toast, setToast] = useState("");
  const [bcInput, setBcInput] = useState("");
  const canBind = !!isAdmin;
  const codeMap = useMemo(() => { const m = {}; Object.entries(barcodes || {}).forEach(([c, e]) => (e.names || []).forEach(n => { const k = nameKey(n); (m[k] = m[k] || []).push(c); })); return m; }, [barcodes]);
  const say = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const [send, setSend] = useState(null);
  const isMain = w.id === MAIN_WH;
  const areas = warehouses.filter(x => x.id !== MAIN_WH);
  const [q, setQ] = useState("");
  const [filt, setFilt] = useState("all");
  const [edit, setEdit] = useState(null);
  const [ask, setAsk] = useState(null);
  const Icon = WH_ICONS[w.id] || Package;
  const order = orders[w.id] || {};

  const items = w.rows.filter(r => typeof r !== "string");
  const sections = w.rows.filter(r => typeof r === "string").map(x => x.slice(2));
  const visible = useMemo(() => {
    const out = []; let sec = null;
    w.rows.forEach((r, idx) => {
      if (typeof r === "string") { sec = r.slice(2); return; }
      const hit = !q || String(r[0]).toLowerCase().includes(q.toLowerCase());
      const st = calcStatus(r);
      const pass = filt === "all" || (filt === "low" && (st === "low" || st === "out")) || (filt === "soon" && st === "soon") || (filt === "exp" && st === "exp");
      if (hit && pass) out.push({ r, sec, idx });
    });
    return out;
  }, [w, q, filt]);

  const setQty = (name, unit, v) => {
    const n = { ...orders }, o = { ...(n[w.id] || {}) };
    if (!v || v <= 0) delete o[name]; else o[name] = { u: unit, q: v };
    n[w.id] = o; setOrders(n);
  };
  const orderLines = Object.entries(order);
  const saveItem = (v, idx) => {
    const row = [v.name.trim(), (v.unit || "").trim() || null, v.qty, v.exp || null, v.min, null,
                 (v.notes || "").trim() || null, (v.loc || "").trim() || null];
    let rows;
    if (idx == null) rows = insertRow(w.rows, v.sec, row);
    else if (sections.length && v.sec && v.sec !== secOfIdx(w.rows, idx))
      rows = insertRow(w.rows.filter((_, i) => i !== idx), v.sec, row);
    else rows = w.rows.map((r, i) => (i === idx ? row : r));
    updateW(w.id, rows); setEdit(null);
  };
  const delItem = (idx) => { updateW(w.id, w.rows.filter((_, i) => i !== idx)); setAsk(null); };
  const bump = (idx, d) => updateW(w.id, w.rows.map((r, i) => {
    if (i !== idx) return r;
    const q0 = typeof r[2] === "number" ? r[2] : 0;
    return btSet(r, Math.max(0, q0 + d));
  }));
  const [recv, setRecv] = useState(null);
  const [lots, setLots] = useState(null);
  /* ---- barcode flows ---- */
  const goTo = (idx, cont) => {
    setScan(null); setUnknown(null); setQ(""); setFilt("all");
    const r = w.rows[idx]; setHit({ idx, cont: !!cont, q: r && typeof r[2] === "number" ? String(r[2]) : "" });
    setTimeout(() => {
      const el = document.getElementById("hf-row-" + idx); if (el && el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
      const inp = document.getElementById("hf-qty-" + idx); if (inp) { inp.focus(); inp.select && inp.select(); }
    }, 80);
  };
  const confirmHit = () => {
    if (!hit) return;
    const v = hit.q === "" ? null : +hit.q; if (hit.q !== "" && isNaN(v)) return;
    updateW(w.id, w.rows.map((r, i) => (i !== hit.idx ? r : btSet(r, v))));
    const cont = hit.cont; setHit(null);
    if (cont) setTimeout(() => setScan({ mode: "find" }), 150);
  };
  const bindTo = (code, idx, name) => {
    const e = bcEntry(barcodes, code);
    if (e && (e.names || []).some(n => nameKey(n) === nameKey(name))) { setScan(null); say(isAr ? "هذا الباركود مرتبط بهذا الصنف مسبقاً." : "This barcode is already linked to this item."); return; }
    if (e && (e.names || []).length) { setScan(null); setConflict({ code, idx, name, names: e.names }); return; }
    setBarcodes(bcBind(barcodes, code, name, "add", user.n)); setScan(null);
    say(isAr ? "تم ربط الباركود بالصنف." : "Barcode linked to the item.");
  };
  const handleCode = (raw) => {
    const code = String(raw || "").trim(); if (!code) return;
    if (scan && scan.mode === "bind") { bindTo(code, scan.idx, scan.name); return; }
    const ris = bcRowIdxs(barcodes, code, w.rows);
    if (ris.length === 1) { goTo(ris[0], true); return; }
    if (ris.length > 1) { setScan(null); setUnknown(null); setPick({ code, idxs: ris }); return; }
    const e = bcEntry(barcodes, code);
    setScan(null); setUnknown({ code, known: e && e.names && e.names[0] ? e.names[0] : null, q: "" });
  };
  useWedge(handleCode, !recv && !edit && !conflict && !manage && !send && !pick);
  const linkUnknownTo = (idx) => {
    if (!unknown) return;
    const name = String(w.rows[idx][0]);
    if (canBind) setBarcodes(bcBind(barcodes, unknown.code, name, "add", user.n));
    goTo(idx, true);
  };
  const D0 = todayISO(), W0 = weekKey(D0), M0 = monthKey(D0);
  const myRec = receipts.filter(r => r.wh === w.id);
  const recSum = {
    d: myRec.filter(r => r.d === D0).reduce((a, r) => a + r.q, 0),
    w: myRec.filter(r => weekKey(r.d) === W0).reduce((a, r) => a + r.q, 0),
    m: myRec.filter(r => monthKey(r.d) === M0).reduce((a, r) => a + r.q, 0),
    lines: myRec.filter(r => monthKey(r.d) === M0).length,
  };
  const issuedRec = receipts.filter(r => r.src === MAIN_WH);
  const issSum = {
    d: issuedRec.filter(r => r.d === D0).reduce((a, r) => a + r.q, 0),
    w: issuedRec.filter(r => weekKey(r.d) === W0).reduce((a, r) => a + r.q, 0),
    m: issuedRec.filter(r => monthKey(r.d) === M0).reduce((a, r) => a + r.q, 0),
    lines: issuedRec.filter(r => monthKey(r.d) === M0).length,
  };
  const whName = (id) => { const x = warehouses.find(y => y.id === id); return x ? (isAr ? x.ar : x.en) : id; };
  const issuedByArea = areas.map(a => ({ a, m: issuedRec.filter(r => r.wh === a.id && monthKey(r.d) === M0).reduce((x, r) => x + r.q, 0) })).filter(x => x.m > 0);
  const sendQty = send ? +send.q : 0;
  const sendOver = send && sendQty > (typeof send.stk === "number" ? send.stk : 0);
  const doSend = () => {
    if (!send || !sendQty || sendQty <= 0 || !send.to) return;
    transfer({ to: send.to, idx: send.idx, q: sendQty, note: send.note.trim() });
    setSend(null);
  };
  const printIssued = () => print({
    ar: "سجل الصرف من المستودع الرئيسي — " + w.ar, en: "Issue log from main store — " + w.en,
    meta: [[isAr ? "التاريخ" : "Date", todayISO()], [isAr ? "صادر اليوم" : "Issued today", issSum.d],
           [isAr ? "صادر هذا الشهر" : "Issued this month", issSum.m], [isAr ? "أعدّه" : "Prepared by", user.n]],
    cols: [isAr ? "التاريخ" : "Date", isAr ? "الوقت" : "Time", isAr ? "الصنف" : "Item", isAr ? "الكمية" : "Qty", isAr ? "إلى" : "To", isAr ? "بواسطة" : "By", isAr ? "ملاحظة" : "Note"],
    rows: issuedRec.slice(0, 200).map(r => [r.d, r.at || "", r.item, r.q, whName(r.wh), r.by, r.note || ""]),
    by: user.n,
  });
  const doReceive = () => {
    const q = +recv.q; if (!q) return;
    addReceipt({ id: uid(), d: recv.d, wh: w.id, item: recv.name, q, by: user.n, note: recv.note.trim(), exp: recv.exp || null });
    updateW(w.id, w.rows.map((r, i) => i !== recv.idx ? r : btAdd(r, q, recv.exp || null, recv.d, user.n)));
    setRecv(null);
  };
  /* remove one batch by hand (wrong entry, damaged lot) */
  const dropBatch = (idx, bi) => updateW(w.id, w.rows.map((r, i) => {
    if (i !== idx) return r; const bs = btSort(btSeed(r)).filter((_, j) => j !== bi); return btWrite(r, bs);
  }));
  const initFor = (idx, presec) => idx == null
    ? { name: "", unit: "", qty: "", exp: "", min: "", notes: "", loc: "", sec: presec || sections[0] || "" }
    : (r => ({ name: r[0] || "", unit: r[1] || "", qty: r[2] == null ? "" : String(r[2]),
               exp: r[3] || "", min: r[4] == null ? "" : String(r[4]), notes: r[6] || "",
               loc: r[7] || "", sec: secOfIdx(w.rows, idx) || "" }))(w.rows[idx]);
  const catNames = new Set(items.map(r => String(r[0])));
  const cat = [...items.map(r => [r[0], r[1], r[2]]), ...((catalog || []).filter(c => !catNames.has(String(c[0]))))];
  const catFiltered = cat.filter(c => !q || String(c[0]).toLowerCase().includes(q.toLowerCase()));

  const suggest = () => {
    const n = { ...orders }, o = { ...(n[w.id] || {}) };
    items.forEach(r => { const st = calcStatus(r); if (st === "low" || st === "out")
      o[r[0]] = { u: r[1], q: Math.max(1, (r[4] || 2) - (typeof r[2] === "number" ? r[2] : 0)) }; });
    n[w.id] = o; setOrders(n);
  };

  /* every quantity added to this store today — the added amount, never the running total */
  const printRecvToday = () => {
    const day = myRec.filter(r => r.d === D0);
    const g = {};
    day.forEach(r => {
      const k = String(r.item) + "|" + (r.exp || "");
      if (!g[k]) g[k] = { item: r.item, exp: r.exp || "", q: 0, n: 0, by: new Set(), src: new Set(), last: "" };
      g[k].q += +r.q || 0; g[k].n++; if (r.by) g[k].by.add(r.by);
      g[k].src.add(r.src ? whName(r.src) : (isAr ? "مورد خارجي" : "Supplier"));
      if ((r.at || "") > g[k].last) g[k].last = r.at || "";
    });
    const rows = Object.values(g).sort((a, b) => (a.item > b.item ? 1 : -1))
      .map((x, i) => [String(i + 1), x.item, x.q, x.exp || "—", [...x.src].join(" / "), [...x.by].join(" / "), x.last || "", String(x.n)]);
    print({
      ar: "المستلم اليوم — " + w.ar, en: "Received today — " + w.en,
      meta: [[isAr ? "التاريخ" : "Date", D0], [isAr ? "عدد الأصناف" : "Items", String(rows.length)],
             [isAr ? "إجمالي الكميات المستلمة" : "Total quantity received", String(day.reduce((a, r) => a + (+r.q || 0), 0))],
             [isAr ? "عدد الحركات" : "Movements", String(day.length)], [isAr ? "أعدّه" : "Prepared by", user.n + " · " + user.prn]],
      cols: ["#", isAr ? "الصنف" : "Item", isAr ? "الكمية المستلمة" : "Qty received", isAr ? "انتهاء الدفعة" : "Batch expiry",
             isAr ? "المصدر" : "Source", isAr ? "بواسطة" : "By", isAr ? "آخر حركة" : "Last entry", isAr ? "حركات" : "Entries"],
      rows,
      note: isAr ? "الكميات هنا هي المُضاف اليوم فقط، لا الرصيد الحالي. الصنف الواحد يتكرر بسطر لكل تاريخ انتهاء استُلم به."
                 : "These are the quantities added today only, not the stock on hand. An item appears once per expiry date received.",
      by: user.n,
    });
  };
  const printStock = () => print({
    ar: "تقرير الجرد — " + w.ar, en: "Stock Count Report — " + w.en,
    meta: [[isAr ? "التاريخ" : "Date", todayISO()], [isAr ? "عدد الأصناف" : "Items", items.length],
           [isAr ? "آخر جرد ورقي" : "Last sheet count", w.d || "—"], [isAr ? "الجارد" : "Counted by", user.n]],
    cols: [isAr ? "الصنف" : "Item", isAr ? "الوحدة" : "Unit", isAr ? "الكمية" : "Qty", isAr ? "الصلاحية" : "Expiry",
           isAr ? "الحد الأدنى" : "Min", isAr ? "الحالة" : "Status"],
    rows: visible.flatMap(({ r }) => {
      const head = [r[0], r[1] || "", r[2] == null ? "" : r[2], r[3] || "", r[4] == null ? "" : r[4], ST_LBL[calcStatus(r)][isAr ? 0 : 1]];
      const bs = btOf(r);
      if (bs.length < 2) return [head];
      return [head, ...btSort(bs).map(b => ["↳ " + (isAr ? "دفعة" : "batch"), "", b.q, b.exp || (isAr ? "بلا تاريخ" : "no date"), "",
        b.exp ? (daysTo(b.exp) < 0 ? (isAr ? "منتهية" : "Expired") : daysTo(b.exp) <= 30 ? (isAr ? "قريبة" : "Soon") : "") : ""])];
    }),
    by: user.n,
  });
  const printOrder = () => print({
    ar: "أمر طلب مواد — " + w.ar, en: "Materials Order — " + w.en,
    meta: [[isAr ? "التاريخ" : "Date", todayISO()], [isAr ? "القسم الطالب" : "Requesting section", isAr ? w.ar : w.en],
           [isAr ? "عدد البنود" : "Lines", orderLines.length], [isAr ? "الطالب" : "Requested by", user.n + " · " + user.prn]],
    cols: ["#", isAr ? "الصنف" : "Item", isAr ? "الوحدة" : "Unit", isAr ? "الكمية المطلوبة" : "Order Qty"],
    rows: orderLines.map(([n, v], i) => [i + 1, n, v.u || "", v.q]),
    note: isAr ? "يُسلَّم هذا الأمر للمستودع الرئيسي. لا تُصرف أي كمية بدون توقيع الاستلام أدناه."
               : "Submit to the main store. No quantity is issued without the receiving signature below.",
    by: user.n,
  });
  const copyText = () => {
    const txt = `${isAr ? "طلبية" : "Order"} — ${isAr ? w.ar : w.en} — ${todayISO()}\n` +
      orderLines.map(([n, v], i) => `${i + 1}. ${n} — ${v.q} ${v.u || ""}`).join("\n");
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
  };

  return (
    <div>
      <button onClick={back} className="inline-flex items-center gap-1.5 text-sm font-semibold mb-3" style={{ color: T.vio }}>
        {isAr ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}{isAr ? "كل المستودعات" : "All warehouses"}
      </button>
      <SectionTitle isAr={isAr} icon={Icon} ar={w.ar} en={w.en}
        sub={`${items.length} ${isAr ? "صنف" : "items"}${w.d ? " · " + (isAr ? "آخر جرد " : "last count ") + w.d : ""}`}
        right={<div className="flex gap-2 flex-wrap">
          {tab === "stock" && <Btn kind="brass" size="sm" onClick={() => setEdit({ idx: null })}><Plus size={14} />{isAr ? "إضافة صنف" : "Add item"}</Btn>}
          <Btn size="sm" onClick={tab === "stock" ? printStock : tab === "issued" ? printIssued : printOrder}><Printer size={14} />{isAr ? "طباعة" : "Print"}</Btn>
          <Btn size="sm" kind="brass" onClick={printRecvToday} title={isAr ? "كل ما أُضيف اليوم" : "Everything added today"}>
            <ArrowDownToLine size={14} />{isAr ? "المستلم اليوم" : "Received today"}</Btn>
          {tab === "order" && orderLines.length > 0 && <Btn kind="brass" size="sm" onClick={copyText}><Share2 size={14} />{isAr ? "إرسال" : "Share"}</Btn>}
        </div>} />

      <Card className="mb-3" pad={false}>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {[[isAr ? "مستلم اليوم" : "Received today", recSum.d, T.ok],
            [isAr ? "مستلم هذا الأسبوع" : "Received this week", recSum.w, T.vio],
            [isAr ? "مستلم هذا الشهر" : "Received this month", recSum.m, T.brass],
            [isAr ? "عمليات استلام (الشهر)" : "Receipt entries (month)", recSum.lines, T.mute]].map(([l, v, c], i) => (
            <div key={i} className="px-3 py-2.5" style={{ borderInlineStart: i ? "1px solid " + T.line : "none" }}>
              <div className="text-xs" style={{ color: T.mute }}>{l}</div>
              <div className="text-lg font-bold tabular" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {isMain && (
        <Card className="mb-3" pad={false} style={{ borderColor: T.brassLine }}>
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[[isAr ? "صادر اليوم" : "Issued today", issSum.d],
              [isAr ? "صادر هذا الأسبوع" : "Issued this week", issSum.w],
              [isAr ? "صادر هذا الشهر" : "Issued this month", issSum.m],
              [isAr ? "عمليات صرف (الشهر)" : "Issue entries (month)", issSum.lines]].map(([l, v], i) => (
              <div key={i} className="px-3 py-2.5" style={{ borderInlineStart: i ? "1px solid " + T.brassLine : "none", background: T.brassSoft }}>
                <div className="text-xs flex items-center gap-1" style={{ color: T.brassText }}><ArrowUpFromLine size={11} />{l}</div>
                <div className="text-lg font-bold tabular" style={{ color: T.brassText }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-2 mb-3 flex-wrap items-center">
        {[["stock", "الجرد", "Stock"], ["order", "الطلبية", "Order"], ...(isMain ? [["issued", "الصادر", "Issued"]] : [])].map(([k, a, e]) => (
          <button key={k} onClick={() => setTab(k)} className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={tab === k ? { background: T.ink, color: "#fff" } : { background: "#fff", color: T.ink2, border: "1px solid " + T.line }}>
            {isAr ? a : e}{k === "order" && orderLines.length ? ` (${orderLines.length})` : ""}
          </button>
        ))}
        <div className="relative flex-1" style={{ minWidth: 180 }}>
          <Search size={14} className="absolute top-2.5" style={{ color: T.mute, insetInlineStart: 10 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={isAr ? "بحث عن صنف…" : "Search item…"}
            className={inputCls} style={{ ...inputSty, paddingInlineStart: 30 }} />
        </div>
      </div>

      {tab === "stock" ? (
        <>
          {items.length > 0 && (
            <BarcodeBar isAr={isAr} value={bcInput} onChange={setBcInput}
              onSubmit={() => { const c = bcInput.trim(); setBcInput(""); audioUnlock(); handleCode(c); }}
              onScan={() => { audioUnlock(); setHit(null); setScan({ mode: "find" }); }}
              linked={items.filter(r => (codeMap[nameKey(r[0])] || []).length).length} total={items.length} />
          )}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {[["all", "الكل", "All"], ["low", "تحت الحد", "Low / out"], ["soon", "قرب الانتهاء", "Expiring ≤30d"], ["exp", "منتهي", "Expired"]].map(([k, a, e]) => (
              <button key={k} onClick={() => setFilt(k)} className="rounded-full px-3 py-1 text-xs font-semibold"
                style={filt === k ? { background: T.vio, color: "#fff" } : { background: "#fff", color: T.ink2, border: "1px solid " + T.line }}>
                {isAr ? a : e}
              </button>
            ))}
          </div>
          <Card pad={false}>
            <div className="overflow-x-auto hf-scroll">
              <table className="w-full text-sm" style={{ minWidth: 640 }}>
                <thead style={{ background: T.surf }}>
                  <tr>{[isAr ? "الصنف" : "Item", isAr ? "الوحدة" : "Unit", isAr ? "الكمية" : "Qty", isAr ? "الحد الأدنى" : "Min",
                        isAr ? "الصلاحية" : "Expiry", isAr ? "الحالة" : "Status", ""].map((h, i) => (
                    <th key={i} className="text-start px-3 py-2 text-xs font-bold" style={{ color: T.mute }}>{h}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map(({ r, sec, idx }, i) => {
                    const prevSec = i > 0 ? visible[i - 1].sec : null;
                    const st = calcStatus(r), e = expState(r[3]);
                    return (
                      <Fragment key={idx}>
                        {sec && sec !== prevSec && (
                          <tr><td colSpan={7} className="px-3 py-1 text-xs font-bold"
                            style={{ background: T.brassSoft, color: T.brassText, borderTop: "1px solid " + T.brassLine }}>
                            <div className="flex items-center justify-between gap-2">
                              <span>{sec}</span>
                              <button onClick={() => setEdit({ idx: null, sec })}
                                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-bold"
                                style={{ background: "#fff", border: "1px solid " + T.brassLine, color: T.brassText }}>
                                <Plus size={11} />{isAr ? "إضافة هنا" : "Add here"}</button>
                            </div>
                          </td></tr>
                        )}
                        <tr id={"hf-row-" + idx} style={{ borderTop: "1px solid " + T.line, background: hit && hit.idx === idx ? "#FEF9C3" : undefined, transition: "background .4s" }}>
                          <td className="px-3 py-2 font-semibold" style={{ color: T.ink, maxWidth: 280 }}>
                            {r[0]}{r[7] && <span className="text-xs font-normal" style={{ color: T.mute }}> · {r[7]}</span>}
                            {(() => { const cs = codeMap[nameKey(r[0])] || []; return cs.length ? (
                              <button onClick={() => setManage({ idx, name: String(r[0]) })} title={cs.join(", ")} dir="ltr"
                                className="ms-1.5 inline-flex items-center gap-1 rounded px-1 text-xs font-normal align-middle"
                                style={{ background: T.vioSoft, color: T.vioText, border: "1px solid " + T.vioLine, fontFamily: "ui-monospace,Menlo,Consolas,monospace" }}>
                                <Barcode size={10} />{bcTail(cs[0])}{cs.length > 1 ? " +" + (cs.length - 1) : ""}</button>) : null; })()}
                            {r[6] && <div className="text-xs font-normal clamp2" style={{ color: T.mute }}>{r[6]}</div>}
                          </td>
                          <td className="px-3 py-2" style={{ color: T.ink2 }}>{r[1] || "—"}</td>
                          <td className="px-2 py-2">
                            <div className="inline-flex items-center gap-1">
                              {hit && hit.idx === idx ? (
                                <>
                                  <input id={"hf-qty-" + idx} value={hit.q} inputMode="decimal" autoComplete="off"
                                    onChange={e => setHit({ ...hit, q: e.target.value })}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmHit(); } if (e.key === "Escape") setHit(null); }}
                                    className="text-center rounded-md py-1 text-sm font-bold tabular" style={{ ...inputSty, width: 64, borderColor: T.brass }} />
                                  <button onClick={() => { setRecv({ idx, name: String(r[0]), q: hit.q, d: todayISO(), exp: "", note: "" }); setHit(null); }}
                                    title={isAr ? "تسجيل استلام بتاريخ انتهاء" : "Log a receipt with its expiry"} className="rounded p-1"
                                    style={{ border: "1px solid " + T.okLine, background: T.okSoft, color: T.okText }}><ArrowDownToLine size={12} /></button>
                                  <button onClick={confirmHit} title={isAr ? "تثبيت الجرد" : "Set counted quantity"} className="rounded p-1" style={{ background: T.ok, color: "#fff" }}><CheckCircle2 size={13} /></button>
                                  <button onClick={() => setHit(null)} title={isAr ? "إلغاء" : "Cancel"} className="rounded p-1" style={{ border: "1px solid " + T.line, color: T.mute }}><X size={13} /></button>
                                </>
                              ) : (
                                <>
                              <button onClick={() => bump(idx, -1)} className="rounded p-1" style={{ border: "1px solid " + T.line, color: T.ink2 }}><Minus size={11} /></button>
                              <b className="tabular text-center" style={{ color: T.ink, minWidth: 28, display: "inline-block" }}>{r[2] == null ? "—" : r[2]}</b>
                              <button onClick={() => bump(idx, 1)} className="rounded p-1" style={{ border: "1px solid " + T.line, color: T.ink2 }}><Plus size={11} /></button>
                                </>
                              )}
                              <button onClick={() => setRecv({ idx, name: String(r[0]), q: "", d: todayISO(), exp: "", note: "" })}
                                title={isAr ? "تسجيل استلام" : "Log a receipt"} className="rounded p-1"
                                style={{ border: "1px solid " + T.okLine, background: T.okSoft, color: T.okText }}><ArrowDownToLine size={11} /></button>
                              {isMain && areas.length > 0 && (
                                <button onClick={() => setSend({ idx, name: String(r[0]), unit: r[1] || "", stk: r[2], q: "", to: areas[0].id, note: "" })}
                                  title={isAr ? "صرف إلى منطقة" : "Issue to an area"} className="rounded px-1.5 py-1 inline-flex items-center gap-1 text-xs font-bold"
                                  style={{ border: "1px solid " + T.brassLine, background: T.brassSoft, color: T.brassText }}>
                                  <ArrowUpFromLine size={11} />{isAr ? "صرف" : "Issue"}</button>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2 tabular" style={{ color: T.mute }}>{r[4] == null ? "—" : r[4]}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1 flex-wrap">
                              {r[3] ? <Chip tone={e === "exp" ? "bad" : e === "soon" ? "warn" : "mut"}>{r[3]}</Chip> : <span style={{ color: T.mute }}>—</span>}
                              {btOf(r).length > 1 && (
                                <button onClick={() => setLots(lots === idx ? null : idx)} className="rounded-lg px-1.5 py-0.5 text-xs font-bold"
                                  style={{ background: T.brassSoft, color: T.brassText, border: "1px solid " + T.brassLine }}
                                  title={isAr ? "دفعات بتواريخ مختلفة" : "Batches with different expiry dates"}>
                                  {btOf(r).length} {isAr ? "دفعات" : "lots"}
                                </button>
                              )}
                            </div>
                            {lots === idx && btOf(r).length > 0 && (
                              <div className="mt-1.5 flex flex-col gap-1">
                                {btSort(btOf(r)).map((b, bi) => (
                                  <div key={bi} className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs"
                                    style={{ background: T.surf, border: "1px solid " + T.line }}>
                                    <b className="tabular" style={{ color: T.ink }}>{b.q}</b>
                                    <span style={{ color: b.exp && daysTo(b.exp) < 0 ? T.bad : b.exp && daysTo(b.exp) <= 30 ? T.warn : T.mute }}>
                                      {b.exp || (isAr ? "بلا تاريخ" : "no date")}
                                    </span>
                                    {b.d && <span className="tabular" style={{ color: T.mute }}>· {b.d}</span>}
                                    <div className="flex-1" />
                                    {canEdit && <button onClick={() => dropBatch(idx, bi)} title={isAr ? "حذف الدفعة" : "Remove batch"}
                                      style={{ color: T.mute }}><X size={11} /></button>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <Chip tone={ST_LBL[st][2]}>{isAr ? ST_LBL[st][0] : ST_LBL[st][1]}</Chip>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              {canBind && <button onClick={() => { audioUnlock(); setHit(null); setScan({ mode: "bind", idx, name: String(r[0]) }); }} className="rounded p-1.5"
                                style={{ background: "#F1F5F9", color: T.ink2, border: "1px solid " + T.line }} title={isAr ? "ربط باركود" : "Link barcode"}><ScanBarcode size={13} /></button>}
                              <button onClick={() => setEdit({ idx })} className="rounded p-1.5" style={{ background: T.vioSoft, color: T.vioText }} title={isAr ? "تعديل" : "Edit"}><Pencil size={13} /></button>
                              <button onClick={() => setAsk(idx)} className="rounded p-1.5" style={{ background: "#FEF2F2", color: "#DC2626" }} title={isAr ? "حذف" : "Delete"}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              {!visible.length && <Empty isAr={isAr} ar="لا توجد أصناف مطابقة." en="No matching items." />}
            </div>
          </Card>
        </>
      ) : tab === "issued" ? (
        <div className="grid lg:grid-cols-5 gap-3">
          <div className="lg:col-span-3">
            <Card pad={false}>
              <div className="px-3 py-2.5 flex items-center justify-between" style={{ borderBottom: "1px solid " + T.line }}>
                <b className="text-sm" style={{ color: T.ink }}>{isAr ? "سجل الصرف" : "Issue log"}</b>
                <Chip tone="brass">{issuedRec.length} {isAr ? "عملية" : "entries"}</Chip>
              </div>
              <div className="max-h-96 overflow-y-auto hf-scroll">
                {issuedRec.filter(r => !q || String(r.item).toLowerCase().includes(q.toLowerCase())).slice(0, 300).map((r, i) => (
                  <div key={r.id || i} className="px-3 py-2 flex items-center gap-2 text-sm" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate" style={{ color: T.ink }}>{r.item}</div>
                      <div className="text-xs" style={{ color: T.mute }}>{r.d}{r.at ? " · " + r.at : ""} · {r.by}{r.note ? " · " + r.note : ""}</div>
                    </div>
                    <Chip tone="vio">{whName(r.wh)}</Chip>
                    <b className="tabular" style={{ color: T.brassText, minWidth: 28, textAlign: "end" }}>{r.q}</b>
                  </div>
                ))}
                {!issuedRec.length && <Empty isAr={isAr} ar="لم يُصرف أي صنف بعد — استخدم زر «صرف» بجانب أي صنف في الجرد." en="Nothing issued yet — use the Issue button next to any stock item." />}
              </div>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card pad={false} style={{ borderColor: T.brassLine }}>
              <div className="px-3 py-2.5" style={{ background: T.brassSoft, borderBottom: "1px solid " + T.brassLine }}>
                <b className="text-sm" style={{ color: T.brassText }}>{isAr ? "الصادر لكل منطقة — هذا الشهر" : "Issued per area — this month"}</b>
              </div>
              <div className="p-3">
                {!issuedByArea.length && <Empty isAr={isAr} ar="لا صرف مسجّل هذا الشهر." en="No issues recorded this month." />}
                {issuedByArea.sort((a, b) => b.m - a.m).map(({ a, m }, i) => {
                  const Icon = WH_ICONS[a.id] || Package;
                  return (
                    <div key={a.id} className="flex items-center gap-2 py-1.5 text-sm" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
                      <span className="rounded p-1" style={{ background: T.brassSoft, color: T.brassText }}><Icon size={13} /></span>
                      <span className="flex-1 truncate" style={{ color: T.ink }}>{isAr ? a.ar : a.en}</span>
                      <b className="tabular" style={{ color: T.ink }}>{m}</b>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-3">
          <div className="lg:col-span-3">
            <Card pad={false}>
              <div className="px-3 py-2.5 flex items-center justify-between gap-2" style={{ borderBottom: "1px solid " + T.line }}>
                <b className="text-sm" style={{ color: T.ink }}>{isAr ? "اختر الكميات" : "Pick quantities"}</b>
                <Btn size="sm" kind="soft" onClick={suggest}><Sparkles size={13} />{isAr ? "اقتراح تلقائي" : "Auto-suggest"}</Btn>
              </div>
              <div className="max-h-96 overflow-y-auto hf-scroll">
                {catFiltered.map(([n, u, stk], i) => {
                  const cur = order[n] ? order[n].q : 0;
                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate" style={{ color: T.ink }}>{n}</div>
                        <div className="text-xs" style={{ color: T.mute }}>{u || "—"}{stk != null ? ` · ${isAr ? "بالمخزون" : "in stock"} ${stk}` : ""}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setQty(n, u, cur - 1)} className="rounded-md p-1.5" style={{ border: "1px solid " + T.line, color: T.ink2 }}><Minus size={13} /></button>
                        <input value={cur || ""} onChange={e => setQty(n, u, parseInt(e.target.value) || 0)} placeholder="0"
                          className="text-center rounded-md py-1 text-sm font-bold tabular" style={{ ...inputSty, width: 48 }} />
                        <button onClick={() => setQty(n, u, cur + 1)} className="rounded-md p-1.5" style={{ background: T.vioSoft, border: "1px solid " + T.vioLine, color: T.vioText }}><Plus size={13} /></button>
                      </div>
                    </div>
                  );
                })}
                {!catFiltered.length && <Empty isAr={isAr} ar="لا توجد أصناف مطابقة." en="No matching items." />}
              </div>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card pad={false} style={{ borderColor: T.brassLine }}>
              <div className="px-3 py-2.5 flex items-center justify-between" style={{ background: T.brassSoft, borderBottom: "1px solid " + T.brassLine }}>
                <b className="text-sm" style={{ color: T.brassText }}>{isAr ? "أمر الطلب" : "Order sheet"}</b>
                <Chip tone="brass">{orderLines.length} {isAr ? "بند" : "lines"}</Chip>
              </div>
              <div className="p-3">
                {!orderLines.length && <Empty isAr={isAr} ar="أدخل كمية لأي صنف لتظهر هنا." en="Enter a quantity to build the order." />}
                {orderLines.map(([n, v], i) => (
                  <div key={n} className="flex items-center gap-2 py-1.5 text-sm" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
                    <span className="tabular text-xs font-bold" style={{ color: T.mute, minWidth: 18 }}>{i + 1}</span>
                    <span className="flex-1 truncate" style={{ color: T.ink }}>{n}</span>
                    <b className="tabular" style={{ color: T.ink }}>{v.q}</b>
                    <span className="text-xs" style={{ color: T.mute }}>{v.u}</span>
                    <button onClick={() => setQty(n, v.u, 0)}><X size={13} style={{ color: T.mute }} /></button>
                  </div>
                ))}
                {orderLines.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Btn kind="brass" size="sm" onClick={printOrder}><Printer size={14} />{isAr ? "طباعة / PDF" : "Print / PDF"}</Btn>
                    <Btn size="sm" onClick={copyText}><Copy size={14} />{isAr ? "نسخ نصاً" : "Copy text"}</Btn>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
      {edit && (
        <ItemForm isAr={isAr} showLoc={w.id === "pa"} sections={sections}
          init={edit.init ? { ...initFor(null, edit.sec), ...edit.init } : initFor(edit.idx, edit.sec)} editing={edit.idx != null}
          onClose={() => setEdit(null)} onSave={(v) => saveItem(v, edit.idx)} />
      )}
      {scan && (
        <ScanSheet isAr={isAr} onCode={handleCode} onClose={() => setScan(null)}
          title={scan.mode === "bind" ? (isAr ? "ربط باركود: " : "Link barcode: ") + scan.name : (isAr ? "مسح للتعرف على الصنف" : "Scan to find an item")}
          hint={scan.mode === "bind"
            ? (isAr ? "وجّه الكاميرا للباركود على العبوة. يُحفظ الكود على الصنف لكل المستودعات." : "Point at the barcode on the pack. The code is saved on the item for all warehouses.")
            : (isAr ? "امسح أي صنف — ينزل لك السطر مباشرة وتكتب الكمية يدوياً، ثم يعود المسح للصنف التالي." : "Scan any item — the row is located, you type the quantity, then scanning resumes for the next item.")} />
      )}
      {toast && (
        <div className="fixed z-50 left-1/2 -translate-x-1/2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ bottom: 18, background: T.ink, boxShadow: "0 6px 20px rgba(0,0,0,.25)" }}>{toast}</div>
      )}
      {pick && (() => { const first = w.rows[pick.idxs[0]] || []; return (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 440 }}>
            <div className="flex items-center justify-between mb-1">
              <b style={{ color: T.ink }}>{isAr ? "نفس المنتج بأكثر من تاريخ — أي دفعة تجرد؟" : "Same product, several batches — which one?"}</b>
              <button onClick={() => setPick(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <div className="text-sm mb-2" style={{ color: T.ink2 }}>{first[0]}</div>
            <div className="rounded-lg" style={{ border: "1px solid " + T.line }}>
              {pick.idxs.map((idx, i) => { const r = w.rows[idx]; const e = expState(r[3]); return (
                <button key={idx} onClick={() => { setPick(null); goTo(idx, true); }} className="w-full text-start px-3 py-2.5 text-sm flex items-center gap-2" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
                  <span className="rounded px-1.5 py-0.5 text-xs font-bold tabular" style={{ background: T.surf, color: T.mute }}>{i + 1}</span>
                  <span className="flex-1">
                    {r[3] ? <Chip tone={e === "exp" ? "bad" : e === "soon" ? "warn" : "mut"}>{isAr ? "صلاحية " : "exp "}{r[3]}</Chip> : <span className="text-xs" style={{ color: T.mute }}>{isAr ? "بلا تاريخ" : "no date"}</span>}
                    {r[6] && <span className="text-xs ms-1" style={{ color: T.mute }}>· {r[6]}</span>}
                  </span>
                  <b className="tabular" style={{ color: T.ink }}>{r[2] == null ? "—" : r[2]}</b><span className="text-xs" style={{ color: T.mute }}>{r[1] || ""}</span>
                </button>
              ); })}
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Btn kind="brass" size="sm" onClick={() => { setPick(null); setEdit({ idx: null, sec: secOfIdx(w.rows, pick.idxs[pick.idxs.length - 1]) || "", init: { name: String(first[0] || ""), unit: first[1] || "", min: first[4] == null ? "" : String(first[4]) } }); }}>
                <Plus size={14} />{isAr ? "دفعة جديدة بتاريخ آخر" : "New batch with another date"}</Btn>
              <Btn size="sm" onClick={() => setPick(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
            <div className="text-xs mt-2" style={{ color: T.mute }}>{isAr ? "الباركود واحد لكل الدفعات — التاريخ يُختار هنا يدوياً." : "The barcode is the same for every batch — the date is chosen here manually."}</div>
          </Card>
        </div>
      ); })()}
      {conflict && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 400 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "هذا الباركود مرتبط بصنف آخر" : "This barcode is linked to another item"}</b>
            <div className="text-xs mb-2 tabular" dir="ltr" style={{ color: T.mute, fontFamily: "ui-monospace,Menlo,Consolas,monospace", textAlign: isAr ? "right" : "left" }}>{conflict.code}</div>
            <div className="text-sm mb-1" style={{ color: T.ink2 }}>{isAr ? "مرتبط بـ: " : "Linked to: "}<b>{conflict.names.join(" · ")}</b></div>
            <div className="text-sm mb-3" style={{ color: T.ink2 }}>{isAr ? "الصنف الحالي: " : "Current item: "}<b>{conflict.name}</b></div>
            <div className="flex flex-col gap-2">
              <Btn kind="solid" onClick={() => { setBarcodes(bcBind(barcodes, conflict.code, conflict.name, "move", user.n)); setConflict(null); say(isAr ? "نُقل الباركود لهذا الصنف." : "Barcode moved to this item."); }}>
                <ArrowLeftRight size={14} />{isAr ? "نقله لهذا الصنف (يُفك عن الآخر)" : "Move it to this item (unlink the other)"}</Btn>
              <Btn kind="brass" onClick={() => { setBarcodes(bcBind(barcodes, conflict.code, conflict.name, "add", user.n)); setConflict(null); say(isAr ? "رُبط الباركود بالاسمين — نفس المنتج." : "Linked to both names — same product."); }}>
                <Plus size={14} />{isAr ? "ربطه أيضاً — نفس المنتج باسم مختلف" : "Also link — same product, different name"}</Btn>
              <Btn onClick={() => setConflict(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
      {unknown && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 440 }}>
            <div className="flex items-center justify-between mb-1">
              <b style={{ color: T.ink }}>{unknown.known ? (isAr ? "الصنف غير موجود في هذا المستودع" : "Item not in this warehouse") : (isAr ? "باركود غير معروف" : "Unknown barcode")}</b>
              <button onClick={() => setUnknown(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <div className="text-xs mb-2" dir="ltr" style={{ color: T.mute, fontFamily: "ui-monospace,Menlo,Consolas,monospace", textAlign: isAr ? "right" : "left" }}>{unknown.code}</div>
            {unknown.known && <div className="text-xs mb-2 rounded-lg px-2 py-1.5" style={{ background: T.vioSoft, color: T.vioText }}>
              {isAr ? "مرتبط في النظام بـ " : "Linked in the system to "}<b>{unknown.known}</b>{isAr ? " — اختر الصنف المقابل هنا ليُربط بنفس الكود." : " — pick the matching item here to link it to the same code."}</div>}
            <div className="text-xs mb-2" style={{ color: T.mute }}>
              {canBind ? (isAr ? "اختر الصنف لربطه بهذا الباركود فوراً ثم الانتقال لكميته." : "Pick the item to link it to this barcode now, then go to its quantity.")
                       : (isAr ? "الربط للمدير فقط — يمكنك اختيار الصنف للانتقال لكميته بدون ربط." : "Linking is admin-only — you can still pick the item to go to its quantity.")}
            </div>
            <input autoFocus value={unknown.q} onChange={e => setUnknown({ ...unknown, q: e.target.value })} placeholder={isAr ? "ابحث عن الصنف…" : "Search item…"} className={inputCls + " mb-2"} style={inputSty} />
            <div className="max-h-64 overflow-y-auto hf-scroll rounded-lg" style={{ border: "1px solid " + T.line }}>
              {w.rows.map((r, idx) => ({ r, idx })).filter(({ r }) => typeof r !== "string" && (!unknown.q || String(r[0]).toLowerCase().includes(unknown.q.toLowerCase()))).slice(0, 40).map(({ r, idx }, i) => (
                <button key={idx} onClick={() => linkUnknownTo(idx)} className="w-full text-start px-3 py-2 text-sm flex items-center gap-2" style={{ borderTop: i ? "1px solid " + T.line : "none", color: T.ink }}>
                  <span className="flex-1 truncate">{r[0]}{r[3] && <span className="text-xs ms-1" style={{ color: T.mute }}>· {r[3]}</span>}</span><span className="text-xs tabular" style={{ color: T.mute }}>{r[2] == null ? "—" : r[2]} {r[1] || ""}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Btn onClick={() => { audioUnlock(); setUnknown(null); setScan({ mode: "find" }); }}><ScanLine size={14} />{isAr ? "مسح مرة أخرى" : "Scan again"}</Btn>
              <Btn onClick={() => setUnknown(null)}>{isAr ? "إغلاق" : "Close"}</Btn>
            </div>
          </Card>
        </div>
      )}
      {manage && (() => { const cs = codeMap[nameKey(manage.name)] || []; return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 400 }}>
            <div className="flex items-center justify-between mb-1">
              <b style={{ color: T.ink }}>{isAr ? "الباركودات المرتبطة" : "Linked barcodes"}</b>
              <button onClick={() => setManage(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <div className="text-sm mb-3" style={{ color: T.ink2 }}>{manage.name}</div>
            {!cs.length && <Empty isAr={isAr} ar="لا باركود مرتبط." en="No barcode linked." />}
            {cs.map((c, i) => (
              <div key={c} className="flex items-center gap-2 py-1.5 text-sm" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
                {i === 0 && <Chip tone="brass">{isAr ? "أساسي" : "primary"}</Chip>}
                <span className="flex-1 tabular" dir="ltr" style={{ color: T.ink, fontFamily: "ui-monospace,Menlo,Consolas,monospace", textAlign: "left" }}>{c}</span>
                {(barcodes[c] && barcodes[c].names && barcodes[c].names.length > 1) && <span className="text-xs" style={{ color: T.mute }} title={barcodes[c].names.join(", ")}>+{barcodes[c].names.length - 1}</span>}
                {canBind && <button onClick={() => setBarcodes(bcUnbind(barcodes, c, manage.name))} className="rounded p-1" style={{ background: "#FEF2F2", color: "#DC2626" }} title={isAr ? "فك الربط" : "Unlink"}><Trash2 size={13} /></button>}
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              {canBind && <Btn kind="solid" size="sm" onClick={() => { setManage(null); setScan({ mode: "bind", idx: manage.idx, name: manage.name }); }}><ScanBarcode size={14} />{isAr ? "إضافة باركود" : "Add barcode"}</Btn>}
              <Btn size="sm" onClick={() => setManage(null)}>{isAr ? "إغلاق" : "Close"}</Btn>
            </div>
          </Card>
        </div>
      ); })()}
      {send && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 400, borderColor: T.brassLine }}>
            <div className="flex items-center justify-between mb-3">
              <b className="flex items-center gap-1.5" style={{ color: T.ink }}><ArrowUpFromLine size={16} style={{ color: T.brassText }} />{isAr ? "صرف صنف إلى منطقة" : "Issue an item to an area"}</b>
              <button onClick={() => setSend(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <div className="text-sm font-semibold" style={{ color: T.ink2 }}>{send.name}</div>
            <div className="text-xs mb-3 tabular" style={{ color: T.mute }}>
              {isAr ? "الرصيد بالمستودع الرئيسي: " : "On hand at main store: "}<b style={{ color: T.ink2 }}>{send.stk == null ? "—" : send.stk}</b>{send.unit ? " " + send.unit : ""}
            </div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "إلى المنطقة *" : "To area *"}</label>
            <select value={send.to} onChange={e => setSend({ ...send, to: e.target.value })} className={inputCls + " mb-2"} style={inputSty}>
              {areas.map(a => <option key={a.id} value={a.id}>{isAr ? a.ar : a.en}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الكمية *" : "Quantity *"}</label>
                <input autoFocus type="number" step="any" min="0" value={send.q} onChange={e => setSend({ ...send, q: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "ملاحظة" : "Note"}</label>
                <input value={send.note} onChange={e => setSend({ ...send, note: e.target.value })} className={inputCls} style={inputSty} />
              </div>
            </div>
            {sendOver && (
              <div className="flex items-start gap-1.5 text-xs mt-2 rounded-lg p-2" style={{ background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A" }}>
                <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                <span>{isAr ? "الكمية أكبر من الرصيد المسجّل. سيُصرف الصنف ويُسجَّل رصيد المستودع الرئيسي صفراً — راجع الجرد بعدها."
                            : "Quantity exceeds the recorded balance. The issue will be logged and the main-store balance set to zero — recount afterwards."}</span>
              </div>
            )}
            <div className="text-xs mt-2" style={{ color: T.mute }}>
              {isAr ? "تُخصم الكمية من المستودع الرئيسي وتُضاف لرصيد المنطقة تلقائياً (أو يُنشأ الصنف فيها إن لم يكن موجوداً)، ويُسجَّل كاستلام لدى المنطقة وكصرف هنا."
                    : "The quantity is deducted from the main store and added to the area's balance (the item is created there if missing). It is logged as a receipt at the area and as an issue here."}
            </div>
            <div className="flex gap-2 mt-4">
              <Btn kind="brass" disabled={!sendQty || sendQty <= 0 || !send.to} onClick={doSend}><Send size={14} />{isAr ? "صرف الصنف" : "Issue item"}</Btn>
              <Btn onClick={() => setSend(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
      {recv && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 380 }}>
            <div className="flex items-center justify-between mb-3">
              <b style={{ color: T.ink }}>{isAr ? "تسجيل استلام" : "Log a receipt"}</b>
              <button onClick={() => setRecv(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <div className="text-sm font-semibold mb-3" style={{ color: T.ink2 }}>{recv.name}</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الكمية المستلمة *" : "Quantity received *"}</label>
                <input autoFocus type="number" step="any" value={recv.q} onChange={e => setRecv({ ...recv, q: e.target.value })} className={inputCls + " tabular"} style={inputSty} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "تاريخ الاستلام" : "Date received"}</label>
                <input type="date" value={recv.d} onChange={e => setRecv({ ...recv, d: e.target.value })} className={inputCls} style={inputSty} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "تاريخ انتهاء هذه الدفعة" : "Expiry of this batch"}</label>
                <input type="date" value={recv.exp || ""} onChange={e => setRecv({ ...recv, exp: e.target.value })} className={inputCls} style={inputSty} />
              </div>
            </div>
            <label className="text-xs font-semibold block mb-1 mt-2" style={{ color: T.mute }}>{isAr ? "ملاحظة / رقم الفاتورة" : "Note / invoice no."}</label>
            <input value={recv.note} onChange={e => setRecv({ ...recv, note: e.target.value })} className={inputCls} style={inputSty} />
            <div className="text-xs mt-2" style={{ color: T.mute }}>
              {isAr ? "تُضاف الكمية إلى الرصيد كدفعة بتاريخ انتهائها. الصنف يبقى صفاً واحداً في الجدول، وتاريخ الصلاحية المعروض هو الأقرب انتهاءً، والصرف يبدأ منه."
                    : "The quantity is added as its own batch with its expiry date. The item stays one row; the expiry shown is the earliest one left and issuing starts from it."}
            </div>
            <div className="flex gap-2 mt-4">
              <Btn kind="solid" disabled={!recv.q || isNaN(+recv.q)} onClick={doReceive}><ArrowDownToLine size={14} />{isAr ? "تسجيل الاستلام" : "Log receipt"}</Btn>
              <Btn onClick={() => setRecv(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
      {ask != null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 340 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف الصنف نهائياً؟" : "Delete this item?"}</b>
            <div className="text-sm mb-4" style={{ color: T.ink2 }}>{w.rows[ask] && w.rows[ask][0]}</div>
            <div className="flex gap-2">
              <button onClick={() => delItem(ask)}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white"
                style={{ background: "#DC2626" }}><Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setAsk(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ================================= TASKS ================================== */
function TaskCompose({ isAr, onSend, me, onClose }) {
  const [f, setF] = useState({ title: "", desc: "", pri: "normal", due: "" });
  return (
    <Card className="mb-3">
      <b className="text-sm block mb-3" style={{ color: T.ink }}>{isAr ? "إرسال مهمة إلى مدير النظام" : "Send a task to the system manager"}</b>
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "عنوان المهمة *" : "Task title *"}</label>
          <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })}
            placeholder={isAr ? "مثال: تجهيز صالة كبار الشخصيات قبل رحلة 07:40" : "e.g. Prepare VIP hall before flight 07:40"}
            className={inputCls} style={inputSty} />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الأولوية" : "Priority"}</label>
          <select value={f.pri} onChange={e => setF({ ...f, pri: e.target.value })} className={inputCls} style={inputSty}>
            <option value="normal">{isAr ? "عادية" : "Normal"}</option>
            <option value="high">{isAr ? "عاجلة" : "Urgent"}</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "وصف المهمة *" : "Task description *"}</label>
          <textarea rows={3} value={f.desc} onChange={e => setF({ ...f, desc: e.target.value })}
            className={inputCls} style={inputSty} />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "التاريخ المطلوب" : "Needed by"}</label>
          <input type="date" value={f.due} onChange={e => setF({ ...f, due: e.target.value })} className={inputCls} style={inputSty} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <Btn kind="solid" disabled={!f.title.trim() || !f.desc.trim()} onClick={() => {
          onSend({ id: uid(), at: todayISO(), tm: nowHM(), title: f.title.trim(), desc: f.desc.trim(),
                   pri: f.pri, due: f.due || null, from: me.n, fromRole: me.role, dept: null, status: "new", log: [] });
          setF({ title: "", desc: "", pri: "normal", due: "" });
          if (onClose) onClose();
        }}><Send size={14} />{isAr ? "إرسال المهمة" : "Send task"}</Btn>
        <span className="text-xs" style={{ color: T.mute }}>
          {isAr ? "تصل فوراً إلى لوحة مدير النظام باسمك وتاريخها، ويحوّلها إلى القسم المختص."
                : "It reaches the manager's dashboard instantly with your name and date, and he routes it to a department."}
        </span>
      </div>
    </Card>
  );
}

function TaskCard({ t, isAr, isAdmin, setTasks, tasks, me }) {
  const [open, setOpen] = useState(false);
  const st = T_STATUS[t.status] || T_STATUS.new;
  const dept = DEPTS.find(d => d[0] === t.dept);
  const patch = (p, note) => setTasks(tasks.map(x => x.id !== t.id ? x
    : { ...x, ...p, log: [...(x.log || []), { at: todayISO(), tm: nowHM(), by: me.n, note }] }));
  return (
    <Card className="mb-2">
      <div className="flex items-start gap-2.5">
        <span className="rounded-lg p-2 shrink-0" style={TONE[t.pri === "high" ? "bad" : "vio"]}>
          {t.pri === "high" ? <AlertTriangle size={15} /> : <Bell size={15} />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <b className="text-sm" style={{ color: T.ink }}>{t.title}</b>
            <Chip tone={st.tone}>{isAr ? st.ar : st.en}</Chip>
            {t.pri === "high" && <Chip tone="bad">{isAr ? "عاجلة" : "Urgent"}</Chip>}
            {dept && <Chip tone="brass">{isAr ? dept[1] : dept[2]}</Chip>}
          </div>
          <div className="text-xs mt-1" style={{ color: T.mute }}>
            {isAr ? "من" : "from"} <b style={{ color: T.ink2 }}>{t.from}</b>
            <span style={{ color: (ROLES[t.fromRole] || {}).c }}> · {isAr ? (ROLES[t.fromRole] || {}).ar : (ROLES[t.fromRole] || {}).en}</span>
            <span className="tabular"> · {t.at} {t.tm}</span>
            {t.due && <span className="tabular"> · {isAr ? "مطلوبة قبل" : "due"} {t.due}</span>}
          </div>
          <div className="text-sm mt-2" style={{ color: T.ink2, whiteSpace: "pre-wrap" }}>{t.desc}</div>

          {isAdmin && (
            <div className="flex gap-1.5 mt-3 flex-wrap items-center">
              <select value={t.dept || ""} onChange={e => patch({ dept: e.target.value || null, status: t.status === "new" ? "work" : t.status },
                  isAr ? "حُوّلت إلى القسم" : "Routed to department")}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold" style={inputSty}>
                <option value="">{isAr ? "تحويل إلى قسم…" : "Route to department…"}</option>
                {DEPTS.map(d => <option key={d[0]} value={d[0]}>{isAr ? d[1] : d[2]}</option>)}
              </select>
              {t.status !== "done"
                ? <Btn size="sm" kind="brass" onClick={() => patch({ status: "done" }, isAr ? "أُنجزت" : "Completed")}><CheckCheck size={13} />{isAr ? "إنجاز" : "Done"}</Btn>
                : <Btn size="sm" onClick={() => patch({ status: "work" }, isAr ? "أُعيد فتحها" : "Reopened")}>{isAr ? "إعادة فتح" : "Reopen"}</Btn>}
              <Btn size="sm" onClick={() => setOpen(!open)}>{isAr ? "السجل" : "History"} ({(t.log || []).length})</Btn>
              <Btn size="sm" onClick={() => setTasks(tasks.filter(x => x.id !== t.id))}><Trash2 size={13} />{isAr ? "حذف" : "Delete"}</Btn>
            </div>
          )}
          {open && (t.log || []).length > 0 && (
            <div className="mt-2 rounded-lg p-2 text-xs" style={{ background: T.surf, color: T.mute }}>
              {(t.log || []).map((l, i) => (
                <div key={i} className="tabular">{l.at} {l.tm} — {l.by}: <span style={{ color: T.ink2 }}>{l.note}</span></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function TasksScreen({ isAr, tasks, setTasks, me, print }) {
  const isAdmin = me.role === "admin";
  const canSend = me.role === "ra" || me.role === "catrion" || isAdmin;
  const [filter, setFilter] = useState("open");
  const mine = isAdmin ? tasks : tasks.filter(t => t.from === me.n || t.fromRole === me.role);
  const list = mine.filter(t => filter === "all" ? true : filter === "done" ? t.status === "done" : t.status !== "done");
  const counts = { open: mine.filter(t => t.status !== "done").length, done: mine.filter(t => t.status === "done").length };

  return (
    <div>
      <SectionTitle isAr={isAr} icon={Bell} ar="المهام والطلبات" en="Tasks & requests"
        sub={isAr ? "طيران الرياض وكاتريون يرسلان المهام إلى مدير النظام، وهو يوزّعها على الأقسام"
                  : "Riyadh Air and Catrion send tasks to the system manager, who routes them to departments"}
        right={<Btn kind="brass" size="sm" onClick={() => print({
          ar: "سجل المهام والطلبات", en: "Tasks & Requests Log",
          meta: [[isAr ? "المفتوحة" : "Open", counts.open], [isAr ? "المنجزة" : "Done", counts.done]],
          cols: [isAr ? "التاريخ" : "Date", isAr ? "المرسل" : "Sender", isAr ? "الجهة" : "Entity", isAr ? "المهمة" : "Task",
                 isAr ? "القسم" : "Department", isAr ? "الحالة" : "Status"],
          rows: list.map(t => [t.at + " " + t.tm, t.from, (ROLES[t.fromRole] || {})[isAr ? "ar" : "en"] || "", t.title,
                               (DEPTS.find(d => d[0] === t.dept) || [])[isAr ? 1 : 2] || "—",
                               (T_STATUS[t.status] || T_STATUS.new)[isAr ? "ar" : "en"]]),
          by: me.n,
        })}><Printer size={14} />{isAr ? "طباعة" : "Print"}</Btn>} />

      {canSend && <TaskCompose isAr={isAr} me={me} onSend={(t) => setTasks([t, ...tasks])} />}

      <div className="flex gap-2 mb-3 flex-wrap">
        {[["open", "المفتوحة", "Open", counts.open], ["done", "المنجزة", "Done", counts.done], ["all", "الكل", "All", mine.length]].map(([k, a, e, n]) => (
          <button key={k} onClick={() => setFilter(k)} className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={filter === k ? { background: T.ink, color: "#fff" } : { background: "#fff", color: T.ink2, border: "1px solid " + T.line }}>
            {isAr ? a : e} ({n})
          </button>
        ))}
      </div>

      {!list.length && <Card><Empty isAr={isAr} ar="لا توجد مهام في هذه القائمة." en="No tasks in this list." /></Card>}
      {list.map(t => <TaskCard key={t.id} t={t} isAr={isAr} isAdmin={isAdmin} tasks={tasks} setTasks={setTasks} me={me} />)}
    </div>
  );
}

/* ================================= USERS ================================== */
function UsersScreen({ isAr, users, setUsers, me, myEmail, sb }) {
  const blank = { email: "", n: "", prn: "", role: "ops", r: "" };
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState(null);
  const [ask, setAsk] = useState(null);
  const [reset, setReset] = useState(null);   // { email } — confirm before sending
  const [rBusy, setRBusy] = useState(false);
  const [rMsg, setRMsg] = useState("");
  const sendReset = async (email) => {
    if (!sb) return;
    setRBusy(true); setRMsg("");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    setRBusy(false); setReset(null);
    setRMsg(error
      ? (isAr ? "تعذّر الإرسال: " : "Could not send: ") + error.message
      : (isAr ? "أُرسل رابط الاستعادة إلى " : "Reset link sent to ") + email);
    setTimeout(() => setRMsg(""), 6000);
  };
  const norm = (e) => e.trim().toLowerCase();
  const dup = users.some(u => norm(u.email) === norm(f.email) && (edit == null || users[edit].email !== u.email));

  const save = () => {
    if (!f.email.trim() || !f.n.trim() || dup) return;
    const rec = { email: norm(f.email), n: f.n.trim(), prn: f.prn.trim() || "—", role: f.role, r: f.r.trim() || (ROLES[f.role] || {}).en };
    if (edit != null) setUsers(users.map((u, i) => i === edit ? rec : u));
    else setUsers([...users, rec]);
    setF(blank); setEdit(null);
  };

  return (
    <div>
      <SectionTitle isAr={isAr} icon={Users} ar="المستخدمون والصلاحيات" en="Users & permissions"
        sub={isAr ? "الحساب الرئيسي وحده يُنشئ الحسابات الفرعية ويحدد صلاحية كل واحد"
                  : "The main account alone creates sub-accounts and sets each one's permission"} />

      <Card className="mb-3">
        <b className="text-sm block mb-3" style={{ color: T.ink }}>
          {edit != null ? (isAr ? "تعديل مستخدم" : "Edit user") : (isAr ? "إضافة مستخدم جديد" : "Add a new user")}
        </b>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="col-span-2">
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "البريد الإلكتروني *" : "Email *"}</label>
            <input dir="ltr" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className={inputCls} style={inputSty} placeholder="name@example.com" />
            {dup && <div className="text-xs mt-1" style={{ color: T.bad }}>{isAr ? "هذا البريد مضاف مسبقاً" : "This email already exists"}</div>}
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الاسم *" : "Name *"}</label>
            <input value={f.n} onChange={e => setF({ ...f, n: e.target.value })} className={inputCls} style={inputSty} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الرقم الوظيفي" : "PRN"}</label>
            <input value={f.prn} onChange={e => setF({ ...f, prn: e.target.value })} className={inputCls} style={inputSty} placeholder="TL-1001" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "الصلاحية" : "Role"}</label>
            <select value={f.role} onChange={e => setF({ ...f, role: e.target.value })} className={inputCls} style={inputSty}>
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{isAr ? v.ar : v.en}</option>)}
            </select>
          </div>
          <div className="col-span-2 lg:col-span-3">
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "المسمى الوظيفي" : "Job title"}</label>
            <input value={f.r} onChange={e => setF({ ...f, r: e.target.value })} className={inputCls} style={inputSty}
              placeholder={isAr ? "قائد فريق / مشرف / منسق" : "Team leader / Supervisor"} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Btn kind="solid" disabled={!f.email.trim() || !f.n.trim() || dup} onClick={save}>
            {edit != null ? <CheckCircle2 size={14} /> : <UserPlus size={14} />}
            {edit != null ? (isAr ? "حفظ" : "Save") : (isAr ? "إضافة المستخدم" : "Add user")}
          </Btn>
          {edit != null && <Btn onClick={() => { setEdit(null); setF(blank); }}>{isAr ? "إلغاء" : "Cancel"}</Btn>}
        </div>
        <div className="mt-3 rounded-lg p-2.5 text-xs" style={{ background: T.brassSoft, color: T.brassText, border: "1px solid " + T.brassLine }}>
          <b className="block mb-1">{isAr ? "كيف يدخل المستخدم الجديد" : "How a new user signs in"}</b>
          {isAr ? "أضفه هنا أولاً، ثم يفتح رابط النظام ويضغط «أول مرة؟ إنشاء حساب» بنفس البريد المسجَّل هنا ويختار كلمة مروره. البريد غير المضاف هنا يُرفض دخوله تلقائياً، وحذفه من هنا يقطع دخوله فوراً."
                : "Add them here first, then they open the system, tap “Create account” with exactly this email and pick a password. Any email not listed here is rejected automatically, and deleting it here cuts access immediately."}
        </div>
      </Card>

      <Card pad={false}>
        <div className="overflow-x-auto hf-scroll">
          <table className="w-full text-sm" style={{ minWidth: 700 }}>
            <thead style={{ background: T.surf }}>
              <tr>{[isAr ? "الاسم" : "Name", isAr ? "البريد" : "Email", "PRN", isAr ? "الصلاحية" : "Role", isAr ? "المسمى" : "Title", ""].map((h, i) => (
                <th key={i} className="text-start px-3 py-2 text-xs font-bold" style={{ color: T.mute }}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const isMe = norm(u.email) === norm(myEmail || "");
                return (
                  <tr key={u.email} style={{ borderTop: "1px solid " + T.line, background: edit === i ? T.vioSoft : undefined }}>
                    <td className="px-3 py-2 font-semibold" style={{ color: T.ink }}>
                      {u.n} {isMe && <Chip tone="ok">{isAr ? "أنت" : "you"}</Chip>}
                    </td>
                    <td className="px-3 py-2" style={{ color: T.ink2, direction: "ltr", textAlign: "start" }}>{u.email}</td>
                    <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>{u.prn}</td>
                    <td className="px-3 py-2">
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                        style={{ background: (ROLES[u.role] || ROLES.ops).c }}>
                        {isAr ? (ROLES[u.role] || ROLES.ops).ar : (ROLES[u.role] || ROLES.ops).en}
                      </span>
                    </td>
                    <td className="px-3 py-2" style={{ color: T.mute }}>{u.r}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => { setF({ email: u.email, n: u.n, prn: u.prn === "—" ? "" : u.prn, role: u.role, r: u.r || "" }); setEdit(i); }}
                          className="rounded p-1.5" style={{ background: T.vioSoft, color: T.vioText }} title={isAr ? "تعديل" : "Edit"}><Pencil size={13} /></button>
                        {sb && <button onClick={() => setReset({ email: u.email })} className="rounded p-1.5"
                          style={{ background: T.brassSoft, color: T.brassText }} title={isAr ? "إرسال رابط استعادة كلمة المرور" : "Send a password reset link"}><KeyRound size={13} /></button>}
                        {!isMe && <button onClick={() => setAsk(i)} className="rounded p-1.5" style={{ background: T.badSoft, color: T.bad }}
                          title={isAr ? "حذف" : "Delete"}><Trash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {rMsg && (
        <div className="fixed z-50 left-1/2 -translate-x-1/2 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ bottom: 18, background: T.ink, boxShadow: "0 6px 20px rgba(0,0,0,.25)" }}>{rMsg}</div>
      )}
      {reset && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 400 }}>
            <b className="block mb-2 flex items-center gap-1.5" style={{ color: T.ink }}><KeyRound size={16} style={{ color: T.brassText }} />{isAr ? "استعادة كلمة المرور" : "Password reset"}</b>
            <div className="text-sm mb-1" style={{ color: T.ink2 }} dir="ltr">{reset.email}</div>
            <div className="text-xs mb-3" style={{ color: T.mute }}>
              {isAr ? "يصل الموظف رابط على بريده هذا، يفتحه ويضع كلمة مرور جديدة بنفسه. الرابط صالح ساعة واحدة، وأنت لا ترى كلمة المرور ولا تستطيع تعيينها نيابة عنه."
                    : "The employee receives a link at this address and sets a new password themselves. It is valid for one hour; you never see or set the password for them."}
            </div>
            <div className="flex gap-2">
              <Btn kind="brass" disabled={rBusy} onClick={() => sendReset(reset.email)}><Send size={14} />{rBusy ? (isAr ? "جارٍ الإرسال…" : "Sending…") : (isAr ? "إرسال الرابط" : "Send link")}</Btn>
              <Btn onClick={() => setReset(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
      {ask != null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 380 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف المستخدم؟" : "Remove this user?"}</b>
            <div className="text-sm mb-3" style={{ color: T.ink2 }}>{users[ask] && users[ask].n} — <span style={{ direction: "ltr" }}>{users[ask] && users[ask].email}</span></div>
            <div className="text-xs mb-4 rounded-lg p-2" style={{ background: T.badSoft, color: T.bad }}>
              {isAr ? "يُمنع دخوله للنظام فوراً. لحذف حسابه نهائياً من قاعدة المصادقة، احذفه أيضاً من لوحة Supabase ← Authentication."
                    : "Access is blocked immediately. To erase the auth record itself, delete it from Supabase → Authentication as well."}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setUsers(users.filter((_, j) => j !== ask)); setAsk(null); setEdit(null); setF(blank); }}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: T.bad }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Remove"}</button>
              <Btn onClick={() => setAsk(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* =============================== STATISTICS =============================== */
function StatsScreen({ isAr, warehouses, orders, waste, breaks, receipts, linen, devices, checks, rounds, tasks, print, user }) {
  receipts = receipts.filter(r => !r.src); /* internal issues from the main store are movements, not goods received */
  const [days, setDays] = useState(30);
  const from = shiftDays(-(days - 1));
  const inRange = (d) => d && d >= from;
  const D0 = todayISO(), M0 = monthKey(D0), W0 = weekKey(D0);

  const wasteR = waste.filter(w => inRange(w[0]));
  const breakR = breaks.filter(b => inRange(b[0]));
  const recR = receipts.filter(r => inRange(r.d));

  const items = warehouses.flatMap(w => w.rows.filter(r => Array.isArray(r)).map(r => ({ w, r, st: calcStatus(r) })));
  const cnt = (st) => items.filter(x => x.st === st).length;
  const qtyOf = (r) => (typeof r[2] === "number" ? r[2] : 0);

  const wasteQty = wasteR.reduce((a, w) => a + numOf(w[4]), 0);
  const breakQty = breakR.reduce((a, b) => a + numOf(b[3]), 0);
  const recQty = recR.reduce((a, r) => a + numOf(r.q), 0);
  const orderQty = Object.values(orders).reduce((a, o) => a + Object.values(o || {}).reduce((x, v) => x + numOf(v.q), 0), 0);

  /* per-warehouse comparison: ordered vs received vs wasted */
  const perWh = warehouses.map(w => {
    const ord = Object.values(orders[w.id] || {}).reduce((a, v) => a + numOf(v.q), 0);
    const rec = recR.filter(r => r.wh === w.id).reduce((a, r) => a + numOf(r.q), 0);
    const wst = wasteR.filter(x => x[1] === w.en || x[1] === w.ar).reduce((a, x) => a + numOf(x[4]), 0);
    return { w, ord, rec, wst, stock: w.rows.filter(r => Array.isArray(r)).reduce((a, r) => a + qtyOf(r), 0) };
  });
  const topWh = perWh.slice().sort((a, b) => (b.ord + b.rec + b.wst) - (a.ord + a.rec + a.wst)).slice(0, 6);

  /* wastage split */
  const reasons = {};
  wasteR.forEach(w => { const k = String(w[5] || "Other"); reasons[k] = (reasons[k] || 0) + numOf(w[4]); });
  const RC = { Expired: T.bad, Damaged: T.brass, Broken: "#9333EA", Returned: T.vio, Other: T.mute };
  const reasonData = Object.entries(reasons).map(([l, v]) => ({ l, v, c: RC[l] || T.mute }));

  const topItems = Object.entries(wasteR.reduce((a, w) => { a[w[2]] = (a[w[2]] || 0) + numOf(w[4]); return a; }, {}))
    .sort((a, b) => b[1] - a[1]).slice(0, 7).map(([l, v]) => ({ l, v }));

  /* receipts trend */
  const span = Math.min(days, 21);
  const dayList = lastDays(span);
  const recByDay = dayList.map(d => receipts.filter(r => r.d === d).reduce((a, r) => a + numOf(r.q), 0));
  const wasteByDay = dayList.map(d => waste.filter(w => w[0] === d).reduce((a, w) => a + numOf(w[4]), 0));
  const breakByDay = dayList.map(d => breaks.filter(b => b[0] === d).reduce((a, b) => a + numOf(b[3]), 0));

  /* receipts per period */
  const recDay = receipts.filter(r => r.d === D0).reduce((a, r) => a + numOf(r.q), 0);
  const recWeek = receipts.filter(r => weekKey(r.d) === W0).reduce((a, r) => a + numOf(r.q), 0);
  const recMonth = receipts.filter(r => monthKey(r.d) === M0).reduce((a, r) => a + numOf(r.q), 0);
  const months = Array.from(new Set(receipts.map(r => monthKey(r.d)))).sort().slice(-6);
  const recByMonth = months.map(m => ({ l: m, v: receipts.filter(r => monthKey(r.d) === m).reduce((a, r) => a + numOf(r.q), 0) }));

  /* breakage by category */
  const brkCat = BREAK_CATS.map(c => ({ l: c, v: breakR.filter(b => b[2] === c).reduce((a, b) => a + numOf(b[3]), 0) })).filter(x => x.v);

  /* linen */
  const lcats = (linen.cats || []);
  const linenSeries = lcats.slice(0, 3).map((c, i) => ({
    name: isAr ? c.ar : c.en, color: [T.vio, T.brass, T.ok][i] || T.mute,
    vals: dayList.map(d => { const row = ((linen.data || {})[c.id] || []).find(r => (r.d || (Array.isArray(r) && r[0])) === d);
      if (!row) return 0;
      return Array.isArray(row) ? (row[2] || 0) + (row[4] || 0) : (row.am?.u || 0) + (row.pm?.u || 0); }),
  }));

  /* compliance today */
  const allReads = devices.flatMap(d => Object.values(d.r || {}).map(v => ({ d, v })));
  const okReads = allReads.filter(x => devState(x.d, x.v.t) === "ok").length;
  const compliance = allReads.length ? Math.round(okReads / allReads.length * 100) : null;
  const cleanDone = Object.keys(checks).length + Object.keys(rounds).length;
  const cleanTotal = T_TASKS.length * MORNING.length + G_AREAS.length * (R_DAY.length + R_NIGHT.length);

  /* decision signals */
  const needOrder = items.filter(x => x.st === "out" || x.st === "low")
    .map(x => ({ l: (isAr ? x.w.ar : x.w.en) + " — " + x.r[0], v: qtyOf(x.r), st: x.st }))
    .slice(0, 8);
  const expSoon = items.filter(x => x.st === "soon" || x.st === "exp")
    .sort((a, b) => String(a.r[3]).localeCompare(String(b.r[3])))
    .slice(0, 8).map(x => ({ name: x.r[0], wh: isAr ? x.w.ar : x.w.en, exp: x.r[3], st: x.st }));
  const lossRatio = recQty ? Math.round((wasteQty + breakQty) / recQty * 100) : null;
  const openTasks = tasks.filter(t => t.status !== "done").length;

  return (
    <div>
      <SectionTitle isAr={isAr} icon={BarChart3} ar="الإحصائيات والتحليل" en="Statistics & analysis"
        sub={isAr ? "مقارنات حقيقية بين الطلب والاستلام والاستهلاك والهدر — لاتخاذ القرار لا لعرض الأرقام"
                  : "Real comparisons across ordering, receiving, consumption and loss — built for decisions, not decoration"}
        right={<Btn kind="brass" size="sm" onClick={() => print({
          ar: "تقرير الإحصائيات — آخر " + days + " يوماً", en: "Statistics Report — last " + days + " days",
          meta: [[isAr ? "الفترة" : "Period", from + " → " + D0], [isAr ? "المستلم" : "Received", recQty],
                 [isAr ? "الهدر" : "Wasted", wasteQty], [isAr ? "الكسر" : "Broken", breakQty],
                 [isAr ? "نسبة الفاقد" : "Loss ratio", lossRatio == null ? "—" : lossRatio + "%"]],
          cols: [isAr ? "المستودع" : "Warehouse", isAr ? "الرصيد" : "Stock", isAr ? "بالطلب" : "Ordered",
                 isAr ? "المستلم" : "Received", isAr ? "الهدر" : "Wasted"],
          rows: perWh.map(p => [isAr ? p.w.ar : p.w.en, p.stock, p.ord, p.rec, p.wst]), by: user.n,
        })}><Printer size={14} />{isAr ? "طباعة التقرير" : "Print report"}</Btn>} />

      <div className="flex gap-2 mb-3 flex-wrap">
        {[[7, "آخر ٧ أيام", "Last 7 days"], [30, "آخر ٣٠ يوماً", "Last 30 days"], [90, "آخر ٩٠ يوماً", "Last 90 days"]].map(([k, a, e]) => (
          <button key={k} onClick={() => setDays(k)} className="rounded-lg px-3 py-1.5 text-sm font-semibold"
            style={days === k ? { background: T.ink, color: "#fff" } : { background: "#fff", color: T.ink2, border: "1px solid " + T.line }}>
            {isAr ? a : e}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <KPI icon={ArrowDownToLine} tone="ok" label={isAr ? "المستلم في الفترة" : "Received in period"} value={recQty}
          sub={(isAr ? "اليوم " : "today ") + recDay + " · " + (isAr ? "الأسبوع " : "week ") + recWeek + " · " + (isAr ? "الشهر " : "month ") + recMonth} />
        <KPI icon={Trash2} tone="bad" label={isAr ? "الهدر في الفترة" : "Wasted in period"} value={wasteQty}
          sub={wasteR.length + (isAr ? " سجل إتلاف" : " disposal records")} />
        <KPI icon={Wine} tone="warn" label={isAr ? "الكسر في الفترة" : "Broken in period"} value={breakQty}
          sub={breakR.length + (isAr ? " سجل كسر" : " breakage records")} />
        <KPI icon={TrendingUp} tone={lossRatio != null && lossRatio > 10 ? "bad" : "vio"}
          label={isAr ? "نسبة الفاقد من المستلم" : "Loss vs received"} value={lossRatio == null ? "—" : lossRatio + "%"}
          sub={isAr ? "(هدر + كسر) ÷ المستلم" : "(waste + breakage) ÷ received"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <ChartBox tall title={isAr ? "الطلب مقابل الاستلام مقابل الهدر" : "Ordered vs received vs wasted"}
          sub={isAr ? "لكل مستودع خلال الفترة — الفجوة بين العمودين الأول والثاني تعني طلبيات لم تصل"
                    : "Per warehouse for the period — a gap between the first two bars means orders that never arrived"}>
          <GroupBars labels={topWh.map(p => (isAr ? p.w.ar : p.w.en).split(" ").slice(0, 2).join(" "))}
            series={[
              { name: isAr ? "بالطلب" : "Ordered", color: T.vio, vals: topWh.map(p => p.ord) },
              { name: isAr ? "المستلم" : "Received", color: T.ok, vals: topWh.map(p => p.rec) },
              { name: isAr ? "الهدر" : "Wasted", color: T.bad, vals: topWh.map(p => p.wst) },
            ]} />
        </ChartBox>

        <ChartBox tall title={isAr ? "حركة المستلم والهدر والكسر" : "Received, wasted and broken over time"}
          sub={isAr ? "آخر " + span + " يوماً — تقاطع الخطوط ينبّه لمشكلة تخزين أو تداول" : "Last " + span + " days — crossing lines flag a storage or handling problem"}>
          <Trend labels={dayList.map(shortD)} series={[
            { name: isAr ? "مستلم" : "Received", color: T.ok, vals: recByDay },
            { name: isAr ? "هدر" : "Wasted", color: T.bad, vals: wasteByDay },
            { name: isAr ? "كسر" : "Broken", color: T.brass, vals: breakByDay },
          ]} />
        </ChartBox>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-3">
        <ChartBox title={isAr ? "أسباب الهدر" : "Wastage by reason"} sub={isAr ? "أين يذهب الفاقد فعلاً" : "Where the loss actually goes"}>
          <Donut isAr={isAr} data={reasonData} unitAr="وحدة" unitEn="units" />
        </ChartBox>
        <ChartBox title={isAr ? "أكثر الأصناف هدراً" : "Most wasted items"} sub={isAr ? "ابدأ التخفيض من أعلى القائمة" : "Start reducing from the top"}>
          <HBars data={topItems} color={T.bad} />
        </ChartBox>
        <ChartBox title={isAr ? "الكسر حسب الفئة" : "Breakage by category"} sub={isAr ? "يوجّه التدريب والشراء" : "Guides training and purchasing"}>
          <VBars data={brkCat} color={T.brass} />
        </ChartBox>
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mb-3">
        <ChartBox title={isAr ? "المستلم شهرياً" : "Received per month"}
          sub={isAr ? "اليوم " + recDay + " · هذا الأسبوع " + recWeek + " · هذا الشهر " + recMonth
                    : "Today " + recDay + " · this week " + recWeek + " · this month " + recMonth}>
          <VBars data={recByMonth} color={T.ok} />
        </ChartBox>
        <ChartBox title={isAr ? "استهلاك المفروشات" : "Linen consumption"}
          sub={isAr ? "المستخدم يومياً لكل قسم — ارتفاع مفاجئ يعني فقداً أو سوء تسليم" : "Daily usage per category — a sudden spike means loss or a bad handover"}>
          {linenSeries.length ? <Trend labels={dayList.map(shortD)} series={linenSeries} />
            : <Empty isAr={isAr} ar="لا توجد سجلات مفروشات بعد." en="No linen records yet." />}
        </ChartBox>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-3">
        <ChartBox title={isAr ? "صحة المخزون" : "Inventory health"} sub={isAr ? "توزيع الأصناف حسب الحالة" : "Item distribution by status"}>
          <Donut isAr={isAr} unitAr="صنف" unitEn="items" data={[
            { l: isAr ? "سليم" : "OK", v: cnt("ok"), c: T.ok },
            { l: isAr ? "تحت الحد" : "Low", v: cnt("low"), c: T.brass },
            { l: isAr ? "غير متوفر" : "Out", v: cnt("out"), c: T.bad },
            { l: isAr ? "قرب الانتهاء" : "Expiring", v: cnt("soon"), c: "#9333EA" },
            { l: isAr ? "منتهي" : "Expired", v: cnt("exp"), c: "#7F1D1D" },
          ]} />
        </ChartBox>

        <ChartBox title={isAr ? "الالتزام التشغيلي اليوم" : "Operational compliance today"}
          sub={isAr ? "الحرارة والنظافة والمهام" : "Temperature, cleaning and tasks"}>
          <div className="space-y-3">
            <HBars max={100} color={T.ok} fmt={v => v + "%"} data={[
              { l: isAr ? "قراءات حرارة داخل النطاق" : "Temperature readings in range", v: compliance == null ? 0 : compliance,
                c: compliance != null && compliance < 90 ? T.bad : T.ok },
              { l: isAr ? "إنجاز تشيك ليست النظافة" : "Cleaning checklist completion",
                v: Math.min(100, Math.round(cleanDone / Math.max(1, cleanTotal) * 100)), c: T.vio },
            ]} />
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2.5" style={{ background: T.surf }}>
                <div className="text-xs" style={{ color: T.mute }}>{isAr ? "قراءات اليوم" : "Readings today"}</div>
                <div className="text-lg font-bold tabular" style={{ color: T.ink }}>{allReads.length}</div>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: openTasks ? T.badSoft : T.surf }}>
                <div className="text-xs" style={{ color: T.mute }}>{isAr ? "مهام مفتوحة" : "Open tasks"}</div>
                <div className="text-lg font-bold tabular" style={{ color: openTasks ? T.bad : T.ink }}>{openTasks}</div>
              </div>
            </div>
          </div>
        </ChartBox>

        <ChartBox title={isAr ? "رصيد المستودعات" : "Stock volume by warehouse"} sub={isAr ? "أين تتركّز قيمة المخزون" : "Where the stock is concentrated"}>
          <HBars color={T.vio} data={perWh.slice().sort((a, b) => b.stock - a.stock).slice(0, 8)
            .map(p => ({ l: isAr ? p.w.ar : p.w.en, v: p.stock }))} />
        </ChartBox>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <Card>
          <b className="text-sm block mb-1" style={{ color: T.ink }}>{isAr ? "قرار مطلوب الآن: أصناف تحتاج طلباً" : "Decide now: items needing an order"}</b>
          <div className="text-xs mb-3" style={{ color: T.mute }}>{isAr ? "غير متوفر أو تحت الحد الأدنى" : "Out of stock or below minimum"}</div>
          {!needOrder.length && <Empty isAr={isAr} ar="لا يوجد صنف تحت الحد — المخزون مغطّى." en="Nothing below minimum — stock is covered." />}
          {needOrder.map((x, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
              <Chip tone={x.st === "out" ? "bad" : "warn"}>{x.st === "out" ? (isAr ? "منتهٍ" : "out") : (isAr ? "منخفض" : "low")}</Chip>
              <span className="text-sm flex-1 truncate" style={{ color: T.ink2 }}>{x.l}</span>
              <b className="tabular text-sm" style={{ color: T.ink }}>{x.v}</b>
            </div>
          ))}
        </Card>

        <Card>
          <b className="text-sm block mb-1" style={{ color: T.ink }}>{isAr ? "قرار مطلوب قريباً: صلاحيات على الحافة" : "Decide soon: expiry at the edge"}</b>
          <div className="text-xs mb-3" style={{ color: T.mute }}>{isAr ? "حرّكها أو استخدمها قبل أن تتحول إلى هدر" : "Move or consume before it turns into waste"}</div>
          {!expSoon.length && <Empty isAr={isAr} ar="لا توجد أصناف قريبة الانتهاء." en="No items nearing expiry." />}
          {expSoon.map((x, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
              <Chip tone={x.st === "exp" ? "bad" : "brass"}>{x.exp}</Chip>
              <span className="text-sm flex-1 truncate" style={{ color: T.ink2 }}>{x.name}</span>
              <span className="text-xs truncate" style={{ color: T.mute, maxWidth: 110 }}>{x.wh}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* =============================== DAILY HISTORY ============================= */
function dayTemps(isToday, live, docs, date) {
  if (isToday) return live;
  const defs = live.map(({ r, ...d }) => d);
  const reads = (docs && docs["temps:" + date]) || {};
  return defs.map(d => ({ ...d, r: reads[d.id] || {} }));
}
function HistoryScreen({ isAr, docs, D0, devices, meals, checks, rounds, print, user }) {
  const dates = useMemo(() => {
    const s = new Set([D0]);
    Object.keys(docs || {}).forEach(k => {
      const m = k.match(/^(?:temps|checks|rounds|meals):(\d{4}-\d{2}-\d{2})$/);
      if (m) s.add(m[1]);
    });
    return Array.from(s).sort().reverse();
  }, [docs, D0]);
  const [date, setDate] = useState(D0);
  const isToday = date === D0;

  const devs = dayTemps(isToday, devices, docs, date);
  const dayMeals = isToday ? meals : ((docs && docs["meals:" + date]) || []);
  const dayChecks = isToday ? checks : ((docs && docs["checks:" + date]) || {});
  const dayRounds = isToday ? rounds : ((docs && docs["rounds:" + date]) || {});

  const allReads = devs.flatMap(d => Object.entries(d.r || {}).map(([tm, v]) => ({ d, tm, v })));
  const badReads = allReads.filter(x => devState(x.d, x.v.t) !== "ok");
  const toiletDone = Object.keys(dayChecks).length, toiletTotal = T_TASKS.length * MORNING.length * TOILETS.length;
  const roundDone = Object.keys(dayRounds).length, roundTotal = G_AREAS.length * (R_DAY.length + R_NIGHT.length);

  const printTemps = () => print({
    ar: "سجل الحرارة — " + date, en: "Temperature Log — " + date,
    meta: [[isAr ? "التاريخ" : "Date", date], [isAr ? "عدد القراءات" : "Readings", allReads.length],
           [isAr ? "خارج النطاق" : "Out of range", badReads.length]],
    cols: [isAr ? "الجهاز" : "Device", isAr ? "الوقت" : "Time", "°C", isAr ? "المسجِّل" : "By", isAr ? "إجراء تصحيحي" : "Corrective action"],
    rows: allReads.sort((a, b) => a.tm.localeCompare(b.tm)).map(x => [isAr ? x.d.ar : x.d.en, x.tm, x.v.t, x.v.by, x.v.ca || "—"]),
    note: isAr ? "النطاقات المعروضة تتبع إعدادات الأجهزة الحالية." : "Ranges shown follow the devices' current settings.",
    by: user.n,
  });
  const printClean = () => print({
    ar: "ملخص النظافة — " + date, en: "Cleaning Summary — " + date,
    meta: [[isAr ? "التاريخ" : "Date", date], [isAr ? "دورات المياه" : "Toilets", toiletDone + "/" + toiletTotal],
           [isAr ? "الجولة العامة" : "General round", roundDone + "/" + roundTotal]],
    cols: [isAr ? "البند" : "Item", isAr ? "المنفّذ" : "By", isAr ? "الوقت" : "Time"],
    rows: [...Object.entries(dayChecks).map(([k, v]) => {
             const [ti, si] = k.split("|").slice(-2).map(Number);
             return [isAr ? (T_TASKS[ti] || ["—"])[0] : (T_TASKS[ti] || ["", "—"])[1], v.by, v.at];
           }),
           ...Object.entries(dayRounds).map(([k, v]) => {
             const [ai] = k.split("|");
             return [isAr ? (G_AREAS[+ai] || ["—"])[0] : (G_AREAS[+ai] || ["", "—"])[1], v.by, v.at];
           })],
    by: user.n,
  });

  return (
    <div>
      <SectionTitle isAr={isAr} icon={History} ar="السجلات اليومية" en="Daily records"
        sub={isAr ? "أرشيف كل يوم فعلي — الحرارة والنظافة والوجبات، بحسب من نفّذها ومتى"
                  : "The real archive of every day — temperature, cleaning and meals, by who and when"} />

      <Card className="mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Calendar size={16} style={{ color: T.vio }} />
          <label className="text-xs font-semibold" style={{ color: T.mute }}>{isAr ? "اليوم المعروض:" : "Viewing day:"}</label>
          <select value={date} onChange={e => setDate(e.target.value)} className="rounded-lg px-2 py-1.5 text-sm font-bold tabular" style={inputSty}>
            {dates.map(d => <option key={d} value={d}>{d}{d === D0 ? (isAr ? " (اليوم)" : " (today)") : ""}</option>)}
          </select>
          {isToday && <Chip tone="ok">{isAr ? "مباشر — يُحفظ الآن" : "Live — saving now"}</Chip>}
          <span className="text-xs ms-auto" style={{ color: T.mute }}>
            {isAr ? dates.length + " يوماً مسجَّلاً في القاعدة" : dates.length + " days recorded in the database"}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <KPI icon={Thermometer} tone={badReads.length ? "bad" : "ok"} label={isAr ? "قراءات الحرارة" : "Temp readings"}
          value={allReads.length} sub={badReads.length ? (isAr ? badReads.length + " خارج النطاق" : badReads.length + " out of range") : (isAr ? "كلها ضمن النطاق" : "all in range")} />
        <KPI icon={UtensilsCrossed} tone="brass" label={isAr ? "وجبات رُوقبت" : "Meals monitored"} value={dayMeals.length} />
        <KPI icon={ClipboardCheck} tone="vio" label={isAr ? "دورات المياه" : "Toilets"} value={toiletDone + "/" + toiletTotal} />
        <KPI icon={CheckCheck} tone="vio" label={isAr ? "الجولة العامة" : "General round"} value={roundDone + "/" + roundTotal} />
      </div>

      <Card className="mb-3" pad={false}>
        <div className="p-3 flex items-center justify-between flex-wrap gap-2" style={{ borderBottom: "1px solid " + T.line }}>
          <b className="text-sm" style={{ color: T.ink }}>{isAr ? "قراءات الحرارة" : "Temperature readings"}</b>
          {allReads.length > 0 && <Btn size="sm" kind="brass" onClick={printTemps}><Printer size={13} />{isAr ? "طباعة" : "Print"}</Btn>}
        </div>
        {!allReads.length && <Empty isAr={isAr} ar="لا توجد قراءات حرارة في هذا اليوم." en="No temperature readings on this day." />}
        {allReads.length > 0 && (
          <div className="overflow-x-auto hf-scroll">
            <table className="w-full text-sm" style={{ minWidth: 560 }}>
              <thead style={{ background: T.surf }}>
                <tr>{[isAr ? "الجهاز" : "Device", isAr ? "الوقت" : "Time", "°C", isAr ? "المسجِّل" : "By", isAr ? "إجراء تصحيحي" : "Corrective action"].map((h, i) => (
                  <th key={i} className="text-start px-3 py-2 text-xs font-bold" style={{ color: T.mute }}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {allReads.sort((a, b) => a.tm.localeCompare(b.tm)).map((x, i) => {
                  const bad = devState(x.d, x.v.t) !== "ok";
                  return (
                    <tr key={i} style={{ borderTop: "1px solid " + T.line, background: bad ? T.badSoft : undefined }}>
                      <td className="px-3 py-2 font-semibold" style={{ color: T.ink }}>{isAr ? x.d.ar : x.d.en}</td>
                      <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>{x.tm}</td>
                      <td className="px-3 py-2 tabular font-bold" style={{ color: bad ? T.bad : T.ink }}>{x.v.t}°</td>
                      <td className="px-3 py-2" style={{ color: T.ink2 }}>{x.v.by}</td>
                      <td className="px-3 py-2" style={{ color: T.mute }}>{x.v.ca || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {dayMeals.length > 0 && (
        <Card className="mb-3" pad={false}>
          <div className="p-3" style={{ borderBottom: "1px solid " + T.line }}>
            <b className="text-sm" style={{ color: T.ink }}>{isAr ? "حرارة الوجبات" : "Meal temperatures"}</b>
          </div>
          <div className="overflow-x-auto hf-scroll">
            <table className="w-full text-sm" style={{ minWidth: 480 }}>
              <thead style={{ background: T.surf }}>
                <tr>{[isAr ? "الوجبة" : "Meal", isAr ? "الاستلام" : "Delivery", isAr ? "إعادة التسخين" : "Reheats", isAr ? "قراءات العرض" : "Display"].map((h, i) => (
                  <th key={i} className="text-start px-3 py-2 text-xs font-bold" style={{ color: T.mute }}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {dayMeals.map((m, i) => (
                  <tr key={i} style={{ borderTop: "1px solid " + T.line }}>
                    <td className="px-3 py-2 font-semibold" style={{ color: T.ink }}>{m.n}</td>
                    <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>{m.del.tm} · {m.del.t == null ? "—" : m.del.t + "°"}</td>
                    <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>{(m.rh || []).length}</td>
                    <td className="px-3 py-2 tabular" style={{ color: T.ink2 }}>{(m.disp || []).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card pad={false}>
        <div className="p-3 flex items-center justify-between flex-wrap gap-2" style={{ borderBottom: "1px solid " + T.line }}>
          <b className="text-sm" style={{ color: T.ink }}>{isAr ? "ملخص النظافة" : "Cleaning summary"}</b>
          {(toiletDone + roundDone) > 0 && <Btn size="sm" kind="brass" onClick={printClean}><Printer size={13} />{isAr ? "طباعة" : "Print"}</Btn>}
        </div>
        {(toiletDone + roundDone) === 0
          ? <Empty isAr={isAr} ar="لا توجد علامات نظافة مسجَّلة في هذا اليوم." en="No cleaning ticks recorded on this day." />
          : (
            <div className="p-3 grid sm:grid-cols-2 gap-3">
              <HBars max={toiletTotal} color={T.vio} data={TOILETS.map((t, ti) => ({
                l: isAr ? t[0] : t[1],
                v: Object.keys(dayChecks).filter(k => k.startsWith(ti + "|")).length,
              }))} />
              <div>
                <div className="text-xs font-semibold mb-2" style={{ color: T.mute }}>{isAr ? "الجولة العامة — إنجاز كل جولة" : "General round — completion per round"}</div>
                <VBars color={T.brass} data={[["day", R_DAY], ["night", R_NIGHT]].flatMap(([sh, slots]) =>
                  slots.filter((_, i) => i % 4 === 0).map(tm => ({
                    l: tm,
                    v: G_AREAS.filter((_, ai) => dayRounds[ai + "|" + sh + "|" + tm] || dayRounds[ai + "|" + tm]).length,
                  })))} />
              </div>
            </div>
          )}
      </Card>
    </div>
  );
}

/* =============================== SHIFT HANDOVER ============================ */
function computeAutoHandover(warehouses, orders, linen, breaks, waste, shiftTag, D0) {
  const items = warehouses.flatMap(w => w.rows.filter(r => Array.isArray(r)).map(r => ({ w, r, st: calcStatus(r) })));
  const stockCounts = {
    exp: items.filter(x => x.st === "exp").length,
    soon: items.filter(x => x.st === "soon").length,
    low: items.filter(x => x.st === "low").length,
    out: items.filter(x => x.st === "out").length,
  };
  let orderDraftCount = 0;
  Object.values(orders || {}).forEach(lines => { orderDraftCount += Object.values(lines || {}).filter(v => v && v.q).length; });

  const linenAll = (linen.cats || []).map(c => {
    const rows = (linen.data || {})[c.id] || [];
    const bal = rows.reduce((a, x) => {
      if (Array.isArray(x)) return a + (x[1] || 0) - (x[2] || 0) + (x[3] || 0) - (x[4] || 0);
      return a + (x.am?.r || 0) + (x.pm?.r || 0) - (x.am?.u || 0) - (x.pm?.u || 0);
    }, 0);
    return { cat: c.ar, catEn: c.en, balance: bal };
  });

  const breakShift = (breaks || []).filter(b => b[0] === D0 && b[4] === shiftTag);
  const breakQty = breakShift.reduce((a, b) => a + (b[3] || 0), 0);

  const wasteShift = (waste || []).filter(w => w[0] === D0 && w[9] === shiftTag);
  const wasteQty = wasteShift.reduce((a, w) => a + (w[4] || 0), 0);

  return { stockCounts, orderDraftCount, linenAll, breakQty, breakCount: breakShift.length, wasteQty, wasteCount: wasteShift.length };
}

function HField({ draft, set, k, label, ph, rows = 2 }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{label}</label>
      {rows > 1
        ? <textarea rows={rows} value={draft[k]} onChange={e => set(k, e.target.value)} disabled={draft.submitted} placeholder={ph}
            className={inputCls} style={{ ...inputSty, opacity: draft.submitted ? .7 : 1 }} />
        : <input value={draft[k]} onChange={e => set(k, e.target.value)} disabled={draft.submitted} placeholder={ph}
            className={inputCls} style={{ ...inputSty, opacity: draft.submitted ? .7 : 1 }} />}
    </div>
  );
}

function VerifyToggle({ label, val, onToggle, disabled }) {
  return (
    <button onClick={onToggle} disabled={disabled}
      className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold w-full"
      style={{ background: val ? "#ECFDF5" : "#fff", border: "1px solid " + (val ? "#A7F3D0" : T.line), color: val ? "#047857" : T.ink2, opacity: disabled ? .75 : 1 }}>
      <span>{label}</span>
      {val ? <CheckCircle2 size={17} style={{ color: "#047857" }} /> : <XCircle size={17} style={{ color: T.mute }} />}
    </button>
  );
}

function HandoverShiftForm({ isAr, isMorning, rec, saveRec, warehouses, orders, linen, breaks, waste, user }) {
  const blank = { submitted: false, by: "", prn: "", at: "", snapshot: null,
    verifyRound: false, verifyTemp: false, verifyDeep: false, notes: "",
    cleaning: "", maintenance: "", guestsCount: "", guestsVip: "", complaints: "", flights: "", peak: "", keys: "" };
  const r = rec || blank;
  const [draft, setDraft] = useState(r);
  useEffect(() => { setDraft(r); }, [r.submitted, r.at]);
  const set = (k, v) => { const n = { ...draft, [k]: v }; setDraft(n); saveRec(n); };
  const shiftTag = isMorning ? "AM" : "PM";
  const D0 = opDay();
  const live = computeAutoHandover(warehouses, orders, linen, breaks, waste, shiftTag, D0);
  const view = draft.submitted && draft.snapshot ? draft.snapshot : live;

  const finish = () => {
    const snap = computeAutoHandover(warehouses, orders, linen, breaks, waste, shiftTag, D0);
    const n = { ...draft, submitted: true, by: user.n, prn: user.prn, at: nowHM() + " · " + todayISO(), snapshot: snap };
    setDraft(n); saveRec(n);
  };
  const reopen = () => { const n = { ...draft, submitted: false }; setDraft(n); saveRec(n); };

  const Icon = isMorning ? Sun : Moon;
  const tone = isMorning ? { c: T.brass, soft: T.brassSoft, txt: T.brassText, line: T.brassLine } : { c: T.vio, soft: T.vioSoft, txt: T.vioText, line: T.vioLine };

  return (
    <Card style={{ borderColor: tone.line }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <b className="text-sm flex items-center gap-1.5" style={{ color: T.ink }}>
          <Icon size={15} style={{ color: tone.c }} />{isMorning ? (isAr ? "تسليم الوردية الصباحية" : "AM shift handover") : (isAr ? "تسليم الوردية المسائية" : "PM shift handover")}
        </b>
        {draft.submitted
          ? <Chip tone="ok"><CheckCheck size={11} /> {isAr ? "سُلِّمت" : "handed over"} — {draft.by} · <span className="tabular">{draft.at}</span></Chip>
          : <Chip tone="warn">{isAr ? "مسودة قيد التعبئة" : "draft in progress"}</Chip>}
      </div>

      {/* AUTO sections — compact counts only, pulled live from the system */}
      <div className="space-y-2.5 mb-4">
        <div className="rounded-lg p-2.5" style={{ background: tone.soft }}>
          <div className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: tone.txt }}><Boxes size={12} />{isAr ? "حالة المخزون" : "Stock status"} <Chip tone="mut">{isAr ? "تلقائي" : "auto"}</Chip></div>
          <div className="grid grid-cols-4 gap-1.5">
            {[[isAr ? "منتهي" : "Expired", view.stockCounts.exp, "#7F1D1D"], [isAr ? "قريب الانتهاء" : "Near expiry", view.stockCounts.soon, "#9333EA"],
              [isAr ? "على وشك النفاد" : "About to run out", view.stockCounts.low, T.brass], [isAr ? "نفد تماماً" : "Fully out", view.stockCounts.out, T.bad]].map(([l, v, c], i) => (
              <div key={i} className="rounded-lg p-2 text-center" style={{ background: "#fff" }}>
                <div className="text-lg font-bold tabular" style={{ color: v > 0 ? c : T.mute }}>{v}</div>
                <div style={{ fontSize: 10, color: T.mute, lineHeight: 1.2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-2.5 flex items-center justify-between" style={{ background: T.surf }}>
          <span className="text-xs font-bold flex items-center gap-1" style={{ color: T.ink2 }}><ArrowDownToLine size={12} />{isAr ? "بنود الطلبية بالمسودة" : "Items in draft orders"} <Chip tone="mut">{isAr ? "تلقائي" : "auto"}</Chip></span>
          <span className="text-lg font-bold tabular" style={{ color: view.orderDraftCount > 0 ? T.vio : T.mute }}>{view.orderDraftCount}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg p-2.5" style={{ background: view.breakQty > 0 ? "#FFFBEB" : T.surf }}>
            <div className="text-xs font-bold mb-0.5 flex items-center gap-1" style={{ color: T.ink2 }}><Wine size={12} />{isAr ? "كسر هذه الوردية" : "Breakage this shift"} <Chip tone="mut">{isAr ? "تلقائي" : "auto"}</Chip></div>
            <div className="text-lg font-bold tabular" style={{ color: view.breakQty > 0 ? T.brassText : T.mute }}>{view.breakQty} <span className="text-xs font-normal" style={{ color: T.mute }}>({view.breakCount} {isAr ? "سجلاً" : "entries"})</span></div>
          </div>
          <div className="rounded-lg p-2.5" style={{ background: view.wasteQty > 0 ? "#FEF2F2" : T.surf }}>
            <div className="text-xs font-bold mb-0.5 flex items-center gap-1" style={{ color: T.ink2 }}><Trash2 size={12} />{isAr ? "هدر/إتلاف هذه الوردية" : "Waste/disposal this shift"} <Chip tone="mut">{isAr ? "تلقائي" : "auto"}</Chip></div>
            <div className="text-lg font-bold tabular" style={{ color: view.wasteQty > 0 ? T.bad : T.mute }}>{view.wasteQty} <span className="text-xs font-normal" style={{ color: T.mute }}>({view.wasteCount} {isAr ? "سجلاً" : "entries"})</span></div>
          </div>
        </div>

        <div className="rounded-lg p-2.5" style={{ background: T.vioSoft }}>
          <div className="text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: T.vioText }}><Shirt size={12} />{isAr ? "المفروشات — كل الأقسام" : "Linen — all categories"} <Chip tone="mut">{isAr ? "تلقائي" : "auto"}</Chip></div>
          {!view.linenAll.length ? <div className="text-xs" style={{ color: T.mute }}>{isAr ? "لا توجد أقسام مفروشات بعد" : "No linen categories yet"}</div>
            : <div className="flex flex-wrap gap-1.5">{view.linenAll.map((x, i) => (
                <span key={i} className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: "#fff", color: x.balance <= 0 ? T.bad : T.ink2 }}>
                  {isAr ? x.cat : x.catEn} <span className="tabular">({x.balance})</span>
                </span>
              ))}</div>}
        </div>
      </div>

      {/* Quick verification checks + notes */}
      <div className="rounded-lg p-2.5 mb-4" style={{ background: T.surf }}>
        <div className="text-xs font-bold mb-2" style={{ color: T.ink2 }}>{isAr ? "تحقّق سريع" : "Quick verification"}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
          <VerifyToggle disabled={draft.submitted} label={isAr ? "الجولة العامة" : "General round"} val={draft.verifyRound} onToggle={() => set("verifyRound", !draft.verifyRound)} />
          <VerifyToggle disabled={draft.submitted} label={isAr ? "الحرارة" : "Temperature"} val={draft.verifyTemp} onToggle={() => set("verifyTemp", !draft.verifyTemp)} />
          <VerifyToggle disabled={draft.submitted} label={isAr ? "التنظيف العميق" : "Deep cleaning"} val={draft.verifyDeep} onToggle={() => set("verifyDeep", !draft.verifyDeep)} />
        </div>
        <HField draft={draft} set={set} k="notes" label={isAr ? "ملاحظات" : "Notes"} ph={isAr ? "أي ملاحظة أخرى تخص هذه الوردية…" : ""} rows={2} />
      </div>

      {/* MANUAL sections */}
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <HField draft={draft} set={set} k="cleaning" label={isAr ? "مهام نظافة لم تكتمل من الوردية" : "Cleaning tasks not completed this shift"} ph={isAr ? "مثال: جولة 20:00 لم تكتمل — منطقة المطبخ" : ""} />
        <HField draft={draft} set={set} k="maintenance" label={isAr ? "أعطال الموقع وطلبات الصيانة المفتوحة" : "Site faults & open maintenance requests"} ph={isAr ? "تكييف / إضاءة / سباكة…" : ""} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "عدد الضيوف الحاليين" : "Current guest count"}</label>
            <input type="number" min="0" value={draft.guestsCount} onChange={e => set("guestsCount", e.target.value)} disabled={draft.submitted}
              className={inputCls + " tabular"} style={{ ...inputSty, opacity: draft.submitted ? .7 : 1 }} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "ضيف VIP / حساس" : "VIP / sensitive guest"}</label>
            <input value={draft.guestsVip} onChange={e => set("guestsVip", e.target.value)} disabled={draft.submitted}
              className={inputCls} style={{ ...inputSty, opacity: draft.submitted ? .7 : 1 }} />
          </div>
        </div>
        <HField draft={draft} set={set} k="complaints" label={isAr ? "شكاوى لم تُحل بعد" : "Unresolved complaints"} rows={1} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <HField draft={draft} set={set} k="flights" label={isAr ? "رحلات متوقعة تؤثر على الازدحام" : "Expected flights affecting crowding"} ph={isAr ? "مغادرة / تأخير…" : ""} />
        <HField draft={draft} set={set} k="peak" label={isAr ? "ذروة متوقعة يجب الاستعداد لها" : "Expected peak to prepare for"} rows={1} />
      </div>

      <HField draft={draft} set={set} k="keys" label={isAr ? "الأمانات والمفاتيح — تسليم، مفقودات، أمانات بالحوزة" : "Keys & valuables — handover, lost & found, items held"} />

      <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: "1px solid " + T.line }}>
        {!draft.submitted ? (
          <Btn kind="solid" onClick={finish}><CheckCheck size={14} />{isAr ? "إنهاء وتسليم الوردية" : "Finish & hand over"}</Btn>
        ) : (
          <Btn onClick={reopen}><RotateCcw size={14} />{isAr ? "تراجع عن تسليم الوردية" : "Undo handover"}</Btn>
        )}
        <span className="text-xs" style={{ color: T.mute }}>
          {isAr ? "التراجع يعيد الأعداد التلقائية إلى القيم الحيّة الحالية بدل اللقطة المجمَّدة — بلا حذف أي سجل."
                : "Undo returns the auto counts to the live current values instead of the frozen snapshot — no record is ever deleted."}
        </span>
      </div>
    </Card>
  );
}

function HandoverScreen({ isAr, handover, setHandover, warehouses, orders, linen, breaks, waste, user, print }) {
  const D0 = opDay();
  const rec = handover[D0] || {};
  const saveRec = (which, v) => setHandover({ ...handover, [D0]: { ...rec, [which]: v } });

  const printShift = (which) => {
    const r = rec[which]; if (!r) return;
    const shiftTag = which === "am" ? "AM" : "PM";
    const view = r.submitted && r.snapshot ? r.snapshot : computeAutoHandover(warehouses, orders, linen, breaks, waste, shiftTag, D0);
    print({
      ar: (which === "am" ? "تسليم الوردية الصباحية" : "تسليم الوردية المسائية") + " — " + D0,
      en: (which === "am" ? "AM" : "PM") + " Shift Handover — " + D0,
      meta: [[isAr ? "التاريخ" : "Date", D0], [isAr ? "سلّمها" : "Handed over by", (r.by || user.n) + (r.prn ? " · " + r.prn : "")],
             [isAr ? "الوقت" : "Time", r.at || nowHM()]],
      sections: [
        { title: isAr ? "حالة المخزون" : "Stock status",
          cols: [isAr ? "منتهي" : "Expired", isAr ? "قريب الانتهاء" : "Near expiry", isAr ? "على وشك النفاد" : "About to run out", isAr ? "نفد تماماً" : "Fully out"],
          rows: [[view.stockCounts.exp, view.stockCounts.soon, view.stockCounts.low, view.stockCounts.out]] },
        { title: isAr ? "بنود الطلبية بالمسودة" : "Items in draft orders", text: String(view.orderDraftCount) },
        { title: isAr ? "المفروشات — كل الأقسام" : "Linen — all categories",
          cols: [isAr ? "القسم" : "Category", isAr ? "الرصيد" : "Balance"],
          rows: view.linenAll.map(x => [isAr ? x.cat : x.catEn, x.balance]) },
        { title: isAr ? "كسر هذه الوردية" : "Breakage this shift", text: view.breakQty + " (" + view.breakCount + " " + (isAr ? "سجلاً" : "entries") + ")" },
        { title: isAr ? "هدر/إتلاف هذه الوردية" : "Waste/disposal this shift", text: view.wasteQty + " (" + view.wasteCount + " " + (isAr ? "سجلاً" : "entries") + ")" },
        { title: isAr ? "تحقّق سريع" : "Quick verification",
          cols: [isAr ? "الجولة العامة" : "General round", isAr ? "الحرارة" : "Temperature", isAr ? "التنظيف العميق" : "Deep cleaning"],
          rows: [[r.verifyRound ? "✓" : "✗", r.verifyTemp ? "✓" : "✗", r.verifyDeep ? "✓" : "✗"]] },
        { title: isAr ? "ملاحظات" : "Notes", text: r.notes || "—" },
        { title: isAr ? "مهام نظافة لم تكتمل" : "Incomplete cleaning tasks", text: r.cleaning || "—" },
        { title: isAr ? "أعطال وصيانة مفتوحة" : "Faults & open maintenance", text: r.maintenance || "—" },
        { title: isAr ? "الضيوف" : "Guests", text: (isAr ? "العدد: " : "Count: ") + (r.guestsCount || "—") + " — " + (isAr ? "VIP: " : "VIP: ") + (r.guestsVip || "—") },
        { title: isAr ? "شكاوى غير محلولة" : "Unresolved complaints", text: r.complaints || "—" },
        { title: isAr ? "الرحلات المتوقعة" : "Expected flights", text: r.flights || "—" },
        { title: isAr ? "الذروة المتوقعة" : "Expected peak", text: r.peak || "—" },
        { title: isAr ? "الأمانات والمفاتيح" : "Keys & valuables", text: r.keys || "—" },
      ],
      by: r.by || user.n,
    });
  };

  return (
    <div>
      <SectionTitle isAr={isAr} icon={Handshake} ar="تسليم الوردية" en="Shift handover"
        sub={isAr ? "الاستثناءات التي تحتاج انتباه الوردية القادمة فوراً — كل ١٢ ساعة" : "The exceptions the next shift needs to know immediately — every 12 hours"} />

      <div className="space-y-3">
        <div>
          <HandoverShiftForm isAr={isAr} isMorning rec={rec.am} saveRec={v => saveRec("am", v)} warehouses={warehouses} orders={orders} linen={linen} breaks={breaks} waste={waste} user={user} />
          {rec.am && <div className="text-end mt-1.5"><Btn size="sm" kind="brass" onClick={() => printShift("am")}><Printer size={13} />{isAr ? "طباعة الصباحية" : "Print AM"}</Btn></div>}
        </div>
        <div>
          <HandoverShiftForm isAr={isAr} isMorning={false} rec={rec.pm} saveRec={v => saveRec("pm", v)} warehouses={warehouses} orders={orders} linen={linen} breaks={breaks} waste={waste} user={user} />
          {rec.pm && <div className="text-end mt-1.5"><Btn size="sm" kind="brass" onClick={() => printShift("pm")}><Printer size={13} />{isAr ? "طباعة المسائية" : "Print PM"}</Btn></div>}
        </div>
      </div>
    </div>
  );
}

/* =============================== STAFF ROSTER ============================== */
const arDateLong = (iso) => {
  try { return new Intl.DateTimeFormat("ar", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date(iso + "T00:00:00")); }
  catch { return iso; }
};
const enDateLong = (iso) => {
  try { return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso + "T00:00:00")); }
  catch { return iso; }
};
const dayAbbr = (iso, isAr) => {
  try { return new Intl.DateTimeFormat(isAr ? "ar" : "en", { weekday: "short" }).format(new Date(iso + "T00:00:00")); }
  catch { return iso.slice(5); }
};
const addDaysISO = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

function RosterScreen({ isAr, roster, setRoster, user, print, canEdit }) {
  const positions = roster.positions && roster.positions.length ? roster.positions : ROSTER_SEED.positions;
  const names = roster.names || ROSTER_SEED.names;
  const weekStart = roster.weekStart || todayISO();
  const days = Array.from({ length: 7 }, (_, i) => addDaysISO(weekStart, i));
  const data = roster.data || {};
  const cellOf = (date, pos) => (data[date] && data[date][pos]) || [];

  const [pick, setPick] = useState(null); // { date, pos }
  const [manual, setManual] = useState("");
  const [renaming, setRenaming] = useState(null); // { date, pos, idx, val }
  const [posForm, setPosForm] = useState(false);
  const [newPos, setNewPos] = useState("");
  const [delPos, setDelPos] = useState(null);
  const [nameForm, setNameForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [shareDate, setShareDate] = useState(todayISO());

  const setCell = (date, pos, arr) => setRoster({ ...roster, positions, names, weekStart,
    data: { ...data, [date]: { ...(data[date] || {}), [pos]: arr } } });
  const addName = (date, pos, n) => { if (!n.trim()) return; const cur = cellOf(date, pos); if (cur.includes(n.trim())) return; setCell(date, pos, [...cur, n.trim()]); };
  const removeName = (date, pos, n) => setCell(date, pos, cellOf(date, pos).filter(x => x !== n));
  const renameAt = (date, pos, idx, val) => { if (!val.trim()) return; const cur = cellOf(date, pos).slice(); cur[idx] = val.trim(); setCell(date, pos, cur); };

  const addPosition = () => { if (!newPos.trim() || positions.includes(newPos.trim())) return;
    setRoster({ ...roster, positions: [...positions, newPos.trim()], names, weekStart, data }); setNewPos(""); setPosForm(false); };
  const removePosition = (pos) => {
    const nd = {}; Object.entries(data).forEach(([d, m]) => { const c = { ...m }; delete c[pos]; nd[d] = c; });
    setRoster({ ...roster, positions: positions.filter(p => p !== pos), names, weekStart, data: nd }); setDelPos(null);
  };
  const addMasterName = () => { if (!newName.trim() || names.includes(newName.trim().toUpperCase())) return;
    setRoster({ ...roster, positions, names: [...names, newName.trim().toUpperCase()], weekStart, data }); setNewName(""); setNameForm(false); };
  const removeMasterName = (n) => setRoster({ ...roster, positions, names: names.filter(x => x !== n), weekStart, data });

  const affectedCount = (pos) => Object.values(data).reduce((a, m) => a + ((m[pos] || []).length ? 1 : 0), 0);

  const shareLines = positions.map(pos => { const ns = cellOf(shareDate, pos); return ns.length ? pos + ": " + ns.join(" / ") : null; }).filter(Boolean);
  const shareMsg = "📅 " + arDateLong(shareDate) + "\n\n" + shareLines.join("\n");
  const copyShare = () => { if (navigator.clipboard) navigator.clipboard.writeText(shareMsg); };

  const printWeek = () => print({
    ar: "جدول الموظفين — الأسبوع", en: "Staff Roster — Week",
    meta: [[isAr ? "من" : "From", days[0]], [isAr ? "إلى" : "To", days[6]]],
    cols: [isAr ? "الموقع" : "Position", ...days.map(d => dayAbbr(d, isAr) + " " + d.slice(5))],
    rows: positions.map(pos => [pos, ...days.map(d => cellOf(d, pos).join(" / ") || "—")]),
    by: user.n,
  });

  return (
    <div>
      <SectionTitle isAr={isAr} icon={CalendarDays} ar="جداول الموظفين" en="Staff roster"
        sub={isAr ? "من يعمل في كل موقع، لكل يوم — يظهر تلقائياً في لوحة التشغيل" : "Who's working each position, per day — appears automatically on the dashboard"}
        right={<Btn kind="brass" size="sm" onClick={printWeek}><Printer size={14} />{isAr ? "طباعة الأسبوع" : "Print week"}</Btn>} />

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <label className="text-xs font-semibold" style={{ color: T.mute }}>{isAr ? "بداية الأسبوع:" : "Week start:"}</label>
        <input type="date" value={weekStart} disabled={!canEdit} onChange={e => setRoster({ ...roster, positions, names, weekStart: e.target.value, data })}
          className="rounded-lg px-2 py-1.5 text-sm tabular font-bold" style={inputSty} />
        <Btn size="sm" onClick={() => setRoster({ ...roster, positions, names, weekStart: addDaysISO(weekStart, -7), data })}>
          <ArrowRight size={13} />{isAr ? "الأسبوع السابق" : "Previous"}
        </Btn>
        <Btn size="sm" onClick={() => setRoster({ ...roster, positions, names, weekStart: addDaysISO(weekStart, 7), data })}>
          {isAr ? "الأسبوع التالي" : "Next"}<ArrowLeft size={13} />
        </Btn>
        <Btn size="sm" kind="brass" onClick={() => setRoster({ ...roster, positions, names, weekStart: todayISO(), data })}>{isAr ? "هذا الأسبوع" : "This week"}</Btn>
        <span className="text-xs" style={{ color: T.mute }}>{isAr ? "غيّر تاريخ البداية فقط — بقية الأيام تُحسب تلقائياً" : "Change the start date only — the rest follow automatically"}</span>
      </div>

      <Card pad={false} className="mb-4">
        <div className="overflow-x-auto hf-scroll">
          <table className="text-sm" style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 980 }}>
            <thead>
              <tr>
                <th className="text-start px-3 py-2 sticky font-bold text-xs" style={{ color: T.mute, background: "#fff", insetInlineStart: 0, minWidth: 170, borderBottom: "1px solid " + T.line }}>
                  {isAr ? "الموقع" : "Position"}
                </th>
                {days.map(d => (
                  <th key={d} className="px-2 py-2 font-bold text-xs" style={{ color: d === todayISO() ? T.vioText : T.mute, background: d === todayISO() ? T.vioSoft : undefined, minWidth: 128, borderBottom: "1px solid " + T.line }}>
                    <div className="tabular">{d.slice(5)}</div>
                    <div>{dayAbbr(d, isAr)}{d === todayISO() ? " · " + (isAr ? "اليوم" : "today") : ""}</div>
                  </th>
                ))}
                {canEdit && <th style={{ minWidth: 34 }}></th>}
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => (
                <tr key={pos}>
                  <td className="px-3 py-2 sticky font-semibold text-xs" style={{ color: T.ink, background: "#fff", insetInlineStart: 0, borderTop: "1px solid " + T.line }}>
                    {pos}
                  </td>
                  {days.map(d => {
                    const ns = cellOf(d, pos);
                    return (
                      <td key={d} className="px-1.5 py-1.5 align-top" style={{ borderTop: "1px solid " + T.line, background: d === todayISO() ? "#FCFBFF" : undefined }}>
                        <div className="flex flex-wrap gap-1">
                          {ns.map((n, idx) => {
                            const isR = renaming && renaming.date === d && renaming.pos === pos && renaming.idx === idx;
                            if (isR) return (
                              <span key={idx} className="inline-flex items-center gap-0.5 rounded-full pe-0.5 ps-1.5 py-0.5" style={{ background: T.vioSoft }}>
                                <input autoFocus value={renaming.val} onChange={e => setRenaming({ ...renaming, val: e.target.value })}
                                  onKeyDown={e => e.key === "Enter" && (renameAt(d, pos, idx, renaming.val), setRenaming(null))}
                                  className="text-xs font-semibold tabular" style={{ width: 64, border: "none", outline: "none", background: "transparent", color: T.ink }} />
                                <button onClick={() => { renameAt(d, pos, idx, renaming.val); setRenaming(null); }} style={{ color: T.ok }}><CheckCircle2 size={12} /></button>
                                <button onClick={() => setRenaming(null)} style={{ color: T.mute }}><X size={10} /></button>
                              </span>
                            );
                            return (
                              <span key={idx} className="inline-flex items-center gap-0.5 rounded-full pe-0.5 ps-2 py-0.5 text-xs font-semibold" style={{ background: T.surf, color: T.ink }}>
                                {n}
                                {canEdit && <button onClick={() => setRenaming({ date: d, pos, idx, val: n })} title={isAr ? "تعديل" : "Edit"} style={{ color: T.vio }}><Pencil size={10} /></button>}
                                {canEdit && <button onClick={() => removeName(d, pos, n)} style={{ color: T.bad }}><X size={10} /></button>}
                              </span>
                            );
                          })}
                          {canEdit && (
                            <button onClick={() => { setPick({ date: d, pos }); setManual(""); }}
                              className="rounded-full p-0.5" style={{ background: T.brassSoft, color: T.brassText }}><Plus size={11} /></button>
                          )}
                          {!ns.length && !canEdit && <span className="text-xs" style={{ color: T.mute }}>—</span>}
                        </div>
                      </td>
                    );
                  })}
                  {canEdit && (
                    <td className="px-1 align-top" style={{ borderTop: "1px solid " + T.line }}>
                      <button onClick={() => setDelPos(pos)} title={isAr ? "حذف الموقع" : "Delete position"} className="rounded p-1" style={{ background: T.badSoft, color: T.bad }}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {canEdit && (
          <div className="p-2.5 flex items-center gap-2 flex-wrap" style={{ borderTop: "1px solid " + T.line }}>
            {posForm ? (
              <>
                <input autoFocus value={newPos} onChange={e => setNewPos(e.target.value)} placeholder={isAr ? "اسم الموقع الجديد" : "New position name"}
                  onKeyDown={e => e.key === "Enter" && addPosition()} className={inputCls} style={{ ...inputSty, maxWidth: 220 }} />
                <Btn size="sm" kind="solid" disabled={!newPos.trim()} onClick={addPosition}><CheckCircle2 size={13} />{isAr ? "إضافة" : "Add"}</Btn>
                <Btn size="sm" onClick={() => setPosForm(false)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
              </>
            ) : (
              <Btn size="sm" kind="brass" onClick={() => setPosForm(true)}><Plus size={13} />{isAr ? "إضافة موقع عمل" : "Add position"}</Btn>
            )}
          </div>
        )}
      </Card>

      {canEdit && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <b className="text-sm flex items-center gap-1.5" style={{ color: T.ink }}><Users size={14} style={{ color: T.vio }} />{isAr ? "قائمة أسماء الفريق" : "Team name list"}</b>
            {nameForm ? (
              <div className="flex items-center gap-1.5">
                <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addMasterName()}
                  className={inputCls} style={{ ...inputSty, width: 150 }} placeholder={isAr ? "اسم" : "Name"} />
                <Btn size="sm" kind="solid" disabled={!newName.trim()} onClick={addMasterName}><CheckCircle2 size={13} /></Btn>
                <Btn size="sm" onClick={() => setNameForm(false)}><X size={13} /></Btn>
              </div>
            ) : <Btn size="sm" kind="brass" onClick={() => setNameForm(true)}><Plus size={13} />{isAr ? "إضافة اسم" : "Add name"}</Btn>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {names.map(n => (
              <span key={n} className="inline-flex items-center gap-1 rounded-full pe-1 ps-2.5 py-1 text-xs font-semibold" style={{ background: T.surf, color: T.ink2 }}>
                {n}<button onClick={() => removeMasterName(n)} style={{ color: T.bad }}><X size={10} /></button>
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ borderColor: T.brassLine }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Share2 size={15} style={{ color: T.brass }} />
          <b className="text-sm" style={{ color: T.ink }}>{isAr ? "مشاركة جاهزة للواتساب" : "WhatsApp-ready share"}</b>
          <input type="date" value={shareDate} onChange={e => setShareDate(e.target.value)} className="rounded-lg px-2 py-1 text-xs tabular font-bold ms-auto" style={inputSty} />
        </div>
        <div className="rounded-lg p-3 text-sm whitespace-pre-wrap tabular" style={{ background: T.surf, color: T.ink2, direction: "rtl", fontFamily: "inherit" }}>
          {shareLines.length ? shareMsg : (isAr ? "لا توجد تعيينات في هذا التاريخ بعد." : "No assignments on this date yet.")}
        </div>
        {shareLines.length > 0 && (
          <Btn size="sm" kind="brass" className="mt-2.5" onClick={copyShare}><Copy size={13} />{isAr ? "نسخ الرسالة" : "Copy message"}</Btn>
        )}
      </Card>

      {pick && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 380 }}>
            <div className="flex items-center justify-between mb-3">
              <b style={{ color: T.ink }}>
                {isAr ? "إضافة إلى — " : "Add to — "}
                <span className="font-semibold" style={{ color: T.mute }}>{pick.pos}</span>
                <span className="tabular font-semibold" style={{ color: T.mute }}> · {pick.date}</span>
              </b>
              <button onClick={() => setPick(null)}><X size={18} style={{ color: T.mute }} /></button>
            </div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "من قائمة الأسماء" : "From name list"}</label>
            <div className="flex flex-wrap gap-1.5 mb-3" style={{ maxHeight: 160, overflowY: "auto" }}>
              {names.filter(n => !cellOf(pick.date, pick.pos).includes(n)).map(n => (
                <button key={n} onClick={() => { addName(pick.date, pick.pos, n); setPick(null); }}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: T.surf, color: T.ink2, border: "1px solid " + T.line }}>
                  {n}
                </button>
              ))}
            </div>
            <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? "أو اسم يدوي" : "Or a manual name"}</label>
            <div className="flex gap-2">
              <input autoFocus value={manual} onChange={e => setManual(e.target.value)} className={inputCls} style={inputSty}
                placeholder={isAr ? "اسم الموظف" : "Staff name"} onKeyDown={e => e.key === "Enter" && manual.trim() && (addName(pick.date, pick.pos, manual), setPick(null))} />
              <Btn kind="solid" disabled={!manual.trim()} onClick={() => { addName(pick.date, pick.pos, manual); setPick(null); }}>
                <Plus size={14} />{isAr ? "إضافة" : "Add"}
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {delPos && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
          <Card className="w-full" style={{ maxWidth: 360 }}>
            <b className="block mb-1" style={{ color: T.ink }}>{isAr ? "حذف الموقع؟" : "Delete this position?"}</b>
            <div className="text-sm mb-3" style={{ color: T.ink2 }}>{delPos}</div>
            <div className="text-xs mb-4 rounded-lg p-2" style={{ background: T.badSoft, color: T.bad }}>
              {isAr ? "ستُحذف تعييناته في " + affectedCount(delPos) + " يوماً محفوظاً." : "Its assignments across " + affectedCount(delPos) + " saved days will be deleted."}
            </div>
            <div className="flex gap-2">
              <button onClick={() => removePosition(delPos)} className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-white" style={{ background: T.bad }}>
                <Trash2 size={14} />{isAr ? "حذف" : "Delete"}</button>
              <Btn onClick={() => setDelPos(null)}>{isAr ? "إلغاء" : "Cancel"}</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ============================ STAFF ALLOCATION ============================
   Station rotation, two shifts a day (AM / PM), same 10 stations and the
   same capacities (12 slots) in each shift. Every staff member in the
   rotation passes through all stations, nobody is placed on an OFF day, and
   each station is filled to its capacity — Roaming included, exactly 1.
   More than 12 on a shift → the extra staff are left with no station and
   listed on their own. Fewer than 12 → one person at every station first,
   then the 2nd at Entrance, then the 2nd at Executive Dining.
   A manual edit freezes that whole day (every current placement becomes a
   pin) and then moves the one person — nobody else is swapped. A pin is
   day:shift:sn → station index, or -1 for "no station".
   Stored in the cloud doc "alloc" as
   { "YYYY-MM": { staff:[{sn,n,pos,inc,off:[days],pm:[days]}], done:[days], over:{"d:sh:sn":loc} } }
============================================================================ */
const AL_STATIONS = [
  { code: "ENT", en: "Entrance",         ar: "المدخل",           cap: 2, c: "#2F5BE8" },
  { code: "EBR", en: "Executive Bar",    ar: "البار التنفيذي",    cap: 1, c: "#7A3FD6" },
  { code: "EDN", en: "Executive Dining", ar: "المطعم التنفيذي",   cap: 2, c: "#D5297A" },
  { code: "GDN", en: "Garden Lounge",    ar: "صالة الحديقة",      cap: 1, c: "#1F9D55" },
  { code: "CAF", en: "Bar Café",         ar: "بار الكافيه",       cap: 1, c: "#E0601A" },
  { code: "BUF", en: "Buffet",           ar: "البوفيه",           cap: 1, c: "#A8760A" },
  { code: "SDN", en: "Social Dining",    ar: "المطعم الاجتماعي",  cap: 1, c: "#0E93B7" },
  { code: "SLG", en: "Social Lounge",    ar: "الصالة الاجتماعية", cap: 1, c: "#0F7D78" },
  { code: "BEV", en: "Beverage Corner",  ar: "ركن المشروبات",     cap: 1, c: "#C4262E" },
  { code: "ROM", en: "Roaming",          ar: "متجول",             cap: 1, c: "#4B5170" },
];
const AL_N = AL_STATIONS.length;
const AL_SLOTS = AL_STATIONS.reduce((a, s) => a + s.cap, 0);
const AL_ROTATE = ["BARISTA", "WAITER", "WAITRESS"];
const AL_SHIFTS = { M: { ar: "صباح", en: "Morning", sAr: "ص", sEn: "AM" }, E: { ar: "مساء", en: "Evening", sAr: "م", sEn: "PM" } };
const alShLbl = (sh, isAr, short) => { const S = AL_SHIFTS[sh]; return short ? (isAr ? S.sAr : S.sEn) : (isAr ? S.ar : S.en); };
/* Seed = HAFAWA_LOUNGE_SEPTEMBER_2026_ROSTER_V3 (all 07:00–19:00 → AM); OFF days known only for 6–12 Sep */
const AL_SEED_MONTH = "2026-09";
const AL_SEED_DONE = [6, 7, 8, 9, 10, 11, 12];
const AL_SEED_STAFF = [
  [1, "ABDULAZIZ BIN MOREBAH", "TEAM LEADER", [10, 11]],
  [2, "NUJOOD ALMUTAIRI", "TEAM LEADER", [6, 12]],
  [3, "AHMED ALHAMOUD", "TEAM LEADER", [7, 8]],
  [4, "MARIA OTILLA", "BARISTA", [7]],
  [5, "JENN MAIQUEZ", "BARISTA", [12]],
  [6, "LIANDRO ABIAS", "BARISTA", [8]],
  [7, "DANILO DELA CRUZ", "WAITER", [9]],
  [8, "MARK TALUCAD", "WAITER", [6]],
  [9, "MICHAEL JORDAN BALONES", "WAITER", [9]],
  [10, "MIKE ENOC", "WAITER", [12]],
  [11, "JOHN KENNETH JUCUTAN", "WAITER", [7]],
  [12, "AMBROSIO DELA CERNA", "WAITER", [11]],
  [13, "MARK ANGELO BALBIN", "WAITER", [12]],
  [14, "MARIEL AQUINO", "WAITRESS", [11]],
  [15, "RACHEL CAGUITLA", "WAITRESS", [10]],
  [16, "KHYZEL MORIN", "WAITRESS", [8]],
  [17, "QUASIM MOHAMMED", "SOUS CHEF", [6]],
  [18, "SHORUQ ALHARBI", "CDP", [9, 10]],
  [19, "NIROJ", "CDP", [8]],
  [20, "MOHAMMAD AYAZ", "CDP", [7]],
  [21, "ASIM ALSAEED", "CDP", [11, 12]],
  [22, "JOHN PAUL BELICARIO", "PUBLIC ATTENDANT", [8]],
  [23, "SHERWIN SALADO", "PUBLIC ATTENDANT", [6]],
  [24, "JAKE CAIBOG", "PUBLIC ATTENDANT", [9]],
  [25, "CRISTINA CALACDAY", "PUBLIC ATTENDANT", [7]],
  [26, "ZUCHET MENGUILLO", "PUBLIC ATTENDANT", [10]],
  [27, "MOHAMMED SOJIB MIA", "PUBLIC ATTENDANT", [11]],
  [28, "AJAYA TAMANG", "PUBLIC ATTENDANT", [12]],
  [29, "SURESH THAPA", "PUBLIC ATTENDANT", [10]],
];
const alDaysIn = (m) => new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate();
const alISO = (m, d) => m + "-" + String(d).padStart(2, "0");
const alShiftMonth = (m, n) => { const d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + n, 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); };
const alMonthLabel = (m, isAr) => {
  try { return new Intl.DateTimeFormat(isAr ? "ar" : "en-GB", { month: "long", year: "numeric" }).format(new Date(+m.slice(0, 4), +m.slice(5, 7) - 1, 1)); }
  catch { return m; }
};
const alPrevDoc = (alloc, month) => { const ks = Object.keys(alloc || {}).filter(k => k < month).sort(); return ks.length ? alloc[ks[ks.length - 1]] : null; };
/* a month with no saved doc: carry the latest earlier month's staff list (OFF/PM cleared), or the roster seed */
const alSeed = (month, prev) => ({
  staff: prev
    ? prev.staff.map(s => ({ ...s, off: [], pm: [] }))
    : AL_SEED_STAFF.map(([sn, n, pos, off]) => ({ sn, n, pos, inc: AL_ROTATE.includes(pos), off: month === AL_SEED_MONTH ? off : [], pm: [] })),
  done: !prev && month === AL_SEED_MONTH ? AL_SEED_DONE : [],
  over: {},
});
const alKey = (d, sh, sn) => d + ":" + sh + ":" + sn;
const alSortNum = (a) => [...new Set(a)].sort((x, y) => x - y);

/* Hungarian algorithm — minimum-cost perfect assignment on an n×n matrix; returns column for each row */
function alHungarian(cost) {
  const n = cost.length; if (!n) return [];
  const INF = Number.MAX_SAFE_INTEGER;
  const u = new Array(n + 1).fill(0), v = new Array(n + 1).fill(0), p = new Array(n + 1).fill(0), way = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i; let j0 = 0;
    const minv = new Array(n + 1).fill(INF), used = new Array(n + 1).fill(false);
    do {
      used[j0] = true; const i0 = p[j0]; let delta = INF, j1 = 0;
      for (let j = 1; j <= n; j++) if (!used[j]) {
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= n; j++) { if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta; }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const ans = new Array(n);
  for (let j = 1; j <= n; j++) if (p[j]) ans[p[j] - 1] = j - 1;
  return ans;
}
/* staff: rotation members [{sn, off:[days], pm:[days]}] in list order; over: manual pins.
   Shift by shift (AM then PM, day after day): pinned staff are placed first, then a min-cost
   assignment for the rest where cost = visits scaled by 200/capacity (a 2-person station is
   expected twice as often) + forward distance from the station after the previous working shift
   (keeps list order when possible) + 60 if it would repeat yesterday's station */
function alCompute(staff, days, over) {
  over = over || {};
  const visits = {}, last = {}, lastDay = {}, start = {}, grid = {}, nost = {};
  staff.forEach((s, i) => { visits[s.sn] = new Array(AL_N).fill(0); last[s.sn] = null; lastDay[s.sn] = 0; nost[s.sn] = 0; start[s.sn] = i % AL_N; grid[s.sn] = new Array(days + 1).fill(null); });
  const maxCap = Math.max(...AL_STATIONS.map(s => s.cap));
  const runShift = (d, sh, pool) => {
    const locStaff = AL_STATIONS.map(() => []), manual = [], noStation = [];
    /* loc === null → working this shift but with no station (more staff than slots, or moved out by hand) */
    const place = (s, loc, man) => {
      grid[s.sn][d] = { loc, sh, man: !!man };
      if (loc === null) { nost[s.sn]++; noStation.push(s.sn); }
      else { visits[s.sn][loc]++; last[s.sn] = loc; lastDay[s.sn] = d; locStaff[loc].push(s.sn); }
      if (man) manual.push(s.sn);
    };
    const free = [];
    pool.forEach(s => { const o = over[alKey(d, sh, s.sn)];
      if (o === -1) place(s, null, true);
      else if (Number.isInteger(o) && o >= 0 && o < AL_N) place(s, o, true);
      else free.push(s); });
    const rem = AL_STATIONS.map((S, l) => Math.max(0, S.cap - locStaff[l].length));
    const order = [];
    for (let k = 1; k <= maxCap; k++) for (let l = 0; l < AL_N; l++) if (rem[l] >= k) order.push(l);
    const D = free.length, slots = order.slice(0, Math.min(D, order.length));
    for (let e = order.length; e < D; e++) slots.push(null); /* no station left — never stacked on Roaming */
    if (D) {
      const cost = free.map(s => {
        const v = visits[s.sn], lp = last[s.sn], pref = lp === null ? start[s.sn] : (lp + 1) % AL_N, yest = lastDay[s.sn] === d - 1;
        return slots.map(loc => loc === null ? nost[s.sn] * 300 + 900 /* rotate who waits without a station */
          : Math.round(v[loc] * 200 / AL_STATIONS[loc].cap) + ((loc - pref + AL_N) % AL_N) + (yest && lp === loc ? 60 : 0));
      });
      const assign = alHungarian(cost);
      free.forEach((s, i) => place(s, slots[assign[i]], false));
    }
    const short = [], uncovered = [], overCap = [];
    for (let l = 0; l < AL_N; l++) {
      const have = locStaff[l].length, need = AL_STATIONS[l].cap;
      if (!have) uncovered.push(l);
      if (have < need) short.push({ loc: l, have, need });
      if (have > need) overCap.push({ loc: l, have, need });
    }
    return { locStaff, manual, noStation, short, uncovered, overCap, onDuty: pool.map(s => s.sn) };
  };
  const byDay = [null];
  for (let d = 1; d <= days; d++) {
    const offList = [], am = [], pm = [];
    staff.forEach(s => { if ((s.off || []).includes(d)) offList.push(s); else if ((s.pm || []).includes(d)) pm.push(s); else am.push(s); });
    const M = runShift(d, "M", am), E = runShift(d, "E", pm);
    offList.forEach(s => { grid[s.sn][d] = "OFF"; });
    byDay.push({ off: offList.map(s => s.sn), M, E });
  }
  return { grid, byDay, visits };
}

function AlCode({ l, man }) {
  return <span className="inline-block rounded-md px-1.5 py-0.5 text-xs font-bold tabular text-white" style={{ background: AL_STATIONS[l].c, minWidth: 38, textAlign: "center", boxShadow: man ? "0 0 0 2px " + T.brass : undefined }}>{AL_STATIONS[l].code}</span>;
}
function AlLegend({ isAr }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs mb-3" style={{ color: T.ink2 }}>
      {AL_STATIONS.map((S, l) => (
        <span key={S.code} className="inline-flex items-center gap-1.5"><AlCode l={l} />{isAr ? S.ar : S.en}{S.cap > 1 && <b>×{S.cap}</b>}</span>
      ))}
    </div>
  );
}
function AlDayTh({ month, d, done, isAr, today, onClick }) {
  const iso = alISO(month, d), is = iso === today;
  return (
    <th onClick={onClick} className={"px-1 py-1.5 font-bold text-xs" + (onClick ? " cursor-pointer select-none" : "")}
      title={onClick ? (isAr ? "اضغط لتأكيد إدخال شيفتات وأوفات هذا اليوم" : "Tap to confirm this day's shifts/OFF entry") : undefined}
      style={{ minWidth: 42, color: !done ? T.warn : is ? T.vioText : T.mute, background: !done ? T.warnSoft : is ? T.vioSoft : undefined, borderBottom: "1px solid " + T.line }}>
      <div className="tabular">{d}</div>
      <div style={{ fontWeight: 500 }}>{dayAbbr(iso, isAr)}</div>
      {onClick && <div className="flex justify-center mt-0.5">{done ? <CheckCircle2 size={11} style={{ color: T.ok }} /> : <span style={{ fontSize: 9 }}>?</span>}</div>}
    </th>
  );
}
function AlStaffTh({ s, dim, children }) {
  return (
    <th className="px-2.5 py-1.5 sticky text-start" style={{ background: "#fff", insetInlineStart: 0, minWidth: 168, maxWidth: 210, borderTop: "1px solid " + T.line, borderInlineEnd: "2px solid " + T.line, opacity: dim ? .5 : 1 }}>
      {children || <div className="text-xs font-bold leading-tight" style={{ color: T.ink, whiteSpace: "normal" }}>{s.n}</div>}
      <div className="text-xs" style={{ color: T.mute, fontSize: 10 }}>{s.pos}</div>
    </th>
  );
}
function AlGridTh({ label }) {
  return <th className="px-2.5 py-2 sticky text-start text-xs font-bold" style={{ background: "#fff", insetInlineStart: 0, minWidth: 168, color: T.mute, borderBottom: "1px solid " + T.line, borderInlineEnd: "2px solid " + T.line }}>{label}</th>;
}
/* manual-edit picker: move a staff member to another station, pin/unpin, switch shift, or set OFF */
function AlPick({ isAr, pick, name, cur, man, isOff, noSt, counts, dayPinned, onClose, onStation, onNoStation, onAuto, onReset, onShift, onOff, onWork }) {
  const other = pick.sh === "M" ? "E" : "M";
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(20,18,40,.5)" }}>
      <Card className="w-full" style={{ maxWidth: 400 }}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <b className="block text-sm" style={{ color: T.ink }}>{name}</b>
            <span className="text-xs tabular" style={{ color: T.mute }}>{pick.iso} · {isOff ? (isAr ? "أوف" : "OFF") : alShLbl(pick.sh, isAr)}</span>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: T.mute }} /></button>
        </div>
        {isOff ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs mb-1" style={{ color: T.mute }}>{isAr ? "إلغاء الأوف وإدراجه في شيفت:" : "Cancel the OFF and put on shift:"}</div>
            <Btn kind="soft" onClick={() => onWork("M")}><Sun size={14} />{alShLbl("M", isAr)}</Btn>
            <Btn kind="soft" onClick={() => onWork("E")}><Moon size={14} />{alShLbl("E", isAr)}</Btn>
          </div>
        ) : (
          <>
            <div className="text-xs font-semibold mb-1.5" style={{ color: T.mute }}>{isAr ? "نقل إلى الموقع:" : "Move to station:"}</div>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {AL_STATIONS.map((S, l) => (
                <button key={S.code} onClick={() => onStation(l)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-start"
                  style={{ background: l === cur ? T.vioSoft : T.surf, border: "1px solid " + (l === cur ? T.vioLine : T.line) }}>
                  <span className="rounded-sm shrink-0" style={{ width: 10, height: 10, background: S.c }} />
                  <span className="text-xs font-semibold flex-1 truncate" style={{ color: T.ink }}>{isAr ? S.ar : S.en}</span>
                  <span className="text-xs tabular" style={{ color: counts[l] > S.cap ? T.bad : T.mute }}>{counts[l]}/{S.cap}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {!noSt && <Btn onClick={onNoStation}><X size={14} />{isAr ? "حذف من الموقع — يبقى في الشيفت بدون موقع" : "Remove from station — on shift, no station"}</Btn>}
              {man && <Btn onClick={onAuto}><RotateCcw size={14} />{isAr ? "إلغاء تثبيت هذا الموظف" : "Unpin this person"}</Btn>}
              <Btn onClick={() => onShift(other)}><ArrowLeftRight size={14} />{isAr ? "نقل إلى شيفت " + alShLbl(other, isAr) : "Move to " + alShLbl(other, isAr) + " shift"}</Btn>
              <Btn onClick={onOff}><Moon size={14} />{isAr ? "أوف في هذا اليوم" : "OFF on this day"}</Btn>
              {dayPinned && <Btn kind="ghost" onClick={onReset}><RotateCcw size={14} />{isAr ? "إعادة هذا اليوم كله للتوزيع التلقائي" : "Reset this whole day to automatic"}</Btn>}
            </div>
            <div className="text-xs mt-2" style={{ color: T.mute }}>
              {isAr ? "النقل يحرّك هذا الموظف وحده — بقية المواقع تبقى كما هي، والموقع الذي تركه يبقى فارغاً حتى تضع فيه أحداً بنفسك."
                    : "A move shifts this person only — everyone else stays put, and the station left behind stays empty until you fill it yourself."}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function AllocScreen({ isAr, alloc, setAlloc, user, print, canEdit }) {
  const today = todayISO(), curMonth = today.slice(0, 7);
  const [month, setMonth] = useState(() => (alloc[curMonth] || curMonth >= AL_SEED_MONTH) ? curMonth : AL_SEED_MONTH);
  const [tab, setTab] = useState("day");
  const [sh, setSh] = useState("M");
  const [day, setDay] = useState(() => (month === curMonth ? +today.slice(8) : 1));
  const [pick, setPick] = useState(null); // { d, sh, sn, iso }
  const [newName, setNewName] = useState("");
  const [newPos, setNewPos] = useState("WAITER");
  const [del, setDel] = useState(null);
  const days = alDaysIn(month);
  const dayList = useMemo(() => Array.from({ length: days }, (_, i) => i + 1), [days]);
  const doc = useMemo(() => alloc[month] || alSeed(month, alPrevDoc(alloc, month)), [alloc, month]);
  const staff = doc.staff || [], done = doc.done || [], over = doc.over || {};
  const byId = useMemo(() => { const o = {}; staff.forEach(s => { o[s.sn] = s; }); return o; }, [staff]);
  const rot = useMemo(() => staff.filter(s => s.inc), [staff]);
  const posList = useMemo(() => { const o = []; staff.forEach(s => { if (s.pos && !o.includes(s.pos)) o.push(s.pos); }); AL_ROTATE.forEach(x => { if (!o.includes(x)) o.push(x); }); return o; }, [staff]);
  const res = useMemo(() => alCompute(rot, days, over), [rot, days, over]);
  const setDoc = (next) => setAlloc({ ...alloc, [month]: next });
  const patchStaff = (sn, fn) => setDoc({ ...doc, staff: staff.map(s => s.sn === sn ? fn(s) : s) });
  const goMonth = (n) => { const m = alShiftMonth(month, n); setMonth(m); setDay(m === curMonth ? +today.slice(8) : 1); setPick(null); };
  /* Shifts tab: a cell cycles AM → PM → OFF → AM */
  const cycle = (sn, d) => patchStaff(sn, s => {
    const off = s.off || [], pm = s.pm || [];
    if (off.includes(d)) return { ...s, off: off.filter(x => x !== d) };
    if (pm.includes(d)) return { ...s, pm: pm.filter(x => x !== d), off: alSortNum([...off, d]) };
    return { ...s, pm: alSortNum([...pm, d]) };
  });
  const toggleInc = (sn) => patchStaff(sn, s => ({ ...s, inc: !s.inc }));
  const toggleDone = (d) => setDoc({ ...doc, done: done.includes(d) ? done.filter(x => x !== d) : alSortNum([...done, d]) });
  const isDone = (d) => done.includes(d);
  /* manual edits from the picker */
  /* Any manual edit first freezes that whole day: every current placement becomes a pin, so moving
     one person never re-shuffles anyone else and never back-fills the station they left. */
  const freezeDay = (o, d) => { rot.forEach(s => { const g = (res.grid[s.sn] || [])[d]; if (g && g !== "OFF") o[alKey(d, g.sh, s.sn)] = g.loc === null ? -1 : g.loc; }); return o; };
  const pinTo = (p, loc) => { const o = freezeDay({ ...over }, p.d); o[alKey(p.d, p.sh, p.sn)] = loc; setDoc({ ...doc, over: o }); setPick(null); };
  const setNoStation = (p) => { const o = freezeDay({ ...over }, p.d); o[alKey(p.d, p.sh, p.sn)] = -1; setDoc({ ...doc, over: o }); setPick(null); };
  const unpin = (p) => { const o = { ...over }; delete o[alKey(p.d, p.sh, p.sn)]; setDoc({ ...doc, over: o }); setPick(null); };
  const resetDay = (d) => { const o = { ...over }; Object.keys(o).forEach(k => { if (k.split(":")[0] === String(d)) delete o[k]; }); setDoc({ ...doc, over: o }); setPick(null); };
  const dayHasPins = (d) => Object.keys(over).some(k => k.split(":")[0] === String(d));
  const moveShift = (p, to) => { const o = freezeDay({ ...over }, p.d); delete o[alKey(p.d, "M", p.sn)]; delete o[alKey(p.d, "E", p.sn)];
    setDoc({ ...doc, over: o, staff: staff.map(s => s.sn !== p.sn ? s
    : { ...s, off: (s.off || []).filter(x => x !== p.d), pm: to === "E" ? alSortNum([...(s.pm || []), p.d]) : (s.pm || []).filter(x => x !== p.d) }) }); setPick(null); };
  const setOff = (p) => { const o = freezeDay({ ...over }, p.d); delete o[alKey(p.d, "M", p.sn)]; delete o[alKey(p.d, "E", p.sn)];
    setDoc({ ...doc, over: o, staff: staff.map(s => s.sn !== p.sn ? s : { ...s, off: alSortNum([...(s.off || []), p.d]), pm: (s.pm || []).filter(x => x !== p.d) }) }); setPick(null); };
  /* add / remove people — a new name goes straight into the rotation */
  const addStaff = () => {
    const n = newName.trim(); if (!n) return;
    const sn = staff.reduce((m, x) => Math.max(m, x.sn), 0) + 1;
    const next = staff.slice(); let at = -1;
    for (let i = 0; i < next.length; i++) if (next[i].pos === newPos) at = i;
    next.splice(at < 0 ? next.length : at + 1, 0, { sn, n, pos: newPos, inc: true, off: [], pm: [] });
    setDoc({ ...doc, staff: next }); setNewName("");
  };
  const removeStaff = (sn) => { const o = { ...over }; Object.keys(o).forEach(k => { if (k.split(":")[2] === String(sn)) delete o[k]; });
    setDoc({ ...doc, over: o, staff: staff.filter(x => x.sn !== sn) }); setDel(null); setPick(null); };
  const openPick = (d, shf, sn) => { if (canEdit) setPick({ d, sh: shf, sn, iso: alISO(month, d) }); };

  const dSafe = Math.min(Math.max(1, day), days), iso = alISO(month, dSafe), bd = res.byDay[dSafe], board = bd[sh];
  const nameOf = (sn) => (byId[sn] || {}).n || "";
  const printDay = () => {
    const rowsOf = (k) => {
      const r = AL_STATIONS.map((S, l) => [alShLbl(k, isAr), S.en + (isAr ? " — " + S.ar : ""), bd[k].locStaff[l].length + "/" + S.cap, bd[k].locStaff[l].map(nameOf).join(" / ") || "—"]);
      if (bd[k].noStation.length) r.push([alShLbl(k, isAr), isAr ? "No station — بدون موقع" : "No station", String(bd[k].noStation.length), bd[k].noStation.map(nameOf).join(" / ")]);
      return r;
    };
    print({
      k: "alloc", ar: "توزيع المواقع — " + arDateLong(iso), en: "Staff allocation — " + enDateLong(iso),
      meta: [[isAr ? "التاريخ" : "Date", iso], [alShLbl("M", isAr), String(bd.M.onDuty.length)], [alShLbl("E", isAr), String(bd.E.onDuty.length)],
             [isAr ? "أوف" : "OFF", bd.off.map(nameOf).join(" / ") || "—"]],
      cols: [isAr ? "الشيفت" : "Shift", isAr ? "الموقع" : "Station", isAr ? "العدد" : "Count", isAr ? "الموظفون" : "Staff"],
      rows: [...rowsOf("M"), ...(bd.E.onDuty.length ? rowsOf("E") : [[alShLbl("E", isAr), isAr ? "لا أحد مسجّل في هذا الشيفت" : "Nobody on this shift", "—", "—"]])],
      by: user.n,
    });
  };

  const TABS = [["day", "اليوم", "Day"], ["month", "الشهر", "Month"], ["off", "الشيفتات والأوفات", "Shifts & OFF"], ["sum", "الملخص", "Summary"]];
  const noteSty = (tone) => ({ background: TONE[tone].background, color: TONE[tone].color, border: TONE[tone].border });
  const pickInfo = pick && (() => {
    const g = (res.grid[pick.sn] || [])[pick.d], off = g === "OFF" || !byId[pick.sn] || !byId[pick.sn].inc;
    return { cur: g && g !== "OFF" ? g.loc : null, man: !!(g && g !== "OFF" && g.man), isOff: off,
      noSt: !off && !!g && g !== "OFF" && g.loc === null, counts: res.byDay[pick.d][pick.sh].locStaff.map(a => a.length), pinned: dayHasPins(pick.d) };
  })();

  return (
    <div>
      <SectionTitle isAr={isAr} icon={MapPin} ar="توزيع المواقع" en="Staff allocation"
        sub={isAr ? "شيفت صباح وشيفت مساء، 10 مواقع (12 مكاناً لكل شيفت) مع مراعاة الأوفات — تلقائي مع إمكانية التعديل اليدوي" : "Morning and evening shifts, 10 stations (12 slots per shift), never on an OFF day — automatic with manual edits"}
        right={tab === "day" && <Btn kind="brass" size="sm" onClick={printDay}><Printer size={14} />{isAr ? "طباعة اليوم" : "Print day"}</Btn>} />

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Btn size="sm" onClick={() => goMonth(-1)}><ArrowRight size={13} />{isAr ? "الشهر السابق" : "Previous"}</Btn>
        <b className="text-sm tabular px-1" style={{ color: T.ink }}>{alMonthLabel(month, isAr)}</b>
        <Btn size="sm" onClick={() => goMonth(1)}>{isAr ? "الشهر التالي" : "Next"}<ArrowLeft size={13} /></Btn>
        <span className="text-xs" style={{ color: T.mute }}>{rot.length} {isAr ? "في التدوير" : "in rotation"} · {AL_SLOTS} {isAr ? "مكاناً/شيفت" : "slots/shift"}</span>
      </div>

      <div className="flex gap-1.5 mb-3 flex-wrap">
        {TABS.map(([k, ar, en]) => <Btn key={k} size="sm" kind={tab === k ? "soft" : "ghost"} onClick={() => setTab(k)}>{isAr ? ar : en}</Btn>)}
      </div>

      {!rot.length && (
        <div className="rounded-lg p-3 text-sm mb-3" style={noteSty("bad")}>
          {isAr ? "لا يوجد موظفون في التدوير — فعّل الأسماء من تبويب الشيفتات والأوفات." : "Nobody is in the rotation — tick names in the Shifts & OFF tab."}
        </div>
      )}

      {tab === "day" && (
        <div>
          <div className="flex gap-1.5 overflow-x-auto hf-scroll pb-2 mb-2">
            {dayList.map(d => {
              const on = d === dSafe, ok = isDone(d);
              return (
                <button key={d} onClick={() => setDay(d)} className="shrink-0 rounded-lg px-2 py-1 text-xs font-bold tabular"
                  style={{ minWidth: 42, background: on ? T.ink : "#fff", color: on ? "#fff" : T.ink, border: (ok ? "1px solid " : "1px dashed ") + (on ? T.ink : ok ? T.line : T.warn) }}>
                  <div>{d}</div><div style={{ fontWeight: 500, fontSize: 10, color: on ? "rgba(255,255,255,.7)" : T.mute }}>{dayAbbr(alISO(month, d), isAr)}</div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <b className="text-base" style={{ color: T.ink }}>{isAr ? arDateLong(iso) : enDateLong(iso)}</b>
            {iso === today && <Chip tone="vio">{isAr ? "اليوم" : "today"}</Chip>}
            <Chip tone="mut">{bd.off.length} {isAr ? "أوف" : "off"}</Chip>
          </div>
          <div className="flex gap-1.5 mb-3">
            {["M", "E"].map(k => (
              <Btn key={k} kind={sh === k ? "solid" : "ghost"} size="sm" onClick={() => setSh(k)}>
                {k === "M" ? <Sun size={14} /> : <Moon size={14} />}{alShLbl(k, isAr)} · {bd[k].onDuty.length}
              </Btn>
            ))}
          </div>
          {!isDone(dSafe) && (
            <div className="rounded-lg p-2.5 text-xs mb-2" style={noteSty("warn")}>
              {isAr ? "شيفتات وأوفات هذا اليوم غير مؤكدة بعد — يُعامل الجميع كعاملين صباحاً حتى تُدخل وتؤكد اليوم من تبويب الشيفتات والأوفات."
                    : "Shifts and OFF days for this date are not confirmed yet — everyone is treated as working the morning shift until you enter them and confirm the day in the Shifts & OFF tab."}
            </div>
          )}
          {rot.length > 0 && !board.onDuty.length && (
            <div className="rounded-lg p-2.5 text-xs mb-2" style={noteSty("mut")}>
              {isAr ? "لا أحد مسجّل في شيفت " + alShLbl(sh, isAr) + " في هذا اليوم — حدد الشيفتات من تبويب الشيفتات والأوفات، أو اضغط اسماً في شيفت " + alShLbl(sh === "M" ? "E" : "M", isAr) + " وانقله."
                    : "Nobody is on the " + alShLbl(sh, isAr) + " shift on this day — set shifts in the Shifts & OFF tab, or tap a name on the " + alShLbl(sh === "M" ? "E" : "M", isAr) + " shift and move it."}
            </div>
          )}
          {board.onDuty.length > 0 && board.short.length > 0 && (
            <div className="rounded-lg p-2.5 text-xs mb-2" style={noteSty(board.uncovered.length ? "bad" : "warn")}>
              {board.onDuty.length} {isAr ? "على الشيفت لـ" : "on duty for"} {AL_SLOTS} {isAr ? "مكاناً — نقص:" : "slots — short:"} {board.short.map(x => (isAr ? AL_STATIONS[x.loc].ar : AL_STATIONS[x.loc].en) + " " + x.have + "/" + x.need).join("، ")}
            </div>
          )}
          {board.overCap.length > 0 && (
            <div className="rounded-lg p-2.5 text-xs mb-2" style={noteSty("vio")}>
              {isAr ? "أكثر من السعة:" : "Over capacity:"} {board.overCap.map(x => (isAr ? AL_STATIONS[x.loc].ar : AL_STATIONS[x.loc].en) + " " + x.have + "/" + x.need).join("، ")}
            </div>
          )}
          {dayHasPins(dSafe) && canEdit && (
            <div className="rounded-lg p-2.5 text-xs mb-2 flex items-center gap-2 flex-wrap" style={noteSty("brass")}>
              <Pencil size={12} />
              <span className="flex-1">{isAr ? "هذا اليوم مثبّت يدوياً — لن يتغير ترتيبه تلقائياً." : "This day is pinned manually — its layout will not change automatically."}</span>
              <Btn size="sm" kind="ghost" onClick={() => resetDay(dSafe)}><RotateCcw size={13} />{isAr ? "إعادة اليوم للتوزيع التلقائي" : "Reset day to automatic"}</Btn>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AL_STATIONS.map((S, l) => {
              const list = board.locStaff[l], emptyShift = !board.onDuty.length, shortS = list.length < S.cap, overS = list.length > S.cap;
              const tone = emptyShift ? "mut" : !list.length ? "bad" : shortS ? "warn" : overS ? "vio" : null;
              const bgOf = { bad: T.badSoft, warn: T.warnSoft, vio: T.vioSoft }, lnOf = { bad: T.badLine, warn: T.warnLine, vio: T.vioLine }, cOf = { bad: T.bad, warn: T.warn, vio: T.vioText };
              return (
                <div key={S.code} className="flex rounded-xl overflow-hidden" style={{ background: bgOf[tone] || T.card, border: "1px solid " + (lnOf[tone] || T.line), opacity: emptyShift ? .7 : 1 }}>
                  <div style={{ width: 8, flex: "0 0 8px", background: S.c }} />
                  <div className="p-2.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <b className="text-sm" style={{ color: T.ink }}>{isAr ? S.ar : S.en}</b>
                      <span className="text-xs tabular" style={{ color: T.mute }}>{S.code}</span>
                      <span className="text-xs font-bold tabular ms-auto" style={{ color: cOf[tone] || T.mute }}>{list.length}/{S.cap}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {list.length ? list.map(sn => {
                        const man = board.manual.includes(sn);
                        return (
                          <span key={sn} className="inline-flex items-center rounded-lg overflow-hidden"
                            style={{ background: man ? T.brassSoft : T.surf, border: "1px solid " + (man ? T.brassLine : "transparent") }}>
                            <button onClick={() => openPick(dSafe, sh, sn)} disabled={!canEdit} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-start" style={{ color: T.ink }}>
                              {man && <Pencil size={10} style={{ color: T.brassText }} />}
                              {nameOf(sn)}<span style={{ color: T.mute, fontWeight: 500, fontSize: 10 }}>· {(byId[sn] || {}).pos}</span>
                            </button>
                            {canEdit && (
                              <button onClick={() => setNoStation({ d: dSafe, sh, sn })} className="px-1.5 py-1" title={isAr ? "حذف من الموقع" : "Remove from station"} style={{ color: T.mute, borderInlineStart: "1px solid " + T.line }}>
                                <X size={11} />
                              </button>
                            )}
                          </span>
                        );
                      }) : <span className="text-xs font-bold" style={{ color: emptyShift ? T.mute : T.bad }}>{emptyShift ? "—" : (isAr ? "لا أحد" : "No staff assigned")}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {board.noStation.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-bold mb-1.5" style={{ color: T.mute }}>{isAr ? "بدون موقع في هذا الشيفت" : "No station on this shift"} ({board.noStation.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {board.noStation.map(sn => (
                  <button key={sn} onClick={() => openPick(dSafe, sh, sn)} disabled={!canEdit} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
                    style={{ background: T.surf, color: T.ink, border: "1px dashed " + T.line }}>
                    {board.manual.includes(sn) && <Pencil size={10} style={{ color: T.brassText }} />}
                    {nameOf(sn)}<span style={{ color: T.mute, fontWeight: 500, fontSize: 10 }}>· {(byId[sn] || {}).pos}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs mt-1" style={{ color: T.mute }}>
                {isAr ? "اضغط الاسم لوضعه في أي موقع." : "Tap a name to place it at any station."}
              </div>
            </div>
          )}
          <div className="mt-3">
            <div className="text-xs font-bold mb-1.5" style={{ color: T.mute }}>{isAr ? "أوف في هذا اليوم" : "OFF on this day"}</div>
            <div className="flex flex-wrap gap-1.5">
              {bd.off.length ? bd.off.map(sn => (
                <button key={sn} onClick={() => openPick(dSafe, sh, sn)} disabled={!canEdit} className="rounded-lg px-2 py-1 text-xs font-semibold text-white" style={{ background: T.ink2 }}>{nameOf(sn)}</button>
              )) : <span className="text-xs" style={{ color: T.mute }}>{isAr ? "لا أحد" : "None"}</span>}
            </div>
          </div>
          {canEdit && (
            <div className="text-xs mt-3 flex items-center gap-1.5" style={{ color: T.mute }}>
              <Pencil size={11} style={{ color: T.brassText }} />
              {isAr ? "اضغط أي اسم لنقله إلى موقع آخر أو تغيير شيفته أو جعله أوف، و ✕ لحذفه من الموقع. النقل يحرّك هذا الموظف وحده ولا يستبدله بأحد — والموقع الذي تركه يبقى فارغاً حتى تملأه بنفسك."
                    : "Tap any name to move it to another station, switch its shift or set it OFF, and ✕ to remove it from the station. A move shifts that person only — nobody replaces them and the station they left stays empty until you fill it."}
            </div>
          )}
        </div>
      )}

      {tab === "month" && (
        <div>
          <AlLegend isAr={isAr} />
          <Card pad={false}>
            <div className="overflow-x-auto hf-scroll">
              <table className="text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <AlGridTh label={isAr ? "الموظف" : "Staff"} />
                    {dayList.map(d => <AlDayTh key={d} month={month} d={d} done={isDone(d)} isAr={isAr} today={today} />)}
                  </tr>
                </thead>
                <tbody>
                  {rot.map(s => (
                    <tr key={s.sn}>
                      <AlStaffTh s={s} />
                      {dayList.map(d => {
                        const v = res.grid[s.sn][d], off = v === "OFF";
                        return (
                          <td key={d} onClick={() => openPick(d, off ? sh : v.sh, s.sn)} className={"px-1 py-1 text-center" + (canEdit ? " cursor-pointer" : "")}
                            style={{ borderTop: "1px solid " + T.line, background: off ? T.ink2 : !isDone(d) ? "#FFFDF7" : undefined }}>
                            {off ? <span className="text-xs font-bold text-white">OFF</span> : (
                              <>
                                {v.loc === null
                                  ? <span className="inline-block rounded px-1 text-xs font-bold" style={{ color: T.mute, background: v.man ? T.brassSoft : undefined, border: "1px solid " + (v.man ? T.brassLine : "transparent") }}>—</span>
                                  : <AlCode l={v.loc} man={v.man} />}
                                <div className="tabular" style={{ fontSize: 9, fontWeight: 700, color: v.sh === "E" ? T.vioText : T.mute, marginTop: 2 }}>{alShLbl(v.sh, isAr, true)}</div>
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="text-xs mt-2" style={{ color: T.mute }}>
            {isAr ? "الأعمدة الكهرمانية: شيفتات ذلك اليوم غير مؤكدة. الإطار الذهبي حول الرمز: تثبيت يدوي. " + alShLbl("M", isAr, true) + " = صباح، " + alShLbl("E", isAr, true) + " = مساء." + (canEdit ? " اضغط أي خلية لتعديلها." : "")
                  : "Amber columns: that day's shifts are not confirmed. Gold frame around a code: pinned manually. AM = morning, PM = evening." + (canEdit ? " Tap any cell to edit it." : "")}
          </div>
        </div>
      )}

      {tab === "off" && (
        <div>
          <div className="rounded-lg p-2.5 text-xs mb-3" style={noteSty("vio")}>
            {isAr ? "اضغط الخلية لتبديلها: صباح ← مساء ← أوف. اضغط رقم اليوم في الرأس لتأكيد أن شيفتات ذلك اليوم مُدخلة. علّم الاسم لإدخاله في تدوير المواقع، و ✕ لحذفه. أيام 6–12 سبتمبر من روستر V3 (كلها صباح 07:00–19:00)."
                  : "Tap a cell to cycle it: AM → PM → OFF. Tap the day number in the header to confirm that day's entry. Tick a name to include it in the station rotation, ✕ to delete it. 6–12 Sep come from roster V3 (all morning 07:00–19:00)."}
            {!canEdit && <b className="block mt-1">{isAr ? "عرض فقط — التعديل للتشغيل والمدير." : "View only — editing is for operations and managers."}</b>}
          </div>
          {canEdit && (
            <Card className="mb-3">
              <div className="text-xs font-bold mb-2" style={{ color: T.mute }}>{isAr ? "إضافة موظف" : "Add a staff member"}</div>
              <div className="flex gap-2 flex-wrap items-center">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={isAr ? "اكتب الاسم" : "Type the name"}
                  onKeyDown={(e) => { if (e.key === "Enter") addStaff(); }}
                  className="rounded-lg px-2.5 py-2 text-sm flex-1" style={{ minWidth: 160, background: T.surf, border: "1px solid " + T.line, color: T.ink }} />
                <select value={newPos} onChange={(e) => setNewPos(e.target.value)} className="rounded-lg px-2 py-2 text-sm"
                  style={{ background: T.surf, border: "1px solid " + T.line, color: T.ink }}>
                  {posList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Btn kind="solid" size="sm" onClick={addStaff} disabled={!newName.trim()}><Plus size={14} />{isAr ? "إضافة" : "Add"}</Btn>
              </div>
              <div className="text-xs mt-2" style={{ color: T.mute }}>
                {isAr ? "الاسم الجديد يدخل تدوير المواقع فوراً بكل الأيام صباحاً — عدّل شيفتاته وأوفاته من الجدول تحت."
                      : "A new name joins the station rotation right away with every day on the morning shift — set its shifts and OFF days in the grid below."}
              </div>
            </Card>
          )}
          <Card pad={false}>
            <div className="overflow-x-auto hf-scroll">
              <table className="text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <AlGridTh label={isAr ? "الموظف · في التدوير" : "Staff · in rotation"} />
                    {dayList.map(d => <AlDayTh key={d} month={month} d={d} done={isDone(d)} isAr={isAr} today={today} onClick={canEdit ? () => toggleDone(d) : undefined} />)}
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => {
                    const grp = i === 0 || staff[i - 1].pos !== s.pos;
                    return (
                      <Fragment key={s.sn}>
                        {grp && (
                          <tr><th colSpan={days + 1} className="px-2.5 py-1 text-start text-xs font-bold sticky" style={{ background: T.surf, color: T.mute, insetInlineStart: 0, letterSpacing: ".08em" }}>{s.pos}</th></tr>
                        )}
                        <tr>
                          <AlStaffTh s={s} dim={!s.inc}>
                            <div className="flex items-center gap-1.5">
                              <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                <input type="checkbox" checked={!!s.inc} disabled={!canEdit} onChange={() => toggleInc(s.sn)} style={{ width: 16, height: 16, accentColor: T.vio }} />
                                <span className="text-xs font-bold leading-tight" style={{ color: T.ink, whiteSpace: "normal" }}>{s.n}</span>
                              </label>
                              {canEdit && (
                                <span className="flex items-center gap-1 shrink-0">
                                  {del === s.sn && <button onClick={() => removeStaff(s.sn)} className="rounded px-1.5 py-0.5 text-xs font-bold" style={{ background: T.bad, color: "#fff" }}>{isAr ? "حذف" : "Delete"}</button>}
                                  <button onClick={() => setDel(del === s.sn ? null : s.sn)} className="rounded p-1" title={isAr ? "حذف الموظف" : "Delete staff"} style={{ color: del === s.sn ? T.bad : T.mute }}><X size={13} /></button>
                                </span>
                              )}
                            </div>
                          </AlStaffTh>
                          {dayList.map(d => {
                            const off = (s.off || []).includes(d), pm = !off && (s.pm || []).includes(d);
                            return (
                              <td key={d} onClick={canEdit ? () => cycle(s.sn, d) : undefined}
                                className={"text-center tabular text-xs font-bold select-none" + (canEdit ? " cursor-pointer" : "")}
                                style={{ minWidth: 42, height: 36, borderTop: "1px solid " + T.line, opacity: s.inc ? 1 : .5,
                                  background: off ? T.ink2 : pm ? T.vioSoft : !isDone(d) ? "#FFFAEE" : "#F5F4F9", color: off ? "#fff" : pm ? T.vioText : T.mute }}>
                                {off ? "OFF" : alShLbl(pm ? "E" : "M", isAr, true)}
                              </td>
                            );
                          })}
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "sum" && (
        <div>
          <div className="text-xs mb-2" style={{ color: T.mute }}>
            {isAr ? "عدد الأيام التي يقف فيها كل موظف في كل موقع خلال الشهر (الشيفتان معاً). المواقع ×2 تحتاج شخصين فتُزار ضعف غيرها. الصفر الأحمر = موقع لم يُزر."
                  : "Days each staff member is placed at each station this month (both shifts). ×2 stations need two people so they are visited about twice as often. Red 0 = station never visited."}
          </div>
          <Card pad={false}>
            <div className="overflow-x-auto hf-scroll">
              <table className="text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <AlGridTh label={isAr ? "الموظف" : "Staff"} />
                    {AL_STATIONS.map((S, l) => <th key={S.code} className="px-1.5 py-1.5" style={{ borderBottom: "1px solid " + T.line }}><AlCode l={l} />{S.cap > 1 && <div className="text-xs" style={{ color: T.mute }}>×{S.cap}</div>}</th>)}
                    {[alShLbl("M", isAr, true), alShLbl("E", isAr, true), isAr ? "بدون" : "None", isAr ? "أوف" : "OFF"].map(h => (
                      <th key={h} className="px-2 py-1.5 text-xs font-bold" style={{ color: T.mute, borderBottom: "1px solid " + T.line }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rot.map(s => {
                    const v = res.visits[s.sn]; let am = 0, pm = 0, nos = 0;
                    for (let d = 1; d <= days; d++) { const g = res.grid[s.sn][d]; if (g && g !== "OFF") { if (g.sh === "E") pm++; else am++; if (g.loc === null) nos++; } }
                    return (
                      <tr key={s.sn}>
                        <AlStaffTh s={s} />
                        {v.map((c, l) => <td key={l} className="px-1.5 py-1.5 text-center tabular text-sm" style={{ borderTop: "1px solid " + T.line, background: c === 0 ? T.badSoft : undefined, color: c === 0 ? T.bad : T.ink, fontWeight: c === 0 ? 700 : 500 }}>{c}</td>)}
                        <td className="px-2 py-1.5 text-center tabular font-bold" style={{ borderTop: "1px solid " + T.line, color: T.ink }}>{am}</td>
                        <td className="px-2 py-1.5 text-center tabular font-bold" style={{ borderTop: "1px solid " + T.line, color: T.vioText }}>{pm}</td>
                        <td className="px-2 py-1.5 text-center tabular" style={{ borderTop: "1px solid " + T.line, color: nos ? T.warn : T.mute, fontWeight: nos ? 700 : 500 }}>{nos}</td>
                        <td className="px-2 py-1.5 text-center tabular" style={{ borderTop: "1px solid " + T.line, color: T.mute }}>{days - am - pm}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="mt-3"><AlLegend isAr={isAr} /></div>
        </div>
      )}

      {pick && pickInfo && (
        <AlPick isAr={isAr} pick={pick} name={nameOf(pick.sn)} cur={pickInfo.cur} man={pickInfo.man} isOff={pickInfo.isOff}
          noSt={pickInfo.noSt} counts={pickInfo.counts} dayPinned={pickInfo.pinned}
          onClose={() => setPick(null)} onStation={(l) => pinTo(pick, l)} onNoStation={() => setNoStation(pick)} onAuto={() => unpin(pick)}
          onReset={() => resetDay(pick.d)} onShift={(to) => moveShift(pick, to)} onOff={() => setOff(pick)} onWork={(to) => moveShift(pick, to)} />
      )}
    </div>
  );
}

/* ================================ ARCHIVE ================================= */
function ArchiveScreen({ isAr, archive, print, user }) {
  const K = { temp: [Thermometer, "brass"], clean: [ClipboardCheck, "vio"], order: [Boxes, "ok"], linen: [Shirt, "warn"] };
  return (
    <div>
      <SectionTitle isAr={isAr} icon={FileText} ar="الأرشيف والتقارير" en="Archive & reports"
        sub={isAr ? "كل نموذج مُقفل يُحفظ بتاريخه ومنفّذه — قابل للطباعة أو التصدير في أي وقت"
                  : "Every closed form is stored with its date and executor — printable or exportable at any time"} />
      <Card pad={false}>
        {!archive.length && <Empty isAr={isAr} ar="لا توجد مستندات مؤرشفة بعد — أي طباعة تُسجَّل هنا تلقائياً." en="Nothing archived yet — every print is logged here automatically." />}
        {archive.map((a, i) => {
          const [I, tone] = K[a.k] || [FileText, "mut"];
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid " + T.line : "none" }}>
              <span className="rounded-lg p-2" style={TONE[tone]}><I size={15} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: T.ink }}>{isAr ? a.ar : a.en}</div>
                <div className="text-xs" style={{ color: T.mute }}>{a.d} · {a.by}</div>
              </div>
              <Btn size="sm" onClick={() => print({
                ar: a.ar, en: a.en, meta: [[isAr ? "التاريخ" : "Date", a.d], [isAr ? "المنفّذ" : "Executor", a.by]],
                cols: [isAr ? "البند" : "Entry", isAr ? "القيمة" : "Value"],
                rows: [[isAr ? "نوع السجل" : "Record type", a.k], [isAr ? "الحالة" : "Status", isAr ? "مُقفل" : "Closed"]],
                note: isAr ? "نسخة أرشيفية من سجل مُقفل." : "Archived copy of a closed record.", by: user.n,
              })}><Printer size={13} />{isAr ? "طباعة" : "Print"}</Btn>
            </div>
          );
        })}
      </Card>
      <Card className="mt-3">
        <div className="flex items-start gap-2 text-xs" style={{ color: T.mute }}>
          <Info size={15} style={{ color: T.brass }} className="shrink-0 mt-0.5" />
          {isAr ? "في النسخة الفعلية: الأرشيف يحتفظ بكل سجل يومي تلقائياً مع بحث بالتاريخ والقسم والموظف، وتصدير شهري بصيغة Excel وPDF."
                : "In the live build the archive stores every daily record automatically, searchable by date, section and staff member, with monthly Excel and PDF export."}
        </div>
      </Card>
    </div>
  );
}

/* ================================= ADMIN ================================== */
function AdminScreen({ isAr, cfg, setCfg, user, users, setUsers, myEmail, isAdmin, tasks, receipts, warehouses, sb }) {
  const set = (k, v) => setCfg({ ...cfg, [k]: v });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);
  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file || !sb) return;
    if (file.size > 5 * 1024 * 1024) { setErr(isAr ? "الحجم أكبر من 5 ميغابايت" : "File exceeds 5MB"); return; }
    setBusy(true); setErr("");
    try {
      const path = "logo/" + Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const { error: upErr } = await sb.storage.from("hafawa-assets").upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = sb.storage.from("hafawa-assets").getPublicUrl(path);
      set("logoUrl", data.publicUrl);
    } catch (ex) { setErr(isAr ? "تعذّر الرفع: " + (ex.message || "") : "Upload failed: " + (ex.message || "")); }
    setBusy(false);
  };
  return (
    <div>
      <SectionTitle isAr={isAr} icon={Settings} ar="الإعدادات" en="Settings" />

      <div className="grid lg:grid-cols-2 gap-3">
        <Card>
          <b className="text-sm block mb-3" style={{ color: T.ink }}>{isAr ? "هوية النظام" : "System identity"}</b>

          <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: "1px solid " + T.line }}>
            <div className="rounded-xl overflow-hidden shrink-0" style={{ width: 60, height: 60, background: T.surf, border: "1px solid " + T.line }}>
              {cfg.logoUrl
                ? <img src={cfg.logoUrl} alt="logo" className="w-full h-full object-cover" />
                : <div className="w-full h-full grid place-items-center font-bold" style={{ color: T.brass, background: T.brassSoft }}>{isAr ? "حف" : "HF"}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: T.mute }}>
                <ImageIcon size={12} />{isAr ? "صورة / شعار الموقع" : "Site image / logo"}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Btn size="sm" kind="brass" disabled={!isAdmin || busy} onClick={() => fileRef.current && fileRef.current.click()}>
                  {busy ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                  {busy ? (isAr ? "جارٍ الرفع…" : "Uploading…") : (isAr ? "رفع صورة" : "Upload image")}
                </Btn>
                {cfg.logoUrl && isAdmin && <Btn size="sm" onClick={() => set("logoUrl", "")}><X size={13} />{isAr ? "إزالة" : "Remove"}</Btn>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
              <div className="text-xs mt-1.5" style={{ color: T.mute }}>{isAr ? "JPG أو PNG، أقل من 5 ميغابايت" : "JPG or PNG, under 5MB"}</div>
              {err && <div className="text-xs mt-1" style={{ color: T.bad }}>{err}</div>}
            </div>
          </div>

          {[["nameAr", "اسم اللاونج (عربي)", "Lounge name (Arabic)"], ["nameEn", "اسم اللاونج (إنجليزي)", "Lounge name (English)"],
            ["domain", "الدومين", "Domain"], ["client", "الجهة المشغّلة", "Operating company"], ["footer", "نص تذييل المستندات", "Document footer"]].map(([k, a, e]) => (
            <div key={k} className="mb-2.5">
              <label className="text-xs font-semibold block mb-1" style={{ color: T.mute }}>{isAr ? a : e}</label>
              <input value={cfg[k] || ""} onChange={ev => set(k, ev.target.value)} disabled={!isAdmin}
                className={inputCls} style={{ ...inputSty, opacity: isAdmin ? 1 : .6 }} />
            </div>
          ))}
          {!isAdmin && <div className="text-xs" style={{ color: T.mute }}>
            {isAr ? "التعديل متاح للحساب الرئيسي فقط." : "Editing is available to the main account only."}
          </div>}
        </Card>

        <div className="space-y-3">
          <Card>
            <b className="text-sm block mb-2" style={{ color: T.ink }}>{isAr ? "حسابك" : "Your account"}</b>
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg p-2" style={TONE.vio}><ShieldCheck size={16} /></span>
              <div className="min-w-0">
                <div className="font-bold text-sm" style={{ color: T.ink }}>{user.n} <span className="tabular font-semibold" style={{ color: T.mute }}>· {user.prn}</span></div>
                <div className="text-xs truncate" style={{ color: T.mute, direction: "ltr", textAlign: "start" }}>{myEmail}</div>
              </div>
              <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white ms-auto shrink-0"
                style={{ background: (ROLES[user.role] || ROLES.ops).c }}>
                {isAr ? (ROLES[user.role] || ROLES.ops).ar : (ROLES[user.role] || ROLES.ops).en}
              </span>
            </div>
            <div className="text-xs mt-3" style={{ color: T.mute }}>
              {isAr ? "كل إدخال في النظام يُختم باسمك ورقمك الوظيفي والوقت — بديل خانة التوقيع في النماذج الورقية."
                    : "Every entry is stamped with your name, PRN and time — replacing the signature box on the paper forms."}
            </div>
          </Card>

          <Card>
            <b className="text-sm block mb-2" style={{ color: T.ink }}>{isAr ? "حالة النظام" : "System status"}</b>
            <div className="grid grid-cols-2 gap-2">
              {[[isAr ? "المستخدمون" : "Users", users.length], [isAr ? "المستودعات" : "Warehouses", warehouses.length],
                [isAr ? "مهام مفتوحة" : "Open tasks", tasks.filter(t => t.status !== "done").length],
                [isAr ? "عمليات استلام" : "Receipt entries", receipts.length]].map(([l, v], i) => (
                <div key={i} className="rounded-lg p-2.5" style={{ background: T.surf }}>
                  <div className="text-xs" style={{ color: T.mute }}>{l}</div>
                  <div className="text-lg font-bold tabular" style={{ color: T.ink }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-3">
          <UsersScreen isAr={isAr} users={users} setUsers={setUsers} me={user} myEmail={myEmail} sb={sb} />
        </div>
      )}
    </div>
  );
}

/* ================================== APP =================================== */
export default function App({ docs, save, mark, sb, clientId, userEmail, onLogout }) {
  const [lang, setLang] = useState("ar");
  const isAr = lang === "ar";
  const [nav, setNav] = useState("home");
  const [whOpen, setWhOpen] = useState(null);
  const [menu, setMenu] = useState(false);
  const [doc, setDoc] = useState(null);
  const [D0] = useState(() => opDay());
  const [dayRolled, setDayRolled] = useState(false);
  useEffect(() => {
    const t = setInterval(() => { if (opDay() !== D0) setDayRolled(true); }, 60000);
    return () => clearInterval(t);
  }, []);
  const dget = (k, f) => (docs && docs[k] !== undefined && docs[k] !== null ? docs[k] : f);
  const [cfg, setCfg] = useState(() => ({ watermark: "", logoUrl: "", ...dget("cfg", {
    nameAr: "لاونج حفاوة", nameEn: "Hafawa Lounge", domain: "srv1711212.hstgr.cloud",
    client: "Catrion — Riyadh Air",
    footer: "Hafawa Lounge Operations System · Internal document",
  }), mode: "live" }));
  const [users, setUsers] = useState(() => dget("users", []));
  const [tasks, setTasks] = useState(() => dget("tasks", []));
  const [receipts, setReceipts] = useState(() => dget("receipts", []));
  const [barcodes, setBarcodes] = useState(() => dget("barcodes", {}));
  const [roster, setRoster] = useState(() => dget("roster", ROSTER_SEED));
  const [alloc, setAlloc] = useState(() => dget("alloc", {}));
  const [handover, setHandover] = useState(() => ({ [D0]: dget("handover:" + D0, {}) }));
  const me = useMemo(() => {
    const e = String(userEmail || "").toLowerCase();
    return users.find(u => String(u.email).toLowerCase() === e) || null;
  }, [users, userEmail]);
  const user = me || { n: userEmail || "—", prn: "—", role: "ops", r: "" };
  const isAdmin = user.role === "admin";
  const tracking = useTrackingStore(sb, isAdmin);
  const isPartner = user.role === "ra" || user.role === "catrion";
  const staff = users.length ? users : [user];
  const [devices, setDevices] = useState(() => {
    const defs = dget("devices", DEVICES_INIT.map(({ r, ...d }) => ({ ...d })));
    const reads = dget("temps:" + D0, {});
    return defs.map(d => ({ ...d, r: reads[d.id] || {} }));
  });
  const [meals, setMeals] = useState(() => dget("meals:" + D0, []));
  const [waste, setWaste] = useState(() => dget("waste", WASTAGE));
  const [checks, setChecks] = useState(() => dget("checks:" + D0, {}));
  const [rounds, setRounds] = useState(() => dget("rounds:" + D0, {}));
  const [ckWk] = useState(() => ckWeek0(D0));
  const [ckTpl, setCkTpl] = useState(() => { const t = dget("ckltpl", null); return t && t.secs && t.secs.length ? t : ckSeedDoc(); });
  const [ckDay, setCkDay] = useState(() => dget("ckl:" + D0, {}));
  const [ckWeek, setCkWeek] = useState(() => dget("cklw:" + ckWeek0(D0), {}));
  const [linen, setLinen] = useState(() => {
    const raw = dget("linen", null);
    if (raw && raw.cats) return raw;
    const towel = (raw && raw.towel) || [], napkin = (raw && raw.napkin) || [];
    return { cats: [{ id: "towel", ar: "مناشف الوجه", en: "Face towels" }, { id: "napkin", ar: "فوط الطاولة", en: "Table napkins" }],
             data: { towel, napkin } };
  });
  const [breaks, setBreaks] = useState(() => dget("breaks", []));
  const [archive, setArchive] = useState(() => dget("archive", []));
  const [whs, setWhs] = useState(() => dget("warehouses", WAREHOUSES));
  const updateW = (id, rows) => setWhs(prev => prev.map(w => w.id === id ? { ...w, rows, d: todayISO(), by: user.n } : w));
  const addWh = (w) => setWhs(prev => [...prev, w]);
  const delWh = (id) => { if (id === MAIN_WH) return; setWhs(prev => prev.filter(w => w.id !== id));
    setOrders(prev => { const n = { ...prev }; delete n[id]; return n; });
    setReceipts(prev => prev.filter(r => r.wh !== id)); };
  const addReceipt = (r) => setReceipts(prev => [r, ...prev].slice(0, 4000));
  /* issue an item from the main store to an area: deduct here, add there (create if missing), log once */
  const transferItem = ({ to, idx, q, note }) => {
    const q1 = +q; if (!q1 || q1 <= 0 || to === MAIN_WH) return;
    const src = whs.find(x => x.id === MAIN_WH), dst = whs.find(x => x.id === to);
    if (!src || !dst) return;
    const row = src.rows[idx]; if (!row || typeof row === "string") return;
    const name = String(row[0]).trim(), unit = row[1] || null, key = name.toLowerCase();
    const took = btTake(row, q1).took; /* the exact batches leaving the main store */
    setWhs(prev => prev.map(x => {
      if (x.id === MAIN_WH) return { ...x, d: todayISO(), by: user.n,
        rows: x.rows.map((r, i) => { if (i !== idx) return r; return btTake(r, q1).row; }) };
      if (x.id === to) {
        const di = x.rows.findIndex(r => typeof r !== "string" && String(r[0]).trim().toLowerCase() === key);
        const rows = di >= 0
          ? x.rows.map((r, i) => { if (i !== di) return r; return took.reduce((acc, lot) => btAdd(acc, lot.q, lot.exp, todayISO(), user.n), r); })
          : [took.reduce((acc, lot) => btAdd(acc, lot.q, lot.exp, todayISO(), user.n), [name, unit, 0, null, null, null, note || null, null, []])];
        return { ...x, rows: di >= 0 ? rows : [...x.rows, rows[0]], d: todayISO(), by: user.n };
      }
      return x;
    }));
    addReceipt({ id: uid(), d: todayISO(), at: nowHM(), wh: to, item: name, q: q1, by: user.n, note: note || "",
      src: MAIN_WH, exp: took.length === 1 ? took[0].exp : null, lots: took });
  };
  const [orders, setOrders] = useState(() => dget("orders", (() => {
    const o = {};
    Object.entries(DRAFTS_INIT).forEach(([w, lines]) => {
      o[w] = {}; lines.forEach(([n, u, q]) => { o[w][n] = { u, q }; });
    });
    return o;
  })()));

  useSave(save, "cfg", cfg);
  useSave(save, "warehouses", whs);
  useSave(save, "orders", orders);
  useSave(save, "linen", linen);
  useSave(save, "breaks", breaks);
  useSave(save, "waste", waste);
  useSave(save, "archive", archive);
  useSave(save, "users", users);
  useSave(save, "tasks", tasks);
  useSave(save, "receipts", receipts);
  useSave(save, "barcodes", barcodes);
  useSave(save, "roster", roster);
  useSave(save, "alloc", alloc);
  useSave(save, "handover:" + D0, handover[D0]);
  useSave(save, "checks:" + D0, checks);
  useSave(save, "rounds:" + D0, rounds);
  useSave(save, "ckltpl", ckTpl);
  useSave(save, "ckl:" + D0, ckDay);
  useSave(save, "cklw:" + ckWk, ckWeek);
  useSave(save, "meals:" + D0, meals);
  const devDefs = useMemo(() => devices.map(({ r, ...d }) => d), [devices]);
  const devReads = useMemo(() => { const o = {}; devices.forEach(d => { o[d.id] = d.r; }); return o; }, [devices]);
  useSave(save, "devices", devDefs);
  useSave(save, "temps:" + D0, devReads);

  const applyRemote = (key, data) => {
    if (key === "warehouses") setWhs(data);
    else if (key === "orders") setOrders(data);
    else if (key === "linen") setLinen(data);
    else if (key === "breaks") setBreaks(data);
    else if (key === "waste") setWaste(data);
    else if (key === "cfg") setCfg(data);
    else if (key === "archive") setArchive(data);
    else if (key === "users") setUsers(data);
    else if (key === "tasks") setTasks(data);
    else if (key === "receipts") setReceipts(data);
    else if (key === "barcodes") setBarcodes(data || {});
    else if (key === "roster") setRoster(data);
    else if (key === "alloc") setAlloc(data || {});
    else if (key === "handover:" + D0) setHandover(h => ({ ...h, [D0]: data }));
    else if (key === "devices") setDevices(prev => data.map(d => ({ ...d, r: (prev.find(x => x.id === d.id) || {}).r || {} })));
    else if (key === "temps:" + D0) setDevices(prev => prev.map(d => ({ ...d, r: data[d.id] || {} })));
    else if (key === "meals:" + D0) setMeals(data);
    else if (key === "checks:" + D0) setChecks(data);
    else if (key === "rounds:" + D0) setRounds(data);
    else if (key === "ckltpl") setCkTpl(data && data.secs && data.secs.length ? data : ckSeedDoc());
    else if (key === "ckl:" + D0) setCkDay(data || {});
    else if (key === "cklw:" + ckWk) setCkWeek(data || {});
  };
  useEffect(() => {
    if (!sb) return;
    const ch = sb.channel("hf-sync").on("postgres_changes",
      { event: "*", schema: "public", table: "app_state" }, (p) => {
        const row = p.new; if (!row || row.updated_by === clientId) return;
        if (mark) mark(row.key, row.data);
        applyRemote(row.key, row.data);
      }).subscribe();
    return () => { sb.removeChannel(ch); };
  }, []);

  const openTasks = tasks.filter(t => t.status !== "done").length;
  const FULL_NAV = [
    { k: "home",   ar: "لوحة التشغيل", en: "Dashboard",  i: LayoutDashboard },
    { k: "tasks",  ar: "المهام",       en: "Tasks",       i: Bell, badge: openTasks },
    { k: "temp",   ar: "سجلات الحرارة", en: "Temperature", i: Thermometer },
    { k: "roster", ar: "جداول الموظفين", en: "Staff roster", i: CalendarDays },
    ...(isAdmin ? [{ k: "employees", ar: "متابعة الموظفين", en: "Employee tracking", i: Users }] : []),
    { k: "alloc",  ar: "توزيع المواقع", en: "Staff allocation", i: MapPin },
    { k: "handover", ar: "تسليم الوردية", en: "Shift handover", i: Handshake },
    { k: "clean",  ar: "النظافة",      en: "Cleaning",    i: ClipboardCheck },
    { k: "hist",   ar: "السجلات اليومية", en: "Daily records", i: History },
    { k: "wh",     ar: "المستودعات",    en: "Warehouses",  i: Boxes },
    { k: "linen",  ar: "المفروشات",     en: "Linen",       i: Shirt },
    { k: "break",  ar: "الكسر",         en: "Breakage",    i: Wine },
    { k: "waste",  ar: "الهدر",         en: "Wastage",     i: Trash2 },
    { k: "stats",  ar: "الإحصائيات",    en: "Statistics",  i: BarChart3 },
    { k: "arch",   ar: "الأرشيف",       en: "Archive",     i: FileText },
    { k: "admin",  ar: "الإعدادات",     en: "Settings",    i: Settings },
  ];
  const NAVI = isPartner
    ? FULL_NAV.filter(n => ["home", "tasks", "stats"].includes(n.k))
    : FULL_NAV;
  useEffect(() => { if (isPartner && !["home", "tasks", "stats"].includes(nav)) setNav("tasks"); }, [isPartner, nav]);
  const go = (k) => { setNav(k); setWhOpen(null); setMenu(false); };
  const print = (d) => {
    setDoc(d);
    setArchive(a => [{ d: todayISO(), k: d.k || "doc", ar: d.ar, en: d.en, by: d.by || user.n }, ...a].slice(0, 300));
  };

  const current = warehouseById(whOpen);
  function warehouseById(id) { return whs.find(w => w.id === id); }

  const renderBody = () => {
    if (nav === "employees" && isAdmin) return <EmployeeTracking store={tracking} sb={sb} isAr={isAr} users={users} roster={roster} />;
    if (nav === "home")  return <Dashboard isAr={isAr} go={go} devices={devices} meals={meals} warehouses={whs} orders={orders} linen={linen} cfg={cfg}
                                   tasks={tasks} setTasks={setTasks} me={user} isAdmin={isAdmin} receipts={receipts} roster={roster} />;
    if (nav === "tasks") return <TasksScreen isAr={isAr} tasks={tasks} setTasks={setTasks} me={user} print={print} />;
    if (nav === "stats") return <StatsScreen isAr={isAr} warehouses={whs} orders={orders} waste={waste} breaks={breaks}
                                   receipts={receipts} linen={linen} devices={devices} checks={checks} rounds={rounds}
                                   tasks={tasks} print={print} user={user} />;
    if (nav === "temp")  return <TempScreen isAr={isAr} devices={devices} setDevices={setDevices} meals={meals} setMeals={setMeals} print={print} user={user} />;
    if (nav === "clean") return <CleanScreen isAr={isAr} checks={checks} setChecks={setChecks} rounds={rounds} setRounds={setRounds}
                                   print={print} user={user} staff={staff} ckTpl={ckTpl} setCkTpl={setCkTpl} ckDay={ckDay} setCkDay={setCkDay}
                                   ckWeek={ckWeek} setCkWeek={setCkWeek} ckWk={ckWk} tasks={tasks} setTasks={setTasks} isAdmin={isAdmin} canEdit={!isPartner} />;
    if (nav === "linen") return <LinenScreen isAr={isAr} linen={linen} setLinen={setLinen} print={print} user={user} canEdit={isAdmin} />;
    if (nav === "break") return <BreakScreen isAr={isAr} breaks={breaks} setBreaks={setBreaks} print={print} user={user} />;
    if (nav === "waste") return <WasteScreen isAr={isAr} waste={waste} setWaste={setWaste} print={print} user={user} warehouses={whs} />;
    if (nav === "arch")  return <ArchiveScreen isAr={isAr} archive={archive} print={print} user={user} />;
    if (nav === "admin") return <AdminScreen isAr={isAr} cfg={cfg} setCfg={setCfg} user={user} users={users} setUsers={setUsers}
                                   myEmail={userEmail} isAdmin={isAdmin} tasks={tasks} receipts={receipts} warehouses={whs} sb={sb} />;
    if (nav === "hist") return <HistoryScreen isAr={isAr} docs={docs} D0={D0} devices={devices} meals={meals}
                                   checks={checks} rounds={rounds} print={print} user={user} />;
    if (nav === "roster") return <RosterScreen isAr={isAr} roster={roster} setRoster={setRoster} user={user} print={print} canEdit={!isPartner} />;
    if (nav === "alloc") return <AllocScreen isAr={isAr} alloc={alloc} setAlloc={setAlloc} user={user} print={print} canEdit={!isPartner} />;
    if (nav === "handover") return <HandoverScreen isAr={isAr} handover={handover} setHandover={setHandover}
                                   warehouses={whs} orders={orders} linen={linen} breaks={breaks} waste={waste} user={user} print={print} />;
    return current
      ? <WarehouseDetail isAr={isAr} w={current} orders={orders} setOrders={setOrders} back={() => setWhOpen(null)}
          print={print} user={user} catalog={CATALOGS[current.id]} updateW={updateW} receipts={receipts} addReceipt={addReceipt}
          warehouses={whs} transfer={transferItem} barcodes={barcodes} setBarcodes={setBarcodes} isAdmin={isAdmin} />
      : <WarehouseList isAr={isAr} warehouses={whs} orders={orders} open={setWhOpen} addWh={addWh} delWh={delWh}
          receipts={receipts} canEdit={isAdmin} barcodes={barcodes} setBarcodes={setBarcodes} />;
  };

  return (
    <div className="hf-root min-h-screen" dir={isAr ? "rtl" : "ltr"} style={{ background: T.surf }}>
      <style>{STYLE}</style>

      <div id="hf-shell">
        <header className="sticky top-0 z-30 px-3 sm:px-5 py-2.5 flex items-center gap-3"
          style={{ background: T.ink, color: "#fff" }}>
          <button className="lg:hidden rounded-lg p-1.5" style={{ border: "1px solid rgba(255,255,255,.2)" }} onClick={() => setMenu(!menu)}>
            <ClipboardList size={17} />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="rounded-lg grid place-items-center font-bold shrink-0 overflow-hidden"
              style={{ width: 34, height: 34, background: T.brass, color: T.ink, fontSize: 13 }}>
              {cfg.logoUrl ? <img src={cfg.logoUrl} alt="logo" className="w-full h-full object-cover" /> : (isAr ? "حف" : "HF")}
            </span>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{isAr ? cfg.nameAr : cfg.nameEn}</div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,.6)" }}>
                {isAr ? "نظام التشغيل" : "Operations System"} · {cfg.domain}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,.75)" }}>
            <Users size={14} />{user.n} <span style={{ color: "rgba(255,255,255,.45)" }}>· {user.prn}</span>
            <span className="rounded-full px-2 py-0.5 font-bold" style={{ background: (ROLES[user.role] || ROLES.ops).c, color: "#fff" }}>
              {isAr ? (ROLES[user.role] || ROLES.ops).ar : (ROLES[user.role] || ROLES.ops).en}
            </span>
          </div>
          <button onClick={() => setLang(isAr ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold"
            style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)" }}>
            <Languages size={14} />{isAr ? "EN" : "ع"}
          </button>
          {onLogout && (
            <button onClick={onLogout} title={userEmail || ""}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold"
              style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)" }}>
              <LogOut size={14} />{isAr ? "خروج" : "Out"}
            </button>
          )}
        </header>

        <div className="flex">
          <nav className={(menu ? "block " : "hidden ") + "lg:block shrink-0 p-3"}
            style={{ width: 216, background: "#fff", borderInlineEnd: "1px solid " + T.line, minHeight: "calc(100vh - 52px)" }}>
            {NAVI.map(n => {
              const on = nav === n.k;
              return (
                <button key={n.k} onClick={() => go(n.k)}
                  className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 mb-1 text-sm font-semibold text-start"
                  style={on ? { background: T.vioSoft, color: T.vioText } : { color: T.ink2 }}>
                  <n.i size={16} style={{ color: on ? T.vio : T.mute }} />
                  <span className="flex-1">{isAr ? n.ar : n.en}</span>
                  {n.badge > 0 && <span className="rounded-full px-1.5 text-xs font-bold text-white" style={{ background: T.bad }}>{n.badge}</span>}
                </button>
              );
            })}
            <div className="mt-4 rounded-lg p-3 text-xs" style={{ background: T.brassSoft, color: T.brassText, border: "1px solid " + T.brassLine }}>
              <b className="block mb-1">{isAr ? "متزامن سحابياً" : "Cloud-synced"}</b>
              {isAr ? "كل إدخال يُحفظ فوراً في قاعدة البيانات ويظهر لبقية الفريق مباشرة."
                    : "Every entry saves to the database instantly and appears live for the whole team."}
              {userEmail && <div className="mt-1.5 truncate" style={{ direction: "ltr", opacity: .85 }}>{userEmail}</div>}
            </div>
          </nav>

          <main className="flex-1 p-3 sm:p-5" style={{ minWidth: 0 }}>
            {dayRolled && (
              <div className="rounded-xl p-3 mb-3 flex items-center gap-2.5 flex-wrap"
                style={{ background: T.warnSoft, border: "1px solid " + T.warnLine, color: "#92400E" }}>
                <Calendar size={16} />
                <span className="text-sm font-semibold flex-1">
                  {isAr ? "بدأ يوم تشغيلي جديد (الساعة 06:00) منذ فتح هذه الصفحة — حدّثها الآن لفتح سجلات اليوم الجديد."
                        : "A new operational day began (06:00) since this page was opened — refresh now to open the new day's sheets."}
                </span>
                <button onClick={() => location.reload()} className="rounded-lg px-3 py-1.5 text-xs font-bold text-white shrink-0" style={{ background: T.ink }}>
                  {isAr ? "تحديث الآن" : "Refresh now"}
                </button>
              </div>
            )}
            {nav === "home" && isAdmin && <TrackingHomeCard store={tracking} isAr={isAr} go={() => go("employees")} />}
            {renderBody()}
          </main>
        </div>
      </div>

      <PrintModal doc={doc} cfg={cfg} isAr={isAr} onClose={() => setDoc(null)} />
    </div>
  );
}

export { WAREHOUSES as SEED_WH, WASTAGE as SEED_WASTE };
