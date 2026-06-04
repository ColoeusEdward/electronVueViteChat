import { DataConfigEntity } from "~/me";
import i18n from "@/i18n";

const t = i18n.global.t

export const categoryClassObj: Record<string, string> = {
  "Value": "数据值",
  "Std": "规格标准值",
  "Usl": "规格上限",
  "Lsl": "规格下限",
  "Utl": "规格上公差",
  "Ltl": "规格下公差",
  "Avg": "平均值",
  "Max": "最大值",
  "Min": "最小值",
  "Sd": "均方差",
  "Ca": "准确度",
  "Cp": "稳定度",
  "Cpk": "过程能力指数"
}
export const categoryClassList = Object.keys(categoryClassObj).map(e => {
  return {
    label: categoryClassObj[e],
    value: e
  }
})


export enum DataTypeEnum {
  Chart = 1,
  OnlyShow = 2,
  Length = 3,
  Switch = 4,
  Clear = 5,
  Shaft = 6,
  OnlyRecord = 7,
  Alarm = 8,
  FFT = 9,
}
export const DataTypeOnIndex = [DataTypeEnum.Chart, DataTypeEnum.FFT] //展示在首页左半部分的数据类型
export const DataTypeOnRight = [DataTypeEnum.OnlyRecord, DataTypeEnum.OnlyShow, DataTypeEnum.Length] //展示在首页右半部分的数据类型
export const dataTypeEnumNameList = [
  "曲线",
  "仅展示",
  "计米",
  "开关状态",
  "清零",
  "清零并换轴",
  "仅记录",
  "报警",
  "FFT",
];
let DataTypeEnumKeyList = Object.keys(DataTypeEnum)
export const dataTypeEnumList = DataTypeEnumKeyList.slice(0, DataTypeEnumKeyList.length / 2).map((e, i) => {
  return {
    label: dataTypeEnumNameList[i],
    value: Number(e)
  }
})
export const getUnilateralNameList = () => [t('config.standard'), t('config.noLowerDeviation'), t('config.noUpperDeviation')]
export const UnilateralNameList = getUnilateralNameList()
export const getUnilateralList = () => getUnilateralNameList().map((e, i) => {
  return {
    label: e,
    value: i
  }
})
export const UnilateralList = getUnilateralList()
export const getAlarmTypeNameList = () => [t('config.discretePoint'), t('config.risingEdge'), t('config.fallingEdge')]
export const AlarmTypeNameList = getAlarmTypeNameList()
export const getAlarmTypeList = () => getAlarmTypeNameList().map((e, i) => {
  return {
    label: e,
    value: i
  }
})
export const AlarmTypeList = getAlarmTypeList()

export const getLimitList = () => [t('config.readOnly'), t('config.writeOnly'), t('config.readWrite')]
export const limitList = getLimitList()
export const getLimitRadioList = () => getLimitList().map((e, i) => {
  return {
    label: e,
    value: i
  }
})
export const limitRadioList = getLimitRadioList()

export const defaultDataConfigForm: DataConfigEntity = {
  State: 0,
  Unilateral: 0,
  AlarmType: 0,
  Name: "",
  Unit: "",
  SortNum: 1,
  Precision: 0,
  DataType: 1,
  Distance: 0
}

// 刷新所有国际化文本的函数
export const refreshDataCofigNewEnums = () => {
  // 刷新 UnilateralNameList
  const newUnilateralNameList = getUnilateralNameList()
  UnilateralNameList.length = 0
  UnilateralNameList.push(...newUnilateralNameList)

  // 刷新 UnilateralList
  const newUnilateralList = getUnilateralList()
  UnilateralList.length = 0
  UnilateralList.push(...newUnilateralList)

  // 刷新 AlarmTypeNameList
  const newAlarmTypeNameList = getAlarmTypeNameList()
  AlarmTypeNameList.length = 0
  AlarmTypeNameList.push(...newAlarmTypeNameList)

  // 刷新 AlarmTypeList
  const newAlarmTypeList = getAlarmTypeList()
  AlarmTypeList.length = 0
  AlarmTypeList.push(...newAlarmTypeList)

  // 刷新 limitList
  const newLimitList = getLimitList()
  limitList.length = 0
  limitList.push(...newLimitList)

  // 刷新 limitRadioList
  const newLimitRadioList = getLimitRadioList()
  limitRadioList.length = 0
  limitRadioList.push(...newLimitRadioList)
}