import { useConfigStore } from "@/store/config"
import { ActualResult, SysConfigEntity } from "~/me"
import { resultProcess } from "./call";
import { safeJsonParse } from "./utils"


export const callBrige = (cb: string, data?: any, multi: boolean = false) => {
  console.log("🪵 [callm.ts:14] ~ token ~ \x1b[0;32mcb\x1b[0m = ", cb);
  const bridge = window.chrome.webview.hostObjects.JsBridge;
  let str = null;
  if (data) {
    if (typeof data == 'object') {
      str = JSON.stringify(data)
    }
    if (typeof data == 'string') {
      str = data
    }
    if (typeof data == 'number') {
      str = data
    }
  }
  // console.log("🪵 [callm.ts:27] ~ token ~ \x1b[0;32mstr\x1b[0m = ", str);
  let fn = bridge[cb]
  if (fn) {
    let fnRun = str ? fn(str) : fn()
    return fnRun.then((res: any) => {
      let resObj = safeJsonParse(res) as ActualResult
      return resultProcess(resObj)
    }).catch((err: any) => {
      console.error(err)
      window.$message.error(err)
    });
  }
}
// return bridge[cb] && bridge[cb]().then((res: string) => {
//   let resObj = safeJsonParse(res) as ActualResult
//   // console.log("🪵 [callm.ts:16] ~ token ~ \x1b[0;32mres\x1b[0m = ", resObj);
//   return resultProcess(resObj)
// }).catch((err: any) => {
//   console.error(err)
//   window.$message.error(err)
// });
// }