import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, ExternalLink, X, Search, Package, Download,
  FileText, Loader, ChevronDown, LogOut, Share2, Users, Copy,
  Check, UserPlus, RefreshCw, Sun, Moon, Smartphone,
  Archive, ArchiveRestore, BarChart3, Clock, CheckSquare, Square, UserMinus, ListChecks, Send,
} from "lucide-react";
import { supabase } from "./supabase.js";
import { T, LANG_KEY, THEME_KEY } from "./i18n.js";
import { COURIERS, STATUSES, OUT_STATUSES, SC, SC_OUT, SC_FB, STATUS_ORDER, OUT_STATUS_ORDER, emptyForm } from "./constants.js";
import { cellSafe, daysUntil, copyText, appBaseUrl, uid } from "./utils.js";
import { STYLES } from "./styles.js";

// ── Background ────────────────────────────────────────────────────────────────

function Background() {
  // tune-score look: clean flat background, no blobs/grain
  return null;
}

// ── LangToggle ────────────────────────────────────────────────────────────────

function LangToggle({lang,setLang}) {
  return (
    <button className="lang-btn" onClick={()=>setLang(l=>{const n=l==="en"?"ro":"en";localStorage.setItem(LANG_KEY,n);return n;})}>
      <span className={`lang-seg${lang==="en"?" active":""}`}>EN</span>
      <span style={{color:"rgba(var(--ink),0.2)",fontSize:10}}>·</span>
      <span className={`lang-seg${lang==="ro"?" active":""}`}>RO</span>
    </button>
  );
}

// ── ThemeToggle ───────────────────────────────────────────────────────────────

function ThemeToggle({theme,setTheme}) {
  return (
    <button className="lang-btn" title={theme==="dark"?"Light mode":"Dark mode"} aria-label="Toggle theme"
      onClick={()=>setTheme(prev=>{const n=prev==="dark"?"light":"dark";localStorage.setItem(THEME_KEY,n);return n;})}>
      <span className={`lang-seg${theme==="light"?" active":""}`}><Sun size={12}/></span>
      <span style={{color:"rgba(var(--ink),0.2)",fontSize:10}}>·</span>
      <span className={`lang-seg${theme==="dark"?" active":""}`}><Moon size={12}/></span>
    </button>
  );
}

// ── SharedParcelView ──────────────────────────────────────────────────────────

function SharedParcelView({token,lang,setLang,theme,setTheme}) {
  const t = T[lang];
  const [pkg,setPkg]       = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError]   = useState(false);

  useEffect(()=>{
    supabase.rpc("get_shared_package",{p_token:token}).then(({data,error:e})=>{
      if(e||!data){setError(true);}else{setPkg(data);}
      setLoading(false);
    });
  },[token]);

  const BASE = appBaseUrl();
  const isOut  = !!pkg && pkg.type === "out";
  const CLBL   = (s)=> isOut ? (t.outStatuses[s]||s) : (t.statuses[s]||s);
  const CFG    = (s)=> isOut ? (SC_OUT[s]||SC_FB) : (SC[s]||SC_FB);
  const showAWB = !!pkg && (isOut ? (pkg.status!=="Pregatit" && pkg.status!=="Retur") : pkg.status!=="Comandat");

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",position:"relative"}}>
      <Background/>
      <div style={{position:"relative",zIndex:1,padding:"1.5rem 1.25rem",maxWidth:800,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.5rem",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
            <div className="gc" style={{padding:9,borderRadius:16,display:"flex",flexShrink:0}}>
              <Package size={20} style={{color:"rgb(var(--accent))"}}/>
            </div>
            <div>
              <h1 style={{fontSize:18,fontWeight:600,color:"rgb(var(--ink))"}}>{t.sharedParcel}</h1>
              <p style={{fontSize:12,color:"rgba(var(--ink),0.4)",marginTop:1}}>{t.appName}</p>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <ThemeToggle theme={theme} setTheme={setTheme}/><LangToggle lang={lang} setLang={setLang}/>
            <a href={BASE} className="gb">{t.backToApp}</a>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(var(--ink),0.4)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={16} className="spin"/> {t.loading}
          </div>
        ) : error||!pkg ? (
          <div className="gc" style={{padding:"3rem",textAlign:"center"}}>
            <Package size={32} style={{color:"rgba(var(--ink),0.15)",marginBottom:12}}/>
            <p style={{color:"rgba(var(--ink),0.4)",fontSize:14}}>{t.invalidInvite}</p>
          </div>
        ) : (()=>{
          const cfg=CFG(pkg.status);
          const courier=COURIERS.find(c=>c.name===pkg.courier);
          const url=courier?.url&&pkg.awb?courier.url(pkg.awb):null;
          return (
            <div className="pkg">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:5}}>
                    <span style={{fontWeight:500,fontSize:15,color:"rgb(var(--ink))"}}>{pkg.name}</span>
                    <span className="sp" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border,cursor:"default"}}>{CLBL(pkg.status)}</span>
                    {pkg.amount&&<span className="sp" style={{background:"rgba(var(--ink),0.06)",color:"rgba(var(--ink),0.72)",borderColor:"rgba(var(--ink),0.16)",fontSize:11,cursor:"default"}}>{Number(pkg.amount).toLocaleString("ro-RO",{minimumFractionDigits:2,maximumFractionDigits:2})} RON</span>}
                  </div>
                  <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                    {pkg.order_number&&<span style={{fontSize:13,color:"rgba(var(--ink),0.55)",fontWeight:500}}>#{pkg.order_number.replace(/^#/,"")}</span>}
                    {showAWB&&pkg.awb&&<span style={{fontFamily:"monospace",fontSize:13,color:"rgba(var(--ink),0.42)"}}>{pkg.awb}</span>}
                    {showAWB&&pkg.courier&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{pkg.courier}</span>}
                    {isOut ? (pkg.client_name&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{pkg.client_name}</span>) : (pkg.shop&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{pkg.shop}</span>)}
                    {pkg.date&&<span style={{fontSize:13,color:"rgba(var(--ink),0.3)"}}>{new Date(pkg.date+"T12:00:00").toLocaleDateString(lang==="en"?"en-GB":"ro-RO",{day:"numeric",month:"short",year:"numeric"})}</span>}
                  </div>
                  {pkg.notes&&<div style={{fontSize:13,color:"rgba(var(--ink),0.3)",marginTop:4}}>{pkg.notes}</div>}
                </div>
                {url&&pkg.awb&&<a href={url} target="_blank" rel="noreferrer" className="ib" title={t.trackExternal}><ExternalLink size={13}/></a>}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── ShareModal ────────────────────────────────────────────────────────────────

function ShareModal({shareUrl,onClose,t}) {
  const [copied,setCopied]=useState(false);
  async function copy(){
    const ok=await copyText(shareUrl);
    if(ok){setCopied(true);setTimeout(()=>setCopied(false),2000);}
  }
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:460,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))",display:"flex",alignItems:"center",gap:8}}>
            <Share2 size={15} style={{color:"rgb(var(--accent))"}}/> {t.shareTitle}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>
        <p style={{fontSize:13,color:"rgba(var(--ink),0.5)",marginBottom:"1rem",lineHeight:1.6}}>{t.shareDesc}</p>
        <div style={{display:"flex",gap:8,marginBottom:"1rem"}}>
          <input className="gi" readOnly value={shareUrl} style={{fontFamily:"monospace",fontSize:11}} onClick={e=>e.target.select()}/>
          <button className="gb gbp" onClick={copy} style={{flexShrink:0,whiteSpace:"nowrap"}}>
            {copied?<Check size={13}/>:<Copy size={13}/>}
            {copied?t.copied:t.copyLink}
          </button>
        </div>
        <button className="gb" onClick={onClose} style={{width:"100%",justifyContent:"center"}}>{t.cancel}</button>
      </div>
    </div>
  );
}

// ── GroupModal ────────────────────────────────────────────────────────────────

