import { NTabs, NTabPane, NPopselect, NButton, NIcon, PopselectProps, popselectProps, NDropdown, dropdownProps } from "naive-ui";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import activeImg from '@/assets/LineDspButton_inactive.png'
export default defineComponent({
  name: 'BtnComp',
  props: {
    name: String,
    clickFn: {
      type: Function,
    },
    ...dropdownProps
  },
  setup(props, ctx) {

    onMounted(() => {
      console.log("🪵 [PopBtnComp.tsx:15] ~ token ~ \x1b[0;32monMounted\x1b[0m = ", 'BtnComp重新挂在');

    })
    const { name, ...pop } = props
    return () => {
      return (
        // <NDropdown options={commonData.menuOpt} renderLabel={renderLabel} onSelect={handleSelect} trigger="click" placement="bottom-start" size={'large'} class={'text-2xl'} nodeProps={nodeProps} ></NDropdown>
        <NDropdown {...pop} trigger="click" size={'large'} class={'text-2xl my-pop-select btm-menu'}
          nodeProps={(option: any) => {
            return {
              // class: 'w-[17vw]',
              style: {
                width: '17vw',
                fontSize: '1.4rem',
              }
            }
          }
          }
        >
          <NButton secondary strong={true} onClick={() => { props.clickFn && props.clickFn() }} type="primary" size={'large'} class={'h-16 w-full shrink mr-2 '} style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }}
            v-slots={{
              icon: () => {
                return <NIcon class={'text-3xl'}>
                  {ctx.slots.icon && ctx.slots.icon()}
                </NIcon>
              }
            }} >
            <span class={'text-2xl ml-2'}>{props.name}</span>
          </NButton>
        </NDropdown>
      )
    }
  }
})