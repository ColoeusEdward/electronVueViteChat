import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { useConfigStore } from "@/store/config";
import { useFormulaStore } from "@/store/formula";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { ajaxPromiseAll, safeJsonParse, sleep, getAllDataUnderGroup } from "@/utils/utils";
import { NTabPane, NTabs } from "naive-ui";
import { computed, defineComponent, Transition, ref, watch, reactive } from "vue";
import { DataGroupEntity, FormulaConfigEntity, FormulaParamEntity, GroupConfigEntity, ModbusAdressRow } from "~/me";

export default defineComponent({
  name: 'FormulaParam',
  setup(props, ctx) {
    const formulaStore = useFormulaStore()
    const configstore = useConfigStore()
    const curFormulaConfigRow = computed(() => formulaStore.curFormulaConfigRow)
    const alldata = reactive({
      curTabValue: 'formula',
      defaultTab: 'formula',
      calcHeight: 0,
      commonStyle: {
        maxWidth: '12vw', fontSize: '20px', minWidth: '120px', borderTop: '1px solid #58595a', borderRight: '1px solid #58595a', borderLeft: '1px solid #58595a', borderBottom: '1px solid #58595a',
        flexGrow: 1, background: '#fff', borderRadius: '12px 12px 0 0'
      },
      activeStyle: {
        background: `#f5f6f6`,
        backgroundSize: 'cover',
        borderBottom: "0px solid #58595a",
        color: '#000',
        zIndex: 6
      },
      adressList: [] as DataGroupEntity[],
      paramList: [] as FormulaParamEntity[],
      formCfg: {
        optionMap: {

        },
        itemList: [
          { type: 'input', label: '标准值', prop: 'Standard', width: 24, },
          { type: 'input', label: '上公差', prop: 'UpperTol', width: 24, },
          { type: 'input', label: '下公差', prop: 'LowerTol', width: 24, },
        ] as formListItem[],
        hideBtn: true,
        noLargeBtn: true,
        btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
        // renderToBtn: () => {
        //   return (
        //     <NButton class={'mr-3 relative mb-2'} onClick={cancel} size={'large'} >取消</NButton>
        //   )
        // },
      },
      formMap: {} as Record<string, FormulaParamEntity>,
    })
    const curDeviceGroupRow = computed(() => formulaStore.curDeviceGroupRow)
    const pararmListWidthAdress = computed(() => {
      return alldata.paramList.map(e => { return { ...e, AdressItem: alldata.adressList.find(item => item.GId == e.DataGroupId) } })
    })
    const curDataGroupAdressList = computed(() => {

      // console.log("🪵 [FormulaParam.tsx:31] ~ token ~ \x1b[0;32mlist\x1b[0m = ", list);
      // return list
    })
    const calcParamContentHeight = () => {
      let el = document.querySelector('.formula-param-tab .n-tabs-nav') as HTMLElement
      if (!el) return
      alldata.calcHeight = el.clientHeight + 98
      // console.log("🪵 [FormulaParam.tsx:59] ~ token ~ \x1b[0;32mel\x1b[0m = ", el.clientHeight);
    }
    const getData = (row: FormulaConfigEntity | null) => {
      if (!row) return
      callBrige(callFnName.GetFormulaParams, row.GId).then((res: FormulaParamEntity[]) => {
        // console.log("🪵 [FormulaParam.tsx:68] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        alldata.paramList = res
        // alldata.paramList = [...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res, ...res,]
        if (res.length == 0) {
          let itemList = alldata.adressList.map(e => {
            let item: FormulaParamEntity = { DataGroupId: e.GId, FormulaId: row.GId }
            return item
          })
          callBrige(callFnName.SaveFormulaParams, itemList).then((res: FormulaParamEntity[]) => {
            getData(row)
          })
        } else {
          if (res.length < alldata.adressList.length) {
            let itemList = alldata.adressList.filter(e => !res.find(item => item.DataGroupId == e.GId)).map(e => {
              let item: FormulaParamEntity = { DataGroupId: e.GId, FormulaId: row.GId }
              return item
            })
            callBrige(callFnName.SaveFormulaParams, itemList).then((res: FormulaParamEntity[]) => {
              getData(row)
            })
          }
          // let curAllGroupData = getAllDataUnderGroup(configstore)
          // if(res.length < curAllGroupData.length){

          // }
        }
      })
    }
    watch(() => curFormulaConfigRow.value, (v: FormulaConfigEntity | null) => {
      getData(v)
      sleep(50).then(() => {
        calcParamContentHeight()
      })
    }, {
      immediate: true
    })
    watch(() => formulaStore.curEnableDataGroupConfig, (v: GroupConfigEntity | null | undefined) => {
      // let item = formulaStore.curEnableDataGroup
      // let list = safeJsonParse(item?.AddressIds || '[]') as string[]
      // callBrige(callFnName.GetDataAddressesWithIds, list).then((res: ModbusAdressRow[]) => {
      //   alldata.adressList = res
      // })
      callBrige(callFnName.GetFormulaFields).then((res: DataGroupEntity[]) => {
        console.log("🪵 [FormulaParam.tsx:105] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        alldata.adressList = res

      })
    }, {
      immediate: true
    })

    const curParamList = computed(() => {
      return pararmListWidthAdress.value.filter(item => item.AdressItem?.DeviceGroupId == curDeviceGroupRow.value?.GId)
    })
    watch(() => curParamList.value, (v) => {
      if (!v.length) return
      alldata.curTabValue = v[0].DataGroupId || ''
    })
    //  watch(() => curDeviceGroupRow.value, (v) => {
    //   alldata.curTabValue = v[0].DataGroupId
    // })

    const handleTabChange = (value: string) => {
      alldata.curTabValue = value
    }
    const getFormMap = () => {
      return alldata.formMap
    }
    formulaStore.setGetParamFormMapFn(getFormMap)

    return () => {
      return (
        <NTabs value={alldata.curTabValue} type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'config-tab h-full w-full l formula-param-tab my-formula-tab '} onUpdateValue={handleTabChange} defaultValue={alldata.defaultTab} >
          {
            curDeviceGroupRow.value &&
            // pararmListWidthAdress.value.map(item => {
            curParamList.value.map(item => {
              let totalId = item.FormulaId + '-' + item.DataGroupId
              if (!alldata.formMap[totalId]) {
                alldata.formMap[totalId] = item
              }
              return (
                <NTabPane displayDirective="show:lazy" name={item.DataGroupId} tab={item.AdressItem?.DataName} tabProps={{ style: { ...alldata.commonStyle, ...alldata.curTabValue == item.DataGroupId ? alldata.activeStyle : {} } }}>
                  <div style={{ height: `calc(100vh - ${alldata.calcHeight}px)` }} class={'w-full h-full p-2 border border-gray-600 border-solid '}>
                    <div class={'w-full h-full py-6 pl-4 '}>
                      <MyFormWrap labelWidth={360} fontSize={32} labelAlign="left" inputStyle={{ marginLeft: 'auto', width: '450px', marginRight: '10px', textAlign: 'center' }} {...alldata.formCfg} form={alldata.formMap[totalId]} />
                    </div>

                  </div>
                  {/* 
                    <div class={' h-full  bg-[#f5f6f6] border border-gray-600 border-solid  rounded-xl overflow-hidden'}>
                    </div> */}

                </NTabPane>
              )
            })
          }

        </NTabs>

      )
    }
  }

})