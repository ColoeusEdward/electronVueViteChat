import { useConfigStore } from "@/store/config";
import { DataTableProps, NButton, NDataTable, NDrawer, NDrawerContent, NPopconfirm, NSpace } from "naive-ui";
import { computed, defineComponent, ref } from "vue";
import SimpleModel from "@/components/SimpleModel/SimpleModel";
import ConnectForm from "./ConnectForm";
import TableOpCol from "@/components/TableOpCol/TableOpCol";

export default defineComponent({
  name: 'Connect',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const formShow = ref(false)
    const form = ref<commonForm>({

    })
    const delRow = (row: any) => {
      console.log("🚀 ~ file: Connect.tsx:16 ~ delRow ~ row:", row)
      configStore.delConnectRow(row.id)
    }
    const addRow = () => {
      form.value = {}
      formShow.value = true
    }
    const editRow = (row: any) => {
      form.value = { ...row }
      formShow.value = true
    }
    const colList: DataTableProps['columns'] = [
      { key: 'ProtoType', title: '协议类型', resizable: true },
      { key: 'DevInt', title: '通讯接口', resizable: true },
      { key: 'Name', title: '名称', resizable: true },
      { key: 'Remark', title: '备注', resizable: true },
      {
        key: 'op', title: '操作', width: 200, render(row) {
          return <TableOpCol editFn={() => { editRow(row) }} delFn={() => { delRow(row) }} />
        }
      },
    ]

    const tdata = computed(() => {  //返回时把Modbus-TCP-Slave 协议提到第一位
      if (configStore.connect.data[0]?.ProtoType == 'Modbus-TCP-Slave') {
        return configStore.connect.data
      }

      return configStore.connect.data.sort((a, b) => {
        if (b.ProtoType == 'Modbus-TCP-Slave') {
          return 1
        } else {
          return -1
        }
      })
    })

    return () => {
      return (
        <div class={'w-full h-full px-2 flex flex-col'}>
          <div class={'w-full h-10 flex justify-end items-center pb-2'}>
            <NButton size={'large'} onClick={addRow} >新增</NButton>
          </div>
          <div class={'h-full shrink relative border-0 border-b-2 border-solid border-gray-300'} id={'tableCon'}>
            <NDataTable bordered={false} singleLine={false} columns={colList} data={tdata.value} size={'large'} >
            </NDataTable>

            <NDrawer v-model:show={formShow.value} placement={'bottom'} to={'#tableCon'} trapFocus={false} height={'30vh'} blockScroll={false}>
              <NDrawerContent title={''}>
                {/*@ts-ignore*/}
                <ConnectForm form={form.value} v-model:show={formShow.value} />
              </NDrawerContent>
            </NDrawer>
          </div>

        </div>
      )
    }
  }

})