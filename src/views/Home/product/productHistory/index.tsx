import AbsBottomBtn from "@/components/AbsBottomBtn";
import MyNTable from "@/components/MyNTable";
import { useMain } from "@/store";
import { useConfigStore } from "@/store/config";
import { callSpc } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import classNames from "classnames";
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
    const store = useMain()
    const innerData = useProductHistoryInnerDataStore()
    const msg = useMessage()


    const cancel = () => {
      configStore.setProductHistoryShow(false)
    }
    const tableCfg = reactive({
      columns: [
        // {
        //   type: 'selection',
        //   multiple: false,
        // },
        { key: 'ProductNo', title: '线轴编号', resizable: true, align: 'center' },
        { key: 'PN', title: '线材型号', resizable: true },
        // { key: 'Note', title: '物料注释', resizable: true },
        { key: 'StartTime', title: '开始时间', resizable: true },
        { key: 'EndTime', title: '结束时间', resizable: true },
        { key: 'Operator', title: '操作员', resizable: true },
        { key: 'ExcelPath', title: 'Excel导出路径', resizable: true, },
        { key: 'PdfPath', title: 'PDF导出路径', resizable: true },
      ],
      tdata: [
        // { PN: 22232 },
        // { PN: 22232 },
      ] as ProductHistoryEntity[],
      rowProps: (row: ProductHistoryEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: ProductHistoryEntity) => row.GId,
      virtualScroll: true,
      isSimpleStyle: true
    })
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const commonData = reactive({
      filterText: '',
      selectProps: tableCfg.columns[1].key,
      // tableCfg.columns[2]
      selectOpt: [tableCfg.columns[1]].map(e => {
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
      callBrige(callFnName.GetProductHistorys, [data.startTime, data.endTime, commonData.filterText], true).then((res: ProductHistoryEntity[]) => {
        console.log("🚀 ~ file: index.tsx:48 ~ callSpc ~ res:", res)
        if (res.length == 0) {
          msg.warning('暂无数据')
        }
        tableCfg.tdata = res
      })
    }
    // getTableData()


    return () => {
      return (
        <div class={' w-screen h-screen absolute  flex flex-col z-10 bg-[#f5f6f6] overflow-hidden'}>
          <div class={classNames('flex-shrink flex h-full w-full', { 'flex-col': !store.isLandscape })}>
            <div class={classNames("flex flex-col ", { 'w-full': store.isLandscape, 'h-1/2': !store.isLandscape })}>
              <div class={'p-3'}>
                <NSpace>
                  <NSelect class={'w-32'} v-model:value={commonData.selectProps} options={commonData.selectOpt}></NSelect>
                  <NInput v-model:value={commonData.filterText} placeholder={`请输入`} clearable ></NInput>

                  <NDatePicker v-model:value={commonData.range} type="daterange" clearable />
                  <NButton onClick={() => { getTableData(true) }}>查询</NButton>
                </NSpace>
              </div>
              <div class={'flex-shrink'}>
                {/* @ts-ignore */}
                <MyNTable {...tableCfg} data={ftdata.value} />
              </div>
            </div>
            {/* <div class={classNames(' border-0 border-l border-gray-200 border-solid', { 'w-1/2': store.isLandscape, 'h-1/2': !store.isLandscape })}>
              <div class={classNames('h-1/2 flex flex-col',)}>
                <NDivider titlePlacement="left" >线轴统计数据</NDivider >
                <Statistic />
              </div>
              <div class={'h-1/2 flex flex-col'}>
                <NDivider titlePlacement="left" >产品日志</NDivider >
                <ProductLog />
              </div>

            </div> */}


          </div>

          <AbsBottomBtn cancelFn={cancel} />
        </div>
      )
    }
  }

})