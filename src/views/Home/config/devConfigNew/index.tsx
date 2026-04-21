import SimpleTable from "@/components/SimpleTable";
import { useConfigStore } from "@/store/config";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { } from "naive-ui";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { ConnectComModel, DeviceConfigEntity, simpleTableColumn } from "~/me";
import ConnectComForm from "./ConnectComForm";

export default defineComponent({
  name: 'devConfigNew',
  setup(props, ctx) {
    const data = ref<DeviceConfigEntity[]>([])
    const otherData = reactive({
      showConnectComForm: false,
      curConnectStr: '',
      curRow: null as DeviceConfigEntity | null
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
    const rowClick = (row: simpleTableColumn, item: DeviceConfigEntity) => {
      otherData.curConnectStr = item.ConnectString
      otherData.curRow = item
    }
    const columns = ref<simpleTableColumn[]>([{ label: '设备类型', prop: 'DriverName', flex: 3 },
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
    { label: '数据地址', prop: 'address', flex: 1, btnText: '编辑' },])
    const getData = () => {
      callBrige(callFnName.GetDevcieConfigs).then((res: DeviceConfigEntity[]) => {
        // console.log("🪵 [index.tsx:11] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        data.value = res
      })
    }
    getData()

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
        <div class={'w-full h-full  overflow-x-hidden -top-5 px-4 text-lg bg-[#f5f6f6]'} style={{ height: 'calc(100% + 20px)' }}>
          <SimpleTable dat={data.value} col={columns.value} />

          <ConnectComForm connectStr={otherData.curConnectStr}
            updateParentFn={(v: DeviceConfigEntity) => {
              updateRow(v)
            }}
            show={otherData.showConnectComForm} updateShowFn={(v: boolean) => {
              otherData.showConnectComForm = v
            }} />
        </div>
      )
    }
  }

})