import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, ExternalLink, X, Search, Package, Download,
  FileText, Loader, ChevronDown, LogOut, Share2, Users, Copy,
  Check, UserPlus, RefreshCw, Sun, Moon, Smartphone,
} from "lucide-react";
import * as XLSX from "xlsx";
import { supabase } from "./supabase.js";

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    appName:"Parcel Tracking",appSub:"Track your parcels from any device",
    parcels:(n)=>`${n} ${n===1?"parcel":"parcels"}`,
    loading:"Loading...",loadingParcels:"Loading parcels...",
    export:"Export",downloadCSV:"Download CSV",downloadExcel:"Download Excel",
    add:"Add",signOut:"Sign out",
    searchPlaceholder:"Search by name, AWB or shop...",all:"All",
    newParcel:"New parcel",editParcel:"Edit parcel",
    description:"Description / order *",
    descPlaceholder:"e.g. Mechanical keyboard, 27 inch monitor...",
    awbPlaceholder:"e.g. 12345678",awbRequired:"AWB Number *",
    orderNumber:"Order number (optional)",orderNumberPlaceholder:"e.g. #123456789",
    courier:"Courier",shop:"Shop",shopPlaceholder:"e.g. eMag, Altex, PC Garage...",
    amount:"Amount (RON)",amountPlaceholder:"e.g. 349.99",
    status:"Status",orderDate:"Order date",
    notes:"Notes (optional)",notesPlaceholder:"value, product link, other details...",
    cancel:"Cancel",save:"Save changes",addParcel:"Add parcel",
    formErr:"Add at least one product.",formErrAwb:"Fill in the AWB number.",
    saveErr:"Save error: ",
    noParcelAdded:"No parcels yet",noParcelSub:'Press "Add" to get started',
    noMatch:"No parcels match the filters.",
    quickStatus:"Quick status:",trackExternal:"Open tracking page",delete:"Delete parcel",deleteConfirmMsg:"This action cannot be undone.",
    loginSub:"Track your parcels from any device",loginBtn:"Continue with Google",
    loginConnecting:"Connecting...",loginNote:"Each user sees only their own parcels.",
    statuses:{"Comandat":"Ordered","In livrare":"In delivery","Livrat":"Delivered"},
    exportHeaders:["Description","Order No.","AWB","Courier","Status","Date","Shop","Amount","Notes","Products"],
    // Share
    share:"Share",shareTitle:"Share parcel",
    shareDesc:"Anyone with this link can view this parcel (read-only, no account needed).",
    copyLink:"Copy link",copied:"Copied!",sharedParcel:"Shared parcel",backToApp:"Open app",
    // Groups
    myParcels:"My parcels",newGroup:"New group",
    groupName:"Group name *",groupNamePlaceholder:"e.g. Family, Colleagues...",
    createGroup:"Create group",inviteTitle:"Invite people",
    inviteDesc:"Share this link with people you want to add to this group.",
    inviteLink:"Invite link",copyInvite:"Copy invite link",
    joinGroup:"Join group",joiningGroup:"Joining...",joined:"Joined!",
    noGroupParcels:"No parcels in this group yet.",
    addFirstGroupParcel:'Press "Add" to add the first parcel.',
    leaveGroup:"Leave group",
    moveToGroup:"Move to group",move:"Move",
    invalidInvite:"Invalid or expired invite link.",memberCount:(n)=>`${n} ${n===1?"member":"members"}`,
    // Products
    products:"Products",addProduct:"Add product",productName:"Product name",qty:"Qty",noProductsYet:"No products added yet.",
    productCount:(n)=>`${n} ${n===1?"product":"products"}`,
    // Install guide
    installApp:"Install app",
    installTitle:"Install on your phone",
    installIntro:"Add Parcel Tracking to your home screen for quick, full-screen access — it works offline like a native app.",
    installIosTitle:"iPhone & iPad — Safari",
    installAndroidTitle:"Android — Chrome",
    installIosSteps:["Open this page in Safari.","Tap the Share button (a square with an upward arrow).","Scroll down and tap “Add to Home Screen”.","Tap “Add” in the top-right corner."],
    installAndroidSteps:["Open this page in Chrome.","Tap the menu (⋮) in the top-right.","Tap “Add to Home screen” (or “Install app”).","Confirm by tapping “Add” / “Install”."],
    installNote:"Once added, open the app from its icon — no browser bar, full-screen.",
    gotIt:"Got it",
  },
  ro: {
    appName:"Parcel Tracking",appSub:"Urmărește-ți coletele de pe orice device",
    parcels:(n)=>`${n} ${n===1?"colet":"colete"}`,
    loading:"Se încarcă...",loadingParcels:"Se încarcă coletele...",
    export:"Export",downloadCSV:"Descarcă CSV",downloadExcel:"Descarcă Excel",
    add:"Adaugă",signOut:"Deconectează-te",
    searchPlaceholder:"Caută după nume, AWB sau magazin...",all:"Toate",
    newParcel:"Colet nou",editParcel:"Editează colet",
    description:"Descriere / comandă *",
    descPlaceholder:"ex. Tastatură mecanică, Monitor 27 inch...",
    awbPlaceholder:"ex. 12345678",awbRequired:"Număr AWB *",
    orderNumber:"Număr comandă (opțional)",orderNumberPlaceholder:"ex. #123456789",
    courier:"Curier",shop:"Magazin",shopPlaceholder:"ex. eMag, Altex, PC Garage...",
    amount:"Sumă (RON)",amountPlaceholder:"ex. 349.99",
    status:"Status",orderDate:"Data comenzii",
    notes:"Note (opțional)",notesPlaceholder:"valoare, link produs, alte detalii...",
    cancel:"Anulează",save:"Salvează modificările",addParcel:"Adaugă colet",
    formErr:"Adaugă cel puțin un produs.",formErrAwb:"Completează numărul AWB.",
    saveErr:"Eroare la salvare: ",
    noParcelAdded:"Niciun colet adăugat",noParcelSub:'Apasă „Adaugă" pentru a începe',
    noMatch:"Niciun colet nu corespunde filtrelor.",
    quickStatus:"Status rapid:",trackExternal:"Deschide pagina de tracking",delete:"Șterge coletul",deleteConfirmMsg:"Această acțiune nu poate fi anulată.",
    loginSub:"Urmărește-ți coletele de pe orice device",loginBtn:"Continuă cu Google",
    loginConnecting:"Se conectează...",loginNote:"Fiecare utilizator vede doar propriile colete.",
    statuses:{"Comandat":"Comandat","In livrare":"In livrare","Livrat":"Livrat"},
    exportHeaders:["Descriere","Nr. comandă","AWB","Curier","Status","Data","Magazin","Suma","Note","Produse"],
    // Share
    share:"Distribuie",shareTitle:"Distribuie colet",
    shareDesc:"Oricine cu acest link poate vedea acest colet (doar citire, fără cont necesar).",
    copyLink:"Copiază linkul",copied:"Copiat!",sharedParcel:"Colet distribuit",backToApp:"Deschide aplicația",
    // Groups
    myParcels:"Coletele mele",newGroup:"Grup nou",
    groupName:"Numele grupului *",groupNamePlaceholder:"ex. Familie, Colegi...",
    createGroup:"Creează grup",inviteTitle:"Invită persoane",
    inviteDesc:"Trimite acest link persoanelor pe care vrei să le adaugi în grup.",
    inviteLink:"Link de invitație",copyInvite:"Copiază link invitație",
    joinGroup:"Alătură-te grupului",joiningGroup:"Se procesează...",joined:"Te-ai alăturat!",
    noGroupParcels:"Niciun colet în acest grup.",
    addFirstGroupParcel:'Apasă „Adaugă" pentru a adăuga primul colet.',
    leaveGroup:"Ieși din grup",
    moveToGroup:"Mută în grup",move:"Mută",
    invalidInvite:"Link de invitație invalid sau expirat.",memberCount:(n)=>`${n} ${n===1?"membru":"membri"}`,
    // Products
    products:"Produse",addProduct:"Adaugă produs",productName:"Numele produsului",qty:"Cant.",noProductsYet:"Niciun produs adăugat.",
    productCount:(n)=>`${n} ${n===1?"produs":"produse"}`,
    // Ghid instalare
    installApp:"Instalează aplicația",
    installTitle:"Instalează pe telefon",
    installIntro:"Adaugă Parcel Tracking pe ecranul principal pentru acces rapid, pe tot ecranul — funcționează offline ca o aplicație nativă.",
    installIosTitle:"iPhone & iPad — Safari",
    installAndroidTitle:"Android — Chrome",
    installIosSteps:["Deschide această pagină în Safari.","Apasă butonul Share (un pătrat cu o săgeată în sus).","Derulează în jos și apasă „Add to Home Screen” / „Adaugă pe ecranul principal”.","Apasă „Add” / „Adaugă” în colțul din dreapta sus."],
    installAndroidSteps:["Deschide această pagină în Chrome.","Apasă meniul (⋮) din dreapta sus.","Apasă „Adaugă pe ecranul principal” (sau „Instalează aplicația”).","Confirmă apăsând „Adaugă” / „Instalează”."],
    installNote:"După adăugare, deschide aplicația din iconiță — fără bara browserului, pe tot ecranul.",
    gotIt:"Am înțeles",
  },
};

