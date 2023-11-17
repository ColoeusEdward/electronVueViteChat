

import { MessageApiInjection } from "naive-ui/es/message/src/MessageProvider";
declare global {
  // ? 扩展window对象
  interface Window {
    /**
    * Electron ipcRenderer
    * 后面会将进程通讯方法挂载到window对象上,所以添加此接口防止报错
    */
    ipc: import("electron").IpcRenderer;
    CefSharp: any,
    spcJsBind: any,
    $message: MessageApiInjection
  }
}

type ActualResult = {
  IsSuccess: boolean,
  Message: string,
  OpCode: number,
  Value: object
}

type SysConfigEntity = {  //原始ActualResult
  Name:string
  Value:string
  CreateTime:string
}

type DeviceConfigEntity = {
  GId: string;
  Name: string;
  DriverName: string;
  State: number;
  ConnectConfig: string;
  AddressConfigs: string;
  CreateTime: string;
}