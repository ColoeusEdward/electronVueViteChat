const rootPathKey = 'rootPath'
//发布localstorage key
const PUBLISH_PROJECT_KEY = 'publishProject'

enum callFnName {
  getState = "getState",
  GetSysConfigs = "GetSysConfigs",
  SaveSysConfig = "SaveSysConfig",
  ShowDirSelect = "ShowDirSelect",
  GetPrinterList = "GetPrinterList",
  getDeviceConfigs = "getDeviceConfigs",
  saveDeviceConfig = "saveDeviceConfig",
  deleteDeviceConfig = "deleteDeviceConfig",
  getSupportDevices = "getSupportDevices",
  GetCategoryNodes = "GetCategoryNodes",
  saveCategoryNode = "saveCategoryNode",
  deleteCategoryNode = "deleteCategoryNode",
  GetCategoryDatas = "GetCategoryDatas",
  saveCategoryData = "saveCategoryData",
  deleteCategoryData = "deleteCategoryData",
  GetDataConfigs = "GetDataConfigs",
  saveDataConfig = "saveDataConfig",
  deleteDataConfig = "deleteDataConfig",
  initDataConfig = "initDataConfig",
  getFormulaConfigs = "getFormulaConfigs",
  getFormulaDatas = "getFormulaDatas",
  deleteFormulaConfig = "deleteFormulaConfig",
  getProductStatistics = "getProductStatistics",
  getProductLogs = "getProductLogs",
  deleteProductHistory = "deleteProductHistory",
  GetSerialNos = "GetSerialNos",
  saveSerialNo = "saveSerialNo",
  deleteSerialNo = "deleteSerialNo",
  getNewSerialNo = "getNewSerialNo",
  getFullCollectPoints = "getFullCollectPoints",
  getCpkData = "getCpkData",
  startSpcSystem = 'startSpcSystem',
  closeApp = 'closeApp',
  showDevTools = 'showDevTools',
  closeSpcSystem = `closeSpcSystem`,
  startCollect = `startCollect`,
  openDevTool = `openDevTool`,
  saveFormulaConfig = `saveFormulaConfig`, activeFormulaConfig = 'activeFormulaConfig', getProductHistorys = 'getProductHistorys', stopCollect = "stopCollect",
  getSpanCollectPoints = `getSpanCollectPoints`, getNormalDistribution = 'getNormalDistribution', clearCollect = 'clearCollect',
  getFFT = `getFFT`, showKeyBoard = `showKeyBoard`, initKeyboardConfig = `initKeyboardConfig`, checkRegister = `checkRegister`, getMachineCode = `getMachineCode`, getRegisterState = `getRegisterState`, getRegisterCode = `getRegisterCode`, KeyPress = `KeyPress`, KeyDown = `KeyDown`, KeyUp = `KeyUp`, getLastPoint = `getLastPoint`
}

export {
  rootPathKey, PUBLISH_PROJECT_KEY, callFnName
}