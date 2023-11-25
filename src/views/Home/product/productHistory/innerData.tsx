import { defineStore } from "pinia";
import { ProductHistoryEntity } from "~/me";


export const useProductHistoryInnerDataStore = defineStore('ProductHistoryInnerData', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      curRow: null as ProductHistoryEntity | null,
      curRowKey: [] as string[],
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
    setCurRow(row: ProductHistoryEntity | null) {
      this.curRow = row
    },
    setCurRowKey(key: string[]) {
      this.curRowKey = key
    },
    
  }
})