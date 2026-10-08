import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import App, { SEED_WH, SEED_WASTE } from "./app.jsx";

const CFG = window.HF_CONFIG || {};
const sb = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON);
const CLIENT_ID = "c" + Math.random().toString(36).slice(2) + Date.now().toString(36);

const SAVED = {};
const mark = (k, v) => { SAVED[k] = JSON.stringify(v); };
async function saveDoc(key, data) {
  const sjson = JSON.stringify(data);
  if (SAVED[key] === sjson) return;
  SAVED[key] = sjson;
  const { error } = await sb.from("app_state").upsert({
    key, data, updated_at: new Date().toISOString(), updated_by: CLIENT_ID,
  });
  if (error) {
    delete SAVED[key];
    window.dispatchEvent(new CustomEvent("hf-save-error", { detail: error.message }));
  }
}

const F = '"Segoe UI",Tahoma,system-ui,sans-serif';
const card = { background: "#fff", border: "1px solid #E6E3F2", borderRadius: 14, padding: 24, width: "100%", maxWidth: 400, boxShadow: "0 8px 30px rgba(30,27,51,.08)" };
const inp = { width: "100%", boxSizing: "border-box", border: "1px solid #E6E3F2", borderRadius: 10, padding: "10px 12px", fontSize: 15, fontFamily: F, background: "#fff", color: "#1E1B33", outline: "none" };
const lbl = { fontSize: 12, fontWeight: 600, color: "#6B6890", display: "block", margin: "12px 0 5px" };

function Shell({ children }) {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#F7F6FB", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: F }}>
      {children}
    </div>
  );
}
function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: "#B8934E", color: "#1E1B33", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15 }}>حف</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 17, color: "#1E1B33" }}>لاونج حفاوة — نظام التشغيل</div>
        <div style={{ fontSize: 11.5, color: "#6B6890" }}>Hafawa Lounge · Operations System</div>
      </div>
    </div>
  );
}
function Splash({ msg }) {
  return (
    <Shell>
      <div style={{ textAlign: "center", color: "#6B6890", fontSize: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#B8934E", color: "#1E1B33", display: "grid", placeItems: "center", fontWeight: 800, margin: "0 auto 12px" }}>حف</div>
        {msg || "جارٍ التحميل… Loading"}
      </div>
    </Shell>
  );
}

const AR_ERR = (m) => {
  const t = String(m || "");
  if (t.includes("Invalid login credentials")) return "بيانات الدخول غير صحيحة — تحقق من البريد وكلمة المرور.";
  if (t.includes("already registered")) return "هذا البريد مسجَّل بالفعل — استخدم زر تسجيل الدخول.";
  if (t.includes("Password should be")) return "كلمة المرور قصيرة — 8 أحرف على الأقل.";
  if (t.includes("valid email")) return "أدخل بريداً إلكترونياً صحيحاً.";
  if (t.toLowerCase().includes("signup") && t.toLowerCase().includes("disabled")) return "التسجيل مغلق — اطلب من المدير إضافتك.";
  if (t.includes("For security purposes") || t.toLowerCase().includes("rate limit") || t.includes("after 60 seconds")) return "أرسلت طلباً قبل قليل — انتظر دقيقة ثم أعد المحاولة.";
  if (t.includes("New password should be different")) return "كلمة المرور الجديدة يجب أن تختلف عن القديمة.";
  if (t.includes("Auth session missing") || t.includes("expired") || t.includes("invalid")) return "انتهت صلاحية رابط الاستعادة — اطلب رابطاً جديداً.";
  return t;
};

function Login() {
  const [mode, setMode] = useState("in");   // in | up | forgot
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const isForgot = mode === "forgot";
  const go = async () => {
    setErr(""); setBusy(true);
    if (isForgot) {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: location.origin });
      setBusy(false);
      if (error) setErr(AR_ERR(error.message)); else setSent(true);
      return;
    }
    const res = mode === "in"
      ? await sb.auth.signInWithPassword({ email: email.trim(), password: pass })
      : await sb.auth.signUp({ email: email.trim(), password: pass });
    setBusy(false);
    if (res.error) setErr(AR_ERR(res.error.message));
  };
  if (isForgot && sent) return (
    <Shell>
      <div style={card}>
        <Brand />
        <div style={{ marginTop: 14, background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#047857", borderRadius: 10, padding: 12, fontSize: 13.5, lineHeight: 1.8 }}>
          <b style={{ display: "block", marginBottom: 4 }}>أُرسل رابط الاستعادة</b>
          افتح بريد <span style={{ direction: "ltr", display: "inline-block", fontWeight: 700 }}>{email.trim()}</span> واضغط الرابط، فتُفتح صفحة تعيين كلمة مرور جديدة.
          الرابط صالح ساعة واحدة. إن لم تجد الرسالة راجع مجلد الرسائل غير المرغوبة (Spam).
        </div>
        <button onClick={() => { setSent(false); setMode("in"); setPass(""); }}
          style={{ width: "100%", marginTop: 14, background: "#1E1B33", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontFamily: F, cursor: "pointer" }}>
          العودة لتسجيل الدخول
        </button>
      </div>
    </Shell>
  );
  return (
    <Shell>
      <div style={card}>
        <Brand />
        <div style={{ fontSize: 12.5, color: "#6B6890", margin: "10px 0 4px" }}>
          {isForgot ? "أدخل بريدك ليصلك رابط تعيين كلمة مرور جديدة" : mode === "in" ? "سجّل الدخول بحساب الفريق" : "إنشاء حساب جديد لأول مرة"}
        </div>
        <label style={lbl}>البريد الإلكتروني · Email</label>
        <input dir="ltr" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && isForgot && go()} style={inp} placeholder="you@example.com" />
        {!isForgot && <>
          <label style={lbl}>كلمة المرور · Password</label>
          <input dir="ltr" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={pass}
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && go()} style={inp} placeholder="••••••••" />
        </>}
        {err && <div style={{ marginTop: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 10, padding: "8px 10px", fontSize: 12.5 }}>{err}</div>}
        <button onClick={go} disabled={busy || !email || (!isForgot && pass.length < 8)}
          style={{ width: "100%", marginTop: 14, background: "#1E1B33", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14.5, fontFamily: F, cursor: "pointer", opacity: busy || !email || (!isForgot && pass.length < 8) ? .5 : 1 }}>
          {busy ? "لحظة…" : isForgot ? "إرسال رابط الاستعادة" : mode === "in" ? "تسجيل الدخول" : "إنشاء الحساب"}
        </button>
        {mode === "in" && (
          <button onClick={() => { setMode("forgot"); setErr(""); setPass(""); }}
            style={{ width: "100%", marginTop: 10, background: "transparent", color: "#6B6890", border: "none", fontWeight: 700, fontSize: 12.5, fontFamily: F, cursor: "pointer" }}>
            نسيت كلمة المرور؟
          </button>
        )}
        <button onClick={() => { setMode(isForgot ? "in" : mode === "in" ? "up" : "in"); setErr(""); }}
          style={{ width: "100%", marginTop: 8, background: "transparent", color: "#5B48C7", border: "none", fontWeight: 700, fontSize: 12.5, fontFamily: F, cursor: "pointer" }}>
          {isForgot ? "العودة لتسجيل الدخول" : mode === "in" ? "أول مرة؟ إنشاء حساب" : "لديك حساب؟ تسجيل الدخول"}
        </button>
        <div style={{ marginTop: 12, fontSize: 11, color: "#6B6890", textAlign: "center" }}>
          الدخول مخصص لفريق العمل المصرّح له فقط
        </div>
      </div>
    </Shell>
  );
}

