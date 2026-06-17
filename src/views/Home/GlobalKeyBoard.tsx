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
      if (button == '{enter}') {
        store.setGlobalKeyBoardShow(false)
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
      let val = window.innerWidth / 1920 * 1.3
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
              '{shift} z x c v b n m , . /',
              '{123} {space}'
            ],
            'lock': [
              '~ ! @ # $ % ^ & * ( ) _ + {bksp2}',
              'Q W E R T Y U I O P { } |',
              '{lock} A S D F G H J K L : " {enter}',
              '{shift} Z X C V B N M < > ?',
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
              <div v-drag={'.global-keyboard-value'} style={{ zIndex: 3000, willChange: 'transform', contain: 'layout style paint', transform: `scale(${winScale.value})`, left: leftMove.value + 'px', background: 'radial-gradient(rgba(180,160,120,0.12) 1px, transparent 1.5px) 0 0 / 12px 12px, linear-gradient(160deg, #f5f0e8 0%, #ede6d8 55%, #e4ddd0 100%)', border: '1px solid #c8bfaa', borderRadius: '16px', boxShadow: '0 20px 50px rgba(60,40,10,0.28), 0 4px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.85)', padding: '0 10px 14px' }} class={classnames('absolute bottom-40 h-[480px] flex flex-col items-center justify-end', { 'w-[354px]': commonData.isNum, 'w-[1000px]': !commonData.isNum })} v-show={keyborardShow.value}>
                <div class={'w-full global-keyboard-value flex justify-between items-center'} style={{ background: 'linear-gradient(180deg, #faf6ee 0%, #ede6d6 100%)', borderRadius: '12px 12px 0 0', padding: '8px 12px', marginBottom: '8px', borderBottom: '1px solid #c8bfaa', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.4)', cursor: 'move' }} ref={showTextRef}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <span style={{ display: 'flex', gap: '5px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg,#ff6b6b,#e53935)', border: '1px solid #c62828', boxShadow: '0 1px 3px rgba(200,0,0,0.4), inset 0 1px 0 rgba(255,180,180,0.5)', display: 'inline-block' }}></span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg,#ffd54f,#ffa000)', border: '1px solid #e65100', boxShadow: '0 1px 3px rgba(200,100,0,0.4), inset 0 1px 0 rgba(255,230,160,0.5)', display: 'inline-block' }}></span>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg,#81c784,#388e3c)', border: '1px solid #2e7d32', boxShadow: '0 1px 3px rgba(0,100,0,0.4), inset 0 1px 0 rgba(180,255,180,0.5)', display: 'inline-block' }}></span>
                    </span>
                    <span style={{ color: 'rgba(100,80,40,0.7)', fontSize: '10px', letterSpacing: '0.18em', fontFamily: 'monospace', userSelect: 'none' as const }}>KEYBOARD</span>
                  </div>
                  <div style={{ background: 'linear-gradient(180deg,#fefcf8 0%,#ede6d4 100%)', border: '1px solid #c4b99e', borderBottom: '2px solid #9e9080', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 0 rgba(0,0,0,0.18), 0 4px 8px rgba(60,40,10,0.2), inset 0 1px 0 rgba(255,255,255,0.9)', cursor: 'pointer', color: '#7f0000', flexShrink: 0 }} onClick={closeKeyboard}>
                    <NIcon size={16}>  <CloseTwotone /> </NIcon>
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