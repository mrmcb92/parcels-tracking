const cleanAwb = (a) => encodeURIComponent(String(a || "").trim().replace(/\s+/g, ""));

export const COURIERS = [
  {name:"FAN Courier", url:(a)=>`https://www.fancourier.ro/awb-tracking/?awb=${cleanAwb(a)}`},
  {name:"Cargus",      url:(a)=>`https://www.cargus.ro/tracking-colet/?Awb=${cleanAwb(a)}`},
  {name:"Sameday",     url:(a)=>`https://sameday.ro/status-colet/?awb=${cleanAwb(a)}`},
  {name:"DPD",         url:(a)=>`https://awb.woot.ro/urmarire-colet-dpd/${cleanAwb(a)}`},
  {name:"GLS",         url:(a)=>`https://awb.woot.ro/urmarire-colet-gls/${cleanAwb(a)}`},
  {name:"Posta Romana",url:(a)=>`https://awb.woot.ro/urmarire-colet-postaromana/${cleanAwb(a)}`},
  {name:"DHL",         url:(a)=>`https://awb.woot.ro/urmarire-colet-dhl/${cleanAwb(a)}`},
  {name:"FedEx",       url:(a)=>`https://awb.woot.ro/urmarire-colet-fedex/${cleanAwb(a)}`},
  {name:"UPS",         url:(a)=>`https://awb.woot.ro/urmarire-colet-ups/${cleanAwb(a)}`},
  {name:"Sinapseria",  url:(a)=>`https://awb.woot.ro/urmarire-colet-sinapseria/${cleanAwb(a)}`},
  {name:"Dragon Star", url:(a)=>`https://awb.woot.ro/urmarire-colet-dragonstar/${cleanAwb(a)}`},
  {name:"PTT Express", url:(a)=>`https://awb.woot.ro/urmarire-colet-pttexpress/${cleanAwb(a)}`},
];

export const STATUSES = ["Comandat","In livrare","Livrat"];

// Statusuri pentru coletele expediate la clienți.
export const OUT_STATUSES = ["Pregatit","Expediat","In livrare","Livrat","Retur"];

export const SC = {
  "Comandat":    { color: "#6366f1", bg: "rgba(99, 102, 241, 0.12)", border: "rgba(99, 102, 241, 0.30)", dot: "#6366f1" },
  "In livrare":  { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.14)", border: "rgba(245, 158, 11, 0.35)", dot: "#f59e0b" },
  "Livrat":      { color: "#10b981", bg: "rgba(16, 185, 129, 0.14)", border: "rgba(16, 185, 129, 0.35)", dot: "#10b981" },
  "In procesare":{ color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.12)", border: "rgba(14, 165, 233, 0.30)", dot: "#0ea5e9" },
  "In tranzit":  { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.30)", dot: "#38bdf8" },
  "La livrare":  { color: "#f97316", bg: "rgba(249, 115, 22, 0.14)", border: "rgba(249, 115, 22, 0.35)", dot: "#f97316" },
  "Retur":       { color: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.30)", dot: "#f43f5e" },
};

export const SC_OUT = {
  "Pregatit":   { color: "#6366f1", bg: "rgba(99, 102, 241, 0.12)", border: "rgba(99, 102, 241, 0.30)", dot: "#6366f1" },
  "Expediat":   { color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.12)", border: "rgba(14, 165, 233, 0.30)", dot: "#0ea5e9" },
  "In livrare": { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.14)", border: "rgba(245, 158, 11, 0.35)", dot: "#f59e0b" },
  "Livrat":     { color: "#10b981", bg: "rgba(16, 185, 129, 0.14)", border: "rgba(16, 185, 129, 0.35)", dot: "#10b981" },
  "Retur":      { color: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.30)", dot: "#f43f5e" },
  "In procesare":{ color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.12)", border: "rgba(14, 165, 233, 0.30)", dot: "#0ea5e9" },
  "In tranzit": { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.30)", dot: "#38bdf8" },
  "La livrare": { color: "#f97316", bg: "rgba(249, 115, 22, 0.14)", border: "rgba(249, 115, 22, 0.35)", dot: "#f97316" },
};

export const SC_FB = SC["Comandat"];
export const STATUS_ORDER = {"Comandat":0,"In livrare":1,"Livrat":2};
export const OUT_STATUS_ORDER = {"Pregatit":0,"Expediat":1,"In livrare":2,"Livrat":3,"Retur":4};

export const OUT_DEFAULT_COURIER = "FAN Courier";

export const emptyForm = ({out=false}={}) => ({
  name:"",awb:"",
  courier: out?OUT_DEFAULT_COURIER:"FAN Courier",
  status: out?"Pregatit":"Comandat",
  type: out?"out":"in",
  date:new Date().toISOString().split("T")[0],
  notes:"",shop:"",client_name:"",amount:"",order_number:"",
  products:[{name:"",qty:1}],estimated_delivery:"",
});
