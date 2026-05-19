import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, ExternalLink, X, Search, Package, Download,
  RefreshCw, FileText, Loader, ChevronDown, KeyRound, Eye,
  EyeOff, LogOut, Mail, CheckCircle,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "./supabase.js";

// ── Constants ────────────────────────────────────────────────────────────────

const COURIERS = [
  { name: "FAN Courier",  url: (a) => `https://www.fancourier.ro/awb-tracking/?awb=${a}` },
  { name: "Cargus",       url: (a) => `https://www.cargus.ro/tracking-colet/?Awb=${a}` },
  { name: "Sameday",      url: (a) => `https://sameday.ro/status-colet/?awb=${a}` },
  { name: "DPD",          url: (a) => `https://tracking.dpd.ro/?parcelNumber=${a}` },
  { name: "GLS",          url: (a) => `https://gls-group.eu/RO/ro/track-trace.html?match=${a}` },
  { name: "Posta Romana", url: (a) => `https://tracking.posta.ro/?awb=${a}` },
  { name: "Alta",         url: null },
];

const STATUSES = ["Comandat", "In procesare", "In tranzit", "La livrare", "Livrat", "Retur"];

const SC = {
  "Comandat":     { color: "#94a3b8", bg: "rgba(148,163,184,0.18)", border: "rgba(148,163,184,0.45)" },
  "In procesare": { color: "#fbbf24", bg: "rgba(251,191,36,0.18)",  border: "rgba(251,191,36,0.45)" },
  "In tranzit":   { color: "#60a5fa", bg: "rgba(96,165,250,0.18)",  border: "rgba(96,165,250,0.45)" },
  "La livrare":   { color: "#a78bfa", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.45)" },
  "Livrat":       { color: "#34d399", bg: "rgba(52,211,153,0.18)",  border: "rgba(52,211,153,0.45)" },
  "Retur":        { color: "#f87171", bg: "rgba(248,113,113,0.18)", border: "rgba(248,113,113,0.45)" },
};

const CATEGORIES = ["Electronice", "Componente PC", "Gaming", "Cărți", "Îmbrăcăminte",
                    "Accesorii", "Sport", "Casă", "Altele"];

const API_KEY_STORAGE = "tracker-anthropic-key";

