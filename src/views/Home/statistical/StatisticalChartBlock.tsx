import { } from "naive-ui";
import { defineComponent, reactive, ref, computed, onMounted, watch, PropType, nextTick, onBeforeUnmount } from "vue";

import { useRealTimeStore } from "@/store/realtime";
import * as echarts from 'echarts';
import { useTrendStore } from "@/store/trendStore";
import { storeToRefs } from "pinia";
import { sleep, unique } from "@/utils/utils";
import { useStatisticalStore } from "@/store/statistical";
import { MaybeComputedElementRef, MaybeElement, useElementSize } from '@vueuse/core'
import { Parachute } from "@vicons/tabler";
import classNames from 'classnames';
import SpcDataBlock from "./SpcDataBlock";
import { DataGroupEntity, DistributionEntity, ModbusAdressRow } from "~/me";
import { useConfigStore } from "@/store/config";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";

export default defineComponent({
  name: 'StatisticalChartBlock',
  props: {
    dataSourceItem: {
      type: Object as PropType<DataGroupEntity>,
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
    const configStore = useConfigStore()
    const paramItem = computed(() => {
      return configStore.curEnableFormulaParamList?.find(e => e.DataGroupId == props.dataSourceItem?.GId)
    })
    const conRef = ref<HTMLElement | null>(null)
    let myChart: echarts.ECharts
    let unit = `次`
    const alldata = reactive({
      timeIns: null as ReturnType<typeof setInterval> | null,
      curDisItem: null as DistributionEntity | null
    })
    const dataSourceItem = computed(() => {
      return props.dataSourceItem
    })
    const { height, width } = useElementSize(conRef as any)
    const conHW = computed(() => {
      return height.value + 'px ' + width.value + 'px'
    })
    let originDataList: number[] = []

    // const buildBarData = (dataItem: any) => {
    //   let list = (dataItem[dataSourceItem.value?.key || 'no'] || []).slice(-3600).map((e: any) => e.value[1]).sort((a: any, b: any) => {
    //     return a - b
    //   })
    //   originDataList = list
    //   let xlist = unique(list)
    //   let obj: Record<number, number> = {}
    //   list.forEach((e: number, i: number) => {
    //     obj[e] ? obj[e]++ : obj[e] = 1
    //   })

    //   let res = xlist.map((e: number) => {
    //     return [e, obj[e]]
    //   })
    //   return res
    // }

    const buildLineData = () => {  //正态分布曲线
      // let xlist = bardata.map(e => e[0])
      // let total = 0

      // originDataList.forEach((e: any) => {
      //   total += e
      // })
      // let mean = total / originDataList.length  //平均值
      //echart折线图 根据上下公差绘制一片较暗的阴影区域

      // let variance = 0    //方差
      // originDataList.forEach((e: any) => {
      //   variance += (e - mean) * (e - mean)
      // })
      // variance /= originDataList.length;
      // let stdDev = Math.sqrt(variance);   //标准差

      // return xlist.map((e, i) => {
      //   let y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * (Math.exp(-(e - mean) * (e - mean) / (2 * stdDev * stdDev)));

      //   return [e, Number((y * 100))]
      // })
    }

    const initEchart = () => {
      // let bardata = buildBarData(dataItem)

      let ele = document.getElementById('statisticalChart' + props.i)
      if (!ele) return
      myChart = echarts.init(ele, undefined, {
        useDirtyRect: true
      });
      let lowValue = paramItem.value?.Standard! - paramItem.value?.LowerTol!
      let upValue = paramItem.value?.Standard! + paramItem.value?.UpperTol!
      let option = {
        title: {
          //@ts-ignore
          text: dataSourceItem.value?.DataName,
          left: 'center',
          // left: '40%'
        },
        color: ['#5470c6', '#91cc75',],
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
          // formatter: function (params: any) {
          //   let percent = params[0]
          //   params = params[1];
          //   return (
          //     params.value[0] +
          //     ' : ' +
          //     params.value[1] + '次' + `(${percent.value[1]}%)`
          //   );
          // },
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
            return value.max
          },
          min: function (value: any) {
            return value.min
          },
        },
        yAxis: [{
          type: 'value',
          name: '概率',
          // max: function (value: any) {
          //   return value.max + 1
          // },
          min: function (value: any) {
            return 0
          },
          boundaryGap: ['5%', '5%'],
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value} ' + ''// Specify the unit here
          }
        },
        {
          type: 'value',
          name: '计数',
          // max: function (value: any) {
          //   return value.max + 1
          // },
          // min: function (value: any) {
          //   return value.min
          // },
          min: function (value: any) {
            return 0
          },
          boundaryGap: ['5%', '5%'],
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value} ' + unit // Specify the unit here
          }
        },
        ],
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
          name: 'gass',
          type: 'line',
          showSymbol: false,
          data: [0, 0],
          smooth: true,
          markLine: {
            symbol: ['none', 'none'], // 去掉箭头
            label: { show: true, position: 'end' }, // 标签显示位置
            lineStyle: {
              type: 'dashed', // 虚线
              color: 'red',   // 红色
              width: 2
            },
            data: [
              {
                name: '下限',
                xAxis: lowValue, // 对应 xAxis 数据里的值（如果是数值轴则直接写数字）
                // label: { formatter: '下限' + ` (${lowValue})` }
                label: { formatter: '下限' }
              },
              {
                name: '标准值',
                xAxis: paramItem.value?.Standard, // 对应 xAxis 数据里的值（如果是数值轴则直接写数字）
                // label: { formatter: '标准值' + ` (${paramItem.value?.Standard})` },
                label: { formatter: '标准值' },
                lineStyle: { color: 'green' },
              },
              {
                name: '上限',
                xAxis: upValue, // 对应 xAxis 数据里的值
                label: { formatter: '上限' }
                // label: { formatter: '上限' + ` (${upValue})` }
              }
            ]
          }
        }, {
          name: 'Distribution',
          type: 'bar',
          showSymbol: false,
          data: [0, 0],
          smooth: true,
        },],
        // {
        //   name: 'count',
        //   type: 'bar',
        //   yAxisIndex: 1,
        //   showSymbol: false,
        //   data: bardata,
        //   smooth: false,
        //   barWidth: 6,
        //   markLine: {
        //     symbol: 'none',
        //     lineStyle: {
        //       color: 'red',
        //       type: 'dashed'
        //     },
        //     label: {
        //       formatter: '上限',
        //       position: 'end'
        //     },
        //     data: [{
        //       xAxis: 100, // set the y-axis value for the upper limit
        //       label: {
        //         formatter: '下限',
        //         position: 'end'
        //       }
        //     }, {
        //       xAxis: 900 // set the y-axis value for the upper limit
        //     },]
        //   }
        // }],
        grid: {
          right: '10%',
          left: '10%',
          bottom: "24px",
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
      // let bardata = buildBarData(dataItem)


    })
    const setChartData = (item: DistributionEntity) => {
      myChart.setOption({
        title: {
          //@ts-ignore
          text: dataSourceItem.value?.DataName,
          // left: '40%'
        },
        series: [
          {
            name: 'gass',
            type: 'line',
            showSymbol: false,
            data: item.GaussX ? item.GaussX.map((e, i) => [e, item.GaussY[i]]) : [],
            smooth: true,
          },
          {
            name: 'Distribution',
            type: 'bar',
            showSymbol: false,
            data: item.X ? item.X.map((e, i) => [e, item.Y[i]]) : [],
            smooth: true,
          },

          // , {
          //   name: 'count',
          //   yAxisIndex: 1,
          //   type: 'bar',
          //   showSymbol: false,
          //   data: bardata,
          //   smooth: false,
          // }
        ],
      });
    }
    const getDisData = () => {
      callBrige(callFnName.GetDistributionData, dataSourceItem.value?.GId).then((res: DistributionEntity) => {
        console.log("🪵 [StatisticalChartBlock.tsx:276] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        if (!res) return
        setChartData(res)
        alldata.curDisItem = res
      })
    }
    watch(conHW, () => {
      myChart && myChart.resize()
    })
    onMounted(() => {
      // setTimeout(() => {

      // }, 0);
      initEchart()

      getDisData()
      alldata.timeIns = setInterval(() => {
        getDisData()
      }, configStore.sysConfig.CpkInterval || 500)

    })

    onBeforeUnmount(() => {
      alldata.timeIns && clearInterval(alldata.timeIns)
    })
    return () => {
      // const btmBlock = staticalStore.isShowData ?  : ""

      return (
        <div class={'h-full  mb-1 mr-1 shrink ' + (listNum.value == 1 ? '  w-full' : ' basis-52')} style={{ minWidth: `calc(50% - 4px)`, minHeight: `calc(50% - 4px)`, ...(listNum.value! > 2 ? { width: `calc(50% - 4px)` } : {}) }} >
          <div class={'w-full h-full'}>
            <div ref={(e) => { conRef.value = e as HTMLElement }} class={'w-full ' + classNames({
              'h-3/5': staticalStore.isShowData,
              'h-full': !staticalStore.isShowData
            })} id={'statisticalChart' + props.i} >
            </div>
            {/* {btmBlock} */}
            {alldata.curDisItem && <SpcDataBlock dataItem={alldata.curDisItem} adressItem={dataSourceItem.value} />}
          </div>

        </div>
      )
    }
  }

})