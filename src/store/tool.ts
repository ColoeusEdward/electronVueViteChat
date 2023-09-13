import { defineStore } from "pinia";

export type toolStateType = {
  rootPath: string
}

export const useToolStore = defineStore('tool', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: (): toolStateType => {
    return {
      rootPath: '',  //项目根路径
    }
  },
  /**
   * 用来封装计算属性 有缓存功能  类似于computed
   */
  getters: {
    getRootPath(): toolStateType['rootPath'] {
      return this.rootPath
    }
  },
  /**
   * 编辑业务逻辑  类似于methods
   */
  actions: {
    setRootPath(value: toolStateType['rootPath']) {
      this.rootPath = value
    }

  }
})
