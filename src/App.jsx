import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, ExternalLink, X, Search, Package, Download,
  FileText, Loader, ChevronDown, LogOut, Share2, Users, Copy,
  Check, UserPlus, Crown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "./supabase.js";

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    appName:"Parcel Tracking",appSub:"Track your parcels from any device",
    noParcel:"No parcels",parcels:(n)=>`${n} ${n===1?"parcel":"parcels"}`,
    loading:"Loading...",loadingParcels:"Loading parcels...",
    export:"Export",downloadCSV:"Download CSV",downloadExcel:"Download Excel",
    add:"Add",signOut:"Sign out",
    searchPlaceholder:"Search by name, AWB or shop...",all:"All",
    newParcel:"New parcel",editParcel:"Edit parcel",
    description:"Description / order *",
    descPlaceholder:"e.g. Mechanical keyboard, 27 inch monitor...",
    awb:"AWB Number",awbPlaceholder:"e.g. 12345678",awbRequired:"AWB Number *",
    orderNumber:"Order number (optional)",orderNumberPlaceholder:"e.g. #123456789",
    courier:"Courier",shop:"Shop",shopPlaceholder:"e.g. eMag, Altex, PC Garage...",
    amount:"Amount (RON)",amountPlaceholder:"e.g. 349.99",
    status:"Status",orderDate:"Order date",
    notes:"Notes (optional)",notesPlaceholder:"value, product link, other details...",
    cancel:"Cancel",save:"Save changes",addParcel:"Add parcel",
    formErr:"Fill in the description.",formErrAwb:"Fill in the AWB number.",
    saveErr:"Save error: ",
    noParcelAdded:"No parcels yet",noParcelSub:'Press "Add" to get started',
    noMatch:"No parcels match the filters.",
    quickStatus:"Quick status:",trackExternal:"Open tracking page",delete:"Delete parcel",
    loginSub:"Track your parcels from any device",loginBtn:"Continue with Google",
    loginConnecting:"Connecting...",loginNote:"Each user sees only their own parcels.",
    statuses:{"Comandat":"Ordered","In livrare":"In delivery","Livrat":"Delivered"},
    exportHeaders:["Description","Order No.","AWB","Courier","Status","Date","Shop","Amount","Notes"],
    // Share
    share:"Share",shareTitle:"Share parcel",
    shareDesc:"Anyone with this link can view this parcel (read-only, no account needed).",
    copyLink:"Copy link",copied:"Copied!",sharedParcel:"Shared parcel",backToApp:"Open app",
    shareError:"Could not generate share link.",generating:"Generating...",
    // Groups
    myParcels:"My parcels",groups:"Groups",newGroup:"New group",
    groupName:"Group name *",groupNamePlaceholder:"e.g. Family, Colleagues...",
    createGroup:"Create group",inviteTitle:"Invite people",
    inviteDesc:"Share this link with people you want to add to this group.",
    inviteLink:"Invite link",copyInvite:"Copy invite link",
    joinGroup:"Join group",joiningGroup:"Joining...",joined:"Joined!",
    noGroups:"No groups yet",noGroupParcels:"No parcels in this group yet.",
    addFirstGroupParcel:'Press "Add" to add the first parcel.',
    leaveGroup:"Leave group",members:"members",groupCreated:"Group created",
    moveToGroup:"Move to group",moveToPersonal:"Move to personal",
    selectGroup:"Select group",move:"Move",
    invalidInvite:"Invalid or expired invite link.",memberCount:(n)=>`${n} ${n===1?"member":"members"}`,
  },
  ro: {
    appName:"Parcel Tracking",appSub:"Urmărește-ți coletele de pe orice device",
    noParcel:"Niciun colet",parcels:(n)=>`${n} ${n===1?"colet":"colete"}`,
    loading:"Se încarcă...",loadingParcels:"Se încarcă coletele...",
    export:"Export",downloadCSV:"Descarcă CSV",downloadExcel:"Descarcă Excel",
    add:"Adaugă",signOut:"Deconectează-te",
    searchPlaceholder:"Caută după nume, AWB sau magazin...",all:"Toate",
    newParcel:"Colet nou",editParcel:"Editează colet",
    description:"Descriere / comandă *",
    descPlaceholder:"ex. Tastatură mecanică, Monitor 27 inch...",
    awb:"Număr AWB",awbPlaceholder:"ex. 12345678",awbRequired:"Număr AWB *",
    orderNumber:"Număr comandă (opțional)",orderNumberPlaceholder:"ex. #123456789",
    courier:"Curier",shop:"Magazin",shopPlaceholder:"ex. eMag, Altex, PC Garage...",
    amount:"Sumă (RON)",amountPlaceholder:"ex. 349.99",
    status:"Status",orderDate:"Data comenzii",
    notes:"Note (opțional)",notesPlaceholder:"valoare, link produs, alte detalii...",
    cancel:"Anulează",save:"Salvează modificările",addParcel:"Adaugă colet",
    formErr:"Completează descrierea.",formErrAwb:"Completează numărul AWB.",
    saveErr:"Eroare la salvare: ",
    noParcelAdded:"Niciun colet adăugat",noParcelSub:'Apasă „Adaugă" pentru a începe',
    noMatch:"Niciun colet nu corespunde filtrelor.",
    quickStatus:"Status rapid:",trackExternal:"Deschide pagina de tracking",delete:"Șterge coletul",
    loginSub:"Urmărește-ți coletele de pe orice device",loginBtn:"Continuă cu Google",
    loginConnecting:"Se conectează...",loginNote:"Fiecare utilizator vede doar propriile colete.",
    statuses:{"Comandat":"Comandat","In livrare":"In livrare","Livrat":"Livrat"},
    exportHeaders:["Descriere","Nr. comandă","AWB","Curier","Status","Data","Magazin","Suma","Note"],
    // Share
    share:"Distribuie",shareTitle:"Distribuie colet",
    shareDesc:"Oricine cu acest link poate vedea acest colet (doar citire, fără cont necesar).",
    copyLink:"Copiază linkul",copied:"Copiat!",sharedParcel:"Colet distribuit",backToApp:"Deschide aplicația",
    shareError:"Nu s-a putut genera linkul.",generating:"Se generează...",
    // Groups
    myParcels:"Coletele mele",groups:"Grupuri",newGroup:"Grup nou",
    groupName:"Numele grupului *",groupNamePlaceholder:"ex. Familie, Colegi...",
    createGroup:"Creează grup",inviteTitle:"Invită persoane",
    inviteDesc:"Trimite acest link persoanelor pe care vrei să le adaugi în grup.",
    inviteLink:"Link de invitație",copyInvite:"Copiază link invitație",
    joinGroup:"Alătură-te grupului",joiningGroup:"Se procesează...",joined:"Te-ai alăturat!",
    noGroups:"Niciun grup",noGroupParcels:"Niciun colet în acest grup.",
    addFirstGroupParcel:'Apasă „Adaugă" pentru a adăuga primul colet.',
    leaveGroup:"Ieși din grup",members:"membri",groupCreated:"Grup creat",
    moveToGroup:"Mută în grup",moveToPersonal:"Mută la personal",
    selectGroup:"Selectează grup",move:"Mută",
    invalidInvite:"Link de invitație invalid sau expirat.",memberCount:(n)=>`${n} ${n===1?"membru":"membri"}`,
  },
};

