import SimpleTable from "@/components/SimpleTable";
import { useConfigStore } from "@/store/config";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { useDialog } from "naive-ui";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { ConnectComModel, DeviceConfigEntity, simpleTableColumn } from "~/me";
import AddForm from "./addForm";
import AdressForm from "./AdressForm";
import AdressTable from "./AdressTable";
import ConForm from "./ConForm";
import ConnectComForm from "./connect/ConnectComForm";
import { tabNameEnum } from "./enum";

export default defineComponent({
  name: 'devConfigNew',
  setup(props, ctx) {
    const data = ref<DeviceConfigEntity[]>([])
    const otherData = reactive({
      showConnectComForm: false,
      showAdressForm: false,
      curConnectStr: '' as string | undefined,
      curRow: undefined as DeviceConfigEntity | undefined
    })
    const configStore = useConfigStore()
    const configTab = computed(() => {
      return configStore.configTab
    })
    const connectClick = (row: simpleTableColumn, item: DeviceConfigEntity) => {
      // console.log("🪵 [index.tsx:21] ~ token ~ \x1b[0;32mrow\x1b[0m = ", row);
      otherData.showConnectComForm = true
      rowClick(row, item)
    }
    const adressClick = (row: simpleTableColumn, item: DeviceConfigEntity) => {
      // console.log("🪵 [index.tsx:21] ~ token ~ \x1b[0;32mrow\x1b[0m = ", row);
      otherData.showAdressForm = true
      configStore.setAddressShow(true)
      configStore.setConfigTab(tabNameEnum.dataAddress)
      rowClick(row, item)
    }
    const rowClick = (row: simpleTableColumn, item: DeviceConfigEntity) => {
      otherData.curConnectStr = item.ConnectString

      otherData.curRow = item
      configStore.setCurDevConfigRow(item)
    }
    const deleteClick = (row: simpleTableColumn, item: DeviceConfigEntity) => {
      rowClick(row, item)
      callBrige(callFnName.DeleteDevcieConfig, item.GId).then(() => {
        window.$message.success('删除成功')
        getData()
      })
    }
    const addClick = (row: simpleTableColumn, item: DeviceConfigEntity) => {
      if (item.isNewRow) {
        // rowClick(row, item)
        configStore.setAddFormShow(true)
      }
    }
    const stateClick = (row: simpleTableColumn, item: DeviceConfigEntity) => {
      rowClick(row, item)
      updateRow({ State: item.State })
      // configStore.setStateShow(true)
    }
    const columns = ref<simpleTableColumn[]>([
      { label: '设备类型', prop: 'DriverName', flex: 3, btnFn: addClick },
      {
        label: '设备名', prop: 'Name', flex: 2, isInput: true
        , btnFn: rowClick
        , inputUpdateFn: () => {
          console.log("🪵 [index.tsx:30] ~ token ~ \x1b[0;32m otherData.curRow\x1b[0m = ", otherData.curRow);
          if (otherData.curRow) {
            updateRow({ Name: otherData.curRow.Name })
          }
        }
      },
      { label: '连接配置', prop: 'ConnectString', flex: 1, btnText: '编辑', btnFn: connectClick },
      { label: '数据地址', prop: 'address', flex: 1, btnText: '编辑', btnFn: adressClick },
      { label: '状态', prop: 'State', flex: 1, isSwitch: true, mapFn: (col: any, item: DeviceConfigEntity) => { return item.State == 1 ? '启用' : '禁用' }, btnFn: stateClick },
      { label: '', prop: 'op', flex: 1, btnText: '删除', btnFn: deleteClick, btnType: 'danger' },
    ])
    const getData = () => {
      callBrige(callFnName.GetDevcieConfigs).then((res: DeviceConfigEntity[]) => {
        console.log("🪵 [index.tsx:11] ~ token ~ \x1b[0;DeviceConfigEntity\x1b[0m = ", res);
        res.push({ DriverName: '新增设备', Name: '', State: 0, CreateTime: '', isNewRow: true })

        data.value = res
      })
    }
    getData()
    configStore.setUpdateDevConfigRowFn(getData)

    const updateRow = (dat: any) => {
      let data = { ...otherData.curRow, ...dat, }
      callBrige(callFnName.SaveDevcieConfig, data).then((res: any[]) => {
        // console.log("🪵 [index.tsx:11] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        getData()
        window.$message.success('保存成功')
        otherData.showConnectComForm = false
      })
    }

    watch(() => configTab.value, () => {
      getData()
    })

    return () => {
      return (
        <div class={'w-full  overflow-x-hidden -top-5 px-4 text-lg bg-[#f5f6f6]'} style={{}}>
          <SimpleTable dat={data.value} col={columns.value} addRowProp={'DriverName'} />

          <ConForm connectStr={otherData.curConnectStr}
            updateParentFn={(v: DeviceConfigEntity) => {
              updateRow(v)
            }}
            show={otherData.showConnectComForm} updateShowFn={(v: boolean) => {
              otherData.showConnectComForm = v
            }} />

          <AddForm />

          {/* <AdressTable
            curRow={otherData.curRow}
            show={otherData.showAdressForm} updateShowFn={(v: boolean) => {
              otherData.showAdressForm = v
            }} /> */}
        </div>
      )
    }
  }

})