export const STYLES = `
  *{box-sizing:border-box;margin:0;padding:0}
  :root,[data-theme="dark"]{
    --ink:255,255,255;
    --accent:255,255,255;
    --accent-fg:#000000;
    --bg:#000000;
    --bg-solid:#000000;
    --glass-bg:#111111;
    --glass-bg-strong:#111111;
    --glass-bg-hover:#1a1a1a;
    --glass-border:rgba(255,255,255,0.10);
    --glass-border-strong:rgba(255,255,255,0.16);
    --pkg-bg:#111111;
    --pkg-border:rgba(255,255,255,0.08);
    --input-bg:#0a0a0a;
    --input-border:rgba(255,255,255,0.14);
    --btn-bg:#111111;
    --btn-border:rgba(255,255,255,0.10);
    --menu-bg:#111111;
    --option-bg:#111111;
    --scrim:rgba(0,0,0,0.65);
    --shadow:rgba(0,0,0,0.25);
    --shadow-strong:rgba(0,0,0,0.40);
    --card-shadow:none;
    --card-shadow-strong:0 8px 28px rgba(0,0,0,0.35);
  }
  [data-theme="light"]{
    --ink:0,0,0;
    --accent:0,0,0;
    --accent-fg:#ffffff;
    --bg:#ffffff;
    --bg-solid:#ffffff;
    --glass-bg:#ffffff;
    --glass-bg-strong:#ffffff;
    --glass-bg-hover:#f0f0f0;
    --glass-border:rgba(0,0,0,0.08);
    --glass-border-strong:rgba(0,0,0,0.14);
    --pkg-bg:#ffffff;
    --pkg-border:rgba(0,0,0,0.08);
    --input-bg:#ffffff;
    --input-border:rgba(0,0,0,0.14);
    --btn-bg:#ffffff;
    --btn-border:rgba(0,0,0,0.10);
    --menu-bg:#ffffff;
    --option-bg:#ffffff;
    --scrim:rgba(0,0,0,0.22);
    --shadow:rgba(0,0,0,0.04);
    --shadow-strong:rgba(0,0,0,0.08);
    --card-shadow:none;
    --card-shadow-strong:0 4px 18px rgba(0,0,0,0.06);
  }
  body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;background:var(--bg-solid);-webkit-font-smoothing:antialiased;scroll-behavior:smooth;overflow-x:hidden;transition:background .3s ease}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin 1s linear infinite}
  .gc{background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:12px;box-shadow:var(--card-shadow)}
  .gc-strong{background:var(--glass-bg-strong);border:1px solid var(--glass-border-strong);border-radius:12px;box-shadow:var(--card-shadow-strong)}
  .pkg{background:var(--pkg-bg);border:1px solid var(--pkg-border);border-radius:10px;box-shadow:var(--card-shadow);padding:1rem 1.25rem;transition:border-color .2s,transform .2s,box-shadow .2s,background .3s;overflow:hidden}
  .pkg:hover{border-color:var(--glass-border-strong);transform:translateY(-1px);box-shadow:var(--card-shadow-strong)}
  .gi{background:var(--input-bg);border:1px solid var(--input-border);border-radius:6px;color:rgb(var(--ink));font-size:14px;padding:10px 14px;outline:none;font-family:inherit;transition:border-color .2s,box-shadow .2s,background .3s;width:100%}
  .gi::placeholder{color:rgba(var(--ink),0.35)}
  .gi:focus{border-color:rgba(var(--ink),0.45);box-shadow:0 0 0 2px rgba(var(--ink),0.06)}
  .gi option{background:var(--option-bg);color:rgb(var(--ink))}
  .gb{background:var(--btn-bg);border:1px solid var(--btn-border);border-radius:6px;color:rgba(var(--ink),0.82);cursor:pointer;font-size:14px;font-family:inherit;padding:8px 16px;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
  .gb:hover{background:var(--glass-bg-hover);color:rgb(var(--ink))}
  .gb:active{transform:scale(0.98)}
  .gb:disabled{opacity:0.4;cursor:not-allowed;transform:none}
  .gbp{background:rgb(var(--accent));border-color:transparent;color:var(--accent-fg);font-weight:600}
  .gbp:hover{background:rgba(var(--accent),0.88);border-color:transparent}
  .ib{background:var(--btn-bg);border:1px solid var(--btn-border);border-radius:6px;color:rgba(var(--ink),0.55);cursor:pointer;padding:6px 8px;display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:all .18s;font-family:inherit;font-size:13px}
  .ib:hover{background:var(--glass-bg-hover);color:rgb(var(--ink))}
  .ib:active{transform:scale(0.97)}
  .ib:disabled{opacity:0.3;cursor:not-allowed;transform:none}
  .ibx:hover{background:rgb(var(--accent));border-color:rgb(var(--accent));color:var(--accent-fg)}
  .fp{font-size:13px;padding:6px 15px;border-radius:999px;cursor:pointer;border:1px solid var(--glass-border-strong);background:var(--glass-bg);color:rgba(var(--ink),0.7);transition:all .18s;font-family:inherit;white-space:nowrap;flex-shrink:0}
  .fp:hover{background:var(--glass-bg-hover);color:rgb(var(--ink));border-color:rgba(var(--ink),0.25)}
  .fp.act{background:rgb(var(--accent));border-color:transparent;color:var(--accent-fg);font-weight:600}
  .sp{font-size:12px;padding:3px 10px;border-radius:999px;font-weight:500;cursor:pointer;border:1px solid transparent;transition:all .15s;font-family:inherit;letter-spacing:0.01em}
  .sp:hover{opacity:0.8}
  .sp:active{transform:scale(0.95)}
  .em{position:absolute;top:calc(100% + 8px);right:0;background:var(--menu-bg);border:1px solid var(--glass-border);border-radius:10px;padding:6px;min-width:165px;z-index:200;box-shadow:var(--card-shadow-strong)}
  .ei{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:6px;cursor:pointer;color:rgba(var(--ink),0.78);font-size:14px;transition:background .15s;font-family:inherit;background:none;border:none;width:100%;text-align:left}
  .ei:hover{background:var(--glass-bg-hover);color:rgb(var(--ink))}
  .overlay{position:fixed;inset:0;background:var(--scrim);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem}
  .lang-btn{background:var(--btn-bg);border:1px solid var(--btn-border);border-radius:6px;color:rgba(var(--ink),0.55);cursor:pointer;padding:5px 4px;display:inline-flex;align-items:center;gap:2px;font-family:inherit;font-size:12px;font-weight:500;transition:all .15s;min-width:52px;justify-content:center}
  .lang-btn:hover{background:var(--glass-bg-hover);color:rgb(var(--ink))}
  .lang-seg{padding:3px 7px;border-radius:4px;transition:all .15s;line-height:1;display:inline-flex;align-items:center}
  .lang-seg.active{background:rgba(var(--ink),0.14);color:rgb(var(--ink))}
  .gnav{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;margin-bottom:1rem;scrollbar-width:none}
  .gnav::-webkit-scrollbar{display:none}
  a{color:inherit;text-decoration:none}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-thumb{background:rgba(var(--ink),0.18);border-radius:2px}
  :focus-visible{outline:2px solid rgba(var(--ink),0.5);outline-offset:2px;border-radius:4px}
  .pkg-name{font-weight:600;font-size:15px;color:rgb(var(--ink));letter-spacing:-0.01em;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
  .pkg-content{flex:1;min-width:0;overflow:hidden}
  .app-head{display:flex;align-items:center;gap:8px;margin-bottom:0.6rem}
  .app-controls{display:flex;align-items:center;gap:6px;flex-shrink:0}
  .pkg-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  .pkg-actions{display:flex;gap:4px;flex-shrink:0;align-items:flex-start}
  .pkg-meta{display:flex;gap:6px 14px;flex-wrap:wrap;align-items:center}
  .ptag{display:block;font-size:12px;color:rgba(var(--ink),0.5);background:rgba(var(--ink),0.05);padding:3px 9px;border-radius:6px;border:1px solid rgba(var(--ink),0.1);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  @media (max-width:520px){
    .pkg{padding:0.875rem 1rem}
    .pkg-top{flex-direction:column;gap:10px}
    .pkg-actions{width:100%;justify-content:flex-end}
    .pkg-name{-webkit-line-clamp:3}
    .pkg-content{max-width:calc(100vw - 4.5rem)}
    .app-head{flex-wrap:wrap}
    .app-controls{width:100%;justify-content:flex-end;margin-top:2px}
  }
`;