const LANG_KEY = "parcel-lang";

// ── Constants ─────────────────────────────────────────────────────────────────

const COURIERS = [
  {name:"FAN Courier", url:(a)=>`https://www.fancourier.ro/awb-tracking/?awb=${a}`},
  {name:"Cargus",      url:(a)=>`https://www.cargus.ro/tracking-colet/?Awb=${a}`},
  {name:"Sameday",     url:(a)=>`https://sameday.ro/status-colet/?awb=${a}`},
  {name:"DPD",         url:(a)=>`https://awb.woot.ro/urmarire-colet-dpd/${a}`},
  {name:"GLS",         url:(a)=>`https://awb.woot.ro/urmarire-colet-gls/${a}`},
  {name:"Posta Romana",url:(a)=>`https://awb.woot.ro/urmarire-colet-postaromana/${a}`},
  {name:"Alta",        url:(a)=>`https://awb.woot.ro/${a}`},
];

const STATUSES = ["Comandat","In livrare","Livrat"];

const SC = {
  "Comandat":   {color:"#94a3b8",bg:"rgba(148,163,184,0.18)",border:"rgba(148,163,184,0.45)"},
  "In livrare": {color:"#a78bfa",bg:"rgba(167,139,250,0.18)",border:"rgba(167,139,250,0.45)"},
  "Livrat":     {color:"#34d399",bg:"rgba(52,211,153,0.18)", border:"rgba(52,211,153,0.45)"},
  "In procesare":{color:"#a78bfa",bg:"rgba(167,139,250,0.18)",border:"rgba(167,139,250,0.45)"},
  "In tranzit": {color:"#a78bfa",bg:"rgba(167,139,250,0.18)",border:"rgba(167,139,250,0.45)"},
  "La livrare": {color:"#a78bfa",bg:"rgba(167,139,250,0.18)",border:"rgba(167,139,250,0.45)"},
  "Retur":      {color:"#94a3b8",bg:"rgba(148,163,184,0.18)",border:"rgba(148,163,184,0.45)"},
};

const SC_FB = {color:"#94a3b8",bg:"rgba(148,163,184,0.18)",border:"rgba(148,163,184,0.45)"};
const STATUS_ORDER = {"Comandat":0,"In livrare":1,"Livrat":2};

