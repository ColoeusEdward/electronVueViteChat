import { NTabs, NTabPane, NPopselect, NButton, NIcon } from "naive-ui";
import type { PopselectProps } from 'naive-ui'
import { defineComponent, onUnmounted, ref } from "vue";
import { Tool } from '@vicons/tabler'
import { CandlestickChartRound, AreaChartOutlined, LocalPrintshopFilled } from '@vicons/material'
import PopBtnComp from "@/components/PopBtnComp/PopBtnComp";
import activeImg from '@/assets/LineDspButton_inactive.png'
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
        <NButton secondary strong={true} type="primary" size={'large'} class={'h-16 w-full shrink mr-2'} style={{backgroundImage:`url(${activeImg})`,backgroundSize:'100% 100%',color:'#534d62'}} >
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
    const maintainOption = ref<PopselectProps['options']>([
      { label: '配置', value: 'option' },
      { label: '关机', value: 'shutdown' },
    ])
    const handleOptClick: PopselectProps['onUpdate:value'] = (value) => {
      console.log(value)
    }
    const popSelectList = ref<{option:PopselectProps['options'],name:string,icon?:JSX.Element}[]>([
      {option:maintainOption.value,name:'维护',icon:<Tool />},
      {option:maintainOption.value,name:'产品表',icon:<CandlestickChartRound />},
      {option:maintainOption.value,name:'趋势图',icon:<AreaChartOutlined />},
      {option:maintainOption.value,name:'屏幕打印', icon:<LocalPrintshopFilled />},
    ])


    return () => {
      return (
        <div class={'w-full h-24 mt-auto  flex items-center  px-2'}>
          {popSelectList.value.map((item, index) => {
            return (
              <PopBtnComp name={item.name} options={item.option} key={index}  onUpdateValue={handleOptClick} 
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