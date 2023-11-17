import { useConfigStore } from "@/store/config"
import { ActualResult, SysConfigEntity } from "~/me"

const resultProcess = (res: ActualResult) => {
  if (res.OpCode == 200) {
    return res.Value
  } else {
    window.$message.error(res.Message || '操作失败')
    return null
  }
}

export const callSpc = (cb: (() => Promise<ActualResult>) | Promise<ActualResult> | string) => {
  if(typeof cb === 'string') {
    cb = window.spcJsBind[cb]()
  }
  return window.CefSharp.BindObjectAsync("spcJsBind").then(() => {
    if (typeof cb === 'function') {
      return cb()
    } else {
      return cb
    }
  }).then((res: ActualResult) => {
    return resultProcess(res)
  })
}

export const chooseFolder = (): Promise<string> => {
  return callSpc(window.spcJsBind.showDirSelect()).then((res: string) => {
    return res || ''
  })

}

export const getPrinterList = (): Promise<string[]> => {
  return callSpc(window.spcJsBind.getPrinterList())
    .then((res: string[]) => {
      return res || []
    })
}

export const getSysConfig = () => {

  return window.CefSharp.BindObjectAsync("spcJsBind").then(() => {
    const configStore = useConfigStore()
    // window.spcJsBind.closeSpcSystem().then(function (actualResult:string) {
    //   console.info(actualResult);
    // });
    window.spcJsBind.getSysConfigs().then(function (actualResult: ActualResult) {
      let list = actualResult.Value as SysConfigEntity[]
      let data: Record<string, string> = {}
      list.forEach(e => {
        data[e.Name] = e.Value
      })
      configStore.setOriginSysConfig(list)
      configStore.setSysConfig(data)
      console.log("🚀 ~ file: utils.ts:42 ~ data:", data)
      return new Promise((resolve, reject) => {
        resolve(data)
      })
    });
  })
}
