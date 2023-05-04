import { useMain } from "@/store";
import { useConfigStore } from "@/store/config";
import { DataTableProps, NButton, NDataTable, NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, onMounted, PropType, ref } from "vue";
import { useDataConfigPartStore } from "../dataConfigPartStore";

export default defineComponent({
  name: 'RealTimeDataAdd',
  props: {
    show: Boolean,
    getFn: Function,
    realTimeData: Array as PropType<Record<string, string>[]>,
    tableName:{
      type:String,
      defautl:'realTimeData'
    },
    beforeAddFn:Function        //保存之前对数据进行处理 
  },
  setup(props, ctx) {
    const configStore = useConfigStore()
    const store = useMain()
    const dataConfigPartStore = useDataConfigPartStore()
    const rowKeyList = ref<DataTableProps['checkedRowKeys']>([])
    const rowList = ref<Record<string, string>[]>([])
    const tdata = ref<Record<string, string>[]>([])
    const msg = useMessage()
    const colList: DataTableProps['columns'] = [
      {
        type: 'selection',
        multiple: true,
      },
      { key: 'Code', title: '连接变量', resizable: true },
      { key: 'StaAdd', title: '开始地址', resizable: true },
      { key: 'Length', title: '数据长度', resizable: true },
      { key: 'DataType', title: '数据类型', resizable: true },
      { key: 'RegiType', title: '寄存器类型', resizable: true },
      { key: 'Writable', title: '连接变量', resizable: true },
      { key: 'Remark', title: '备注', resizable: true },
    ]
    const realTimeData = computed(() => {
      return props.realTimeData
    })

    const confirm = () => {
      // ctx.emit('confirm', rowList.value)
      let transaction = store.db.transaction([props.tableName||'realTimeData'], 'readwrite')
      transaction.oncomplete = () => {
        ctx.emit('update:show', false)
        msg.success('保存成功')
        props.getFn && props.getFn()
      }
      transaction.onerror = (error:any) => {
        console.log("🚀 ~ file: RealTimeDataAdd.tsx:53 ~ confirm ~ error:", error)
        msg.error('保存失败')
      }

      var objectStore = transaction.objectStore(props.tableName||'realTimeData')
      rowList.value.forEach((e) => {
        let item = { ...e }
        props.beforeAddFn && props.beforeAddFn(item)
        objectStore.add(item)
      })

    }
    const cancel = () => {
      ctx.emit('update:show', false)
    }
    const buildRowProp = (rowData: any, index: number) => {
      return {
        onClick: () => {
          if (rowKeyList.value?.includes(rowData.id)) {
            rowKeyList.value?.splice(rowKeyList.value?.indexOf(rowData.id), 1)
            rowList.value.splice(rowList.value.findIndex((e) => e.id == rowData.id), 1)
          } else {
            rowKeyList.value?.push(rowData.id)
            rowList.value.push(rowData)
          }
        }
      }
    }
    const buildRowKey = (rowData: any) => {
      return rowData.id
    }

    const getDataMapData = () => {
      let transaction = store.db.transaction(['dataMap'])
      var objectStore = transaction.objectStore('dataMap')
      let keyRange = IDBKeyRange.only(dataConfigPartStore.checkedRowItem?.ProtoType)
      var request = objectStore.index("ProtoType").getAll(keyRange)
      // .get(dataConfigPartStore.checkedRowItem?.ProtoType)
      request.onsuccess = function (event: any) {
        tdata.value = event.target.result.filter((e: any) => {
          if (!realTimeData.value)
            return true
          return !realTimeData.value.some(ee => ee.id == e.id)
        }).sort((a: any, b: any) => {
          return a.StaAdd - b.StaAdd
        })
      }
    }
    onMounted(() => {
      getDataMapData()
    })


    return () => {
      return (
        <div class={'w-full h-full flex flex-col'}>
          <div class={'w-full h-14 flex justify-end'}>
            <NSpace>
              <NButton size={'large'} type={'primary'} onClick={confirm} >确认</NButton>
              <NButton size={'large'} onClick={cancel} >取消</NButton>
            </NSpace>
          </div>
          <NDataTable class={'h-full shrink'} columns={colList} bordered={false} singleLine={false} data={tdata.value} rowProps={buildRowProp}
            checkedRowKeys={rowKeyList.value} rowKey={buildRowKey} size={'large'} >
          </NDataTable>
        </div>
      )
    }

  }

})