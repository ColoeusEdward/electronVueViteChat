import { defineStore } from "pinia";
import { CategoryNodeEntity, DataConfigEntity } from "~/me";


export const useDataCfgOutInnerDataStore = defineStore('DataCfgOutInnerData', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      curRow: null as DataConfigEntity | null,
      curRowKey: [] as string[],
      addFormShow:false,
      isEdit:false,
      editShow:false,
      getTbDataFn: () => {},

      nodeList:[] as CategoryNodeEntity[]
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
    setCurRow(row: DataConfigEntity | null) {
      this.curRow = row
    },
    setCurRowKey(key: string[]) {
      this.curRowKey = key
    },
    setGetTabDataFn(fn: () => void) {
      this.getTbDataFn = fn
    },
    cleanRow() {
      this.curRow = null
      this.curRowKey = []
    },
    setNodeList(list: CategoryNodeEntity[]){
      this.nodeList = list
    },
    setIsEdit(isEdit:boolean){
      this.isEdit = isEdit
    },
    setEditShow(editShow:boolean){
      this.editShow = editShow
    },


  }
})