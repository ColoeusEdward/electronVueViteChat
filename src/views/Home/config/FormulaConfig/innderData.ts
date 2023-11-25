import { defineStore } from "pinia";
import { FormulaConfigEntity, FormulaDataEntity } from "~/me";


export const useFormulaCfgInnerDataStore = defineStore('FormulaCfgInnerData', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      curRow: null as FormulaConfigEntity | null,
      curRowKey: [] as string[],
      addFormShow:false,
      dataFormShow:false,
      getTbDataFn: () => {},

      curDataRow: null as FormulaDataEntity | null,
      curDataRowKey: [] as string[],
      dataIsEdit:false,
      getDataTbDataFn: () => {},
      dataList:[] as FormulaDataEntity[],
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
    setCurRow(row: FormulaConfigEntity | null) {
      this.curRow = row
    },
    setCurRowKey(key: string[]) {
      this.curRowKey = key
    },
    cleanRow() {
      this.curRow = null
      this.curRowKey = []
    },
    setAddFormShow(val:boolean){
      this.addFormShow = val
    },
    setDataFormShow(val:boolean){
      this.dataFormShow = val
    },
    setGetTabDataFn(fn: () => void) {
      this.getTbDataFn = fn
    },
    cleanShow(){
      this.addFormShow = false
      this.dataFormShow = false
    },
    setCurDataRow(row: FormulaDataEntity | null) {
      this.curDataRow = row
    },
    setCurDataRowKey(key: string[]) {
      this.curDataRowKey = key
    },
    cleanDataRow() {
      this.curDataRow = null
      this.curDataRowKey = []
    },
    setDataIsEdit(val:boolean){
      this.dataIsEdit = val
    },
    setGetDataTbDataFn(fn: () => void) {
      this.getDataTbDataFn = fn
    },
    setDataList(list:FormulaDataEntity[]){
      this.dataList = list
    }

  }
})