import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import SimpleTable from "@/components/SimpleTable";
import { useMain } from "@/store";
import { useConfigStore } from "@/store/config";
import { useMyI18n } from "@/hooks/useMyI18n";
import { getSysConfig } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import classNames from "classnames";
import { DialogReactive, NPopconfirm, useDialog } from "naive-ui";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { GroupConfigEntity, simpleTableColumn } from "~/me";
import { tabNameEnum } from "../enum";
import AdressChooseList from "./AdressChooseList";
import DataGroupAddFrom from "./DataGroupAddFrom";
import DevChooseList from "./DevChooseList";
import DevDataGroup from "./DevDataGroup";
import DeviceGroup from "./DeviceGroup";

export default defineComponent({
  name: 'dataGroup',

  setup(props, ctx) {
    const configStore = useConfigStore()
    const { t, i18nStore } = useMyI18n()
    const store = useMain()
    const dialog = useDialog()
    const myFormRef = ref<MyFormWrapIns>()
    const curEnabledDataGroupId = computed(() => configStore.sysConfig.CurrentGroupId)
    // const alldata = reactive({
    //   data:[],
    //   coloumns:[]
    // })
    const curRow = computed(() => {
      return configStore.curGroupConfigRow
    })
    const devClick = (row: simpleTableColumn, item: GroupConfigEntity) => {
      rowClick(row, item)
      // configStore.setDevChooseShow(true)
      configStore.setDeviceGroupShow(true)
      configStore.setConfigTab(tabNameEnum.deviceGroup)
    }
    const adressClick = (row: simpleTableColumn, item: GroupConfigEntity) => {
      rowClick(row, item)
      configStore.setAdressChooseShow(true)
    }
    const rowClick = (row: simpleTableColumn, item: GroupConfigEntity) => {
      console.log("🪵 [index.tsx:38] ~ token ~ \x1b[0;32mitem\x1b[0m = ", item);
      configStore.setCurGroupConfigRow(item)
    }
    const deleteClick = ({ }, item: GroupConfigEntity) => {
      if (item.GId === curEnabledDataGroupId.value) {
        window.$message.error(t('config.cannotDeleteAppliedGroup'))
        return
      }
      callBrige(callFnName.DeleteGroupConfig, item.GId).then(() => {
        window.$message.success(t('config.deleteSuccess'))
        getData()
      })
    }
    const enableClcik = (row: simpleTableColumn, item: GroupConfigEntity) => {
      rowClick(row, item)
      callBrige(callFnName.EnableGroupConfig, item.GId).then(() => {
        window.$message.success(t('config.operationSuccess'))
        // getData()
        getSysConfig()
        dialog.create({ title: t('config.prompt'), content: t('config.remind'), positiveText: t('config.confirm') })
      })
    }
    const addClick = (item: GroupConfigEntity) => {
      configStore.setDataGroupAddFromShow(true)

    }
    const coloumns = ref<simpleTableColumn[]>([
      {
        label: t('config.groupName'), prop: 'GroupName', flex: 3, btnFn: () => { }, isInput: true,
        inputUpdateFn: (col, item) => {
          console.log("🪵 [index.tsx:30] ~ token ~ \x1b[0;32m otherData.curRow\x1b[0m = ", curRow.value);
          if (item) {
            configStore.setCurGroupConfigRow(item)
            updateRow({ GroupName: curRow.value!.GroupName })
          }
        }
      },
      {
        label: '', prop: 'op', btnText: t('config.apply2'), flex: 1, btnFn: enableClcik, mapFn: (col: any, item: any) => {
          return item.GId == curEnabledDataGroupId.value ? t('config.applied') : t('config.apply2')
        }
      },
    ])
    const alldata = reactive({
      form: {},
      curDialogIns: null as DialogReactive | null,
      curConnectRefType: null,
      data: [] as GroupConfigEntity[],
    })

    const getData = () => {
      getSysConfig()
      callBrige(callFnName.GetGroupConfigs).then((res: GroupConfigEntity[]) => {
        console.log("🪵 [index.tsx:58] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        // res = res.map(e => {
        //   let subItem = e.AddressString ? JSON.parse(e.AddressString) : defSubAdressItem
        //   return {
        //     ...e,
        //     SlaveId: subItem.SlaveId,
        //     Length: subItem.Length
        //   }
        // })

        alldata.data = res
      })
    }
    configStore.setUpdateDataGroupRowFn(getData)
    const submit = (form: any) => {
      let str = JSON.stringify(form)
      // props.updateParentFn && props.updateParentFn({ ConnectString: str })
    }
    const updateRow = (dat: any) => {
      let data = { ...curRow.value, ...dat, }
      callBrige(callFnName.SaveGroupConfig, data).then((res: any[]) => {
        // console.log("🪵 [index.tsx:11] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        getData()
        window.$message.success(t('config.saveSuccess'))
        // otherData.showConnectComForm = false
      })
    }
    watch(() => configStore.configTab, (v) => {
      if (v == tabNameEnum.dataGroup) {
        getData()
        // configStore.setUpdateAdressRowFn(getData)
      }
    }, {
      immediate: true
    })
    watch(() => i18nStore.langChangeCount, () => {
      coloumns.value[0].label = t('config.groupName')
      coloumns.value[1].btnText = t('config.apply2')
    })


    return () => {
      return (
        <div class={'w-full h-full  overflow-x-hidden -top-5 px-4 pr-2 text-lg bg-[#f5f6f6]'} style={{
          height: 'calc(100vh - 200px)'
        }}>
          {/* <SimpleTable dat={alldata.data} col={coloumns.value} /> */}
          <div class={'w-full h-full flex ' + classNames({
            'flex-col': !store.isLandscape
          })}

          >
            <div class={"w-full h-full p-2  " + classNames({ 'pl-0 pr-1': store.isLandscape, 'px-0': !store.isLandscape })} style={{ flex: 2 }}>
              <div class={'w-full h-full border border-gray-600 border-solid  overflow-hidden bg-white'}>
                <SimpleTable
                  rowClickFn={rowClick}
                  addAndEditAndDelFn={[
                    addClick,
                    () => { },
                    deleteClick
                  ]} isSmallPadding={true} dat={alldata.data} col={coloumns.value} />

              </div>
            </div>
            <div class={"w-full h-full  p-2  " + classNames({ 'px-1': store.isLandscape, 'px-0': !store.isLandscape })} style={{ flex: 3 }}>
              <DeviceGroup />
            </div>
            <div class={"w-full h-full p-2  " + classNames({ 'pl-1': store.isLandscape, 'px-0': !store.isLandscape })} style={{ flex: 3 }}>
              <DevDataGroup />
            </div>
          </div>
          <DevChooseList />
          <AdressChooseList />
          <DataGroupAddFrom isAdd={true} />
        </div>
      )
    }
  }

})