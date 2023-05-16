import { } from "naive-ui";
import { defineComponent, reactive, ref, computed, onMounted, watch, PropType, nextTick } from "vue";

import { useRealTimeStore } from "@/store/realtime";
import * as echarts from 'echarts';
import { useTrendStore } from "@/store/trendStore";
import { storeToRefs } from "pinia";
import { sleep, unique } from "@/utils/utils";
import { useStatisticalStore } from "@/store/statistical";
import { useElementSize } from '@vueuse/core'
import { Parachute } from "@vicons/tabler";

export default defineComponent({
  name: 'StatisticalChartBlock',
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
    },
    listNum: {
      type: Number,
    }
  },
  setup(props, ctx) {
    let count = 0                     //记录realdata数据的更新次数
    const realtimeStore = useRealTimeStore()
    const trendStore = useTrendStore()
    const staticalStore = useStatisticalStore()
    const conRef = ref<HTMLElement | null>(null)
    let myChart: echarts.ECharts
    let unit = `次`
    const dataSourceItem = computed(() => {
      return props.dataSourceItem
    })
    let dataItem = realtimeStore.realData[`${dataSourceItem.value?.parent}Data`] || {}
    const { height, width } = useElementSize(conRef)
    const conHW = computed(() => {
      return height.value + 'px ' + width.value + 'px'
    })
    let originDataList:number[] = []

    const buildBarData = (dataItem: any) => {
      let list = (dataItem[dataSourceItem.value?.key || 'no'] || []).slice(-3600).map((e: any) => e.value[1]).sort((a: any, b: any) => {
        return a-b
      })
      originDataList = list
      let xlist = unique(list)
      let obj: Record<number, number> = {}
      list.forEach((e: number, i: number) => {
        obj[e] ? obj[e]++ : obj[e] = 1
      })

      let res = xlist.map((e: number) => {
        return [e, obj[e]]
      })
      return res
    }

    const buildLineData = (bardata: ReturnType<typeof buildBarData>) => {  //正态分布曲线
      let xlist = bardata.map(e=>e[0])
      let total = 0
    
      originDataList.forEach((e: any) => {
        total += e
      })
      let mean = total / originDataList.length  //平均值

      let variance = 0    //方差
      originDataList.forEach((e: any) => {
        variance += (e - mean) * (e - mean)
      })
      variance /= originDataList.length;
      let stdDev = Math.sqrt(variance);   //标准差

      return xlist.map((e,i) => {
        let y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * (Math.exp(-(e - mean) * (e - mean) / (2 * stdDev * stdDev)));
        
        return [e, Number((y*100))]
      })
    }

    const initEchart = () => {
      let bardata = buildBarData(dataItem)

      let ele = document.getElementById('statisticalChart' + props.i)
      if (!ele) return
      myChart = echarts.init(ele, undefined, {
        useDirtyRect: true
      });

      let option = {
        title: {
          //@ts-ignore
          text: dataSourceItem.value?.parent ? trendStore.menuMaintainOptions![0]!.children!.find(e => e.key == dataSourceItem.value?.parent).label + '-' + dataSourceItem.value?.label : dataSourceItem.value?.label,
          left: '40%'
        },
        color: ['#5470c6', '#91cc75',].reverse(),
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
            let percent = params[0]
            params = params[1];
            return (
              params.value[0] +
              ' : ' +
              params.value[1] + '次' + `(${percent.value[1]}%)`
            );
          },
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          type: 'value',
          splitLine: {
            show: true
          },
          max: function (value: any) {
            return value.max + 50
          },
          min: function (value: any) {
            return value.min - 50
          },
        },
        yAxis: [{
          type: 'value',
          name: '概率',
          // max: function (value: any) {
          //   return value.max + 1
          // },
          // min: function (value: any) {
          //   return value.min
          // },
          boundaryGap: ['5%', '5%'],
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value} ' + '%'// Specify the unit here
          }
        }, {
          type: 'value',
          name: '次数',
          // max: function (value: any) {
          //   return value.max + 1
          // },
          // min: function (value: any) {
          //   return value.min
          // },
          boundaryGap: ['5%', '5%'],
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value} ' + unit // Specify the unit here
          }
        },],
        // dataZoom: [
        //   {
        //     type: 'inside',
        //     start: 0,
        //     end: 100
        //   },
        //   {
        //     start: 0,
        //     end: 100
        //   }
        // ],
        series: [{
          name: 'percent',
          type: 'line',
          showSymbol: false,
          data: buildLineData(bardata),
          smooth: true,
        }, {
          name: 'count',
          type: 'bar',
          yAxisIndex: 1,
          showSymbol: false,
          data: bardata,
          smooth: false,
          barWidth: 6,
          markLine: {
            symbol: 'none',
            lineStyle: {
              color: 'red',
              type: 'dashed'
            },
            label: {
              formatter: '上限',
              position: 'end'
            },
            data: [{
              xAxis: 100, // set the y-axis value for the upper limit
              label: {
                formatter: '下限',
                position: 'end'
              }
            }, {
              xAxis: 900 // set the y-axis value for the upper limit
            },]
          }
        }],
        grid: {
          right: '10%',
          left: '10%'
        }
      }

      // 绘制图表
      myChart.setOption(option);
    }
    const { realData, productLength } = storeToRefs(realtimeStore)
    const listNum = computed(() => {
      return props.listNum
    })
    watch(productLength, () => {
      if (!myChart || !staticalStore.isOnline) return
      if (count < 4) {
        count++
        return
      }
      count = 0
      let dataItem = realtimeStore.realData[`${dataSourceItem.value?.parent || dataSourceItem.value?.key}Data`] || {}
      let bardata = buildBarData(dataItem)

      myChart.setOption({
        title: {
          //@ts-ignore
          text: dataSourceItem.value?.parent ? trendStore.menuMaintainOptions![0]!.children!.find(e => e.key == dataSourceItem.value?.parent).label + '-' + dataSourceItem.value?.label : dataSourceItem.value?.label,
          left: '40%'
        },
        series: [
          {
            name: 'percent',
            type: 'line',
            showSymbol: false,
            data: buildLineData(bardata),
            smooth: true,
          }
          , {
            name: 'count',
            yAxisIndex: 1,
            type: 'bar',
            showSymbol: false,
            data: bardata,
            smooth: false,
          }],
      });
    })
    watch(conHW, () => {
      myChart && myChart.resize()
    })
    onMounted(() => {
      setTimeout(() => {
        initEchart()
      }, 0);
    })
    return () => {
      return (
        <div class={'h-full  mb-1 mr-1 shrink ' + (listNum.value == 1 ? '  w-full' : ' basis-52')} style={{ minWidth: `calc(50% - 4px)`, minHeight: `calc(50% - 4px)`, ...(listNum.value! > 2 ? { width: `calc(50% - 4px)` } : {}) }} >
          <div ref={(e) => { conRef.value = e as HTMLElement }} class={'w-full h-full'} id={'statisticalChart' + props.i} >

          </div>
        </div>
      )
    }
  }

})