import { NInputNumber } from "naive-ui";
import { defineComponent, onMounted, onUnmounted, watch, ref, Transition, Teleport, nextTick, computed } from "vue";
import { useMain } from "@/store";
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { simulateKeyPress } from "@/utils/utils";

type InputType = InstanceType<typeof NInputNumber> | null
export default defineComponent({
  name: 'GlobalKeyBoard',
  setup(props, ctx) {
    const store = useMain()
    const angle = ref(0)
    const keyBoardAngle = ref<string | number>('')
    const keyborardShow = computed(() => store.globalKeyBoardShow)
    // ref(false)
    const isMounted = ref(false)
    const inputRef = ref<InputType>()
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
      let num = Number(value)
      // if (num >= 359) {
      //   num = 359
      // }
      keyBoardAngle.value = num
      // keyboardIns.setInput(String(num))
    }
    const onKeyPress = (button: string) => {
      console.log("🚀 ~ file: GlobalKeyBoard.tsx:41 ~ onKeyPress ~ button:", button)
      if (button == '{enter}') {
        // angle.value = Number(keyBoardAngle.value)
        // store.setEccAngle(angle.value)
        // store.setGlobalKeyBoardShow(false
        if (store.lastFocusedInput) {
          store.lastFocusedInput.focus()
          nextTick(() => {
            let str = String(keyBoardAngle.value)
            for (let i = 0; i < str.length; i++) {
              const keyCode = str.charCodeAt(i)
              simulateKeyPress(keyCode)
            }
            // simulateKeyPress(),
            resetVal()
          })

        }
      }
      if (button == '0' && keyBoardAngle.value == 0) {  //该组件有个bug,开头狂按0会正常写入组件内部, 需要手动清空
        keyboardIns.clearInput()
      }
      if (button == '{esc}') {
        store.setGlobalKeyBoardShow(false)
      }
      if (button == '{reset}') {
        resetVal()
      }
    }
    const resetVal = () => {
      keyboardIns.clearInput()
      keyBoardAngle.value = ''
      keyboardIns.setInput('')
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
          display: {
            '{bksp}': '←',
            '{enter}': 'OK',
            '{esc}': '❌',
            '{reset}': 'CE'
          },
          // inputPattern: /^(?:[1-9][0-9]{0,2}|0)$/,
          // maxLength: 3,
          layout: {
            default: [
              '1 2 3 {esc}',
              '4 5 6 {reset}',
              '7 8 9 {bksp}',
              '. 0 - {enter}',
            ]
          },
          onChange: input => onChange(input),
          onKeyPress: button => onKeyPress(button)
        });
      })

    })

    return () => {

      return (
        <div class={'absolute right-4 bottom-8 h-[10vh] w-[10vh] flex flex-col items-center justify-center'} >
          {
            isMounted.value && <Teleport to="#indexCon">
              <Transition name='slide-fade'>
                <div v-drag={'.global-keyboard-value'} style={{ zIndex: 200 }} class={' absolute bottom-20  w-[32vh] h-[36vh] flex flex-col items-center justify-end'} v-show={keyborardShow.value}>
                  <div class={'w-full h-14 border border-solid border-gray-600 rounded-md p-2 bg-white global-keyboard-value'}>
                    {keyBoardAngle.value}
                  </div>
                  {/* <NInputNumber ref={(e) => { inputRef.value = e as InputType }} class={'w-full'} value={Number(keyBoardAngle.value)} size={'large'} /> */}
                  <div class={'simple-keyboard w-full h-full shrink'}></div>
                </div>
              </Transition>
            </Teleport>
          }


        </div>
      )
    }
  },
})