import { useConfigStore } from "@/store/config";
import { ActualResult, DataConfigEntity, DataGroupEntity, DeviceGroupEntity, FormulaConfigEntity, FormulaParamEntity, ModbusAdressRow } from "~/me";
import { v4 as uuidv4 } from 'uuid';
import { callSpc } from "./call";
import { callFnName } from "./enum";
import { useSysCfgInnerDataStore } from "@/views/Home/config/sysConfig/innderData";
import { useMain } from "@/store";
import { Ref } from "vue";
import { propNameMap } from "@/views/Home/config/devConfig/enum";
import { callBrige } from "./callm";
import { menuIdSplit, menuPropEnum } from "@/views/Home/curcev/enum";
import { noKeyBoardInputClass } from "@/views/Home/config/sysConfig/enum";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const isLowResolution = () => {
  return screen.width <= 1440 || window.innerWidth <= 1440
}
function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const unique = (arr: []) => {
  return Array.from(new Set(arr))
}
// Simulate key press event
const simulateKeyPress = (keyCode: number) => {
  const event = new KeyboardEvent('keydown', { keyCode: keyCode });
  document.dispatchEvent(event);
}

const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const getLocalStorage = (key: string, def = {} as any) => {
  try {
    return JSON.parse(localStorage.getItem(key) as any) || def;
  } catch (error) {
    // 这里可以根据需要决定是否打印错误日志
    console.error("JSON 解析失败:", error);
    return def;
  }
  // return JSON.parse( || (def == -1 ? '{}' : def))
}
export { sleep, isLowResolution, capitalizeFirstLetter, unique, simulateKeyPress, setLocalStorage, getLocalStorage }

export const ajaxPromiseAll = <T extends Array<any>,>(list: any) => {
  return new Promise<T>((resolve, reject) => {
    return Promise.all(list).then(res => {
      resolve(res as T);
    }).catch(err => {
      reject(err);
    })
  })
}

export const generateUUID = () => {
  return uuidv4()
}

export const listenAltF5 = (cb: Function) => {
  document.addEventListener('keydown', function (event) {
    if (event.altKey && event.key === 'F5') {
      cb()
      // callSpc(callFnName.closeSpcSystem).then(() => {
      // })
    }
  })
}

export const showKeyBoard = () => {
  callSpc(callFnName.showKeyBoard).then(() => {
  })
}

export const getRegState = () => { //获取注册状态
  const SysCfgInnerData = useSysCfgInnerDataStore()
  // callSpc(callFnName.getRegisterState).then((e: ActualResult) => {
  //   // console.log("🚀 ~ callSpc ~ e:", e)
  //   if (e != null) {
  //     SysCfgInnerData.setRegState(true)
  //   } else {
  //     SysCfgInnerData.setRegState(false)
  //   }
  // })
}
export const focusToInput = (store: ReturnType<typeof useMain>) => {
  return sleep(50).then(() => {
    if (store.lastFocusedInput) {
      store.lastFocusedInput.focus()
      return sleep(50)
    }
  })
}

export const isSingleLetter = (str: string) => {
  return /^[A-Za-z]$/.test(str);
}

//main是shift这种按键，sec是普通按键
export const multiPressKey = (main: number, sec: number) => {
  callBrige(callFnName.KeyDown, main).then(() => {
    return callBrige(callFnName.KeyPress, sec)
  }).then(() => {
    return callBrige(callFnName.KeyUp, main)
  })
}

export const mapKeyAndTitle = (str: string) => {
  return {
    key: str,
    title: propNameMap[str]
  }
}

export const loopGet = (fn: () => Promise<any>, ms: number, isGettingRef: Ref<boolean>) => {
  fn().then(() => {
    return sleep(ms)
  }).then(() => {
    if (isGettingRef.value) {
      loopGet(fn, ms, isGettingRef)
    }
  })
}

export const listenAllInputFocus = (store: ReturnType<typeof useMain>, configStore: ReturnType<typeof useConfigStore>) => {
  document.addEventListener('focusin', function (event) {
    // `event.target` 是实际获取焦点的元素
    const targetElement = event.target;
    // console.log("🪵 [utils.ts:122] ~ token ~ \x1b[0;32mtargetElement\x1b[0m = ", targetElement);

    // 检查这个元素是否是一个输入框
    //@ts-ignore
    if (targetElement && targetElement.type == 'text' && targetElement.tagName === 'INPUT' && !targetElement?.closest('div.' + noKeyBoardInputClass) && !targetElement.className.includes('selection') || targetElement.tagName === 'TEXTAREA') {
      console.log('用户点击或选中了一个输入框。');
      //@ts-ignore
      console.log('被选中的元素 ID 是:', targetElement.id || '无ID');
      if (configStore.sysConfig.InputType || window.location.host.includes('localhost')) {
        store.setGlobalKeyBoardShow(true)
      }
    }
  });
}

