export const STYLES = `
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
  .app-head{display:flex;align-items:center;gap:8px;margin-bottom:0.6rem}
  .app-controls{display:flex;align-items:center;gap:6px;flex-shrink:0}
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
    .app-head{flex-wrap:wrap}
    .app-controls{width:100%;justify-content:flex-end;margin-top:2px}
  }
`;
