import { NInput, NInputNumber } from "naive-ui";
import { defineComponent, onMounted, onUnmounted, watch, ref, Transition, Teleport, nextTick, computed, reactive } from "vue";
import { useMain } from "@/store";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { focusToInput, isSingleLetter, multiPressKey, simulateKeyPress, sleep } from "@/utils/utils";
import { commonKeyCodeSpecCharMap, keyCodeMap, keyCodeUpSpecCharMap, keyCodeUpSpecList } from "@/utils/keyCode";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import classnames from "classnames";

type InputType = InstanceType<typeof NInputNumber> | null
export default defineComponent({
  name: 'GlobalKeyBoard',
  setup(props, ctx) {
    const store = useMain()
    const angle = ref(0)
    const commonData = reactive({
      isCapLock: false,
      isNum:false,
    })
    const keyBoardAngle = ref<string | number>('')
    const keyborardShow = computed(() => store.globalKeyBoardShow)
    const keyBoardWidth = computed(() => commonData.isNum?"80px":"40px")
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
          return callSpc(callFnName.keyPress, keyCodeMap.BACKSPACE)
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
        // angle.value = Number(keyBoardAngle.value)
        // store.setEccAngle(angle.value)
        // store.setGlobalKeyBoardShow(false
        focusToInput(store).then(async () => {
          // store.lastFocusedInput!.value +=  keyBoardAngle.value
          let str = String(keyBoardAngle.value)
          let strList: string[] = []
          for (let i = 0; i < str.length; i++) {
            strList[i] = str[i]
          }
          //(isSingleLetter(str)) 
          for await (str of strList) {
            await sleep(16)
            let code = 0
            if (keyCodeUpSpecList.find(e => e == str)) {
              await multiPressKey(keyCodeMap.SHIFT, keyCodeUpSpecCharMap[str])
            }
            else if (commonKeyCodeSpecCharMap[str]) {
              await callSpc(callFnName.keyPress, commonKeyCodeSpecCharMap[str])
            }
            else {
              code = str.toUpperCase().charCodeAt(0)
              await callSpc(callFnName.keyPress, code)
            }
          }

          // simulateKeyPress(),
          resetVal()
        })
        return
      }
      if(button == '{123}'){
        commonData.isNum = !commonData.isNum
        keyboardIns.setOptions({
          layoutName: commonData.isNum ? 'num' : 'default'
        })
        return 
      }
      if(button == '{abc}'){
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
        callSpc(callFnName.keyPress, keyCodeMap.CAPSLOCK)
        return
      }
      if (button == '{tab}') {
        focusToInput(store).then(() => {
          callSpc(callFnName.keyPress, keyCodeMap.TAB)
        })
        return
      }
      if (button == '{shift}') {
        callSpc(callFnName.keyPress, keyCodeMap.SHIFT)
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
        store.setGlobalKeyBoardShow(false)
        return
      }
      if (button == '{reset}' || button == '{clear}') {
        resetVal()
        return
      }
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
            '{bksp2}': 'backspace(目标输入框)',
            '{123}': '123',
            '{clear}': '清空',
            '{bksp}': '←',
            // '{enter}': 'OK',
            '{esc}': '❌',
            '{reset}': 'CE',
            '{abc}':'abc'
          },
          // // inputPattern: /^(?:[1-9][0-9]{0,2}|0)$/,
          // maxLength: 3,
          layout: {
            'default': [
              '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
              'q w e r t y u i o p [ ] \\',
              '{lock} a s d f g h j k l ; \' {enter}',
              '{clear} z x c v b n m , . / {shift}',
              '{123} {space} {bksp2}'
            ],
            'lock': [
              '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
              'Q W E R T Y U I O P { } |',
              '{lock} A S D F G H J K L : " {enter}',
              '{clear} Z X C V B N M < > ? {shift}',
              '{123} {space} {bksp2}'
            ],
            'num':[
              '1 2 3',
              '4 5 6',
              '7 8 9',
              '{bksp} 0 {reset}',
              '{esc} {enter}',
              '{abc} {bksp2}'
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
        if(commonData.isNum){
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
              <div v-drag={'.global-keyboard-value'} style={{ zIndex: 200 }} class={classnames(' absolute bottom-40 -left-[30vw] p-1 pt-1 bg-[#ececec] rounded-md  h-[480px] flex flex-col items-center justify-end',{'w-[484px]':commonData.isNum,'w-[1080px]':!commonData.isNum})} v-show={keyborardShow.value}>
                <div class={'w-full h-14 border border-solid border-gray-400 rounded-md p-2 bg-white global-keyboard-value'} ref={showTextRef}>
                  {keyBoardAngle.value}
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