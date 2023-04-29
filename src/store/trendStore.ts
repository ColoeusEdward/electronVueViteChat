import { DropdownProps } from "naive-ui";
import { defineStore } from "pinia" // 定义容器

const localDataSourceList = localStorage.getItem('trendDataSourceList') ? JSON.parse(localStorage.getItem('trendDataSourceList') || '[]') : []

export const useTrendStore = defineStore('useTrend', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */

  state: () => {
    return {
      dataSourceList: <{ label: string, key: string, parent: string }[]>localDataSourceList,       //菜单选中的数据源
      lineWidth: <{ label: string, key: string }>{},       //菜单选中的线宽
      needExecWay: false,     //是否需要运行方式
      needXAll: false,         //是否需要X轴全部
      needYAll: false,         //是否需要Y轴全部

      isFetching: false,       //是否开始获取数据

      menuMaintainOptions: <DropdownProps['options']>[
      {
        label: '数据源', key: 'dataSource', children: [
          { label: '全部清除', key: 'cleanAll' },
          { label: '直径1', key: 'diameter1', },
          { label: '热外径', key: 'heat', },
          { label: '冷外径', key: 'cold', },
          { label: '冷电容', key: 'coldCap', },   //电容,壁厚只有趋势图,只有平均值, 因此displayoption在选中电容后要隐藏
          { label: '壁厚', key: 'wall', },
          { label: '偏心', key: 'ecc', },
          { label: '同心度', key: 'concentricity', },
          { label: '角度', key: 'angle', },
          { label: '速度', key: 'speed', },
        ]
      },
    ]
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
    addDataSource(value: any) {

      if (!this.dataSourceList.some(e => e.key == value.key && e.parent == value.parent)) {
        if (this.dataSourceList.length == 3) {
          this.dataSourceList.shift();
        }
        this.dataSourceList.push(value);
        localStorage.setItem('trendDataSourceList', JSON.stringify(this.dataSourceList))
      }
    },
    cleanDataSource() {
      this.dataSourceList = [];
      localStorage.setItem('trendDataSourceList', JSON.stringify(this.dataSourceList))
    },
    changeNeedExecWay() {
      this.needExecWay = !this.needExecWay;
    },
    changeNeedXAll() {
      this.needXAll = !this.needXAll;
    },
    changeNeedYAll() {
      this.needYAll = !this.needYAll;
    },
    setIsFetching(value: boolean) {
      this.isFetching = value;
    },
    setLineWidth(value: any) {
      this.lineWidth = value;
    },
    setMenuMaintainOptions(value: any) {
      this.menuMaintainOptions = value;
    }
  }

})

