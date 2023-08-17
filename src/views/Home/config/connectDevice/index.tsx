import TableOpCol from "@/components/TableOpCol/TableOpCol";
import { useMain } from "@/store";
import { useConfigStore } from "@/store/config";
import { DataTableProps, NButton, NDataTable, NDrawer, NDrawerContent } from "naive-ui";
import { computed, defineComponent, ref } from "vue";
import { useDataConfigPartStore } from "../dataConfig/dataConfigPartStore";
import IndexForm from "./IndexForm";

export default defineComponent({
  name: 'ConnectDevice',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const formShow = ref(false)
    const store = useMain()
    const tdata = ref<Record<string, string>[]>([])
    const form = ref<connectDevForm>({

    })
    const delRow = (row: any) => {
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

    const getTData = () => {
      let transaction = store.db.transaction(['connectDev'])
      var objectStore = transaction.objectStore('connectDev')
      var request = objectStore.getAll()
      // .get(dataConfigPartStore.checkedRowItem?.ProtoType)
      request.onsuccess = function (event: any) {
        tdata.value = event.target.result.sort((a: any, b: any) => {
          return a.createTime - b.createTime
        })
      }
    }
    getTData()


    const colList: DataTableProps['columns'] = [
      { key: 'Interface', title: 'Interface', resizable: true },
      { key: 'Port', title: 'Port', resizable: true },
      { key: 'Baud', title: 'Baud', resizable: true },
      { key: 'DeviceType', title: 'DeviceType', resizable: true },
      { key: 'PositionName', title: 'PositionName', resizable: true },
      { key: 'Distance', title: 'Distance', resizable: true },
      // { key: 'Remark', title: '备注', resizable: true },
      {
        key: 'op', title: '操作', width: 200, render(row) {
          return <TableOpCol editFn={() => { editRow(row) }} delFn={() => { delRow(row) }} />
        }
      },
    ]

    return () => {
      return (
        <div class={'w-full h-full  px-2 flex flex-col'}>
          <div class={'w-full h-10 flex justify-end items-center pb-2'}>
            <NButton size={'large'} onClick={addRow} >新增</NButton>
          </div>
          <div class={'h-full shrink relative border-0 border-b-2 border-solid border-gray-300'} id={'tableConDev'}>
            <NDataTable bordered={false} singleLine={false} columns={colList} data={tdata.value} size={'large'} >
            </NDataTable>
          </div>
          <NDrawer v-model:show={formShow.value} placement={'bottom'} to={'#tableConDev'} trapFocus={false} height={'30vh'} blockScroll={false}>
            <NDrawerContent title={''}>
              {/*@ts-ignore*/}
              <IndexForm getFn={getTData} form={form.value} v-model:show={formShow.value} />
            </NDrawerContent>
          </NDrawer>
        </div>
      )
    }
  }

})