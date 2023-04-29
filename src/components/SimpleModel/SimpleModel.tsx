import { } from "naive-ui";
import { computed, defineComponent, Transition, ref, watch } from "vue";

export default defineComponent({
  name: 'SimpleModel',
  props: {
    show: Boolean
  },
  setup(props, ctx) {
    const show = computed(() => props.show)

    const hide = () => {
      ctx.emit('update:show', false)
    }
    return () => {
      if(!show.value){
        return ''
      }
      return (

        <div class={'w-full h-full absolute  bg-gray-600/50 '} onClick={hide}>
          <Transition name={'full-pop'}>
            <div class={'w-full h-80 bg-white min-h-min absolute bottom-0'}>
              {ctx.slots.default && ctx.slots.default()}
            </div>
          </Transition>


        </div>

      )
    }
  }

})