const emptyForm = () => ({
  name:"",awb:"",courier:"FAN Courier",status:"Comandat",
  date:new Date().toISOString().split("T")[0],notes:"",shop:"",amount:"",order_number:"",
});

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#16033a;-webkit-font-smoothing:antialiased}
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
  .fp{font-size:13px;padding:5px 14px;border-radius:100px;cursor:pointer;border:1px solid rgba(255,255,255,0.13);background:rgba(255,255,255,0.055);color:rgba(255,255,255,0.65);transition:all .18s;font-family:'DM Sans',sans-serif;white-space:nowrap;flex-shrink:0}
  .fp:hover{background:rgba(255,255,255,0.11);color:white}
  .fp.act{background:rgba(255,255,255,0.17);border-color:rgba(255,255,255,0.28);color:white}
  .sp{font-size:12px;padding:3px 10px;border-radius:100px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .15s;font-family:'DM Sans',sans-serif}
  .sp:hover{opacity:0.8}
  .sp:active{transform:scale(0.95)}
  .em{position:absolute;top:calc(100% + 8px);right:0;background:rgba(12,18,35,0.92);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.14);border-radius:14px;padding:6px;min-width:165px;z-index:200;box-shadow:0 20px 40px rgba(0,0,0,0.45)}
  .ei{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;cursor:pointer;color:rgba(255,255,255,0.78);font-size:14px;transition:background .15s;font-family:'DM Sans',sans-serif;background:none;border:none;width:100%;text-align:left}
  .ei:hover{background:rgba(255,255,255,0.08);color:white}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem}
  .lang-btn{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:rgba(255,255,255,0.7);cursor:pointer;padding:5px 4px;display:inline-flex;align-items:center;gap:2px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:500;transition:all .15s;min-width:52px;justify-content:center}
  .lang-btn:hover{background:rgba(255,255,255,0.13);color:white}
  .lang-seg{padding:3px 7px;border-radius:7px;transition:all .15s;line-height:1}
  .lang-seg.active{background:rgba(255,255,255,0.18);color:white}
  .gnav{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;margin-bottom:1rem;scrollbar-width:none}
  .gnav::-webkit-scrollbar{display:none}
  a{color:inherit;text-decoration:none}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:2px}
