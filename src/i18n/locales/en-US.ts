// 2. 利用 TS 的 typeof 特性，让英文包强制继承中文的结构
import type { zhCN } from './zh-CN'

const enUS: typeof zhCN = {
  common: {
    title: 'Welcome to the system',
    login: 'Login',
    logout: 'Logout'
  },
  menu: {
    config: 'Config', // 或者简写为 'Config'
    log: 'Logs',             // 或者 'Run Logs' / 'Operation Logs'
    lang: 'Language',
    exit: 'Exit',
    maintain: 'Maintenance',
    prodTable: 'Product Table',
    trendChart: 'Trend Chart',
    stopChart: 'Off',         // 如果是指运行状态停止，也可以用 'Stop'
    startChart: 'On',         // 如果是指运行状态启动，也可以用 'Start'
    printScreen: 'Print Screen', // 或 'Screenshot' (截屏)
    prodHistory: 'Product History',
    startPrint: 'Start Print',   // 或 'Print'
    recipe: 'Recipe',
    start: 'Start',
    stop: 'Stop',
    end: 'End',
    cleanAll: "Clean All",
    switchShaft: "Switch Shaft",
    cleanData: "Clean Data",
    dataSource: 'Data Source',
    uploadLineShot: 'Upload Chart Graph', // 也可以用 'Upload Current Chart' 或 'Upload Graph'
    measureValue: 'Value',      // 或 'Measurement'
    refreshConfig: 'Refresh Config',
    statisticsChart: 'Statistical Chart',  // 或 'Statistics Chart'
    deviationMeter: 'Eccentricity Meter',  // 工业/测量领域的“偏心仪”标准译法
    menu: 'Menu',
    realTimeData: 'RealTime Data',
  },
  data: {
    averageLine: 'Average Diameter',     // 线缆行业中“线径”一般用 Diameter
    deviation: 'Eccentricity',           // 结合前面的偏心仪，偏心度标准译法是 Eccentricity
    deviationAngle: 'Eccentricity Angle',
    guideLine: 'Conductor Diameter',     // “导体线径”标准工业译法
    average: 'Average',                  // 或 'Mean'
    limitLow: 'Lower Limit',             // 或 'LSL' (Lower Specification Limit)
    limitHeight: 'Upper Limit',          // 修正了原 key 的 Height 拼写，一般对应 Upper Limit 或 'USL'
    standardDeviation: 'Standard Deviation',
    max: 'Maximum',                      // 或简写 'Max'
    min: 'Minimum',                      // 或简写 'Min'
    standard: 'Nominal Value',           // 工业/工程中的“标称值/标准值”通常用 Nominal Value
    accuracy: 'Accuracy',
    deviationMius: 'Deviation',           // “偏差”用 Deviation 即可
    tolerance: 'Tolerance',
  },
  home: {
    welcome: 'Hello!'
  }
}

export default enUS