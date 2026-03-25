

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
    $message: MessageApiInjection,
    frontFn: Record<string, Function>,
    chrome: any
  }
}

type ActualResult = {
  IsSuccess: boolean,
  Message: string,
  Code: number,
  // Value: object | string
  Data: object | string
}

type DriverInfo = {
  connectType: string,    //决定连接配置表单有哪些输入项
  addressType: string,   //决定地址表单有哪些输入项
  colType: string,      //决定地址表格有哪些列
  // connectTypeDefaultData: DriverConnectType,
  // addressTypeDefaultData: DriverAddressType
}

type DriverConnectType = ConnectTcpModel | ConnectComModel | ConnectFFTModel | ConnectSiemensModel | ConnectSikoraTcpModel
type DriverAddressType = ModbusAddressModel | FFTAddressModel | SiemensAddressModel

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

type ConnectFFTModel = {
  Host: string;
  Port: number;
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

type ConnectSiemensModel = {
  PlcModel: string;  // PLC型号
  Host: string;
  Port: number;
  Slot: string;
  Rack: string;
  Cycle: number;
  Timeout: number;
}

type ConnectSikoraTcpModel = {
  Host: string;
  Port: number;
  Cycle: number;
  Timeout: number;
}

type ConnectSikoraComModel = {
  PortName: string;
  BaudRate: number;
  DataBits: number;
  StopBits: string;
  Parity: string;
  Cycle: number;
  Timeout: number;
}

type ConnectZumbachComModel = {
  PortName: string;
  BaudRate: number;
  DataBits: number;
  StopBits: string;
  Parity: string;
  Cycle: number;
  Timeout: number;
  ReadBuffSize: number;
}

type ConnectZumbachTcpModel = {
  Host: string;
  Port: number;
  Cycle: number;
  Timeout: number;
  ReadBuffSize: number;
  Split: string;
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

type SiemensAddressModel = {
  DataName: string;
  Address: string;
  Length: number;
  DataType: string;
  CountFormula?: string;
  ExchangeData?: string;
  Rate: string;
  Offset: string;
}
type SikoraAddressModel = {
  DataName: string;
  Address: string;
  Index: number;
  Length: number;
  DataType: string;
  CountFormula?: string;
  ExchangeData?: string;
  CountMark: string;
}

type ZumbachAddressModel = {
  DataName: string;
  Address: string;
  DataType: string;
  CountFormula?: string;
  ExchangeData?: string;
}



type CategoryNodeEntity = {
  GId: string;
  NodeName: string;
  CreateTime: string;
}

type CategoryDataEntity = {
  GId: string;
  CategoryNodeId: string;
  NodeName?: string;
  DeviceName: string;
  DataName: string;
  Class: string;
  Limit: number;
  CreateTime: string;
  ComposeName?: string;
}

type DataConfigEntity = {
  GId?: string;
  CategoryNodeId?: string;
  Name: string;
  DataType: number;
  Unit: string;
  SortNum: number;
  Precision: number;
  Unilateral: number;
  AlarmType: number;
  Distance: number;
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

type ProductStatisticEntity = {
  GId?: string;
  ProductNo: string;
  Name: string;
  Unit: string;
  Standard: number;
  USL: number;
  LSL: number;
  Average: number;
  Max: number;
  Min: number;
  StdDeviation: number;
  Ca: number;
  Cp: number;
  Cpk: number;
}

type CollectPointModel = {
  Intime: Date;
  Index: number;
  Value: number;
}

type CpkModel = {
  Std: number;
  Usl: number;
  Lsl: number;
  Avg: number;
  Max: number;
  Min: number;
  Sd: number;
  Ca: number;
  Cp: number;
  Cpk: number;
  CpkU: number;
  CpkL: number;
}

type FFTModel = {
  Values: number[];
  Frequency: number;
  Ffrequencys: number[];
  Fcounts: number[];
  Famplitudes: number[];
  Fphases: number[];
}

type DistributionModel = {
  Std: number;
  Usl: number;
  Lsl: number;
  NdX: number[];
  NdY: number[];
  GaussX: number[];
  GaussY: number[];
}