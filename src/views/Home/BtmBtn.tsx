import { NTabs, NTabPane, NPopselect, NButton, NIcon } from "naive-ui";
import type { PopselectProps } from 'naive-ui'
import { defineComponent, onUnmounted, ref } from "vue";
import { Tool } from '@vicons/tabler'
import { CandlestickChartRound, AreaChartOutlined, LocalPrintshopFilled } from '@vicons/material'
import PopBtnComp from "@/components/PopBtnComp/PopBtnComp";
import activeImg from '@/assets/LineDspButton_inactive.png'
import { useConfigStore } from "@/store/config";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
const TimeBlock = defineComponent({
  name: 'TimeBlock',
  setup() {
    const nowTime = ref(new Date().toLocaleString());
    const interval = setInterval(() => {
      nowTime.value = new Date().toLocaleString();
    }, 1000);
    onUnmounted(() => {
      clearInterval(interval);
    })
    return () => {
      return (
        <NButton secondary strong={true} type="primary" size={'large'} class={'h-16 w-full shrink mr-2'} style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }} >
          <span class={'text-2xl'}>{
            nowTime.value
          }</span>
        </NButton>
      )
    }
  }
})



export default defineComponent({
  name: 'BtmBtn',  //底部按钮栏
  setup(props) {

    const configStore = useConfigStore()
    const maintainOption = [
      { label: '配置', value: 'option' },
      { label: '运行日志', value: 'log' },
      { label: '诊断程序', value: 'diag' },
      { label: '趋势图/打印机', value: 'chartAndprint' },
      { label: '退出', value: 'shutdown' },
      // { label: '组态test', value: 'datav' },
      // { label: '检查元素', value: 'devTool' },
    ]
    const productOption = [
      { label: '产品历史记录', value: 'productHistory' },
      // { label: '产品日志', value: 'productLog' },
      // { label: '设定产品表', value: 'setproduct' },
    ]
    const chartOption = [
      { label: '配方配置', value: 'formulaCfg' },
    ]
    const maintainOption2 = ref<PopselectProps['options']>([
      { label: '配置', value: 'option' },
      { label: '关机', value: 'shutdown' },
    ])
    const handleOptClick: PopselectProps['onUpdate:value'] = (value: string) => {
      let valueMap: Record<string, () => void> = {
        option: () => {
          configStore.setIsShowConfig(true)
        },
        datav: () => {
          window.open('datav/index.html')
        },
        shutdown: () => {
          callSpc(callFnName.closeApp).then(() => {
          })
        },
        productHistory: () => {
          configStore.setProductHistoryShow(true)
        },
        productLog: () => {
          configStore.setProductLogShow(true)
        },
        formulaCfg: () => {
          configStore.setFormulaCfgShow(true)
        }
        // devTool: () => {
        //   window.ipc.send('devTools','open')
        // }
      }
      valueMap[value] && valueMap[value]()

    }
    const popSelectList = ref<{ option: PopselectProps['options'], name: string, icon?: JSX.Element }[]>([
      { option: maintainOption, name: '维护', icon: <Tool /> },
      { option: productOption, name: '产品表', icon: <CandlestickChartRound /> },
      { option: chartOption, name: '配方', icon: <AreaChartOutlined /> },
      { option: maintainOption2.value, name: 'test', icon: <LocalPrintshopFilled /> },
    ])


    return () => {
      return (
        <div class={'w-full h-24 mt-auto  flex items-center  px-2'}>
          {popSelectList.value.map((item, index) => {
            return (
              <PopBtnComp name={item.name} options={item.option} key={index} onUpdateValue={handleOptClick}
                v-slots={{
                  icon: () => {
                    return item.icon
                  }
                }}
              />
            )
          })}
          <TimeBlock />
        </div>
      )
    }
  }

})