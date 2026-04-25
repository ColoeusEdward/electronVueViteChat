import { NTabs, NTabPane, useMessage, NIcon, } from "naive-ui";
import { defineComponent, KeepAlive, onMounted, onUnmounted, ref, Transition } from "vue";
import BtmBtn from './BtmBtn'
import PicPane from "./picPane/PicPane";
import RightValueBlock from "./RightValueBlock";
import activeImg from '@/assets/PnlBtnActive.png'
import emptyAduio from '@/assets/10-seconds-of-silence.mp3'
import { useMain } from "@/store";
import { isLowResolution, showKeyBoard, sleep } from "@/utils/utils";
import { useRealTimeStore } from "@/store/realtime";
import Trend from "./trend/Trend";
import Statistical from "./statistical/Statistical";
import Config from "./config/Config";
import { useConfigStore } from "@/store/config";
import GlobalKeyBoard from "./GlobalKeyBoard";
import ProductLine from "./productLine";
import { ActualResult } from "~/me";
import { callFnName } from "@/utils/enum";
import { callSpc, getSysConfig } from "@/utils/call";
import ProductHistory from "./product/productHistory";
import Curcev from "./curcev";
import FormulaConfig from "./config/FormulaConfig";
import MultiCurcev from "./multiCurcev";
import classNames from "classnames";
import { KeyboardAltOutlined } from "@vicons/material";
import GlobalKeyBoard2 from "./GlobalKeyBoard2";
import { callBrige } from "@/utils/callm";
import { useFormulaStore } from "@/store/formula";
import FormulaConfigNew from "./config/formulaConfigNew";
// import { useSvc } from "./svc";
//@ts-ignore

