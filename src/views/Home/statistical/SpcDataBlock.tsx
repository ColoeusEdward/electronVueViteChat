import { NTable, NTbody } from "naive-ui";
import { defineComponent, onBeforeUnmount, PropType, reactive, watch } from "vue";
import { DataGroupEntity, DistributionEntity, ModbusAdressRow } from "~/me";

export default defineComponent({
  name: 'SpcDataBlock',
  props: {
    dataItem: Object as PropType<DistributionEntity | null>,
    adressItem: Object as PropType<DataGroupEntity>
  },
  setup(props, ctx) {
    const spcLabelList: { label: string, key: string, value?: any, noUnit?: boolean }[] = [
      { label: '平均值', key: 'Avg' },
      { label: '下限', key: 'Lsl' },
      { label: '标准偏差', key: 'Sigma' },
      { label: '标称值', key: 'Std' },
      { label: '最小值', key: 'Min' },
      { label: '上限', key: 'Usl' },
      { label: '最大值', key: 'Max' },
      // { label: 'CP', key: '4', noUnit: true },
      // { label: '分组计数', key: 'Group', noUnit: true },
      // { label: 'CPK', key: '4', noUnit: true },
      { label: '精准度', key: 'Decimals', noUnit: true },
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
          <div class={'w-[460px]'}>
            <NTable bordered={false} singleLine={true} singleColumn={true} size={'small'} style={{ backgroundColor: 'transparent' }} >
              <NTbody>
                {alldata.tableList.map((list, i) => {
                  return (
                    <tr class={'bg-transparent'} >
                      {list.map((e, i) => {
                        return [<td style={{ padding: 0, backgroundColor: 'transparent' }}  >{e.label}</td>, <td style={{ padding: 0, backgroundColor: 'transparent' }} class={' text-center bg-transparent'}><span class={'float-left'}>:</span> {`${e.value} ${e.noUnit ? '' : props.adressItem?.Unit}`}</td>]
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