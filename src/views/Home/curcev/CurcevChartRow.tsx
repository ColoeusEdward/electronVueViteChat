import { } from "naive-ui";
import { defineComponent, reactive, ref, computed, onMounted, watch, PropType, nextTick } from "vue";

import { useRealTimeStore } from "@/store/realtime";
import * as echarts from 'echarts';
import { useTrendStore } from "@/store/trendStore";
import { storeToRefs } from "pinia";
import { sleep } from "@/utils/utils";
import { useCurcevInnerDataStore } from "./innerData";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { CollectPointModel, DataConfigEntity } from "~/me";
import CpkBlock from "./CpkBlock";
import { useConfigStore } from "@/store/config";

export type CurcevChartRowIns = {
  getChartIns: Function,
}
export default defineComponent({
  name: 'CurcevChartRow',
  props: {
    chartId:String,
    dataConfig: Object as PropType<DataConfigEntity>,
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
    height:String,
  },
  setup(props, ctx) {
    let count = 0                     //记录realdata数据的更新次数
    const innerData = useCurcevInnerDataStore()
    // const configStore = useConfigStore()
    let thisReMountedCount = innerData.reMountedCount
    // console.log("🚀 ~ file: CurcevChartRow.tsx:36 ~ setup ~ thisReMountedCount:", thisReMountedCount)
    let myChart: echarts.ECharts
    let unit = `mm`
    const dataSourceItem = computed(() => {
      return props.dataSourceItem
    })
    const initEchart = () => {
      let ele = document.getElementById((props.chartId||'trendChart') + props.i)
      if (!ele) return
      myChart = echarts.init(ele, undefined, {
        useDirtyRect: true
      });

      let option = {
        animation:false,
        title: {
          //@ts-ignore
          text: '',
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
            return (
              params.value[0].toLocaleString() +
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
            return value.max.toFixed(3)
          },
          min: function (value: any) {
            return value.min.toFixed(3)
          },
          // boundaryGap: ['10%', '10%'],
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value} ' + props.dataConfig?.Unit // Specify the unit here
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
          data: [],
          smooth: false,
        },
        grid: {
          right: '2%',
          left: '7%',
          top: '30px'
        }
      }

      // 绘制图表
      myChart.setOption(option);
    }

    const loopGet = () => {
      if (!myChart || !innerData.isGetting || !props.dataConfig || thisReMountedCount != innerData.reMountedCount) return
      // callSpc(callFnName.getSpanCollectPoints, [props.dataConfig.GId, new Date(innerData.startTime)], true).then((res: CollectPointModel[]) => {
      callSpc(callFnName.getFullCollectPoints, props.dataConfig.GId).then((res: CollectPointModel[]) => {
        // console.log("🚀 ~ file: CurcevChartRow.tsx:135 ~ callSpc ~ res:", res)
        let maxCount = innerData.sysConfig.find(e=>e.Name=='MaxPonitNum')?.Value
        maxCount && (res = res.slice(-maxCount))
        if (props.i == 0) {
          let length = res.length
          innerData.setCurDataLength(length)
          res[length-1] && innerData.setCurNewVal(res[length-1].Value)
        }
        let list = res.map(e => {
          return [e.Intime, e.Value]
        })
        // console.log("🚀 ~ list ~ list:", list.length)
        let opt = {
          title: {
            //@ts-ignore
            text: props.dataConfig?.Name,
            left: '48%'
          },
          series: {
            name: props.dataConfig?.Name,
            type: 'line',
            showSymbol: false,
            data: list,
            smooth: false,
            ...((res.length > innerData.samplingNum) ? { sampling: 'lttb' } : {})
          },
        }
        myChart.setOption(opt);
        let time = innerData.sysConfig.find(e=>e.Name=='RefreshInterval')?.Value
        return sleep(time ? Number(time) : 1000)
      }).then(() => {
        loopGet()
      })
    }
    const getChartIns = () => {
      return myChart
    }
    watch(() => innerData.isGetting, (val) => {
      if (val) {
        loopGet()
      }
    })

    ctx.expose({
      getChartIns,
    } as CurcevChartRowIns)
    // watch(productLength, () => {
    //   if (!myChart || !innerData.isGetting) return
    //   if (count < 1) {
    //     count++
    //     return
    //   }
    //   count = 0
    //   let dataItem = realtimeStore.realData[`${dataSourceItem.value?.parent || dataSourceItem.value?.key}Data`] || {}
    //   myChart.setOption({
    //     title: {
    //       //@ts-ignore
    //       text: dataSourceItem.value?.parent ? trendStore.menuMaintainOptions![0]!.children!.find(e => e.key == dataSourceItem.value?.parent).label + '-' + dataSourceItem.value?.label : dataSourceItem.value?.label,
    //       left: '48%'
    //     },
    //     series: {
    //       name: dataSourceItem.value?.label,
    //       type: 'line',
    //       showSymbol: false,
    //       data: (dataItem[dataSourceItem.value?.key || 'no'] || []).slice(-600),
    //       smooth: false,
    //     },
    //   });
    // })
    onMounted(() => {
      setTimeout(() => {
        initEchart()
        if(innerData.isGetting){
          loopGet()
        }
      }, 0);
    })
    return () => {
      return (
        <div class={'h-1/3 shrink mt-2 overflow-hidden relative'} style={{...(props.height?{height: props.height}:{})}} >
          {/* <CpkBlock dataConfig={props.dataConfig} /> */}
          <div class={' h-full w-full '} id={(props.chartId||'trendChart') + props.i} >
          </div>
        </div>
      )
    }
  }

})