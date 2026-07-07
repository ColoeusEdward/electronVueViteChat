# Python Playwright WebView2 Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable Python Playwright probe for the existing C# WebView2 test workflow, after first proving that Python Playwright can attach to the real WebView2 instance on port 9223.

**Architecture:** Keep the C# host and Vite dev server as the source of truth. Python Playwright connects over CDP to the already-running WebView2 instance, selects the page whose URL contains `localhost:3920`, then reports page state and optionally captures a screenshot. Documentation adds this as the preferred ergonomic path while keeping the current Node CDP snippet as a fallback.

**Tech Stack:** Python 3.13, Python Playwright sync API, Chromium CDP via WebView2 remote debugging, PowerShell commands for local verification, Markdown docs.

---

## File Structure

- Create: `scripts/webview2_playwright_probe.py`
  - Single responsibility: connect to an existing WebView2 CDP endpoint, select a matching page, print a concise page summary, list visible buttons and inputs, and optionally capture a screenshot.
  - Does not start C#, Electron, Vite, or any browser. This prevents false positives from testing the wrong runtime.
- Modify: `docs/webview2-testing.md`
  - Add a `Python Playwright 方式` section before the current raw CDP section.
  - Keep the Node CDP section as a fallback for machines without Python Playwright.
- No product source files under `src/` are modified.
- No lint/build steps are required by this project.

---

### Task 1: Run the Minimum Viable Python Playwright WebView2 Probe

**Files:**
- No repository files changed in this task.

- [ ] **Step 1: Ensure the C# WebView2 host is running with remote debugging enabled**

Ask the user to start the C# project in Debug mode with this environment variable set before launch:

```powershell
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS="--remote-debugging-port=9223"
```

The WebView2 page should load the Vite dev server URL:

```text
http://localhost:3920/#/
```

- [ ] **Step 2: Verify that the DevTools endpoint is reachable**

Run:

```powershell
$ProgressPreference = 'SilentlyContinue'; Invoke-RestMethod -Uri 'http://[::1]:9223/json/list' | ConvertTo-Json -Depth 6
```

Expected: JSON output contains at least one object with:

```json
{
  "type": "page",
  "url": "http://localhost:3920/#/"
}
```

If this fails, stop and report that WebView2 is not exposing CDP on `9223`; do not test against normal Chrome or Electron.

- [ ] **Step 3: Run a temporary Python Playwright probe without writing files**

Run this exact command from the repository root:

```powershell
@'
from playwright.sync_api import sync_playwright

CDP_ENDPOINT = "http://[::1]:9223"
URL_CONTAINS = "localhost:3920"

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(CDP_ENDPOINT)
    try:
        pages = []
        for context in browser.contexts:
            pages.extend(context.pages)

        matching_pages = [page for page in pages if URL_CONTAINS in page.url]
        if not matching_pages:
            print(f"ERROR: no WebView2 page URL contains {URL_CONTAINS!r}")
            print("Observed pages:")
            for page in pages:
                print(f"- {page.url}")
            raise SystemExit(2)

        page = matching_pages[0]
        page.wait_for_load_state("domcontentloaded", timeout=10000)
        page.wait_for_timeout(500)

        summary = page.evaluate("""
        () => ({
          title: document.title,
          url: location.href,
          text: document.body ? document.body.innerText.slice(0, 800) : '',
          buttonCount: document.querySelectorAll('button').length,
          inputCount: document.querySelectorAll('input').length,
          buttons: Array.from(document.querySelectorAll('button')).map((button, index) => ({
            index,
            text: button.innerText.trim(),
            visible: !!(button.offsetWidth || button.offsetHeight || button.getClientRects().length)
          })).slice(0, 30),
          inputs: Array.from(document.querySelectorAll('input')).map((input, index) => ({
            index,
            type: input.type,
            value: input.value,
            checked: input.checked,
            visible: !!(input.offsetWidth || input.offsetHeight || input.getClientRects().length)
          })).slice(0, 30)
        })
        """)

        print("TITLE:", summary["title"])
        print("URL:", summary["url"])
        print("BUTTON_COUNT:", summary["buttonCount"])
        print("INPUT_COUNT:", summary["inputCount"])
        print("TEXT_PREVIEW:")
        print(summary["text"])
        print("BUTTONS:")
        for button in summary["buttons"]:
            print(button)
        print("INPUTS:")
        for input_info in summary["inputs"]:
            print(input_info)
    finally:
        browser.close()
'@ | py
```

Expected: The command prints the actual WebView2 page title, URL `http://localhost:3920/#/`, body text, button count, and input count.

- [ ] **Step 4: Record the result**

If Step 3 succeeds, proceed to Task 2.

If Step 3 fails, report the exact error and observed pages. Do not create the reusable script until the failure mode is understood.

---

### Task 2: Add the Reusable Python Playwright Probe Script

