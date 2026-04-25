import { tabNameEnum } from "@/views/Home/config/devConfigNew/enum";
import { DropdownProps } from "naive-ui";
import { defineStore } from "pinia" // 定义容器
import { v4 as uuidv4 } from 'uuid';
import { DataGroupEntity, DeviceConfigEntity, ModbusAdressRow, SysConfigEntity, SysConfigModel } from "~/me";
type connectConfig = {
  data: Record<string, string>[]
}
type connectDev = connectConfig
type dataConfig = {
  histConfig: Record<string, string>,
  alarmCondiList: Record<string, string>[],
  OPCUATopForm: Record<string, string>,
}

const localConnect = JSON.parse(localStorage.getItem('connect') || 'null') || {
  data: <Record<string, string>[]>[],
}
const localConnectDev = JSON.parse(localStorage.getItem('connectDev') || 'null') || {
  data: <Record<string, string>[]>[],
}

const localDataConfig = JSON.parse(localStorage.getItem('dataConfig') || 'null') || {
  histConfig: <Record<string, string>>{},
  alarmCoodiList: <Record<string, string>[]>[],
  OPCUATopForm: <Record<string, string>>{},
}
const defaultTab = tabNameEnum.sysConfig

export const useConfigStore = defineStore('config', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */

  state: () => {
    return {
      isShowConfig: false,
      productHistoryShow: false,
      productLogShow: false,
      formulaCfgShow: false,
      connect: localConnect as connectConfig,
      dataConfig: localDataConfig as dataConfig,
      connectDev: localConnectDev as connectDev,

      sysConfig: {} as SysConfigModel,
      originSysConfig: [] as SysConfigEntity[],
      configTab: defaultTab,

      allSubmitCount: 0,
      // curTabValue: 'sysConfig',

      curDevConfigRow: null as DeviceConfigEntity | null,
      addressShow: false,
      addressFormShow: false,
      curAddressRow: null as ModbusAdressRow | null,
      updateAdressRowFn: () => { },
      addFormShow: false,
      updateDevConfigRowFn: () => { },
      isAdressAddMore: false,
      curDataGroupRow: null as DataGroupEntity | null,

      DevChooseShow: false,
      AdressChooseShow: false,
      updateDataGroupRowFn: () => { },

      dataGroupAddFromShow: false,
    }
  },
  /**
   * 用来封装计算属性 有缓存功能  类似于computed
   */
  getters: {

  },
  /**
   * 编辑业务逻辑  类似于methods
   */
  actions: {
    saveConnectConfig() {
      localStorage.setItem('connect', JSON.stringify(this.connect))
    },
    saveDataConfig() {
      localStorage.setItem('dataConfig', JSON.stringify(this.dataConfig))
    },
    setIsShowConfig(value: boolean) {
      this.isShowConfig = value
    },
    setConnect(value: any) {
      this.connect = value
    },
    addConnectData(row: Record<string, string>) {
      this.connect.data.push(row)
      this.saveConnectConfig()
    },
    delConnectRow(id: string) {
      this.connect.data = this.connect.data.filter(item => item.id !== id)
      this.saveConnectConfig()
    },
    editConnectRow(row: Record<string, string>) {
      this.connect.data = this.connect.data.map(item => item.id === row.id ? row : item)
      this.saveConnectConfig()
    },
    setAlarmCondiData(value: Record<string, string>[]) {
      this.dataConfig.alarmCondiList = value
      this.saveDataConfig()
    },
    // addConnectDevData(row: Record<string, string>) {
    //   this.connectDev.data.push(row)
    //   this.saveConnectDev()
    // }
    // addAlarmCondiData(row: Record<string, string>) {
    //   this.dataConfig.alarmCondiList.push(row)
    //   this.saveDataConfig()
    // },
    // delAlarmCondiRow(id: string) {
    //   this.connect.data = this.connect.data.filter(item => item.id !== id)
    //   this.saveDataConfig()
    // },
    // editAlarmCondiRow(row: Record<string, string>) {
    //   this.connect.data = this.connect.data.map(item => item.id === row.id ? row : item)
    //   this.saveConnectConfig()
    // },
    setHistConfig(value: Record<string, string>) {
      this.dataConfig.histConfig = value
      this.saveDataConfig()
    },
    setOPCUATopForm(value: Record<string, string>) {
      this.dataConfig.OPCUATopForm = value
      this.saveDataConfig()
    },
    setSysConfig(value: SysConfigModel) {
      this.sysConfig = value
    },
    setOriginSysConfig(value: SysConfigEntity[]) {
      this.originSysConfig = value
    },
    setProductHistoryShow(value: boolean) {
      this.productHistoryShow = value
    },
    setProductLogShow(value: boolean) {
      this.productLogShow = value
    },
    setFormulaCfgShow(value: boolean) {
      this.formulaCfgShow = value
    },
    setConfigTab(value: string) {
      this.configTab = value
    },
    addSubmitCount() {
      this.allSubmitCount++
    },
    setCurDevConfigRow(value: DeviceConfigEntity | null) {
      this.curDevConfigRow = value
    },
    setAddressShow(value: boolean) {
      this.addressShow = value
    },
    setAddressFormShow(value: boolean) {
      this.addressFormShow = value
    },
    setCurAddressRow(value: ModbusAdressRow | null) {
      this.curAddressRow = value
    },
    setUpdateAdressRowFn(value: () => void) {
      this.updateAdressRowFn = value
    },
    setAddFormShow(value: boolean) {
      this.addFormShow = value
    },
    setUpdateDevConfigRowFn(value: () => void) {
      this.updateDevConfigRowFn = value
    },
    setIsAdressAddMore(value: boolean) {
      this.isAdressAddMore = value
    },
    setCurDataGroupRow(value: DataGroupEntity | null) {
      this.curDataGroupRow = value
    },
    setDevChooseShow(value: boolean) {
      this.DevChooseShow = value
    },
    setAdressChooseShow(value: boolean) {
      this.AdressChooseShow = value
    },
    setUpdateDataGroupRowFn(value: () => void) {
      this.updateDataGroupRowFn = value
    },
    setDataGroupAddFromShow(value: boolean) {
      this.dataGroupAddFromShow = value
    },
  }


})