export const listenLandscape = (store: ReturnType<typeof useMain>) => {
  //比较长宽比判断竖屏
  if (window.innerHeight > window.innerWidth) {
    store.setIsLandscape(false)
  } else {
    store.setIsLandscape(true)
  }
  return window.innerHeight > window.innerWidth

  // 竖屏查询
  const mediaQueryPortrait = window.matchMedia('(orientation: portrait)');
  // 横屏查询
  const mediaQueryLandscape = window.matchMedia('(orientation: landscape)');

  // 判断当前状态
  if (mediaQueryLandscape.matches) {
    console.log('当前是横屏');
    store.setIsLandscape(true)
  } else if (mediaQueryPortrait.matches) {
    console.log('当前是竖屏');
    store.setIsLandscape(false)
  }

  // 监听方向变化
  mediaQueryLandscape.addEventListener('change', (e) => {
    if (e.matches) {
      console.log('屏幕方向已变为横屏');
      store.setIsLandscape(true)
    }
  });

  mediaQueryPortrait.addEventListener('change', (e) => {
    if (e.matches) {
      console.log('屏幕方向已变为竖屏');
      store.setIsLandscape(false)
    }
  });
}

export const safeJsonParse = (str: string) => {
  let res = {}
  try {
    res = JSON.parse(str || '{}')
  } catch (error) {
    console.log(error)
  }
  return res
}

export const getRandomInt = (min: number, max: number) => {
  // Math.random() 生成 [0, 1) 之间的浮点数
  // (max - min + 1) 确定了范围内的整数个数
  // Math.floor 向下取整，保证结果是整数
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const buildMenuOpt = (e: DeviceGroupEntity, configStore: ReturnType<typeof useConfigStore>, isShow = false) => {
  const getChild = (dev: DeviceGroupEntity) => {
    let name = isShow ? callFnName.GetShowDataGroups : callFnName.GetChartDataGroups
    callBrige(name, dev.GId).then((res: DataGroupEntity[]) => {
      // console.log("🪵 [utils.ts:196] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
      if (!isShow) {
        res.forEach(e => {
          if (!configStore.chartDataGroupList.find(item => item.GId == e.GId)) {
            configStore.chartDataGroupList.push(e)
          }
        })
      }
      let list = res.map(e => {
        return {
          label: e.DataName,
          key: menuPropEnum.dataSource + menuIdSplit + e.GId + menuIdSplit + dev.GId,
          trueKey: e.GId,
          DataName: e.DataName,
          GId: e.GId,
          Unit: e.Unit,
          Precision: e.Precision,
          ParentId: dev.GId
        }
      })
      dat.children.push(...list)
    })
  }
  let dat = {
    label: e.DeviceName,
    key: menuPropEnum.dataSource + menuIdSplit + e.GId,
    trueKey: e.GId,
    DataName: e.DeviceName,
    GId: e.GId,
    DeviceClass: e.DeviceClass,
    children: [] as any[]
    // Unit: e.Unit,
    // Precision: e.Precision
  }
  getChild(e)
  return dat
}

export const updateFormulaConfig = (configStore: ReturnType<typeof useConfigStore>) => {
  callBrige(callFnName.GetFormulaConfigs, configStore.sysConfig.CurrentGroupId).then((res: FormulaConfigEntity[]) => {
    let item = res.find(e => e.GId == configStore.sysConfig.CurrentFormulaId)
    configStore.setCurEnableFormulaRow(item)
    return callBrige(callFnName.GetFormulaParams, item?.GId)
  }).then((res: FormulaParamEntity[]) => {
    configStore.setCurEnableFormulaParamList(res)
  })
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    // 如果已经在计时，则清除之前的计时器重新开始
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let previous = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - previous > wait) {
      func.apply(this, args);
      previous = now;
    }
  };
}

export const getAllDataUnderGroup = (configStore: ReturnType<typeof useConfigStore>) => {
  const curGroupId = configStore.sysConfig.CurrentGroupId
  let dataGroupList: DataGroupEntity[] = []
  return callBrige(callFnName.GetDeviceGroups, curGroupId).then((devList: DeviceGroupEntity[]) => {
    let reqList = devList.map(e => {
      return callBrige(callFnName.GetShowDataGroups, e.GId)
    })
    return ajaxPromiseAll(reqList)
  }).then((res: DataGroupEntity[][]) => {
    res.forEach(e => {
      dataGroupList.push(...e)
    })
    return dataGroupList
  })
}

export const initWinFn = () => {
  const ExportRealtime = (dataGroupId: string) => {

  }
  const ExportDistribution = (dataGroupId: string) => {

  }

  window.ExportRealtime = ExportRealtime
  window.ExportDistribution = ExportDistribution
}