**Files:**
- Create: `scripts/webview2_playwright_probe.py`

- [ ] **Step 1: Create `scripts/webview2_playwright_probe.py`**

Create the file with this full content:

```python
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from playwright.sync_api import Page, sync_playwright


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Connect to an already-running C# WebView2 instance over CDP "
            "and print a concise summary of the matched page."
        )
    )
    parser.add_argument(
        "--cdp",
        default="http://[::1]:9223",
        help="WebView2 remote debugging endpoint. Default: http://[::1]:9223",
    )
    parser.add_argument(
        "--url-contains",
        default="localhost:3920",
        help="Substring used to choose the WebView2 page. Default: localhost:3920",
    )
    parser.add_argument(
        "--screenshot",
        default="",
        help="Optional path for a PNG screenshot of the matched page.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print the full summary as JSON instead of a readable text report.",
    )
    return parser.parse_args()


def select_page(pages: list[Page], url_contains: str) -> Page:
    matching_pages = [page for page in pages if url_contains in page.url]
    if matching_pages:
        return matching_pages[0]

    observed_urls = "\n".join(f"- {page.url}" for page in pages) or "- <no pages observed>"
    raise RuntimeError(
        f"No WebView2 page URL contains {url_contains!r}.\n"
        f"Observed pages:\n{observed_urls}\n"
        "Do not continue with a normal Chrome or Electron page."
    )


def collect_summary(page: Page) -> dict[str, Any]:
    page.wait_for_load_state("domcontentloaded", timeout=10_000)
    page.wait_for_timeout(500)
    return page.evaluate(
        """
        () => ({
          title: document.title,
          url: location.href,
          text: document.body ? document.body.innerText.slice(0, 1200) : '',
          buttonCount: document.querySelectorAll('button').length,
          inputCount: document.querySelectorAll('input').length,
          buttons: Array.from(document.querySelectorAll('button')).map((button, index) => {
            const rect = button.getBoundingClientRect();
            return {
              index,
              text: button.innerText.trim(),
              visible: !!(button.offsetWidth || button.offsetHeight || button.getClientRects().length),
              rect: {
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              className: String(button.className)
            };
          }).slice(0, 80),
          inputs: Array.from(document.querySelectorAll('input')).map((input, index) => {
            const rect = input.getBoundingClientRect();
            return {
              index,
              type: input.type,
              value: input.value,
              checked: input.checked,
              visible: !!(input.offsetWidth || input.offsetHeight || input.getClientRects().length),
              rect: {
                left: Math.round(rect.left),
                top: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              className: String(input.className)
            };
          }).slice(0, 80)
        })
        """
    )


def print_text_report(summary: dict[str, Any]) -> None:
    print(f"TITLE: {summary['title']}")
    print(f"URL: {summary['url']}")
    print(f"BUTTON_COUNT: {summary['buttonCount']}")
    print(f"INPUT_COUNT: {summary['inputCount']}")
    print("TEXT_PREVIEW:")
    print(summary["text"])
    print("BUTTONS:")
    for button in summary["buttons"]:
        print(
            f"  #{button['index']} visible={button['visible']} "
            f"rect={button['rect']} text={button['text']!r}"
        )
    print("INPUTS:")
    for input_info in summary["inputs"]:
        print(
            f"  #{input_info['index']} visible={input_info['visible']} "
            f"type={input_info['type']!r} checked={input_info['checked']} "
            f"rect={input_info['rect']} value={input_info['value']!r}"
        )


def main() -> int:
    args = parse_args()

    with sync_playwright() as playwright:
        browser = playwright.chromium.connect_over_cdp(args.cdp)
        try:
            pages = [page for context in browser.contexts for page in context.pages]
            page = select_page(pages, args.url_contains)
            summary = collect_summary(page)

            if args.screenshot:
                screenshot_path = Path(args.screenshot)
                screenshot_path.parent.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(screenshot_path), full_page=False)
                summary["screenshot"] = str(screenshot_path)

            if args.json:
                print(json.dumps(summary, ensure_ascii=False, indent=2))
            else:
                print_text_report(summary)
                if args.screenshot:
                    print(f"SCREENSHOT: {args.screenshot}")
        finally:
            browser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Run the script help**

Run:

```powershell
py scripts/webview2_playwright_probe.py --help
```

Expected: Help text lists `--cdp`, `--url-contains`, `--screenshot`, and `--json`.

- [ ] **Step 3: Run the script against the real WebView2 instance**

Run:

```powershell
py scripts/webview2_playwright_probe.py --cdp "http://[::1]:9223" --url-contains "localhost:3920"
```

Expected: The script prints the real WebView2 page title, URL, text preview, visible buttons, and inputs.

- [ ] **Step 4: Verify optional screenshot capture**

Run:

```powershell
py scripts/webview2_playwright_probe.py --cdp "http://[::1]:9223" --url-contains "localhost:3920" --screenshot "$env:TEMP\webview2-playwright-probe.png"
```

Expected: Output ends with:

```text
SCREENSHOT: <temp path>\webview2-playwright-probe.png
```

And the file exists at that path.

---

### Task 3: Update the WebView2 Testing Documentation

**Files:**
- Modify: `docs/webview2-testing.md`

- [ ] **Step 1: Insert a Python Playwright section before `## 通过 CDP 操作真实 WebView2 页面`**

