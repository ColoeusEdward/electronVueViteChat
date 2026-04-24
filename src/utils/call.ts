import { useConfigStore } from "@/store/config"
import { ActualResult, SysConfigEntity, SysConfigModel } from "~/me"
import { callBrige } from "./callm"
import { callFnName } from "./enum"

export const resultProcess = (res: ActualResult) => {
  // console.log("🚀 ~ resultProcess ~ res:", res)
  if (res.Code == 0) {
    return res.Data
  } else {
    window.$message.error(res.Message || '操作失败')
    return null
  }
}

export const callSpc = (cb: (() => Promise<ActualResult>) | Promise<ActualResult> | string, data?: any, multi: boolean = false) => {  //multi:是否支持多个参数

  return window.CefSharp.BindObjectAsync("spcJsBind").then(() => {
    if (typeof cb === 'string') {
      if (data) {
        cb = multi ? window.spcJsBind[cb](...data) : window.spcJsBind[cb](data)
      } else {
        cb = window.spcJsBind[cb]()
      }
    }
    if (typeof cb === 'function') {
      return cb()
    } else {
      return cb
    }
  }).then((res: ActualResult) => {
    return resultProcess(res)
  }).catch((err: any) => {
    console.error(err)
    window.$message.error(err)
  })
}

export const chooseFolder = (): Promise<string> => {
  return callBrige(callFnName.ShowDirSelect).then((res: string) => {
    return res || ''
  })

}

export const getPrinterList = (): Promise<string[]> => {
  return callBrige(callFnName.GetPrinterList).then((res: string[]) => {
    return res
  })
  // return callSpc(window.spcJsBind.getPrinterList())
  //   .then((res: string[]) => {
  //     return res || []
  //   })
}

export const getSysConfig = () => {
  const configStore = useConfigStore()
  return callBrige(callFnName.GetSysConfig).then((res: SysConfigModel) => {
    // console.log("🪵 [call.ts:58] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
    let list: SysConfigEntity[] = [];
    let data: SysConfigModel = res;
    // list.forEach(e => {
    //   data[e.Name] = e.Value
    // })
    // Object.keys(data).forEach(e => {
    //   list.push({
    //     Name: e,
    //     Value: data[e],
    //     CreateTime: ""
    //   })
    // })
    // console.log("🪵 [call.ts:61] ~ token ~ \x1b[0;32mlist\x1b[0m = ", list);
    configStore.setOriginSysConfig(list)
    configStore.setSysConfig(data)
    // console.log("🚀 ~ file: utils.ts:42 ~ data:", data)
    return new Promise((resolve, reject) => {
      resolve(data)
    })
  })

  // return window.CefSharp.BindObjectAsync("spcJsBind").then(() => {
  //   const configStore = useConfigStore()
  //   // window.spcJsBind.closeSpcSystem().then(function (actualResult:string) {
  //   //   console.info(actualResult);
  //   // });
  //   window.spcJsBind.getSysConfigs().then(function (actualResult: ActualResult) {
  //     let list = actualResult.Value as SysConfigEntity[]
  //     let data: Record<string, string> = {}
  //     list.forEach(e => {
  //       data[e.Name] = e.Value
  //     })
  //     configStore.setOriginSysConfig(list)
  //     configStore.setSysConfig(data)
  //     // console.log("🚀 ~ file: utils.ts:42 ~ data:", data)
  //     return new Promise((resolve, reject) => {
  //       resolve(data)
  //     })
  //   });
  // })
}
