import { useConfigStore } from "@/store/config";
import { DataTableProps, NAlert, NButton, NCollapse, NCollapseItem, NDataTable, NInput, NSelect, NSpace, SelectProps, useMessage } from "naive-ui";
import { computed, defineComponent, reactive, ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import TableOpCol from "@/components/TableOpCol/TableOpCol";
import { useMain } from "@/store";

export default defineComponent({
  name: 'AlarmDataTop',
  prosp: {
    rowList: Array
  },
  setup(props, ctx) {
    const configStore = useConfigStore()
    const store = useMain()
    const msg = useMessage()
    const rowKeyList = ref<DataTableProps['checkedRowKeys']>([])
    const rowList = ref<Record<string, string>[]>([])
    const tdata = ref<Record<string, string>[]>([])
    const optionMap: Record<string, SelectProps['options']> = reactive({
      Code: [],
      Condition: ['==', '>', '>=', '<', '<=', '!=', '>,<', '>=,<=', '<,>', '<=,>=', '->'].map((e) => {
        return { label: e, value: e }
      }),
    })
    const colList: DataTableProps['columns'] = [
      {
        type: 'selection',
        multiple: false,
      },
      {
        key: 'Code', title: '变量', resizable: true, render(row) {
          return <NSelect filterable v-model:value={row.Code} options={optionMap.Code}></NSelect>
        }
      },
      {
        key: 'Condition', title: '条件', resizable: true, render(row) {
          return <NSelect filterable v-model:value={row.Condition} options={optionMap.Condition}></NSelect>
        }
      },
      {
        key: 'MinValue', title: '最小值', resizable: true, render(row) {
          return <NInput v-model:value={row.MinValue}></NInput>
        }
      },
      {
        key: 'MaxValue', title: '最大值', resizable: true, render(row) {
          return <NInput v-model:value={row.MaxValue}></NInput>
        }
      },
      {
        key: 'op', title: '操作', width: 160, render(row) {
          return <TableOpCol e delFn={() => { delRow(row) }} />
        }
      },
    ]
    const buildRowProp = (rowData: any, index: number) => {
      return {
        onClick: () => {
          rowKeyList.value = [rowData.id]
          rowList.value = [rowData]
          ctx.emit('update:rowList', rowList.value)
          // if (rowKeyList.value?.includes(rowData.id)) {
          //   rowKeyList.value?.splice(rowKeyList.value?.indexOf(rowData.id), 1)
          //   rowList.value.splice(rowList.value.findIndex((e) => e.id == rowData.id), 1)
          // } else {
          //   rowKeyList.value?.push(rowData.id)
          //   rowList.value.push(rowData)
          // }
        }
      }
    }
    const initOptionMap = () => {
      let transaction = store.db.transaction(['dataMap'])
      var objectStore = transaction.objectStore('dataMap')
      let keyRange = IDBKeyRange.only(`Modbus-TCP-Slave`)
      var request = objectStore.index("ProtoType").getAll(keyRange)
      // .get(dataConfigPartStore.checkedRowItem?.ProtoType)
      request.onsuccess = function (event: any) {
        optionMap.Code = event.target.result.sort((a: any, b: any) => {
          return a.StaAdd - b.StaAdd
        }).map((e: any) => ({
          label: `${e.Code} - ${e.Remark}`, value: e.Code
        }))
      }
    }
    initOptionMap()

    const buildRowKey = (rowData: any) => {
      return rowData.id
    }
    const getCondi = () => {
      tdata.value = JSON.parse(JSON.stringify(configStore.dataConfig.alarmCondiList || []))
      rowKeyList.value = [tdata.value[0].id]
      rowList.value = [tdata.value[0]]
      ctx.emit('update:rowList', rowList.value)
    }
    getCondi()
    const addRow = () => {
      tdata.value.push({ id: uuidv4(), Code: '', Condition: '', MinValue: '', MaxValue: '' })
    }
    const delRow = (rowData: any) => {
      tdata.value.splice(tdata.value.findIndex((e) => e.id == rowData.id), 1)
    }
    const saveCondi = () => {
      configStore.setAlarmCondiData(tdata.value)
      msg.success('保存成功')
    }

    const curCondi = computed(() => {
      let item = rowList.value[0]
      if (!item)
        return ''
      let str = ''
      if (item.Condition.search(',') == -1) {
        str = `${item.Code} ${item.Condition} ${item.MinValue}`
      } else {
        let list = item.Condition.split(',')
        let text = '且'
        if (list[0].search('<') > -1)
          text = '或'
        str = `${item.Code} ${list[0]}  ${item.MinValue} ${text} ${item.Code} ${list[1]} ${item.MaxValue}`
      }
      return str
    })

    return () => {
      const collItmeSlot: any = {
        header: () => {
          return <div class={' text-lg'}>
            <span>当前条件 : </span> <span class={'text-blue-700 font-semibold ml-2'}>{curCondi.value}</span>
          </div>
        }
      }
      collItmeSlot['header-extra'] = () => {
        return <NAlert type={'info'}>在上表选中一个条件, 然后新增下表的变量</NAlert>
      }
      return (
        <NCollapse class={'mb-2 relative'}>
          <NCollapseItem name='1' v-slots={collItmeSlot}>
            <NDataTable class={'h-full shrink min-h-fit'} columns={colList} bordered={false} singleLine={false} data={tdata.value} rowProps={buildRowProp}
              checkedRowKeys={rowKeyList.value} rowKey={buildRowKey} size={'large'} >
            </NDataTable>
            <div class={'p-2 flex justify-end'}>
              <NSpace>
                <NButton onClick={addRow}>添加</NButton>
                <NButton type={'primary'} onClick={saveCondi} >保存</NButton>
              </NSpace>
            </div>
          </NCollapseItem>
        </NCollapse>
      )
    }
  }

})