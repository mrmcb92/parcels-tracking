import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, ExternalLink, X, Search, Package, Download,
  RefreshCw, FileText, Loader, ChevronDown, LogOut,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "./supabase.js";

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    appName: "Parcel Tracking",
    appSub: "Track your parcels from any device",
    noParcel: "No parcels",
    parcels: (n) => `${n} ${n === 1 ? "parcel" : "parcels"}`,
    loading: "Loading...",
    loadingParcels: "Loading parcels...",
    checkAll: "Check all",
    checking: "Checking...",
    export: "Export",
    downloadCSV: "Download CSV",
    downloadExcel: "Download Excel",
    add: "Add",
    signOut: "Sign out",
    searchPlaceholder: "Search by name, AWB or shop...",
    all: "All",
    newParcel: "New parcel",
    editParcel: "Edit parcel",
    description: "Description / order *",
    descPlaceholder: "e.g. Mechanical keyboard, 27 inch monitor...",
    awb: "AWB Number",
    awbPlaceholder: "e.g. 12345678",
    awbRequired: "AWB Number *",
    orderNumber: "Order number (optional)",
    orderNumberPlaceholder: "e.g. #123456789",
    courier: "Courier",
    shop: "Shop",
    shopPlaceholder: "e.g. eMag, Altex, PC Garage...",
    amount: "Amount (RON)",
    amountPlaceholder: "e.g. 349.99",
    status: "Status",
    orderDate: "Order date",
    notes: "Notes (optional)",
    notesPlaceholder: "value, product link, other details...",
    cancel: "Cancel",
    save: "Save changes",
    addParcel: "Add parcel",
    formErr: "Fill in the description.",
    formErrAwb: "Fill in the AWB number.",
    saveErr: "Save error: ",
    noParcelAdded: "No parcel added",
    noParcelSub: "Press \"Add\" to get started",
    noMatch: "No parcels match the filters.",
    quickStatus: "Quick status:",
    checkStatus: "Check status online",
    trackExternal: "Open external tracking",
    delete: "Delete parcel",
    verifying: "Searching for status online...",
    verified: "Courier status",
    noTrackingInfo: "No info found",
    settingsTitle: "Auto-tracking settings",
    apiKeyLabel: "Anthropic API Key",
    apiKeyNote: "Required for automatic status checking. Saved locally in your browser only.",
    generateKey: "Generate key →",
    saveKey: "Save",
    loginSub: "Track your parcels from any device",
    loginBtn: "Continue with Google",
    loginConnecting: "Connecting...",
    loginNote: "Each user sees only their own parcels.",
    statuses: {
      "Comandat":   "Ordered",
      "In livrare": "In delivery",
      "Livrat":     "Delivered",
    },
    filterLabel: (s, count) => `${s} (${count})`,
    exportHeaders: ["Description","Order No.","AWB","Courier","Status","Date","Shop","Amount","Notes","Last event","Location","Last checked"],
  },
  ro: {
    appName: "Parcel Tracking",
    appSub: "Urmărește-ți coletele de pe orice device",
    noParcel: "Niciun colet",
    parcels: (n) => `${n} ${n === 1 ? "colet" : "colete"}`,
    loading: "Se încarcă...",
    loadingParcels: "Se încarcă coletele...",
    checkAll: "Verifică toate",
    checking: "Se verifică...",
    export: "Export",
    downloadCSV: "Descarcă CSV",
    downloadExcel: "Descarcă Excel",
    add: "Adaugă",
    signOut: "Deconectează-te",
    searchPlaceholder: "Caută după nume, AWB sau magazin...",
    all: "Toate",
    newParcel: "Colet nou",
    editParcel: "Editează colet",
    description: "Descriere / comandă *",
    descPlaceholder: "ex. Tastatură mecanică, Monitor 27 inch...",
    awb: "Număr AWB",
    awbPlaceholder: "ex. 12345678",
    awbRequired: "Număr AWB *",
    orderNumber: "Număr comandă (opțional)",
    orderNumberPlaceholder: "ex. #123456789",
    courier: "Curier",
    shop: "Magazin",
    shopPlaceholder: "ex. eMag, Altex, PC Garage...",
    amount: "Sumă (RON)",
    amountPlaceholder: "ex. 349.99",
    status: "Status",
    orderDate: "Data comenzii",
    notes: "Note (opțional)",
    notesPlaceholder: "valoare, link produs, alte detalii...",
    cancel: "Anulează",
    save: "Salvează modificările",
    addParcel: "Adaugă colet",
    formErr: "Completează descrierea.",
    formErrAwb: "Completează numărul AWB.",
    saveErr: "Eroare la salvare: ",
    noParcelAdded: "Niciun colet adăugat",
    noParcelSub: 'Apasă „Adaugă" pentru a începe',
    noMatch: "Niciun colet nu corespunde filtrelor.",
    quickStatus: "Status rapid:",
    checkStatus: "Verifică status online",
    trackExternal: "Deschide tracking extern",
    delete: "Șterge coletul",
    verifying: "Se caută statusul online...",
    verified: "Status curier",
    noTrackingInfo: "Nu s-au găsit informații",
    settingsTitle: "Setări tracking automat",
    apiKeyLabel: "Anthropic API Key",
    apiKeyNote: "Necesar pentru verificarea automată a statusului. Se salvează doar în browser-ul curent.",
    generateKey: "Generează key →",
    saveKey: "Salvează",
    loginSub: "Urmărește-ți coletele de pe orice device",
    loginBtn: "Continuă cu Google",
    loginConnecting: "Se conectează...",
    loginNote: "Fiecare utilizator vede doar propriile colete.",
    statuses: {
      "Comandat":   "Comandat",
      "In livrare": "In livrare",
      "Livrat":     "Livrat",
    },
    exportHeaders: ["Descriere","Nr. comandă","AWB","Curier","Status","Data","Magazin","Suma","Note","Ultimul eveniment","Locatie","Ultima verificare"],
  },
};

