// 1. 先定义一个标准的语言包结构（通常以中文为基准）
export const zhCN = {
  common: {
    title: '欢迎使用本系统',
    login: '登录',
    logout: '退出'
  },
  menu: {
    config: '配置',
    log: '运行日志',
    lang: '语言',
    exit: '退出',
    maintain: '维护',
    prodTable: '产品表',
    trendChart: '趋势图',
    stopChart: '关',
    startChart: '开',
    printScreen: '屏幕打印',
    prodHistory: '产品历史',
    startPrint: '开始打印',
    recipe: '配方',
    start: '开始',
    stop: '停止',
    end: '结束',
    switchShaft: "换轴",
    cleanData: "清空数据",
    cleanAll: "全部清空",

    dataSource: '数据源',
    uploadLineShot: '上传当前曲线图',
    measureValue: '测量值',
    refreshConfig: "刷新配置",
    statisticsChart: '统计图',
    deviationMeter: '偏心仪',
    realTimeData: '实时数据',
    menu: '菜单',
  },
  data: {
    averageLine: '平均线径',
    deviation: "偏心度",
    deviationAngle: '偏心角',
    guideLine: '导体线径',
    average: '平均值',
    limitLow: '下限',
    limitHeight: '上限',
    standardDeviation: '标准偏差',
    max: '最大值',
    min: '最小值',
    standard: '标称值',
    accuracy: "精准度",
    deviationMius: "偏差",
    tolerance: '公差'

  },
  home: {
    welcome: '欢迎！'
  }
}


export type zhCNType = typeof zhCN
export default zhCN
