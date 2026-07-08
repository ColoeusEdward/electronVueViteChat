# DevList Row Click Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make both `DevList` tables non-editable in this dialog, let the first table treat any cell click as "select device", and let the second table treat any cell click as a multi-select toggle for that row's last column.

**Architecture:** Keep the business actions where they already live (`DevRowClick` and `adressChoose`) and teach `SimpleTable` one small new behavior: optionally forward a row click to the `btnFn` of a named column. Also decouple `originMode` from edit mode so `DevList` can keep the origin-mode layout while explicitly disabling inline inputs with the existing `defIsEditing` prop.

**Tech Stack:** Vue 3 TSX, reactive component state, Naive UI, existing Python Playwright WebView2 probe for runtime verification.

## Global Constraints

- Do not run lint checks for this project.
- Do not run build checks for this project.
- Real verification must use the C# host + WebView2 workflow from `docs/webview2-testing.md`.
- Do not use Claude Code built-in Playwright MCP tools for verification.
- Keep the first table free of any required visible selected-row behavior; clicking it immediately transitions to the second table.
- Keep the second table multi-select; `item.isChoose` remains the only persisted selection state.
- Do not add a new edit-enable prop; reuse the existing `defIsEditing` prop.
- Keep the scope tight: no unrelated refactors outside `src/components/SimpleTable/index.tsx` and `src/views/Home/config/devConfigNew/dataGroup/DevDataGroup/DevList.tsx`.

---

## File Structure

- Modify: `src/components/SimpleTable/index.tsx`
  - Single responsibility for this change: add optional row-click forwarding, stop duplicate click propagation, and make `defIsEditing` the only source of inline-edit state.
- Modify: `src/views/Home/config/devConfigNew/dataGroup/DevDataGroup/DevList.tsx`
  - Single responsibility for this change: configure the two tables to use the new forwarding behavior and explicitly disable inline editing.
- No change: `types/me.d.ts`
  - After inspection, `SimpleTable` prop typing is defined inline in the component props block, so adding declarations here would create dead types rather than real safety.
- Reference only: `docs/webview2-testing.md`
  - Use its exact WebView2 verification workflow; no documentation edits are needed for this feature.

---

### Task 1: Add row-click forwarding to `SimpleTable`

**Files:**
- Modify: `src/components/SimpleTable/index.tsx`

**Interfaces:**
- Consumes: existing column action signature `btnFn?: (row: any, item: any) => void`
- Produces: new optional prop `rowClickBtnProp?: string`
- Produces: helper `triggerRowClickBtn(item: Record<string, string | number | boolean | object>): void`
- Produces: edit-mode rule `alldata.isEditing === props.defIsEditing`

- [ ] **Step 1: Update the `SimpleTable` props block to match real usage and add the new forwarding prop**

Replace the relevant prop definitions with this shape:

```tsx
addAndEditAndDelFn: {
  type: Object as PropType<[Function, Function, Function]>,
  required: false
},
rowClickFn: {
  type: Function as PropType<(e: any, row: any) => void>,
  required: false
},
rowClickBtnProp: {
  type: String,
  required: false
},
originMode: {
  type: Boolean,
  default: false
},
defIsEditing: {
  type: Boolean,
  default: false
}
```

Why this exact change:
- `rowClickFn` is already guarded with `props.rowClickFn && ...`, so it should not be declared required.
- `addAndEditAndDelFn` is omitted by multiple `originMode={true}` call sites, so marking it optional matches the current render guards.
- `rowClickBtnProp` is the single new feature flag for this work.

- [ ] **Step 2: Decouple edit mode from `originMode` and add the forwarding helpers**

Replace the `alldata` initialization and add these helpers inside `setup()`:

```tsx
const alldata = reactive({
  curRow: null as Record<string, string | number | boolean | object> | null,
  isEditing: props.defIsEditing
})

const getRowClickBtnColumn = () => {
  if (!props.rowClickBtnProp) return null
  return columns.value.find(col => col.prop === props.rowClickBtnProp && col.btnFn) || null
}

const triggerRowClickBtn = (item: Record<string, string | number | boolean | object>) => {
  const btnColumn = getRowClickBtnColumn()
  btnColumn?.btnFn?.(btnColumn, item)
}

const stopRowClick = (e: MouseEvent) => {
  e.stopPropagation()
}
```

Why this exact change:
- Right now `originMode={true}` forces `isEditing` to `true`, which is the opposite of what `DevList` needs.
- The helper keeps the row-click behavior generic and reusable without hard-coding `op` or `isChoose` into `SimpleTable`.

- [ ] **Step 3: Update the row and cell click handlers to forward once and only once**

Change the row container click handler to this form:

```tsx
<div
  style={styles.row}
  class={classNames(' relative overflow-visible', {
    'is-selected': item.GId == alldata.curRow?.GId && !props.originMode
  })}
  onClick={() => {
    alldata.curRow = item
    props.rowClickFn && props.rowClickFn({}, item)
    triggerRowClickBtn(item)
  }}
>
```

