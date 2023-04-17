import { NConfigProvider, NTabs, NTabPane, zhCN } from "naive-ui";
import { defineComponent } from "vue";


export default defineComponent({
  name: 'Home',
  setup(props) {


    return () => {
      return (
        <div class={'w-full h-full px-2'}>
          <NConfigProvider locale={zhCN}>
            <NTabs type="line" animated size="large" barWidth={1148}>
              <NTabPane name="pic" tab="图      像" tab-props={{ width: '200px' }}>
                Wonderwall
              </NTabPane>
              <NTabPane name="trend" tab="趋势图">
                Hey Jude
              </NTabPane>
              <NTabPane name="summary" tab="统计图">
                七里香
              </NTabPane>
            </NTabs>
          </NConfigProvider>
        </div>
      )
    }
  }

})