const LANG_KEY = "parcel-lang";
const THEME_KEY = "parcel-theme";

// ── Constants ─────────────────────────────────────────────────────────────────

const COURIERS = [
  {name:"FAN Courier", url:(a)=>`https://www.fancourier.ro/awb-tracking/?awb=${a}`},
  {name:"Cargus",      url:(a)=>`https://www.cargus.ro/tracking-colet/?Awb=${a}`},
  {name:"Sameday",     url:(a)=>`https://sameday.ro/status-colet/?awb=${a}`},
  {name:"DPD",         url:(a)=>`https://awb.woot.ro/urmarire-colet-dpd/${a}`},
  {name:"GLS",         url:(a)=>`https://awb.woot.ro/urmarire-colet-gls/${a}`},
  {name:"Posta Romana",url:(a)=>`https://awb.woot.ro/urmarire-colet-postaromana/${a}`},
  {name:"DHL",         url:(a)=>`https://awb.woot.ro/urmarire-colet-dhl/${a}`},
  {name:"FedEx",       url:(a)=>`https://awb.woot.ro/urmarire-colet-fedex/${a}`},
  {name:"UPS",         url:(a)=>`https://awb.woot.ro/urmarire-colet-ups/${a}`},
  {name:"Sinapseria",  url:(a)=>`https://awb.woot.ro/urmarire-colet-sinapseria/${a}`},
  {name:"Dragon Star", url:(a)=>`https://awb.woot.ro/urmarire-colet-dragonstar/${a}`},
  {name:"PTT Express", url:(a)=>`https://awb.woot.ro/urmarire-colet-pttexpress/${a}`},
];

