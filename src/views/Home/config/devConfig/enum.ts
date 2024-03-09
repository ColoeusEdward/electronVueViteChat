import { formListItem } from "@/components/MyFormWrap/MyFormWrap"
import { generateUUID } from "@/utils/utils"
import { ConnectTcpModel, DriverAddressType, DriverConnectType, DriverInfo, ModbusAddressModel } from "~/me"
import { useDevCfgInnerData } from "./innerData"

export const adressSubmitFn = (form: DriverAddressType, innerData: ReturnType<typeof useDevCfgInnerData>) => {
  if (!form.Id && !innerData.checkAddressDataListNotSame(form.DataName)) {
    window.$message.warning('该数据名称已存在')
    return
  }
  if (!form.Id) {
    // form.Id =
    form.Id = generateUUID()
    innerData.addressDataList.push(form)
  } else {
    const index = innerData.addressDataList.findIndex(e => e.Id == form.Id)
    innerData.addressDataList.splice(index, 1, form)
  }
  innerData.cleanAddressRow()
  innerData.setAddressCfgFormShow(false)
}

export const devStateList = [
  '不可用',
  '可用',
]

export const Endian32BitList = [
  '3412',
  '1234',
  '2143',
  '4321',
].map(e => ({
  label: e,
  value: e
}))

export const AreaList = [
  "[0区]线圈状态",
  "[1区]输入状态",
  "[3区]输入寄存器",
  "[4区]保持寄存器"
].map(e => ({
  label: e,
  value: e
}))

export const DataTypeList = ["[1位]布尔型", "[16位]无符号整数", "[16位]有符号整数", "[32位]无符号整数", "[32位]有符号整数", "[32位]浮点数", "[8位]ASCII字符"]
  .map(e => ({
    label: e,
    value: e
  }))

export const defaultConnectTcpModel: ConnectTcpModel = {
  Host: `127.0.0.1`,
  Port: 502,
  SlaveId: 1,
  Endian32Bit: '3412',
  Cycle: 100,
  Timeout: 500,
  Endian16Bit: '21'
}
export const defaultModbusAddressModel: ModbusAddressModel = {
  Area: "[4区]保持寄存器",
  DataType: "[16位]无符号整数",
  ExchangeData: "[32位]浮点数",
  EndianBit: "",
  Index: 0,
  Length: 1,
  CountFormula: "",
  DataName: ""
}
export const defaultData: Record<string, DriverConnectType | DriverAddressType> = {
  defaultConnectTcpModel, defaultModbusAddressModel
}

export const driverInfo = {} as Record<string, DriverInfo>
driverInfo[`Modbus Tcp Client`] = {
  connectType: 'ConnectTcpModel',
  // connectTypeDefaultData:defaultConnectTcpModel,
  addressType: 'ModbusAddressModel',
  // addressTypeDefaultData:defaultModbusAddressModel
}
driverInfo[`Test FFTC lient`] = {
  connectType: 'ConnectTcpModel',
  addressType: 'ModbusAddressModel',
  // connectType: 'ConnectFFTModel',
  // addressType: 'ModbusAddressModel',
  
}

export enum propNameEnum {
  Host = 'Host',
  Port = 'Port',
  Endian32Bit = 'Endian32Bit',
  PortName = 'PortName',
  BaudRate = 'BaudRate',
  DataBits = 'DataBits',
  StopBits = 'StopBits',
  Parity = 'Parity',
  SlaveId = 'SlaveId',
  Cycle = 'Cycle',
  Timeout = 'Timeout',
  Endian32bit = 'Endian32bit',
  EndianString = 'EndianString',
  DataName = 'DataName',
  Area = 'Area',
  Index = 'Index',
  Length = 'Length',
  DataType = 'DataType',
  CountFormula = 'CountFormula',
  ExchangeData = 'ExchangeData',
  EndianBit = 'EndianBit',
  Endian16Bit = 'Endian16Bit'
}
export const propNameMap: Record<string, string> = {
}
propNameMap[propNameEnum.Host] = 'IP地址'
propNameMap[propNameEnum.Port] = '端口'
propNameMap[propNameEnum.SlaveId] = '从站地址'
propNameMap[propNameEnum.Endian32Bit] = '32位高低位'
propNameMap[propNameEnum.Cycle] = '采集周期'
propNameMap[propNameEnum.Timeout] = '通讯接口超时'
propNameMap[propNameEnum.DataName] = '数据名称'
propNameMap[propNameEnum.Area] = '寄存器区域'
propNameMap[propNameEnum.Index] = '起始地址'
propNameMap[propNameEnum.Length] = '寄存器个数'
propNameMap[propNameEnum.DataType] = '数据类型'
propNameMap[propNameEnum.CountFormula] = '数据转换公式'
propNameMap[propNameEnum.ExchangeData] = '变换后的类型'
propNameMap[propNameEnum.EndianBit] = '交换数据高低位'
propNameMap[propNameEnum.Endian16Bit] = '16位高低位'
propNameMap[propNameEnum.PortName] = '串口名'
propNameMap[propNameEnum.BaudRate] = '波特率'
propNameMap[propNameEnum.DataBits] = '数据位'
propNameMap[propNameEnum.StopBits] = '停止位'
propNameMap[propNameEnum.Parity] = '校验位'
propNameMap[propNameEnum.EndianString] = '字符串高低位'


const mapLabelAndProp = (str: string) => {
  return {
    label: propNameMap[str],
    prop: str
  }
}
export const commonFormItemListMap: Record<string, formListItem> = {
}
commonFormItemListMap[propNameEnum.Host] = { type: 'input', ...mapLabelAndProp(propNameEnum.Host), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.Port] = { type: 'input', ...mapLabelAndProp(propNameEnum.Port), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.SlaveId] = { type: 'input', ...mapLabelAndProp(propNameEnum.SlaveId), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.Endian32Bit] = { type: 'select', ...mapLabelAndProp(propNameEnum.Endian32Bit), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.Cycle] = { type: 'input', ...mapLabelAndProp(propNameEnum.Cycle), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.Timeout] = { type: 'input', ...mapLabelAndProp(propNameEnum.Timeout), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.DataName] = { type: 'input', ...mapLabelAndProp(propNameEnum.DataName), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.Area] = { type: 'select', ...mapLabelAndProp(propNameEnum.Area), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.Index] = { type: 'input', ...mapLabelAndProp(propNameEnum.Index), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.Length] = { type: 'input', ...mapLabelAndProp(propNameEnum.Length), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.DataType] = { type: 'select', ...mapLabelAndProp(propNameEnum.DataType), width: 12, rule: ['must'] }
commonFormItemListMap[propNameEnum.CountFormula] = { type: 'input', ...mapLabelAndProp(propNameEnum.CountFormula), width: 12, }
commonFormItemListMap[propNameEnum.ExchangeData] = { type: 'select', ...mapLabelAndProp(propNameEnum.ExchangeData), width: 12,}
commonFormItemListMap[propNameEnum.EndianBit] = { type: 'select', ...mapLabelAndProp(propNameEnum.EndianBit), width: 12, rule: ['must'] }




