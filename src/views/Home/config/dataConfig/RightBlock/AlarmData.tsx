import { MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { useMain } from "@/store";
import { useConfigStore } from "@/store/config";
import { DataTableProps, NButton, NDataTable, NDrawer, NDrawerContent, NPopconfirm, NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, onMounted, ref, Teleport, watch } from "vue";
import { useDataConfigPartStore } from "../dataConfigPartStore";
import AlarmDataTop from "./AlarmDataTop";
import RealTimeDataAdd from "./RealTimeDataAdd";


export default defineComponent({
  name: 'AlarmData',
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
    const codiRowList = ref<Record<string, string>[]>([])

    const delRow = () => {
      if (rowKeyList.value?.length == 0) {
        return msg.warning('请选择要删除的数据')
      }
      var transaction = store.db.transaction(["alarmData"], "readwrite");
      transaction.oncomplete = () => {
        msg.success('删除成功')
        getTData()
      }
      var objectStore = transaction.objectStore("alarmData");
      rowKeyList.value?.forEach((key: any) => {
        objectStore.delete(key)
      })
      // var req = objectStore.delete(row.id)
      // req.onsuccess = function (event: any) {

      // }

    }
    const addRow = () => {
      if (!codiRowList.value || (codiRowList.value && !codiRowList.value[0]?.Code)) {
        msg.warning('请选择一个条件')
        return
      }
      form.value = {}
      formShow.value = true
    }
    const editRow = (row: any) => {
      form.value = { ...row }
      formShow.value = true
    }
    const colList: DataTableProps['columns'] = [
      {
        type: 'selection',
        multiple: true,
      },
      { key: 'Code', title: '连接变量', resizable: true },
      { key: 'Remark', title: '备注', resizable: true },
      // {
      //   key: 'op', title: '操作', width: 180, render(row) {
      //     return <TableOpCol editFn={() => { editRow(row) }}/>
      //   }
      // },
    ]
    const getTData = () => {
      if (codiRowList.value[0]) {
        let transaction = store.db.transaction(['alarmData'])
        var objectStore = transaction.objectStore('alarmData')
        let keyRange = IDBKeyRange.only(codiRowList.value[0].id)
        var request = objectStore.index("CondiId").getAll(keyRange)
        // .get(dataConfigPartStore.checkedRowItem?.ProtoType)
        request.onsuccess = function (event: any) {
          tdata.value = event.target.result.sort((a: any, b: any) => {
            return a.StaAdd - b.StaAdd
          })
        }
      }

    }

    const confirm = (list: Record<string, string>[]) => {


    }
    const buildRowProp = (rowData: any, index: number) => {
      return {
        onClick: () => {
          if (rowKeyList.value?.includes(rowData.id)) {
            rowKeyList.value?.splice(rowKeyList.value?.indexOf(rowData.id), 1)
          } else {
            rowKeyList.value?.push(rowData.id)
          }
          // dataConfigPartStore.setCheckRowItem(rowData)
        }
      }
    }
    const buildRowKey = (rowData: any) => {
      return rowData.id
    }
    const addCondiId = (item: Record<string, string>) => {
      item.CondiId = codiRowList.value![0].id
      item.id = item.id + item.CondiId
    }
    const curTabValue = computed(() => {
      return props.curTabValue
    })

    watch(() => {
      return dataConfigPartStore.checkedRowItem + codiRowList.value[0]?.id
    }, (val) => {
      getTData()
    })

    onMounted(() => {
      isMount.value = true
      getTData()
    })

    return () => {
      return (
        <div class={'w-full h-full flex flex-col'} id={'alarmDataTableCon'}>
          {
            curTabValue.value == 'alarmData' && isMount.value && <Teleport to="#dataConfigRightBlock">
              <div class={'w-[10vw] h-12 z-20 absolute flex justify-end items-center top-1 right-0 pr-2'}>
                <NButton size={'large'} class={'mr-2'} onClick={addRow} >新增</NButton>
                <NPopconfirm placement="bottom"
                  v-slots={{
                    default: () => {
                      return <div>确定删除?</div>
                    },
                    trigger: () => {
                      return <NButton type="error" size={'large'}>删除</NButton>
                    }
                  }}
                  onPositiveClick={() => { delRow() }}>
                </NPopconfirm>
                {/* <NButton size={'large'} type={'error'} onClick={delRow} >删除</NButton> */}
              </div>
            </Teleport>
          }

          <div class={' w-full'}>
            <AlarmDataTop v-model:rowList={codiRowList.value} />
          </div>

          <NDataTable flexHeight={true} class={'h-full shrink'} striped columns={colList} bordered={false} singleLine={false} data={tdata.value} rowProps={buildRowProp} checkedRowKeys={rowKeyList.value} rowKey={buildRowKey} size={'large'} >
          </NDataTable>



          <NDrawer v-model:show={formShow.value} placement={'bottom'} to={'#alarmDataTableCon'} trapFocus={false} height={'100%'} blockScroll={false}>
            <NDrawerContent title={''}>
              <RealTimeDataAdd v-model:show={formShow.value} getFn={getTData} realTimeData={tdata.value} tableName={'alarmData'} beforeAddFn={addCondiId} />
            </NDrawerContent>
          </NDrawer>
        </div>
      )
    }
  }

})