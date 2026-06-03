import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import { RightValueType } from "@/views/Home/RightValueBlock";
import { defineStore } from "pinia"

export interface LineDataSource {
  OD?: RightValueType,    // 平均线径
  DiameterX?: RightValueType,  // 线径X (长轴)
  DiameterY?: RightValueType   // 线径Y (短轴)
}

export const useLineStore = defineStore('line', {
  state: () => {
    return {
      curLineMenuOption: getLocalStorage('curLineMenuOption', {}) as LineDataSource,
    }
  },
  getters: {},
  actions: {
    setCurLineMenuOption(value: LineDataSource) {
      this.curLineMenuOption = value;
      setLocalStorage('curLineMenuOption', value)
    }
  }
})
