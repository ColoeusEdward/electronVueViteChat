import { MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import MyNTable from "@/components/MyNTable";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { ajaxPromiseAll } from "@/utils/utils";
import { NButton, NPopconfirm, NSpace, useMessage } from "naive-ui";
import { defineComponent, onMounted, reactive, Transition } from "vue";
import { SerialNoEntity } from "~/me";
import { FieldTypeList, originFieldTypeList } from "./enum";
import { useSysCfgInnerDataStore } from "./innderData";
import SerialRuleForm from "./SerialRuleForm";

export default defineComponent({
  name: 'SerialNoRule',  //编码规则
  setup(props, ctx) {
    const innerData = useSysCfgInnerDataStore()
    const msg = useMessage()
    const commonData = reactive({
      moveLoading: false,
    })
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        { key: 'SortNum', title: '排序位置', resizable: true },
        { key: 'FieldType', title: '字段类型', resizable: true,render: (row: SerialNoEntity) => {
          return originFieldTypeList[row.FieldType]
        } },
        { key: 'Format', title: '格式', resizable: true },
      ],
      data: [] as SerialNoEntity[],
      rowProps: (row: SerialNoEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: SerialNoEntity) => row.GId
    })
    const rowClick = (row: SerialNoEntity) => {
      innerData.setCurRowKey([row.GId!])
      innerData.setCurRow(row)
    }
    const moveUp = () => {
      if (!innerData.curRow) {
        msg.warning('请选择一行数据')
        return
      }
      let idx = tableCfg.data.findIndex(row => row.GId === innerData.curRow?.GId)
      if (idx > 0) {
        commonData.moveLoading = true
        tableCfg.data[idx - 1].SortNum++;
        tableCfg.data[idx].SortNum--;
        ajaxPromiseAll([callSpc(callFnName.saveSerialNo, tableCfg.data[idx - 1]), callSpc(callFnName.saveSerialNo, tableCfg.data[idx])])
          .then(() => {
            return getTbData()
          }).finally(() => {
            commonData.moveLoading = false
          })
      }
    }
    const moveDown = () => {
      if (!innerData.curRow) {
        msg.warning('请选择一行数据')
        return
      }
      let idx = tableCfg.data.findIndex(row => row.GId === innerData.curRow?.GId)
      if (idx < tableCfg.data.length - 1) {
        commonData.moveLoading = true

        tableCfg.data[idx + 1].SortNum--;
        tableCfg.data[idx].SortNum++;
        ajaxPromiseAll([callSpc(callFnName.saveSerialNo, tableCfg.data[idx + 1]), callSpc(callFnName.saveSerialNo, tableCfg.data[idx])])
          .then(() => {
            return getTbData()
          }).finally(() => {
            commonData.moveLoading = false
          })
      }
    }
    const getTbData = () => {
      innerData.cleanRow()
      return callSpc(callFnName.getSerialNos).then((res: SerialNoEntity[]) => {
        tableCfg.data = res.sort((a, b) => {
          return a.SortNum - b.SortNum
        })
        innerData.setTalbeLength(res.length)
      })
    }
    getTbData()
    innerData.setGetTbDataFn(getTbData)
    const delItem = () => {
      if (!innerData.curRow) {
        msg.warning('请选择一行数据')
        return
      }
      callSpc(callFnName.deleteSerialNo, innerData.curRow).then(() => {
        getTbData()
      })
    }
    const addItem = () => {
      innerData.setAddFormShow(true)
    }
    onMounted(() => {
      innerData.setAddFormShow(false)
    })

    return () => {
      return (
        <div class={'w-full h-full flex min-h-[380px]'}>
          <div class={"w-3/5 h-full"}>
            <MyNTable v-model:checked-row-keys={innerData.curRowKey}  {...tableCfg} />
          </div>
          <div class={"w-2/5 h-full flex pl-2"}>
            <div class={'border border-solid border-gray-200 rounded-md h-full p-2 flex-shrink-0'}>
              <NSpace>
                <NButton size='large' onClick={addItem} >添加</NButton>
                <NPopconfirm onPositiveClick={delItem} placement={'top'} v-slots={{
                  trigger: () => <NButton size='large' type={'error'} >删除</NButton>
                }}>
                  确认删除吗?
                </NPopconfirm>
              </NSpace>
              <NSpace class={'mt-2'}>
                <NButton size='large' disabled={commonData.moveLoading} onClick={moveUp}>上移</NButton>
                <NButton size='large' disabled={commonData.moveLoading} onClick={moveDown} >下移</NButton>
              </NSpace>
            </div>
            <Transition name={'full-pop'}>
              <SerialRuleForm v-show={innerData.addFormShow} />
            </Transition>
          </div>
        </div>
      )
    }
  }

})