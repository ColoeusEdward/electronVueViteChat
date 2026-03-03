import { useConfigStore } from "@/store/config"
import { ActualResult, SysConfigEntity } from "~/me"

const resultProcess = (res: ActualResult) => {
  // console.log("🚀 ~ resultProcess ~ res:", res)
  if (res.OpCode == 200) {
    return res.Value
  } else {
    window.$message.error(res.Message || '操作失败')
    return null
  }
}

export const callBrige = (cb: string, data?: any, multi: boolean = false) => {
  const bridge = window.chrome.webview.hostObjects.myBridge;
  return bridge[cb] && bridge[cb]().then((res: ActualResult) => {
    return resultProcess(res)
  }).catch((err: any) => {
    console.error(err)
    window.$message.error(err)
  });
}