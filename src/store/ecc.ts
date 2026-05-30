import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import { RightValueType } from "@/views/Home/RightValueBlock";
import { defineStore } from "pinia" // 定义容器

export interface EccDataSource {
  Ecc?: RightValueType,
  OD?: RightValueType,
  CUOD?: RightValueType,
  Angel?: RightValueType

}
export const useEccStore = defineStore('ecc', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */

  state: () => {
    return {
      curEccMenuOption: getLocalStorage('curEccMenuOption', {}) as EccDataSource,

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
    // setDataSource(value: any) {
    //   this.dataSourceList = value;
    // },
    setCurEccMenuOption(value: any) {
      this.curEccMenuOption = value;
      setLocalStorage('curEccMenuOption', value)
    }

  }

})

