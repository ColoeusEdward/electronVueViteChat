from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from playwright.sync_api import Page, sync_playwright


LOCAL_NO_PROXY_HOSTS = ("localhost", "127.0.0.1", "::1", "[::1]")


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


def configure_stdout() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")


def ensure_local_cdp_bypasses_proxy(cdp_endpoint: str) -> None:
    parsed = urlparse(cdp_endpoint)
    host = parsed.hostname
    if host not in {"localhost", "127.0.0.1", "::1"}:
        return

    for key in ("NO_PROXY", "no_proxy"):
        current = os.environ.get(key, "")
        entries = [entry.strip() for entry in current.split(",") if entry.strip()]
        normalized = {entry.lower() for entry in entries}
        changed = False
        for host_entry in LOCAL_NO_PROXY_HOSTS:
            if host_entry.lower() not in normalized:
                entries.append(host_entry)
                normalized.add(host_entry.lower())
                changed = True
        if changed or not current:
            os.environ[key] = ",".join(entries)


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
    configure_stdout()
    args = parse_args()
    ensure_local_cdp_bypasses_proxy(args.cdp)

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
