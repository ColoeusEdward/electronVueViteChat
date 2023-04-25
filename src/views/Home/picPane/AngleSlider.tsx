
import { NInputNumber } from "naive-ui";
import { defineComponent, onMounted, onUnmounted, watch, ref, Transition, Teleport, nextTick } from "vue";

import { useMain } from "@/store";
import Slider from "vue3-slider"
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

type InputType = InstanceType<typeof NInputNumber> | null
export default defineComponent({
  name: 'AngleSlider',
  setup(props, ctx) {
    const store = useMain()
    const angle = ref(0)
    const keyBoardAngle = ref<string | number>(store.eccAngle)
    const keyborardShow = ref(false)
    const isMounted = ref(false)
    const inputRef = ref<InputType>()
    let keyboardIns: Keyboard



    const handleDragEnd = () => {
      // console.log(angle.value)
      store.setEccAngle(angle.value)
    }

    const valueClick = () => {
      keyborardShow.value = !keyborardShow.value
    }
    const onChange = (value: string) => {
      let num = Number(value)
      if (num >= 359) {
        num = 359
      }
      keyBoardAngle.value = num
      // keyboardIns.setInput(String(num))
    }
    const onKeyPress = (button: string) => {
      if (button == '{enter}') {
        angle.value = Number(keyBoardAngle.value)
        store.setEccAngle(angle.value)
        keyborardShow.value = false
      }
      if (button == '0' && keyBoardAngle.value == 0) {  //该组件有个bug,开头狂按0会正常写入组件内部, 需要手动清空
        keyboardIns.clearInput()
      }
    }

    watch(keyborardShow, (nv) => {
      if (nv) {
        keyboardIns.clearInput()
        keyBoardAngle.value = ''
        keyboardIns.setInput('')
      }
    })

    onMounted(() => {
      isMounted.value = true
      nextTick(() => {
        keyboardIns = new Keyboard({
          display: {
            '{bksp}': '←',
            '{enter}': 'OK'
          },
          inputPattern: /^(?:[1-9][0-9]{0,2}|0)$/,
          // maxLength: 3,
          layout: {
            default: [
              '1 2 3',
              '4 5 6',
              '7 8 9',
              '0 {bksp} {enter}'
            ]
          },
          onChange: input => onChange(input),
          onKeyPress: button => onKeyPress(button)
        });
      })

    })

    return () => {

      return (
        <div class={'absolute right-4 bottom-8 h-[10vh] w-[10vh] flex flex-col items-center justify-center'}>
          <span class={'text-lg font-medium mb-2'}>扭转</span>
          <Slider v-model={angle.value} color="#456e9c" track-color="#FEFEFE" orientation={'circular'} max={359} min={0} onDragEnd={handleDragEnd} />

          <span class={'absolute top-1/2 left-1/2  -ml-8 w-16 h-8 flex items-center justify-center text-lg font-medium shadow-md rounded-lg cursor-pointer border-0 border-t border-solid border-t-gray-200'} onClick={valueClick} >{angle.value + '°'}</span>

          {
            isMounted.value && <Teleport to="#OutToleranceCon">
              <Transition name='slide-fade'>
                <div class={' absolute bottom-8 right-[16vh] w-[26vh] h-[36vh] flex flex-col items-center justify-end'} v-show={keyborardShow.value}>
                  <NInputNumber ref={(e) => { inputRef.value = e as InputType }} class={'w-full'} value={Number(keyBoardAngle.value)} size={'large'} />
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