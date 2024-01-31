import { DropdownProps } from "naive-ui";

export const menuOpt = [
  {label:''}
]

export const maxDataNumLocalKey = 'curcevMaxDataNum'

export const cpkModelPropName = {
  Std: "标准值",
  Usl: "上限",
  Lsl: "下限",
  Avg: "平均值",
  Max: "最大值",
  Min: "最小值",
  Sd: "标准差",
  Ca: "CA",
  Cp: "CP",
  Cpk: "CPK",
  CpkU: "上限边过程能力指数",
  CpkL: "下限边过程能力指数",
};

export const menuOptList:DropdownProps['options'] = [
  {label:'数据源',key:'dataSource',children:[]},
  {label:'上传当前曲线图',key:'uploadLineShot'}
]
export const menuPropEnum = {
  dataSource:'dataSource',
  uploadLineShot:'uploadLineShot'
}
export const menuIdSplit = '*'

export const nornameDisChartId='normalDisChart'

export const frontFnNameEnum = {
  startCollect:'startCollect',
  stopCollect:'stopCollect',
  testFn:'testFn',
}