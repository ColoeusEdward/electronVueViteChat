
import { formListItem } from "@/components/MyFormWrap/MyFormWrap";
const commonLHpostion32 = ['3412', '1234', '2143', '4321']
const commonLHpostionStr = ['12', '21']
const commonBaudrate = ['4800', '9600', '19200', '38400', '57600', '115200']
const commonBytesize = ["8", "7"]
const commonStopbits = ["1", "2"]
const commonParity = ["N", "O", "E"]

const commonMap = {
  LHpostion32: commonLHpostion32.map(e => ({ label: e, value: e })),
  LHpostionStr: commonLHpostionStr.map(e => ({ label: e, value: e })),
  LHpostion16: commonLHpostionStr.map(e => ({ label: e, value: e })),
  Baudrate: commonBaudrate.map(e => ({ label: e, value: e })),
  Bytesize: commonBytesize.map(e => ({ label: e, value: e })),
  Stopbits: commonStopbits.map(e => ({ label: e, value: e })),
  Parity: commonParity.map(e => ({ label: e, value: e })),
}

const defaultFormFn = (_this: typeof ModbusTCPMaster) => {
  let obj: Record<string, string> = {}
  _this.itemList.filter(e => e.type == 'select').forEach(e => {
    obj[e.prop] = _this.optionMap[e.prop][0].value
  })
  return obj
}

