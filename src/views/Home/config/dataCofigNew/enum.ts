import { DataConfigEntity } from "~/me";

const categoryClassObj: Record<string, string> = {
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


enum DataTypeEnum {
  Chart = 1,
  OnlyShow = 2,
  Length = 3,
  Switch = 4,
  Clear = 5,
  Shaft = 6,
  OnlyRecord = 7,
  Alarm = 8,
}
const dataTypeEnumNameList = [
  "曲线",
  "仅展示",
  "计米",
  "开关状态",
  "清零",
  "清零并换轴",
  "仅记录",
  "报警",
];
let DataTypeEnumKeyList = Object.keys(DataTypeEnum)
export const dataTypeEnumList = DataTypeEnumKeyList.slice(0, DataTypeEnumKeyList.length / 2).map((e, i) => {
  return {
    label: dataTypeEnumNameList[i],
    value: Number(e)
  }
})

export const UnilateralList = ['标准', '没有下偏差', '没有上偏差'].map((e, i) => {
  return {
    label: e,
    value: i
  }
})

export const AlarmTypeList = ['离散点', '上升沿', '下降沿'].map((e, i) => {
  return {
    label: e,
    value: i
  }
})

export const limitRadioList = [{ label: "只读", value: 0 }, { label: "只写", value: 1 }, { label: "读写", value: 2 }]

export const defaultDataConfigForm: DataConfigEntity = {
  State: 0,
  Unilateral: 0,
  AlarmType: 0,
  Name: "",
  Unit: "",
  SortNum: 1,
  Precision: 0,
  DataType: 1,
}