function ResetPassword({ email, onDone }) {
  const [p1, setP1] = useState(""), [p2, setP2] = useState("");
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  const bad = p1.length < 8 ? "كلمة المرور 8 أحرف على الأقل." : p1 !== p2 ? "الكلمتان غير متطابقتين." : "";
  const go = async () => {
    setErr(""); setBusy(true);
    const { error } = await sb.auth.updateUser({ password: p1 });
    setBusy(false);
    if (error) setErr(AR_ERR(error.message)); else onDone();
  };
  return (
    <Shell>
      <div style={card}>
        <Brand />
        <div style={{ fontSize: 12.5, color: "#6B6890", margin: "10px 0 4px" }}>
          تعيين كلمة مرور جديدة{email ? " لـ " : ""}<span style={{ direction: "ltr", display: "inline-block", fontWeight: 700 }}>{email || ""}</span>
        </div>
        <label style={lbl}>كلمة المرور الجديدة · New password</label>
        <input dir="ltr" type="password" autoComplete="new-password" value={p1} onChange={e => setP1(e.target.value)} style={inp} placeholder="••••••••" />
        <label style={lbl}>تأكيد كلمة المرور · Confirm</label>
        <input dir="ltr" type="password" autoComplete="new-password" value={p2} onChange={e => setP2(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !bad && go()} style={inp} placeholder="••••••••" />
        {(err || (p2 && bad)) && <div style={{ marginTop: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 10, padding: "8px 10px", fontSize: 12.5 }}>{err || bad}</div>}
        <button onClick={go} disabled={busy || !!bad}
          style={{ width: "100%", marginTop: 14, background: "#1E1B33", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 14.5, fontFamily: F, cursor: "pointer", opacity: busy || bad ? .5 : 1 }}>
          {busy ? "لحظة…" : "حفظ كلمة المرور والدخول"}
        </button>
        <button onClick={() => sb.auth.signOut().then(() => { location.hash = ""; location.reload(); })}
          style={{ width: "100%", marginTop: 8, background: "transparent", color: "#6B6890", border: "none", fontWeight: 700, fontSize: 12.5, fontFamily: F, cursor: "pointer" }}>
          إلغاء
        </button>
      </div>
    </Shell>
  );
}

function Loader({ session }) {
  const [boot, setBoot] = useState(null);
  const [denied, setDenied] = useState(false);
  const [err, setErr] = useState(null);
  const [saveErr, setSaveErr] = useState(null);
  useEffect(() => {
    const h = (e) => setSaveErr(e.detail || "save failed");
    window.addEventListener("hf-save-error", h);
    return () => window.removeEventListener("hf-save-error", h);
  }, []);
  useEffect(() => {
    let alive = true;
    sb.from("app_state").select("key,data").then(({ data, error }) => {
      if (!alive) return;
      if (error) { setErr(error.message); return; }
      const docs = {};
      (data || []).forEach(r => { docs[r.key] = r.data; SAVED[r.key] = JSON.stringify(r.data); });
      if (docs.warehouses === undefined) { docs.warehouses = SEED_WH; saveDoc("warehouses", SEED_WH); }
      if (docs.waste === undefined) { docs.waste = SEED_WASTE; saveDoc("waste", SEED_WASTE); }
      const email = String((session.user && session.user.email) || "").toLowerCase();
      let users = Array.isArray(docs.users) ? docs.users : [];
      if (!users.length) {
        users = [{ email, n: email.split("@")[0], prn: "ADM-001", role: "admin", r: "System manager" }];
        docs.users = users; saveDoc("users", users);
      }
      if (!users.some(u => String(u.email).toLowerCase() === email)) { setDenied(true); return; }
      setBoot(docs);
    });
    return () => { alive = false; };
  }, []);
  if (err) return (
    <Shell>
      <div style={card}>
        <Brand />
        <div style={{ marginTop: 12, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: 10, padding: 10, fontSize: 13 }}>
          تعذّر تحميل البيانات: {err}
        </div>
        <button onClick={() => location.reload()} style={{ width: "100%", marginTop: 12, background: "#1E1B33", color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, fontFamily: F, cursor: "pointer" }}>إعادة المحاولة</button>
      </div>
    </Shell>
  );
  if (denied) return (
    <Shell>
      <div style={card}>
        <Brand />
        <div style={{ marginTop: 14, background: "#FFFBEB", border: "1px solid #FDE68A", color: "#B45309", borderRadius: 10, padding: 12, fontSize: 13.5, lineHeight: 1.7 }}>
          <b style={{ display: "block", marginBottom: 4 }}>هذا الحساب غير مصرَّح له بالدخول</b>
          البريد <span style={{ direction: "ltr", display: "inline-block" }}>{(session.user && session.user.email) || ""}</span> غير مضاف في قائمة المستخدمين.
          اطلب من مدير النظام إضافته من: الإعدادات ← المستخدمون والصلاحيات.
        </div>
        <button onClick={() => sb.auth.signOut().then(() => location.reload())}
          style={{ width: "100%", marginTop: 14, background: "#1E1B33", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontFamily: F, cursor: "pointer" }}>
          تسجيل الخروج
        </button>
      </div>
    </Shell>
  );
  if (!boot) return <Splash msg="جارٍ تحميل بيانات اللاونج… Syncing" />;
  return (
    <>
      <App docs={boot} save={saveDoc} mark={mark} sb={sb} clientId={CLIENT_ID}
        userEmail={session.user && session.user.email} onLogout={() => sb.auth.signOut().then(() => location.reload())} />
      {saveErr && (
        <div style={{ position: "fixed", bottom: 12, left: 12, right: 12, zIndex: 60, margin: "0 auto", maxWidth: 560, background: "#DC2626", color: "#fff", borderRadius: 12, padding: "10px 14px", fontSize: 13, fontFamily: F, display: "flex", gap: 10, alignItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,.25)" }} dir="rtl">
          <span style={{ flex: 1 }}>تعذّر حفظ آخر تعديل — تحقق من الاتصال بالإنترنت. ({saveErr})</span>
          <button onClick={() => setSaveErr(null)} style={{ background: "rgba(255,255,255,.2)", color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", fontFamily: F, cursor: "pointer" }}>إغلاق</button>
        </div>
      )}
    </>
  );
}

function Root() {
  const [session, setSession] = useState(undefined);
  /* Supabase sends the recovery link back with #type=recovery — show the reset screen, not the app */
  const [recovery, setRecovery] = useState(() => /type=recovery/.test(location.hash || "") || /[?&]type=recovery/.test(location.search || ""));
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = sb.auth.onAuthStateChange((e, s) => {
      if (e === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  if (session === undefined) return <Splash />;
  if (recovery && session) return <ResetPassword email={session.user && session.user.email}
    onDone={() => { setRecovery(false); try { history.replaceState(null, "", location.pathname); } catch (e) {} }} />;
  if (!session) return <Login />;
  return <Loader session={session} />;
}

createRoot(document.getElementById("root")).render(<Root />);
