import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import { defineStore } from "pinia";
import { CpkModel, DataConfigEntity, SysConfigEntity } from "~/me";
import { maxDataNumLocalKey } from "./enum";

let localMaxDataNum = getLocalStorage(maxDataNumLocalKey)
console.log("🚀 ~ file: innerData.ts:6 ~ localMaxDataNum:", localMaxDataNum, typeof localMaxDataNum == 'number')
export const useCurcevInnerDataStore = defineStore('CurcevInnerData', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      isGetting: false, //是否开始采集
      maxDataNum: typeof localMaxDataNum == 'number' ? localMaxDataNum : 100000, //最大显示数据量
      startTime: Date.now(),
      samplingNum: 1000, //降采样临界数据量
      curDataLength: 0,
      dataCfgList: [] as DataConfigEntity[],
      curDataCfgEntity: null as DataConfigEntity | null | undefined, //当前数据源实体
      curCpk: null as CpkModel | null,
      curCpkKey: null as {
        name: string;
        title: string;
        value: string;
      } | null,  //当前主屏展示的cpk 选项option
      normalDisShow:false,
      curNewVal:0,      //当前最新实时值
      curProductCode:'',
      sysConfig:{} as SysConfigEntity[],
      getCpkFn: () => {},
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
    setIsGetting(val: boolean) {
      this.isGetting = val
    },
    setMaxDataNum(val: number) {
      this.maxDataNum = val
      setLocalStorage(maxDataNumLocalKey, val)
    },
    setStartTime(val: number) {
      this.startTime = val
    },
    setCurDataLength(val: number) {
      this.curDataLength = val
    },
    setDataCfgList(val: DataConfigEntity[]) {
      this.dataCfgList = val
    },
    setCurDataCfgEntity(val: DataConfigEntity | null | undefined) {
      this.curDataCfgEntity = val
    },
    setCurCpk(val: CpkModel | null) {
      this.curCpk = val
    },
    setCurCpkKey(val: {
      name: string;
      title: string;
      value: string;
    } | null) {
      this.curCpkKey = val
    },
    setNormalDisShow(val:boolean){
      this.normalDisShow = val
    },
    setCurNewVal(val:number){
      this.curNewVal = val
    },
    setCurProductCode(val:string){
      this.curProductCode = val
    },
    setSysConfig(val:SysConfigEntity[]){
      this.sysConfig = val
    },
    setGetCpkFn(val: () => {}) {
      this.getCpkFn = val
    }
  }
})