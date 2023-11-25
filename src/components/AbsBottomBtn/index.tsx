import { NButton } from "naive-ui";
import { defineComponent } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'

export default defineComponent({
  name: 'AbsBottomBtn',
  props:{
    cancelFn:{
      type:Function,
      default:() => {}
    }
  },
  setup(props,ctx) {


    return () => {
      return (
        <div class={'w-full h-20 flex justify-end items-center mt-auto shrink-0 border-0 border-t border-solid border-gray-200 '}>
            <NButton secondary strong={true} onClick={() => {props.cancelFn()}} type="primary" size={'large'} class={'h-16 w-[20vw] shrink mr-2 '} style={{ backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }}
              v-slots={{
                // icon: () => {
                //   return <NIcon class={'text-3xl'}>
                //     {ctx.slots.icon && ctx.slots.icon()}
                //   </NIcon>
                // }
              }} >
              <span class={'text-2xl ml-2'}>返回</span>
            </NButton>
            {/* <NButton secondary strong={true} onClick={confirm} type="primary" size={'large'} class={'h-16 w-[20vw]  shrink mr-2 '} style={{ backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }}
              v-slots={{
                // icon: () => {
                //   return <NIcon class={'text-3xl'}>
                //     {ctx.slots.icon && ctx.slots.icon()}
                //   </NIcon>
                // }
              }} >
              <span class={'text-2xl ml-2'}>应用</span>
            </NButton> */}
          </div>
      )
    }
  }

})