Insert this Markdown after the existing `## 获取 DevTools target` section and before the raw CDP section:

```markdown
## 通过 Python Playwright 操作真实 WebView2 页面

本机安装 Python Playwright 后，优先使用仓库中的探测脚本连接真实 WebView2。这个方式仍然连接 C# 宿主暴露的 `9223` 端口，不会启动 Electron，也不会新开普通 Chrome 页面作为验证对象。

安装依赖：

```powershell
py -m pip install playwright
py -m playwright install chromium
```

确认 C# Debug 已启动、WebView2 已启用远程调试端口后，运行：

```powershell
py scripts/webview2_playwright_probe.py --cdp "http://[::1]:9223" --url-contains "localhost:3920"
```

脚本会：

1. 通过 Playwright 的 `chromium.connect_over_cdp()` 连接 `http://[::1]:9223`。
2. 从现有 browser contexts 中选择 URL 包含 `localhost:3920` 的页面。
3. 输出页面标题、URL、正文预览、按钮列表和输入框列表。
4. 如果没有找到匹配页面，列出观察到的页面 URL 并停止，避免误测普通 Chrome 或 Electron 页面。

可选截图：

```powershell
py scripts/webview2_playwright_probe.py `
  --cdp "http://[::1]:9223" `
  --url-contains "localhost:3920" `
  --screenshot "$env:TEMP\webview2-playwright-probe.png"
```

如果机器上没有 Python Playwright 包，可继续使用下面的 Node 内置 `WebSocket` + CDP 方式。
```

- [ ] **Step 2: Adjust the old raw CDP introduction sentence**

Change the sentence:

```markdown
本机如果没有 Python/Node Playwright 包，也可以直接用 Node 内置 `WebSocket` 连接 Chrome DevTools Protocol。下面脚本会读取当前页面文本、按钮、输入框等信息：
```

To:

```markdown
如果机器上没有 Python Playwright 包，也可以直接用 Node 内置 `WebSocket` 连接 Chrome DevTools Protocol。下面脚本会读取当前页面文本、按钮、输入框等信息：
```

- [ ] **Step 3: Verify the Markdown renders logically**

Read the edited section and confirm the order is:

1. Preconditions.
2. DevTools target discovery.
3. Python Playwright approach.
4. Raw Node CDP fallback.
5. Clicking elements.
6. Existing business-flow examples.

---

### Task 4: Final Verification and Handoff

**Files:**
- Verify: `scripts/webview2_playwright_probe.py`
- Verify: `docs/webview2-testing.md`

- [ ] **Step 1: Run the reusable script help**

Run:

```powershell
py scripts/webview2_playwright_probe.py --help
```

Expected: Exit code 0 and the help text describes the WebView2 probe.

- [ ] **Step 2: Run the reusable script against WebView2 if the C# host is available**

Run:

```powershell
py scripts/webview2_playwright_probe.py --cdp "http://[::1]:9223" --url-contains "localhost:3920" --json
```

Expected when C# WebView2 is running: JSON output includes `title`, `url`, `text`, `buttonCount`, `inputCount`, `buttons`, and `inputs`.

Expected when C# WebView2 is not running: report that the runtime verification was skipped because the required host was unavailable. Do not substitute Electron or normal Chrome.

- [ ] **Step 3: Check git diff**

Run:

```powershell
git diff -- scripts/webview2_playwright_probe.py docs/webview2-testing.md
```

Expected: Diff only adds the focused Python probe and the documentation section.

- [ ] **Step 4: Report completion**

Report:

```text
Implemented Python Playwright WebView2 probe.
Verified: <exact commands that passed>.
Skipped: <any verification skipped because C# WebView2 was unavailable>.
Docs updated: docs/webview2-testing.md.
```

Do not claim runtime WebView2 verification passed unless the script actually connected to the C# WebView2 page on port `9223`.

---

## Self-Review

- Spec coverage: The plan covers the requested B + C scope and explicitly starts with a minimum viable verification before adding files.
- Placeholder scan: No `TBD`, `TODO`, "similar to", or unspecified implementation steps remain.
- Type consistency: The script consistently uses `--cdp`, `--url-contains`, `--screenshot`, `--json`, `select_page()`, `collect_summary()`, and `print_text_report()` across tasks.
- Project constraints: The plan does not run lint/build, does not start Electron, and does not use `npm run start_fake`.
