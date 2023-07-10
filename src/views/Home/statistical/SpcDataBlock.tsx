import { NTable, NTbody } from "naive-ui";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: 'SpcDataBlock',
  props: {
    dataItem: Object,
  },
  setup(props, ctx) {
    const spcLabelList = [
      { label: '平均值', key: '1' },
      { label: '下限', key: '2' },
      { label: '标准偏差', key: '3' },
      { label: '标称值', key: '4' },
      { label: '最小值', key: '4' },
      { label: '上限', key: '4' },
      { label: '最大值', key: '4' },
      { label: 'CP', key: '4' },
      { label: '小于下限值', key: '4' },
      { label: 'CPK', key: '4' },
      { label: '大于上限值', key: '4' },
    ]
    const tabelList: typeof spcLabelList[0][][] = []
    for (let i = 0; i < spcLabelList.length; i += 2) {
      const pair = [spcLabelList[i],]
      const item = spcLabelList[i + 1]
      if (item) {
        pair.push(item)
      }
      tabelList.push(pair)
    }

    return () => {
      //todo spc值从realtime数据中根据key获取
      return (
        <div class={'w-full h-2/5 px-8 py-1'}>
          <NTable bordered={false} singleLine={true} singleColumn={true} size={'small'} style={{backgroundColor:'transparent'}} >
            <NTbody>
              {tabelList.map((list, i) => {
                return (
                  <tr class={'bg-transparent'} >
                    {list.map((e, i) => {
                      return [<td style={{padding:0,backgroundColor:'transparent'}}  >{e.label}</td>, <td style={{padding:0,backgroundColor:'transparent'}} class={' text-center bg-transparent'}><span class={'float-left'}>:</span> {'0.0000 mm'}</td>]
                    })}
                  </tr>
                )
              })}
            </NTbody>
          </NTable>
        </div >
      )
    }
  }

})