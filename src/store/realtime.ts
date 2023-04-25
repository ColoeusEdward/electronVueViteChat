import { defineStore } from "pinia" // 定义容器
import { useTrendStore } from "./trendStore"

const rightRealTimeData: Record<string, any> = {
  'diameter1-diameter1': {
    label: '直径1',
    value: 0.0048,
    unit: 'mm',
    // stand:[`公差: +0.00500 ${unit} / -0.00500 ${unit}`,`偏差: 0.00428 mm`,`X = 0.00522 mm Y = 0.00535 mm`,`椭圆度: 0.00072 mm`,`H = -0.02418 mm V = -0.04375 mm`,`标称值: 0.00150 mm`],            //标准值
    get stand() {
      return [`公差: +0.00500 ${this.unit} / -0.00500 ${this.unit}`, `偏差: 0.00428 ${this.unit}`, `X = 0.00522 ${this.unit} Y = 0.00535 ${this.unit}`, `椭圆度: 0.00072 ${this.unit}`, `H = -0.02418 ${this.unit} V = -0.04375 ${this.unit}`, `标称值: 0.00150 ${this.unit}`]
    }
  }
}
rightRealTimeData[`heat-heat`] = { ...rightRealTimeData['diameter1-diameter1'] }
rightRealTimeData[`heat-heat`].label = `热外径`
rightRealTimeData[`heat-heat`].value = 0.0055


export const useRealTimeStore = defineStore('useRealtime', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      realData: <Record<string, any>>{
        diameter1Data: <Record<string, any[]>>{
          avg: [],
          ellipse: [],
          diameterX: [],
          diameterY: []
        },        //直径趋势折线图数据
      }, //实时数据
      productLength: 0,                //产品累计长度
      rightRealTimeData: rightRealTimeData
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
      Object.values(this.realData.diameter1Data).forEach((e: any) => {
        // if (e.length > 1000) {
        //   e.shift();
        // }
        e.push(randomData());
      })
      this.addProductLength()
    },
    addProductLength() {
      // const trendStore = useTrendStore()
      // if(!trendStore.isFetching){
      //   return
      // }
      this.productLength += 10
    }

  }

})