export default defineComponent({
  name: 'Home',
  setup(props) {
    const store = useMain()
    const realtimeStore = useRealTimeStore()
    const configStore = useConfigStore()
    const formulaStore = useFormulaStore()
    window.$message = useMessage()
    store.initDb()
    let startFetch = true
    const activeStyle = {
      backgroundImage: `url(${activeImg})`,
      backgroundSize: 'cover',
      color: '#fff',
      zIndex: 6
    }
    const curTabValue = ref('curcev')
    const commonStyle = {
      width: '12vw', border: 'none', fontSize: '20px',
      minWidth: "120px",
      borderBottom: '3px solid #58595a'
    }
    const audio = new Audio(emptyAduio)
    audio.loop = true
    window.frontFn = {}

    const handleTabChange = (value: string) => {
      curTabValue.value = value
    }
    const handleBlur = () => {
      // window.ipc.invoke('test1').then((val) => {
      //   console.log(`dll`, val);
      // })
      // window.ipc.invoke('serialize',{'fff':'ffggg'}).then((val) => {
      //   console.log(`sdll`, val);
      // })
      audio.play()
    }
    const handleResize = () => {
      store.setIsLowRes(isLowResolution())
    }
    const handleFocus = () => {
      audio.pause()
    }
    const loopGetData = async () => {
      while (startFetch) {
        await sleep(1000)
        realtimeStore.fetchDiameterData()
      }
    }
    const handleAllInputFocuse = (event: any) => {
      if (event.target?.tagName === 'INPUT') {
        store.setLastFocusedInput(event.target)
        // console.log("🚀 ~ file: index.tsx:64 ~ handleAllInputFocuse ~ event.target:", event.target)
        // lastFocusedInput = event.target;
      }

    }
    const keyboradInit = () => {
      // callSpc(callFnName.initKeyboardConfig).then((res: ActualResult) => {
      // })
    }
    const startSpcSys = () => {
      callSpc(callFnName.startSpcSystem).then((res: ActualResult) => {
        console.log(`startSpcSystem `,);
        keyboradInit()
      })
      // window.CefSharp.BindObjectAsync("spcJsBind").then(() => {
      //   window.spcJsBind.startSpcSystem().then(function (actualResult:ActualResult) {
      //     console.info(actualResult);
      //   });
      // })
    }
    store.setIsLowRes(isLowResolution())
    window.addEventListener('resize', handleResize)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('focusin', handleAllInputFocuse);

    getSysConfig()
    onMounted(() => {
      // loopGetData()
      sleep(1000).then(() => {
        if (window.chrome) {
          // startSpcSys()
        }
      })
      callBrige(callFnName.InitDevice).then((res: string) => {

      })
      // callBrige(callFnName.InitService).then((res: string) => {

      // })

    })
    onUnmounted(() => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('focusin', handleAllInputFocuse)
      startFetch = false
    })
    // console.log("🪵 [index.tsx:130] ~ token ~ \x1b[0;32mstore.isLandscape \x1b[0m = ", store.isLandscape);


    return () => {
      return (
        <div class={'w-full h-full flex flex-col overflow-hidden'} id={'indexCon'}>
          <GlobalKeyBoard2 />
          {/* <KeepAlive> */}
          {
            store.isLandscape ? <div class={'h-full flex overflow-hidden'}>
              <div class={'w-2/3'}>
                <div class={"w-full h-[14px] bg-[#39393b] absolute top-[50px] z-[5]"}></div>


                <NTabs type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-full'} onUpdateValue={handleTabChange} defaultValue={'curcev'} >
                  <NTabPane displayDirective="if" name="curcev" tab="实时数据" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'curcev' ? activeStyle : {} } }}>
                    <div class={' h-full'}>
                      <Curcev />
                    </div>
                  </NTabPane>
                  <NTabPane displayDirective="if" name="multiCurcev" tab="趋势图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'multiCurcev' ? activeStyle : {} } }}>
                    <div class={'h-full'}>
                      <MultiCurcev />
                    </div>
                  </NTabPane>
                  <NTabPane displayDirective="if" name="summary" tab="统计图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'summary' ? activeStyle : {} } }}>
                    <div class={'h-full'}>
                      <Statistical />
                    </div>
                  </NTabPane>
                  {/* <NTabPane displayDirective="if" name="pic" tab="图像" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'pic' ? activeStyle : {} } }}>
                <div class={' h-full'}>
                  <PicPane />
                </div>
              </NTabPane> */}
                  {/* <NTabPane displayDirective="if" name="trend" tab="趋势图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'trend' ? activeStyle : {} } }}>
                <div class={'h-full'}>
                  <Trend />
                </div>
              </NTabPane>
              <NTabPane displayDirective="if" name="summary" tab="统计图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'summary' ? activeStyle : {} } }}>
                <div class={'h-full'}>
                  <Statistical />
                </div>
              </NTabPane> */}
                  {/* <NTabPane displayDirective="if" name="productLine" tab="生产线" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'productLine' ? activeStyle : {} } }}>
                <div class={'h-full'}>
                  <ProductLine />
                </div>
              </NTabPane>
              <NTabPane displayDirective="if" name="event" tab="事件" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'event' ? activeStyle : {} } }}>
                Hey Jude
              </NTabPane>
              <NTabPane displayDirective="if" name="print" tab="打印机" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'print' ? activeStyle : {} } }}>
                Hey Jude
              </NTabPane> */}
                </NTabs>
              </div>

              <div class={'w-1/3'}>
                <RightValueBlock />
              </div>
            </div> :
              <div class={'h-full flex overflow-hidden flex-col'}>
                <div class={'h-2/3'}>
                  <div class={"w-full h-[14px] bg-[#39393b] absolute top-[50px] z-[5]"}></div>
                  <NTabs type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-full'} onUpdateValue={handleTabChange} defaultValue={'curcev'} >
                    <NTabPane displayDirective="if" name="curcev" tab="实时数据" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'curcev' ? activeStyle : {} } }}>
                      <div class={' h-full'}>
                        <Curcev />
                      </div>
                    </NTabPane>
                    <NTabPane displayDirective="if" name="multiCurcev" tab="趋势图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'multiCurcev' ? activeStyle : {} } }}>
                      <div class={'h-full'}>
                        <MultiCurcev />
                      </div>
                    </NTabPane>
                  </NTabs>
                </div>
                <div class={'h-1/3 relative'}>
                  <div class={"w-full h-[14px] bg-[#39393b] absolute top-[50px] z-[5]"}></div>


                  <RightValueBlock />
                </div>
              </div>
          }

          {/* </KeepAlive> */}
          {/* <GlobalKeyBoard /> */}
          <BtmBtn />
          <Transition name='full-pop'>
            {configStore.isShowConfig && <Config />}
          </Transition>
          <Transition name='full-pop'>
            {configStore.productHistoryShow && <ProductHistory />}
          </Transition>
          {/* <Transition name='full-pop'>
            {configStore.formulaCfgShow && <FormulaConfig />}
          </Transition> */}
          <Transition name='full-pop'>
            {formulaStore.show && <FormulaConfigNew />}
          </Transition>
          {/* <Transition name='full-pop'>
            {configStore.productLogShow && <ProductLog />}
          </Transition> */}
        </div>
      )
    }
  }

})