import MyNTable from "@/components/MyNTable";
import { callSpc } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { ajaxPromiseAll } from "@/utils/utils";
import { NButton, NPopconfirm, NSpace, useMessage } from "naive-ui";
import { defineComponent, reactive, Transition, watch } from "vue";
import { DataConfigEntity, FormulaDataEntity } from "~/me";
import DataForm from "./DataForm";
import { useFormulaCfgInnerDataStore } from "./innderData";

export default defineComponent({
  name: 'FormulaDataList',
  setup(props, ctx) {
    const innerData = useFormulaCfgInnerDataStore()
    const msg = useMessage()
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        { key: 'DataName', title: '数据名', resizable: true },
        { key: 'Standard', title: '标准值', resizable: true },
        { key: 'UpperTol', title: '上公差', resizable: true },
        { key: 'LowerTol', title: '下公差', resizable: true },
      ],
      data: [] as FormulaDataEntity[],
      rowProps: (row: FormulaDataEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: FormulaDataEntity) => row.GId
    })

    const rowClick = (row: FormulaDataEntity) => {
      innerData.setCurDataRowKey([row.GId!])
      innerData.setCurDataRow(row)
    }
    const getTbData = () => {
      if (!innerData.curRow) return
      innerData.cleanDataRow()
      ajaxPromiseAll<[FormulaDataEntity[], DataConfigEntity[]]>([callSpc(callFnName.getFormulaDatas, innerData.curRow.GId),
      callBrige(callFnName.GetDataConfigs)])
        .then(([flist, dlist]) => {
          console.log("🚀 ~ file: FormulaDataList.tsx:43 ~ .then ~ dlist:", dlist)
          let list = flist.map(e => {
            return {
              ...e,
              DataName: dlist.find(ed => ed.GId == e.DataId)?.Name
            }
          })
          tableCfg.data = list
          innerData.setDataList(list)
        })
    }
    innerData.setGetDataTbDataFn(getTbData)
    watch(() => innerData.curRow, (val) => {
      val && getTbData()
    })
    const delItem = () => {
      if (!innerData.curDataRow) {
        msg.warning('请选择一行数据')
        return
      }
      innerData.dataList.splice(innerData.dataList.findIndex(e => e.GId === innerData.curDataRow!.GId), 1)
      // callSpc(callFnName.saveFormulaConfig, [innerData.curRow, [...innerData.dataList]], true).then((res: number) => {
      //   getTbData()
      // })
    }
    const addItem = () => {
      innerData.setDataIsEdit(false)
      innerData.setDataFormShow(true)
    }
    const editItem = () => {
      if (!innerData.curRow) {
        msg.warning('请选择一行数据')
        return
      }
      innerData.setDataIsEdit(true)
      innerData.setDataFormShow(true)
    }

    return () => {
      return (
        <div class={'w-full h-full pl-2 flex flex-col'}>
          <NSpace justify={'end'} class={'flex-shrink-0 mb-2 pr-2'}>
            <NButton class={' '} size={'large'} onClick={addItem} > 添加标准</NButton>
            <NButton class={' '} size={'large'} onClick={editItem} > 编辑标准</NButton>
            <NPopconfirm onPositiveClick={delItem} placement={'bottom'} v-slots={{
              trigger: () => <NButton class={' '} type={'error'} size={'large'} > 删除标准</NButton>

            }}>
              确认删除吗?
            </NPopconfirm>
          </NSpace>
          <div class={' relative h-full'}>
            <MyNTable v-model:checkedRowKeys={innerData.curDataRowKey} {...tableCfg} />
            <Transition name={'full-pop'} >
              <DataForm v-show={innerData.dataFormShow} ></DataForm>
            </Transition>
          </div>
        </div>
      )
    }
  }

})