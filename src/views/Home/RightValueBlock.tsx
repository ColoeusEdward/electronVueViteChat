import { NTabs, NTabPane, NDropdown, DropdownProps, MenuOption, NScrollbar } from "naive-ui";
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref } from "vue";
import activeImg from '@/assets/PnlBtnActive.png'
import { useMain } from "@/store";
import closeBtn from '@/assets/LedCloseBtn.png'
import addBtn from '@/assets/LedAddBtn.png'
import lefticon from '@/assets/SymLeft.png'
import righticon from '@/assets/SymRight.png'
import { storeToRefs } from "pinia";
import { useRealTimeStore } from "@/store/realtime";
import { buildMenuOpt, getLocalStorage, setLocalStorage, sleep } from "@/utils/utils";
import { useCurcevInnerDataStore } from "./curcev/innerData";
import { CpkModel, menuOption } from "~/me";
import { cpkModelPropName } from "./curcev/enum";
import classNames from "classnames";
import RightOtherValue from "./RightOtherValue";
import { useConfigStore } from "@/store/config";
import { useSvc } from "./svc";

export interface RightValueType {
  label?: string,
  title?: string,
  value?: number,
  unit?: string,
  stand?: RightValueType[]
}
let defStandValList: RightValueType[] = [
  {
    label: 'pc',
    title: '偏差',
    value: 0
  },
  {
    label: 'bcz',
    title: '标称值',
    value: 0
  }
]
export const ValueRow = defineComponent({
  name: 'ValueRow',
  props: {
    data: Object as PropType<RightValueType>,
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    fixNum: {
      type: Number,
      default: 8
    },
    i: {
      type: Number,
      default: -1
    }
  },
  setup(props, ctx) {
    const store = useMain()
    const realtimeStore = useRealTimeStore()
    const curCevInnerData = useCurcevInnerDataStore()
    const curOption = ref<MenuOption>()
    // const { dataSourceList } = storeToRefs(store)
    const dataSourceList = computed(() => curCevInnerData.dataCfgList.map(e => {
      return {
        ...buildMenuOpt(e),
        children: e.children?.map(ee => buildMenuOpt(ee))
      }
    }))
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

    const data = computed(() => {
      console.log("🪵 [RightValueBlock.tsx:94] ~ token ~ \x1b[0;32mprops.data\x1b[0m = ", props.data);
      let dat: RightValueType = {
        stand: defStandValList as Object[],
        label: '',
        title: '',
        value: 0
      }
      if (!props.data) return dat
      if (!props.data.stand) {
        props.data.stand = defStandValList as Object[]
      }
      if (props.data.label && !props.data.value) {
        props.data.value = 0
      }
      return props.data
    })


    // const handleMenuSelect: DropdownProps['onSelect'] = (val, option) => {
    //   curOption.value = option
    //   store.addRightBlockData(option, props.x, props.y)
    // }
    const handleMenuSelect: DropdownProps['onSelect'] = (val, option) => {
      console.log("🪵 [RightValueBlock.tsx:103] ~ token ~ \x1b[0;32mval\x1b[0m = ", val, option);
      curOption.value = option
      let list: menuOption[] = curCevInnerData.infoList
      if (props.i > -1) {
        list[props.i] = option as menuOption
      }
      curCevInnerData.setInfoList(list)
      // store.addRightBlockData(option, props.x, props.y)
    }
    const handleDel = () => {
      curOption.value = {}
      // store.removeRightBlockData(props.x, props.y)
      let list: menuOption[] = curCevInnerData.infoList
      if (props.i > -1) {
        list[props.i] = {} as menuOption
      }
      curCevInnerData.setInfoList(list)
    }
    const standLeft = () => {
      if (!data.value) return
      if (curStandIdx.value == 0) {
        curStandIdx.value = data.value.stand!.length - 1
      } else {
        curStandIdx.value--
      }
    }
    const standRight = () => {
      if (!data.value) return
      if (curStandIdx.value == data.value.stand!.length - 1) {
        curStandIdx.value = 0
      } else {
        curStandIdx.value++
      }
    }


    const renderAddOrDel = () => {
      return !data.value.label ?
        < NDropdown options={dataSourceList.value} trigger="click" onSelect={handleMenuSelect} size={'large'} class={'text-2xl'}  >
          <img class={'ml-auto h-[30px] relative top-[2px] cursor-pointer'} src={addBtn}></img>
        </NDropdown> :
        <img class={'ml-auto h-[30px] relative top-[2px]   cursor-pointer'} src={closeBtn} onClick={handleDel} ></img>
    }


    return () => {
      return (
        <div class={classNames(' shrink mb-1', { 'w-full': store.isLandscape, 'w-1/2': !store.isLandscape })}>
          <div class={classNames('flex items-center w-full  py-1', { 'pt-0': props.y == 0 })}>
            <span class={'text-2xl'}>{data.value.label || ''}</span>
            {renderAddOrDel()}
          </div>
          <div class={'flex items-end w-full h-[76px]  border border-solid border-[#e4e4e5] shadow-inner'} style={{ backgroundImage: `linear-gradient(#cdcdcd, #f2f2f2 ,#cdcdcd)` }}>
            <div class={'w-full h-full shrink bg-white flex justify-end pr-3 items-center py-2 value-number'}>
              <span class={classNames(' font-semibold text-[#003a62]', { 'text-4xl': store.isLowRes, ' text-6xl': !store.isLowRes })} >{props.data?.value?.toFixed ? props.data?.value?.toFixed(props.fixNum) : "" || ''}</span>
            </div>
            <div class={'h-full pl-2 min-w-[50px] flex flex-col justify-end text-lg font-semibold text-[#5e5452]'}  >
              <span class={'mb-2'}>{props.data?.unit || '  '}</span>
            </div>
          </div>
          <div class={'flex items-center w-full h-1/4 pt-1'}>
            <div class={'h-full w-1/6 flex cursor-pointer btn-bg'} onClick={standLeft} ><img class={'m-auto h-1/2'} src={lefticon}></img></div>
            <div class={'h-full w-full shrink btn-bg mx-2 flex items-center justify-center'}>
              <span class={` font-semibold ${store.isLowRes ? ' text-xs' : 'text-base '}`}>{data.value.stand ? data.value.stand[curStandIdx.value].title + ' :' + data.value.stand[curStandIdx.value].value : ' '}</span>
            </div>
            <div class={'h-full w-1/6 flex cursor-pointer btn-bg'} onClick={standRight} ><img class={'m-auto  h-1/2'} src={righticon}></img></div>
          </div>
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
    const configStore = useConfigStore()
    const store = useMain()
    // const defCpkList = ['Avg', 'Max', 'Min', 'Sd', 'Ca', 'Cp', 'Cpk'].map(e => { return { label: e, title: cpkModelPropName[e],value:0, unit: curCevInnerData.curDataCfgEntity?.Unit } })
    const activeStyle = {
      backgroundImage: `url(${activeImg})`,
      backgroundSize: 'cover',
      color: '#fff',
      zIndex: 6
    }
    const commonStyle = {
      width: '10vw', border: 'none', fontSize: '20px',
      minWidth: "100px",
      borderBottom: '3px solid #58595a'
    }
    const infoList = computed(() => { return curCevInnerData.infoList })
    const curTabValue = ref('value1')
    let startLoop = false
    const cpkList = computed(() => {
      if (!curCevInnerData.curCpk) return []
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
      let tempList = ['Avg', 'Max', 'Min', 'Sd', 'Ca', 'Cp', 'Cpk']
      list.forEach(e => {
        let idx = tempList.findIndex(e1 => e1 == e.label)
        if (idx > -1) {
          sortList[idx] = e
        }
      })
      // console.log("🚀 ~ cpkList ~ sortList:", sortList)
      return sortList
    })
    const initInfoList = () => {
      let list: menuOption[] = getLocalStorage('infoList')
      if (!list || !list.length || list.length == 0) {
        list = new Array(18).fill(0).map((e, i) => {
          return {
            label: ``,
            title: ``,
            value: undefined,
            unit: curCevInnerData.curDataCfgEntity?.Unit
          }
        })
      }
      curCevInnerData.setInfoList(list)
      // infoList.value = list
    }
    const fixNumRef = computed(() => {
      // let val = curCevInnerData.sysConfig.find(e => e.Name == 'Precision')?.Value
      // let val = configStore.originSysConfig.find(e => e.Name == 'Precision')?.Value
      let val = configStore.sysConfig.Precision
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
      initInfoList()
    })

    onUnmounted(() => {
      startLoop = false
    })

    return () => {
      return (
        <NTabs type="card" animated size="large" barWidth={1148} value={curTabValue.value} pane-class={'shrink-0 h-full'} class={'home-tab h-full w-full'} onUpdateValue={handleTabChange} defaultValue={'value1'} >
          <NTabPane displayDirective="if" name="value1" tab="测量值1" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value1' ? activeStyle : {} } }}>
            <div class={classNames(' h-full px-2 flex  overflow-y-auto', { 'flex-col': store.isLandscape, 'flex-wrap': !store.isLandscape })}>
              {/* <NScrollbar> */}
              {infoList.value.slice(0, 6).map((e, i) => {
                return <ValueRow key={i} x={0} y={i} data={e} i={i} fixNum={fixNumRef.value} />
              })}
              {/* </NScrollbar> */}

            </div>
          </NTabPane>
          <NTabPane displayDirective="if" name="value2" tab="测量值2" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value2' ? activeStyle : {} } }}>
            {/* <div class={' h-full px-2 flex flex-col overflow-y-auto'}>
              <RightOtherValue />
            </div> */}
            <div class={classNames(' h-full px-2 flex  overflow-y-auto', { 'flex-col': store.isLandscape, 'flex-wrap': !store.isLandscape })}>
              {/* <NScrollbar> */}
              {infoList.value.slice(6, 12).map((e, i) => {
                return <ValueRow key={i} x={0} y={i} data={e} i={6 + i} fixNum={fixNumRef.value} />
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

          </NTabPane> */}
          <NTabPane displayDirective="show:lazy" name="value3" tab="测量值3" tabProps={{ style: { ...commonStyle, ...curTabValue.value == 'value3' ? activeStyle : {} } }}>
            {/* <div class={' h-full px-2 flex flex-col'}>
              {new Array(6).fill({}).map((_, i) => {
                return <ValueRow key={i} x={2} y={i} />
              })}
            </div> */}
            <div class={classNames(' h-full px-2 flex  overflow-y-auto', { 'flex-col': store.isLandscape, 'flex-wrap': !store.isLandscape })}>
              {/* <NScrollbar> */}
              {infoList.value.slice(12, 18).map((e, i) => {
                return <ValueRow key={i} x={0} y={i} data={e} i={12 + i} fixNum={fixNumRef.value} />
              })}
              {/* </NScrollbar> */}

            </div>
          </NTabPane>
        </NTabs>
      )
    }
  }

})