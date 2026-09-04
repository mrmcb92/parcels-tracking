export const STYLES = `
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --sat: env(safe-area-inset-top, 0px);
    --sab: env(safe-area-inset-bottom, 0px);
    --sal: env(safe-area-inset-left, 0px);
    --sar: env(safe-area-inset-right, 0px);
  }

  :root, [data-theme="light"] {
    --ink: 15, 23, 42;
    --ink-muted: 100, 116, 139;
    --accent: 15, 23, 42;
    --accent-fg: #ffffff;
    --accent-brand: 99, 102, 241;
    --bg: #f6f8fb;
    --bg-mesh: radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%),
               radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.05) 0px, transparent 50%),
               #f6f8fb;
    --card-bg: #ffffff;
    --card-bg-subtle: #f8fafc;
    --card-border: rgba(15, 23, 42, 0.07);
    --card-border-strong: rgba(15, 23, 42, 0.13);
    --card-top-light: rgba(255, 255, 255, 0.95);
    --input-bg: #ffffff;
    --input-border: rgba(15, 23, 42, 0.12);
    --input-well: #f1f5f9;
    --btn-bg: #ffffff;
    --btn-border: rgba(15, 23, 42, 0.10);
    --btn-primary-bg: #0f172a;
    --btn-primary-fg: #ffffff;
    --menu-bg: #ffffff;
    --option-bg: #ffffff;
    --scrim: rgba(15, 23, 42, 0.45);
    
    /* 3D Shadows - Light */
    --shadow-3d-card: 0 1px 2px rgba(15, 23, 42, 0.04),
                      0 8px 20px -4px rgba(15, 23, 42, 0.06),
                      0 18px 30px -10px rgba(15, 23, 42, 0.04),
                      inset 0 1px 0 var(--card-top-light);
    --shadow-3d-card-hover: 0 3px 6px -1px rgba(15, 23, 42, 0.06),
                            0 14px 32px -4px rgba(15, 23, 42, 0.10),
                            0 26px 44px -10px rgba(15, 23, 42, 0.07),
                            inset 0 1px 0 var(--card-top-light);
    --shadow-3d-btn: 0 2px 0 rgba(15, 23, 42, 0.08),
                     0 4px 10px rgba(15, 23, 42, 0.04),
                     inset 0 1px 0 rgba(255, 255, 255, 0.9);
    --shadow-3d-btn-active: 0 1px 0 rgba(15, 23, 42, 0.08),
                            0 2px 4px rgba(15, 23, 42, 0.04);
    --shadow-3d-primary: 0 3px 0 #020617,
                         0 8px 18px -2px rgba(15, 23, 42, 0.28);
    --shadow-3d-primary-active: 0 1px 0 #020617,
                                0 3px 8px rgba(15, 23, 42, 0.2);
    --shadow-3d-modal: 0 25px 65px -12px rgba(15, 23, 42, 0.25),
                       0 8px 20px -4px rgba(15, 23, 42, 0.10),
                       inset 0 1px 0 rgba(255, 255, 255, 0.9);
    --shadow-inset-well: inset 0 2px 4px rgba(15, 23, 42, 0.04),
                         0 1px 0 rgba(255, 255, 255, 0.8);
    --shadow-badge-3d: 0 2px 4px rgba(15, 23, 42, 0.05),
                       inset 0 1px 0 rgba(255, 255, 255, 0.5);
    --dock-bg: rgba(255, 255, 255, 0.88);
    --dock-border: rgba(15, 23, 42, 0.10);
    --dock-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.16),
                   0 6px 14px -2px rgba(15, 23, 42, 0.08),
                   inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }

  [data-theme="dark"] {
    --ink: 248, 250, 252;
    --ink-muted: 148, 163, 184;
    --accent: 248, 250, 252;
    --accent-fg: #090b10;
    --accent-brand: 129, 140, 248;
    --bg: #090b10;
    --bg-mesh: radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
               radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.08) 0px, transparent 50%),
               #090b10;
    --card-bg: #121520;
    --card-bg-subtle: #161926;
    --card-border: rgba(255, 255, 255, 0.08);
    --card-border-strong: rgba(255, 255, 255, 0.15);
    --card-top-light: rgba(255, 255, 255, 0.12);
    --input-bg: #0d0f17;
    --input-border: rgba(255, 255, 255, 0.11);
    --input-well: #0b0d14;
    --btn-bg: #171a28;
    --btn-border: rgba(255, 255, 255, 0.09);
    --btn-primary-bg: #f8fafc;
    --btn-primary-fg: #090b10;
    --menu-bg: #141724;
    --option-bg: #141724;
    --scrim: rgba(0, 0, 0, 0.75);

    /* 3D Shadows - Dark */
    --shadow-3d-card: 0 2px 4px rgba(0, 0, 0, 0.35),
                      0 10px 24px -4px rgba(0, 0, 0, 0.50),
                      0 22px 44px -10px rgba(0, 0, 0, 0.60),
                      inset 0 1px 0 var(--card-top-light);
    --shadow-3d-card-hover: 0 4px 8px rgba(0, 0, 0, 0.45),
                            0 16px 36px -4px rgba(0, 0, 0, 0.65),
                            0 30px 56px -10px rgba(0, 0, 0, 0.75),
                            inset 0 1px 0 var(--card-top-light);
    --shadow-3d-btn: 0 2px 0 rgba(0, 0, 0, 0.6),
                     0 4px 10px rgba(0, 0, 0, 0.35),
                     inset 0 1px 0 rgba(255, 255, 255, 0.09);
    --shadow-3d-btn-active: 0 1px 0 rgba(0, 0, 0, 0.4),
                            0 2px 4px rgba(0, 0, 0, 0.2);
    --shadow-3d-primary: 0 3px 0 #cbd5e1,
                         0 8px 22px -2px rgba(255, 255, 255, 0.22);
    --shadow-3d-primary-active: 0 1px 0 #cbd5e1,
                                0 3px 8px rgba(255, 255, 255, 0.15);
    --shadow-3d-modal: 0 28px 72px -12px rgba(0, 0, 0, 0.85),
                       0 8px 24px -4px rgba(0, 0, 0, 0.65),
                       inset 0 1px 0 rgba(255, 255, 255, 0.15);
    --shadow-inset-well: inset 0 2px 5px rgba(0, 0, 0, 0.55),
                         0 1px 0 rgba(255, 255, 255, 0.03);
    --shadow-badge-3d: 0 2px 5px rgba(0, 0, 0, 0.4),
                       inset 0 1px 0 rgba(255, 255, 255, 0.18);
    --dock-bg: rgba(18, 21, 32, 0.88);
    --dock-border: rgba(255, 255, 255, 0.10);
    --dock-shadow: 0 20px 45px -5px rgba(0, 0, 0, 0.8),
                   0 6px 16px -2px rgba(0, 0, 0, 0.6),
                   inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  html {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    overscroll-behavior: none;
    overscroll-behavior-y: none;
    overscroll-behavior-x: none;
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-mesh);
    color: rgb(var(--ink));
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    min-height: 100%;
    min-height: 100dvh;
    overscroll-behavior: none;
    overscroll-behavior-y: none;
    overscroll-behavior-x: none;
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
    transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  #root {
    width: 100%;
    min-height: 100%;
    min-height: 100dvh;
    overflow-x: hidden;
    position: relative;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 0.9s linear infinite;
  }

  @keyframes modalPop {
    from {
      opacity: 0;
      transform: scale(0.96) translateY(12px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-4px) rotate(1deg); }
  }

  /* 3D Glass Container */
  .gc {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    box-shadow: var(--shadow-3d-card);
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.25s ease;
  }

  .gc-strong {
    background: var(--card-bg);
    border: 1px solid var(--card-border-strong);
    border-radius: 20px;
    box-shadow: var(--shadow-3d-modal);
    animation: modalPop 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* 3D Package Card */
  .pkg {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 16px;
    box-shadow: var(--shadow-3d-card);
    padding: 1.25rem 1.35rem;
    position: relative;
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.2s ease;
    overflow: hidden;
  }
  .pkg:hover {
    border-color: var(--card-border-strong);
    transform: translateY(-2px);
    box-shadow: var(--shadow-3d-card-hover);
  }

  /* 3D Inputs */
  .gi {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 10px;
    color: rgb(var(--ink));
    font-size: 15px;
    padding: 11px 14px;
    outline: none;
    font-family: inherit;
    box-shadow: var(--shadow-inset-well);
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    width: 100%;
  }
  .gi::placeholder {
    color: rgba(var(--ink), 0.38);
  }
  .gi:focus {
    border-color: rgba(var(--accent-brand), 0.7);
    box-shadow: 0 0 0 3px rgba(var(--accent-brand), 0.16), var(--shadow-inset-well);
  }
  .gi option {
    background: var(--option-bg);
    color: rgb(var(--ink));
  }

  /* 3D General Button */
  .gb {
    background: var(--btn-bg);
    border: 1px solid var(--btn-border);
    border-radius: 10px;
    color: rgb(var(--ink));
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    font-family: inherit;
    padding: 10px 18px;
    box-shadow: var(--shadow-3d-btn);
    transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.16s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.15s ease,
                border-color 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .gb:hover {
    transform: translateY(-1.5px);
    box-shadow: 0 4px 0 rgba(0,0,0,0.06), 0 8px 16px -2px rgba(0,0,0,0.08);
  }
  .gb:active {
    transform: translateY(1.5px);
    box-shadow: var(--shadow-3d-btn-active);
  }
  .gb:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* 3D Primary Button */
  .gbp {
    background: var(--btn-primary-bg);
    border-color: transparent;
    color: var(--btn-primary-fg);
    font-weight: 600;
    box-shadow: var(--shadow-3d-primary);
  }
  .gbp:hover {
    background: var(--btn-primary-bg);
    opacity: 0.94;
    transform: translateY(-2px);
    box-shadow: 0 5px 0 rgba(0,0,0,0.25), 0 12px 24px -3px rgba(0,0,0,0.22);
  }
  .gbp:active {
    transform: translateY(2px);
    box-shadow: var(--shadow-3d-primary-active);
  }

  /* 3D Icon Button */
  .ib {
    background: var(--btn-bg);
    border: 1px solid var(--btn-border);
    border-radius: 10px;
    color: rgba(var(--ink), 0.72);
    cursor: pointer;
    padding: 8px 10px;
    box-shadow: var(--shadow-3d-btn);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.16s cubic-bezier(0.16, 1, 0.3, 1),
                background-color 0.15s,
                color 0.15s;
    font-family: inherit;
    font-size: 13px;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .ib:hover {
    transform: translateY(-1.5px);
    color: rgb(var(--ink));
    box-shadow: 0 3px 0 rgba(0,0,0,0.06), 0 6px 14px rgba(0,0,0,0.06);
  }
  .ib:active {
    transform: translateY(1.5px);
    box-shadow: var(--shadow-3d-btn-active);
  }
  .ib:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
  }
  .ibx:hover {
    background: #ef4444;
    border-color: #ef4444;
    color: #ffffff;
  }

  /* 3D Filter Pills */
  .fp {
    font-size: 13px;
    font-weight: 500;
    padding: 7px 16px;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid var(--card-border-strong);
    background: var(--card-bg);
    color: rgba(var(--ink), 0.7);
    box-shadow: var(--shadow-3d-btn);
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: inherit;
    white-space: nowrap;
    flex-shrink: 0;
    user-select: none;
  }
  .fp:hover {
    color: rgb(var(--ink));
    border-color: rgba(var(--ink), 0.3);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.08);
  }
  .fp.act {
    background: var(--btn-primary-bg);
    border-color: transparent;
    color: var(--btn-primary-fg);
    font-weight: 600;
    box-shadow: var(--shadow-3d-primary);
    transform: translateY(-1px);
  }

  /* 3D Status Pill */
  .sp {
    font-size: 11.5px;
    padding: 4px 10px;
    border-radius: 999px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    box-shadow: var(--shadow-badge-3d);
    transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1),
                box-shadow 0.16s ease,
                opacity 0.15s ease;
    font-family: inherit;
    letter-spacing: 0.015em;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    line-height: 1.3;
    user-select: none;
    max-width: 100%;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  .sp:hover {
    transform: translateY(-1px);
    opacity: 0.95;
    box-shadow: 0 4px 10px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3);
  }
  .sp:active {
    transform: translateY(1px);
  }

  /* 3D Pipeline Tracker */
  .pipe-track {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    background: var(--input-well);
    border-radius: 12px;
    box-shadow: var(--shadow-inset-well);
    margin-top: 10px;
    margin-bottom: 4px;
    overflow-x: auto;
  }
  .pipe-step {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    color: rgba(var(--ink), 0.4);
  }
  .pipe-step.active {
    background: var(--card-bg);
    color: rgb(var(--ink));
    border-color: var(--card-border-strong);
    box-shadow: 0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
    transform: scale(1.02);
  }
  .pipe-step.done {
    color: rgba(var(--ink), 0.7);
  }

  /* Dropdown Menu */
  .em {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--menu-bg);
    border: 1px solid var(--card-border-strong);
    border-radius: 14px;
    padding: 8px;
    min-width: 180px;
    z-index: 200;
    box-shadow: var(--shadow-3d-modal);
    animation: modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ei {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 13px;
    border-radius: 8px;
    cursor: pointer;
    color: rgb(var(--ink));
    font-size: 14px;
    font-weight: 500;
    transition: background 0.15s, transform 0.15s;
    font-family: inherit;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
  }
  .ei:hover {
    background: rgba(var(--ink), 0.06);
    transform: translateX(2px);
  }

  /* Overlay */
  .overlay {
    position: fixed;
    inset: 0;
    background: var(--scrim);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    overflow-y: auto;
  }

  /* Language & Theme Controls */
  .lang-btn {
    background: var(--btn-bg);
    border: 1px solid var(--btn-border);
    border-radius: 10px;
    color: rgba(var(--ink), 0.65);
    cursor: pointer;
    padding: 5px 6px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    box-shadow: var(--shadow-3d-btn);
    transition: all 0.15s ease;
    min-width: 54px;
    justify-content: center;
  }
  .lang-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.06);
  }
  .lang-seg {
    padding: 3px 6px;
    border-radius: 6px;
    transition: all 0.15s;
    line-height: 1;
    display: inline-flex;
    align-items: center;
  }
  .lang-seg.active {
    background: var(--btn-primary-bg);
    color: var(--btn-primary-fg);
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  }

  /* Navigation Bar */
  .gnav {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    touch-action: pan-x;
    padding: 4px 2px 10px 2px;
    margin-bottom: 1rem;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .gnav::-webkit-scrollbar {
    display: none;
  }

  /* 3D App Icon Badge */
  .app-icon-3d {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
    box-shadow: 0 4px 0 #312e81, 0 10px 20px -3px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .app-icon-3d:hover {
    transform: translateY(-2px) rotate(2deg);
  }

  /* 3D Isometric Package Box visual */
  .pkg-box-3d {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(var(--ink), 0.08) 0%, rgba(var(--ink), 0.03) 100%);
    border: 1px solid var(--card-border);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Package meta tags */
  .ptag {
    display: inline-block;
    font-size: 12px;
    color: rgba(var(--ink), 0.65);
    background: var(--input-well);
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid var(--card-border);
    box-shadow: var(--shadow-inset-well);
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* AWB Copy Button */
  .awb-copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--input-well);
    border: 1px solid var(--card-border);
    padding: 3px 8px;
    border-radius: 7px;
    color: rgb(var(--ink));
    font-size: 12.5px;
    cursor: pointer;
    box-shadow: var(--shadow-inset-well);
    transition: all 0.15s ease;
    font-family: inherit;
  }
  .awb-copy-btn:hover {
    border-color: rgba(var(--accent-brand), 0.5);
    background: rgba(var(--accent-brand), 0.08);
    transform: translateY(-0.5px);
  }
  .awb-copy-btn:active {
    transform: scale(0.97);
  }

  /* 3D Delivery Pipeline Stepper */
  .pkg-pipeline {
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--card-border);
    position: relative;
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
  }
  .pipeline-node {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: var(--btn-bg);
    border: 1px solid var(--btn-border);
    border-radius: 999px;
    padding: 6px 10px;
    cursor: pointer;
    box-shadow: var(--shadow-3d-btn);
    transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    font-family: inherit;
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }
  .pipeline-node:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0,0,0,0.08);
  }
  .pipeline-node:active {
    transform: translateY(1px);
    box-shadow: none;
  }
  .pipeline-node.is-active {
    background: rgba(var(--accent-brand), 0.12);
    border-color: rgba(var(--accent-brand), 0.45);
    box-shadow: 0 0 0 1px rgba(var(--accent-brand), 0.25), 0 2px 6px rgba(0,0,0,0.06);
  }
  .pipeline-node.is-active.is-retur {
    background: rgba(244, 63, 94, 0.12);
    border-color: rgba(244, 63, 94, 0.45);
  }
  .pipeline-node.is-past {
    opacity: 0.8;
  }
  .pipeline-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(var(--ink), 0.25);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  .pipeline-label {
    font-size: 11.5px;
    font-weight: 600;
    color: rgba(var(--ink), 0.65);
    transition: color 0.16s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }
  .pipeline-node.is-active .pipeline-label {
    color: rgb(var(--ink));
    font-weight: 700;
  }
  .pipeline-node.is-active.is-retur .pipeline-label {
    color: #f43f5e;
  }

  .pkg-name {
    font-weight: 700;
    font-size: 16px;
    color: rgb(var(--ink));
    letter-spacing: -0.015em;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  .pkg-content {
    flex: 1 1 200px;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }
  .app-shell {
    min-height: 100vh;
    min-height: 100dvh;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    overscroll-behavior: none;
    background: var(--bg-mesh);
    position: relative;
    padding-top: max(1.5rem, calc(var(--sat) + 1rem));
    padding-left: max(1.25rem, calc(var(--sal) + 1.25rem));
    padding-right: max(1.25rem, calc(var(--sar) + 1.25rem));
    padding-bottom: max(2rem, calc(var(--sab) + 7.5rem));
    transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .app-shell-centered {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--bg-mesh);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: max(1.5rem, calc(var(--sat) + 1.25rem)) max(1rem, calc(var(--sar) + 1rem)) max(1.5rem, calc(var(--sab) + 1.25rem)) max(1rem, calc(var(--sal) + 1rem));
    transition: background 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .main-container {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    overflow-x: hidden;
  }
  .app-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 0.85rem;
  }
  .app-title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }
  .app-controls {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }
  .pkg-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    flex-wrap: wrap;
  }
  .pkg-actions {
    display: flex;
    gap: 5px;
    flex-shrink: 0;
    align-items: flex-start;
  }
  .pkg-meta {
    display: flex;
    gap: 6px 14px;
    flex-wrap: wrap;
    align-items: center;
  }

  /* PWA Mobile Floating Dock */
  .mobile-dock {
    display: none;
    position: fixed;
    bottom: max(12px, calc(var(--sab) + 10px));
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 24px);
    max-width: 420px;
    background: var(--dock-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--dock-border);
    box-shadow: var(--dock-shadow);
    border-radius: 999px;
    padding: 6px 8px;
    z-index: 240;
    align-items: center;
    justify-content: space-between;
  }
  .mobile-dock-btn {
    flex: 1;
    background: none;
    border: none;
    color: rgba(var(--ink), 0.65);
    font-size: 11px;
    font-weight: 600;
    font-family: inherit;
    padding: 8px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.18s;
  }
  .mobile-dock-btn.active {
    background: rgba(var(--ink), 0.1);
    color: rgb(var(--ink));
  }
  .mobile-dock-add {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
    color: #ffffff;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 0 #312e81, 0 10px 22px -2px rgba(99, 102, 241, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transition: transform 0.16s, box-shadow 0.16s;
    margin: -10px 4px 0 4px;
    flex-shrink: 0;
  }
  .mobile-dock-add:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #312e81, 0 4px 10px rgba(99, 102, 241, 0.3);
  }

  a { color: inherit; text-decoration: none; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(var(--ink), 0.18); border-radius: 4px; }
  :focus-visible { outline: 2px solid rgba(var(--accent-brand), 0.7); outline-offset: 2px; border-radius: 6px; }

  /* Mobile Responsive Overrides */
  @media (max-width: 640px) {
    .app-shell {
      padding-top: max(1.1rem, calc(var(--sat) + 0.75rem));
      padding-left: max(0.85rem, calc(var(--sal) + 0.85rem));
      padding-right: max(0.85rem, calc(var(--sar) + 0.85rem));
      padding-bottom: max(2rem, calc(var(--sab) + 7.5rem));
    }
    .pkg {
      padding: 1rem 1.1rem;
      border-radius: 14px;
    }
    .pkg-top {
      flex-wrap: wrap;
      gap: 10px;
    }
    .pkg-actions {
      width: 100%;
      justify-content: flex-end;
      padding-top: 6px;
      border-top: 1px solid var(--card-border);
    }
    .pkg-name {
      -webkit-line-clamp: 3;
      font-size: 15px;
    }
    .app-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .app-title-wrap {
      gap: 9px;
    }
    .app-icon-3d {
      width: 38px;
      height: 38px;
      border-radius: 12px;
    }
    .app-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .hide-mobile-stats {
      display: none !important;
    }
    .mobile-dock {
      display: flex;
    }
    .overlay {
      padding: 0;
      align-items: flex-end;
    }
    .gc-strong {
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      border-left: none;
      border-right: none;
      border-bottom: none;
      box-shadow: 0 -12px 36px rgba(0,0,0,0.25);
      max-height: calc(100dvh - var(--sat) - 1.5rem);
      padding-bottom: max(1.5rem, calc(var(--sab) + 1.25rem)) !important;
      overflow-y: auto;
    }
    /* Add a subtle drag indicator bar for mobile bottom sheets */
    .sheet-handle {
      display: block;
      width: 42px;
      height: 4px;
      background: rgba(var(--ink), 0.2);
      border-radius: 2px;
      margin: 0 auto 12px auto;
    }
    .gi {
      font-size: 16px; /* Prevents unwanted iOS auto-zoom on input focus */
    }
    .pkg-pipeline {
      gap: 5px;
      margin-top: 10px;
      padding-top: 10px;
    }
    .pipeline-node {
      padding: 5px 8px;
    }
    .pipeline-label {
      font-size: 11px;
    }
  }

  @media (min-width: 641px) {
    .sheet-handle {
      display: none;
    }
  }
`;

