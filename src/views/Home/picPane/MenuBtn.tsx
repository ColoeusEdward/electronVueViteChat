
import { DropdownProps, NButton, NDropdown } from "naive-ui";
import { defineComponent, ref, computed, watch, onUnmounted, } from "vue";
import activeImg from '@/assets/LineDspButton_inactive.png'
import { useMain } from "@/store";
import { storeToRefs } from "pinia";
import { useRealTimeStore } from "@/store/realtime";
import niotLogo from '@/assets/login_logos.png';


const TopValue = defineComponent({
  name: 'TopValue',
  setup(props, ctx) {
    const store = useMain()
    const realtimeStore = useRealTimeStore()

    const dataItem = computed(() => {
      return realtimeStore.realData[`${store.dataSource.key}Data`] || {}
    })
    return () => {
      let valueList = Object.keys(dataItem.value).map((key) => {
        const value = (dataItem.value[key] && dataItem.value[key][0]) ? dataItem.value[key][dataItem.value[key].length - 1].value[1] : 0
        let name = ''
        let re = key.match(/(?:X|Y)$/)
        if (re) {
          name = re[0]
        } else {
          name = store.chineseMap[key]
        }
        return (
          <div class={'flex flex-col text-lg font-semibold mr-[3vw] h-full items-center'}>
            <span class={'h-1/2'} >{name}:</span>
            <span class={'h-1/2'}>{value + ' mm'}</span>
          </div>
        )
      })


      if (store.displayChart.key == 'outTolerance') {
        // let obj: Record<string, any> = {
        //   'diameter1': (
        //     <div class={'flex items-center h-full ml-[6vw]'}>
        //       {valueList}
        //     </div>
        //   ),
        //   'wall': (
        //     <div class={'flex items-center'}></div>
        //   )
        // }
        return <div class={'flex items-center h-full ml-[6vw]'}>
          {valueList}
        </div>

      } else {
        return <div class={'ml-[6vw] text-xl text-blue-700'}>{store.displayWay.label}</div>
      }
    }
  },
})