export const ModbusTCPMaster = {
  itemList: <formListItem[]>[
    { type: 'select', label: '设备接口', prop: 'DevInt', width: 6, rule: 'must' },
    { type: 'select', label: '32位解码顺序', prop: 'LHpostion32', width: 6 },
    { type: 'select', label: '字符串解码顺序', prop: 'LHpostionStr', width: 6 },
    { type: 'select', label: '16位解码顺序', prop: 'LHpostion16', width: 6 },
    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'input', label: '主机端IP', prop: 'ServerIp', width: 6 },
    { type: 'input', label: '端口', prop: 'ServerPort', width: 6 },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{
    DevInt: ['Net'].map(e => ({ label: e, value: e })),
    ...commonMap
  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}

export const DVPMaster = {
  itemList: <formListItem[]>[
    { type: 'select', label: '设备接口', prop: 'DevInt', width: 6, rule: 'must' },
    { type: 'select', label: '32位解码顺序', prop: 'LHpostion32', width: 6 },
    { type: 'select', label: '串口模式', prop: 'ComType', width: 6 },
    { type: 'select', label: '波特率', prop: 'Baudrate', width: 6 },
    { type: 'select', label: '数据位', prop: 'Bytesize', width: 6 },
    { type: 'select', label: '奇偶校验', prop: 'Parity', width: 6 },
    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'select', label: '停止位', prop: 'Stopbits', width: 6 },
    { type: 'switch', label: '透传使能', prop: 'Penetrate', width: 4, checkedValue: 1, uncheckedValue: 0 },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{
    DevInt: ['COM1', 'COM2', 'COM3', 'COM4'].map(e => ({ label: e, value: e })),
    ComType: ['RS232', 'RS485'].map(e => ({ label: e, value: e })),
    ...commonMap
  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}

export const ModbusASCIIMaster = {
  itemList: <formListItem[]>[
    { type: 'select', label: '设备接口', prop: 'DevInt', width: 6, rule: 'must' },
    { type: 'select', label: '32位解码顺序', prop: 'LHpostion32', width: 6 },
    { type: 'select', label: '字符串解码顺序', prop: 'LHpostionStr', width: 6 },
    { type: 'select', label: '16位解码顺序', prop: 'LHpostion16', width: 6 },
    { type: 'select', label: '串口模式', prop: 'ComType', width: 6 },
    { type: 'select', label: '波特率', prop: 'Baudrate', width: 6 },
    { type: 'select', label: '数据位', prop: 'Bytesize', width: 6 },
    { type: 'select', label: '奇偶校验', prop: 'Parity', width: 6 },
    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'select', label: '停止位', prop: 'Stopbits', width: 6 },
    { type: 'switch', label: '透传使能', prop: 'Penetrate', width: 4, checkedValue: 1, uncheckedValue: 0 },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{
    DevInt: ['COM1', 'COM2', 'COM3', 'COM4'].map(e => ({ label: e, value: e })),
    ComType: ['RS232', 'RS485'].map(e => ({ label: e, value: e })),
    ...commonMap
  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}
export const MQTT = {
  itemList: <formListItem[]>[
    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{

  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}

export const NSTZUMBACH = {
  itemList: <formListItem[]>[
    { type: 'select', label: '设备接口', prop: 'DevInt', width: 6, rule: 'must' },
    { type: 'select', label: '32位解码顺序', prop: 'LHpostion32', width: 6 },
    { type: 'select', label: '字符串解码顺序', prop: 'LHpostionStr', width: 6 },
    { type: 'select', label: '16位解码顺序', prop: 'LHpostion16', width: 6 },

    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'select', label: '停止位', prop: 'Stopbits', width: 6 },
    { type: 'input', label: '主机端IP', prop: 'ServerIp', width: 6 },
    { type: 'input', label: '端口', prop: 'ServerPort', width: 6 },
    { type: 'switch', label: '透传使能', prop: 'Penetrate', width: 4, checkedValue: 1, uncheckedValue: 0 },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{
    DevInt: ['NET', 'COM1', 'COM2', 'COM3', 'COM4'].map(e => ({ label: e, value: e })),
    ComType: ['RS232', 'RS485'].map(e => ({ label: e, value: e })),
    ...commonMap
  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}

export const OPCUAServer = {
  itemList: <formListItem[]>[
    { type: 'select', label: '设备接口', prop: 'DevInt', width: 6, rule: 'must' },
    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'input', label: '主机端IP', prop: 'ServerIp', width: 6 },
    { type: 'input', label: '端口', prop: 'ServerPort', width: 6 },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{
    DevInt: ['NET'].map(e => ({ label: e, value: e })),
    ComType: ['RS232', 'RS485'].map(e => ({ label: e, value: e })),
    ...commonMap
  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}

export const S71200TCP = {
  itemList: <formListItem[]>[
    { type: 'select', label: '设备接口', prop: 'DevInt', width: 6, rule: 'must' },
    { type: 'select', label: '32位解码顺序', prop: 'LHpostion32', width: 6 },
    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'input', label: '机架号', prop: 'frameNum', width: 6 },
    { type: 'input', label: '槽号', prop: 'grooveNum', width: 6 },
    { type: 'input', label: '主机端IP', prop: 'ServerIp', width: 6 },
    { type: 'input', label: '端口', prop: 'ServerPort', width: 6 },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{
    DevInt: ['NET'].map(e => ({ label: e, value: e })),
    ComType: ['RS232', 'RS485'].map(e => ({ label: e, value: e })),
    ...commonMap
  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}

export const S7200PPI = JSON.parse(JSON.stringify(DVPMaster)) as typeof ModbusTCPMaster
S7200PPI.optionMap.ComType = ['RS485'].map(e => ({ label: e, value: e }))

export const S7SmartTCP = {
  itemList: <formListItem[]>[
    { type: 'select', label: '设备接口', prop: 'DevInt', width: 6, rule: 'must' },
    { type: 'select', label: '32位解码顺序', prop: 'LHpostion32', width: 6 },
    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'input', label: '主机端IP', prop: 'ServerIp', width: 6 },
    { type: 'input', label: '端口', prop: 'ServerPort', width: 6 },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{
    DevInt: ['NET'].map(e => ({ label: e, value: e })),
    ...commonMap
  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}
export const ModbusTCPSlave = {
  itemList: <formListItem[]>[
    { type: 'select', label: '设备接口', prop: 'DevInt', width: 6, rule: 'must' },
    { type: 'select', label: '32位解码顺序', prop: 'LHpostion32', width: 6 },

    { type: 'input', label: '采集周期', prop: 'AcquCycle', width: 6, rule: 'must' },
    { type: 'switch', label: '透传使能', prop: 'Penetrate', width: 4, checkedValue: 1, uncheckedValue: 0 },
    { type: 'input', label: '从站地址', prop: 'SlaveId', width: 6 },
  ],
  optionMap: <Record<string, { label: string, value: string }[]>>{
    DevInt: ['NET'].map(e => ({ label: e, value: e })),
    ComType: ['RS232', 'RS485'].map(e => ({ label: e, value: e })),
    ...commonMap
  },
  get defaultForm(): Record<string, string> {
    return defaultFormFn(this)
  }
}

const proto: Record<string, typeof ModbusTCPMaster> = {
  ModbusTCPMaster,
  ModbusTCPSlave,
  DVPMaster,
  FatekFBs: DVPMaster,
  FinsHostLink: DVPMaster,
  FPMewtocol: DVPMaster,
  FxSerialMaster: DVPMaster,
  ModbusASCIIMaster,
  ModbusASCIISlave: ModbusASCIIMaster,
  ModbusRTUMaster: ModbusASCIIMaster,
  ModbusRTUSlave: ModbusASCIIMaster,
  MQTT,
  NSTIDCard: DVPMaster,
  NSTSIKORASC400: DVPMaster,
  NSTTAKIKAWA: DVPMaster,
  NSTZUMBACH,
  OPCUAClient: MQTT,
  OPCUAServer,
  S71200TCP,
  S7200PPI,
  S7SmartTCP,
}

export default proto
