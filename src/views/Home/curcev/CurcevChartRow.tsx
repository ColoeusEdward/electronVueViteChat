import { } from "naive-ui";
import { defineComponent, reactive, ref, computed, onMounted, watch, PropType, nextTick } from "vue";

import { useRealTimeStore } from "@/store/realtime";
import * as echarts from 'echarts';
import { useTrendStore } from "@/store/trendStore";
import { storeToRefs } from "pinia";
import { getRandomInt, sleep } from "@/utils/utils";
import { useCurcevInnerDataStore } from "./innerData";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { CollectPointModel, DataConfigEntity, DataValue, ModbusAdressRow } from "~/me";
import CpkBlock from "./CpkBlock";
import { useConfigStore } from "@/store/config";
import { callBrige } from "@/utils/callm";
import SymAuto from '@/assets/SymAuto.png'
import SymBigger from '@/assets/SymBigger.png'
import SymSmaller from '@/assets/SymSmaller.png'
import SymUp from '@/assets/SymUp.png'
import SymDown from '@/assets/SymDown.png'

let now = Date.now()
let fakeDataList = new Array(50).fill(0).map((e, i) => {
  //js 获取特定范围内的随机整数
  let val = getRandomInt(90, 110)
  return [now + i, val]
})
export type CurcevChartRowIns = {
  getChartIns: Function,
}
export default defineComponent({
  name: 'CurcevChartRow',
  props: {
    chartId: String,
    adressRow: Object as PropType<ModbusAdressRow>,
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
    height: String,
  },
  setup(props, ctx) {
    let count = 0                     //记录realdata数据的更新次数
    const innerData = useCurcevInnerDataStore()
    const configStore = useConfigStore()
    // const configStore = useConfigStore()
    let thisReMountedCount = innerData.reMountedCount
    // console.log("🚀 ~ file: CurcevChartRow.tsx:36 ~ setup ~ thisReMountedCount:", thisReMountedCount)
    let myChart: echarts.ECharts
    let unit = `mm`
    const alldata = reactive({
      widthPixel: 800,
      isAuto: true,
      upMove: 0, //上移动中线
      // downMove: 0,
      scalUpMove: 0,  //放大上下限
      // scalDownMove: 0 //缩小上下限
      curParSaclStep: 0.1,
    })
    const dataSourceItem = computed(() => {
      return props.dataSourceItem
    })
    const paraItem = computed(() => {
      let item = configStore.curEnableFormulaParamList?.find(e => e.DataId == props.adressRow?.GId)
      alldata.curParSaclStep = item?.Standard ? item.Standard * 0.01 : 0.1
      return item
    })
    const initEchart = () => {
      let ele = document.getElementById((props.chartId || 'trendChart') + props.i)
      if (!ele) return
      myChart = echarts.init(ele, undefined, {
        useDirtyRect: true
      });
      // console.log("🪵 [CurcevChartRow.tsx:66] ~ token ~ \x1b[0;32mprops.dataConfig\x1b[0m = ", props.dataConfig);
      const para = paraItem.value
      console.log("🪵 [CurcevChartRow.tsx:173] ~ token ~ \x1b[0;32mpara\x1b[0m = ", para);
      let option = {
        animation: false,
        title: {
          //@ts-ignore
          // text: '',
          text: props.adressRow?.DataName,
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
              // params.value[0].toLocaleString() +
              '  ' +
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
            return (value.max + (para?.UpperTol || 0.1) + alldata.scalUpMove + alldata.upMove).toFixed(3)
            // if(para){
            //   return para?.Standard + para?.UpperTol
            // }else{
            //   return value.max.toFixed(3)
            // }
          },
          min: function (value: any) {
            let min = value.min
            if (value.min == 0 && para) {
              min = para?.Standard - para?.LowerTol
            }
            // let val = (value.min - (para?.LowerTol || 0.1) - alldata.scalUpMove).toFixed(3)

            return (min - (para?.LowerTol || 0.1) - alldata.scalUpMove + alldata.upMove).toFixed(3)
            // if(para){
            //   return para?.Standard + para?.UpperTol
            // }else{
            //   return value.max.toFixed(3)
            // }
          },
          // boundaryGap: ['10%', '10%'],
          splitLine: {
            show: true
          },
          axisLabel: {
            formatter: '{value} ' + props.adressRow?.Unit // Specify the unit here
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
          // data: fakeDataList,
          data: [],
          smooth: false,
        },
        grid: {
          right: '14px',
          left: '7%',
          top: '30px'
        }
      }

      // 绘制图表
      myChart.setOption(option);
    }
    const getWidthPixel = () => {
      let width = document.querySelector('.my-index-chart')?.clientWidth || 800
      alldata.widthPixel = width
    }

    const loopGet = () => {
      if (!myChart || !innerData.isGetting || !props.adressRow || thisReMountedCount != innerData.reMountedCount) return
      // callSpc(callFnName.getSpanCollectPoints, [props.dataConfig.GId, new Date(innerData.startTime)], true).then((res: CollectPointModel[]) => {


      // console.log("🪵 [CurcevChartRow.tsx:161] ~ token ~ \x1b[0;32malldata.widthPixel\x1b[0m = ", alldata.widthPixel);
      // new Promise<CollectPointModel[]>((resolve, reject) => { resolve([]) })
      callBrige(callFnName.GetChartData, [props.adressRow.GId, alldata.widthPixel], true).then((res: DataValue[]) => {
        // console.log("🚀 ~ file: CurcevChartRow.tsx:135 ~ callSpc ~ res:", res)
        // let maxCount = configStore.sysConfig.maxDataCount.Value
        // maxCount && (res = res.slice(-maxCount))
        // if (props.i == 0) {
        //   let length = res.length
        //   innerData.setCurDataLength(length)
        //   res[length - 1] && innerData.setCurNewVal(res[length - 1].Value)
        // }
        // filter((e,i) => i % 2 == 0)
        let paramItem = configStore.curEnableFormulaParamList?.find(e => e.DataId == props.adressRow?.GId)
        let upValue: number = paramItem?.UpperTol || 0.1
        let downValue: number = paramItem?.LowerTol || 0.1
        if (paramItem) {
          upValue = paramItem.Standard + paramItem.UpperTol
          downValue = paramItem.Standard - paramItem.LowerTol
        }

        let list = res.map(e => {
          let time = new Date(e.Intime).getTime()
          return [time, e.Value * 1]
        })
        console.log("🚀 ~ list ~ list:", list.length)
        let opt = {
          title: {
            //@ts-ignore
            text: props.adressRow?.DataName,
            left: '48%'
          },
          progressiveThreshold: innerData.samplingNum,
          progressive: 200,
          progressiveChunkMode: "sequential",
          animation: false,
          series: {
            name: props.adressRow?.DataName,
            type: 'line',
            showSymbol: false,
            symbol: 'none',
            data: list,
            smooth: false,
            large: true,
            // 当数据量超过 1000 时，进入大数据模式
            largeThreshold: innerData.samplingNum,
            sampling: 'lttb',
            markArea: {
              silent: true, // 图形是否不响应鼠标事件，建议开启以防干扰点击折线
              itemStyle: {
                color: 'rgba(0, 0, 0, 0.1)', // 设置阴影颜色和透明度 (这里是淡红色)
              },
              data: [
                [
                  {
                    // name: '公差范围', // 阴影区域的名字
                    yAxis: downValue    // 下公差的具体数值
                  },
                  {
                    yAxis: upValue     // 上公差的具体数值
                  }
                ]
              ]
            }
            // ...((res.length > innerData.samplingNum) ? { sampling: 'lttb' } : {})
          },
        }
        myChart.setOption(opt);
        // let time = innerData.sysConfig.find(e => e.Name == 'RefreshInterval')?.Value
        let time = configStore.sysConfig.RefreshInterval
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
    const setOption = (opts: any) => {
      let opt = {

      }
      myChart.setOption(opt);

    }
    const resetSysValue = () => {
      alldata.scalUpMove = 0
      alldata.upMove = 0
    }
    const autoClick = () => {
      alldata.isAuto = true
      resetSysValue()
      myChart.setOption({});
    }
    const sysBiggerClick = () => {
      alldata.isAuto = false
      alldata.scalUpMove -= alldata.curParSaclStep
      myChart.setOption({});

    }
    const sysSmallerClick = () => {
      alldata.isAuto = false
      alldata.scalUpMove += alldata.curParSaclStep
      myChart.setOption({});

    }
    const sysUpClick = () => {
      alldata.isAuto = false
      alldata.upMove += alldata.curParSaclStep
      myChart.setOption({});
    }
    const sysDownClick = () => {
      alldata.isAuto = false
      alldata.upMove -= alldata.curParSaclStep
      myChart.setOption({});

    }

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
        getWidthPixel()
        if (innerData.isGetting) {
          loopGet()
        }
      }, 0);
    })
    return () => {
      return (
        <div class={'h-full shrink mt-2 overflow-visible relative my-index-chart flex'} style={{ ...(props.height ? { height: props.height } : {}) }} >
          {/* <CpkBlock dataConfig={props.dataConfig} /> */}
          <div class={' h-full w-full  '} style={{ width: `calc(100% - 100px)` }} id={(props.chartId || 'trendChart') + props.i} >
          </div>
          <div class={'w-[100px]  h-full  '}>
            <div class={'w-full h-full flex'}>
              <div class={'flex-1 w-full h-full flex flex-col justify-center items-center'}>
                <div class={' h-[50px] w-[50px] mb-3'} title={'自动'} onClick={autoClick} style={{ backgroundImage: `url(${SymAuto})`, backgroundSize: '120% 120%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} >

                </div>
                <div class={' h-[50px] w-[50px] mb-3'} title={'放大曲线'} onClick={sysBiggerClick} style={{ backgroundImage: `url(${SymBigger})`, backgroundSize: '120% 120%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} >

                </div>
                <div class={' h-[50px] w-[50px] mb-3'} title={'缩小曲线'} onClick={sysSmallerClick} style={{ backgroundImage: `url(${SymSmaller})`, backgroundSize: '120% 120%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} >

                </div>
              </div>
              <div class={'flex-1 w-full h-full'}>
                <div class={'flex-1 w-full h-full flex flex-col justify-center items-center'}>
                  <div class={' h-[50px] w-[50px] mb-3'} style={{}} >

                  </div>
                  <div class={' h-[50px] w-[50px] mb-3'} title={'上移'} onClick={sysUpClick} style={{ backgroundImage: `url(${SymUp})`, backgroundSize: '150% 150%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} >

                  </div>
                  <div class={' h-[50px] w-[50px] mb-3'} title={'下移'} onClick={sysDownClick} style={{ backgroundImage: `url(${SymDown})`, backgroundSize: '150% 150%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} >

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )
    }
  }

})