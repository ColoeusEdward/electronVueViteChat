import AbsBottomBtn from "@/components/AbsBottomBtn";
import MyNTable from "@/components/MyNTable";
import { useConfigStore } from "@/store/config";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, NDatePicker, NInput, NSelect, NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, reactive, watch } from "vue";
import { ProductLogEntity, } from "~/me";
import { LogTypeMap } from "./enum";
import { useProductHistoryInnerDataStore } from "./innerData";

export default defineComponent({
  name: 'ProductLog',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const innerData = useProductHistoryInnerDataStore()
    const msg = useMessage()
    const cancel = () => {
      configStore.setProductLogShow(false)
    }
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        // ,render: (row: ProductLogEntity) => {
        //   return LogTypeMap[row.LogType]
        // }
        { key: 'ProductNo', title: '产品编号', resizable: true },
        { key: 'LogType', title: '日志类型', resizable: true },
        { key: 'LogOption', title: '日志选项', resizable: true },
        { key: 'LogDetail', title: '日志详细', resizable: true },
        { key: 'Length', title: '当前米数', resizable: true },
        { key: 'Operator', title: '操作员', resizable: true },
        { key: 'CreateTime', title: '创建时间', resizable: true },
      ],
      tdata: [] as ProductLogEntity[],
      rowProps: (row: ProductLogEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: ProductLogEntity) => row.GId,
      virtualScroll: true
    })
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const commonData = reactive({
      filterText: '',
      selectProps: tableCfg.columns[1].key,
      selectOpt: [tableCfg.columns[1]].map(e => {
        return { label: e.title, value: e.key }
      }),
      range: [sevenDaysAgo.getTime(), Date.now()] as [number, number]
    })
    const rowClick = (row: ProductLogEntity) => {
      // innerData.setCurRowKey([row.GId!])
      // innerData.setCurRow(row)
    }
    // const ftdata = computed(() => {
    //   // let res = true
    //   let isTrue = false
    //   if (!commonData.filterText) isTrue = true
    //   if (!commonData.selectProps) isTrue = true
    //   let list = tableCfg.tdata.filter(item => {
    //     if (isTrue) return true
    //     let val = item[commonData.selectProps as keyof ProductLogEntity]
    //     if (!val) return false
    //     return val.toString().includes(commonData.filterText)
    //   })
    //   return list
    // })
    const getTableData = () => {
      // if (!commonData.filterText) {
      //   msg.warning('请输入编号')
      //   return
      // }
      callSpc(callFnName.GetProductLogs, innerData.curRow?.ProductNo).then((res: ProductLogEntity[]) => {
        console.log("🚀 ~ file: index.tsx:48 ~ callSpc ~ res:", res)
        // if (res.length == 0) {
        //   msg.warning('暂无数据')
        // }
        tableCfg.tdata = res
      })
    }
    watch(() => innerData.curRow, (val) => {
      val && getTableData()
    })

    // getTableData()


    return () => {
      return (
        <div class={'flex-shrink'}>
          {/* @ts-ignore */}
          <MyNTable {...tableCfg} data={tableCfg.tdata} />
        </div>
        // <div class={' w-screen h-screen absolute  flex flex-col z-10 bg-white overflow-hidden'}>
        //   <div class={"flex-shrink flex flex-col"}>
        //     <div class={'p-3'}>
        //       <NSpace>
        //         <NSelect class={'w-32'} v-model:value={commonData.selectProps} options={commonData.selectOpt}></NSelect>
        //         <NInput v-model:value={commonData.filterText} placeholder={`请输入编号查询`} clearable ></NInput>
        //         <NButton onClick={() => { getTableData() }}>查询</NButton>
        //         {/* <NDatePicker v-model:value={commonData.range} type="daterange" clearable /> */}
        //       </NSpace>
        //     </div>
        //     <div class={'flex-shrink'}>
        //       {/* @ts-ignore */}
        //       <MyNTable {...tableCfg} data={tableCfg.tdata} />
        //     </div>
        //   </div>

        //   <AbsBottomBtn cancelFn={cancel} />
        // </div>
      )
    }
  }

})