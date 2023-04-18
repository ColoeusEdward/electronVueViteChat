import { NTabs, NTabPane, NPopselect, NButton, NIcon, PopselectProps, popselectProps } from "naive-ui";
import { defineComponent, onUnmounted, ref } from "vue";
import activeImg from '@/assets/LineDspButton_inactive.png'
export default defineComponent({
  name: 'BtnComp',
  props:{
    name:String,
    ...popselectProps
  },
  setup(props, ctx) {
    const {name,...pop} = props
    return () => {
      return (
        <NPopselect {...pop}  trigger="click"  size={'large'} class={'text-2xl'}
            nodeProps={(option) => {
              return {
                class: 'w-[12vw]',
                style: {
                  fontSize: '1.2rem'
                }
              }
            }
            }
          >
            <NButton secondary strong={true} type="primary" size={'large'} class={'h-16 w-full shrink mr-2 '} style={{backgroundImage:`url(${activeImg})`,backgroundSize:'100% 100%',color:'#534d62'}}
              v-slots={{
                icon: () => {
                  return <NIcon class={'text-3xl'}>
                    {ctx.slots.icon && ctx.slots.icon()}
                  </NIcon>
                }
              }} >
              <span class={'text-2xl ml-2'}>{props.name}</span>
            </NButton>
          </NPopselect>
      )
    }
  }
})