import { NIcon, NInput, NInputNumber } from "naive-ui";
import { defineComponent, onMounted, onUnmounted, watch, ref, Transition, Teleport, nextTick, computed, reactive } from "vue";
import { useMain } from "@/store";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { focusToInput, isSingleLetter, multiPressKey, simulateKeyPress, sleep } from "@/utils/utils";
import { commonKeyCodeSpecCharMap, keyCodeMap, keyCodeUpSpecCharMap, keyCodeUpSpecList } from "@/utils/keyCode";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import classnames from "classnames";
import { CloseTwotone, DragIndicatorFilled } from "@vicons/material";
import { callBrige } from "@/utils/callm";
import { useCurcevInnerDataStore } from "./curcev/innerData";
// import { Drag24Filled } from "@vicons/fluent";

type InputType = InstanceType<typeof NInputNumber> | null
export default defineComponent({
  name: 'GlobalKeyBoard',
  setup(props, ctx) {
    const store = useMain()
    const angle = ref(0)
    const commonData = reactive({
      isCapLock: false,
      isNum: false,
    })
    const keyBoardAngle = ref<string | number>('')
    const keyborardShow = computed(() => store.globalKeyBoardShow)
    const keyBoardWidth = computed(() => commonData.isNum ? "80px" : "40px")
    // ref(false)
    const isMounted = ref(false)
    const inputRef = ref<InputType>()
    const showTextRef = ref<HTMLDivElement>()
    let keyboardIns: Keyboard



    const handleDragEnd = () => {
      // console.log(angle.value)
      store.setEccAngle(angle.value)
    }

    const valueClick = () => {
      // keyborardShow.value = !keyborardShow.value
      store.setGlobalKeyBoardShow(!keyborardShow.value)
    }
    const onChange = (value: string) => {
      // console.log("🚀 ~ onChange ~ value:", value)
      // let num = Number(value)
      // if (num >= 359) {
      //   num = 359
      // }
      keyBoardAngle.value = value
      // keyboardIns.setInput(String(num))
    }
    const onKeyPress = (button: string) => {
      // console.log("🚀 ~ file: GlobalKeyBoard.tsx:41 ~ onKeyPress ~ button:", button)
      if (button == '{bksp2}') {
        focusToInput(store).then(() => {
          return callBrige(callFnName.KeyPress, keyCodeMap.BACKSPACE)
        }).then(() => {
          // refreshVal()
          keyboardIns.setCaretPosition(String(keyBoardAngle.value).length);
        })
        return
      }
      if (button == `{bksp}`) {
        keyBoardAngle.value = String(keyBoardAngle.value).slice(0, -1)
        keyboardIns.setInput(keyBoardAngle.value)
        return
      }
      // if (button == '{enter}') {
      //   // angle.value = Number(keyBoardAngle.value)
      //   // store.setEccAngle(angle.value)
      //   // store.setGlobalKeyBoardShow(false
      //   focusToInput(store).then(async () => {
      //     // store.lastFocusedInput!.value +=  keyBoardAngle.value
      //     let str = String(keyBoardAngle.value)
      //     let strList: string[] = []
      //     for (let i = 0; i < str.length; i++) {
      //       strList[i] = str[i]
      //     }
      //     //(isSingleLetter(str)) 
      //     for await (str of strList) {
      //       await sleep(16)
      //       let code = 0
      //       if (keyCodeUpSpecList.find(e => e == str)) {
      //         await multiPressKey(keyCodeMap.SHIFT, keyCodeUpSpecCharMap[str])
      //       }
      //       else if (commonKeyCodeSpecCharMap[str]) {
      //         await callSpc(callFnName.keyPress, commonKeyCodeSpecCharMap[str])
      //       }
      //       else {
      //         code = str.toUpperCase().charCodeAt(0)
      //         await callSpc(callFnName.keyPress, code)
      //       }
      //     }

      //     // simulateKeyPress(),
      //     resetVal()
      //   })
      //   return
      // }
      if (button == '{123}') {
        commonData.isNum = !commonData.isNum
        keyboardIns.setOptions({
          layoutName: commonData.isNum ? 'num' : 'default'
        })
        return
      }
      if (button == '{abc}') {
        commonData.isNum = !commonData.isNum
        keyboardIns.setOptions({
          layoutName: !commonData.isNum ? 'default' : 'num'
        })
        return
      }
      if (button == '{lock}') {
        commonData.isCapLock = !commonData.isCapLock
        keyboardIns.setOptions({
          layoutName: commonData.isCapLock ? 'lock' : 'default'
        })
        callBrige(callFnName.KeyPress, keyCodeMap.CAPSLOCK)
        return
      }
      if (button == '{tab}') {
        focusToInput(store).then(() => {
          callBrige(callFnName.KeyPress, keyCodeMap.TAB)
        })
        return
      }
      if (button == '{shift}') {
        callBrige(callFnName.KeyPress, keyCodeMap.SHIFT)
        return
      }
      // if (button == '0' && keyBoardAngle.value == 0) {  //该组件有个bug,开头狂按0会正常写入组件内部, 需要手动清空
      //   keyboardIns.clearInput()
      // }

      // if (button == '{bksp}') {
      //   focusToInput(store).then(() => {
      //     callSpc(callFnName.keyPress, keyCodeMap['bksp'.toUpperCase()])
      //   })
      // }
      if (button == '{esc}') {
        closeKeyboard()
        return
      }
      if (button == '{reset}' || button == '{clear}') {
        resetVal()
        return
      }

      // if (keyCodeUpSpecList.find(e => e == button)) {
      //   multiPressKey(keyCodeMap.SHIFT, keyCodeUpSpecCharMap[button])
      //   return
      // }
      if (button) {
        focusToInput(store).then(async () => {
          // store.lastFocusedInput!.value +=  keyBoardAngle.value
          let str = String(keyBoardAngle.value)
          let strList: string[] = []
          for (let i = 0; i < str.length; i++) {
            strList[i] = str[i]
          }
          //(isSingleLetter(str)) 
          for await (str of strList) {
            await sleep(8)
            let code = 0
            if (keyCodeUpSpecList.find(e => e == str)) {
              await multiPressKey(keyCodeMap.SHIFT, keyCodeUpSpecCharMap[str])
            }
            else if (commonKeyCodeSpecCharMap[str]) {
              await callBrige(callFnName.KeyPress, commonKeyCodeSpecCharMap[str])
            }
            else {
              code = str.toUpperCase().charCodeAt(0)
              await callBrige(callFnName.KeyPress, code)
            }
          }
          // simulateKeyPress(),
          resetVal()
        })
        return
      }
      // callSpc(callFnName.keyPress, button.toUpperCase().charCodeAt(0))
    }
    const resetVal = () => {
      keyboardIns.clearInput()
      keyBoardAngle.value = ''
      keyboardIns.setInput('')
    }
    const refreshVal = () => {
      let temp = keyBoardAngle.value
      resetVal()
      keyboardIns.setInput(String(temp))
      keyBoardAngle.value = temp
    }
    const closeKeyboard = () => {
      store.setGlobalKeyBoardShow(false)
    }

    const winScale = computed(() => {
      let val = window.innerWidth / 1920
      if (val < 0.7 && store.isLandscape) {
        return 0.7
      }
      if (val < 0.8 && !store.isLandscape) {
        return 0.8
      }
      return val
    })

    const leftMove = computed(() => {
      // let init = 440 / 1920
      let val = (window.innerWidth / 1920) * 440 * 1.5
      return -val
    })

    watch(keyborardShow, (nv) => {
      if (nv) {
        resetVal()
      }
    })

    onMounted(() => {
      isMounted.value = true
      nextTick(() => {
        keyboardIns = new Keyboard({
          mergeDisplay: true,
          theme: 'hg-theme-default hg-layout-default myTheme',
          display: {
            '{bksp2}': '←',
            '{123}': '123',
            '{clear}': '清空',
            '{bksp}': '←',
            '{enter}': '↩︎',
            '{esc}': '❌',
            '{reset}': 'CE',
            '{abc}': 'abc'
          },
          // // inputPattern: /^(?:[1-9][0-9]{0,2}|0)$/,
          // maxLength: 3,
          layout: {
            'default': [
              '` 1 2 3 4 5 6 7 8 9 0 - = {bksp2}',
              'q w e r t y u i o p [ ] \\',
              '{lock} a s d f g h j k l ; \' {enter}',
              '{shift} z x c v b n m , . / {shift}',
              '{123} {space}'
            ],
            'lock': [
              '~ ! @ # $ % ^ & * ( ) _ + {bksp2}',
              'Q W E R T Y U I O P { } |',
              '{lock} A S D F G H J K L : " {enter}',
              '{shift} Z X C V B N M < > ? {shift}',
              '{123} {space}'
            ],
            'num': [
              '1 2 3',
              '4 5 6',
              '7 8 9',
              '{bksp2} 0',
              '{abc} {enter}',
            ]
          },
          buttonTheme: [
            {
              class: "no-grow-style",
              buttons: "{bksp2} {123} {abc} {esc}"
            },

          ],
          onChange: input => onChange(input),
          onKeyPress: button => onKeyPress(button)
        });
        if (commonData.isNum) {
          keyboardIns.setOptions({
            layoutName: 'num'
          })
        }
      })

    })

    return () => {

      return (
        <div class={'absolute right-4 bottom-8 h-[10vh] w-[10vh] flex flex-col items-center justify-center'} onMousedown={(e) => { e.preventDefault() }} >
          {
            isMounted.value &&
            // <Teleport to="#indexCon">
            <Transition name='slide-fade'>
              <div v-drag={'.global-keyboard-value'} style={{ zIndex: 3000, transform: `scale(${winScale.value}) `, left: leftMove.value + 'px' }} class={classnames(' absolute bottom-40 p-1 pt-1 bg-[#f5f6f6] border border-solid border-gray-400 rounded-md  h-[480px] flex flex-col items-center justify-end', { 'w-[354px]': commonData.isNum, 'w-[960px]': !commonData.isNum })} v-show={keyborardShow.value}>
                {/* <div class={'w-full h-14 border border-solid border-gray-400 rounded-md p-2 bg-white global-keyboard-value'} ref={showTextRef}>
                  {keyBoardAngle.value}
                </div> */}
                <div class={'w-full h-8 0 rounded-md  global-keyboard-value flex justify-end items-center'} ref={showTextRef}>
                  <div class={'p-[6px] px-4 flex justify-center items-center text-2xl bg-red-400 rounded  text-white'} onClick={closeKeyboard}>
                    <NIcon size={'large'}>  <CloseTwotone /> </NIcon>
                  </div>
                </div>
                {/* <NInput value={keyBoardAngle.value}></NInput> */}
                {/* <NInputNumber ref={(e) => { inputRef.value = e as InputType }} class={'w-full'} value={Number(keyBoardAngle.value)} size={'large'} /> */}
                <div class={'simple-keyboard w-full h-full shrink'}></div>
              </div>
            </Transition>
            // </Teleport>
          }


        </div>
      )
    }
  },
})