function GroupModal({user,onClose,onCreated,t}) {
  const [name,setName]           = useState("");
  const [busy,setBusy]           = useState(false);
  const [created,setCreated]     = useState(null);
  const [copiedInv,setCopiedInv] = useState(false);

  async function createGroup() {
    if(!name.trim())return;
    setBusy(true);
    // Atomic create: grup + rândul de owner în group_members, într-o singură
    // cerere. Cele două INSERT-uri separate eșuau pentru că policy-ul SELECT
    // pe `groups` cere apartenența la grup înainte ca owner-ul să fie membru
    // (PostgREST răspundea PGRST116, data=null și grup rămas orfan).
    const {data,error}=await supabase.rpc("create_group_with_owner",{p_name:name.trim()});
    if(!error&&data){setCreated(data);onCreated(data);}
    setBusy(false);
  }

  const BASE=appBaseUrl();
  const inviteUrl=created?`${BASE}#invite/${created.invite_code}`:"";

  async function copyInvite(){
    const ok=await copyText(inviteUrl);
    if(ok){setCopiedInv(true);setTimeout(()=>setCopiedInv(false),2000);}
  }

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:460,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))",display:"flex",alignItems:"center",gap:8}}>
            <Users size={15} style={{color:"rgb(var(--accent))"}}/> {created?t.inviteTitle:t.newGroup}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>
        {!created?(
          <>
            <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:6,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.groupName}</label>
            <input className="gi" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createGroup()} placeholder={t.groupNamePlaceholder} autoFocus style={{marginBottom:14}}/>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
              <button className="gb" onClick={onClose}>{t.cancel}</button>
              <button className="gb gbp" onClick={createGroup} disabled={busy||!name.trim()}>
                {busy?<Loader size={13} className="spin"/>:<Plus size={13}/>}
                {t.createGroup}
              </button>
            </div>
          </>
        ):(
          <>
            <p style={{fontSize:13,color:"rgba(var(--ink),0.5)",marginBottom:"1rem",lineHeight:1.6}}>{t.inviteDesc}</p>
            <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:6,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.inviteLink}</label>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <input className="gi" readOnly value={inviteUrl} style={{fontFamily:"monospace",fontSize:11}} onClick={e=>e.target.select()}/>
              <button className="gb gbp" onClick={copyInvite} style={{flexShrink:0,whiteSpace:"nowrap"}}>
                {copiedInv?<Check size={13}/>:<Copy size={13}/>}
                {copiedInv?t.copied:t.copyInvite}
              </button>
            </div>
            <button className="gb" onClick={onClose} style={{width:"100%",justifyContent:"center"}}>{t.cancel}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── InviteModal (join group) ──────────────────────────────────────────────────

