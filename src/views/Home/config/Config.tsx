import { useConfigStore } from "@/store/config";
import { NButton, NTabs, NTabPane, NIcon, useMessage } from "naive-ui";
import { computed, defineComponent, onMounted, ref } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import TabActiveImg from '@/assets/PnlBtnActive.png'
import Connect from "./Connect";
import DataConfig from "./dataConfig/DataConfig";
import KeyBorad from "@/components/KeyBoard/KeyBorad";
import { KeyboardAltRound } from "@vicons/material";
import { useMain } from "@/store";
import ConnectDevice from "./connectDevice";
import ConfigComp from "./configComp";
import SysConfig from "./sysConfig";
import DevConfig from "./devConfig";
import DataCofigNew from "./dataCofigNew";
import FormulaConfig from "./FormulaConfig";
import AbsBottomBtn from "@/components/AbsBottomBtn";
import { useDataCfgInnerDataStore } from "./dataCofigNew/innerData";
import DataCfgOut from "./dataCfgOut";
export default defineComponent({
  name: 'Config',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const dataCfgInnerData = useDataCfgInnerDataStore()
    const msg = useMessage()
    const store = useMain()

    const activeStyle = {
      backgroundImage: `url(${TabActiveImg})`,
      backgroundSize: 'cover',
      color: '#fff'
    }
    const defaultTab = 'sysConfig'
    const curTabValue = ref('sysConfig')
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
      // window.ipc.invoke('keyboard')
      // store.setGlobalKeyBoardShow(true)
    }
    const btmBtnShow = computed(() => {
      return !dataCfgInnerData.devCfgShow
    })
    onMounted(() => {
      // console.log(`config mounted`,);
    })

    return () => {
      return (
        <div class={' w-screen h-screen absolute  flex flex-col z-10 bg-white overflow-hidden'}>

          <div class={'h-full w-full shrink'} style={{ height: 'calc(100% - 80px)' }}>
            <NTabs type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-full'} onUpdateValue={handleTabChange} defaultValue={defaultTab} >
              <NTabPane displayDirective="show:lazy" name={"sysConfig"} tab="系统配置" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'sysConfig' ? activeStyle : {} } }}>
                <div class={' h-full shrink'}>
                  <SysConfig />
                </div>
              </NTabPane>
              {/* <NTabPane displayDirective="show:lazy" name={"devConfig"} tab="设备配置" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'devConfig' ? activeStyle : {} } }}>
                <div class={' h-full shrink'}>
                  <DevConfig />
                </div>
              </NTabPane> */}
              <NTabPane displayDirective="show:lazy" name={"dataConfig"} tab="数据采集" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'dataConfig' ? activeStyle : {} } }}>
                <div class={' h-full shrink'}>
                  <DataCofigNew />
                </div>
              </NTabPane>
              <NTabPane displayDirective="show:lazy" name={"dataCfgOut"} tab="数据配置" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'dataCfgOut' ? activeStyle : {} } }}>
                <div class={' h-full shrink'}>
                  <DataCfgOut />
                </div>
              </NTabPane>
              {/* <NTabPane displayDirective="show:lazy" name={"formulaConfig"} tab="配方配置" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'formulaConfig' ? activeStyle : {} } }}>
                <div class={' h-full shrink'}>
                  <FormulaConfig />
                </div>
              </NTabPane> */}
              {/* <NTabPane displayDirective="show:lazy" name={"connect"} tab="连接配置" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'connect' ? activeStyle : {} } }}>
                <div class={' h-full shrink'}>
                  <Connect />
                </div>
              </NTabPane> */}
              {/* <NTabPane displayDirective="show:lazy" name={"data"} tab="数据配置" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'data' ? activeStyle : {} } }}>
                <div class={' h-full '}>
                  <DataConfig />
                </div>
              </NTabPane> */}
              {/* <NTabPane displayDirective="show:lazy" name={"connectDevice"} tab="连接设备" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'connectDevice' ? activeStyle : {} } }}>
                <div class={' h-full '}>
                  <ConnectDevice />
                </div>
              </NTabPane> */}
              {/* <NTabPane displayDirective="show:lazy" name={"configComp"} tab="test" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'configComp' ? activeStyle : {} } }}>
                <div class={' h-full '}>
                  <ConfigComp />
                </div>
              </NTabPane> */}

            </NTabs>
          </div>

          {/* <div class={'fixed left-2 bottom-6'} title={'虚拟键盘'}>
            <NButton circle type={'success'} v-slots={{
              icon: () => {
                return <NIcon><KeyboardAltRound /></NIcon>
              }
            }} onClick={invokeKeyBoard} >

            </NButton>
          </div> */}
          {/* 
          <div class={'w-[40vw] h-[30vh] absolute left-2 bottom-[20vh] bg-red-200 z-[5000]'}>
            <KeyBorad />
          </div> */}

          {btmBtnShow.value && <AbsBottomBtn cancelFn={cancel} />}

        </div>
      )
    }
  }

})