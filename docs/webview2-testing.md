# WebView2 前端测试方法

本项目不是直接通过 Electron 启动来验证前端。真实运行方式是：C# 项目启动 WebView2，WebView2 加载本项目的 Vite dev server 页面。因此做运行验证时，应连接 C# 宿主中的 WebView2 实例。

## 适用场景

- 验证 `src/` 下前端页面、组件、Pinia 状态、WebView2 bridge 调用相关改动。
- 需要观察真实 C# 宿主环境下的页面行为。
- 不适用于 Electron 启动验证；不要使用 `npm run start_fake` 或 Electron 相关命令作为本项目的真实验证方式。

## 前置条件

1. C# 项目以 Debug 模式启动。
2. C# WebView2 加载本项目的 Vite dev server，例如：

   ```text
   http://localhost:3920/#/
   ```

3. 启动 C# Debug 前，为 WebView2 开启远程调试端口。

   PowerShell 示例：

   ```powershell
   $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS="--remote-debugging-port=9223"
   ```

   Visual Studio Debug 环境变量示例：

   ```text
   WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9223
   ```

4. 启动后确认 `msedgewebview2.exe` 命令行中包含：

   ```text
   --remote-debugging-port=9223
   ```

## 探测 WebView2 进程和端口

如果已知某个 WebView2 PID，例如 `23992`，可用下面命令查看关联进程和监听端口：

```powershell
$pidToInspect = 23992
$proc = Get-CimInstance Win32_Process -Filter "ProcessId=$pidToInspect"
$parent = $proc.ParentProcessId

Get-CimInstance Win32_Process |
  Where-Object {
    $_.ProcessId -eq $parent -or
    $_.ParentProcessId -eq $parent -or
    $_.ParentProcessId -eq $pidToInspect -or
    $_.ProcessId -eq $pidToInspect
  } |
  Select-Object ProcessId, ParentProcessId, Name,
    @{Name='HasRemoteDebug';Expression={$_.CommandLine -like '*remote-debugging*'}},
    CommandLine |
  Format-List

$pids = Get-CimInstance Win32_Process |
  Where-Object {
    $_.ProcessId -eq $parent -or
    $_.ParentProcessId -eq $parent -or
    $_.ParentProcessId -eq $pidToInspect -or
    $_.ProcessId -eq $pidToInspect
  } |
  Select-Object -ExpandProperty ProcessId

Get-NetTCPConnection -State Listen |
  Where-Object { $pids -contains $_.OwningProcess } |
  Select-Object LocalAddress, LocalPort, OwningProcess |
  Format-Table -AutoSize
```

成功时通常会看到：

```text
LocalAddress LocalPort OwningProcess
------------ --------- -------------
::1               9223         <browser-process-pid>
```

## 获取 DevTools target

使用 WebView2 的 DevTools HTTP 接口列出页面：

```powershell
$ProgressPreference = 'SilentlyContinue'
Invoke-RestMethod -Uri 'http://[::1]:9223/json/list' | ConvertTo-Json -Depth 6
```

期望结果中包含当前页面，例如：

```json
{
  "title": "新杰电工",
  "type": "page",
  "url": "http://localhost:3920/#/",
  "webSocketDebuggerUrl": "ws://[0000:...:0001]:9223/devtools/page/<id>"
}
```

如果 `url` 不是 `http://localhost:3920/#/`，说明 WebView2 当前可能没有加载本项目源码 dev server，需要先确认 C# 项目的 WebView2 地址配置。

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

如果本机设置了 `HTTP_PROXY` / `HTTPS_PROXY`，脚本会自动为本地 CDP 地址补充 `NO_PROXY` / `no_proxy` 的 `localhost,127.0.0.1,::1,[::1]` 绕过项，避免 Playwright 访问 `http://[::1]:9223/json/version` 时被代理转发并返回 502。

如果机器上没有 Python Playwright 包，可继续使用下面的 Node 内置 `WebSocket` + CDP 方式。

## 通过 CDP 操作真实 WebView2 页面

如果机器上没有 Python Playwright 包，也可以直接用 Node 内置 `WebSocket` 连接 Chrome DevTools Protocol。下面脚本会读取当前页面文本、按钮、输入框等信息：

