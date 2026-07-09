import json
import os
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

CDP = "http://[::1]:9223"
URL_CONTAINS = "localhost:3920"


def ensure_no_proxy():
    for key in ("NO_PROXY", "no_proxy"):
        current = os.environ.get(key, "")
        entries = [e.strip() for e in current.split(",") if e.strip()]
        for h in ("localhost", "127.0.0.1", "::1", "[::1]"):
            if h.lower() not in {e.lower() for e in entries}:
                entries.append(h)
        os.environ[key] = ",".join(entries)


ensure_no_proxy()

with sync_playwright() as p:
    browser = p.chromium.connect_over_cdp(CDP)
    pages = [pg for ctx in browser.contexts for pg in ctx.pages]
    page = next(pg for pg in pages if URL_CONTAINS in pg.url)

    result = page.evaluate(
        """
        () => {
          const cells = Array.from(document.querySelectorAll('.n-data-table-td'));
          const target = cells.find(c => c.innerText.trim().startsWith('1.0002478611898'));
          if (!target) return { found: false, sampleTexts: cells.slice(0, 20).map(c => c.innerText) };
          const ellipsisSpan = target.querySelector('.n-ellipsis');
          const cs = getComputedStyle(target);
          const rect = target.getBoundingClientRect();
          let ellipsisInfo = null;
          if (ellipsisSpan) {
            const ecs = getComputedStyle(ellipsisSpan);
            const erect = ellipsisSpan.getBoundingClientRect();
            ellipsisInfo = {
              className: ellipsisSpan.className,
              whiteSpace: ecs.whiteSpace,
              webkitLineClamp: ecs.webkitLineClamp,
              display: ecs.display,
              textOverflow: ecs.textOverflow,
              wordBreak: ecs.wordBreak,
              overflowWrap: ecs.overflowWrap,
              rect: { width: erect.width, height: erect.height },
              scrollHeight: ellipsisSpan.scrollHeight,
              offsetHeight: ellipsisSpan.offsetHeight,
              scrollWidth: ellipsisSpan.scrollWidth,
              offsetWidth: ellipsisSpan.offsetWidth,
              innerHTML: ellipsisSpan.innerHTML.slice(0, 500)
            };
          }
          return {
            found: true,
            tdClassName: target.className,
            tdRect: { width: rect.width, height: rect.height },
            tdComputed: { whiteSpace: cs.whiteSpace, wordBreak: cs.wordBreak, overflowWrap: cs.overflowWrap },
            tdInnerHTML: target.innerHTML.slice(0, 800),
            ellipsisInfo
          };
        }
        """
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    browser.close()
