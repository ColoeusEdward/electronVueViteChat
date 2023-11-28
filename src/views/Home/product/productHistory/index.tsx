import AbsBottomBtn from "@/components/AbsBottomBtn";
import MyNTable from "@/components/MyNTable";
import { useConfigStore } from "@/store/config";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, NDatePicker, NDivider, NInput, NSelect, NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, reactive } from "vue";
import { ProductHistoryEntity } from "~/me";
import { useProductHistoryInnerDataStore } from "./innerData";
import ProductLog from "./ProductLog";
import Statistic from "./Statistic";

export default defineComponent({
  name: 'ProductHistory',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const innerData = useProductHistoryInnerDataStore()
    const msg = useMessage()


    const cancel = () => {
      configStore.setProductHistoryShow(false)
    }
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        { key: 'ProductNo', title: '线轴编号', resizable: true },
        { key: 'PN', title: '线材型号', resizable: true },
        { key: 'Note', title: '物料注释', resizable: true },
        { key: 'StartTime', title: '开始时间', resizable: true },
        { key: 'EndTime', title: '结束时间', resizable: true },
        { key: 'Operator', title: '操作员', resizable: true },
        { key: 'ExcelPath', title: 'Excel导出路径', resizable: true, width: '120px' },
        { key: 'PdfPath', title: 'PDF导出路径', resizable: true },
      ],
      tdata: [] as ProductHistoryEntity[],
      rowProps: (row: ProductHistoryEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: ProductHistoryEntity) => row.GId,
      virtualScroll: true
    })
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const commonData = reactive({
      filterText: '',
      selectProps: tableCfg.columns[1].key,
      selectOpt: [tableCfg.columns[1], tableCfg.columns[2]].map(e => {
        return { label: e.title, value: e.key }
      }),
      range: [sevenDaysAgo.getTime(), Date.now()] as [number, number]
    })
    const rowClick = (row: ProductHistoryEntity) => {
      innerData.setCurRowKey([row.GId!])
      innerData.setCurRow(row)
    }
    const ftdata = computed(() => {
      // let res = true
      let isTrue = false
      if (!commonData.filterText) isTrue = true
      if (!commonData.selectProps) isTrue = true
      let list = tableCfg.tdata.filter(item => {
        if (isTrue) return true
        let val = item[commonData.selectProps as keyof ProductHistoryEntity]
        if (!val) return false
        return val.toString().includes(commonData.filterText)
      })
      return list
    })
    const getTableData = (isTimeRange?: boolean) => {
      let data: Record<string, number> = {}
      if (isTimeRange) {
        data.startTime = commonData.range[0]!
        data.endTime = commonData.range[1]!
      }
      callSpc(callFnName.getProductHistorys, [data.startTime, data.endTime], true).then((res: ProductHistoryEntity[]) => {
        console.log("🚀 ~ file: index.tsx:48 ~ callSpc ~ res:", res)
        if(res.length == 0){
          msg.warning('暂无数据')
        }
        tableCfg.tdata = res
      })
    }
    getTableData()


    return () => {
      return (
        <div class={' w-screen h-screen absolute  flex flex-col z-10 bg-white overflow-hidden'}>
          <div class={'flex-shrink flex h-full w-full'}>
            <div class={"flex flex-col w-1/2"}>
              <div class={'p-3'}>
                <NSpace>
                  <NSelect class={'w-32'} v-model:value={commonData.selectProps} options={commonData.selectOpt}></NSelect>
                  <NInput v-model:value={commonData.filterText} placeholder={`内容筛选`} clearable ></NInput>

                  <NDatePicker v-model:value={commonData.range} type="daterange" clearable />
                  <NButton onClick={() => { getTableData(true) }}>查询</NButton>
                </NSpace>
              </div>
              <div class={'flex-shrink'}>
                {/* @ts-ignore */}
                <MyNTable {...tableCfg} data={ftdata.value} />
              </div>
            </div>

            <div class={'w-1/2 h-full border-0 border-l border-gray-200 border-solid'}>
              <div class={'h-1/2 flex flex-col'}>
                <NDivider titlePlacement="left" >线轴统计数据</NDivider >
                <Statistic />
              </div>
              <div class={'h-1/2 flex flex-col'}>
                <NDivider titlePlacement="left" >产品日志</NDivider >
                <ProductLog />
              </div>

            </div>


          </div>

          <AbsBottomBtn cancelFn={cancel} />
        </div>
      )
    }
  }

})