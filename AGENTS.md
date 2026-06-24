# Repository Guidelines

## Project Structure & Module Organization

This repository is a Vue 3 + Vite renderer for an industrial SPC app hosted by a C# backend through WebView2. Frontend code lives in `src/`, with reusable UI in `src/components`, Pinia stores in `src/store`, routes in `src/router`, shared utilities in `src/utils`, i18n setup in `src/i18n`, and screens under `src/views`. Static runtime files and locale JSON are served from `public/`; bundled images/audio are in `src/assets`. Vite builds the WebView2 payload to `output/dist`. Shared backend-facing TypeScript declarations live in `types/`, especially `types/me.d.ts`. The `electron/` folder and related scripts are legacy compatibility code, not the primary runtime.

## Build, Test, and Development Commands

- `pnpm dev` or `npm run dev`: start the Vite dev server on port `3920`.
- `npm run start_fake`: legacy Electron-style launcher; use only when maintaining the old wrapper path.
- `pnpm build:vuePure` or `npm run build:vuePure`: type-check Vue code and build the renderer to `output/dist`.
- `pnpm build:vue` or `npm run build:vue`: build the renderer and copy selected output into the configured C# host resource directory.
- `pnpm build:tsc` or `npm run build:tsc`: compile legacy `electron/` code using `tsconfig.e.json`.
- `pnpm preview` or `npm run preview`: legacy Electron preview path.

## Coding Style & Naming Conventions

Use TypeScript for new modules and Vue Composition API patterns. Most feature views are TSX `defineComponent` files; keep that style unless editing an existing `.vue` shell component. Use `@/` for `src/*` imports and `~/` for `types/*`. Prefer Naive UI for new UI, with Tailwind utility classes where existing screens already use them. Keep C# host calls centralized through `src/utils/callm.ts` and use names from `callFnName` in `src/utils/enum.ts`; new code should target `window.chrome.webview.hostObjects.JsBridge`, not Electron IPC.

## Testing Guidelines

No automated test script or test framework is currently configured in `package.json`. Before submitting changes, run at least `pnpm build:vuePure` for renderer/type validation. For backend bridge changes, verify behavior in the C# WebView2 host path that exercises the changed `callBrige` flow. Run `pnpm build:tsc` only when intentionally touching legacy `electron/` code.

## Commit & Pull Request Guidelines

Recent history uses short messages such as `fix`; keep commits concise but more descriptive when possible, for example `fix realtime chart refresh`. Pull requests should summarize the user-visible change, list validation commands run, note any C# host/WebView2 requirements, and include screenshots for UI changes.

## Agent-Specific Instructions

Do not overwrite generated output or existing local edits unless explicitly requested. Avoid committing secrets, machine-local paths, or copied host data. Keep changes scoped to the relevant module and preserve the WebView2 renderer/backend bridge boundary.
