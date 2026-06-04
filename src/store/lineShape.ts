import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import { RightValueType } from "@/views/Home/RightValueBlock";
import { defineStore } from "pinia"

export interface LineShapeDataSource {
  OD?: RightValueType      // 平均线径
  DiameterX?: RightValueType  // 线径X (长轴)
  DiameterY?: RightValueType  // 线径Y (短轴)
}

export const useLineShapeStore = defineStore('lineShape', {
  state: () => {
    return {
      curLineShapeMenuOption: getLocalStorage('curLineShapeMenuOption', {}) as LineShapeDataSource,
    }
  },
  getters: {},
  actions: {
    setCurLineShapeMenuOption(value: LineShapeDataSource) {
      this.curLineShapeMenuOption = value;
      setLocalStorage('curLineShapeMenuOption', value)
    }
  }
})