Then update the default cell click handler so only the forwarded target column stops bubbling:

```tsx
onClick={(e: MouseEvent) => {
  if (props.rowClickBtnProp && props.rowClickBtnProp === col.prop) {
    stopRowClick(e)
  }
  col.btnFn && col.btnFn(col, item)
}}
```

Also stop bubbling on interactive controls so a click inside a real editor/control never re-triggers the row handler:

```tsx
<input
  onClick={(e: MouseEvent) => {
    stopRowClick(e)
    col.btnFn && col.btnFn(col, item)
  }}
  ...
/>
```

```tsx
<div
  ...
  onClick={(e: MouseEvent) => {
    stopRowClick(e)
    col.btnFn && col.btnFn(col, item)
  }}
>
  {col.mapFn && col.mapFn(col, item)}
</div>
```

```tsx
<NSwitch
  v-model:value={item[col.prop]}
  onClick={stopRowClick}
  onUpdate:value={() => { col.btnFn && col.btnFn(col, item) }}
  ...
/>
```

```tsx
<NSelect
  style={{ height: '100%' }}
  onClick={stopRowClick}
  v-model:value={item[col.prop]}
  size="large"
  onUpdate:value={() => { col.btnFn && col.btnFn(col, item) }}
  options={col.selectOption}
/>
```

This is the core duplicate-trigger prevention: clicking the forwarded last column should execute its `btnFn` exactly once, while clicking any other cell should bubble to the row and execute the forwarded action there.

- [ ] **Step 4: Make `isInput` respect the existing edit switch instead of always rendering an `<input>`**

Replace this branch:

```tsx
if (col.isInput && !item.isNewRow) {
```

with this branch:

```tsx
if (col.isInput && alldata.isEditing && !item.isNewRow) {
```

Do not add a new prop. The whole point is to let `DevList` keep using `defIsEditing={false}`.

- [ ] **Step 5: Review only the `SimpleTable` diff before moving on**

Run:

```powershell
git diff -- src/components/SimpleTable/index.tsx
```

Expected in the diff:
- `rowClickBtnProp` exists
- `rowClickFn` and `addAndEditAndDelFn` are no longer falsely required
- `isEditing` initializes from `props.defIsEditing`
- target-column clicks stop bubbling
- `isInput` is gated by `alldata.isEditing`

- [ ] **Step 6: Commit the isolated table-component change**

Run:

```bash
git add src/components/SimpleTable/index.tsx
git commit -m "feat: add SimpleTable row click forwarding"
```

Expected: one commit containing only the component-level behavior change.

---

### Task 2: Wire both `DevList` tables to the new behavior

**Files:**
- Modify: `src/views/Home/config/devConfigNew/dataGroup/DevDataGroup/DevList.tsx`

**Interfaces:**
- Consumes: `rowClickBtnProp?: string` from `SimpleTable`
- Consumes: existing handlers `DevRowClick(row: simpleTableColumn, item: DeviceGroupEntity): void` and `adressChoose(row: simpleTableColumn, item: DataAddressEntity): void`
- Produces: first-table integration `rowClickBtnProp="op"`
- Produces: second-table integration `rowClickBtnProp="isChoose"`

- [ ] **Step 1: Pass explicit non-editing state to the device table and forward row clicks to the `op` column**

Replace the first `SimpleTable` call with this shape:

```tsx
<SimpleTable
  isSmallPadding={true}
  originMode={true}
  defIsEditing={false}
  rowClickBtnProp="op"
  dat={alldata.data}
  col={alldata.coloumns}
></SimpleTable>
```

Why `op`: the last device-table column is already declared as:

```tsx
{ label: '', prop: 'op', flex: 1, btnText: t('config.select'), btnFn: DevRowClick }
```

So the new prop should point at that exact `prop` value rather than duplicating any business logic.

- [ ] **Step 2: Pass explicit non-editing state to the address table and forward row clicks to the `isChoose` column**

Replace the second `SimpleTable` call with this shape:

```tsx
<SimpleTable
  originMode={true}
  isSmallPadding={true}
  defIsEditing={false}
  rowClickBtnProp="isChoose"
  dat={alldata.adressData}
  col={alldata.adressColoumns}
></SimpleTable>
```

Why `isChoose`: the last address-table column is already declared as:

```tsx
{
  label: '',
  prop: 'isChoose',
  flex: 1,
  isRadio: true,
  btnFn: adressChoose,
  mapFn: (col: any, item: DataAddressEntity) => {
    return item.isChoose ? t('config.selected') : t('config.select')
  }
}
```

This preserves the current multi-select storage model and just broadens the click target to the whole row.

- [ ] **Step 3: Leave the business handlers unchanged unless the diff accidentally drifts**

Confirm these functions still have the same behavior after your edit:

