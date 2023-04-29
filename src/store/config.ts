import { DropdownProps } from "naive-ui";
import { defineStore } from "pinia" // 定义容器
import { v4 as uuidv4 } from 'uuid';


export const useConfigStore = defineStore('config', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */

  state: () => {
    return {
      isShowConfig:false,
      connect:{
        data:[{Name:'test',id:uuidv4()}],
      }
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
   setIsShowConfig(value: boolean) {
     this.isShowConfig = value
   },
   setConnect(value: any) {
     this.connect = value
   }
  }

})

