import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import { defineStore } from "pinia";
import { maxDataNumLocalKey } from "./enum";

let localMaxDataNum = getLocalStorage(maxDataNumLocalKey)
console.log("🚀 ~ file: innerData.ts:6 ~ localMaxDataNum:", localMaxDataNum,typeof localMaxDataNum == 'number' )
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
      startTime:Date.now(),
      samplingNum:1000, //降采样临界数据量
      curDataLength:0
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
    }
  }
})