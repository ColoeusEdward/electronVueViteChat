# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (starts Vite )
pnpm dev

# Build Vue frontend only (also copies output to NTSPC_M project)
pnpm build:vue

# Build frontend without copying
pnpm build:vuePure

# Full production build (vue + electron tsc + electron-builder)
pnpm builda

# Preview production build in Electron
pnpm preview

# Type-check Vue source without emitting
npx vue-tsc --noEmit

# Compile Electron main process TypeScript only
pnpm build:tsc
```

The dev workflow (`npm start`) kills port 3920, starts Vite on that port, then compiles the Electron main process via `tsconfig.e.json` and launches Electron. Hot-reload works for the renderer; Electron main process requires saving files in `electron/` to trigger recompile.

## Architecture

- 本项目已经不是electron项目,是运行在某个C#项目的 WebView2中

This is an **industrial SPC (Statistical Process Control) monitoring app** for cable/wire manufacturing. It runs in two deployment modes:

- **Standalone Electron app**: uses `window.ipc` (contextBridge) for renderer↔main IPC
- **Embedded WebView2/CEF**: served as a single HTML file inside a C# .NET host; the C# host exposes `window.chrome.webview.hostObjects.JsBridge`

### Two TypeScript compilation targets

| Config            | Input       | Output                     | Module format |
| ----------------- | ----------- | -------------------------- | ------------- |
| `tsconfig.json`   | `src/`      | (no emit, type-check only) | ESNext        |
| `tsconfig.e.json` | `electron/` | `output/build/`            | CommonJS      |

Vite builds the Vue renderer to `output/dist/`. The `viteSingleFile` plugin bundles everything into one `index.html`.

### Backend bridge

All backend calls go through `src/utils/callm.ts` → `callBrige(fnName, data?)`.

`callBrige` checks for `window.chrome.webview` (WebView2) and calls `window.chrome.webview.hostObjects.JsBridge[fnName]()`. The response is always a JSON string matching `ActualResult` (`{ IsSuccess, Code, Message, Data }`). `resultProcess` in `src/utils/call.ts` extracts `Data` or shows an error.

The full list of backend function names is in `src/utils/enum.ts` as the `callFnName` enum. Use only these names when calling `callBrige`.

There is a legacy `callSpc` path (via `window.CefSharp`) that is mostly commented out — don't use it for new code.

### Store layout (`src/store/`)

| File                                | Purpose                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `index.ts` (`useMain`)              | Global UI state: data source selection, display options, eccentric angle, IndexedDB handle, global keyboard |
| `config.ts` (`useConfigStore`)      | Config panel visibility, sys config, formula/device group lists, panel init callbacks                       |
| `realtime.ts` (`useRealTimeStore`)  | Real-time measurement data fetch loop                                                                       |
| `formula.ts` (`useFormulaStore`)    | Formula config CRUD state                                                                                   |
| `trendStore.ts`                     | Trend chart state                                                                                           |
| `statistical.ts`                    | Statistical chart state                                                                                     |
| `tool.ts` (`useToolStore`)          | Root path, misc tools                                                                                       |
| `i18n.ts` (`usei18nStore`)          | Language selection                                                                                          |
| `ecc.ts`, `line.ts`, `lineShape.ts` | Domain-specific view states                                                                                 |

### View layout (`src/views/Home/`)

The single route `/` renders `Home` (`index.tsx`), which is a tab-switched layout:

- **Curcev** (`curcev/`) – real-time data curves
- **MultiCurcev** (`multiCurcev/`) – multi-channel trend charts
- **Statistical** (`statistical/`) – statistics/CPK charts
- **Config** (`config/Config`) – full-screen config overlay (toggled by `configStore.isShowConfig`)
- **ProductHistory** – product history overlay
- **FormulaConfigNew** – formula (recipe) config overlay

Landscape vs portrait layout is detected via `listenLandscape` and stored in `mainStore.isLandscape`. Low-resolution mode is stored in `mainStore.isLowRes`.

### Component style

Components are written as **TSX `defineComponent`** (`*.tsx`) rather than Vue SFCs for most views. SFCs (`.vue`) are used for top-level shell components (`App.vue`, `navSider.vue`, `mainHeader.vue`). Both patterns use the Composition API.

The UI library is **Naive UI** (`naive-ui`). Some legacy Element Plus components exist but Naive UI is the standard going forward.

Tailwind CSS utility classes are used extensively inline. Theme customization is in `src/utils/theme.ts`.

### i18n

Languages: `zh-CN` (default), `en-US`, `vi-VN`, `es-ES`. Translation files are loaded dynamically from `public/locales/<locale>.json` at runtime. Use `const { t } = useI18n()` and call `t('key.path')`.

### Type declarations

Global types shared between frontend and the C# backend data model live in `types/me.d.ts` (aliased as `~/me`). The `~/*` path alias maps to `types/*`. `@/*` maps to `src/*`.

### IndexedDB

The DB is initialized in `useMain.initDb()` (version 8). Stores: `dataMap`, `realTimeData`, `watchData`, `alarmData`, `OPCUA`, `connectDev`, `datav`. Use `src/utils/useDb.ts` helpers rather than accessing `mainStore.db` directly.

### Global keyboard

A virtual keyboard overlay (`GlobalKeyBoard2`) sits at the Home root level. `listenAllInputFocus` in `src/utils/utils.ts` tracks `lastFocusedInput` in the main store. `noKeyBoardInputClass` (from `src/views/Home/config/sysConfig/enum.ts`) marks inputs that should NOT trigger the keyboard.
