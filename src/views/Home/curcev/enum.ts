import { DropdownProps } from "naive-ui";
import { useI18n } from "vue-i18n";

export const menuOpt = [
  { label: '' }
]

export interface MenuOptType {
  label: string,
  key: string,
  trueKey?: string,
  children?: MenuOptType[]
}

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

export const CPKEntityPropName = {
  Standard: "标准值",
  Utol: "上公差",
  Ltol: "下公差",
  UpperLimit: "上限",
  LowerLimit: "下限",
  Average: "平均值",
  Maximum: "最大值",
  Minimum: "最小值",
  StdDev: "标准差",
  CA: "CA",
  CP: "CP",
  CPK: "CPK",
}

export const menuOptList: DropdownProps['options'] = [
  { label: '数据源', key: 'dataSource', children: [] },
  { label: '上传当前曲线图', key: 'uploadLineShot' }
]
export const getMenuOptList1 = (t: ReturnType<typeof useI18n>['t']): DropdownProps['options'] => {
  return [
    { label: t('menu.trendChart'), key: 'trendChart', },
    { label: t('menu.shape'), key: 'shape', },
    { label: t('menu.dataSource'), key: 'dataSource', children: [] },
    { label: t('menu.uploadLineShot'), key: 'uploadLineShot' }
  ]
}
export const getMenuOptList = (t: ReturnType<typeof useI18n>['t']): DropdownProps['options'] => {
  return [
    { label: t('menu.dataSource'), key: 'dataSource', children: [] },
    { label: t('menu.uploadLineShot'), key: 'uploadLineShot' }
  ]
}
export const menuPropEnum = {
  dataSource: 'dataSource',
  uploadLineShot: 'uploadLineShot',
  trendChart: 'trendChart',
  shape: 'shape'
}
export const menuIdSplit = '*'

export const nornameDisChartId = 'normalDisChart'
export const fftChartId = 'fftChart'

export const frontFnNameEnum = {
  startCollect: 'startCollect',
  stopCollect: 'stopCollect',
  testFn: 'testFn',
}