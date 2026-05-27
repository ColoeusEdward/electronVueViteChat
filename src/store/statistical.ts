import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import { DropdownProps } from "naive-ui";
import { defineStore } from "pinia" // 定义容器
import { DataGroupEntity, DistributionEntity, ModbusAdressRow } from "~/me";

const localDataSourceList = localStorage.getItem('statisticalDataSourceList') ? JSON.parse(localStorage.getItem('statisticalDataSourceList') || '[]') : []

export const useStatisticalStore = defineStore('statistical', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */

  state: () => {
    return {
      dataSourceList: <{ label: string, key: string, parent: string }[]>localDataSourceList,       //菜单选中的数据源

      isOnline: true,             //是否启用在线统计
      isShowData: true,            //是否显示底部数据
      curDisDataAdressList: getLocalStorage('curDisDataAdressList', []) as DataGroupEntity[],          //当前显示的数据
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
      // debugger
      console.log("🚀 ~ file: statistical.ts:35 ~ addDataSource ~ value:", value)

      if (!this.dataSourceList.some(e => e.key == value.key && e.parent == value.parent)) {
        if (this.dataSourceList.length == 4) {
          this.dataSourceList.shift();
        }
        this.dataSourceList.push(value);
        localStorage.setItem('statisticalDataSourceList', JSON.stringify(this.dataSourceList))
      } else {  //数据源已经存在就取消选中
        let idx = this.dataSourceList.findIndex(e => (e.key == value.key) && (e.parent == value.parent))
        console.log("🚀 ~ file: statistical.ts:44 ~ addDataSource ~ idx:", idx)
        this.dataSourceList.splice(idx, 1);
        localStorage.setItem('statisticalDataSourceList', JSON.stringify(this.dataSourceList))
      }
    },
    cleanDataSource() {
      this.dataSourceList = [];
      localStorage.setItem('statisticalDataSourceList', JSON.stringify(this.dataSourceList))
    },
    setIsOnline(value: boolean) {
      this.isOnline = value
    },
    changeIsShowData() {
      this.isShowData = !this.isShowData
    },
    addCurDisDataAdressList(value: DataGroupEntity) {
      this.curDisDataAdressList.push(value)
      setLocalStorage('curDisDataAdressList', this.curDisDataAdressList)
    },
    removeCurDisDataAdressList(value: DataGroupEntity) {
      let idx = this.curDisDataAdressList.findIndex(e => e.GId == value.GId)
      let list = [...this.curDisDataAdressList]
      list.splice(idx, 1)
      this.curDisDataAdressList = list
      setLocalStorage('curDisDataAdressList', this.curDisDataAdressList)
      // this.curDisDataAdressList.splice(idx, 1)

    },
    clearCurDisDataAdressList() {
      this.curDisDataAdressList = []
      setLocalStorage('curDisDataAdressList', this.curDisDataAdressList)
    },

  }

})

