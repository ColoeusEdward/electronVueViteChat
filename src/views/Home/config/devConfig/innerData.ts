import { defineStore } from "pinia";
import { Ref, ref } from "vue";
import { DeviceConfigEntity } from "~/me";

//内部数据
export const useDevCfgInnerData = defineStore('DevCfgInner', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */
  state: () => {
    return {
      editShow:false,
      isEdit:false,
      curRow:null as DeviceConfigEntity|null,
      curRowKey:[] as string[],
      contentHeight:100 
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
    setEditShow(val:boolean){
      this.editShow = val
    },
    setIsEdit(val:boolean){
      this.isEdit = val
    },
    setCurRow(val:DeviceConfigEntity|null){
      this.curRow = val
    },
    setCurRowKey(val:string[]){
      this.curRowKey = val
    },
    cleanCurRow(){
      this.curRow = null
      this.curRowKey = []
    },
    setContentHeight(val:number){
      this.contentHeight = val
    }
    
  }
})