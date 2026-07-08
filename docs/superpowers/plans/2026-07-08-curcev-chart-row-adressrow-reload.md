# CurcevChartRow adressRow Reload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `CurcevChartRow` fully reset and reload its chart state when `props.adressRow?.GId` changes.

**Architecture:** Keep the change localized to `src/views/Home/curcev/CurcevChartRow.tsx`. Watch the stable address-row identity (`GId`), invalidate the old polling generation, dispose the old ECharts instance, increment a local render key, and re-run the existing chart initialization flow after Vue updates the DOM.

**Tech Stack:** Vue 3 Composition API with TSX, ECharts, Pinia stores already used by the component.

## Global Constraints

- Do not run lint checks for this project.
- Do not run build checks for this project.
- The app is hosted by a C# project through WebView2.
- Project runtime testing guidance is in `./docs/webview2-testing.md`.
- Do not change parent components unless the internal component-only approach fails.

---

## File Structure

- Modify `src/views/Home/curcev/CurcevChartRow.tsx`
  - Add lifecycle import `onBeforeUnmount`.
  - Add local reload state and polling generation guard in `setup()`.
  - Add helper functions to dispose chart and initialize/reload after DOM update.
  - Watch `props.adressRow?.GId` and force a reload when it changes.
  - Add `key={reloadKey.value}` to the rendered root element so Vue recreates the component subtree.

---

### Task 1: Add component reload behavior for adressRow changes

**Files:**
- Modify: `src/views/Home/curcev/CurcevChartRow.tsx`

**Interfaces:**
- Consumes: `props.adressRow?.GId`, existing `initEchart()`, existing `loopGet()`, existing `innerData.isGetting`.
- Produces: local `reloadKey: Ref<number>`, `reloadChart(): void`, `disposeChart(): void`, and updated `loopGet()` guard behavior.

- [ ] **Step 1: Update Vue lifecycle imports**

Change the import at the top of `src/views/Home/curcev/CurcevChartRow.tsx` from:

```ts
import { defineComponent, reactive, ref, computed, onMounted, watch, PropType, nextTick } from "vue";
```

to:

```ts
import { defineComponent, reactive, ref, computed, onMounted, onBeforeUnmount, watch, PropType, nextTick } from "vue";
```

- [ ] **Step 2: Add reload and polling generation state**

Inside `setup(props, ctx)`, immediately after the existing line:

```ts
let myChart: echarts.ECharts
```

add:

```ts
    const reloadKey = ref(0)
    let loopVersion = 0
```

- [ ] **Step 3: Add chart disposal helper**

After `getWidthPixel()` and before `loopGet()`, add this helper:

```ts
    const disposeChart = () => {
      loopVersion++
      if (myChart && !myChart.isDisposed()) {
        myChart.dispose()
      }
      myChart = undefined as any
    }
```

- [ ] **Step 4: Guard polling against stale reloads**

At the start of `loopGet()`, before the current guard, add a local version capture:

```ts
      const curLoopVersion = loopVersion
```

Then change the existing guard from:

```ts
      if (!myChart || !innerData.isGetting || !props.adressRow || thisReMountedCount != innerData.reMountedCount) return
```

to:

```ts
      if (!myChart || !innerData.isGetting || !props.adressRow || curLoopVersion != loopVersion || thisReMountedCount != innerData.reMountedCount) return
```

Then change the final `.then(() => { loopGet() })` block from:

```ts
      }).then(() => {
        loopGet()
      }).catch((err: any) => {
```

to:

```ts
      }).then(() => {
        if (curLoopVersion == loopVersion) {
          loopGet()
        }
      }).catch((err: any) => {
```

- [ ] **Step 5: Add reload helper**

After `loopGet()` and before `getChartIns()`, add:

```ts
    const reloadChart = () => {
      disposeChart()
      resetSysValue()
      alldata.isAuto = true
      alldata.isZoom = false
      reloadKey.value++
      nextTick(() => {
        initEchart()
        getWidthPixel()
        if (innerData.isGetting) {
          loopGet()
        }
      })
    }
```

This intentionally reuses the existing initialization path instead of duplicating chart setup logic.

- [ ] **Step 6: Watch adressRow identity**

After the existing `watch(() => innerData.isGetting, ...)` block and before the `watch(() => innerData.curDataZoomInfo, ...)` block, add:

```ts
    watch(() => props.adressRow?.GId, (val, oldVal) => {
      if (val && oldVal && val != oldVal) {
        reloadChart()
      }
    })
```

This avoids reloading on the initial mount and only reloads when Vue observes a real `GId` change.

- [ ] **Step 7: Dispose chart on unmount**

Before the existing `onMounted(() => { ... })` block, add:

```ts
    onBeforeUnmount(() => {
      disposeChart()
    })
```

- [ ] **Step 8: Force subtree recreation with key**

In the returned JSX, change the root `<div>` from:

```tsx
        <div class={'h-full shrink mt-2 overflow-visible relative my-index-chart'} style={{ ...(props.height ? { height: props.height } : {}) }} >
```

to:

```tsx
        <div key={reloadKey.value} class={'h-full shrink mt-2 overflow-visible relative my-index-chart'} style={{ ...(props.height ? { height: props.height } : {}) }} >
```

- [ ] **Step 9: Run a focused TypeScript syntax check by inspection only**

Because project instructions say not to run lint or build checks, verify the edited file manually for these exact conditions:

```text
- `onBeforeUnmount` is imported from `vue`.
- `reloadKey` is declared before the JSX return uses it.
- `disposeChart()` cannot call `dispose()` on an already-disposed chart.
- `loopGet()` captures `curLoopVersion` and only schedules the next loop for the active version.
- `watch(() => props.adressRow?.GId, ...)` does not trigger on initial mount.
- The root JSX node has `key={reloadKey.value}`.
```

- [ ] **Step 10: Commit if requested by the user**

Only commit if the user explicitly asks for a commit. If committing, run:

```bash
git add src/views/Home/curcev/CurcevChartRow.tsx docs/superpowers/plans/2026-07-08-curcev-chart-row-adressrow-reload.md
git commit -m "fix: reload chart row when address row changes"
```

---

## Self-Review

- Spec coverage: The plan covers watching `adressRow?.GId`, cleaning old ECharts state, invalidating old polling, forcing subtree recreation with `key`, and rerunning the existing initialization flow.
- Placeholder scan: No TBD/TODO/fill-in-later placeholders remain.
- Type consistency: The plan uses existing Vue/ECharts/Pinia patterns and introduces only local helpers inside the component.