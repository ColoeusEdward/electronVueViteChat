import { defineStore } from "pinia";
import { SerialNoEntity, SysConfigEntity } from "~/me";


export const useSysCfgInnerDataStore = defineStore('SysCfgInnerData', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      curRow: null as SerialNoEntity | null,
      curRowKey: [] as string[],
      addFormShow:false,
      tableLength:0,
      getTbDataFn:() => {}
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
    setCurRow(val: SerialNoEntity | null) {
      this.curRow = val
    },
    setCurRowKey(val: string[]) {
      this.curRowKey = val
    },
    cleanRow() {
      this.curRow = null
      this.curRowKey = []
    },
    setAddFormShow(val:boolean){
      this.addFormShow = val
    },
    setTalbeLength(val:number){
      this.tableLength = val
    },
    setGetTbDataFn(val:() => void){
      this.getTbDataFn = val
    }

  }
})