```tsx
const DevRowClick = (row: simpleTableColumn, item: DeviceGroupEntity) => {
  alldata.curDev = item
  getDataAdressList()
}

const adressChoose = (row: simpleTableColumn, item: DataAddressEntity) => {
  item.isChoose = !item.isChoose
  alldata.adressData = [...alldata.adressData]
}
```

Expected: no single-select logic is introduced, and the first table still transitions to the second table exactly as before.

- [ ] **Step 4: Review only the `DevList` diff before runtime verification**

Run:

```powershell
git diff -- src/views/Home/config/devConfigNew/dataGroup/DevDataGroup/DevList.tsx
```

Expected in the diff:
- both tables now pass `defIsEditing={false}`
- the first table passes `rowClickBtnProp="op"`
- the second table passes `rowClickBtnProp="isChoose"`
- no unrelated logic changes appear in this file

- [ ] **Step 5: Commit the page integration change**

Run:

```bash
git add src/views/Home/config/devConfigNew/dataGroup/DevDataGroup/DevList.tsx
git commit -m "feat: enable DevList row click selection"
```

Expected: one commit containing only the `DevList` wiring changes.

---

### Task 3: Verify the behavior in the real WebView2 host

**Files:**
- Reference: `docs/webview2-testing.md`
- Uses existing script: `scripts/webview2_playwright_probe.py`

**Interfaces:**
- Consumes: the integrated `DevList` dialog from Task 2
- Consumes: C# host with WebView2 remote debugging on port `9223`
- Produces: runtime confirmation that first-table row clicks navigate and second-table row clicks toggle multi-select state without double-triggering

- [ ] **Step 1: Start the Vite dev server for the page source**

Run in the repo root:

```powershell
npm run dev
```

Expected: Vite serves the app on `http://localhost:3920/`.

- [ ] **Step 2: Start the C# host in Debug with WebView2 remote debugging enabled**

Before launching the C# host, set:

```powershell
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS="--remote-debugging-port=9223"
```

Then start the C# project in Debug mode so its WebView2 loads the Vite page.

Expected: the live UI is running inside the real WebView2 host, not Electron and not a standalone Chrome tab.

- [ ] **Step 3: Confirm the correct WebView2 page is available over CDP**

Run:

```powershell
$ProgressPreference = 'SilentlyContinue'
Invoke-RestMethod -Uri 'http://[::1]:9223/json/list' | ConvertTo-Json -Depth 6
```

Expected: at least one `type: "page"` entry whose `url` contains `http://localhost:3920/#/`.

- [ ] **Step 4: Capture a baseline probe before interacting with the dialog**

Run:

```powershell
py scripts/webview2_playwright_probe.py --cdp "http://[::1]:9223" --url-contains "localhost:3920"
```

Expected: the script reports the real WebView2 page title and URL without launching any extra browser window.

- [ ] **Step 5: Manually verify the first table behavior in the real UI**

In the WebView2 window:
1. Navigate to the UI path that opens the add-data dialog containing `DevList`.
2. In the first table, click a non-last-column cell such as the device name column.

Expected immediately after the click:
- the dialog switches to the second table
- the device selection action fires even though the last column button was not clicked
- no inline input editor appears in the first table

- [ ] **Step 6: Manually verify the second table multi-select behavior**

Still in the same dialog:
1. Click a non-last-column cell in one address row.
2. Confirm that row's last column text changes to the selected state and its style changes.
3. Click a different row's non-last-column cell.
4. Confirm both rows remain selected.
5. Click the first row again.
6. Confirm only the first row toggles back to unselected.
7. Click directly on a last-column selected/unselected cell.
8. Confirm the state changes once, not twice.

Expected: the second table remains true multi-select, and no click produces a select-then-immediate-unselect flicker.

- [ ] **Step 7: Save screenshot evidence from the real WebView2 page after the manual checks**

Run after leaving the dialog in the verified state:

```powershell
py scripts/webview2_playwright_probe.py `
  --cdp "http://[::1]:9223" `
  --url-contains "localhost:3920" `
  --screenshot "$env:TEMP\devlist-row-selection.png"
```

Expected: a screenshot file exists at `%TEMP%\devlist-row-selection.png` and reflects the real WebView2 page state after your manual interaction.

- [ ] **Step 8: Inspect the final diff and keep the scope tight**

Run:

```powershell
git diff --stat HEAD~2..HEAD
```

Expected: only these files changed in the finished implementation:
- `src/components/SimpleTable/index.tsx`
- `src/views/Home/config/devConfigNew/dataGroup/DevDataGroup/DevList.tsx`

If any extra file appears, review it before handing off.

---

## Self-Review Notes

- **Spec coverage:** covered the first-table non-editing + row-to-select flow, second-table non-editing + multi-select row toggle flow, duplicate-click prevention, and real WebView2 verification.
- **Placeholder scan:** no `TODO`, `TBD`, or unresolved "add appropriate handling" wording remains.
- **Type consistency:** the plan uses one prop name consistently: `rowClickBtnProp`.