const emptyForm = () => ({
  name: "", awb: "", courier: "FAN Courier", status: "Comandat",
  date: new Date().toISOString().split("T")[0], notes: "", shop: "", category: "Electronice",
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
  a{color:inherit;text-decoration:none}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:2px}
`;

// ── Animated background ──────────────────────────────────────────────────────

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

// ── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState("");

  async function handleLogin() {
    if (!email.trim()) return;
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",position:"relative"}}>
      <Background />
      <div className="gc-strong" style={{maxWidth:400,width:"100%",padding:"2rem",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"1.75rem"}}>
          <div className="gc" style={{display:"inline-flex",padding:"12px",borderRadius:20,marginBottom:16}}>
            <Package size={28} style={{color:"#a78bfa"}} aria-hidden />
          </div>
          <h1 style={{fontSize:22,fontWeight:700,color:"white",letterSpacing:"-0.02em"}}>Tracker Colete</h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:6}}>Urmărește-ți coletele de pe orice device</p>
        </div>

        {sent ? (
          <div style={{textAlign:"center"}}>
            <CheckCircle size={40} style={{color:"#34d399",marginBottom:12}} aria-hidden />
            <p style={{color:"white",fontSize:15,fontWeight:500,marginBottom:8}}>Verifică-ți email-ul</p>
            <p style={{color:"rgba(255,255,255,0.45)",fontSize:13,lineHeight:1.6}}>
              Am trimis un link de autentificare la <strong style={{color:"rgba(255,255,255,0.75)"}}>{email}</strong>. Apasă linkul din email pentru a intra în aplicație.
            </p>
            <button className="gb" style={{marginTop:"1.25rem",width:"100%",justifyContent:"center"}} onClick={()=>setSent(false)}>
              Încearcă cu alt email
            </button>
          </div>
        ) : (
          <>
            <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:6,letterSpacing:"0.07em",textTransform:"uppercase"}}>
              Adresa de email
            </label>
            <div style={{position:"relative",marginBottom:12}}>
              <Mail size={14} aria-hidden style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)"}} />
              <input
                className="gi"
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                placeholder="nume@exemplu.com"
                style={{paddingLeft:36}}
                autoFocus
              />
            </div>
            {err && <p style={{fontSize:12,color:"#f87171",marginBottom:10}}>{err}</p>}
            <button className="gb gbp" style={{width:"100%",justifyContent:"center",padding:"11px 14px"}} onClick={handleLogin} disabled={busy||!email.trim()}>
              {busy ? <Loader size={14} className="spin" aria-hidden /> : <Mail size={14} aria-hidden />}
              {busy ? "Se trimite..." : "Trimite link de autentificare"}
            </button>
            <p style={{fontSize:11,color:"rgba(255,255,255,0.25)",textAlign:"center",marginTop:14,lineHeight:1.6}}>
              Fără parolă. Primești un link pe email, apesi și ești autentificat pe orice device.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── Settings modal ────────────────────────────────────────────────────────────

function SettingsModal({ apiKey, onSave, onClose }) {
  const [val, setVal]       = useState(apiKey);
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:460,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"white",display:"flex",alignItems:"center",gap:8}}>
            <KeyRound size={15} aria-hidden style={{color:"#a78bfa"}} /> Setări tracking automat
          </h2>
          <button className="ib" onClick={onClose}><X size={14} aria-label="Închide" /></button>
        </div>
        <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:6,letterSpacing:"0.07em",textTransform:"uppercase"}}>
          Anthropic API Key
        </label>
        <div style={{position:"relative",marginBottom:10}}>
          <input className="gi" type={showKey?"text":"password"} value={val} onChange={e=>setVal(e.target.value)}
            placeholder="sk-ant-api03-..." style={{paddingRight:40,fontFamily:"monospace",fontSize:12}} />
          <button onClick={()=>setShowKey(v=>!v)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",display:"flex",padding:2}}>
            {showKey ? <EyeOff size={13} aria-label="Ascunde" /> : <Eye size={13} aria-label="Afișează" />}
          </button>
        </div>
        <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:"1.25rem",lineHeight:1.6}}>
          Necesar pentru verificarea automată a statusului. Se salvează doar în browser-ul curent.{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{color:"#a78bfa"}}>Generează key →</a>
        </p>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
          <button className="gb" onClick={onClose}>Anulează</button>
          <button className="gb gbp" onClick={()=>onSave(val.trim())}>Salvează</button>
        </div>
      </div>
    </div>
  );
}

// ── Main app ──────────────────────────────────────────────────────────────────

function MainApp({ user }) {
  const [pkgs, setPkgs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter]     = useState("Toate");
  const [search, setSearch]     = useState("");
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(emptyForm());
  const [formErr, setFormErr]   = useState("");
  const [checking, setChecking] = useState(new Set());
  const [showExp, setShowExp]   = useState(false);
  const [apiKey, setApiKey]     = useState(() => localStorage.getItem(API_KEY_STORAGE) || "");
  const exportRef               = useRef(null);

  // Load packages from Supabase
  useEffect(() => {
    loadPkgs();
  }, []);

  // Close export menu on outside click
  useEffect(() => {
    if (!showExp) return;
    const fn = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setShowExp(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [showExp]);

  async function loadPkgs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setPkgs(data);
    setLoading(false);
  }

  // ── CRUD ────────────────────────────────────────────────────────────────────

  function openForm(p = null) {
    setForm(p
      ? { name:p.name, awb:p.awb, courier:p.courier, status:p.status, date:p.date,
          notes:p.notes||"", shop:p.shop||"", category:p.category||"Altele" }
      : emptyForm());
    setEditId(p ? p.id : null);
    setFormErr("");
    setShowForm(true);
  }

  async function submit() {
    if (!form.name.trim() || !form.awb.trim()) { setFormErr("Completează descrierea și AWB-ul."); return; }
    const entry = { ...form, name: form.name.trim(), awb: form.awb.trim() };

    if (editId) {
      const { error } = await supabase.from("packages").update(entry).eq("id", editId);
      if (!error) setPkgs(prev => prev.map(p => p.id === editId ? { ...p, ...entry } : p));
    } else {
      const newPkg = { ...entry, id: Date.now().toString(), user_id: user.id };
      const { error } = await supabase.from("packages").insert(newPkg);
      if (!error) setPkgs(prev => [newPkg, ...prev]);
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

  // ── Auto-tracking ────────────────────────────────────────────────────────────

  async function checkOne(p) {
    if (checking.has(p.id) || !apiKey) return;
    setChecking(prev => new Set([...prev, p.id]));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `Ești un asistent de tracking colete pentru România. Caută pe web statusul curent al AWB-ului primit.
Returnează DOAR un obiect JSON valid (fără markdown, fără cod, fără explicații) cu câmpurile:
- status: exact unul din: "Comandat","In procesare","In tranzit","La livrare","Livrat","Retur"
- lastEvent: ultimul eveniment în română, max 80 caractere
- lastLocation: oraș/locație sau șir gol
Dacă nu găsești informații: {"status":"unknown","lastEvent":"Nu s-au găsit informații de tracking","lastLocation":""}`,
          messages: [{ role: "user", content: `Tracking AWB: ${p.awb}, curier: ${p.courier}, România. JSON only.` }],
        }),
      });

      const data = await res.json();
      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      const result = JSON.parse(text.replace(/```json|```/g, "").trim());

      const updates = {
        last_event: result.lastEvent || "",
        last_location: result.lastLocation || "",
        last_checked: new Date().toISOString(),
        ...(result.status && result.status !== "unknown" ? { status: result.status } : {}),
      };
      await supabase.from("packages").update(updates).eq("id", p.id);
      setPkgs(prev => prev.map(x => x.id !== p.id ? x : { ...x, ...updates }));
    } catch (_) {
      const updates = { last_event: "Eroare la verificare", last_checked: new Date().toISOString() };
      await supabase.from("packages").update(updates).eq("id", p.id);
      setPkgs(prev => prev.map(x => x.id !== p.id ? x : { ...x, ...updates }));
    }

    setChecking(prev => { const n = new Set(prev); n.delete(p.id); return n; });
  }

  async function checkAll() {
    const active = pkgs.filter(p => p.status !== "Livrat" && p.status !== "Retur");
    for (const p of active) { await checkOne(p); await new Promise(r => setTimeout(r, 400)); }
  }

  // ── Export ───────────────────────────────────────────────────────────────────

  function exportCSV() {
    const h = ["Descriere","AWB","Curier","Status","Data","Magazin","Categorie","Note","Ultimul eveniment","Locatie"];
    const rows = pkgs.map(p => [p.name,p.awb,p.courier,p.status,p.date,p.shop||"",p.category||"",p.notes||"",p.last_event||"",p.last_location||""]);
    const csv = [h,...rows].map(r => r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff"+csv], {type:"text/csv;charset=utf-8;"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download="colete.csv"; a.click();
    setShowExp(false);
  }

  function exportXLSX() {
    const data = pkgs.map(p => ({
      "Descriere":p.name, "AWB":p.awb, "Curier":p.courier, "Status":p.status, "Data":p.date,
      "Magazin":p.shop||"", "Categorie":p.category||"", "Note":p.notes||"",
      "Ultimul eveniment":p.last_event||"", "Locatie":p.last_location||"",
      "Ultima verificare":p.last_checked ? new Date(p.last_checked).toLocaleString("ro-RO") : "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Colete");
    XLSX.writeFile(wb, "colete.xlsx");
    setShowExp(false);
  }

  function saveApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
    setShowSettings(false);
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const counts   = STATUSES.reduce((a, s) => ({ ...a, [s]: pkgs.filter(p => p.status === s).length }), {});
  const anyChecking = checking.size > 0;
  const filtered = pkgs.filter(p => {
    const okS = filter === "Toate" || p.status === filter;
    const q   = search.toLowerCase();
    const okQ = !q || p.name.toLowerCase().includes(q) || p.awb.toLowerCase().includes(q) || (p.shop||"").toLowerCase().includes(q);
    return okS && okQ;
  });

  // ── Render ────────────────────────────────────────────────────────────────────

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
              <h1 style={{fontSize:18,fontWeight:600,color:"white",letterSpacing:"-0.01em"}}>Tracker colete</h1>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:1}}>
                {loading ? "Se încarcă..." : `${pkgs.length} ${pkgs.length===1?"colet":"colete"}`}
              </p>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <button className="ib" onClick={()=>setShowSettings(true)} title={apiKey?"API key configurat — tracking automat activ":"Configurează API key"} style={apiKey?{borderColor:"rgba(52,211,153,0.4)",color:"#34d399"}:{}}>
              <KeyRound size={13} aria-hidden />
            </button>
            <button className="gb" onClick={checkAll} disabled={anyChecking||!apiKey||pkgs.filter(p=>p.status!=="Livrat"&&p.status!=="Retur").length===0}
              title={!apiKey?"Adaugă API key pentru tracking automat":""}>
              <RefreshCw size={14} className={anyChecking?"spin":""} aria-hidden />
              {anyChecking ? "Se verifică..." : "Verifică toate"}
            </button>
            <div style={{position:"relative"}} ref={exportRef}>
              <button className="gb" onClick={()=>setShowExp(v=>!v)}>
                <Download size={14} aria-hidden /> Export <ChevronDown size={12} aria-hidden />
              </button>
              {showExp && (
                <div className="em">
                  <button className="ei" onClick={exportCSV}><FileText size={14} aria-hidden /> Descarcă CSV</button>
                  <button className="ei" onClick={exportXLSX}><FileText size={14} aria-hidden /> Descarcă Excel</button>
                </div>
              )}
            </div>
            <button className="gb gbp" onClick={()=>openForm()}>
              <Plus size={14} aria-hidden /> Adaugă
            </button>
            <button className="ib" onClick={()=>supabase.auth.signOut()} title="Deconectează-te">
              <LogOut size={13} aria-hidden />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{position:"relative",marginBottom:"1rem"}}>
          <Search size={13} aria-hidden style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)"}} />
          <input className="gi" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Caută după nume, AWB sau magazin..." style={{paddingLeft:36}} />
          {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.35)",display:"flex",padding:2}}><X size={13} aria-label="Șterge" /></button>}
        </div>

        {/* Filters */}
        {pkgs.length > 0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"}}>
            <button className={`fp${filter==="Toate"?" act":""}`} onClick={()=>setFilter("Toate")}>Toate ({pkgs.length})</button>
            {STATUSES.filter(s=>counts[s]>0).map(s=>(
              <button key={s} className={`fp${filter===s?" act":""}`} onClick={()=>setFilter(filter===s?"Toate":s)}
                style={filter===s?{background:SC[s].bg,borderColor:SC[s].border,color:SC[s].color}:{}}>
                {s} ({counts[s]})
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="gc-strong" style={{padding:"1.5rem",marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
              <h2 style={{fontSize:15,fontWeight:600,color:"white"}}>{editId?"Editează colet":"Colet nou"}</h2>
              <button className="ib" onClick={()=>{setShowForm(false);setEditId(null)}}><X size={14} aria-label="Închide" /></button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>Descriere / comandă *</label>
                <input className="gi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="ex. Tastatură mecanică, Monitor 27 inch..." />
              </div>
              <div>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>Număr AWB *</label>
                <input className="gi" value={form.awb} onChange={e=>setForm({...form,awb:e.target.value})} placeholder="ex. 12345678" style={{fontFamily:"monospace"}} />
              </div>
              <div>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>Curier</label>
                <select className="gi" value={form.courier} onChange={e=>setForm({...form,courier:e.target.value})}>
                  {COURIERS.map(c=><option key={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>Magazin</label>
                <input className="gi" value={form.shop} onChange={e=>setForm({...form,shop:e.target.value})} placeholder="ex. eMag, Altex, PC Garage..." />
              </div>
              <div>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>Categorie</label>
                <select className="gi" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>Status</label>
                <select className="gi" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {STATUSES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>Data comenzii</label>
                <input type="date" className="gi" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{colorScheme:"dark"}} />
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>Note (opțional)</label>
                <input className="gi" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="valoare, link produs, alte detalii..." />
              </div>
            </div>
            {formErr && <p style={{fontSize:12,color:"#f87171",marginTop:8}}>{formErr}</p>}
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:"1.25rem"}}>
              <button className="gb" onClick={()=>{setShowForm(false);setEditId(null)}}>Anulează</button>
              <button className="gb gbp" onClick={submit}>{editId?"Salvează modificările":"Adaugă colet"}</button>
            </div>
          </div>
        )}

        {/* Package list */}
        {loading ? (
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.35)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={16} className="spin" aria-hidden /> Se încarcă coletele...
          </div>
        ) : pkgs.length === 0 ? (
          <div className="gc" style={{padding:"4rem 1rem",textAlign:"center"}}>
            <Package size={36} aria-hidden style={{color:"rgba(255,255,255,0.18)",marginBottom:12}} />
            <p style={{color:"rgba(255,255,255,0.55)",fontSize:14}}>Niciun colet adăugat</p>
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,marginTop:4}}>Apasă „Adaugă" pentru a începe</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.35)",fontSize:13}}>Niciun colet nu corespunde filtrelor.</div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(p => {
              const cfg = SC[p.status];
              const url = getUrl(p);
              const chk = checking.has(p.id);
              return (
                <div key={p.id} className="pkg">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:5}}>
                        <span style={{fontWeight:500,fontSize:15,color:"white"}}>{p.name}</span>
                        <span className="sp" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>{p.status}</span>
                        {p.category && <span className="sp" style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.42)",borderColor:"rgba(255,255,255,0.1)",fontSize:11}}>{p.category}</span>}
                      </div>
                      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"monospace",fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.awb}</span>
                        <span style={{fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.courier}</span>
                        {p.shop && <span style={{fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.shop}</span>}
                        <span style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>
                          {new Date(p.date+"T12:00:00").toLocaleDateString("ro-RO",{day:"numeric",month:"short",year:"numeric"})}
                        </span>
                      </div>
                      {p.notes && <div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginTop:4}}>{p.notes}</div>}
                      {(p.last_event || chk) && (
                        <div className="ti">
                          {chk ? (
                            <span style={{fontSize:13,color:"rgba(255,255,255,0.42)",display:"flex",alignItems:"center",gap:6}}>
                              <Loader size={11} className="spin" aria-hidden /> Se caută statusul online...
                            </span>
                          ) : (
                            <div>
                              <span style={{fontSize:13,color:"rgba(255,255,255,0.75)"}}>{p.last_event}</span>
                              {p.last_location && <span style={{fontSize:13,color:"rgba(255,255,255,0.38)",marginLeft:6}}>· {p.last_location}</span>}
                              {p.last_checked && <div style={{fontSize:10,color:"rgba(255,255,255,0.22)",marginTop:3}}>Verificat {new Date(p.last_checked).toLocaleString("ro-RO",{hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"})}</div>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{display:"flex",gap:4,flexShrink:0,alignItems:"flex-start"}}>
                      {apiKey && <button className="ib" onClick={()=>checkOne(p)} disabled={chk} title="Verifică status online"><RefreshCw size={13} className={chk?"spin":""} aria-hidden /></button>}
                      {url && <a href={url} target="_blank" rel="noreferrer" className="ib" title="Tracking pe site-ul curierului"><ExternalLink size={13} aria-label="Deschide tracking extern" /></a>}
                      <button className="ib" onClick={()=>openForm(p)} style={{padding:"6px 10px"}}>Edit</button>
                      <button className="ib ibx" onClick={()=>del(p.id)} aria-label="Șterge coletul"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginRight:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>Status rapid:</span>
                    {STATUSES.map(s => {
                      const c = SC[s]; const act = p.status===s;
                      return <button key={s} className="sp" onClick={()=>setStatus(p.id,s)} style={{background:act?c.bg:"rgba(255,255,255,0.04)",color:act?c.color:"rgba(255,255,255,0.32)",borderColor:act?c.border:"rgba(255,255,255,0.07)"}}>{s}</button>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{height:"2rem"}} />
      </div>

      {showSettings && <SettingsModal apiKey={apiKey} onSave={saveApiKey} onClose={()=>setShowSettings(false)} />}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession]       = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      {loadingAuth ? (
        <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.4)",fontSize:13}}>
          <Background />
        </div>
      ) : session ? (
        <MainApp user={session.user} />
      ) : (
        <LoginScreen />
      )}
    </>
  );
}
