import { defineStore } from "pinia";
import { CategoryDataEntity, CategoryNodeEntity } from "~/me";


export const useDataCfgInnerDataStore = defineStore('DataCfgInnerData', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      selectItem: null as CategoryDataEntity | CategoryNodeEntity | null,
      selectKey: [] as string[],
      isEdit: false,      //是否编辑
      editShow: false,
      getTreeDataFn: () => { },
      isAddGroup: false ,  //是否是添加分组
      isMemberAddMore:false
    }
  },
  /**
   * 用来封装计算属性 有缓存功能  类似于computed
   */
  getters: {
    isGroup: (state) => {
      let item = state.selectItem as CategoryNodeEntity
      return item && item.NodeName!=null && item.NodeName!=undefined 
    },
    isMember: (state) => {
      let item = state.selectItem as CategoryDataEntity
      return item && item.DataName!=null && item.DataName!=undefined
    },
    groupShow():boolean{
      return ((this.isGroup && this.isEdit) || (this.isAddGroup && !this.isEdit)) && this.editShow
    },
    memberShow():boolean{
      return ((this.isMember && this.isEdit) || (!this.isAddGroup && !this.isEdit)) && this.editShow
    }
    // cdataShow: (state) => {
    //   let item = state.selectItem as CategoryDataEntity
    //   return (item && item.DataName && state.isEdit || !state.isAddGroup) && state.editShow
    // }
  },
  /**
   * 编辑业务逻辑  类似于methods
   */
  actions: {
    setSelectItem(item: CategoryDataEntity | CategoryNodeEntity) {
      this.selectItem = item
      this.selectKey = [item.GId]
    },
    setSelectKey(key: string[]) {
      this.selectKey = key
    },
    cleanSelectItem() {
      this.selectItem = null
      this.selectKey = []
      this.editShow = false
    },
    setIsEdit(val: boolean) {
      this.isEdit = val
    },
    setEditShow(val: boolean) {
      this.editShow = val
    },
    setGetTreeDataFn(val: () => void) {
      this.getTreeDataFn = val
    },
    setIsAddGroup(val: boolean) {
      this.isAddGroup = val
    },
    setIsMemberAddMore(val: boolean) {
      this.isMemberAddMore = val
    }

  }
})