`;

// ── Background ────────────────────────────────────────────────────────────────

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

// ── LangToggle ────────────────────────────────────────────────────────────────

function LangToggle({lang,setLang}) {
  return (
    <button className="lang-btn" onClick={()=>setLang(l=>{const n=l==="en"?"ro":"en";localStorage.setItem(LANG_KEY,n);return n;})}>
      <span className={`lang-seg${lang==="en"?" active":""}`}>EN</span>
      <span style={{color:"rgba(255,255,255,0.2)",fontSize:10}}>·</span>
      <span className={`lang-seg${lang==="ro"?" active":""}`}>RO</span>
    </button>
  );
}

// ── SharedParcelView ──────────────────────────────────────────────────────────

function SharedParcelView({token,lang,setLang}) {
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

  const BASE = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  const LBL  = (s)=>t.statuses[s]||s;

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",position:"relative"}}>
      <Background/>
      <div style={{position:"relative",zIndex:1,padding:"1.5rem 1.25rem",maxWidth:800,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.5rem",flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
            <div className="gc" style={{padding:9,borderRadius:16,display:"flex",flexShrink:0}}>
              <Package size={20} style={{color:"#a78bfa"}}/>
            </div>
            <div>
              <h1 style={{fontSize:18,fontWeight:600,color:"white"}}>{t.sharedParcel}</h1>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:1}}>{t.appName}</p>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <LangToggle lang={lang} setLang={setLang}/>
            <a href={BASE} className="gb">{t.backToApp}</a>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={16} className="spin"/> {t.loading}
          </div>
        ) : error||!pkg ? (
          <div className="gc" style={{padding:"3rem",textAlign:"center"}}>
            <Package size={32} style={{color:"rgba(255,255,255,0.15)",marginBottom:12}}/>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:14}}>{t.invalidInvite}</p>
          </div>
        ) : (()=>{
          const cfg=SC[pkg.status]||SC_FB;
          const courier=COURIERS.find(c=>c.name===pkg.courier);
          const url=courier?.url?courier.url(pkg.awb):null;
          return (
            <div className="pkg">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:5}}>
                    <span style={{fontWeight:500,fontSize:15,color:"white"}}>{pkg.name}</span>
                    <span className="sp" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border,cursor:"default"}}>{LBL(pkg.status)}</span>
                    {pkg.amount&&<span className="sp" style={{background:"rgba(52,211,153,0.12)",color:"#34d399",borderColor:"rgba(52,211,153,0.35)",fontSize:11,cursor:"default"}}>{Number(pkg.amount).toLocaleString("ro-RO",{minimumFractionDigits:2,maximumFractionDigits:2})} RON</span>}
                  </div>
                  <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                    {pkg.order_number&&<span style={{fontSize:13,color:"rgba(255,255,255,0.55)",fontWeight:500}}>#{pkg.order_number.replace(/^#/,"")}</span>}
                    {pkg.status!=="Comandat"&&pkg.awb&&<span style={{fontFamily:"monospace",fontSize:13,color:"rgba(255,255,255,0.42)"}}>{pkg.awb}</span>}
                    {pkg.status!=="Comandat"&&pkg.courier&&<span style={{fontSize:13,color:"rgba(255,255,255,0.42)"}}>{pkg.courier}</span>}
                    {pkg.shop&&<span style={{fontSize:13,color:"rgba(255,255,255,0.42)"}}>{pkg.shop}</span>}
                    {pkg.date&&<span style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>{new Date(pkg.date+"T12:00:00").toLocaleDateString(lang==="en"?"en-GB":"ro-RO",{day:"numeric",month:"short",year:"numeric"})}</span>}
                  </div>
                  {pkg.notes&&<div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginTop:4}}>{pkg.notes}</div>}
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
  function copy(){
    navigator.clipboard.writeText(shareUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  }
  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:460,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"white",display:"flex",alignItems:"center",gap:8}}>
            <Share2 size={15} style={{color:"#a78bfa"}}/> {t.shareTitle}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:"1rem",lineHeight:1.6}}>{t.shareDesc}</p>
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
    const {data,error}=await supabase.from("groups").insert({name:name.trim(),created_by:user.id}).select().single();
    if(!error&&data){
      await supabase.from("group_members").insert({group_id:data.id,user_id:user.id,role:"owner"});
      setCreated(data);
      onCreated(data);
    }
    setBusy(false);
  }

  const BASE=`${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  const inviteUrl=created?`${BASE}#invite/${created.invite_code}`:"";

  function copyInvite(){
    navigator.clipboard.writeText(inviteUrl).then(()=>{setCopiedInv(true);setTimeout(()=>setCopiedInv(false),2000);});
  }

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="gc-strong" style={{padding:"1.5rem",maxWidth:460,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
          <h2 style={{fontSize:15,fontWeight:600,color:"white",display:"flex",alignItems:"center",gap:8}}>
            <Users size={15} style={{color:"#a78bfa"}}/> {created?t.inviteTitle:t.newGroup}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>
        {!created?(
          <>
            <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:6,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.groupName}</label>
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
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:"1rem",lineHeight:1.6}}>{t.inviteDesc}</p>
            <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:6,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.inviteLink}</label>
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

  useEffect(()=>{
    supabase.rpc("get_group_by_invite",{p_code:inviteCode}).then(({data})=>{
      setGroup(data);setLoading(false);
    });
  },[inviteCode]);

  async function join(){
    setBusy(true);
    const {error}=await supabase.rpc("join_group",{p_invite_code:inviteCode});
    setBusy(false);
    if(!error){setDone(true);setTimeout(()=>onJoined(group),1400);}
  }

  return (
    <div className="overlay">
      <div className="gc-strong" style={{padding:"1.75rem",maxWidth:380,width:"100%",textAlign:"center"}}>
        <div className="gc" style={{display:"inline-flex",padding:"12px",borderRadius:20,marginBottom:16}}>
          <Users size={24} style={{color:"#a78bfa"}}/>
        </div>
        {loading?(
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={14} className="spin"/>{t.loading}
          </div>
        ):done?(
          <div>
            <div style={{fontSize:36,marginBottom:8}}>✓</div>
            <p style={{color:"white",fontSize:15,fontWeight:500}}>{t.joined}</p>
          </div>
        ):group?(
          <>
            <h2 style={{fontSize:18,fontWeight:600,color:"white",marginBottom:6}}>{group.name}</h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",marginBottom:"1.5rem"}}>{t.joinGroup}?</p>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button className="gb" onClick={onDismiss}>{t.cancel}</button>
              <button className="gb gbp" onClick={join} disabled={busy}>
                {busy?<Loader size={13} className="spin"/>:<UserPlus size={13}/>}
                {busy?t.joiningGroup:t.joinGroup}
              </button>
            </div>
          </>
        ):(
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:13}}>{t.invalidInvite}</p>
        )}
      </div>
    </div>
  );
}

// ── LoginScreen ───────────────────────────────────────────────────────────────

