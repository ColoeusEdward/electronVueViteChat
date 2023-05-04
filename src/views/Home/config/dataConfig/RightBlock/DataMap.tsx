import TableOpCol from "@/components/TableOpCol/TableOpCol";
import { useMain } from "@/store";
import { useConfigStore } from "@/store/config";
import { DataTableProps, NButton, NDataTable, NDrawer, NDrawerContent, NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, onMounted, ref, Teleport, watch } from "vue";
import { useDataConfigPartStore } from "../dataConfigPartStore";
import DataMapAutoForm from "./DataMapAutoForm";
import DataMapForm from "./DataMapForm";


export default defineComponent({
  name: 'DataMap',
  props: {
    curTabValue: String
  },
  setup(props, ctx) {
    const configStore = useConfigStore()
    const store = useMain()
    const dataConfigPartStore = useDataConfigPartStore()
    const rowKeyList = ref<DataTableProps['checkedRowKeys']>([])
    const tdata = ref<Record<string, string>[]>([])
    const formShow = ref(false)
    const form = ref<Record<string, string>>({})
    const isMount = ref(false)
    const msg = useMessage()

    const delRow = (row: any) => {
      var transaction = store.db.transaction(["dataMap"], "readwrite");
      var objectStore = transaction.objectStore("dataMap");
      var req = objectStore.delete(row.id)
      req.onsuccess = function (event: any) {
        msg.success('删除成功')
        getTData()
      }

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
      // {
      //   type: 'selection',
      //   multiple: true,
      // },
      { key: 'Code', title: '连接变量', resizable: true },
      { key: 'StaAdd', title: '开始地址', resizable: true },
      { key: 'Length', title: '数据长度', resizable: true },
      { key: 'DataType', title: '数据类型', resizable: true },
      { key: 'RegiType', title: '寄存器类型', resizable: true },
      { key: 'Writable', title: '连接变量', resizable: true },
      { key: 'Remark', title: '备注', resizable: true },
      {
        key: 'op', title: '操作', width: 180, render(row) {
          return <TableOpCol editFn={() => { editRow(row) }} delFn={() => { delRow(row) }} />
        }
      },
    ]
    const getTData = () => {
      let transaction = store.db.transaction(['dataMap'])
      var objectStore = transaction.objectStore('dataMap')
      let keyRange = IDBKeyRange.only(dataConfigPartStore.checkedRowItem?.ProtoType)
      var request = objectStore.index("ProtoType").getAll(keyRange)
      // .get(dataConfigPartStore.checkedRowItem?.ProtoType)
      request.onsuccess = function (event: any) {
        tdata.value = event.target.result.sort((a: any, b: any) => {
          return a.StaAdd - b.StaAdd
        })
      }
    }
    getTData()




    const buildRowProp = (rowData: any, index: number) => {
      return {
        onClick: () => {
          // dataConfigPartStore.setCheckRowItem(rowData)
        }
      }
    }
    const buildRowKey = (rowData: any) => {
      return rowData.id
    }

    const curTabValue = computed(() => {
      return props.curTabValue
    })

    watch(() => {
      return dataConfigPartStore.checkedRowItem
    }, (val) => {
      getTData()
    })

    onMounted(() => {
      isMount.value = true
    })

    return () => {
      return (
        <div class={'w-full h-full '} id={'dataMapTableCon'}>
          {
            curTabValue.value == 'dataMap' && isMount.value && <Teleport to="#dataConfigRightBlock">
              <div class={'w-[10vw] h-12 z-20 absolute flex justify-end items-center top-1 right-0 pr-2'}>
                <NButton size={'large'} onClick={addRow} >新增</NButton>
              </div>
            </Teleport>
          }

          <NDataTable flexHeight={true} class={'h-full'} striped columns={colList} bordered={false} singleLine={false} data={tdata.value} rowProps={buildRowProp} v-model:checkedRowKeys={rowKeyList.value} rowKey={buildRowKey} size={'large'} >
          </NDataTable>

          <NDrawer v-model:show={formShow.value} placement={'bottom'} to={'#dataMapTableCon'} trapFocus={false} height={'26vh'} blockScroll={false}>
            <NDrawerContent title={''}>
              {
                dataConfigPartStore.checkedRowItem?.ProtoType == 'Modbus-TCP-Slave' ? <DataMapForm form={form.value} v-model:show={formShow.value} getFn={getTData} /> :
                <DataMapAutoForm form={form.value} v-model:show={formShow.value} getFn={getTData} />
              }
            </NDrawerContent>
          </NDrawer>
        </div>
      )
    }
  }

})