import { DataConfigEntity } from "~/me";

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
export const UnilateralNameList = ['标准', '没有下偏差', '没有上偏差']
export const UnilateralList = UnilateralNameList.map((e, i) => {
  return {
    label: e,
    value: i
  }
})
export const AlarmTypeNameList = ['离散点', '上升沿', '下降沿']
export const AlarmTypeList = AlarmTypeNameList.map((e, i) => {
  return {
    label: e,
    value: i
  }
})

export const limitList = ['只读', '只写', '读写']
export const limitRadioList = limitList.map((e, i) => {
  return {
    label: e,
    value: i
  }
})

export const defaultDataConfigForm: DataConfigEntity = {
  State: 0,
  Unilateral: 0,
  AlarmType: 0,
  Name: "",
  Unit: "",
  SortNum: 1,
  Precision: 0,
  DataType: 1,
  Distance:0
}