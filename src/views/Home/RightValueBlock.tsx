import { NTabs, NTabPane, NDropdown, DropdownProps, MenuOption, NScrollbar } from "naive-ui";
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";
import activeImg from '@/assets/PnlBtnActive.png'
import { useMain } from "@/store";
import closeBtn from '@/assets/LedCloseBtn.png'
import addBtn from '@/assets/LedAddBtn.png'
import lefticon from '@/assets/SymLeft.png'
import righticon from '@/assets/SymRight.png'
import { storeToRefs } from "pinia";
import { useRealTimeStore } from "@/store/realtime";
import { sleep } from "@/utils/utils";
import { useCurcevInnerDataStore } from "./curcev/innerData";
import { CpkModel } from "~/me";
import { cpkModelPropName } from "./curcev/enum";
import classNames from "classnames";

const ValueRow = defineComponent({
  name: 'ValueRow',
  props: {
    data: Object,
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    fixNum:{
      type:Number,
      default:8
    }
  },
  setup(props, ctx) {
    const store = useMain()
    const realtimeStore = useRealTimeStore()
    const curOption = ref<MenuOption>()
    const { dataSourceList } = storeToRefs(store)
    const curStandIdx = ref(0)

    const initOption = () => {
      store.rightBlockDataMap[props.x][props.y] && (
        curOption.value = store.rightBlockDataMap[props.x][props.y]
      )
    }
    initOption()


    // const data = computed(() => {
    //   if (!curOption.value) return {}
    //   return realtimeStore.rightRealTimeData[curOption.value.key as string] || {}
    // })


    const handleMenuSelect: DropdownProps['onSelect'] = (val, option) => {
      curOption.value = option
      store.addRightBlockData(option, props.x, props.y)
    }
    const handleDel = () => {
      curOption.value = {}
      store.removeRightBlockData(props.x, props.y)
    }
    // const standLeft = () => {
    //   if (!data.value) return
    //   if (curStandIdx.value == 0) {
    //     curStandIdx.value = data.value.stand.length - 1
    //   } else {
    //     curStandIdx.value--
    //   }
    // }
    // const standRight = () => {
    //   if (!data.value) return
    //   if (curStandIdx.value == data.value.stand.length - 1) {
    //     curStandIdx.value = 0
    //   } else {
    //     curStandIdx.value++
    //   }
    // }


    // const renderAddOrDel = () => {
    //   return !data.value.label ?
    //     < NDropdown options={dataSourceList.value} trigger="click" onSelect={handleMenuSelect} size={'large'} class={'text-2xl'}  >
    //       <img class={'ml-auto h-full cursor-pointer'} src={addBtn}></img>
    //     </NDropdown> :
    //     <img class={'ml-auto h-full cursor-pointer'} src={closeBtn} onClick={handleDel} ></img>
    // }


    return () => {
      return (
        <div class={'w-full shrink mb-1'}>
          <div class={classNames('flex items-center w-full  py-1',{'pt-0':props.y==0}) }>
            <span class={'text-2xl'}>{props.data?.title || ''}</span>
            {/* {renderAddOrDel()} */}
          </div>
          <div class={'flex items-end w-full  border border-solid border-[#e4e4e5] shadow-inner'} style={{ backgroundImage: `linear-gradient(#cdcdcd, #f2f2f2 ,#cdcdcd)` }}>
            <div class={'w-full h-full shrink bg-white flex justify-end pr-3 items-center py-3 value-number'}>
              <span class={classNames(' font-semibold text-[#003a62]',{'text-4xl':store.isLowRes,' text-6xl':!store.isLowRes})} >{props.data?.value.toFixed(props.fixNum)  || ''}</span>
            </div>
            <div class={'h-full pl-2 min-w-[50px] flex flex-col justify-end text-lg font-semibold text-[#5e5452]'}  >
              <span class={'mb-2'}>{props.data?.unit || '  '}</span>
            </div>
          </div>
          {/* <div class={'flex items-center w-full h-1/4 pt-1'}>
            <div class={'h-full w-1/6 flex cursor-pointer btn-bg'} onClick={standLeft} ><img class={'m-auto h-1/2'} src={lefticon}></img></div>
            <div class={'h-full w-full shrink btn-bg mx-2 flex items-center justify-center'}>
              <span class={` font-semibold ${store.isLowRes ? ' text-xs' : 'text-base '}`}>{data.value.stand ? data.value.stand[curStandIdx.value] : ' '}</span>
            </div>
            <div class={'h-full w-1/6 flex cursor-pointer btn-bg'} onClick={standRight} ><img class={'m-auto  h-1/2'} src={righticon}></img></div>
          </div> */}
        </div>
      )
    }
  }

})
//------------------------------------------------------------------------------------------------------------------
export default defineComponent({
  name: 'RightValueBlock',
  setup(props, ctx) {
    const curCevInnerData = useCurcevInnerDataStore()
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
    let startLoop = false
    const cpkList = computed(() => {
      if(!curCevInnerData.curCpk) return []
      let list = Object.keys(curCevInnerData.curCpk).map((key) => {
        let k = key as keyof CpkModel
        return {
          label: key,
          title: cpkModelPropName[k],
          value: curCevInnerData.curCpk![k],
          unit: curCevInnerData.curDataCfgEntity?.Unit
        }
      })
      let sortList = [] as typeof list
      let tempList = ['Avg','Max','Min','Sd','Ca','Cp','Cpk']
      list.forEach(e => {
        let idx = tempList.findIndex(e1 => e1 == e.label)
        if(idx > -1){
          sortList[idx] = e
        }
      })
          // console.log("🚀 ~ cpkList ~ sortList:", sortList)
          return sortList
    })
    const fixNumRef = computed(() => {
      let val = curCevInnerData.sysConfig.find(e => e.Name == 'Precision')?.Value
      return Number(val)
    })
    const handleTabChange = (value: string) => {
      curTabValue.value = value
    }
    const loopShow = async () => {
      const arr = new Array(3)
      while (startLoop) {
        await sleep(5000)
        let idx = curTabValue.value.slice(-1) as unknown as number
        // console.log("🚀 ~ file: RightValueBlock.tsx:134 ~ loopShow ~ idx:", idx)
        if (idx == arr.length) {
          idx = 1
        } else {
          idx++;
        }
        curTabValue.value = `value${idx}`
      }
    }

    onMounted(() => {
      // loopShow()
    })

    onUnmounted(() => {
      startLoop = false
    })

    return () => {
      return (
        <NTabs type="card" animated size="large" barWidth={1148} value={curTabValue.value} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-full'} onUpdateValue={handleTabChange} defaultValue={'value1'} >
          <NTabPane displayDirective="show:lazy" name="value1" tab="value" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value1' ? activeStyle : {} } }}>
            <div class={' h-full px-2 flex flex-col overflow-y-auto'}>
              {/* <NScrollbar> */}
                {cpkList.value.map((e, i) => {
                  return <ValueRow key={i} x={0} y={i} data={e} fixNum={fixNumRef.value} />
                })}
              {/* </NScrollbar> */}

            </div>
          </NTabPane>
          {/* <NTabPane displayDirective="show:lazy" name="value2" tab="value2" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value2' ? activeStyle : {} } }}>
            <div class={' h-full px-2 flex flex-col'}>
              {new Array(6).fill({}).map((_, i) => {
                return <ValueRow key={i} x={1} y={i} />
              })}
            </div>

          </NTabPane>
          <NTabPane displayDirective="show:lazy" name="value3" tab="value3" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value3' ? activeStyle : {} } }}>
            <div class={' h-full px-2 flex flex-col'}>
              {new Array(6).fill({}).map((_, i) => {
                return <ValueRow key={i} x={2} y={i} />
              })}
            </div>
          </NTabPane> */}
        </NTabs>
      )
    }
  }

})