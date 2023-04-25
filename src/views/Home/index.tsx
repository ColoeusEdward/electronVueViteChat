import { NTabs, NTabPane, } from "naive-ui";
import { defineComponent, KeepAlive, onMounted, onUnmounted, ref } from "vue";
import BtmBtn from './BtmBtn'
import PicPane from "./picPane/PicPane";
import RightValueBlock from "./RightValueBlock";
import activeImg from '@/assets/PnlBtnActive.png'
import emptyAduio from '@/assets/empty_loop_for_js_performance.wav'
import { useMain } from "@/store";
import { isLowResolution, sleep } from "@/utils/utils";
import { useRealTimeStore } from "@/store/realtime";
import Trend from "./trend/Trend";
// import { useSvc } from "./svc";
//@ts-ignore

export default defineComponent({
  name: 'Home',
  setup(props) {
    const store = useMain()
    const realtimeStore = useRealTimeStore()
    let startFetch = true
    const activeStyle = {
      backgroundImage: `url(${activeImg})`,
      backgroundSize: 'cover',
      color: '#fff'
    }
    const curTabValue = ref('pic')
    const commonStyle = {
      width: '10vw', border: 'none', fontSize: '20px',
      borderBottom: '3px solid #58595a'
    }
    const audio = new Audio(emptyAduio)
    audio.loop = true


    const handleTabChange = (value: string) => {
      curTabValue.value = value
    }
    const handleBlur = () => {
      window.ipc.invoke('test1').then((val) => {
        console.log(`dll`, val);
      })
      // window.ipc.invoke('serialize',{'fff':'ffggg'}).then((val) => {
      //   console.log(`sdll`, val);
      // })
      audio.play()
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


    store.setIsLowRes(isLowResolution())
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    onMounted(() => {
      loopGetData()


    })

    onUnmounted(() => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      startFetch = false
    })


    return () => {
      return (
        <div class={'w-full h-full flex flex-col  '}>
          {/* <KeepAlive> */}
          <div class={'h-full flex overflow-hidden'}>
            <NTabs type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-2/3'} onUpdateValue={handleTabChange} defaultValue={'pic'} >
              <NTabPane displayDirective="if" name="pic" tab="图像" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'pic' ? activeStyle : {} } }}>
                <div class={' h-full'}>
                  <PicPane />
                </div>
              </NTabPane>
              <NTabPane displayDirective="if" name="trend" tab="趋势图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'trend' ? activeStyle : {} } }}>
                <div class={'h-full'}>
                  <Trend />
                </div>
              </NTabPane>
              <NTabPane displayDirective="if" name="summary" tab="统计图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'summary' ? activeStyle : {} } }}>
                七里香
              </NTabPane>
              <NTabPane displayDirective="if" name="product" tab="生产线" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'product' ? activeStyle : {} } }}>
                Hey Jude
              </NTabPane>
              <NTabPane displayDirective="if" name="event" tab="事件" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'event' ? activeStyle : {} } }}>
                Hey Jude
              </NTabPane>
              <NTabPane displayDirective="if" name="print" tab="打印机" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'print' ? activeStyle : {} } }}>
                Hey Jude
              </NTabPane>
            </NTabs>
            <div class={'w-1/3'}>
              <RightValueBlock />
            </div>
          </div>
          {/* </KeepAlive> */}
          <BtmBtn />
        </div>
      )
    }
  }

})