```powershell
$code = @'
async function getTargets() {
  return await (await fetch('http://[::1]:9223/json/list')).json()
}

async function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl)
  let id = 0
  const pending = new Map()

  ws.onmessage = ev => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  }

  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })

  const send = (method, params = {}) => new Promise(resolve => {
    const msgId = ++id
    pending.set(msgId, resolve)
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })

  return { ws, send }
}

(async () => {
  const page = (await getTargets()).find(t => t.type === 'page')
  const wsUrl = page.webSocketDebuggerUrl.replace(
    'ws://[0000:0000:0000:0000:0000:0000:0000:0001]',
    'ws://[::1]'
  )
  const client = await cdp(wsUrl)

  await client.send('Runtime.enable')

  const res = await client.send('Runtime.evaluate', {
    expression: `(() => ({
      title: document.title,
      url: location.href,
      text: document.body.innerText.slice(0, 4000),
      buttons: Array.from(document.querySelectorAll('button')).map((b, i) => {
        const r = b.getBoundingClientRect()
        return {
          i,
          text: b.innerText.trim(),
          rect: { left: r.left, top: r.top, width: r.width, height: r.height },
          cls: String(b.className)
        }
      }).slice(0, 120),
      inputs: Array.from(document.querySelectorAll('input')).map((e, i) => {
        const r = e.getBoundingClientRect()
        return {
          i,
          value: e.value,
          type: e.type,
          checked: e.checked,
          rect: { left: r.left, top: r.top, width: r.width, height: r.height },
          cls: String(e.className)
        }
      }).slice(0, 120)
    }))()`,
    returnByValue: true,
    awaitPromise: true
  })

  console.log(JSON.stringify(res.result.result.value, null, 2))
  client.ws.close()
})()
'@

$code | node
```

## 点击页面元素

CDP 中优先使用真实鼠标事件，而不是只执行 `element.click()`。某些 Naive UI 下拉组件需要真实鼠标事件才会打开。

通用点击函数：

```js
async function click(client, x, y) {
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x,
    y,
    button: "none",
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
}
```

## 进入配置页示例

当前布局下，底部“维护”按钮在页面底部，点击后会出现下拉菜单，其中“配置”项会打开配置页面。

典型流程：

1. 列出按钮坐标，找到文本为 `维护` 的按钮。
2. 用真实鼠标事件点击 `维护`。
3. 等待下拉层出现。
4. 点击下拉菜单中的 `配置`。
5. 等待配置页面出现，确认正文中包含：

   ```text
   ECOCONTROL / V1.8.1.4
   基本配置
   采集配置
   统计配置
   产品分类
   ```

## 统计配置保存验证示例

用于验证 `src/views/Home/config/sysConfig/sysConfigStat.tsx` 的保存行为：

1. 打开配置页。
2. 点击 `统计配置` 标签。
3. 记录目标字段初始值，例如 `允许打印统计数据` 开关。
4. 修改该字段。
5. 点击右下角 `采用`。
6. 等待保存完成。
7. 确认字段没有回退到修改前。
8. 切换到其他配置标签，再切回 `统计配置`。
9. 再次确认字段仍保持保存后的值。
10. 如果测试改动了真实配置，最后恢复原值并再次点击 `采用` 保存。

一次成功验证的观察结果示例：

```text
STATE before: 允许打印统计数据 checked=false
STATE after-toggle-before-save: checked=true
STATE after-save-wait: checked=true
ASSERT_AFTER_SAVE_CHECKED true
STATE after-tab-round-trip: checked=true
ASSERT_AFTER_TAB_ROUND_TRIP_CHECKED true
RESTORING_AT ... to false
STATE after-restore-save: checked=false
messages: 保存完成
```

## 截图证据

可用 CDP 截图保存验证证据：

```js
const screenshot = await client.send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: false,
});
require("fs").writeFileSync(
  "C:/Users/11038/AppData/Local/Temp/claude-webview-sysconfig-stat.png",
  screenshot.result.data,
  "base64",
);
```

## 注意事项

- 不要用 Electron 作为本项目真实运行验证入口。
- 不要把普通 Chrome 页面当成 WebView2 页面来验证。
- Playwright MCP 可能默认连接普通 Chrome 会话；如果它没有绑定 WebView2 的 `9223` 端口，就不要用它误测。
- 如果 C# Debug 加载的是打包后的静态资源，而不是 Vite dev server，需要先确认资源已更新，否则源码改动不会体现在 WebView2 中。
- 项目说明中明确：测试不需要执行 lint，也不需要执行 build。
