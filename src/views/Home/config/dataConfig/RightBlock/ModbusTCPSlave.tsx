import { NTabPane, NTabs } from "naive-ui";
import { defineComponent, ref } from "vue";
import TabActiveImg from '@/assets/PnlBtnActive.png'
import DataMap from "./DataMap";
import RealTimeData from "./RealTimeData";
import WatchData from "./WatchData";
import AlarmData from "./AlarmData";
export default defineComponent({
  name: 'ModbusTCPSlave',
  setup(props, ctx) {

    const activeStyle = {
      backgroundImage: `url(${TabActiveImg})`,
      backgroundSize: 'cover',
      color: '#fff'
    }
    const curTabValue = ref('dataMap')
    const commonStyle = {
      width: '10vw', border: 'none', fontSize: '20px',
      paddingLeft:'10px',
      // borderBottom: '3px solid #58595a',
       flexGrow: 1
    }
    const handleTabChange = (value: string) => {
      curTabValue.value = value
    }

    return () => {
      return (
        <div class={'w-full h-full'}>
          <NTabs type="card" animated size="medium"  pane-class={'shrink-0 h-full'} class={'home-tab no-bg h-full w-full'} onUpdateValue={handleTabChange} defaultValue={'dataMap'} >
            <NTabPane displayDirective="show:lazy" name={"dataMap"} tab="数据映射" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'dataMap' ? activeStyle : {} } }}>
              <div class={' h-full shrink'}>
                <DataMap curTabValue={curTabValue.value} />
              </div>
            </NTabPane>
            {/* <NTabPane displayDirective="show:lazy" name={"dataQuery"} tab="数据请求" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'data' ? activeStyle : {} } }}>
              <div class={' h-full '}>
              </div>
            </NTabPane> */}
            <NTabPane displayDirective="show:lazy" name={"realTime"} tab="实时数据" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'realTime' ? activeStyle : {} } }}>
              <div class={' h-full shrink'}>
                <RealTimeData curTabValue={curTabValue.value} />
              </div>
            </NTabPane>
            <NTabPane displayDirective="show:lazy" name={"watchData"} tab="监控数据" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'watchData' ? activeStyle : {} } }}>
              <div class={' h-full shrink'}>
                <WatchData curTabValue={curTabValue.value} />
              </div>
            </NTabPane>
            <NTabPane displayDirective="show:lazy" name={"alarmData"} tab="报警数据" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'alarmData' ? activeStyle : {} } }}>
              <div class={' h-full shrink'}>
                <AlarmData curTabValue={curTabValue.value} />
              </div>
            </NTabPane>
          </NTabs>
        </div>
      )
    }
  }

})