const STATUSES = ["Comandat","In livrare","Livrat"];

const SC_LOW = {color:"rgba(var(--ink),0.55)",bg:"rgba(var(--ink),0.07)",border:"rgba(var(--ink),0.16)"};
const SC_MID = {color:"rgba(var(--ink),0.92)",bg:"rgba(var(--ink),0.1)",border:"rgba(var(--ink),0.26)"};
const SC_SOLID = {color:"var(--accent-fg)",bg:"rgb(var(--accent))",border:"transparent"};

const SC = {
  "Comandat":   SC_LOW,
  "In livrare": SC_MID,
  "Livrat":     SC_SOLID,
  "In procesare":SC_MID,
  "In tranzit": SC_MID,
  "La livrare": SC_MID,
  "Retur":      SC_LOW,
};

const SC_FB = SC_LOW;
const STATUS_ORDER = {"Comandat":0,"In livrare":1,"Livrat":2};

const emptyForm = () => ({
  name:"",awb:"",courier:"FAN Courier",status:"Comandat",
  date:new Date().toISOString().split("T")[0],notes:"",shop:"",amount:"",order_number:"",
  products:[{name:"",qty:1}],
});

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  *{box-sizing:border-box;margin:0;padding:0}
  :root,[data-theme="dark"]{
    --ink:245,245,245;
    --accent:245,245,245;
    --accent-fg:#161618;
    --bg:#141416;
    --bg-solid:#141416;
    --glass-bg:#1d1d20;
    --glass-bg-strong:#26262a;
    --glass-bg-hover:#2b2b30;
    --glass-border:rgba(245,245,245,0.1);
    --glass-border-strong:rgba(245,245,245,0.18);
    --pkg-bg:#1d1d20;
    --pkg-border:rgba(245,245,245,0.08);
    --input-bg:#0f0f11;
    --input-border:rgba(245,245,245,0.14);
    --btn-bg:#26262a;
    --btn-border:rgba(245,245,245,0.11);
    --menu-bg:#26262a;
    --option-bg:#1d1d20;
    --scrim:rgba(0,0,0,0.7);
    --shadow:rgba(0,0,0,0.35);
    --shadow-strong:rgba(0,0,0,0.5);
    --card-shadow:0 1px 3px rgba(0,0,0,0.3),0 8px 24px rgba(0,0,0,0.36);
    --card-shadow-strong:0 18px 50px rgba(0,0,0,0.55);
  }
  [data-theme="light"]{
    --ink:22,16,30;
    --accent:22,16,30;
    --accent-fg:#f5f5f5;
    --bg:#f5f5f5;
    --bg-solid:#f5f5f5;
    --glass-bg:#ffffff;
    --glass-bg-strong:#ffffff;
    --glass-bg-hover:#f3f3f5;
    --glass-border:rgba(22,16,30,0.08);
    --glass-border-strong:rgba(22,16,30,0.12);
    --pkg-bg:#ffffff;
    --pkg-border:rgba(22,16,30,0.07);
    --input-bg:#ffffff;
    --input-border:rgba(22,16,30,0.14);
    --btn-bg:#ffffff;
    --btn-border:rgba(22,16,30,0.1);
    --menu-bg:#ffffff;
    --option-bg:#ffffff;
    --scrim:rgba(22,16,30,0.3);
    --shadow:rgba(22,16,30,0.08);
    --shadow-strong:rgba(22,16,30,0.12);
    --card-shadow:0 1px 2px rgba(0,0,0,0.04),0 4px 10px rgba(0,0,0,0.05),0 14px 28px rgba(0,0,0,0.06);
    --card-shadow-strong:0 14px 48px rgba(0,0,0,0.14);
  }
  body{font-family:'Plus Jakarta Sans','Inter',sans-serif;background:var(--bg-solid);-webkit-font-smoothing:antialiased;scroll-behavior:smooth;overflow-x:hidden;transition:background .35s ease}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin 1s linear infinite}
  .gc{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:20px;box-shadow:var(--card-shadow)}
  .gc-strong{background:var(--glass-bg-strong);border:1px solid var(--glass-border-strong);border-radius:22px;box-shadow:var(--card-shadow-strong)}
  .pkg{background:var(--pkg-bg);border:1px solid var(--pkg-border);border-radius:16px;box-shadow:var(--card-shadow);padding:1rem 1.25rem;transition:border-color .2s,transform .2s,box-shadow .2s,background .3s;overflow:hidden}
  .pkg:hover{border-color:var(--glass-border-strong);transform:translateY(-2px);box-shadow:var(--card-shadow-strong)}
  .gi{background:var(--input-bg);border:1px solid var(--input-border);border-radius:11px;color:rgb(var(--ink));font-size:14px;padding:10px 14px;outline:none;font-family:'Plus Jakarta Sans','Inter',sans-serif;transition:border-color .2s,box-shadow .2s,background .3s;width:100%}
  .gi::placeholder{color:rgba(var(--ink),0.38)}
  .gi:focus{border-color:rgba(var(--ink),0.5);box-shadow:0 0 0 3px rgba(var(--ink),0.08)}
  .gi option{background:var(--option-bg);color:rgb(var(--ink))}
  .gb{background:var(--btn-bg);border:1px solid var(--btn-border);border-radius:11px;color:rgba(var(--ink),0.88);cursor:pointer;font-size:14px;font-family:'Plus Jakarta Sans','Inter',sans-serif;padding:8px 16px;transition:all .2s;display:inline-flex;align-items:center;gap:6px;box-shadow:var(--card-shadow)}
  .gb:hover{background:var(--glass-bg-hover);transform:translateY(-1px);box-shadow:var(--card-shadow-strong)}
  .gb:active{transform:scale(0.97) translateY(0)}
  .gb:disabled{opacity:0.4;cursor:not-allowed;transform:none}
  .gbp{background:rgb(var(--accent));border-color:transparent;box-shadow:var(--card-shadow);color:var(--accent-fg);font-weight:600}
  .gbp:hover{background:rgba(var(--accent),0.9);border-color:transparent;box-shadow:var(--card-shadow-strong)}
  .ib{background:var(--btn-bg);border:1px solid var(--btn-border);border-radius:10px;color:rgba(var(--ink),0.6);cursor:pointer;padding:6px 8px;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:all .18s;font-family:'Plus Jakarta Sans','Inter',sans-serif;font-size:13px}
  .ib:hover{background:var(--glass-bg-hover);color:rgb(var(--ink));transform:translateY(-1px)}
  .ib:active{transform:scale(0.95)}
  .ib:disabled{opacity:0.3;cursor:not-allowed;transform:none}
  .ibx:hover{background:rgba(248,113,113,0.16);border-color:rgba(248,113,113,0.4);color:#ef4444;transform:translateY(-1px)}
  .fp{font-size:13px;padding:6px 15px;border-radius:100px;cursor:pointer;border:1px solid var(--glass-border-strong);background:var(--glass-bg);color:rgba(var(--ink),0.7);transition:all .18s;font-family:'Plus Jakarta Sans','Inter',sans-serif;white-space:nowrap;flex-shrink:0;box-shadow:var(--card-shadow)}
  .fp:hover{background:var(--glass-bg-hover);color:rgb(var(--ink));border-color:rgba(var(--ink),0.28)}
  .fp.act{background:rgb(var(--accent));border-color:transparent;color:var(--accent-fg);font-weight:600;box-shadow:var(--card-shadow)}
  .sp{font-size:12px;padding:3px 10px;border-radius:100px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .15s;font-family:'Plus Jakarta Sans','Inter',sans-serif;letter-spacing:0.01em}
  .sp:hover{opacity:0.8}
  .sp:active{transform:scale(0.95)}
  .em{position:absolute;top:calc(100% + 8px);right:0;background:var(--menu-bg);border:1px solid var(--glass-border);border-radius:14px;padding:6px;min-width:165px;z-index:200;box-shadow:var(--card-shadow-strong)}
  .ei{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;cursor:pointer;color:rgba(var(--ink),0.78);font-size:14px;transition:background .15s;font-family:'Plus Jakarta Sans','Inter',sans-serif;background:none;border:none;width:100%;text-align:left}
  .ei:hover{background:var(--glass-bg-hover);color:rgb(var(--ink))}
  .overlay{position:fixed;inset:0;background:var(--scrim);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem}
  .lang-btn{background:var(--btn-bg);border:1px solid var(--btn-border);border-radius:10px;color:rgba(var(--ink),0.65);cursor:pointer;padding:5px 4px;display:inline-flex;align-items:center;gap:2px;font-family:'Plus Jakarta Sans','Inter',sans-serif;font-size:12px;font-weight:500;transition:all .15s;min-width:52px;justify-content:center}
  .lang-btn:hover{background:var(--glass-bg-hover);color:rgb(var(--ink))}
  .lang-seg{padding:3px 7px;border-radius:7px;transition:all .15s;line-height:1;display:inline-flex;align-items:center}
  .lang-seg.active{background:rgba(var(--accent),0.28);color:rgb(var(--ink))}
  .gnav{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;margin-bottom:1rem;scrollbar-width:none}
  .gnav::-webkit-scrollbar{display:none}
  a{color:inherit;text-decoration:none}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(var(--accent),0.22);border-radius:2px}
  :focus-visible{outline:2px solid rgba(var(--accent),0.6);outline-offset:2px;border-radius:4px}
  .pkg-name{font-weight:600;font-size:15px;color:rgb(var(--ink));letter-spacing:-0.01em;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
  .pkg-content{flex:1;min-width:0;overflow:hidden}
  .pkg-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  .pkg-actions{display:flex;gap:4px;flex-shrink:0;align-items:flex-start}
  .pkg-meta{display:flex;gap:6px 14px;flex-wrap:wrap;align-items:center}
  .ptag{display:block;font-size:12px;color:rgba(var(--ink),0.5);background:rgba(var(--ink),0.06);padding:3px 9px;border-radius:6px;border:1px solid rgba(var(--ink),0.1);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  @media (max-width:520px){
    .pkg{padding:0.875rem 1rem}
    .pkg-top{flex-direction:column;gap:10px}
    .pkg-actions{width:100%;justify-content:flex-end}
    .pkg-name{-webkit-line-clamp:3}
    .pkg-content{max-width:calc(100vw - 4.5rem)}
  }
`;

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

  const BASE = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  const LBL  = (s)=>t.statuses[s]||s;

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
          const cfg=SC[pkg.status]||SC_FB;
          const courier=COURIERS.find(c=>c.name===pkg.courier);
          const url=courier?.url?courier.url(pkg.awb):null;
          return (
            <div className="pkg">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:5}}>
                    <span style={{fontWeight:500,fontSize:15,color:"rgb(var(--ink))"}}>{pkg.name}</span>
                    <span className="sp" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border,cursor:"default"}}>{LBL(pkg.status)}</span>
                    {pkg.amount&&<span className="sp" style={{background:"rgba(var(--ink),0.06)",color:"rgba(var(--ink),0.72)",borderColor:"rgba(var(--ink),0.16)",fontSize:11,cursor:"default"}}>{Number(pkg.amount).toLocaleString("ro-RO",{minimumFractionDigits:2,maximumFractionDigits:2})} RON</span>}
                  </div>
                  <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                    {pkg.order_number&&<span style={{fontSize:13,color:"rgba(var(--ink),0.55)",fontWeight:500}}>#{pkg.order_number.replace(/^#/,"")}</span>}
                    {pkg.status!=="Comandat"&&pkg.awb&&<span style={{fontFamily:"monospace",fontSize:13,color:"rgba(var(--ink),0.42)"}}>{pkg.awb}</span>}
                    {pkg.status!=="Comandat"&&pkg.courier&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{pkg.courier}</span>}
                    {pkg.shop&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{pkg.shop}</span>}
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
  function copy(){
    navigator.clipboard.writeText(shareUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
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
          <Users size={24} style={{color:"rgb(var(--accent))"}}/>
        </div>
        {loading?(
          <div style={{color:"rgba(var(--ink),0.4)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={14} className="spin"/>{t.loading}
          </div>
        ):done?(
          <div>
            <div style={{fontSize:36,marginBottom:8}}>✓</div>
            <p style={{color:"rgb(var(--ink))",fontSize:15,fontWeight:500}}>{t.joined}</p>
          </div>
        ):group?(
          <>
            <h2 style={{fontSize:18,fontWeight:600,color:"rgb(var(--ink))",marginBottom:6}}>{group.name}</h2>
            <p style={{fontSize:13,color:"rgba(var(--ink),0.45)",marginBottom:"1.5rem"}}>{t.joinGroup}?</p>
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
    const redirectTo=window.location.hostname==="localhost"
      ?"http://localhost:5173/parcels-tracking/"
      :"https://mrmcb92.github.io/parcels-tracking/";
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
              style={{padding:"10px 14px",borderRadius:12,border:`1px solid ${selected===o.id?"rgba(var(--accent),0.5)":"rgba(var(--ink),0.1)"}`,background:selected===o.id?"rgba(var(--accent),0.18)":"rgba(var(--ink),0.04)",color:selected===o.id?"rgb(var(--accent))":"rgba(var(--ink),0.7)",cursor:"pointer",textAlign:"left",fontSize:14,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:8,transition:"all .15s"}}>
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
        <div className="gc" style={{display:"inline-flex",padding:"10px",borderRadius:16,marginBottom:14}}>
          <Trash2 size={20} style={{color:"#f87171"}}/>
        </div>
        <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))",marginBottom:6}}>{t.delete}</h2>
        <p style={{fontSize:13,color:"rgba(var(--ink),0.55)",marginBottom:4}}>{pkg.name}</p>
        <p style={{fontSize:12,color:"rgba(var(--ink),0.3)",marginBottom:"1.5rem"}}>{t.deleteConfirmMsg}</p>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}>
          <button className="gb" onClick={onClose}>{t.cancel}</button>
          <button className="gb" onClick={onConfirm}
            style={{background:"rgba(248,113,113,0.2)",borderColor:"rgba(248,113,113,0.45)",color:"#f87171"}}>
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

// ── MainApp ───────────────────────────────────────────────────────────────────

function MainApp({user,lang,setLang,theme,setTheme,pendingInvite}) {
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
  const [deleteConfirm,setDeleteConfirm] = useState(null); // package to delete
  const [showInstall,setShowInstall] = useState(false);
  const isStandalone = typeof window!=="undefined" && (window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone);
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
    setForm(p?{name:p.name,awb:p.awb,courier:p.courier,status:p.status,date:p.date,notes:p.notes||"",shop:p.shop||"",amount:p.amount||"",order_number:p.order_number||"",products:p.products||[]}:emptyForm());
    setEditId(p?p.id:null);setFormErr("");setShowForm(true);
  }

  async function submit(){
    const validProducts=form.products.filter(p=>p.name.trim());
    if(validProducts.length===0){setFormErr(t.formErr);return;}
    if(form.status!=="Comandat"&&!form.awb.trim()){setFormErr(t.formErrAwb);return;}
    const autoName=validProducts.map(p=>`${p.qty>1?p.qty+"× ":""}${p.name.trim()}`).join(", ");
    const entry={...form,name:autoName,awb:form.awb.trim(),products:validProducts};
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

  // Product helpers
  function addProduct(){ setForm(f=>({...f,products:[...f.products,{name:"",qty:1}]})); }
  function removeProduct(i){ setForm(f=>({...f,products:f.products.filter((_,j)=>j!==i)})); }
  function updateProduct(i,field,value){ setForm(f=>({...f,products:f.products.map((pr,j)=>j===i?{...pr,[field]:value}:pr)})); }

  function exportCSV(){
    const h=t.exportHeaders;
    const rows=viewPkgs.map(p=>[p.name,p.order_number||"",p.awb,p.courier,t.statuses[p.status]||p.status,p.date,p.shop||"",p.amount||"",p.notes||"",(p.products||[]).map(x=>`${x.qty>1?x.qty+"× ":""}${x.name}`).join("; ")]);
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
      [headers[9]]:(p.products||[]).map(x=>`${x.qty>1?x.qty+"× ":""}${x.name}`).join("; "),
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
  const [refreshing,setRefreshing] = useState(false);

  async function handleRefresh(){
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",position:"relative"}}>
      <Background/>
      <div style={{position:"relative",zIndex:1,padding:"1.5rem 1.25rem",maxWidth:800,margin:"0 auto"}}>

        {/* Header */}
        <div style={{marginBottom:"1rem"}}>
          {/* Row 1: logo + refresh + lang + signout */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"0.6rem"}}>
            <div className="gc" style={{padding:9,borderRadius:16,display:"flex",flexShrink:0}}>
              <Package size={20} style={{color:"rgb(var(--accent))"}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <h1 style={{fontSize:18,fontWeight:600,color:"rgb(var(--ink))",letterSpacing:"-0.02em"}}>{t.appName}</h1>
              <p style={{fontSize:12,color:"rgba(var(--ink),0.4)",marginTop:1}}>
                {loading?t.loading:t.parcels(viewPkgs.length)}
              </p>
            </div>
            <button className="ib" onClick={handleRefresh} disabled={refreshing} title="Refresh">
              <RefreshCw size={13} className={refreshing?"spin":""}/>
            </button>
            <ThemeToggle theme={theme} setTheme={setTheme}/><LangToggle lang={lang} setLang={setLang}/>
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
          <button className={`fp${currentView==="personal"?" act":""}`} onClick={()=>{setCurrentView("personal");setFilter("Toate");setSearch("");}}>
            {t.myParcels}
          </button>
          {groups.map(g=>(
            <button key={g.id} className={`fp${currentView===g.id?" act":""}`} onClick={()=>{setCurrentView(g.id);setFilter("Toate");setSearch("");}}>
              <Users size={11} style={{opacity:0.6}}/> {g.name}
            </button>
          ))}
          <button className="fp" onClick={()=>setShowGroupModal(true)} style={{color:"rgb(var(--accent))",borderColor:"rgba(var(--accent),0.3)"}}>
            + {t.newGroup}
          </button>
        </div>

        {/* Group header (when viewing a group) */}
        {currentGroup&&(
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"0.75rem",padding:"8px 12px",background:"rgba(var(--accent),0.08)",borderRadius:12,border:"1px solid rgba(var(--accent),0.2)"}}>
            <Users size={14} style={{color:"rgb(var(--accent))",flexShrink:0}}/>
            <span style={{fontSize:13,color:"rgba(var(--ink),0.7)",flex:1}}>{currentGroup.name} · {t.memberCount(currentGroup.group_members?.length||0)}</span>
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
          <Search size={13} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(var(--ink),0.3)"}}/>
          <input className="gi" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{paddingLeft:36}}/>
          {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(var(--ink),0.35)",display:"flex",padding:2}}><X size={13}/></button>}
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
              <h2 style={{fontSize:15,fontWeight:600,color:"rgb(var(--ink))"}}>{editId?t.editParcel:t.newParcel}</h2>
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
              {form.status!=="Comandat"?(
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
              ):(
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
              )}
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.status}</label>
                <select className="gi" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  {STATUSES.map(s=><option key={s} value={s}>{LBL(s)}</option>)}
                </select>
              </div>
              <div style={{minWidth:0}}>
                <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.orderDate}</label>
                <input type="date" className="gi" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={{colorScheme:"dark",maxWidth:"100%",minWidth:0}}/>
              </div>
              <div style={{gridColumn:"span 2"}}>
                <label style={{fontSize:10,color:"rgba(var(--ink),0.42)",display:"block",marginBottom:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{t.notes}</label>
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
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(var(--ink),0.35)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Loader size={16} className="spin"/> {t.loadingParcels}
          </div>
        ):viewPkgs.length===0?(
          <div className="gc" style={{padding:"4rem 1rem",textAlign:"center"}}>
            <Package size={36} style={{color:"rgba(var(--ink),0.18)",marginBottom:12}}/>
            <p style={{color:"rgba(var(--ink),0.55)",fontSize:14}}>{currentGroup?t.noGroupParcels:t.noParcelAdded}</p>
            <p style={{color:"rgba(var(--ink),0.3)",fontSize:13,marginTop:4}}>{currentGroup?t.addFirstGroupParcel:t.noParcelSub}</p>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:"center",padding:"3rem",color:"rgba(var(--ink),0.35)",fontSize:13}}>{t.noMatch}</div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtered.map(p=>{
              const cfg=SC[p.status]||SC_FB;
              const url=getUrl(p);
              const isSharing=shareLoading===p.id;
              return (
                <div key={p.id} className="pkg">
                  <div className="pkg-top">
                    <div className="pkg-content">
                      <span className="pkg-name" title={p.name}>{p.name}</span>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginTop:6}}>
                        <span className="sp" style={{background:cfg.bg,color:cfg.color,borderColor:cfg.border}}>{LBL(p.status)}</span>
                        {p.amount&&<span className="sp" style={{background:"rgba(var(--ink),0.06)",color:"rgba(var(--ink),0.72)",borderColor:"rgba(var(--ink),0.16)",fontSize:11}}>{Number(p.amount).toLocaleString("ro-RO",{minimumFractionDigits:2,maximumFractionDigits:2})} RON</span>}
                        {p.products&&p.products.length>0&&<span className="sp" style={{background:"rgba(var(--ink),0.06)",color:"rgba(var(--ink),0.55)",borderColor:"rgba(var(--ink),0.18)",fontSize:11,cursor:"default"}}>{t.productCount(p.products.length)}</span>}
                        {p.group_id&&currentView==="personal"&&(()=>{const g=groups.find(x=>x.id===p.group_id);return g?<span className="sp" style={{background:"rgba(var(--accent),0.12)",color:"rgb(var(--accent))",borderColor:"rgba(var(--accent),0.3)",fontSize:11,cursor:"default"}}><Users size={9}/> {g.name}</span>:null;})()}
                      </div>
                      <div className="pkg-meta" style={{marginTop:6}}>
                        {p.order_number&&<span style={{fontSize:13,color:"rgba(var(--ink),0.55)",fontWeight:500}}>#{p.order_number.replace(/^#/,"")}</span>}
                        {p.status!=="Comandat"&&p.awb&&<span style={{fontFamily:"monospace",fontSize:13,color:"rgba(var(--ink),0.42)"}}>{p.awb}</span>}
                        {p.status!=="Comandat"&&p.courier&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{p.courier}</span>}
                        {p.shop&&<span style={{fontSize:13,color:"rgba(var(--ink),0.42)"}}>{p.shop}</span>}
                        <span style={{fontSize:13,color:"rgba(var(--ink),0.3)"}}>{new Date(p.date+"T12:00:00").toLocaleDateString(lang==="en"?"en-GB":"ro-RO",{day:"numeric",month:"short",year:"numeric"})}</span>
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
                    <div className="pkg-actions">
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
                      <button className="ib ibx" onClick={()=>setDeleteConfirm(p)} aria-label={t.delete}><Trash2 size={13}/></button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,marginTop:10,paddingTop:10,borderTop:"1px solid rgba(var(--ink),0.06)",flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{fontSize:10,color:"rgba(var(--ink),0.25)",marginRight:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.quickStatus}</span>
                    {STATUSES.map(s=>{const c=SC[s];const act=p.status===s;return <button key={s} className="sp" onClick={()=>setStatus(p.id,s)} style={{background:act?c.bg:"rgba(var(--ink),0.04)",color:act?c.color:"rgba(var(--ink),0.32)",borderColor:act?c.border:"rgba(var(--ink),0.07)"}}>{LBL(s)}</button>;})}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{height:"2rem"}}/>
      </div>

      {showInstall&&<InstallGuideModal onClose={()=>setShowInstall(false)} t={t}/>}
      {deleteConfirm&&<ConfirmDeleteModal pkg={deleteConfirm} onConfirm={()=>{del(deleteConfirm.id);setDeleteConfirm(null);}} onClose={()=>setDeleteConfirm(null)} t={t}/>}
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
    if(meta)meta.setAttribute("content",theme==="dark"?"#141416":"#f5f5f5");
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
