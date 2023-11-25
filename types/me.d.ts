

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

type DriverInfo = {
  connectType: string,
  addressType: string,
  // connectTypeDefaultData: DriverConnectType,
  // addressTypeDefaultData: DriverAddressType
}

type DriverConnectType = ConnectTcpModel | ConnectComModel
type DriverAddressType = ModbusAddressModel

type SysConfigEntity = {  //原始ActualResult
  Name: string
  Value: string
  CreateTime: string
}

type DeviceConfigEntity = {
  GId?: string;
  Name: string;
  DriverName: string;
  State: number;
  ConnectConfig: string;
  AddressConfigs: string;
  CreateTime: string;
}

type ConnectTcpModel = {
  Host: string;
  Port: number;
  SlaveId: number;
  Cycle: number;
  Timeout: number;
  Endian32Bit: string;
  Endian16Bit: string;
}

type ConnectComModel = {
  PortName: string;
  BaudRate: number;
  DataBits: number;
  StopBits: string;
  Parity: string;
  SlaveId: number;
  Cycle: number;
  Timeout: number;
  Endian32bit: string;
  EndianString: string;
}

type ModbusAddressModel = {
  Id?: string;          //前端生成并使用的ID
  DataName: string;
  SlaveId?: number;
  Area: string;
  Index: number;
  Length: number;
  DataType: string;
  CountFormula?: string;
  ExchangeData?: string;
  EndianBit: string;
}

type CategoryNodeEntity = {
  GId: string;
  NodeName: string;
  CreateTime: string;
}

type CategoryDataEntity = {
  GId: string;
  CategoryNodeId: string;
  DeviceName: string;
  DataName: string;
  Class: string;
  Limit: number;
  CreateTime: string;
}

type  DataConfigEntity = {
  GId?: string;
  CategoryNodeId?: string;
  Name: string;
  DataType: number;
  Unit: string;
  SortNum: number;
  Precision: number;
  Unilateral: number;
  AlarmType: number;
  State: number;
  CreateTime?: string;
}

type SerialNoEntity = {
  GId?: string;
  FieldType: number;
  Format: string;
  LastValue?: string;
  SortNum: number;
  UpdateTime?: string;
}

type FormulaConfigEntity = {
  GId?: string;
  PN: string;
  Note: string;
  Active: number;
  CreateTime?: string;
}

type FormulaDataEntity = {
  GId?: string;
  DataId?: string;
  FormulaId?: string;
  Standard: number;
  UpperTol: number;
  LowerTol: number;
  CreateTime?: string;
}

type ProductHistoryEntity = {
  GId?: string;
  ProductNo: string;
  PN: string;
  Note: string;
  StartTime: string;
  EndTime: string;
  Operator: string;
  ExcelPath: string;
  PdfPath: string;
}

type ProductLogEntity = {
  GId?: string;
  ProductNo: string;
  Operater: string;
  LogType: string;
  LogOption: string;
  LogDetail: string;
  Length?: number;
  CreateTime: string;
}