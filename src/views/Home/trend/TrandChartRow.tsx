import { } from "naive-ui";
import { defineComponent, reactive, ref, computed, onMounted, watch, PropType, nextTick } from "vue";

import { useRealTimeStore } from "@/store/realtime";
import * as echarts from 'echarts';
import { useTrendStore } from "@/store/trendStore";
import { storeToRefs } from "pinia";
import { sleep } from "@/utils/utils";

export default defineComponent({
  name: 'TrandChartRow',
  props: {
    dataSourceItem: {
      type: Object as PropType<{
        label: string,
        key: string,
        parent: string
      }>,
    },
    i: {
      type: Number
    }
  },
  setup(props, ctx) {
    let count = 0                     //记录realdata数据的更新次数
    const realtimeStore = useRealTimeStore()
    const trendStore = useTrendStore()
    let myChart: echarts.ECharts
    let unit = `mm`
    const dataSourceItem = computed(() => {
      return props.dataSourceItem
    })
    let dataItem = realtimeStore.realData[`${dataSourceItem.value?.parent}Data`] || {}
    const initEchart = () => {
      let ele = document.getElementById('trendChart' + props.i)
      if (!ele) return
      myChart = echarts.init(ele, undefined, {
        useDirtyRect: true
      });

      let option = {
        title: {
          //@ts-ignore
          text: dataSourceItem.value?.parent ? trendStore.menuMaintainOptions![0]!.children!.find(e => e.key == dataSourceItem.value?.parent).label + '-' + dataSourceItem.value?.label : dataSourceItem.value?.label,
          left: '48%'
        },
        // toolbox: {
        //   feature: {
        //     // dataZoom: {
        //     //   yAxisIndex: 'none'
        //     // },
        //     restore: {},
        //     saveAsImage: {}
        //   }
        // },
        // legend: {
        //   data: [`value(${unit})`]
        // },
        tooltip: {
          trigger: 'axis',
          formatter: function (params: any) {
            params = params[0];
            var date = new Date(params.name);
            return (
              date.toLocaleString() +
              ' : ' +
              params.value[1]
            );
          },
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: true
          }
        },
        yAxis: {
          type: 'value',
          max: function (value: any) {
            return value.max + 10
          },
          min: function (value: any) {
            return value.min - 10
          },
          // boundaryGap: ['10%', '10%'],
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value} ' + unit // Specify the unit here
          }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            start: 0,
            end: 100
          }
        ],
        series: {
          name: dataSourceItem.value?.label,
          type: 'line',
          showSymbol: false,
          data: (dataItem[dataSourceItem.value?.key || 'no'] || []).slice(-600),
          smooth: false,
        },
        grid: {
          right: '2%',
          left: '10%'
        }
      }

      // 绘制图表
      myChart.setOption(option);
    }
    const { realData, productLength } = storeToRefs(realtimeStore)

    watch(productLength, () => {
      if (!myChart) return
      if (count < 1) {
        count++
        return
      }
      count = 0
      let dataItem = realtimeStore.realData[`${dataSourceItem.value?.parent || dataSourceItem.value?.key}Data`] || {}
      myChart.setOption({
        title: {
          //@ts-ignore
          text: dataSourceItem.value?.parent ? trendStore.menuMaintainOptions![0]!.children!.find(e => e.key == dataSourceItem.value?.parent).label + '-' + dataSourceItem.value?.label : dataSourceItem.value?.label,
          left: '48%'
        },
        series: {
          name: dataSourceItem.value?.label,
          type: 'line',
          showSymbol: false,
          data: (dataItem[dataSourceItem.value?.key || 'no'] || []).slice(-600),
          smooth: false,
        },
      });
    })
    onMounted(() => {
      setTimeout(() => {
        initEchart()
      }, 0);
    })
    return () => {
      return (
        <div class={'h-1/3 shrink mt-2'} id={'trendChart' + props.i} >

        </div>
      )
    }
  }

})