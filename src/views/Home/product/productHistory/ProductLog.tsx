import AbsBottomBtn from "@/components/AbsBottomBtn";
import MyNTable from "@/components/MyNTable";
import { useConfigStore } from "@/store/config";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, NDatePicker, NInput, NSelect, NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, reactive, watch } from "vue";
import { useMyI18n } from "@/hooks/useMyI18n";
import { ProductLogEntity, } from "~/me";
import { LogTypeMap } from "./enum";
import { useProductHistoryInnerDataStore } from "./innerData";
import { callBrige } from "@/utils/callm";

export default defineComponent({
  name: 'ProductLog',
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
        { key: 'ProductNo', title: t('config.spoolNumber'), resizable: true },
        { key: 'LogType', title: t('config.logType'), resizable: true },
        { key: 'LogOption', title: t('config.logOption'), resizable: true },
        { key: 'LogDetail', title: t('config.logDetail'), resizable: true },
        { key: 'Length', title: t('config.currentLength'), resizable: true },
        { key: 'Operator', title: t('config.operator'), resizable: true },
        { key: 'CreateTime', title: t('config.createTime'), resizable: true },
      ],
      tdata: [] as ProductLogEntity[],
      rowProps: (row: ProductLogEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: ProductLogEntity) => row.GId,
      virtualScroll: true,
      isSimpleStyle: true
    })
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const commonData = reactive({
      filterText: '',
      selectProps: tableCfg.columns[0].key,
      selectOpt: [tableCfg.columns[0]].map(e => {
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
      callBrige(callFnName.GetProductLogs, innerData.curRow?.GId).then((res: ProductLogEntity[]) => {
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
      tableCfg.columns[0].title = t('config.spoolNumber')
      tableCfg.columns[1].title = t('config.logType')
      tableCfg.columns[2].title = t('config.logOption')
      tableCfg.columns[3].title = t('config.logDetail')
      tableCfg.columns[4].title = t('config.currentLength')
      tableCfg.columns[5].title = t('config.operator')
      tableCfg.columns[6].title = t('config.createTime')
    })

    // getTableData()


    return () => {
      return (
        <div class={' w-full h-full'}>
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