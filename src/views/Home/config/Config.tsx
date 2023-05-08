import { useConfigStore } from "@/store/config";
import { NButton, NTabs, NTabPane, NIcon, useMessage } from "naive-ui";
import { defineComponent, onMounted, ref } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import TabActiveImg from '@/assets/PnlBtnActive.png'
import Connect from "./Connect";
import DataConfig from "./dataConfig/DataConfig";
import KeyBorad from "@/components/KeyBoard/KeyBorad";
import { KeyboardAltRound } from "@vicons/material";
export default defineComponent({
  name: 'Config',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const msg = useMessage()

    const activeStyle = {
      backgroundImage: `url(${TabActiveImg})`,
      backgroundSize: 'cover',
      color: '#fff'
    }
    const curTabValue = ref('connect')
    const commonStyle = {
      width: '13vw', border: 'none', fontSize: '20px',
      borderBottom: '3px solid #58595a', flexGrow: 1
    }
    const cancel = () => {
      configStore.setIsShowConfig(false)
    }
    const confirm = () => {
      msg.success('应用成功')
    }

    const handleTabChange = (value: string) => {
      curTabValue.value = value
    }

    const invokeKeyBoard = () => {
      window.ipc.invoke('keyboard')
    }
    onMounted(() => {
      // console.log(`config mounted`,);
    })

    return () => {
      return (
        <div class={' w-screen h-screen absolute  flex flex-col z-10 bg-white overflow-hidden'}>

          <div class={'h-full w-full shrink'}>
            <NTabs type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-full'} onUpdateValue={handleTabChange} defaultValue={'connect'} >
              <NTabPane displayDirective="show:lazy" name={"connect"} tab="连接配置" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'connect' ? activeStyle : {} } }}>
                <div class={' h-full shrink'}>
                  <Connect />
                </div>
              </NTabPane>
              <NTabPane displayDirective="show:lazy" name={"data"} tab="数据配置" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'data' ? activeStyle : {} } }}>
                <div class={' h-full '}>
                  <DataConfig />
                </div>
              </NTabPane>

            </NTabs>
          </div>

          <div class={'fixed left-2 bottom-6'}>
            <NButton circle type={'success'} v-slots={{
              icon: () => {
                return <NIcon><KeyboardAltRound /></NIcon>
              }
            }} onClick={invokeKeyBoard} >

            </NButton>
          </div>
          {/* 
          <div class={'w-[40vw] h-[30vh] absolute left-2 bottom-[20vh] bg-red-200 z-[5000]'}>
            <KeyBorad />
          </div> */}

          <div class={'w-full h-20 flex justify-end items-center mt-auto shrink-0'}>
            <NButton secondary strong={true} onClick={cancel} type="primary" size={'large'} class={'h-16 w-[20vw] shrink mr-2 '} style={{ backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }}
              v-slots={{
                // icon: () => {
                //   return <NIcon class={'text-3xl'}>
                //     {ctx.slots.icon && ctx.slots.icon()}
                //   </NIcon>
                // }
              }} >
              <span class={'text-2xl ml-2'}>取消</span>
            </NButton>
            <NButton secondary strong={true} onClick={confirm} type="primary" size={'large'} class={'h-16 w-[20vw]  shrink mr-2 '} style={{ backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }}
              v-slots={{
                // icon: () => {
                //   return <NIcon class={'text-3xl'}>
                //     {ctx.slots.icon && ctx.slots.icon()}
                //   </NIcon>
                // }
              }} >
              <span class={'text-2xl ml-2'}>应用</span>
            </NButton>
          </div>
        </div>
      )
    }
  }

})