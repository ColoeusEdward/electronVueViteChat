

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
/**
 * 系统配置模型 (PascalCase 保持与 C# 实体一致)
 */
export interface SysConfigModel {
  /** 公司名 */
  CompanyName: string;

  /** 机台编号 */
  MachineCode: string;

  /** 默认小数点精确度 */
  Precision: number;

  /** 数据采样间隔(ms) */
  ColloctInterval: number;

  /** 控制信号间隔(ms) */
  ControlInterval: number;

  /** 曲线刷新周期(ms) */
  RefreshInterval: number;

  /** CPK计算周期(ms) */
  CpkInterval: number;

  /** CPK计算最小需求点数 */
  CpkMinPonitNum: number;

  /** 报表打印机名称 */
  ReportPrinter?: string;

  /** 导出的文件目录路径 */
  ExportPath: string;

  /** 允许实时数据导出 (0/1) */
  EnableExportReal: number;

  /** 允许统计数据导出 (0/1) */
  EnableExportStati: number;

  /** 允许打印统计数据 (0/1) */
  EnablePrintStati: number;

  /** 激活码 */
  Cdkey?: string;

  /** 输入类型：0键盘，1触摸 */
  InputType: number;

  /** 报警信息写入数据库 (0/1) */
  AlarmToDb: number;

  /** 当前配方Id */
  CurrentFormulaId?: string;

  /** 当前数据分组 */
  CurrentGroupId?: string;
}

type DeviceConfigEntity = {
  GId?: string;
  Name: string;
  DriverName: string;
  State: number;
  ConnectString?: string;
  // AddressConfig?: string;
  CreateTime?: string;
  isNewRow?: boolean;
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
  BaudRate: string;
  DataBits: string;
  StopBits: string;
  Parity: string;
  SlaveId?: number;
  Cycle: number;
  Timeout: number;
  Endian32bit: string;
  Endian16bit: string;
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

type ModbusAddressModel = { //废弃⚠️
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

type ModbusAdressSubItem = {
  /** 从站 ID，允许为 null */
  SlaveId?: number | null;
  /** 区域/功能码标识 */
  Area: number;
  /** 寄存器起始地址/索引 */
  Index: number;
  /** 数据长度 */
  Length: number;
  /** 数据类型枚举 (如: 4 可能代表 Float 或 Int32) */
  DataType: number;
  /** 字节交换模式 */
  Exchange: number;
  /** 缩放倍率 */
  Rate: number;
  /** 偏移量 */
  Offset: number;
}

type ModbusAdressRow = {
  GId?: string;           // UUID 字符串
  DeviceId: string;      // 设备 ID
  DataName?: string;      // 数据名称，如 "HotOD"
  DeviceClass: number;   // 设备分类
  DataClass: number;     // 数据分类
  ParamClass: number;    // 参数分类
  Unit: string;          // 单位，如 "mm"
  Precision: number;     // 精度（小数点后位数）
  Unilateral: 0 | 1 | 2;    // 单边属性 1.没有下偏差 2.没有上偏差
  AlarmType: 0 | 1 | 2;     // 报警类型   0.离散点 1.上升沿 2.下降沿
  Permission: number;    // 权限
  State: number;         // 状态
  /** * 这是一个序列化后的 JSON 字符串，
   * 对应 AddressConfig 结构
   */
  AddressString: string;
  CreateTime?: string;    // 日期时间字符串
  isNewRow?: boolean
  SlaveId?: number;
  Length?: number
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
  children?: DataConfigEntity[]
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

type menuOption = {
  label: string,
  title: string,
  value?: number,
  unit?: string,
  stand?: RightValueType[],
  children?: menuOption[]
}

interface simpleTableColumn {
  label: string;
  prop: string;
  flex: number;
  btnText?: string;
  btnFn?: (row: any, item: any) => void,
  btnType?: string,
  isInput?: boolean,
  inputUpdateFn?: (row: any, item: any) => void,
  mapFn?: (row: any, item: any) => string | number | boolean
}