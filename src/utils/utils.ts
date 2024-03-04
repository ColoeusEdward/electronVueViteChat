import { useConfigStore } from "@/store/config";
import { ActualResult } from "~/me";
import { v4 as uuidv4 } from 'uuid';
import { callSpc } from "./call";
import { callFnName } from "./enum";
import { useSysCfgInnerDataStore } from "@/views/Home/config/sysConfig/innderData";
import { useMain } from "@/store";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isLowResolution = () => {
  return screen.width <= 1440
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

const getLocalStorage = (key: string) => {
  return JSON.parse(localStorage.getItem(key) || '{}')
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
  callSpc(callFnName.getRegisterState).then((e: ActualResult) => {
    console.log("🚀 ~ callSpc ~ e:", e)
    if (e != null) {
      SysCfgInnerData.setRegState(true)
    } else {
      SysCfgInnerData.setRegState(false)
    }
  })
}
export const focusToInput = (store:ReturnType<typeof useMain>) => {
  return sleep(50).then(() => {
    if (store.lastFocusedInput) {
      store.lastFocusedInput.focus()
      return sleep(50)
    }
  })
}

export const  isSingleLetter = (str:string) => {
  return /^[A-Za-z]$/.test(str);
}

//main是shift这种按键，sec是普通按键
export const multiPressKey = (main:number,sec:number) => {
  callSpc(callFnName.keyDown, main).then(() => {
    return callSpc(callFnName.keyPress, sec)
  }).then(() => {
    return callSpc(callFnName.keyUp, main)
  })
}

