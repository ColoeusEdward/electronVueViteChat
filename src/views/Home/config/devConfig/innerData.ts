import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import { ConnectComModel, ConnectTcpModel, DeviceConfigEntity, DriverAddressType, DriverConnectType } from "~/me";
import { defaultData, defaultModbusAddressModel, driverInfo } from "./enum";

//内部数据
export const useDevCfgInnerData = defineStore('DevCfgInner', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      editShow: false,
      isEdit: false,
      curRow: null as DeviceConfigEntity | null,
      curRowKey: [] as string[],
      contentHeight: 100,
      resetFn: () => {},

      devConfigForm: {} as DeviceConfigEntity,
      connectCfgForm: {} as DriverConnectType,
      connectCfgFormShow: false,

      addressCfgFormShow: false,
      addressDataList: [] as DriverAddressType[],
      addressCfgForm: {} as DriverAddressType,
      addressIsEdit: false,
      curAddressRow: null as DriverAddressType | null,
      curAddressRowKey: [] as string[],
    }
  },
  /**
   * 用来封装计算属性 有缓存功能  类似于computed
   */
  getters: {
    devConfigFormGetter(state) {
      return state.devConfigForm
    },
  },
  /**
   * 编辑业务逻辑  类似于methods
   */
  actions: {
    setEditShow(val: boolean) {
      if(!val){
        this.setConnectCfgFormShow(false)
        this.setAddressCfgFormShow(false)
      }
      this.editShow = val
    },
    setIsEdit(val: boolean) {
      this.isEdit = val
    },
    setResetFn(val: () => void) {
      this.resetFn = val
    },
    setCurRow(val: DeviceConfigEntity | null) {
      this.curRow = val
    },
    setCurRowKey(val: string[]) {
      this.curRowKey = val
    },
    cleanCurRow() {
      this.curRow = null
      this.curRowKey = []
    },
    setContentHeight(val: number) {
      this.contentHeight = val
    },
    setDevConfigForm(val: DeviceConfigEntity) {
      this.devConfigForm = val
      // Object.assign(this.devConfigForm, val)
    },
    setConnectStrOfDevConfigForm(val: string) {
      this.devConfigForm.ConnectConfig = val
    },
    setAddressStrOfDevConfigForm(val: string) {
      this.devConfigForm.AddressConfigs = val
    },
    setConnectCfgForm(val: DriverConnectType) {
      this.connectCfgForm = val
    },
    setConnectCfgFormShow(val: boolean) {
      this.connectCfgFormShow = val
    },
    setAddressCfgFormShow(val: boolean) {
      this.addressCfgFormShow = val
    },
    setAddressDataList(val: DriverAddressType[]) {
      this.cleanAdressDataList()
      this.addressDataList.push(...val)
      // this.addressDataList = val
    },
    setAddressCfgForm(val: DriverAddressType) {
      Object.assign(this.addressCfgForm ,val)
    },
    setAddressIsEdit(val: boolean) {
      this.addressIsEdit = val
    },
    setCurAddressRow(val: DriverAddressType) {
      this.curAddressRow = val
    },
    setCurAddressRowKey(val: string[]) {
      this.curAddressRowKey = val
    },
    checkAddressDataListNotSame(key:string) {
      return this.addressDataList.every(e => e.DataName != key)
    },
    cleanDevConfig() {
      this.devConfigForm = {} as DeviceConfigEntity
      this.connectCfgForm = {} as DriverConnectType
      this.cleanAddressRow()
      this.cleanAdressDataList()
    },
    cleanAddressCfgForm() {
      let d = {} as DriverAddressType
      if(this.devConfigForm.DriverName){
        let addressType = driverInfo[this.devConfigForm.DriverName].addressType
        d = defaultData[`default${addressType}`] as DriverAddressType
      }
      Object.assign(this.addressCfgForm ,d)
      delete this.addressCfgForm.Id
    },
    cleanAdressDataList() {
      this.addressDataList.splice(-0)
    },
    cleanAddressRow() {
      this.curAddressRow = null
      this.curAddressRowKey = []
    }
  }
})