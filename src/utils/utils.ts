import { useConfigStore } from "@/store/config";
import { ActualResult } from "~/me";

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




export const listenAltF5 = (cb: Function) => {
  document.addEventListener('keydown', function (event) {
    if (event.altKey && event.key === 'F5') {
      cb()
    }
  })
}