function LoginScreen({lang,setLang}) {
  const t=T[lang];
  const [busy,setBusy]=useState(false);
  const [err,setErr]  =useState("");

  async function loginWithGoogle(){
    setBusy(true);setErr("");
    const redirectTo=window.location.hostname==="localhost"
      ?"http://localhost:5173/parcels-tracking/"
      :"https://mrmcb92.github.io/parcels-tracking/";
    const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo}});
    if(error){setErr(error.message);setBusy(false);}
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",position:"relative"}}>
      <Background/>
      <div style={{position:"absolute",top:16,right:16,zIndex:10}}>
        <LangToggle lang={lang} setLang={setLang}/>
      </div>
      <div className="gc-strong" style={{maxWidth:400,width:"100%",padding:"2rem",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div className="gc" style={{display:"inline-flex",padding:"12px",borderRadius:20,marginBottom:16}}>
            <Package size={28} style={{color:"#a78bfa"}}/>
          </div>
          <h1 style={{fontSize:22,fontWeight:700,color:"white",letterSpacing:"-0.02em"}}>{t.appName}</h1>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginTop:6}}>{t.loginSub}</p>
        </div>
        <button onClick={loginWithGoogle} disabled={busy}
          style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"13px 16px",background:"white",border:"none",borderRadius:14,cursor:"pointer",fontSize:15,fontWeight:500,color:"#1f1f1f",fontFamily:"'DM Sans',sans-serif",opacity:busy?0.7:1,transition:"opacity .15s"}}>
          {busy?<Loader size={18} style={{animation:"spin 1s linear infinite",color:"#4285f4"}}/>:(
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {busy?t.loginConnecting:t.loginBtn}
        </button>
        {err&&<p style={{fontSize:12,color:"#f87171",marginTop:12,textAlign:"center"}}>{err}</p>}
        <p style={{fontSize:11,color:"rgba(255,255,255,0.2)",textAlign:"center",marginTop:20,lineHeight:1.6}}>{t.loginNote}</p>
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
          <h2 style={{fontSize:15,fontWeight:600,color:"white",display:"flex",alignItems:"center",gap:8}}>
            <Users size={15} style={{color:"#a78bfa"}}/> {t.moveToGroup}
          </h2>
          <button className="ib" onClick={onClose}><X size={14}/></button>
        </div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:"1rem"}}>{pkg.name}</p>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:"1.25rem"}}>
          {options.map(o=>(
            <button key={o.id} onClick={()=>setSelected(o.id)}
              style={{padding:"10px 14px",borderRadius:12,border:`1px solid ${selected===o.id?"rgba(167,139,250,0.5)":"rgba(255,255,255,0.1)"}`,background:selected===o.id?"rgba(167,139,250,0.18)":"rgba(255,255,255,0.04)",color:selected===o.id?"#a78bfa":"rgba(255,255,255,0.7)",cursor:"pointer",textAlign:"left",fontSize:14,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:8,transition:"all .15s"}}>
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

// ── MainApp ───────────────────────────────────────────────────────────────────

function MainApp({user,lang,setLang,pendingInvite}) {
  const t=T[lang];
  const [pkgs,setPkgs]             = useState([]);
  const [groups,setGroups]         = useState([]);
  const [loading,setLoading]       = useState(true);
  const [currentView,setCurrentView] = useState("personal"); // "personal" | group.id
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
  const [inviteModal,setInviteModal] = useState(pendingInvite||null);
  const exportRef = useRef(null);

  useEffect(()=>{loadAll();},[]);

  useEffect(()=>{
    const channel=supabase.channel("pkgs-rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"packages"},(payload)=>{
        if(payload.eventType==="UPDATE") setPkgs(prev=>prev.map(p=>p.id===payload.new.id?{...p,...payload.new}:p));
        else if(payload.eventType==="INSERT") setPkgs(prev=>[payload.new,...prev]);
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
    }
    setLoading(false);
  }

  function openForm(p=null){
    setForm(p?{name:p.name,awb:p.awb,courier:p.courier,status:p.status,date:p.date,notes:p.notes||"",shop:p.shop||"",amount:p.amount||"",order_number:p.order_number||""}:emptyForm());
    setEditId(p?p.id:null);setFormErr("");setShowForm(true);
  }

  async function submit(){
    if(!form.name.trim()){setFormErr(t.formErr);return;}
    if(form.status!=="Comandat"&&!form.awb.trim()){setFormErr(t.formErrAwb);return;}
    const entry={...form,name:form.name.trim(),awb:form.awb.trim()};
    if(editId){
      const {error}=await supabase.from("packages").update(entry).eq("id",editId);
      if(error){setFormErr(t.saveErr+error.message);return;}
      setPkgs(prev=>prev.map(p=>p.id===editId?{...p,...entry}:p));
    } else {
      const gid=currentView!=="personal"?currentView:null;
      const newPkg={...entry,id:Date.now().toString(),user_id:user.id,group_id:gid};
      const {error}=await supabase.from("packages").insert(newPkg);
      if(error){setFormErr(t.saveErr+error.message);return;}
      setPkgs(prev=>[newPkg,...prev]);
    }
    setShowForm(false);setEditId(null);
  }

  async function del(id){
    await supabase.from("packages").delete().eq("id",id);
    setPkgs(prev=>prev.filter(p=>p.id!==id));
  }

  async function setStatus(id,status){
    await supabase.from("packages").update({status}).eq("id",id);
    setPkgs(prev=>prev.map(p=>p.id===id?{...p,status}:p));
  }

  function getUrl(p){const c=COURIERS.find(c=>c.name===p.courier);return c?.url?c.url(p.awb):null;}

  async function shareParcel(p){
    setShareLoading(p.id);
    const {data,error}=await supabase.from("shared_links").insert({package_id:p.id,created_by:user.id}).select().single();
    setShareLoading(null);
    if(error||!data)return;
    const BASE=`${window.location.protocol}//${window.location.host}${window.location.pathname}`;
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

  function exportCSV(){
    const h=t.exportHeaders;
    const rows=viewPkgs.map(p=>[p.name,p.order_number||"",p.awb,p.courier,t.statuses[p.status]||p.status,p.date,p.shop||"",p.amount||"",p.notes||""]);
    const csv=[h,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="parcels.csv";a.click();
    setShowExp(false);
  }

  function exportXLSX(){
    const headers=t.exportHeaders;
    const data=viewPkgs.map(p=>({
      [headers[0]]:p.name,[headers[1]]:p.order_number||"",[headers[2]]:p.awb,
      [headers[3]]:p.courier,[headers[4]]:t.statuses[p.status]||p.status,
      [headers[5]]:p.date,[headers[6]]:p.shop||"",[headers[7]]:p.amount||"",[headers[8]]:p.notes||"",
    }));
    const ws=XLSX.utils.json_to_sheet(data);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Parcels");
    XLSX.writeFile(wb,"parcels.xlsx");
    setShowExp(false);
  }

  const LBL=(s)=>t.statuses[s]||s;
  const currentGroup=groups.find(g=>g.id===currentView)||null;

  // Filter packages by current view
  const viewPkgs=currentView==="personal"
    ?pkgs.filter(p=>!p.group_id)
    :pkgs.filter(p=>p.group_id===currentView);

  const counts=STATUSES.reduce((a,s)=>({...a,[s]:viewPkgs.filter(p=>p.status===s).length}),{});

  const filtered=viewPkgs.filter(p=>{
    const okS=filter==="Toate"||p.status===filter;
    const q=search.toLowerCase();
    const okQ=!q||p.name.toLowerCase().includes(q)||p.awb.toLowerCase().includes(q)||(p.shop||"").toLowerCase().includes(q);
    return okS&&okQ;
  }).sort((a,b)=>(STATUS_ORDER[a.status]??1)-(STATUS_ORDER[b.status]??1));

  const isGroupOwner=currentGroup&&currentGroup.group_members?.some(m=>m.user_id===user.id&&m.role==="owner");

  // Pull to refresh
  const [pullY,setPullY]           = useState(0);
  const [refreshing,setRefreshing] = useState(false);
  const touchStartY                = useRef(0);
  const PULL_THRESHOLD             = 70;

  function onTouchStart(e){
    if(window.scrollY===0) touchStartY.current=e.touches[0].clientY;
  }
  function onTouchMove(e){
    if(refreshing)return;
    const dy=e.touches[0].clientY-touchStartY.current;
    if(dy>0&&window.scrollY===0){
      setPullY(Math.min(dy*0.4,PULL_THRESHOLD));
    }
  }
  async function onTouchEnd(){
    if(pullY>=PULL_THRESHOLD&&!refreshing){
      setRefreshing(true);
      await loadAll();
      setRefreshing(false);
    }
    setPullY(0);
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",position:"relative"}}>
      <Background/>

      {/* Pull to refresh indicator */}
      <div style={{
        position:"fixed",top:0,left:0,right:0,zIndex:500,
        display:"flex",alignItems:"center",justifyContent:"center",
        height:`${Math.max(pullY, refreshing?44:0)}px`,
        overflow:"hidden",
        transition:pullY>0?"none":"height .3s ease",
        pointerEvents:"none",
      }}>
        {(pullY>10||refreshing)&&(
          <div style={{
            display:"flex",alignItems:"center",gap:8,
            opacity:refreshing?1:Math.min(pullY/PULL_THRESHOLD,1),
            transform:`scale(${refreshing?1:Math.min(0.7+pullY/PULL_THRESHOLD*0.3,1)})`,
            transition:refreshing?"none":"opacity .1s,transform .1s",
          }}>
            <div style={{
              width:28,height:28,borderRadius:"50%",
              background:"rgba(167,139,250,0.2)",
              border:"1.5px solid rgba(167,139,250,0.5)",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>
              <Loader size={14} style={{color:"#a78bfa",animation:refreshing?"spin 1s linear infinite":"none",transform:refreshing?"none":`rotate(${pullY*4}deg)`}}/>
            </div>
          </div>
        )}
      </div>

      <div style={{position:"relative",zIndex:1,padding:"1.5rem 1.25rem",maxWidth:800,margin:"0 auto",transform:`translateY(${pullY}px)`,transition:pullY>0?"none":"transform .3s ease"}}>

        {/* Header */}
        <div style={{marginBottom:"1rem"}}>
          {/* Row 1: logo + actions */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.6rem"}}>
            <div className="gc" style={{padding:9,borderRadius:16,display:"flex",flexShrink:0}}>
              <Package size={20} style={{color:"#a78bfa"}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <h1 style={{fontSize:18,fontWeight:600,color:"white",letterSpacing:"-0.01em"}}>{t.appName}</h1>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:1}}>
                {loading?t.loading:t.parcels(viewPkgs.length)}
              </p>
            </div>
            {/* Lang toggle + sign out always on right */}
            <LangToggle lang={lang} setLang={setLang}/>
            <button className="ib" onClick={()=>supabase.auth.signOut()} title={t.signOut}>
              <LogOut size={13}/>
            </button>
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
            <button className="gb gbp" onClick={()=>openForm()} style={{flex:1,justifyContent:"center"}}>
              <Plus size={14}/> {t.add}
            </button>
          </div>
        </div>

        {/* Groups nav */}
        <div className="gnav">
          <button className={`fp${currentView==="personal"?" act":""}`} onClick={()=>{setCurrentView("personal");setFilter("Toate");setSearch("");}}>
            {t.myParcels}
          </button>
          {groups.map(g=>(
            <button key={g.id} className={`fp${currentView===g.id?" act":""}`} onClick={()=>{setCurrentView(g.id);setFilter("Toate");setSearch("");}}>
              <Users size={11} style={{opacity:0.6}}/> {g.name}
            </button>
          ))}
          <button className="fp" onClick={()=>setShowGroupModal(true)} style={{color:"#a78bfa",borderColor:"rgba(167,139,250,0.3)"}}>
            + {t.newGroup}
          </button>
        </div>

        {/* Group header (when viewing a group) */}
        {currentGroup&&(
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.75rem",padding:"8px 12px",background:"rgba(167,139,250,0.08)",borderRadius:12,border:"1px solid rgba(167,139,250,0.2)"}}>
            <Users size={14} style={{color:"#a78bfa",flexShrink:0}}/>
            <span style={{fontSize:13,color:"rgba(255,255,255,0.7)",flex:1}}>{currentGroup.name} · {t.memberCount(currentGroup.group_members?.length||0)}</span>
            {isGroupOwner&&(
              <button className="ib" title={t.inviteLink} onClick={()=>{
                const BASE=`${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                const url=`${BASE}#invite/${currentGroup.invite_code}`;
                navigator.clipboard.writeText(url);
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
          <Search size={13} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)"}}/>
          <input className="gi" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{paddingLeft:36}}/>
          {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.35)",display:"flex",padding:2}}><X size={13}/></button>}
        </div>

        {/* Filters */}
        {viewPkgs.length>0&&(
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:"1rem"}}>
            <button className={`fp${filter==="Toate"?" act":""}`} onClick={()=>setFilter("Toate")}>{t.all} ({viewPkgs.length})</button>
            {STATUSES.filter(s=>counts[s]>0).map(s=>(
              <button key={s} className={`fp${filter===s?" act":""}`} onClick={()=>setFilter(filter===s?"Toate":s)}
                style={filter===s?{background:SC[s].bg,borderColor:SC[s].border,color:SC[s].color}:{}}>
                {LBL(s)} ({counts[s]})
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        {showForm&&(
          <div className="gc-strong" style={{padding:"1.5rem",marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem"}}>
              <h2 style={{fontSize:15,fontWeight:600,color:"white"}}>{editId?t.editParcel:t.newParcel}</h2>
              <button className="ib" onClick={()=>{setShowForm(false);setEditId(null);}}><X size={14}/></button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,overflow:"hidden"}}>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.description}</label>
                <input className="gi" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={t.descPlaceholder}/>
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.orderNumber}</label>
                <input className="gi" value={form.order_number} onChange={e=>setForm({...form,order_number:e.target.value})} placeholder={t.orderNumberPlaceholder}/>
              </div>
              {form.status!=="Comandat"&&(
                <>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.awbRequired}</label>
                    <input className="gi" value={form.awb} onChange={e=>setForm({...form,awb:e.target.value})} placeholder={t.awbPlaceholder} style={{fontFamily:"monospace"}}/>
                  </div>
                  <div style={{minWidth:0}}>
                    <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.courier}</label>
                    <select className="gi" value={form.courier} onChange={e=>setForm({...form,courier:e.target.value})}>
                      {COURIERS.map(c=><option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.shop}</label>
                <input className="gi" value={form.shop} onChange={e=>setForm({...form,shop:e.target.value})} placeholder={t.shopPlaceholder}/>
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.amount}</label>
                <input className="gi" type="number" min="0" step="0.01" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder={t.amountPlaceholder}/>
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.status}</label>
                <select className="gi" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {STATUSES.map(s=><option key={s} value={s}>{LBL(s)}</option>)}
                </select>
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.orderDate}</label>
                <input type="date" className="gi" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{colorScheme:"dark",maxWidth:"100%",minWidth:0}}/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(255,255,255,0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.notes}</label>
                <input className="gi" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder={t.notesPlaceholder}/>
              </div>
            </div>
            {formErr&&<p style={{fontSize:12,color:"#f87171",marginTop:8}}>{formErr}</p>}
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:"1.25rem"}}>
              <button className="gb" onClick={()=>{setShowForm(false);setEditId(null);}}>{t.cancel}</button>
              <button className="gb gbp" onClick={submit}>{editId?t.save:t.addParcel}</button>
            </div>
          </div>
        )}

        {/* Package list */}
        {loading?(
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.35)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={16} className="spin"/> {t.loadingParcels}
          </div>
        ):viewPkgs.length===0?(
          <div className="gc" style={{padding:"4rem 1rem",textAlign:"center"}}>
            <Package size={36} style={{color:"rgba(255,255,255,0.18)",marginBottom:12}}/>
            <p style={{color:"rgba(255,255,255,0.55)",fontSize:14}}>{currentGroup?t.noGroupParcels:t.noParcelAdded}</p>
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:13,marginTop:4}}>{currentGroup?t.addFirstGroupParcel:t.noParcelSub}</p>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(255,255,255,0.35)",fontSize:13}}>{t.noMatch}</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(p=>{
              const cfg=SC[p.status]||SC_FB;
              const url=getUrl(p);
              const isSharing=shareLoading===p.id;
              return (
                <div key={p.id} className="pkg">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:5}}>
                        <span style={{fontWeight:500,fontSize:15,color:"white"}}>{p.name}</span>
                        <span className="sp" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>{LBL(p.status)}</span>
                        {p.amount&&<span className="sp" style={{background:"rgba(52,211,153,0.12)",color:"#34d399",borderColor:"rgba(52,211,153,0.35)",fontSize:11}}>{Number(p.amount).toLocaleString("ro-RO",{minimumFractionDigits:2,maximumFractionDigits:2})} RON</span>}
                        {p.group_id&&currentView==="personal"&&(()=>{const g=groups.find(x=>x.id===p.group_id);return g?<span className="sp" style={{background:"rgba(167,139,250,0.12)",color:"#a78bfa",borderColor:"rgba(167,139,250,0.3)",fontSize:11,cursor:"default"}}><Users size={9}/> {g.name}</span>:null;})()}
                      </div>
                      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                        {p.order_number&&<span style={{fontSize:13,color:"rgba(255,255,255,0.55)",fontWeight:500}}>#{p.order_number.replace(/^#/,"")}</span>}
                        {p.status!=="Comandat"&&p.awb&&<span style={{fontFamily:"monospace",fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.awb}</span>}
                        {p.status!=="Comandat"&&p.courier&&<span style={{fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.courier}</span>}
                        {p.shop&&<span style={{fontSize:13,color:"rgba(255,255,255,0.42)"}}>{p.shop}</span>}
                        <span style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>{new Date(p.date+"T12:00:00").toLocaleDateString(lang==="en"?"en-GB":"ro-RO",{day:"numeric",month:"short",year:"numeric"})}</span>
                      </div>
                      {p.notes&&<div style={{fontSize:13,color:"rgba(255,255,255,0.3)",marginTop:4}}>{p.notes}</div>}
                    </div>
                    <div style={{display:"flex",gap:4,flexShrink:0,alignItems:"flex-start"}}>
                      <button className="ib" onClick={()=>shareParcel(p)} disabled={isSharing} title={t.share}>
                        {isSharing?<Loader size={13} className="spin"/>:<Share2 size={13}/>}
                      </button>
                      {p.user_id===user.id&&groups.length>0&&(
                        <button className="ib" onClick={()=>setMoveModal(p)} title={t.moveToGroup}>
                          <Users size={13}/>
                        </button>
                      )}
                      {url&&p.awb&&<a href={url} target="_blank" rel="noreferrer" className="ib" title={t.trackExternal}><ExternalLink size={13}/></a>}
                      <button className="ib" onClick={()=>openForm(p)} style={{padding:"6px 10px"}}>Edit</button>
                      <button className="ib ibx" onClick={()=>del(p.id)} aria-label={t.delete}><Trash2 size={13}/></button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.06)",flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginRight:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.quickStatus}</span>
                    {STATUSES.map(s=>{const c=SC[s];const act=p.status===s;return <button key={s} className="sp" onClick={()=>setStatus(p.id,s)} style={{background:act?c.bg:"rgba(255,255,255,0.04)",color:act?c.color:"rgba(255,255,255,0.32)",borderColor:act?c.border:"rgba(255,255,255,0.07)"}}>{LBL(s)}</button>;})}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{height:"2rem"}}/>
      </div>

      {moveModal&&<MoveModal pkg={moveModal} groups={groups} onMove={moveParcel} onClose={()=>setMoveModal(null)} t={t}/>}
      {shareModal&&<ShareModal shareUrl={shareModal.shareUrl} onClose={()=>setShareModal(null)} t={t}/>}
      {showGroupModal&&<GroupModal user={user} onClose={()=>setShowGroupModal(false)} onCreated={handleGroupCreated} t={t}/>}
      {inviteModal&&<InviteModal inviteCode={inviteModal} onJoined={handleGroupJoined} onDismiss={()=>{setInviteModal(null);localStorage.removeItem("pending_invite");history.replaceState(null,"",window.location.pathname);}} t={t}/>}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [session,setSession]         = useState(null);
  const [loadingAuth,setLoadingAuth] = useState(true);
  const [lang,setLang]               = useState(()=>localStorage.getItem(LANG_KEY)||"en");

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

  // Shared parcel view — no auth required
  if(shareToken){
    return(<><style>{STYLES}</style><SharedParcelView token={shareToken} lang={lang} setLang={setLang}/></>);
  }

  const pendingInvite=(!inviteCode&&localStorage.getItem("pending_invite"))||inviteCode||null;

  return (
    <>
      <style>{STYLES}</style>
      {loadingAuth?(
        <div style={{minHeight:"100vh",background:"linear-gradient(140deg,#16033a 0%,#0b1735 45%,#07121f 100%)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Background/>
        </div>
      ):session?(
        <MainApp user={session.user} lang={lang} setLang={setLang} pendingInvite={pendingInvite} key={session.user.id}/>
      ):(
        <LoginScreen lang={lang} setLang={setLang}/>
      )}
    </>
  );
}
