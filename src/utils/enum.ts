const rootPathKey = 'rootPath'
//发布localstorage key
const PUBLISH_PROJECT_KEY = 'publishProject'

enum callFnName {
  getState = "getState",
  getSysConfigs = "getSysConfigs",
  saveSysConfigs = "saveSysConfigs",
  showDirSelect = "showDirSelect",
  getPrinterList = "getPrinterList",
  getDeviceConfigs = "getDeviceConfigs",
  saveDeviceConfig = "saveDeviceConfig",
  deleteDeviceConfig = "deleteDeviceConfig",
  getSupportDevices = "getSupportDevices",
  getCategoryNodes = "getCategoryNodes",
  saveCategoryNode = "saveCategoryNode",
  deleteCategoryNode = "deleteCategoryNode",
  getCategoryDatas = "getCategoryDatas",
  saveCategoryData = "saveCategoryData",
  deleteCategoryData = "deleteCategoryData",
  getDataConfigs = "getDataConfigs",
  saveDataConfig = "saveDataConfig",
  deleteDataConfig = "deleteDataConfig",
  initDataConfig = "initDataConfig",
  getFormulaConfigs = "getFormulaConfigs",
  getFormulaDatas = "getFormulaDatas",
  deleteFormulaConfig = "deleteFormulaConfig",
  getProductStatistics = "getProductStatistics",
  getProductLogs = "getProductLogs",
  deleteProductHistory = "deleteProductHistory",
  getSerialNos = "getSerialNos",
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
  saveFormulaConfig = `saveFormulaConfig`,activeFormulaConfig='activeFormulaConfig',getProductHistorys='getProductHistorys',stopCollect="stopCollect",
  getSpanCollectPoints = `getSpanCollectPoints`,getNormalDistribution='getNormalDistribution',clearCollect='clearCollect',
  getFFT = `getFFT`
}

export {
  rootPathKey, PUBLISH_PROJECT_KEY, callFnName
}