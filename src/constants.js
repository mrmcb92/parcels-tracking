export const COURIERS = [
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

export const STATUSES = ["Comandat","In livrare","Livrat"];

// Statusuri pentru coletele expediate la clienți.
export const OUT_STATUSES = ["Pregatit","Expediat","In livrare","Livrat","Retur"];

const SC_LOW = {color:"rgba(var(--ink),0.55)",bg:"rgba(var(--ink),0.05)",border:"rgba(var(--ink),0.12)"};
const SC_MID = {color:"rgba(var(--ink),0.88)",bg:"rgba(var(--ink),0.10)",border:"rgba(var(--ink),0.22)"};
const SC_SOLID = {color:"var(--accent-fg)",bg:"rgb(var(--accent))",border:"transparent"};

export const SC = {
  "Comandat":   SC_LOW,
  "In livrare": SC_MID,
  "Livrat":     SC_SOLID,
  "In procesare":SC_MID,
  "In tranzit": SC_MID,
  "La livrare": SC_MID,
  "Retur":      SC_LOW,
};

export const SC_OUT = {
  "Pregatit":  SC_LOW,
  "Expediat":  SC_MID,
  "In livrare":SC_MID,
  "Livrat":    SC_SOLID,
  "Retur":     SC_SOLID,
  "In procesare":SC_MID,
  "In tranzit": SC_MID,
  "La livrare": SC_MID,
};

export const SC_FB = SC_LOW;
export const STATUS_ORDER = {"Comandat":0,"In livrare":1,"Livrat":2};
export const OUT_STATUS_ORDER = {"Pregatit":0,"Expediat":1,"In livrare":2,"Livrat":3,"Retur":4};

export const OUT_DEFAULT_COURIER = "FAN Courier";

export const emptyForm = ({out=false}={}) => ({
  name:"",awb:"",
  courier: out?OUT_DEFAULT_COURIER:"FAN Courier",
  status: out?"Pregatit":"Comandat",
  date:new Date().toISOString().split("T")[0],
  notes:"",shop:"",client_name:"",amount:"",order_number:"",
  products:[{name:"",qty:1}],estimated_delivery:"",
});
