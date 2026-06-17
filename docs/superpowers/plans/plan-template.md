# [功能名] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [一句话描述这个功能做什么]

**Architecture:** [2-3 句说明整体方案，例如：采用 X 模式，通过 Y 实现 Z，数据流向是 A→B→C]

**Tech Stack:** [关键技术，例如：Vue 3 / TypeScript / Electron / Vite]

---

## File Map

| 操作 | 文件路径 | 职责 |
|------|----------|------|
| Create | `src/xxx/yyy.ts` | 负责 ... |
| Modify | `src/xxx/zzz.ts` | 添加 ... |
| Test   | `tests/xxx/yyy.test.ts` | 覆盖 ... |

---

## Task 1: [组件/模块名]

**Files:**
- Create: `src/exact/path/file.ts`
- Test: `tests/exact/path/file.test.ts`

- [ ] **Step 1: 写失败的测试**

```ts
it('should do specific thing', () => {
  const result = myFunction(input)
  expect(result).toBe(expected)
})
```

- [ ] **Step 2: 运行，确认它失败**

```bash
npm test -- tests/exact/path/file.test.ts
```

预期输出：`FAIL — myFunction is not defined`

- [ ] **Step 3: 写最小实现**

```ts
export function myFunction(input: string): string {
  return expected
}
```

- [ ] **Step 4: 运行，确认通过**

```bash
npm test -- tests/exact/path/file.test.ts
```

预期输出：`PASS`

- [ ] **Step 5: Commit**

```bash
git add src/exact/path/file.ts tests/exact/path/file.test.ts
git commit -m "feat: add myFunction"
```

---

## Task 2: [下一个组件]

**Files:**
- Modify: `src/exact/path/existing.ts:45-60`
- Test: `tests/exact/path/existing.test.ts`

- [ ] **Step 1: 写失败的测试**

```ts
it('should handle edge case', () => {
  // ...
})
```

- [ ] **Step 2: 运行，确认它失败**

```bash
npm test -- tests/exact/path/existing.test.ts
```

- [ ] **Step 3: 修改实现**

```ts
// existing.ts 第 45-60 行改为：
export function existingFn(input: Input): Output {
  // 改动内容
}
```

- [ ] **Step 4: 运行，确认通过**

```bash
npm test -- tests/exact/path/existing.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/exact/path/existing.ts tests/exact/path/existing.test.ts
git commit -m "feat: extend existingFn to handle X"
```

---

## Self-Review Checklist

- [ ] 每条需求都有对应 Task？
- [ ] 没有 TBD / TODO / "添加错误处理" 等占位符？
- [ ] 跨 Task 的函数名/类型名一致？
- [ ] 每步都有实际代码/命令/预期输出？
