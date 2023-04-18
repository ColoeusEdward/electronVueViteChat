import { NTabs, NTabPane } from "naive-ui";
import { defineComponent, ref } from "vue";
import activeImg from '@/assets/PnlBtnActive.png'

export default defineComponent({
  name: 'RightValueBlock',
  setup(props, ctx) {
    const activeStyle = {
      backgroundImage: `url(${activeImg})`,
      backgroundSize: 'cover',
      color: '#fff'
    }
    const commonStyle = {
      width: '10vw', border: 'none', fontSize: '20px',
      borderBottom: '3px solid #58595a'
    }
    const curTabValue = ref('value1')

    const handleTabChange = (value: string) => {
      curTabValue.value = value
    }

    return () => {
      return (
        <NTabs type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-full'} onUpdateValue={handleTabChange} >
          <NTabPane name="value1" tab="value1" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value1' ? activeStyle : {} } }}>
            <div class={' h-full'}>

            </div>
          </NTabPane>
          <NTabPane name="value2" tab="value2" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value2' ? activeStyle : {} } }}>
            Hey Jude
          </NTabPane>
          <NTabPane name="value3" tab="value3" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value3' ? activeStyle : {} } }}>
            七里香
          </NTabPane>
        </NTabs>
      )
    }
  }

})