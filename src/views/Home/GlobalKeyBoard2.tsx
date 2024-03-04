import { useMain } from "@/store";
import { KeyboardAltOutlined } from "@vicons/material";
import classNames from "classnames";
import { NIcon } from "naive-ui";
import { defineComponent } from "vue";
import GlobalKeyBoard from "./GlobalKeyBoard";
// import "vue-keyboard-virtual-next/keyboard.min.css";
// import KeyBoard from "vue-keyboard-virtual-next";
export default defineComponent({
  name: 'GlobalKeyBoard2',
  setup(props, ctx) {
    const store = useMain()
    const showKeyBoard = () => {
      if (store.globalKeyBoardShow) {
        store.setGlobalKeyBoardShow(false)
      } else {
        store.setGlobalKeyBoardShow(true)
      }
      // console.log("🚀 ~ showKeyBoard ~ window.location.host:", window.location.host)
      // window.open(window.location.host + '/#/keyboard')
    }
    // 第一个参数为当前focus的输入框的value值变化
    // 第二个参数为当前foucs的输入框
    const change = (value: any, inputEl: any) => {
      console.log('change value ---->', value)
      console.log('change input dom ---->', inputEl)
    }

    return () => {
      return [
        <div class={classNames('h-10 w-10 bottom-[2vh] left-0 absolute   bg-green-600  rounded-full shadow-md border border-solid border-gray-200  z-20 hover:bg-green-500 cursor-pointer ')} onClick={showKeyBoard}>
          <div class={'w-full h-full flex justify-center items-center relative bottom-[1px]'}>
            <NIcon class={'text-white text-2xl'}><KeyboardAltOutlined /></NIcon>
          </div>
        </div>,
        <GlobalKeyBoard />,
        <div>
          {/* @ts-ignore */}
          {/* <KeyBoard onChange={change} /> */}
        </div>
      ]
    }
  }

})