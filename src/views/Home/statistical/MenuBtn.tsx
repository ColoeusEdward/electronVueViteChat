
import { DropdownProps, NButton, NDropdown } from "naive-ui";
import { defineComponent, ref, computed, watch, onUnmounted, capitalize, } from "vue";
import activeImg from '@/assets/LineDspButton_inactive.png'
import { useMain } from "@/store";
import { storeToRefs } from "pinia";
import { useRealTimeStore } from "@/store/realtime";
import { useStatisticalStore } from "@/store/statistical";

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
    const statisticalStore = useStatisticalStore()
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
        if (e.key == 'onlineStatistical') {
          //@ts-ignore
          e.props!.style!.borderBottom = '1px solid #d9d9d9'
        }
        // if (e.key == 'timeZone') {
        //   //@ts-ignore
        //   e.props!.style!.borderTop = '1px solid #d9d9d9'
        // }
        if (e.key == 'dataSource') {
          //@ts-ignore
          e.props!.style!.borderBottom = '1px solid #d9d9d9'
          //@ts-ignore
          e.children.forEach((ee: any, i: number) => {
            if (i > 0 && i < 4) {
              ee.children = [
                { label: '直径(平均值)', key: ee.key + '-' + 'avg', },
                { label: '椭圆度', key: ee.key + '-' + 'ellipse', },
                { label: '直径X(平均值)', key: ee.key + '-' + 'diameterX', },
                { label: '直径Y(平均值)', key: ee.key + '-' + 'diameterY', },
              ]
            }
          })
        }
        if (e.key == 'wall') {
          e.children = [
            { label: '壁厚(平均值)', key: 'wall-avg', },
            { label: '壁厚(最大值)', key: 'wall-max', },
            { label: '壁厚(最小值)', key: 'wall-min', },
          ]
        }
        if (e.children) {
          e.children = addProp(e.children as any)
        }
        return e
      })
    }
    const originDisplayOption: DropdownProps['options'] = addProp([ //两种显示方式外形和数字显示, 显示方式是针对数字显示的选项
      { label: '静态数据', key: 'statistical' },
      { label: '自动刷新', key: 'onlineStatistical' },
    ])
    const displayOption = ref<DropdownProps['options']>(JSON.parse(JSON.stringify(originDisplayOption)))

    const originMaintainOption: DropdownProps['options'] = addProp([
      {
        label: '数据源', key: 'dataSource', children: [
          { label: '全部清除', key: 'cleanAll' },
          { label: '直径1', key: 'diameter1', },
          { label: '热外径', key: 'heat', },
          { label: '冷外径', key: 'cold', },
          { label: '壁厚', key: 'wall', },
          { label: '偏心', key: 'ecc', },
          { label: '同心度', key: 'concentricity', },
          { label: '冷电容', key: 'coldCap', },   //电容,壁厚只有趋势图,只有平均值, 因此displayoption在选中电容后要隐藏

        ]
      },
    ])
    const maintainOption = ref<DropdownProps['options']>(JSON.parse(JSON.stringify(originMaintainOption)))

    const originZoneOption: DropdownProps['options'] = addProp([
      {
        label: '显示数据', key: 'isShowData',
      },
      // {
      //   label: '线宽', key: 'lineWidth', children: [
      //     { label: '线宽1', key: 'lineWidth1' },
      //     { label: '线宽2', key: 'lineWidth2' },
      //     { label: '线宽3', key: 'lineWidth3' },
      //   ]
      // },
    ])

    const zoneOption = ref<DropdownProps['options']>(JSON.parse(JSON.stringify(originZoneOption)))

    const handleMenuSelect: DropdownProps['onSelect'] = (val, option) => {
      // console.log(val,option)
      let { key, label } = option

      if (String(key).search('-') > -1) {
        let [parent, ckey] = String(key).split('-')
        statisticalStore.addDataSource({ label: label, key: ckey, parent: parent })
      }
      //@ts-ignore
      if (originMaintainOption![0].children.slice(3).some(e => e.key == key)) {
        statisticalStore.addDataSource({ label: label, key: key, parent: 'dataSource' })
      }

      if (key == 'cleanAll') {
        statisticalStore.cleanDataSource()
      }
      if(key == 'onlineStatistical'){
        statisticalStore.setIsOnline(true)
      }
      if(key == 'statistical'){
        statisticalStore.setIsOnline(false)
      }
      if(key == 'isShowData'){
        statisticalStore.changeIsShowData()
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
    // const { dataSource, displayChart } = storeToRefs(store)
    // watch(dataSource, (nv) => {
    //   if (nv.key == 'coldCap' || nv.key == 'wall') {
    //     store.setDisplayChart(displayOption.value![1])
    //     //@ts-ignore
    //     store.setDisplayWay(displayOption.value![2].children![0])
    //     displayOption.value = []
    //   } else {
    //     if (displayOption.value!.length == 0) {
    //       displayOption.value = JSON.parse(JSON.stringify(originDisplayOption))
    //     }
    //   }
    // })
    // watch(displayChart, (nv) => {
    //   if (nv.key == 'outTolerance') {
    //     zoneOption.value = []
    //   } else {
    //     if (zoneOption.value!.length == 0) {
    //       zoneOption.value = JSON.parse(JSON.stringify(originZoneOption))
    //     }
    //   }
    // })


    const renderLabel: DropdownProps['renderLabel'] = (option) => {
      let text = option.label
      // console.log("🚀 ~ file: MenuBtn.tsx:204 ~ setup ~ option:", option)
      if (statisticalStore.dataSourceList.some(e => (e.parent + '-' + e.key) == option.key || e.key == option.key)) {
        text += ' ✔️'
      }
      if ((option.key == 'onlineStatistical' && statisticalStore.isOnline) || (option.key == 'statistical' && !statisticalStore.isOnline) || (option.key == 'isShowData' && statisticalStore.isShowData)) {
        text += '✔️'
      }
      // if (Object.values(store.$state).some(e => e.key == option.key)
      //   || (option.key == 'toleranceBar' && store.isTorBar)) {
      //   // return option.label as VNodeChild
      //   text += ' ✔️'
      // }
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
          <div class={'ml-2 text-xl w-[20vw]'}>
      
          </div>
          {/* <TopValue /> */}
          {/* {renderValueText()} */}
        </div>
      )
    }
  }

})