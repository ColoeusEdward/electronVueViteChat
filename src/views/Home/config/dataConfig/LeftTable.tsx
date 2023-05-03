import { useConfigStore } from "@/store/config";
import { DataTableProps, NButton, NDataTable, NSpace } from "naive-ui";
import { computed, defineComponent } from "vue";
import { useDataConfigPartStore } from "./dataConfigPartStore";

export default defineComponent({
  name: 'LeftTable',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const dataConfigPartStore = useDataConfigPartStore()
    const colList: DataTableProps['columns'] = [
      {
        type: 'selection',
        multiple: false,
      },
      { key: 'ProtoType', title: '协议类型', resizable: true },
      { key: 'Name', title: '名称', resizable: true },
    ]

    const buildRowProp = (rowData: any, index: number) => {
      return {
        onClick: () => {
          dataConfigPartStore.setCheckRowItem(rowData)
        }
      }
    }
    const buildRowKey = (rowData: any) => {
      return rowData.id
    }
    const updateRowChoose = (key: any) => {
      let item = configStore.connect.data.find(e => e.id == key[0])
      item && dataConfigPartStore.setCheckRowItem(item)
    }
    const tdata = computed(() => {
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
        <div class={'w-full h-full'}>
          <NDataTable columns={colList} bordered={false} singleLine={false} data={tdata.value} rowProps={buildRowProp} checkedRowKeys={[dataConfigPartStore.checkedRowItem?.id || '']} onUpdateCheckedRowKeys={updateRowChoose} rowKey={buildRowKey} size={'large'} >
          </NDataTable>
        </div>
      )
    }
  }

})