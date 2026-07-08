import SimpleTable from "@/components/SimpleTable";
import { useConfigStore } from "@/store/config";
import { getSysConfig } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { useDialog } from "naive-ui";
import { computed, defineComponent, watch, reactive } from "vue";
import { DataGroupEntity, simpleTableColumn } from "~/me";
import { UnilateralNameList } from "../../../dataCofigNew/enum";
import { DataClassNameMap, ParamClassEnum, tabNameEnum } from "../../enum";
import AdressFromCon from "./AdressFromCon";
import DevList from "./DevList";
import SubDataDrawer from "./SubDataDrawer";
import { useMyI18n } from "@/hooks/useMyI18n";
import { sleep } from "@/utils/utils";

export default defineComponent({
  name: 'DevDataGroup',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const { t, i18nStore } = useMyI18n()
    const dialog = useDialog()
    const curDeviceGroupRow = computed(() => configStore.curDeviceGroupRow)
    const classSelect = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      // updateRow({ DeviceClass: item.DeviceClass })
    }
    const rowClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      console.log("🪵 [index.tsx:38] ~ token ~ \x1b[0;32mitem\x1b[0m = ", item);
      configStore.setCurDevDataGroupRow(item)
    }
    const viewSubDataClick = () => {
      const gid = curRow.value?.GId
      const stillSelected = !!gid && alldata.data.some(e => e.GId === gid)
      if (!stillSelected) {
        configStore.setCurDevDataGroupRow(null)
        window.$message.error(t('config.pleaseSelectOneRow'))
        return
      }
      alldata.subDrawerShow = true
    }
    const deleteClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      console.log("🪵 [index.tsx:30] ~ token ~ \x1b[0;32mitem\x1b[0m = ", item);
      // rowClick(row, item)
      // if (item.GId === curEnabledDataGroupId.value) {
      //   window.$message.error('已应用的分组不能删除')
      //   return
      // }
      callBrige(callFnName.DeleteDataGroup, item.GId).then(() => {
        window.$message.success(t('config.deleteSuccess'))
        getData()
      })
    }
    const enableClcik = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      callBrige(callFnName.EnableGroupConfig, item.GId).then(() => {
        window.$message.success(t('config.operationSuccess'))
        // getData()
        // getSysConfig()
        dialog.create({ title: t('config.prompt'), content: t('config.remind'), positiveText: t('config.confirm') })
      })
    }
    const addClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      configStore.setDevDataGroupDevListShow(true)
    }


    const curEnabledDataGroupId = computed(() => configStore.sysConfig.CurrentGroupId)
    // const alldata = reactive({
    //   data:[],
    //   coloumns:[]
    // })
    const curRow = computed(() => {
      return configStore.curDevDataGroupRow
    })
    const stateClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      callBrige(callFnName.SaveDataGroup, item).then((res: any) => {
        window.$message.success(t('config.saveSuccess'))
        getData()
      })
    }
    const dataClassSelect = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      updateRow({ DataClass: item.DataClass })
    }
    const editClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      // rowClick(col, item)
      configStore.setDevDataGroupAddressFormShow(true)
    }
    const alldata = reactive({

      curConnectRefType: null,
      allData: [] as DataGroupEntity[],
      data: [] as DataGroupEntity[],
      subDrawerShow: false,
      coloumns: [
        {
          label: t('config.dataName'), prop: 'DataName', flex: 1, btnFn: () => { }, isInput: true,
          inputUpdateFn: (col, item) => {
            console.log("🪵 [index.tsx:30] ~ token ~ \x1b[0;32m otherData.curRow\x1b[0m = ", curRow.value);
            if (item) {
              rowClick(col, item)
              updateRow({ DataName: curRow.value!.DataName })
            }
          }
        },
        { label: t('config.dataType'), prop: 'DataClass', flex: 2, fixWidth: 32, isSelect: true, selectOption: [], btnFn: dataClassSelect, },
        // { label: '参数类型', prop: 'ParamClass', flex: 2, mapFn: (col: any, item: DataGroupEntity) => { return ParamClassNameMap[item.ParamClass!] } },
        // { label: '是否单边数据', prop: 'Unilateral', flex: 2, mapFn: (col: any, item: DataGroupEntity) => { return UnilateralNameList[item.Unilateral!] } },
        // { label: '精度', prop: 'Precision', flex: 1, },
        {
          label: t('config.unit'), prop: 'Unit', flex: 1, isInput: true, inputUpdateFn: (col, item) => {
            if (item) {
              rowClick(col, item)
              updateRow({ Unit: curRow.value!.Unit })
            }
          },
        },
        {
          label: t('config.status'), prop: 'State', flex: 2, isSwitch: true, btnFn: stateClick,
          mapFn: (col: any, item: DataGroupEntity) => { return item.State == 1 ? t('config.enabled') : t('config.disabled') }
        },
        // { label: '地址集合', prop: 'AddressIds', flex: 3, btnText: "查看", btnFn: adressClick },

        // {
        //   label: '', prop: 'op', btnText: '编辑', flex: 1, btnFn: (col: any, item: any) => {
        //     rowClick(col, item)
        //     configStore.setDevDataGroupAddressFormShow(true)
        //   }
        // },
        // {
        //   label: '', prop: 'op', btnText: '应用', flex: 1, btnFn: enableClcik, mapFn: (col: any, item: any) => {
        //     return item.GId == curEnabledDataGroupId.value ? '已应用' : '应用'
        //   }
        // },
        // { label: '', prop: 'op1', btnText: '删除', flex: 1, btnFn: deleteClick, btnType: 'danger' },
      ] as simpleTableColumn[],
    })
    const buildCurDataClassOpt = () => {
      if (!curDeviceGroupRow.value) return new Promise(resolve => resolve([]))
      return callBrige(callFnName.GetDataClass, curDeviceGroupRow.value?.DeviceClass).then((res: number[]) => {
        alldata.coloumns.find(e => e.prop == 'DataClass')!.selectOption = res.map(e => { return { label: DataClassNameMap[e], value: e } })
      })
    }
    const getData = () => {
      getSysConfig()
      buildCurDataClassOpt().then(() => {
        return callBrige(callFnName.GetDataGroups, configStore.curDeviceGroupRow?.GId)
      }).then((res: DataGroupEntity[]) => {
        // res = res.map(e => {
        //   let subItem = e.AddressString ? JSON.parse(e.AddressString) : defSubAdressItem
        //   return {
        //     ...e,
        //     SlaveId: subItem.SlaveId,
        //     Length: subItem.Length
        //   }
        // })
        // .map(e => ({ ...e, DataClass: e.DataClass?.toString() }))
        // res.push({
        //   // ...defAdressRow,
        //   DataName: '新增数据',
        //   // DeviceId: configStore.curDevConfigRow?.GId || '',
        //   isNewRow: true
        // })
        alldata.allData = res
        alldata.data = res.filter(e => !e.ParamId)
      })
    }
    configStore.setUpdateDevDataGroupRowFn(getData)
    const submit = (form: any) => {
      let str = JSON.stringify(form)
      // props.updateParentFn && props.updateParentFn({ ConnectString: str })
    }
    const updateRow = (dat: any) => {
      let data = { ...curRow.value, ...dat, }
      console.log("🪵 [index.tsx:136] ~ token ~ \x1b[0;32mdata\x1b[0m = ", data);
      callBrige(callFnName.SaveDataGroup, data).then((res: any[]) => {
        // console.log("🪵 [index.tsx:11] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        getData()
        window.$message.success(t('config.saveSuccess'))
        // otherData.showConnectComForm = false
      })
    }
    watch(() => curDeviceGroupRow.value, (v) => {
      if (v) {
        getData()
        // configStore.setUpdateAdressRowFn(getData)
      }
    }, {
      immediate: true
    })
    watch(() => i18nStore.langChangeCount, () => {
      sleep(100).then(() => {
        alldata.coloumns[0].label = t('config.dataName')
        alldata.coloumns[1].label = t('config.dataType')
        alldata.coloumns[2].label = t('config.unit')
        alldata.coloumns[3].label = t('config.status')
      })

    })
    return () => {
      return (
        <div id="devDataGroupTableCon" class={'w-full h-full border border-gray-600 border-solid  overflow-hidden bg-white relative'}>
          <SimpleTable
            rowClickFn={rowClick}
            btnShowList={[1, 1, 1]}
            addAndEditAndDelFn={[addClick, editClick, deleteClick]}
            isSmallPadding={true}
            dat={alldata.data} col={alldata.coloumns} />

          <span
            class={'absolute right-4 bottom-[70px] z-[100] py-2 px-3 text-center bg-white text-black border border-gray-500 border-solid cursor-pointer shadow-md'}
            onClick={viewSubDataClick}
          >
            {t('config.viewSubData')}
          </span>

          <AdressFromCon />
          <DevList />
          <SubDataDrawer show={alldata.subDrawerShow} parentRow={curRow.value} data={alldata.allData} updateShowFn={(v: boolean) => { alldata.subDrawerShow = v }} />
        </div>
      )
    }
  }

})