import { NTable, NTbody } from "naive-ui";
import { computed, defineComponent, onBeforeUnmount, PropType, reactive, watch } from "vue";
import { DataGroupEntity, DistributionEntity, ModbusAdressRow } from "~/me";
import { useMyI18n } from "@/hooks/useMyI18n";
import { sleep } from "@/utils/utils";
import { useMain } from "@/store";

export default defineComponent({
  name: 'SpcDataBlock',
  props: {
    dataItem: Object as PropType<DistributionEntity | null>,
    adressItem: Object as PropType<DataGroupEntity>
  },
  setup(props, ctx) {
    const { t, i18nStore, locale } = useMyI18n()
    const store = useMain()
    const spcLabelList: { label: string, key: string, value?: any, noUnit?: boolean }[] = [
      { label: t('data.average'), key: 'Avg' },
      { label: t('data.limitLow'), key: 'Lsl' },
      { label: t('data.standardDeviation'), key: 'Sigma' },
      { label: t('data.standard'), key: 'Std' },
      { label: t('data.min'), key: 'Min' },
      { label: t('data.limitHeight'), key: 'Usl' },
      { label: t('data.max'), key: 'Max' },
      // { label: 'CP', key: '4', noUnit: true },
      // { label: '分组计数', key: 'Group', noUnit: true },
      // { label: 'CPK', key: '4', noUnit: true },
      { label: t('data.accuracy'), key: 'Decimals', noUnit: true },
    ]
    const alldata = reactive({
      tableList: [] as typeof spcLabelList[0][][],
      watchInstance: null as any
    })
    const initData = (dataItem: DistributionEntity) => {
      spcLabelList.forEach(e => {
        e.value = dataItem[e.key as keyof DistributionEntity] as any
        e.value = Number(e.value).toFixed(props.adressItem?.Precision || 3)
      })
      alldata.tableList = []
      for (let i = 0; i < spcLabelList.length; i += 2) {
        const pair = [spcLabelList[i],]
        const item = spcLabelList[i + 1]
        if (item) {
          pair.push(item)
        }
        alldata.tableList.push(pair)
      }
    }

    alldata.watchInstance = watch(() => props.dataItem, (v) => {
      if (v) {
        initData(v!)

      }
    }, { immediate: true })

    // 语言切换时更新 spcLabelList 中的标签
    watch(() => i18nStore.langChangeCount, () => {
      sleep(100).then(() => {
        spcLabelList[0].label = t('data.average')
        spcLabelList[1].label = t('data.limitLow')
        spcLabelList[2].label = t('data.standardDeviation')
        spcLabelList[3].label = t('data.standard')
        spcLabelList[4].label = t('data.min')
        spcLabelList[5].label = t('data.limitHeight')
        spcLabelList[6].label = t('data.max')
        spcLabelList[7].label = t('data.accuracy')
        // 重新初始化数据以更新显示
        if (props.dataItem) {
          initData(props.dataItem)
        }
      })


    })
    const valWidth = computed(() => {
      return locale.value == 'zh-CN' ? 460 : 660
    })
    onBeforeUnmount(() => {
      alldata.watchInstance()
    })
    // initData()
    // const tabelList: typeof spcLabelList[0][][] = []
    // for (let i = 0; i < spcLabelList.length; i += 2) {
    //   const pair = [spcLabelList[i],]
    //   const item = spcLabelList[i + 1]
    //   if (item) {
    //     pair.push(item)
    //   }
    //   tabelList.push(pair)
    // }

    return () => {
      //todo spc值从realtime数据中根据key获取
      return (
        <div class={'flex justify-center px-8 py-1'}>
          <div class={`w-[${valWidth.value}px]`}>
            <NTable bordered={false} singleLine={true} singleColumn={true} size={'small'} style={{ backgroundColor: 'transparent' }} >
              <NTbody>
                {alldata.tableList.map((list, i) => {
                  return (
                    <tr class={'bg-transparent'} >
                      {list.map((e, i) => {
                        return [<td style={{ padding: 0, backgroundColor: 'transparent' }}  >{e.label}</td>, <td style={{ padding: 0, backgroundColor: 'transparent', margin: "0 10px" }} class={' text-center bg-transparent'}><span class={'float-left'}>:</span> {`${e.value} ${e.noUnit ? '' : props.adressItem?.Unit}`}</td>]
                      })}
                    </tr>
                  )
                })}
              </NTbody>
            </NTable>
          </div>

        </div >
      )
    }
  }

})