function InviteModal({inviteCode,onJoined,onDismiss,t}) {
  const [group,setGroup]   = useState(null);
  const [loading,setLoading] = useState(true);
  const [busy,setBusy]     = useState(false);
  const [done,setDone]     = useState(false);
  const [joinErr,setJoinErr] = useState(false);

  useEffect(()=>{
    supabase.rpc("get_group_by_invite",{p_code:inviteCode}).then(({data})=>{
      setGroup(data);setLoading(false);
    });
  },[inviteCode]);

  async function join(){
    setBusy(true);setJoinErr(false);
    const {error}=await supabase.rpc("join_group",{p_invite_code:inviteCode});
    setBusy(false);
    if(!error){setDone(true);setTimeout(()=>onJoined(group),1400);}
    else setJoinErr(true);
  }

  return (
    <div className="overlay">
      <div className="gc-strong" style={{padding:"1.75rem",maxWidth:380,width:"100%",textAlign:"center"}}>
        <div className="gc" style={{display:"inline-flex",padding:"12px",borderRadius:20,marginBottom:16}}>
          <Users size={24} style={{color:"rgb(var(--accent))"}}/>
        </div>
        {loading?(
          <div style={{color:"rgba(var(--ink),0.4)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={14} className="spin"/>{t.loading}
          </div>
        ):done?(
          <div>
            <div style={{marginBottom:8}}><Check size={36} strokeWidth={1.5}/></div>
            <p style={{color:"rgb(var(--ink))",fontSize:15,fontWeight:500}}>{t.joined}</p>
          </div>
        ):group?(
          <>
            <h2 style={{fontSize:18,fontWeight:600,color:"rgb(var(--ink))",marginBottom:6}}>{group.name}</h2>
            <p style={{fontSize:13,color:"rgba(var(--ink),0.45)",marginBottom:"1.5rem"}}>{t.joinGroup}?</p>
            {joinErr&&<p style={{fontSize:12,color:"rgb(var(--ink))",fontWeight:500,marginBottom:12}}>{t.invalidInvite}</p>}
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button className="gb" onClick={onDismiss}>{t.cancel}</button>
              <button className="gb gbp" onClick={join} disabled={busy}>
                {busy?<Loader size={13} className="spin"/>:<UserPlus size={13}/>}
                {busy?t.joiningGroup:t.joinGroup}
              </button>
            </div>
          </>
        ):(
          <p style={{color:"rgba(var(--ink),0.45)",fontSize:13}}>{t.invalidInvite}</p>
        )}
      </div>
    </div>
  );
}

// ── LoginScreen ───────────────────────────────────────────────────────────────

function LoginScreen({lang,setLang,theme,setTheme}) {
  const t=T[lang];
  const [busy,setBusy]=useState(false);
  const [err,setErr]  =useState("");

  async function loginWithGoogle(){
    setBusy(true);setErr("");
    // Redirect back to the current app location (works for any deployment:
    // GitHub Pages, custom domain, localhost dev server).
    const redirectTo=`${window.location.origin}${import.meta.env.BASE_URL}`;
    const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo}});
    if(error){setErr(error.message);setBusy(false);}
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",position:"relative"}}>
      <Background/>
      <div style={{position:"absolute",top:16,right:16,zIndex:10}}>
        <ThemeToggle theme={theme} setTheme={setTheme}/><LangToggle lang={lang} setLang={setLang}/>
      </div>
      <div className="gc-strong" style={{maxWidth:400,width:"100%",padding:"2rem",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div className="gc" style={{display:"inline-flex",padding:"12px",borderRadius:20,marginBottom:16}}>
            <Package size={28} style={{color:"rgb(var(--accent))"}}/>
          </div>
          <h1 style={{fontSize:22,fontWeight:700,color:"rgb(var(--ink))",letterSpacing:"-0.03em"}}>{t.appName}</h1>
          <p style={{fontSize:13,color:"rgba(var(--ink),0.4)",marginTop:6}}>{t.loginSub}</p>
        </div>
        <button onClick={loginWithGoogle} disabled={busy} className="gb" style={{width:"100%",justifyContent:"center",gap:10,padding:"13px 16px",fontSize:15,fontWeight:600,opacity:busy?0.7:1}}>
          {busy?<Loader size={18} className="spin"/>:(
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden style={{color:"rgb(var(--ink))"}}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"/>
            </svg>
          )}
          {busy?t.loginConnecting:t.loginBtn}
        </button>
        {err&&<p style={{fontSize:12,color:"rgb(var(--ink))",fontWeight:500,marginTop:12,textAlign:"center"}}>{err}</p>}
        <p style={{fontSize:11,color:"rgba(var(--ink),0.2)",textAlign:"center",marginTop:20,lineHeight:1.6}}>{t.loginNote}</p>
      </div>
    </div>
  );
}

// ── MoveModal ─────────────────────────────────────────────────────────────────

function MoveModal({pkg, groups, onMove, onClose, t}) {
  const [selected, setSelected] = useState(pkg.group_id || "personal");

  const options = [
    {id:"personal", name:t.myParcels},
    ...groups.map(g => ({id:g.id, name:g.name})),
  ];

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:400,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))",display:"flex",alignItems:"center",gap:8}}>
            <Users size={15} style={{color:"rgb(var(--accent))"}}/> {t.moveToGroup}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>
        <p style={{fontSize:13,color:"rgba(var(--ink),0.5)",marginBottom:"1rem"}}>{pkg.name}</p>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.25rem"}}>
          {options.map(o=>(
            <button key={o.id} onClick={()=>setSelected(o.id)}
              style={{padding:"10px 14px",borderRadius:6,border:`1px solid ${selected===o.id?"rgba(var(--accent),0.45)":"rgba(var(--ink),0.1)"}`,background:selected===o.id?"rgba(var(--accent),0.12)":"rgba(var(--ink),0.04)",color:selected===o.id?"rgb(var(--accent))":"rgba(var(--ink),0.7)",cursor:"pointer",textAlign:"left",fontSize:14,fontFamily:"inherit",display:"flex",alignItems:"center",gap:8,transition:"all .15s"}}>
              {o.id==="personal"?<Package size={13}/>:<Users size={13}/>} {o.name}
              {selected===o.id&&<Check size={13} style={{marginLeft:"auto"}}/>}
            </button>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
          <button className="gb" onClick={onClose}>{t.cancel}</button>
          <button className="gb gbp" onClick={()=>onMove(pkg, selected==="personal"?null:selected)}>
            <Users size={13}/> {t.move}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ConfirmDeleteModal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({pkg, onConfirm, onClose, t}) {
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:380,width:"100%",textAlign:"center"}}>
        <div className="gc" style={{display:"inline-flex",padding:"10px",borderRadius:10,marginBottom:14}}>
          <Trash2 size={20} style={{color:"rgb(var(--ink))"}}/>
        </div>
        <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))",marginBottom:6}}>{t.delete}</h2>
        <p style={{fontSize:13,color:"rgba(var(--ink),0.55)",marginBottom:4}}>{pkg.name}</p>
        <p style={{fontSize:12,color:"rgba(var(--ink),0.3)",marginBottom:"1.5rem"}}>{t.deleteConfirmMsg}</p>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          <button className="gb" onClick={onClose}>{t.cancel}</button>
          <button className="gb gbp" onClick={onConfirm}>
            <Trash2 size={13}/> {t.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── InstallGuideModal ─────────────────────────────────────────────────────────

function InstallGuideModal({onClose, t}) {
  const Section = ({icon, title, steps}) => (
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        {icon}
        <span style={{fontSize:13,fontWeight:600,color:"rgb(var(--ink))"}}>{title}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {steps.map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{flexShrink:0,width:20,height:20,borderRadius:6,background:"rgba(var(--accent),0.16)",color:"rgb(var(--accent))",fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{i+1}</span>
            <span style={{fontSize:13,color:"rgba(var(--ink),0.7)",lineHeight:1.45}}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:440,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))",display:"flex",alignItems:"center",gap:8}}>
            <Smartphone size={15} style={{color:"rgb(var(--accent))"}}/> {t.installTitle}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>
        <p style={{fontSize:13,color:"rgba(var(--ink),0.55)",marginBottom:"1.25rem",lineHeight:1.6}}>{t.installIntro}</p>
        <Section icon={<Share2 size={14} style={{color:"rgb(var(--accent))"}}/>} title={t.installIosTitle} steps={t.installIosSteps}/>
        <Section icon={<Smartphone size={14} style={{color:"rgb(var(--accent))"}}/>} title={t.installAndroidTitle} steps={t.installAndroidSteps}/>
        <p style={{fontSize:12,color:"rgba(var(--ink),0.4)",marginBottom:"1.25rem",lineHeight:1.5}}>{t.installNote}</p>
        <button className="gb gbp" onClick={onClose} style={{width:"100%",justifyContent:"center"}}>{t.gotIt}</button>
      </div>
    </div>
  );
}

// ── StatsModal ────────────────────────────────────────────────────────────────

function StatsModal({stats, onClose, t, out}) {
  const fmt=(n)=>n.toLocaleString("ro-RO",{minimumFractionDigits:2,maximumFractionDigits:2});
  const maxTop=Math.max(1,...stats.topShops.map(([,v])=>v));
  const maxMonth=Math.max(1,...stats.byMonth.map(([,v])=>v));
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:440,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))",display:"flex",alignItems:"center",gap:8}}>
            <BarChart3 size={15} style={{color:"rgb(var(--accent))"}}/> {t.statsTitle}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          <div className="gc" style={{padding:"12px 14px"}}>
            <div style={{fontSize:10,color:"rgba(var(--ink),0.42)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4}}>{t.statsTotalParcels}</div>
            <div style={{fontSize:22,fontWeight:700,color:"rgb(var(--ink))"}}>{stats.total}</div>
          </div>
          <div className="gc" style={{padding:"12px 14px"}}>
            <div style={{fontSize:10,color:"rgba(var(--ink),0.42)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4}}>{t.statsTotalSpent}</div>
            <div style={{fontSize:22,fontWeight:700,color:"rgb(var(--ink))"}}>{fmt(stats.totalSpent)} <span style={{fontSize:13,fontWeight:500,color:"rgba(var(--ink),0.4)"}}>RON</span></div>
          </div>
        </div>

        {stats.total===0?(
          <p style={{fontSize:13,color:"rgba(var(--ink),0.4)",textAlign:"center",padding:"1rem 0"}}>{t.statsNoData}</p>
        ):(
          <>
            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(var(--ink),0.5)",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8}}>{t.statsByStatus}</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {stats.byStatus.map(s=>(
                  <div key={s.status} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:13,color:"rgba(var(--ink),0.75)",width:90,flexShrink:0}}>{s.label}</span>
                    <div style={{flex:1,height:6,borderRadius:3,background:"rgba(var(--ink),0.07)",overflow:"hidden"}}>
                      <div style={{width:`${stats.total?(s.count/stats.total)*100:0}%`,height:"100%",background:"rgb(var(--accent))",borderRadius:3}}/>
                    </div>
                    <span style={{fontSize:12,color:"rgba(var(--ink),0.5)",width:20,textAlign:"right",flexShrink:0}}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {stats.topShops.length>0&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:600,color:"rgba(var(--ink),0.5)",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8}}>{out?t.statsTopClients:t.statsTopShops}</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {stats.topShops.map(([shop,total])=>(
                    <div key={shop} style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13,color:"rgba(var(--ink),0.75)",width:90,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{shop}</span>
                      <div style={{flex:1,height:6,borderRadius:3,background:"rgba(var(--ink),0.07)",overflow:"hidden"}}>
                        <div style={{width:`${(total/maxTop)*100}%`,height:"100%",background:"rgb(var(--accent))",borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:12,color:"rgba(var(--ink),0.5)",width:60,textAlign:"right",flexShrink:0}}>{fmt(total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.byMonth.length>0&&(
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"rgba(var(--ink),0.5)",letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8}}>{t.statsByMonth}</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {stats.byMonth.map(([month,total])=>(
                    <div key={month} style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13,color:"rgba(var(--ink),0.75)",width:90,flexShrink:0}}>{month}</span>
                      <div style={{flex:1,height:6,borderRadius:3,background:"rgba(var(--ink),0.07)",overflow:"hidden"}}>
                        <div style={{width:`${(total/maxMonth)*100}%`,height:"100%",background:"rgb(var(--accent))",borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:12,color:"rgba(var(--ink),0.5)",width:60,textAlign:"right",flexShrink:0}}>{fmt(total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── GroupMembersModal ─────────────────────────────────────────────────────────

function GroupMembersModal({group, user, isOwner, onRemove, onClose, t}) {
  const [busyId,setBusyId]=useState(null);
  const members=group.group_members||[];

  async function handleRemove(userId){
    setBusyId(userId);
    await onRemove(group.id,userId);
    setBusyId(null);
  }

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:420,width:"100%",maxHeight:"80vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))",display:"flex",alignItems:"center",gap:8}}>
            <Users size={15} style={{color:"rgb(var(--accent))"}}/> {t.groupMembers} · {group.name}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {members.map(m=>(
            <div key={m.user_id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:10,background:"rgba(var(--ink),0.04)"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:"rgb(var(--ink))",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                  {m.email||m.user_id}{m.user_id===user.id?` (${t.you})`:""}
                </div>
                <div style={{fontSize:11,color:"rgba(var(--ink),0.4)"}}>{m.role==="owner"?t.roleOwner:t.roleMember}</div>
              </div>
              {isOwner&&m.role!=="owner"&&m.user_id!==user.id&&(
                <button className="ib ibx" onClick={()=>handleRemove(m.user_id)} disabled={busyId===m.user_id} title={t.removeMember}>
                  {busyId===m.user_id?<Loader size={13} className="spin"/>:<UserMinus size={13}/>}
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="gb" onClick={onClose} style={{width:"100%",justifyContent:"center",marginTop:16}}>{t.cancel}</button>
      </div>
    </div>
  );
}

// ── MainApp ───────────────────────────────────────────────────────────────────

function MainApp({user,lang,setLang,theme,setTheme,pendingInvite}) {
  const t=T[lang];
  const [pkgs,setPkgs]             = useState([]);
  const [groups,setGroups]         = useState([]);
  const [loading,setLoading]       = useState(true);
  const [currentView,setCurrentView] = useState("personal"); // "personal" | "out" | group.id
  const [showForm,setShowForm]     = useState(false);
  const [editId,setEditId]         = useState(null);
  const [form,setForm]             = useState(emptyForm());
  const [formErr,setFormErr]       = useState("");
  const [filter,setFilter]         = useState("Toate");
  const [search,setSearch]         = useState("");
  const [showExp,setShowExp]       = useState(false);
  const [showGroupModal,setShowGroupModal] = useState(false);
  const [shareModal,setShareModal] = useState(null); // {shareUrl} or null
  const [shareLoading,setShareLoading]     = useState(null); // package id
  const [moveModal,setMoveModal]     = useState(null); // package to move
  const [deleteConfirm,setDeleteConfirm] = useState(null); // package to delete
  const [showInstall,setShowInstall] = useState(false);
  const isStandalone = typeof window!=="undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone);
  const [inviteModal,setInviteModal] = useState(pendingInvite||null);
  const [sortBy,setSortBy]         = useState("status");
  const [selectMode,setSelectMode] = useState(false);
  const [selectedIds,setSelectedIds] = useState(()=>new Set());
  const [bulkDeleteConfirm,setBulkDeleteConfirm] = useState(false);
  const [showStats,setShowStats]   = useState(false);
  const [historyOpenId,setHistoryOpenId] = useState(null);
  const [membersModal,setMembersModal] = useState(null); // group object
  const exportRef = useRef(null);

  const isOutView = currentView==="out";

  useEffect(()=>{loadAll();},[]);

  useEffect(()=>{
    const channel=supabase.channel("pkgs-rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"packages"},(payload)=>{
        if(payload.eventType==="UPDATE") setPkgs(prev=>prev.map(p=>p.id===payload.new.id?{...p,...payload.new}:p));
        else if(payload.eventType==="INSERT") setPkgs(prev=>prev.some(p=>p.id===payload.new.id)?prev:[payload.new,...prev]);
        else if(payload.eventType==="DELETE") setPkgs(prev=>prev.filter(p=>p.id!==payload.old.id));
      }).subscribe();
    return ()=>{supabase.removeChannel(channel);};
  },[]);

  useEffect(()=>{
    if(!showExp)return;
    const fn=(e)=>{if(exportRef.current&&!exportRef.current.contains(e.target))setShowExp(false);};
    document.addEventListener("mousedown",fn);
    return ()=>document.removeEventListener("mousedown",fn);
  },[showExp]);

  async function loadAll(){
    setLoading(true);
    const [{data:pkgData},{data:memberData}]=await Promise.all([
      supabase.from("packages").select("*").order("created_at",{ascending:false}),
      supabase.from("group_members").select("group_id,role,groups(id,name,invite_code,created_by)").eq("user_id",user.id),
    ]);
    if(pkgData)setPkgs(pkgData);
    if(memberData){
      const grps=memberData
        .filter(m=>m.groups)
        .map(m=>({
          ...m.groups,
          group_members:[{user_id:user.id,role:m.role}],
        }));
      setGroups(grps);
      // Fetch the real member list (RLS hides other members' rows on a direct
      // select, so this goes through a security-definer RPC).
      const withMembers=await Promise.all(grps.map(async g=>{
        const {data:members}=await supabase.rpc("get_group_members",{p_group_id:g.id});
        return members?.length ? {...g,group_members:members} : g;
      }));
      setGroups(withMembers);
    }
    setLoading(false);
  }

  function openForm(p=null){
    setForm(p?{
      name:p.name,awb:p.awb,courier:p.courier,status:p.status,
      date:p.date||emptyForm().date,notes:p.notes||"",
      shop:p.shop||"",client_name:p.client_name||"",
      amount:p.amount||"",order_number:p.order_number||"",
      products:(p.products&&p.products.length)?p.products:[{name:p.name||"",qty:1}],
      estimated_delivery:p.estimated_delivery||"",
      type:p.type||(isOutView?"out":"in"),
    }:emptyForm({out:isOutView}));
    setEditId(p?p.id:null);setFormErr("");setShowForm(true);
  }

  async function submit(){
    const validProducts=form.products.filter(p=>p.name.trim());
    if(validProducts.length===0){setFormErr(t.formErr);return;}
    const awbRequired = (form.type==="out") ? (form.status!=="Pregatit" && form.status!=="Retur") : form.status!=="Comandat";
    if(awbRequired&&!form.awb.trim()){setFormErr(t.formErrAwb);return;}
    const autoName=validProducts.map(p=>`${p.qty>1?p.qty+"× ":""}${p.name.trim()}`).join(", ");
    const out = form.type==="out";
    const entry={
      ...form,
      name:autoName,
      awb:form.awb.trim(),
      products:validProducts,
      type:out?"out":"in",
      // Se trimite oricum client_name; pentru coletele "in" e ignorat vizual.
    };
    if(editId){
      const prevPkg=pkgs.find(p=>p.id===editId);
      if(prevPkg&&prevPkg.status!==entry.status){
        entry.status_history=[...(prevPkg.status_history||[]),{status:entry.status,at:new Date().toISOString()}];
      }
      const {error}=await supabase.from("packages").update(entry).eq("id",editId);
      if(error){setFormErr(t.saveErr+error.message);return;}
      setPkgs(prev=>prev.map(p=>p.id===editId?{...p,...entry}:p));
    } else {
      const gid=out?null:(currentView!=="personal"?currentView:null);
      const status_history=[{status:entry.status,at:new Date().toISOString()}];
      const newPkg={...entry,id:uid(),user_id:user.id,group_id:gid,status_history,archived:false};
      const {error}=await supabase.from("packages").insert(newPkg);
      if(error){setFormErr(t.saveErr+error.message);return;}
      setPkgs(prev=>[newPkg,...prev]);
    }
    setShowForm(false);setEditId(null);
  }

  async function del(id){
    const {error}=await supabase.from("packages").delete().eq("id",id);
    if(!error)setPkgs(prev=>prev.filter(p=>p.id!==id));
  }

  async function setStatus(id,status){
    const pkg=pkgs.find(p=>p.id===id);
    if(pkg&&pkg.status===status)return;
    const status_history=[...(pkg?.status_history||[]),{status,at:new Date().toISOString()}];
    const {error}=await supabase.from("packages").update({status,status_history}).eq("id",id);
    if(!error)setPkgs(prev=>prev.map(p=>p.id===id?{...p,status,status_history}:p));
  }

  async function setArchived(id,archived){
    const {error}=await supabase.from("packages").update({archived}).eq("id",id);
    if(!error)setPkgs(prev=>prev.map(p=>p.id===id?{...p,archived}:p));
  }

  // Bulk actions
  function toggleSelect(id){
    setSelectedIds(prev=>{
      const next=new Set(prev);
      next.has(id)?next.delete(id):next.add(id);
      return next;
    });
  }
  function exitSelectMode(){ setSelectMode(false); setSelectedIds(new Set()); }

  async function bulkDelete(){
    const ids=[...selectedIds];
    const {error}=await supabase.from("packages").delete().in("id",ids);
    if(!error)setPkgs(prev=>prev.filter(p=>!selectedIds.has(p.id)));
    setBulkDeleteConfirm(false);
    exitSelectMode();
  }

  async function bulkSetStatus(status){
    const ids=[...selectedIds];
    const at=new Date().toISOString();
    // status_history differs per row, so each parcel needs its own request
    // (a single batched update would briefly write a stale history and race
    // with the realtime UPDATE event).
    const updates=ids.map(id=>{
      const pkg=pkgs.find(p=>p.id===id);
      const status_history=[...(pkg?.status_history||[]),{status,at}];
      return {id,status_history};
    });
    const results=await Promise.all(updates.map(u=>supabase.from("packages").update({status,status_history:u.status_history}).eq("id",u.id)));
    const okIds=new Set(updates.filter((u,i)=>!results[i].error).map(u=>u.id));
    setPkgs(prev=>prev.map(p=>okIds.has(p.id)?{...p,status,status_history:updates.find(u=>u.id===p.id).status_history}:p));
    exitSelectMode();
  }

  function getUrl(p){const c=COURIERS.find(c=>c.name===p.courier);return c?.url?c.url(p.awb):null;}

  async function shareParcel(p){
    setShareLoading(p.id);
    const {data,error}=await supabase.from("shared_links").insert({package_id:p.id,created_by:user.id}).select().single();
    setShareLoading(null);
    if(error||!data)return;
    const BASE=appBaseUrl();
    setShareModal({shareUrl:`${BASE}#share/${data.id}`});
  }

  function handleGroupCreated(g){
    setGroups(prev=>[...prev,{...g,group_members:[{user_id:user.id,role:"owner"}]}]);
  }

  function handleGroupJoined(g){
    setInviteModal(null);
    localStorage.removeItem("pending_invite");
    history.replaceState(null,"",window.location.pathname);
    if(g){
      setGroups(prev=>{
        if(prev.find(x=>x.id===g.id))return prev;
        return [...prev,{...g,group_members:[{user_id:user.id,role:"member"}]}];
      });
      setCurrentView(g.id);
      loadAll();
    }
  }

  async function leaveGroup(g){
    const isOwner=g.group_members?.some(m=>m.user_id===user.id&&m.role==="owner");
    if(isOwner){
      // Owner șterge tot grupul
      const {error}=await supabase.from("groups").delete().eq("id",g.id);
      if(!error){
        setGroups(prev=>prev.filter(x=>x.id!==g.id));
        if(currentView===g.id)setCurrentView("personal");
      }
    } else {
      // Membru iese din grup
      const {error}=await supabase.from("group_members").delete().eq("group_id",g.id).eq("user_id",user.id);
      if(!error){
        setGroups(prev=>prev.filter(x=>x.id!==g.id));
        if(currentView===g.id)setCurrentView("personal");
      }
    }
  }

  async function moveParcel(pkg, targetGroupId) {
    const group_id = targetGroupId || null;
    const {error} = await supabase.from("packages").update({group_id}).eq("id", pkg.id);
    if (!error) {
      setPkgs(prev => prev.map(p => p.id === pkg.id ? {...p, group_id} : p));
    }
    setMoveModal(null);
  }

  // Product helpers
  function addProduct(){ setForm(f=>({...f,products:[...f.products,{name:"",qty:1}]})); }
  function removeProduct(i){ setForm(f=>({...f,products:f.products.filter((_,j)=>j!==i)})); }
  function updateProduct(i,field,value){ setForm(f=>({...f,products:f.products.map((pr,j)=>j===i?{...pr,[field]:value}:pr)})); }

  function exportCSV(){
    const h=isOutView?t.outExportHeaders:t.exportHeaders;
    const st=(p)=>isOutView?(t.outStatuses[p.status]||p.status):(t.statuses[p.status]||p.status);
    const entity=(p)=>isOutView?(p.client_name||""):(p.shop||"");
    const rows=filtered.map(p=>[p.name,p.order_number||"",p.awb,p.courier,st(p),p.date,entity(p),p.amount||"",p.notes||"",(p.products||[]).map(x=>`${x.qty>1?x.qty+"× ":""}${x.name}`).join("; "),p.estimated_delivery||""].map(cellSafe));
    const csv=[h,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=isOutView?"shipments.csv":"parcels.csv";a.click();
    URL.revokeObjectURL(url);
    setShowExp(false);
  }

  async function exportXLSX(){
    // Lazy-load SheetJS only when the user actually exports (saves ~800KB
    // from the initial bundle).
    const XLSX=await import("xlsx");
    const headers=isOutView?t.outExportHeaders:t.exportHeaders;
    const st=(p)=>isOutView?(t.outStatuses[p.status]||p.status):(t.statuses[p.status]||p.status);
    const entity=(p)=>isOutView?(p.client_name||""):(p.shop||"");
    const data=filtered.map(p=>({
      [headers[0]]:cellSafe(p.name),[headers[1]]:cellSafe(p.order_number||""),[headers[2]]:cellSafe(p.awb),
      [headers[3]]:cellSafe(p.courier),[headers[4]]:cellSafe(st(p)),
      [headers[5]]:cellSafe(p.date),[headers[6]]:cellSafe(entity(p)),[headers[7]]:cellSafe(p.amount||""),[headers[8]]:cellSafe(p.notes||""),
      [headers[9]]:cellSafe((p.products||[]).map(x=>`${x.qty>1?x.qty+"× ":""}${x.name}`).join("; ")),
      [headers[10]]:cellSafe(p.estimated_delivery||""),
    }));
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,isOutView?"Shipments":"Parcels");
    XLSX.writeFile(wb,isOutView?"shipments.xlsx":"parcels.xlsx");
    setShowExp(false);
  }

  const LBL=(s)=>isOutView?(t.outStatuses[s]||s):(t.statuses[s]||s);
  const currentGroup=!isOutView?groups.find(g=>g.id===currentView):null;

  async function removeMember(groupId,memberUserId){
    const {error}=await supabase.rpc("remove_group_member",{p_group_id:groupId,p_user_id:memberUserId});
    if(!error){
      setGroups(prev=>prev.map(g=>g.id===groupId?{...g,group_members:(g.group_members||[]).filter(m=>m.user_id!==memberUserId)}:g));
      setMembersModal(m=>m&&m.id===groupId?{...m,group_members:(m.group_members||[]).filter(mm=>mm.user_id!==memberUserId)}:m);
    }
    return !error;
  }

  // Filter packages by current view ("out" = expediate la clienți)
  const viewPkgs=isOutView
    ?pkgs.filter(p=>p.type==="out")
    :currentView==="personal"
      ?pkgs.filter(p=>!p.group_id&&p.type!=="out")
      :pkgs.filter(p=>p.group_id===currentView&&p.type!=="out");

  const nonArchived=viewPkgs.filter(p=>!p.archived);
  const archivedCount=viewPkgs.length-nonArchived.length;
  const counts=(isOutView?OUT_STATUSES:STATUSES).reduce((a,s)=>({...a,[s]:nonArchived.filter(p=>p.status===s).length}),{});

  const SORTERS={
    status:(a,b)=>((isOutView?OUT_STATUS_ORDER:STATUS_ORDER)[a.status]??1)-((isOutView?OUT_STATUS_ORDER:STATUS_ORDER)[b.status]??1),
    date_desc:(a,b)=>(b.date||"").localeCompare(a.date||""),
    date_asc:(a,b)=>(a.date||"").localeCompare(b.date||""),
    amount_desc:(a,b)=>(Number(b.amount)||0)-(Number(a.amount)||0),
    amount_asc:(a,b)=>(Number(a.amount)||0)-(Number(b.amount)||0),
  };

  const filtered=(filter==="Archived"?viewPkgs.filter(p=>p.archived):nonArchived).filter(p=>{
    const okS=filter==="Toate"||filter==="Archived"||p.status===filter;
    const q=search.toLowerCase();
    // (s||"") guard: legacy/imported rows could carry null on any field,
    // and a null .toLowerCase() would crash the whole list.
    const haystack=[p.name,p.awb,isOutView?(p.client_name||""):(p.shop||"")]
      .map(s=>(s||"").toLowerCase()).join(" ");
    return okS&&(!q||haystack.includes(q));
  }).sort(SORTERS[sortBy]||SORTERS.status);

  const stats=(()=>{
    const totalSpent=viewPkgs.reduce((sum,p)=>sum+(Number(p.amount)||0),0);
    const byStatus=(isOutView?OUT_STATUSES:STATUSES).map(s=>({status:s,label:LBL(s),count:viewPkgs.filter(p=>p.status===s).length}));
    const entityTotals={};
    viewPkgs.forEach(p=>{ const k=isOutView?(p.client_name||""):(p.shop||""); if(k){ entityTotals[k]=(entityTotals[k]||0)+(Number(p.amount)||0); } });
    const topShops=Object.entries(entityTotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const monthTotals={};
    viewPkgs.forEach(p=>{ if(p.date){ const m=p.date.slice(0,7); monthTotals[m]=(monthTotals[m]||0)+(Number(p.amount)||0); } });
    const byMonth=Object.entries(monthTotals).sort((a,b)=>a[0].localeCompare(b[0]));
    return {total:viewPkgs.length,totalSpent,byStatus,topShops,byMonth};
  })();

  const isGroupOwner=currentGroup&&currentGroup.group_members?.some(m=>m.user_id===user.id&&m.role==="owner");
  const [refreshing,setRefreshing] = useState(false);

  async function handleRefresh(){
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  const dateScheme=theme==="dark"?"dark":"light";

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",position:"relative"}}>
      <Background/>
      <div style={{position:"relative",zIndex:1,padding:"1.5rem 1.25rem",maxWidth:800,margin:"0 auto"}}>

        {/* Header */}
        <div style={{marginBottom:"1rem"}}>
          {/* Row 1: logo + title + controls */}
          <div className="app-head">
            <div className="gc" style={{padding:9,borderRadius:16,display:"flex",flexShrink:0}}>
              <Package size={20} style={{color:"rgb(var(--accent))"}}/>
            </div>
            <div className="app-title" style={{flex:1,minWidth:0}}>
              <h1 style={{fontSize:18,fontWeight:600,color:"rgb(var(--ink))",letterSpacing:"-0.02em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.appName}</h1>
              <p style={{fontSize:12,color:"rgba(var(--ink),0.4)",marginTop:1}}>
                {loading?t.loading:(isOutView?t.outParcels:t.parcels(viewPkgs.length))}
              </p>
            </div>
            <div className="app-controls">
              <button className="ib" onClick={()=>setShowStats(true)} title={t.stats}>
                <BarChart3 size={13}/>
              </button>
              <button className="ib" onClick={handleRefresh} disabled={refreshing} title="Refresh">
                <RefreshCw size={13} className={refreshing?"spin":""}/>
              </button>
              <ThemeToggle theme={theme} setTheme={setTheme}/><LangToggle lang={lang} setLang={setLang}/>
              <button className="ib" onClick={()=>supabase.auth.signOut()} title={t.signOut}>
                <LogOut size={13}/>
              </button>
            </div>
          </div>
          {/* Row 2: export + add */}
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{position:"relative",flex:1}} ref={exportRef}>
              <button className="gb" onClick={()=>setShowExp(v=>!v)} style={{width:"100%",justifyContent:"center"}}>
                <Download size={14}/> {t.export} <ChevronDown size={12}/>
              </button>
              {showExp&&(
                <div className="em">
                  <button className="ei" onClick={exportCSV}><FileText size={14}/>{t.downloadCSV}</button>
                  <button className="ei" onClick={exportXLSX}><FileText size={14}/>{t.downloadExcel}</button>
                </div>
              )}
            </div>
            <button className="gb" onClick={()=>selectMode?exitSelectMode():setSelectMode(true)} style={{flexShrink:0}}>
              <ListChecks size={14}/> {t.select}
            </button>
            <button className="gb gbp" onClick={()=>openForm()} style={{flex:1,justifyContent:"center"}}>
              <Plus size={14}/> {isOutView?t.addShipment:t.add}
            </button>
          </div>
          {/* Install app guide */}
          {!isStandalone&&(
            <button className="gb" onClick={()=>setShowInstall(true)}
              style={{width:"100%",justifyContent:"center",marginTop:6,fontSize:13}}>
              <Smartphone size={14}/> {t.installApp} <ChevronDown size={12} style={{transform:"rotate(-90deg)"}}/>
            </button>
          )}
        </div>

        {/* Groups nav */}
        <div className="gnav">
          <button className={`fp${currentView==="personal"?" act":""}`} onClick={()=>{setCurrentView("personal");setFilter("Toate");setSearch("");setSortBy("status");}}>
            {t.myParcels}
          </button>
          <button className={`fp${currentView==="out"?" act":""}`} onClick={()=>{setCurrentView("out");setFilter("Toate");setSearch("");setSortBy("status");}}
            style={currentView==="out"?{background:"rgba(var(--accent),0.12)",borderColor:"rgba(var(--accent),0.4)",color:"rgb(var(--accent))"}:undefined}>
            <Send size={11} style={{opacity:0.6,verticalAlign:-1}}/> {t.outTab}
          </button>
          {groups.map(g=>(
            <button key={g.id} className={`fp${currentView===g.id?" act":""}`} onClick={()=>{setCurrentView(g.id);setFilter("Toate");setSearch("");setSortBy("status");}}>
              <Users size={11} style={{opacity:0.6}}/> {g.name}
            </button>
          ))}
          <button className="fp" onClick={()=>setShowGroupModal(true)} style={{color:"rgb(var(--accent))",borderColor:"rgba(var(--accent),0.3)"}}>
            + {t.newGroup}
          </button>
        </div>

        {/* Group header (when viewing a group) */}
        {!isOutView&&currentGroup&&(
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.75rem",padding:"8px 12px",background:"rgba(var(--accent),0.08)",borderRadius:12,border:"1px solid rgba(var(--accent),0.2)"}}>
            <Users size={14} style={{color:"rgb(var(--accent))",flexShrink:0}}/>
            <button onClick={()=>setMembersModal(currentGroup)} style={{fontSize:13,color:"rgba(var(--ink),0.7)",flex:1,textAlign:"left",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline",textDecorationColor:"rgba(var(--ink),0.25)",textUnderlineOffset:3}}>
              {currentGroup.name} · {t.memberCount(currentGroup.group_members?.length||0)}
            </button>
            {isGroupOwner&&(
              <button className="ib" title={t.inviteLink} onClick={()=>{
                const url=`${appBaseUrl()}#invite/${currentGroup.invite_code}`;
                copyText(url);
              }}>
                <Copy size={12}/> {t.copyInvite}
              </button>
            )}
            <button className="ib ibx" onClick={()=>leaveGroup(currentGroup)} title={t.leaveGroup}>
              <X size={12}/>
            </button>
          </div>
        )}

        {/* Search */}
        <div style={{position:"relative",marginBottom:"1rem"}}>
          <Search size={13} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(var(--ink),0.3)"}}/>
          <input className="gi" value={search} onChange={e=>setSearch(e.target.value)} placeholder={isOutView?t.searchPlaceholderOut:t.searchPlaceholder} style={{paddingLeft:36}}/>
          {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(var(--ink),0.35)",display:"flex",padding:2}}><X size={13}/></button>}
        </div>

        {/* Filters */}
        {viewPkgs.length>0&&(
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem",alignItems:"center"}}>
            <button className={`fp${filter==="Toate"?" act":""}`} onClick={()=>setFilter("Toate")}>{t.all} ({nonArchived.length})</button>
            {(isOutView?OUT_STATUSES:STATUSES).filter(s=>counts[s]>0).map(s=>(
              <button key={s} className={`fp${filter===s?" act":""}`} onClick={()=>setFilter(filter===s?"Toate":s)}
                style={filter===s?{background:(isOutView?SC_OUT:SC)[s].bg,borderColor:(isOutView?SC_OUT:SC)[s].border,color:(isOutView?SC_OUT:SC)[s].color}:{}}>
                {LBL(s)} ({counts[s]})
              </button>
            ))}
            {archivedCount>0&&(
              <button className={`fp${filter==="Archived"?" act":""}`} onClick={()=>setFilter(filter==="Archived"?"Toate":"Archived")}>
                <Archive size={11} style={{marginRight:3,opacity:0.6}}/>{t.archivedFilter(archivedCount)}
              </button>
            )}
            <select className="gi" value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{width:"auto",flexShrink:0,fontSize:12,padding:"6px 10px",marginLeft:"auto"}}>
              <option value="status">{t.sortDefault}</option>
              <option value="date_desc">{t.sortNewest}</option>
              <option value="date_asc">{t.sortOldest}</option>
              <option value="amount_desc">{t.sortAmountDesc}</option>
              <option value="amount_asc">{t.sortAmountAsc}</option>
            </select>
          </div>
        )}

        {/* Form */}
        {showForm&&(
          <div className="gc-strong" style={{padding:"1.5rem",marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
              <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))"}}>{editId?(isOutView?t.outEditParcel:t.editParcel):(isOutView?t.outNewParcel:t.newParcel)}</h2>
              <button className="ib" onClick={()=>{setShowForm(false);setEditId(null);}}><X size={14}/></button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,overflow:"hidden"}}>

              {/* Products — first field */}
              <div style={{gridColumn:"span 2"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.products} *</label>
                  <button type="button" className="ib" onClick={addProduct} style={{fontSize:11,padding:"3px 10px"}}>
                    <Plus size={11}/> {t.addProduct}
                  </button>
                </div>
                {form.products.length===0?(
                  <p style={{fontSize:12,color:"rgba(var(--ink),0.18)",textAlign:"center",padding:"6px 0"}}>{t.noProductsYet}</p>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {form.products.map((prod,i)=>(
                      <div key={i} style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input className="gi" value={prod.name} onChange={e=>updateProduct(i,"name",e.target.value)} placeholder={t.productName} style={{flex:1}} autoFocus={i===0&&form.products.length===1}/>
                        <input className="gi" type="number" min="1" value={prod.qty} onChange={e=>updateProduct(i,"qty",Math.max(1,parseInt(e.target.value)||1))} style={{width:64,textAlign:"center"}} placeholder={t.qty}/>
                        <button type="button" className="ib ibx" onClick={()=>removeProduct(i)} style={{flexShrink:0,padding:"6px 8px"}}><X size={12}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.orderNumber}</label>
                <input className="gi" value={form.order_number} onChange={e=>setForm({...form,order_number:e.target.value})} placeholder={t.orderNumberPlaceholder}/>
              </div>
              {!isOutView&&form.status!=="Comandat"?(
                <>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.awbRequired}</label>
                    <input className="gi" value={form.awb} onChange={e=>setForm({...form,awb:e.target.value})} placeholder={t.awbPlaceholder} style={{fontFamily:"monospace"}}/>
                  </div>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.courier}</label>
                    <select className="gi" value={form.courier} onChange={e=>setForm({...form,courier:e.target.value})}>
                      {COURIERS.map(c=><option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.shop}</label>
                    <input className="gi" value={form.shop} onChange={e=>setForm({...form,shop:e.target.value})} placeholder={t.shopPlaceholder}/>
                  </div>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.amount}</label>
                    <input className="gi" type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder={t.amountPlaceholder}/>
                  </div>
                </>
              ):!isOutView&&form.status==="Comandat"?(
                <>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.shop}</label>
                    <input className="gi" value={form.shop} onChange={e=>setForm({...form,shop:e.target.value})} placeholder={t.shopPlaceholder}/>
                  </div>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.amount}</label>
                    <input className="gi" type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder={t.amountPlaceholder}/>
                  </div>
                </>
              ):(
                <>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.client}</label>
                    <input className="gi" value={form.client_name} onChange={e=>setForm({...form,client_name:e.target.value})} placeholder={t.clientPlaceholder}/>
                  </div>
                  {form.status!=="Pregatit"&&form.status!=="Retur"&&(
                    <>
                      <div style={{minWidth:0}}>
                        <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.awbLabel}</label>
                        <input className="gi" value={form.awb} onChange={e=>setForm({...form,awb:e.target.value})} placeholder={t.awbPlaceholder} style={{fontFamily:"monospace"}}/>
                      </div>
                      <div style={{minWidth:0}}>
                        <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.courier}</label>
                        <select className="gi" value={form.courier} onChange={e=>setForm({...form,courier:e.target.value})}>
                          {COURIERS.map(c=><option key={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.amount}</label>
                    <input className="gi" type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder={t.amountPlaceholder}/>
                  </div>
                </>
              )}
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.status}</label>
                <select className="gi" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {(isOutView?OUT_STATUSES:STATUSES).map(s=><option key={s} value={s}>{LBL(s)}</option>)}
                </select>
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.orderDate}</label>
                <input type="date" className="gi" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{colorScheme:dateScheme,maxWidth:"100%",minWidth:0}}/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.estDelivery}</label>
                <input type="date" className="gi" value={form.estimated_delivery} onChange={e=>setForm({...form,estimated_delivery:e.target.value})} style={{colorScheme:dateScheme,maxWidth:"100%",minWidth:0}}/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.notes}</label>
                <input className="gi" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder={t.notesPlaceholder}/>
              </div>
            </div>
            {formErr&&<p style={{fontSize:12,color:"rgb(var(--ink))",fontWeight:500,marginTop:8}}>{formErr}</p>}
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:"1.25rem"}}>
              <button className="gb" onClick={()=>{setShowForm(false);setEditId(null);}}>{t.cancel}</button>
              <button className="gb gbp" onClick={submit}>{editId?t.save:(isOutView?t.addShipment:t.addParcel)}</button>
            </div>
          </div>
        )}

        {/* Package list */}
        {loading?(
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(var(--ink),0.35)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={16} className="spin"/> {t.loadingParcels}
          </div>
        ):viewPkgs.length===0?(
          <div className="gc" style={{padding:"4rem 1rem",textAlign:"center"}}>
            <Package size={36} style={{color:"rgba(var(--ink),0.18)",marginBottom:12}}/>
            <p style={{color:"rgba(var(--ink),0.55)",fontSize:14}}>{isOutView?t.noOutParcels:(currentGroup?t.noGroupParcels:t.noParcelAdded)}</p>
            <p style={{color:"rgba(var(--ink),0.3)",fontSize:13,marginTop:4}}>{isOutView?t.noOutParcelsSub:(currentGroup?t.addFirstGroupParcel:t.noParcelSub)}</p>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(var(--ink),0.35)",fontSize:13}}>{t.noMatch}</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(p=>{
              const isOutPkg=p.type==="out";
              const cfg=(isOutPkg?SC_OUT:SC)[p.status]||SC_FB;
              const LBLp=isOutPkg?(t.outStatuses[p.status]||p.status):LBL(p.status);
              const showAWB=isOutPkg?(p.status!=="Pregatit"&&p.status!=="Retur"):p.status!=="Comandat";
              const url=getUrl(p);
              const isSharing=shareLoading===p.id;
              const dLeft=p.status!=="Livrat"&&p.estimated_delivery?daysUntil(p.estimated_delivery):null;
              const historyOpen=historyOpenId===p.id;
              return (
                <div key={p.id} className="pkg">
                  <div className="pkg-top">
                    {selectMode&&(
                      <button onClick={()=>toggleSelect(p.id)} className="ib" style={{flexShrink:0,padding:6}} aria-label="select">
                        {selectedIds.has(p.id)?<CheckSquare size={16} style={{color:"rgb(var(--accent))"}}/>:<Square size={16}/>}
                      </button>
                    )}
                    <div className="pkg-content">
                      <span className="pkg-name" title={p.name}>{p.name}</span>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginTop:6}}>
                        <span className="sp" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>{LBLp}</span>
                        {p.amount&&<span className="sp" style={{background:"rgba(var(--ink),0.06)",color:"rgba(var(--ink),0.72)",borderColor:"rgba(var(--ink),0.16)",fontSize:11}}>{Number(p.amount).toLocaleString("ro-RO",{minimumFractionDigits:2,maximumFractionDigits:2})} RON</span>}
                        {p.products&&p.products.length>0&&<span className="sp" style={{background:"rgba(var(--ink),0.06)",color:"rgba(var(--ink),0.55)",borderColor:"rgba(var(--ink),0.18)",fontSize:11,cursor:"default"}}>{t.productCount(p.products.length)}</span>}
                        {p.group_id&&currentView==="personal"&&(()=>{const g=groups.find(x=>x.id===p.group_id);return g?<span className="sp" style={{background:"rgba(var(--accent),0.12)",color:"rgb(var(--accent))",borderColor:"rgba(var(--accent),0.3)",fontSize:11,cursor:"default"}}><Users size={9}/> {g.name}</span>:null;})()}
                        {dLeft!=null&&(
                          <span className="sp" style={{background:dLeft<0?"rgb(var(--accent))":"rgba(var(--ink),0.06)",color:dLeft<0?"var(--accent-fg)":"rgba(var(--ink),0.65)",borderColor:dLeft<0?"transparent":"rgba(var(--ink),0.16)",fontSize:11,cursor:"default"}}>
                            {dLeft<0?t.overdueBy(Math.abs(dLeft)):dLeft===0?t.arrivesToday:t.inDays(dLeft)}
                          </span>
                        )}
                      </div>
                      <div className="pkg-meta" style={{marginTop:6}}>
                        {p.order_number&&<span style={{fontSize:13,color:"rgba(var(--ink),0.55)",fontWeight:500}}>#{p.order_number.replace(/^#/,"")}</span>}
                        {showAWB&&p.awb&&<span style={{fontFamily:"monospace",fontSize:13,color:"rgba(var(--ink),0.42)"}}>{p.awb}</span>}
                        {showAWB&&p.courier&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{p.courier}</span>}
                        {isOutPkg?(p.client_name&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{p.client_name}</span>):(p.shop&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{p.shop}</span>)}
                        {p.date&&<span style={{fontSize:13,color:"rgba(var(--ink),0.3)"}}>{new Date(p.date+"T12:00:00").toLocaleDateString(lang==="en"?"en-GB":"ro-RO",{day:"numeric",month:"short",year:"numeric"})}</span>}
                      </div>
                      {p.notes&&<div style={{fontSize:13,color:"rgba(var(--ink),0.3)",marginTop:4}}>{p.notes}</div>}
                      {p.products&&p.products.length>1&&(
                        <div style={{marginTop:6}}>
                          {p.products.map((prod,i)=>(
                            <span key={i} className="ptag" style={i>0?{marginTop:4}:undefined} title={`${prod.qty>1?prod.qty+"× ":""}${prod.name}`}>
                              {prod.qty>1?`${prod.qty}× `:""}{prod.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!selectMode&&(
                      <div className="pkg-actions">
                        <button className="ib" onClick={()=>setHistoryOpenId(historyOpen?null:p.id)} title={t.history}>
                          <Clock size={13}/>
                        </button>
                        <button className="ib" onClick={()=>shareParcel(p)} disabled={isSharing} title={t.share}>
                          {isSharing?<Loader size={13} className="spin"/>:<Share2 size={13}/>}
                        </button>
                        {!isOutView&&p.user_id===user.id&&groups.length>0&&(
                          <button className="ib" onClick={()=>setMoveModal(p)} title={t.moveToGroup}>
                            <Users size={13}/>
                          </button>
                        )}
                        {url&&p.awb&&<a href={url} target="_blank" rel="noreferrer" className="ib" title={t.trackExternal}><ExternalLink size={13}/></a>}
                        {p.status==="Livrat"&&!p.archived&&(
                          <button className="ib" onClick={()=>setArchived(p.id,true)} title={t.archive}>
                            <Archive size={13}/>
                          </button>
                        )}
                        {p.archived&&(
                          <button className="ib" onClick={()=>setArchived(p.id,false)} title={t.unarchive}>
                            <ArchiveRestore size={13}/>
                          </button>
                        )}
                        <button className="ib" onClick={()=>openForm(p)} style={{padding:"6px 10px"}}>Edit</button>
                        <button className="ib ibx" onClick={()=>setDeleteConfirm(p)} aria-label={t.delete}><Trash2 size={13}/></button>
                      </div>
                    )}
                  </div>
                  {historyOpen&&(
                    <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(var(--ink),0.06)"}}>
                      {(p.status_history&&p.status_history.length)?(
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          {p.status_history.map((h,i)=>(
                            <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
                              <span className="sp" style={{background:(SC_OUT[h.status]||SC[h.status]||SC_FB).bg,color:(SC_OUT[h.status]||SC[h.status]||SC_FB).color,borderColor:(SC_OUT[h.status]||SC[h.status]||SC_FB).border,cursor:"default"}}>{LBL(h.status)}</span>
                              <span style={{color:"rgba(var(--ink),0.4)"}}>{new Date(h.at).toLocaleString(lang==="en"?"en-GB":"ro-RO",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                            </div>
                          ))}
                        </div>
                      ):(
                        <p style={{fontSize:12,color:"rgba(var(--ink),0.35)"}}>{t.historyEmpty}</p>
                      )}
                    </div>
                  )}
                  {!selectMode&&(
                    <div style={{display:"flex",gap:4,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(var(--ink),0.06)",flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:10,color:"rgba(var(--ink),0.25)",marginRight:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.quickStatus}</span>
                      {(isOutView?OUT_STATUSES:STATUSES).map(s=>{const c=(isOutView?SC_OUT:SC)[s];const act=p.status===s;return <button key={s} className="sp" onClick={()=>setStatus(p.id,s)} style={{background:act?c.bg:"rgba(var(--ink),0.04)",color:act?c.color:"rgba(var(--ink),0.32)",borderColor:act?c.border:"rgba(var(--ink),0.07)"}}>{LBL(s)}</button>;})}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div style={{height:selectMode&&selectedIds.size>0?"5rem":"2rem"}}/>
      </div>

      {/* Bulk action bar */}
      {selectMode&&selectedIds.size>0&&(
        <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:250,display:"flex",justifyContent:"center",padding:"0 1rem 1rem"}}>
          <div className="gc-strong" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",flexWrap:"wrap",maxWidth:800,width:"100%"}}>
            <span style={{fontSize:13,fontWeight:600,color:"rgb(var(--ink))",flexShrink:0}}>{t.selectedCount(selectedIds.size)}</span>
            <span style={{fontSize:11,color:"rgba(var(--ink),0.35)",flexShrink:0}}>{t.setStatusFor}</span>
            {(isOutView?OUT_STATUSES:STATUSES).map(s=>(
              <button key={s} className="sp" onClick={()=>bulkSetStatus(s)} style={{background:(isOutView?SC_OUT:SC)[s].bg,color:(isOutView?SC_OUT:SC)[s].color,borderColor:(isOutView?SC_OUT:SC)[s].border}}>{LBL(s)}</button>
            ))}
            <button className="ib ibx" onClick={()=>setBulkDeleteConfirm(true)} style={{marginLeft:"auto"}} title={t.deleteSelected}>
              <Trash2 size={13}/>
            </button>
            <button className="ib" onClick={exitSelectMode} title={t.cancel}>
              <X size={13}/>
            </button>
          </div>
        </div>
      )}

      {showInstall&&<InstallGuideModal onClose={()=>setShowInstall(false)} t={t}/>}
      {deleteConfirm&&<ConfirmDeleteModal pkg={deleteConfirm} onConfirm={()=>{del(deleteConfirm.id);setDeleteConfirm(null);}} onClose={()=>setDeleteConfirm(null)} t={t}/>}
      {bulkDeleteConfirm&&<ConfirmDeleteModal pkg={{name:t.selectedCount(selectedIds.size)}} onConfirm={bulkDelete} onClose={()=>setBulkDeleteConfirm(false)} t={t}/>}
      {moveModal&&<MoveModal pkg={moveModal} groups={groups} onMove={moveParcel} onClose={()=>setMoveModal(null)} t={t}/>}
      {shareModal&&<ShareModal shareUrl={shareModal.shareUrl} onClose={()=>setShareModal(null)} t={t}/>}
      {showGroupModal&&<GroupModal user={user} onClose={()=>setShowGroupModal(false)} onCreated={handleGroupCreated} t={t}/>}
      {inviteModal&&<InviteModal inviteCode={inviteModal} onJoined={handleGroupJoined} onDismiss={()=>{setInviteModal(null);localStorage.removeItem("pending_invite");history.replaceState(null,"",window.location.pathname);}} t={t}/>}
      {showStats&&<StatsModal stats={stats} out={isOutView} onClose={()=>setShowStats(false)} t={t}/>}
      {membersModal&&<GroupMembersModal group={membersModal} user={user} isOwner={membersModal.group_members?.some(m=>m.user_id===user.id&&m.role==="owner")} onRemove={removeMember} onClose={()=>setMembersModal(null)} t={t}/>}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [session,setSession]         = useState(null);
  const [loadingAuth,setLoadingAuth] = useState(true);
  const [lang,setLang]               = useState(()=>localStorage.getItem(LANG_KEY)||"en");
  const [theme,setTheme]             = useState(()=>localStorage.getItem(THEME_KEY)||"light");

  const hash        = window.location.hash;
  const shareToken  = hash.startsWith("#share/")  ? hash.slice(7)  : null;
  const inviteCode  = hash.startsWith("#invite/") ? hash.slice(8)  : null;

  useEffect(()=>{
    // Save invite code if not logged in yet
    if(inviteCode)localStorage.setItem("pending_invite",inviteCode);
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoadingAuth(false);});
    const {data:listener}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return ()=>listener.subscription.unsubscribe();
  },[]);

  // Apply theme to <html> and the mobile status-bar color
  useEffect(()=>{
    document.documentElement.setAttribute("data-theme",theme);
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute("content",theme==="dark"?"#000000":"#ffffff");
  },[theme]);

  // Shared parcel view — no auth required
  if(shareToken){
    return(<><style>{STYLES}</style><SharedParcelView token={shareToken} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}/></>);
  }

  const pendingInvite=(!inviteCode&&localStorage.getItem("pending_invite"))||inviteCode||null;

  return (
    <>
      <style>{STYLES}</style>
      {loadingAuth?(
        <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Background/>
        </div>
      ):session?(
        <MainApp user={session.user} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} pendingInvite={pendingInvite} key={session.user.id}/>
      ):(
        <LoginScreen lang={lang} setLang={setLang} theme={theme} setTheme={setTheme}/>
      )}
    </>
  );
}
