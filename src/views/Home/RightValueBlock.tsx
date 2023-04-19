import { NTabs, NTabPane, NDropdown } from "naive-ui";
import { computed, defineComponent, ref } from "vue";
import activeImg from '@/assets/PnlBtnActive.png'
import { useMain } from "@/store";
import closeBtn from '@/assets/LedCloseBtn.png'
import addBtn from '@/assets/LedAddBtn.png'
import lefticon from '@/assets/SymLeft.png'
import righticon from '@/assets/SymRight.png'
import { storeToRefs } from "pinia";

const ValueRow = defineComponent({
  name: 'ValueRow',
  props: {
    data: Object
  },
  setup(props, ctx) {
    const store = useMain()
    const data = computed(() => {
      return props.data || {}
    })
    const { dataSourceList } = storeToRefs(store)

    const handleMenuSelect = () => {
      console.log('handleMenuSelect')
    }

    const renderLabel = () => {

    }

    const nodeProps = () => {

    }

    return () => {
      return (
        <div class={'w-full h-1/6  shrink mb-1'}>
          <div class={'flex items-center w-full h-1/4 pb-1'}>
            <span>{data.value.label || ''}</span>
            < NDropdown options={dataSourceList.value} trigger="click" onSelect={handleMenuSelect} size={'large'} class={'text-2xl'}  >
              <img class={'ml-auto h-full cursor-pointer'} src={data.value.label ? closeBtn : addBtn}></img>
            </NDropdown>
          </div>
          <div class={'flex items-center w-full h-1/2 border border-solid border-[#e4e4e5] shadow-inner'}>
            <div class={'w-full h-full shrink bg-white flex justify-end pr-3 items-center'}>
              <span class={'text-6xl font-semibold text-[#003a62]'} >{data.value.value || ''}</span>
            </div>
            <div class={'h-full px-2 flex flex-col justify-end text-lg font-semibold text-[#5e5452]'} style={{ backgroundImage: `linear-gradient(#cdcdcd, #f2f2f2 ,#cdcdcd)` }} >
              <span >{data.value.unit || '  '}</span>
            </div>
          </div>
          <div class={'flex items-center w-full h-1/4 pt-1'}>
            <div class={'h-full w-1/6 flex cursor-pointer btn-bg'} ><img class={'m-auto h-1/2'} src={lefticon}></img></div>
            <div class={'h-full w-full shrink btn-bg mx-2'}></div>
            <div class={'h-full w-1/6 flex cursor-pointer btn-bg'}><img class={'m-auto  h-1/2'} src={righticon}></img></div>
          </div>
        </div>
      )
    }
  }

})

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
            <div class={' h-full px-2 flex flex-col'}>
              {new Array(6).fill({}).map((_, i) => {
                return <ValueRow key={i} />
              })}
            </div>
          </NTabPane>
          <NTabPane name="value2" tab="value2" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value2' ? activeStyle : {} } }}>
            <div class={' h-full px-2 flex flex-col'}>
              {new Array(6).fill({}).map((_, i) => {
                return <ValueRow key={i} />
              })}
            </div>

          </NTabPane>
          <NTabPane name="value3" tab="value3" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value3' ? activeStyle : {} } }}>
            <div class={' h-full px-2 flex flex-col'}>
              {new Array(6).fill({}).map((_, i) => {
                return <ValueRow key={i} />
              })}
            </div>
          </NTabPane>
        </NTabs>
      )
    }
  }

})