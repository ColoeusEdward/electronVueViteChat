import MyNTable from "@/components/MyNTable";
import { useConfigStore } from "@/store/config";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { useMessage } from "naive-ui";
import { defineComponent, reactive, watch } from "vue";
import { useMyI18n } from "@/hooks/useMyI18n";
import { ProductStatisticEntity } from "~/me";
import { useProductHistoryInnerDataStore } from "./innerData";

export default defineComponent({
  name: 'Statistic',  //线轴统计数据
  setup(props, ctx) {
    const configStore = useConfigStore()
    const { t, i18nStore } = useMyI18n()
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
        // ,render: (row: ProductStatisticEntity) => {
        //   return LogTypeMap[row.LogType]
        // }
        // { key: 'ProductNo', title: '产品编号', resizable: true },
        { key: 'Name', title: t('config.name'), resizable: true },
        { key: 'Unit', title: t('config.unit'), resizable: true },
        { key: 'Standard', title: t('data.standard2'), resizable: true },
        { key: 'USL', title: t('data.limitHeight'), resizable: true },
        { key: 'LSL', title: t('data.limitLow'), resizable: true },
        { key: 'Average', title: t('data.average'), resizable: true },
        { key: 'Max', title: t('data.max'), resizable: true },
        { key: 'Min', title: t('data.min'), resizable: true },
        { key: 'StdDeviation', title: t('data.standardDeviation'), resizable: true },
        { key: 'Ca', title: 'CA', resizable: true },
        { key: 'Cp', title: 'CP', resizable: true },
        { key: 'Cpk', title: 'CPK', resizable: true },

      ],
      tdata: [] as ProductStatisticEntity[],
      rowProps: (row: ProductStatisticEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: ProductStatisticEntity) => row.GId,
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
    const rowClick = (row: ProductStatisticEntity) => {
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
    //     let val = item[commonData.selectProps as keyof ProductStatisticEntity]
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
      callSpc(callFnName.GetProductStatistics, innerData.curRow?.ProductNo).then((res: ProductStatisticEntity[]) => {
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

    // 语言切换时更新 tableCfg 中的标题
    watch(() => i18nStore.langChangeCount, () => {
      tableCfg.columns[1].title = t('config.name')
      tableCfg.columns[2].title = t('config.unit')
      tableCfg.columns[3].title = t('data.standard2')
      tableCfg.columns[4].title = t('data.limitHeight')
      tableCfg.columns[5].title = t('data.limitLow')
      tableCfg.columns[6].title = t('data.average')
      tableCfg.columns[7].title = t('data.max')
      tableCfg.columns[8].title = t('data.min')
      tableCfg.columns[9].title = t('data.standardDeviation')
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