import { ConnectComModel } from "~/me";

export const tabNameEnum = {
  devConfigNew: 'devConfigNew',
  sysConfig: 'sysConfig',
  dataAddress: 'dataAddress',
  dataGroup: 'dataGroup',
  deviceGroup: 'deviceGroup',
  devDataGroup: 'devDataGroup',
  devConfig: 'devConfig'
}

export enum DeviceClassEnum {
  /** 线径仪 */
  OD = 1,
  /** 电容仪 */
  Cap = 2,
  /** 偏心仪 */
  Ecc = 3,
  /** 凹凸仪 */
  Con = 4,
  /** 计米 */
  Meter = 5,
  /** 控制 */
  Control = 6,
  /** 报警 */
  Alarm = 7,
}

/**
 * 数据类型
 */
export enum DataClassEnum {
  /** 平均线径 */
  OD = 101,

  /** 线径X */
  ODX = 102,

  /** 线径Y */
  ODY = 103,

  /** 椭圆 */
  OVAL = 104,

  /** 电容 */
  CAP = 201,

  /** 偏心度 */
  ECC = 301,

  /** 偏心角 */
  ANGLE = 302,

  /** 同心度 */
  CONCEN = 303,

  /** 导体线径 */
  CUOD = 304,

  /** 凹凸总数 */
  CON = 401,

  /** 凹计数 */
  CONC = 402,

  /** 凸计数 */
  CONV = 403,

  /** 计米 */
  LENGTH = 501,

  /** 线速 */
  LSPEED = 502,

  /** 开关 */
  SWITCH = 601,

  /** 换轴 */
  SHAFT = 602,

  /** 清零 */
  CLEAR = 603,

  /** 启动 */
  START = 604,

  /** 停止 */
  STOP = 605
}

/**
 * 参数类型
 */
export enum ParamClassEnum {
  /** 实际值 */
  Value = 0,
  /** 设定值 */
  Std = 1,
  /** 公差 */
  Tol = 2,
  /** 上公差 */
  Utol = 3,
  /** 下公差 */
  Ltol = 4,
}

export const DeviceClassNameMap: Record<number, string> = {
  [DeviceClassEnum.OD]: '线径仪',
  [DeviceClassEnum.Cap]: '电容仪',
  [DeviceClassEnum.Ecc]: '偏心仪',
  [DeviceClassEnum.Con]: '凹凸仪',
  [DeviceClassEnum.Meter]: '计米',
  [DeviceClassEnum.Control]: '控制',
  [DeviceClassEnum.Alarm]: '报警',
};

export const DataClassNameMap: Record<number, string> = {
  [DataClassEnum.OD]: '平均线径',
  [DataClassEnum.ODX]: '线径X',
  [DataClassEnum.ODY]: '线径Y',
  [DataClassEnum.OVAL]: '椭圆',
  [DataClassEnum.CAP]: '电容',
  [DataClassEnum.ECC]: '偏心度',
  [DataClassEnum.ANGLE]: '偏心角',
  [DataClassEnum.CONCEN]: '同心度',
  [DataClassEnum.CON]: '凹凸总数',
  [DataClassEnum.CUOD]: '导体线径',
  [DataClassEnum.CONC]: '凹计数',
  [DataClassEnum.CONV]: '凸计数',
  [DataClassEnum.LENGTH]: '计米',
  [DataClassEnum.LSPEED]: '线速',
  [DataClassEnum.SWITCH]: '开关',
  [DataClassEnum.SHAFT]: '换轴',
  [DataClassEnum.CLEAR]: '清零',
  [DataClassEnum.START]: '启动',
  [DataClassEnum.STOP]: '停止',
};

export const ParamClassNameMap: Record<number, string> = {
  [ParamClassEnum.Value]: '实际值',
  [ParamClassEnum.Std]: '设定值',
  [ParamClassEnum.Tol]: '公差',
  [ParamClassEnum.Utol]: '上公差',
  [ParamClassEnum.Ltol]: '下公差',
};
// export const UnilateralNameList = ['否', '没有下偏差', '没有上偏差']
export const PermissionNameList = ['只读', '只写', '读写']

export const deviceClassOptions = Object.keys(DeviceClassEnum)
  .filter((key) => isNaN(Number(key))) // 过滤掉数字键，只保留字符串定义的 Key
  .map((key) => ({
    // 这里我们可以定义一个映射表来处理中文 Label
    label: DeviceClassNameMap[DeviceClassEnum[key as keyof typeof DeviceClassEnum]],
    value: DeviceClassEnum[key as keyof typeof DeviceClassEnum],
  }));

export const paramClassOptions = Object.keys(ParamClassEnum)
  .filter((key) => isNaN(Number(key))) // 过滤掉数字键，只保留字符串定义的 Key
  .map((key) => ({
    // 这里我们可以定义一个映射表来处理中文 Label
    label: ParamClassNameMap[ParamClassEnum[key as keyof typeof ParamClassEnum]],
    value: ParamClassEnum[key as keyof typeof ParamClassEnum],
  }));

export const dataClassOptions = Object.keys(DataClassEnum)
  .filter((key) => isNaN(Number(key))) // 过滤掉数字键，只保留字符串定义的 Key
  .map((key) => ({
    // 这里我们可以定义一个映射表来处理中文 Label
    label: DataClassNameMap[DataClassEnum[key as keyof typeof DataClassEnum]],
    value: DataClassEnum[key as keyof typeof DataClassEnum],
  }));


// export const defConnectComForm: ConnectComModel = {
//   PortName: ``,
//   BaudRate: 9600,
//   DataBits: 8,
//   StopBits: 1,
//   Parity: 'N',
//   Cycle: 100,
//   Timeout: 500,
//   Endian32bit: '3412',
//   EndianString: '1234',
//   Endian16bit: '12'
// }