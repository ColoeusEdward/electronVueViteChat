import { NTabPane, NTabs } from "naive-ui";
import { defineComponent, ref } from "vue";
import TabActiveImg from '@/assets/PnlBtnActive.png'
import DataMap from "./DataMap";
export default defineComponent({
  name: 'Common',
  setup(props, ctx) {

    const activeStyle = {
      backgroundImage: `url(${TabActiveImg})`,
      backgroundSize: 'cover',
      color: '#fff'
    }
    const curTabValue = ref('dataMap')
    const commonStyle = {
      width: '10vw', border: 'none', fontSize: '20px',
      paddingLeft: '10px',
      // borderBottom: '3px solid #58595a',
      flexGrow: 1
    }
    const handleTabChange = (value: string) => {
      curTabValue.value = value
    }

    return () => {
      return (
        <div class={'w-full h-full'}>
          <NTabs type="card" animated size="medium" pane-class={'shrink-0 h-full'} class={'home-tab no-bg h-full w-full'} onUpdateValue={handleTabChange} defaultValue={'dataMap'} >
            <NTabPane displayDirective="show:lazy" name={"dataMap"} tab="数据映射" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'dataMap' ? activeStyle : {} } }}>
              <div class={' h-full shrink'}>
                <DataMap curTabValue={curTabValue.value} />
              </div>
            </NTabPane>
          </NTabs>
        </div>
      )
    }
  }

})