export default defineComponent({
  name: 'MenuBtn',
  setup(props, ctx) {
    const store = useMain()
    const realtimeStore = useRealTimeStore()
    const dropdownItemProp = {
      style: {
        fontSize: '1.2rem'
      }
    }

    const addProp = (list: DropdownProps['options']) => {
      if (!list) return
      return list.map(e => {
        // e.props = Object.assign({}, dropdownItemProp)
        e.props = JSON.parse(JSON.stringify(dropdownItemProp))
        if (e.key == 'timeZone') {
          //@ts-ignore
          e.props!.style!.borderTop = '1px solid #d9d9d9'
        }
        if (e.key == 'dataSource') {
          //@ts-ignore
          e.props!.style!.borderBottom = '1px solid #d9d9d9'
        }
        if (e.children) {
          e.children = addProp(e.children as any)
        }
        return e
      })
    }
    const originDisplayOption: DropdownProps['options'] = addProp([ //两种显示方式外形和数字显示, 显示方式是针对数字显示的选项
      { label: '外形/公差', key: 'outTolerance' },
      { label: '数字显示/趋势图', key: 'dataChart' },
      {
        label: '显示方式', key: 'displayWay', children: [
          { label: '平均值', key: 'avg' },
          { label: '椭圆度', key: 'ellipse' },
          { label: '直径(X)', key: 'diameterX' },
          { label: '直径(Y)', key: 'diameterY' },
        ]
      },
    ])
    const displayOption = ref<DropdownProps['options']>(JSON.parse(JSON.stringify(originDisplayOption)))

    const originMaintainOption: DropdownProps['options'] = addProp([
      {
        label: '数据源', key: 'dataSource', children: [
          { label: '直径1', key: 'diameter1', },
          { label: '热外径', key: 'heat', },
          { label: '冷外径', key: 'cold', },
          { label: '冷电容', key: 'coldCap', },   //电容,壁厚只有趋势图,只有平均值, 因此displayoption在选中电容后要隐藏
          { label: '壁厚', key: 'wall', },
          { label: '偏心', key: 'ecc', },
        ]
      },
    ])
    const maintainOption = ref<DropdownProps['options']>(JSON.parse(JSON.stringify(originMaintainOption)))

    const originZoneOption: DropdownProps['options'] = addProp([
      {
        label: '时间区域', key: 'timeZone', children: [
          { label: '60min', key: 60, },
          { label: '30min', key: 30, },
          { label: '10min', key: 10, },
          { label: '1min', key: 1, },
        ]
      },
      { label: '公差条', key: 'toleranceBar' }
    ])

    const zoneOption = ref<DropdownProps['options']>(JSON.parse(JSON.stringify(originZoneOption)))

    const handleMenuSelect: DropdownProps['onSelect'] = (val, option) => {
      // console.log(val,option)
      let { key, label } = option
      let zoneChild = zoneOption.value![0]?.children ? zoneOption.value![0].children as DropdownProps['options'] : []
      if (zoneChild!.some(e => e.key == key)) {
        store.setTimeZone({ key, label })
      }
      if (key == 'toleranceBar') {
        store.changeIsTorBar()
      }
      let dataSourceChild = maintainOption.value![0]?.children ? maintainOption.value![0].children as DropdownProps['options'] : []
      if (dataSourceChild!.some(e => e.key == key)) {
        store.setDataSource({ key, label })
      }
      let displayChild = displayOption.value![2]?.children ? displayOption.value![2].children as DropdownProps['options'] : []
      if (displayChild!.some(e => e.key == key)) {
        store.setDisplayWay({ key, label })
      }
      if (key == 'outTolerance' || key == 'dataChart') {
        store.setDisplayChart({ key, label })
      }
    }


    const computeOption = computed(() => {
      //@ts-ignore
      let opt: DropdownProps['options'] = [...maintainOption.value, ...displayOption.value, ...zoneOption.value]
      // if (Object.values(opt).some(e => !e.props)) {
      //   opt = addProp(opt)
      // }
      return opt
    })
    const { dataSource, displayChart } = storeToRefs(store)
    watch(dataSource, (nv) => {
      if (nv.key == 'coldCap' || nv.key == 'wall') {
        store.setDisplayChart(displayOption.value![1])
        //@ts-ignore
        store.setDisplayWay(displayOption.value![2].children![0])
        displayOption.value = []
      } else {
        if (displayOption.value!.length == 0) {
          displayOption.value = JSON.parse(JSON.stringify(originDisplayOption))
        }
      }
    })
    watch(displayChart, (nv) => {
      if (nv.key == 'outTolerance') {
        zoneOption.value = []
      } else {
        if (zoneOption.value!.length == 0) {
          zoneOption.value = JSON.parse(JSON.stringify(originZoneOption))
        }
      }
    })


    const renderLabel: DropdownProps['renderLabel'] = (option) => {
      let text = option.label
      if (Object.values(store.$state).filter(e => e).some(e => e.key == option.key)
        || (option.key == 'toleranceBar' && store.isTorBar)) {
        // return option.label as VNodeChild
        text += ' ✔️'
      }
      return (
        <span>{text}</span>
      )
    }

    //@ts-ignore
    const nodeProps: DropdownProps['nodeProps'] = (option) => {
      return {
        style: {
          minWidth: '14vh'
        }
      }
    }



    return () => {


      return (
        <div class={'flex items-center'}>
          < NDropdown options={computeOption.value} trigger="click" placement="bottom-start" onSelect={handleMenuSelect} size={'large'} class={'text-2xl'} renderLabel={renderLabel} nodeProps={nodeProps} >
            <NButton strong={true} type="primary" secondary size={'large'} class={'h-12 w-28 shrink mr-2 '} style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }}
            >
              <span class={'text-2xl'}>菜单</span>
            </NButton>
          </NDropdown >
          <div class={'ml-2 text-xl w-32'}>
            {store.dataSource.label}
          </div>
          <TopValue />

          <div class='ml-auto  h-16' >
            <img class={'h-full'} src={niotLogo} />
          </div>
          {/* {renderValueText()} */}
        </div>
      )
    }
  }

})