const LANG_KEY = "parcel-lang";

// ── Constants ──────────────────────────────────────────────────────────────────

const COURIERS = [
  { name: "FAN Courier",  url: (a) => `https://www.fancourier.ro/awb-tracking/?awb=${a}` },
  { name: "Cargus",       url: (a) => `https://www.cargus.ro/tracking-colet/?Awb=${a}` },
  { name: "Sameday",      url: (a) => `https://sameday.ro/status-colet/?awb=${a}` },
  { name: "DPD",          url: (a) => `https://xawb.ro/urmarire-colet-dpd?awb=${a}` },
  { name: "GLS",          url: (a) => `https://xawb.ro/urmarire-colet-gls?awb=${a}` },
  { name: "Posta Romana", url: (a) => `https://xawb.ro/urmarire-colet-posta?awb=${a}` },
  { name: "Alta",         url: (a) => `https://xawb.ro/?awb=${a}` },
];

const STATUSES = ["Comandat", "In livrare", "Livrat"];

const SC = {
  "Comandat":     { color: "#94a3b8", bg: "rgba(148,163,184,0.18)", border: "rgba(148,163,184,0.45)" },
  "In livrare":   { color: "#a78bfa", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.45)" },
  "Livrat":       { color: "#34d399", bg: "rgba(52,211,153,0.18)",  border: "rgba(52,211,153,0.45)" },
  // fallback pentru statusuri vechi din baza de date
  "In procesare": { color: "#a78bfa", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.45)" },
  "In tranzit":   { color: "#a78bfa", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.45)" },
  "La livrare":   { color: "#a78bfa", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.45)" },
  "Retur":        { color: "#94a3b8", bg: "rgba(148,163,184,0.18)", border: "rgba(148,163,184,0.45)" },
};

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-tracking`;

const emptyForm = () => ({
  name: "", awb: "", courier: "FAN Courier", status: "Comandat",
  date: new Date().toISOString().split("T")[0], notes: "", shop: "", amount: "", order_number: "",
});

// ── Shared CSS ────────────────────────────────────────────────────────────────

const STYLES = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#16033a;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  @keyframes b1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(40px,-30px) scale(1.07)}66%{transform:translate(-18px,22px) scale(0.94)}}
  @keyframes b2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-35px,28px) scale(1.05)}66%{transform:translate(28px,-18px) scale(0.96)}}
  @keyframes b3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(22px,-42px) scale(1.06)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin 1s linear infinite}
  .gc{background:rgba(255,255,255,0.08);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:1px solid rgba(255,255,255,0.14);border-radius:20px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.22),0 8px 32px rgba(0,0,0,0.2)}
  .gc-strong{background:rgba(255,255,255,0.11);backdrop-filter:blur(32px) saturate(200%);-webkit-backdrop-filter:blur(32px) saturate(200%);border:1px solid rgba(255,255,255,0.2);border-radius:24px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.32),0 20px 48px rgba(0,0,0,0.28)}
  .pkg{background:rgba(255,255,255,0.055);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border:1px solid rgba(255,255,255,0.09);border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.12),0 4px 16px rgba(0,0,0,0.1);padding:1rem 1.25rem;transition:border-color .2s}
  .pkg:hover{border-color:rgba(255,255,255,0.17)}
  .gi{background:rgba(0,0,0,0.28);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.11);border-radius:12px;color:white;font-size:14px;padding:10px 14px;outline:none;font-family:'DM Sans',sans-serif;transition:border-color .2s;width:100%}
  .gi::placeholder{color:rgba(255,255,255,0.3)}
  .gi:focus{border-color:rgba(255,255,255,0.32)}
  .gi option{background:#1e293b;color:white}
  .gb{background:rgba(255,255,255,0.09);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.18);border-radius:12px;color:rgba(255,255,255,0.88);cursor:pointer;font-size:14px;font-family:'DM Sans',sans-serif;padding:8px 14px;transition:background .18s,transform .1s;display:inline-flex;align-items:center;gap:6px}
  .gb:hover{background:rgba(255,255,255,0.15)}
  .gb:active{transform:scale(0.97)}
  .gb:disabled{opacity:0.4;cursor:not-allowed}
  .gbp{background:rgba(167,139,250,0.28);border-color:rgba(167,139,250,0.5)}
  .gbp:hover{background:rgba(167,139,250,0.38)}
  .ib{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:rgba(255,255,255,0.65);cursor:pointer;padding:6px 8px;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:all .15s;font-family:'DM Sans',sans-serif;font-size:13px}
  .ib:hover{background:rgba(255,255,255,0.14);color:white}
  .ib:disabled{opacity:0.35;cursor:not-allowed}
  .ibx:hover{background:rgba(248,113,113,0.18);border-color:rgba(248,113,113,0.4);color:#f87171}
  .fp{font-size:13px;padding:5px 14px;border-radius:100px;cursor:pointer;border:1px solid rgba(255,255,255,0.13);background:rgba(255,255,255,0.055);color:rgba(255,255,255,0.65);transition:all .18s;font-family:'DM Sans',sans-serif}
  .fp:hover{background:rgba(255,255,255,0.11);color:white}
  .fp.act{background:rgba(255,255,255,0.17);border-color:rgba(255,255,255,0.28);color:white}
  .sp{font-size:12px;padding:3px 10px;border-radius:100px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .15s;font-family:'DM Sans',sans-serif}
  .sp:hover{opacity:0.8}
  .sp:active{transform:scale(0.95)}
  .em{position:absolute;top:calc(100% + 8px);right:0;background:rgba(12,18,35,0.92);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.14);border-radius:14px;padding:6px;min-width:165px;z-index:200;box-shadow:0 20px 40px rgba(0,0,0,0.45)}
  .ei{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,0.78);font-size:14px;transition:background .15s;font-family:'DM Sans',sans-serif;background:none;border:none;width:100%;text-align:left}
  .ei:hover{background:rgba(255,255,255,0.08);color:white}
  .ti{background:rgba(0,0,0,0.22);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:8px 10px;margin-top:8px}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem}
  .lang-btn{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(255,255,255,0.7);cursor:pointer;padding:5px 4px;display:inline-flex;align-items:center;gap:2px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;transition:all .15s;min-width:52px;justify-content:center}
  .lang-btn:hover{background:rgba(255,255,255,0.13);color:white}
  .lang-seg{padding:3px 7px;border-radius:7px;transition:all .15s;line-height:1}
  .lang-seg.active{background:rgba(255,255,255,0.18);color:white}
  a{color:inherit;text-decoration:none}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:2px}
`;

