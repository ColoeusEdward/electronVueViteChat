import { NTabs, NTabPane, } from "naive-ui";
import { defineComponent, KeepAlive, ref } from "vue";
import BtmBtn from './BtmBtn'
import PicPane from "./picPane/PicPane";
import RightValueBlock from "./RightValueBlock";
import activeImg from '@/assets/PnlBtnActive.png'
// import { useSvc } from "./svc";

export default defineComponent({
  name: 'Home',
  setup(props) {
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

    const handleTabChange = (value: string) => {
      curTabValue.value = value
    }

    return () => {
      return (
        <div class={'w-full h-full flex flex-col  '}>
          {/* <KeepAlive> */}
          <div class={'h-full flex'}>
            <NTabs type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-2/3'} onUpdateValue={handleTabChange} >
              <NTabPane displayDirective="show:lazy" name="pic" tab="图像" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'pic' ? activeStyle : {} } }}>
                <div class={' h-full'}>
                  <PicPane />
                </div>
              </NTabPane>
              <NTabPane displayDirective="show:lazy" name="trend" tab="趋势图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'trend' ? activeStyle : {} } }}>
                Hey Jude
              </NTabPane>
              <NTabPane displayDirective="show:lazy" name="summary" tab="统计图" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'summary' ? activeStyle : {} } }}>
                七里香
              </NTabPane>
              <NTabPane displayDirective="show:lazy" name="product" tab="生产线" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'product' ? activeStyle : {} } }}>
                Hey Jude
              </NTabPane>
              <NTabPane displayDirective="show:lazy" name="event" tab="事件" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'event' ? activeStyle : {} } }}>
                Hey Jude
              </NTabPane>
              <NTabPane displayDirective="show:lazy" name="print" tab="打印机" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'print' ? activeStyle : {} } }}>
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