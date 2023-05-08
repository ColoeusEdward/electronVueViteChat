import { } from "naive-ui";
import Keyboard from "simple-keyboard";
import { defineComponent, nextTick, onMounted } from "vue";
import "simple-keyboard/build/css/index.css";

export default defineComponent({
  name: 'KeyBorad',
  setup(props, ctx) {
    let keyboardIns: Keyboard

    const onChange = (value: string) => {
      // let num = Number(value)
      // if (num >= 359) {
      //   num = 359
      // }
      // keyBoardAngle.value = num
      // keyboardIns.setInput(String(num))
    }
    const onKeyPress = (button: string) => {
      // if (button == '{enter}') {
      //   angle.value = Number(keyBoardAngle.value)
      //   store.setEccAngle(angle.value)
      //   keyborardShow.value = false
      // }
      // if (button == '0' && keyBoardAngle.value == 0) {  //该组件有个bug,开头狂按0会正常写入组件内部, 需要手动清空
      //   keyboardIns.clearInput()
      // }
    }

    onMounted(() => {
      nextTick(() => {
        keyboardIns = new Keyboard({
          // display: {
          //   '{bksp}': '←',
          //   '{enter}': 'OK'
          // },
          // inputPattern: /^(?:[1-9][0-9]{0,2}|0)$/,
          // maxLength: 3,
          // layout: {
          //   default: [
          //     '1 2 3',
          //     '4 5 6',
          //     '7 8 9',
          //     '0 {bksp} {enter}'
          //   ]
          // },
          onChange: input => onChange(input),
          onKeyPress: button => onKeyPress(button)
        });
      })

    })
    return () => {
      return (
        <div class={'simple-keyboard w-full h-full '}></div>
      )
    }
  }

})