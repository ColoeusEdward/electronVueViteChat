import { defineStore } from "pinia" // 定义容器


export const useRealTimeStore = defineStore('useRealtime', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      diameterData: <any[]>[],
      rightRealTimeData: <any[]>[],
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
    fetchDiameterData() {
      let randomData = () => {
        now = new Date(+now + oneDay);
        value = value + Math.random() * 21 - 10;
        return {
          name: now.toString(),
          value: [
            +now,
            Math.round(value)
          ]
        };
      }
      let now = new Date();
      let oneDay = 1000;
      let value = Math.random() * 1000;
      if (this.diameterData.length > 1000) {
        this.diameterData.shift();
      }
      this.diameterData.push(randomData());
    },
    

  }

})