// ── Animated background ───────────────────────────────────────────────────────

function Background() {
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      <div style={{position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,0.38) 0%,transparent 65%)",top:-220,left:-160,animation:"b1 13s ease-in-out infinite",filter:"blur(2px)"}} />
      <div style={{position:"absolute",width:580,height:580,borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.28) 0%,transparent 65%)",top:"18%",right:-160,animation:"b2 16s ease-in-out infinite",filter:"blur(2px)"}} />
      <div style={{position:"absolute",width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle,rgba(236,72,153,0.22) 0%,transparent 65%)",bottom:-80,left:"28%",animation:"b3 19s ease-in-out infinite",filter:"blur(2px)"}} />
      <div style={{position:"absolute",width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.18) 0%,transparent 65%)",bottom:"8%",right:"4%",animation:"b1 22s ease-in-out infinite reverse",filter:"blur(2px)"}} />
    </div>
  );
}

// ── Language toggle ───────────────────────────────────────────────────────────

function LangToggle({ lang, setLang }) {
  return (
    <button className="lang-btn" onClick={() => setLang(l => {
      const next = l === "en" ? "ro" : "en";
      localStorage.setItem(LANG_KEY, next);
      return next;
    })} title="Switch language / Schimbă limba">
      <span className={`lang-seg${lang === "en" ? " active" : ""}`}>EN</span>
      <span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}>·</span>
      <span className={`lang-seg${lang === "ro" ? " active" : ""}`}>RO</span>
    </button>
  );
}

// ── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen({ lang, setLang }) {
  const t = T[lang];
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");

  async function loginWithGoogle() {
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (error) { setErr(error.message); setBusy(false); }
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",position:"relative"}}>
      <Background />
      <div style={{position:"absolute",top:16,right:16,zIndex:10}}>
        <LangToggle lang={lang} setLang={setLang} />
      </div>
      <div className="gc-strong" style={{maxWidth:400,width:"100%",padding:"2rem",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div className="gc" style={{display:"inline-flex",padding:"12px",borderRadius:20,marginBottom:16}}>
            <Package size={28} style={{color:"#a78bfa"}} aria-hidden />
          </div>
          <h1 style={{fontSize:22,fontWeight:700,color:"white",letterSpacing:"-0.02em"}}>{t.appName}</h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:6}}>{t.loginSub}</p>
        </div>
        <button onClick={loginWithGoogle} disabled={busy}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"13px 16px",background:"white",border:"none",borderRadius:14,cursor:"pointer",fontSize:15,fontWeight:500,color:"#1f1f1f",fontFamily:"'DM Sans',sans-serif",opacity:busy?0.7:1,transition:"opacity .15s"}}>
          {busy ? <Loader size={18} style={{animation:"spin 1s linear infinite",color:"#4285f4"}} /> : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {busy ? t.loginConnecting : t.loginBtn}
        </button>
        {err && <p style={{fontSize:12,color:"#f87171",marginTop:12,textAlign:"center"}}>{err}</p>}
        <p style={{fontSize:11,color:"rgba(255,255,255,0.2)",textAlign:"center",marginTop:20,lineHeight:1.6}}>{t.loginNote}</p>
      </div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────

function MainApp({ user, lang, setLang }) {
  const t = T[lang];
  const [pkgs, setPkgs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter]           = useState("Toate");
  const [search, setSearch]           = useState("");
  const [editId, setEditId]           = useState(null);
  const [form, setForm]               = useState(emptyForm());
  const [formErr, setFormErr]         = useState("");
  const [checking, setChecking]       = useState(new Set());
  const [showExp, setShowExp]         = useState(false);
  const exportRef                     = useRef(null);

  useEffect(() => {
    loadPkgs();

    // Realtime subscription — actualizează automat când cron-ul modifică datele
    const channel = supabase
      .channel("packages-realtime")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "packages",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setPkgs(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else if (payload.eventType === "INSERT") {
          setPkgs(prev => [payload.new, ...prev]);
        } else if (payload.eventType === "DELETE") {
          setPkgs(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!showExp) return;
    const fn = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setShowExp(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [showExp]);

  async function loadPkgs() {
    setLoading(true);
    const { data, error } = await supabase.from("packages").select("*").order("created_at", { ascending: false });
    if (!error && data) setPkgs(data);
    setLoading(false);
  }

  function openForm(p = null) {
    setForm(p ? { name:p.name, awb:p.awb, courier:p.courier, status:p.status, date:p.date, notes:p.notes||"", shop:p.shop||"", amount:p.amount||"", order_number:p.order_number||"" } : emptyForm());
    setEditId(p ? p.id : null);
    setFormErr("");
    setShowForm(true);
  }

  async function submit() {
    if (!form.name.trim()) { setFormErr(t.formErr); return; }
    if (form.status !== "Comandat" && !form.awb.trim()) { setFormErr(t.formErrAwb); return; }
    const entry = { ...form, name: form.name.trim(), awb: form.awb.trim() };
    if (editId) {
      const { error } = await supabase.from("packages").update(entry).eq("id", editId);
      if (error) { setFormErr(t.saveErr + error.message); return; }
      setPkgs(prev => prev.map(p => p.id === editId ? { ...p, ...entry } : p));
    } else {
      const newPkg = { ...entry, id: Date.now().toString(), user_id: user.id };
      const { error } = await supabase.from("packages").insert(newPkg);
      if (error) { setFormErr(t.saveErr + error.message); return; }
      setPkgs(prev => [newPkg, ...prev]);
    }
    setShowForm(false); setEditId(null);
  }

  async function del(id) {
    await supabase.from("packages").delete().eq("id", id);
    setPkgs(prev => prev.filter(p => p.id !== id));
  }

  async function setStatus(id, status) {
    await supabase.from("packages").update({ status }).eq("id", id);
    setPkgs(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  function getUrl(p) { const c = COURIERS.find(c => c.name === p.courier); return c?.url ? c.url(p.awb) : null; }

  async function checkOne(p) {
    if (checking.has(p.id)) return;
    setChecking(prev => new Set([...prev, p.id]));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ awb: p.awb, courier: p.courier }),
      });
      const result = await res.json();
      const updates = {
        tracked_status: (result.status && result.status !== "unknown") ? result.status : "unknown",
        last_checked: new Date().toISOString(),
      };
      await supabase.from("packages").update(updates).eq("id", p.id);
      setPkgs(prev => prev.map(x => x.id !== p.id ? x : { ...x, ...updates }));
    } catch (_) {
      const updates = { tracked_status: "error", last_checked: new Date().toISOString() };
      await supabase.from("packages").update(updates).eq("id", p.id);
      setPkgs(prev => prev.map(x => x.id !== p.id ? x : { ...x, ...updates }));
    }
    setChecking(prev => { const n = new Set(prev); n.delete(p.id); return n; });
  }

  async function checkAll() {
    const active = pkgs.filter(p => p.status !== "Livrat");
    for (const p of active) { await checkOne(p); await new Promise(r => setTimeout(r, 400)); }
  }

  function exportCSV() {
    const h = t.exportHeaders;
    const rows = pkgs.map(p => [p.name,p.order_number||"",p.awb,p.courier,t.statuses[p.status]||p.status,p.date,p.shop||"",p.amount||"",p.notes||"",p.last_event||"",p.last_location||"",p.last_checked?new Date(p.last_checked).toLocaleString():"" ]);
    const csv = [h,...rows].map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff"+csv], {type:"text/csv;charset=utf-8;"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download="parcels.csv"; a.click();
    setShowExp(false);
  }

  function exportXLSX() {
    const headers = t.exportHeaders;
    const data = pkgs.map(p => ({
      [headers[0]]:p.name, [headers[1]]:p.order_number||"", [headers[2]]:p.awb, [headers[3]]:p.courier,
      [headers[4]]:t.statuses[p.status]||p.status, [headers[5]]:p.date,
      [headers[6]]:p.shop||"", [headers[7]]:p.amount||"", [headers[8]]:p.notes||"",
      [headers[9]]:p.last_event||"", [headers[10]]:p.last_location||"",
      [headers[11]]:p.last_checked?new Date(p.last_checked).toLocaleString():"",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parcels");
    XLSX.writeFile(wb, "parcels.xlsx");
    setShowExp(false);
  }

  const counts = STATUSES.reduce((a, s) => ({ ...a, [s]: pkgs.filter(p => p.status === s).length }), {});
  const anyChecking = checking.size > 0;
  const filtered = pkgs.filter(p => {
    const okS = filter === "Toate" || p.status === filter;
    const q = search.toLowerCase();
    const okQ = !q || p.name.toLowerCase().includes(q) || p.awb.toLowerCase().includes(q) || (p.shop||"").toLowerCase().includes(q);
    return okS && okQ;
  });

  const SC_FALLBACK = { color: "#94a3b8", bg: "rgba(148,163,184,0.18)", border: "rgba(148,163,184,0.45)" };
  const LBL = (s) => t.statuses[s] || s;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",position:"relative"}}>
      <Background />
      <div style={{position:"relative",zIndex:1,padding:"1.5rem 1.25rem",maxWidth:800,margin:"0 auto"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.5rem",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
            <div className="gc" style={{padding:9,borderRadius:16,display:"flex",flexShrink:0}}>
              <Package size={20} style={{color:"#a78bfa"}} aria-hidden />
            </div>
            <div>
              <h1 style={{fontSize:18,fontWeight:600,color:"white",letterSpacing:"-0.01em"}}>{t.appName}</h1>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:1}}>
                {loading ? t.loading : (pkgs.length === 0 ? t.noParcel : t.parcels(pkgs.length))}
              </p>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <LangToggle lang={lang} setLang={setLang} />
            <button className="gb" onClick={checkAll} disabled={anyChecking||pkgs.filter(p=>p.status!=="Livrat").length===0}>
              <RefreshCw size={14} className={anyChecking?"spin":""} aria-hidden />
              {anyChecking ? t.checking : t.checkAll}
            </button>
            <div style={{position:"relative"}} ref={exportRef}>
              <button className="gb" onClick={()=>setShowExp(v=>!v)}>
                <Download size={14} aria-hidden /> {t.export} <ChevronDown size={12} aria-hidden />
              </button>
              {showExp && (
                <div className="em">
                  <button className="ei" onClick={exportCSV}><FileText size={14} aria-hidden /> {t.downloadCSV}</button>
                  <button className="ei" onClick={exportXLSX}><FileText size={14} aria-hidden /> {t.downloadExcel}</button>
                </div>
              )}
            </div>
            <button className="gb gbp" onClick={()=>openForm()}>
              <Plus size={14} aria-hidden /> {t.add}
            </button>
            <button className="ib" onClick={()=>supabase.auth.signOut()} title={t.signOut}>
              <LogOut size={13} aria-hidden />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{position:"relative",marginBottom:"1rem"}}>
          <Search size={13} aria-hidden style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)"}} />
          <input className="gi" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{paddingLeft:36}} />
          {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.35)",display:"flex",padding:2}}><X size={13} /></button>}
        </div>

        {/* Filters */}
        {pkgs.length > 0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"}}>
            <button className={`fp${filter==="Toate"?" act":""}`} onClick={()=>setFilter("Toate")}>{t.all} ({pkgs.length})</button>
            {STATUSES.filter(s=>counts[s]>0).map(s=>(
              <button key={s} className={`fp${filter===s?" act":""}`} onClick={()=>setFilter(filter===s?"Toate":s)}
                style={filter===s?{background:SC[s].bg,borderColor:SC[s].border,color:SC[s].color}:{}}>
                {LBL(s)} ({counts[s]})
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="gc-strong" style={{padding:"1.5rem",marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
              <h2 style={{fontSize:15,fontWeight:600,color:"white"}}>{editId ? t.editParcel : t.newParcel}</h2>
              <button className="ib" onClick={()=>{setShowForm(false);setEditId(null)}}><X size={14} /></button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,overflow:"hidden"}}>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.description}</label>
                <input className="gi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={t.descPlaceholder} />
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.orderNumber}</label>
                <input className="gi" value={form.order_number} onChange={e=>setForm({...form,order_number:e.target.value})} placeholder={t.orderNumberPlaceholder} />
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{form.status === "Comandat" ? t.awb : t.awbRequired}</label>
                <input className="gi" value={form.awb} onChange={e=>setForm({...form,awb:e.target.value})} placeholder={t.awbPlaceholder} style={{fontFamily:"monospace"}} />
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.courier}</label>
                <select className="gi" value={form.courier} onChange={e=>setForm({...form,courier:e.target.value})}>
                  {COURIERS.map(c=><option key={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.shop}</label>
                <input className="gi" value={form.shop} onChange={e=>setForm({...form,shop:e.target.value})} placeholder={t.shopPlaceholder} />
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.amount}</label>
                <input className="gi" type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder={t.amountPlaceholder} />
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.status}</label>
                <select className="gi" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {STATUSES.map(s=><option key={s} value={s}>{LBL(s)}</option>)}
                </select>
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.orderDate}</label>
                <input type="date" className="gi" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{colorScheme:"dark",maxWidth:"100%",minWidth:0}} />
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.notes}</label>
                <input className="gi" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder={t.notesPlaceholder} />
              </div>
            </div>
            {formErr && <p style={{fontSize:12,color:"#f87171",marginTop:8}}>{formErr}</p>}
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:"1.25rem"}}>
              <button className="gb" onClick={()=>{setShowForm(false);setEditId(null)}}>{t.cancel}</button>
              <button className="gb gbp" onClick={submit}>{editId ? t.save : t.addParcel}</button>
            </div>
          </div>
        )}

        {/* Package list */}
        {loading ? (
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.35)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={16} className="spin" aria-hidden /> {t.loadingParcels}
          </div>
        ) : pkgs.length === 0 ? (
          <div className="gc" style={{padding:"4rem 1rem",textAlign:"center"}}>
            <Package size={36} aria-hidden style={{color:"rgba(255,255,255,0.18)",marginBottom:12}} />
            <p style={{color:"rgba(255,255,255,0.55)",fontSize:14}}>{t.noParcelAdded}</p>
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,marginTop:4}}>{t.noParcelSub}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.35)",fontSize:13}}>{t.noMatch}</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(p => {
  const SC_FALLBACK_CARD = { color: "#94a3b8", bg: "rgba(148,163,184,0.18)", border: "rgba(148,163,184,0.45)" };
              const cfg = SC[p.status] || SC_FALLBACK_CARD;
              const url = getUrl(p);
              const chk = checking.has(p.id);
              return (
                <div key={p.id} className="pkg">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:5}}>
                        <span style={{fontWeight:500,fontSize:15,color:"white"}}>{p.name}</span>
                        <span className="sp" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>{LBL(p.status)}</span>
                        {p.amount && <span className="sp" style={{background:"rgba(52,211,153,0.12)",color:"#34d399",borderColor:"rgba(52,211,153,0.35)",fontSize:11}}>{Number(p.amount).toLocaleString("ro-RO",{minimumFractionDigits:2,maximumFractionDigits:2})} RON</span>}
                      </div>
                      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                        {p.order_number && <span style={{fontSize:13,color:"rgba(255,255,255,0.55)",fontWeight:500}}>#{p.order_number.replace(/^#/,"")}</span>}
                        <span style={{fontFamily:"monospace",fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.awb}</span>
                        <span style={{fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.courier}</span>
                        {p.shop && <span style={{fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.shop}</span>}
                        <span style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>
                          {new Date(p.date+"T12:00:00").toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO",{day:"numeric",month:"short",year:"numeric"})}
                        </span>
                      </div>
                      {p.notes && <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginTop:4}}>{p.notes}</div>}
                      {(p.last_checked || chk) && (
                        <div className="ti" style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          {chk ? (
                            <span style={{fontSize:12,color:"rgba(255,255,255,0.42)",display:"flex",alignItems:"center",gap:6}}>
                              <Loader size={11} className="spin" aria-hidden /> {t.verifying}
                            </span>
                          ) : (
                            <>
                              <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.verified}:</span>
                              {p.tracked_status && p.tracked_status !== "unknown" && p.tracked_status !== "error" ? (
                                (() => { const tcfg = SC[p.tracked_status] || SC_FALLBACK; return (
                                  <span className="sp" style={{background:tcfg.bg,color:tcfg.color,borderColor:tcfg.border,cursor:"default"}}>
                                    {LBL(p.tracked_status)}
                                  </span>
                                ); })()
                              ) : (
                                <span style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>{t.noTrackingInfo}</span>
                              )}
                              {p.last_checked && (
                                <span style={{fontSize:11,color:"rgba(255,255,255,0.22)"}}>
                                  · {new Date(p.last_checked).toLocaleString(lang==="en"?"en-GB":"ro-RO",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"})}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:4,flexShrink:0,alignItems:"flex-start"}}>
                      {<button className="ib" onClick={()=>checkOne(p)} disabled={chk} title={t.checkStatus}><RefreshCw size={13} className={chk?"spin":""} aria-hidden /></button>}
                      {url && <a href={url} target="_blank" rel="noreferrer" className="ib" title={t.trackExternal}><ExternalLink size={13} /></a>}
                      <button className="ib" onClick={()=>openForm(p)} style={{padding:"6px 10px"}}>Edit</button>
                      <button className="ib ibx" onClick={()=>del(p.id)} aria-label={t.delete}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginRight:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.quickStatus}</span>
                    {STATUSES.map(s => {
                      const c = SC[s]; const act = p.status===s;
                      return <button key={s} className="sp" onClick={()=>setStatus(p.id,s)} style={{background:act?c.bg:"rgba(255,255,255,0.04)",color:act?c.color:"rgba(255,255,255,0.32)",borderColor:act?c.border:"rgba(255,255,255,0.07)"}}>{LBL(s)}</button>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{height:"2rem"}} />
      </div>

      {showSettings && <div/>}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession]         = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [lang, setLang]               = useState(() => localStorage.getItem(LANG_KEY) || "en");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoadingAuth(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      {loadingAuth ? (
        <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Background />
        </div>
      ) : session ? (
        <MainApp user={session.user} lang={lang} setLang={setLang} />
      ) : (
        <LoginScreen lang={lang} setLang={setLang} />
      )}
    </>
  );
}
