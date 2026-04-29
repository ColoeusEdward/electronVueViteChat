import { tabNameEnum } from "@/views/Home/config/devConfigNew/enum";
import { DropdownProps } from "naive-ui";
import { defineStore } from "pinia" // 定义容器
import { v4 as uuidv4 } from 'uuid';
import { DataGroupEntity, DeviceConfigEntity, FormulaConfigEntity, FormulaParamEntity, ModbusAdressRow, SysConfigEntity, SysConfigModel } from "~/me";
type connectConfig = {
  data: Record<string, string>[]
}



export const useFormulaStore = defineStore('formulaConfig', {
  /**
   * 存储全局状态
   * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
   * 和 TS 类型推导
  */

  state: () => {
    return {
      show: false,
      curFormulaConfigRow: null as FormulaConfigEntity | null,
      curEnableDataGroup: null as DataGroupEntity | null | undefined,
      updateParamListFn: () => { },
      updateConfigListFn: () => { },
      getParamFormMapFn: () => { },
      applayFormulaConfigFn: (row: FormulaConfigEntity) => { },
      getFormulaListFn: (() => { }) as () => FormulaConfigEntity[],
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
    setFormulaShow(value: boolean) {
      this.show = value
    },
    setCurFormulaConfigRow(value: FormulaConfigEntity | null) {
      this.curFormulaConfigRow = value
    },
    setCurEnableDataGroup(value: DataGroupEntity | null | undefined) {
      this.curEnableDataGroup = value
    },
    setUpdateParamListFn(value: () => void) {
      this.updateParamListFn = value
    },
    setUpdateConfigListFn(value: () => void) {
      this.updateConfigListFn = value
    },
    setGetParamFormMapFn(value: () => Record<string, FormulaParamEntity>) {
      this.getParamFormMapFn = value
    },
    setApplayFormulaConfigFn(value: (row: FormulaConfigEntity) => void) {
      this.applayFormulaConfigFn = value
    },
    setGetFormulaListFn(value: () => FormulaConfigEntity[]) {
      this.getFormulaListFn = value
    },

  }

})
