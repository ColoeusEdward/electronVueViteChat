import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { loopGet, sleep } from "@/utils/utils";
import { NButton, NSpace } from "naive-ui";
import { computed, defineComponent, nextTick, onMounted, reactive, Transition, watch } from "vue";
import { FFTModel } from "~/me";
import { fftChartId } from "./enum";
import { useCurcevInnerDataStore } from "./innerData";
import * as echarts from 'echarts';
import { DataTypeEnum } from "../config/dataCofigNew/enum";

export default defineComponent({
  name: '',
  setup(props, ctx) {
    const commonData = reactive({
      oriData: {} as FFTModel,
      // data: [] as { x: number, y: number }[],
      data: {} as FFTModel,
      xList: [] as number[],
      // yList: [] as {value:number,label:{show:boolean}}[],
      yList: [] as number[],
      maxList: [{ name: '周最低', value: `-2`, xAxis: 1, yAxis: -1.5 }],
      isMounted: false,
      isInit: false
    })
    let myChart: echarts.ECharts
    const innerData = useCurcevInnerDataStore()
    const back = () => {
      innerData.setFftShow(false)
    }
    const loopGetRef = computed(() => {
      if (!innerData.isGetting) {
        window.$message.warning('请先开始采集数据再查看')
      }
      return innerData.isGetting && innerData.fftShow
    })
    const getFFT = () => {
      return callSpc(callFnName.getFFT, innerData.curDataCfgEntity?.GId).then((res: FFTModel) => {
        console.log("🚀 ~ callSpc ~ res:", res)
        // commonData.oriData = res
        // let list = res.Ffrequencys.map((e, i) => {
        //   return {
        //     x: e,
        //     y: res.Fcounts[i]
        //   }
        // }).filter(e => e.y > 1)
        commonData.data = res
        commonData.xList = res.Ffrequencys
        commonData.yList = res.Fcounts
        let tempList = res.Ffrequencys.map((e, i) => {
          return {
            x: e,
            y: res.Fcounts[i]
          }
        })
        commonData.maxList = tempList.filter(e => e.y > 1).map(e => {
          return {
            name: '计数',
            value: `频率:${e.x}\n幅度:${Number(e.y.toFixed(3))}`,
            xAxis: e.x,
            yAxis: e.y
          }
        })

        if (!commonData.isInit) {
          initChart()
          return
        }
        if (commonData.isInit) {
          updateChart()
        }
      })
    }
    const updateChart = () => {
      myChart.setOption({
        xAxis: [{ data: commonData.xList }],
        series: [{ data: commonData.yList }]
      })
    }
    const initChart = () => {
      let ele = document.getElementById(fftChartId)
      console.log("🚀 ~ initChart ~ ele:", ele)
      if (!ele) return
      myChart = echarts.init(ele, undefined, {
        // useDirtyRect: true
      });
      let option = {
        animation: false,
        grid: {
          containLabel: true,
          top: '10%',
          left: '0%',
          right: '2%'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            animation: false,
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: ['高频数据(FFT)']
        },
        xAxis: [
          {
            type: 'category',
            data: commonData.xList,
            // axisPointer: {
            //   type: 'shadow'
            // },
            splitLine: {
              show: true
            },

          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '幅度',
            // min: 0,
            // max: 250,
            // interval: 50,
            max: function (value: any) {
              return value.max * 1.01
            },
            // min: function (value: any) {
            //   return value.min.toFixed(3)
            // },
            // axisLabel: {
            //   formatter: '{value} ml'
            // }
          }
        ],
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
        series: [
          {
            name: '高频数据(FFT)',
            type: 'line',
            label: {
              fontSize: 16
            },
            markPoint: {
              symbol: 'pin',
              symbolSize: [120, 80],
              data: commonData.maxList,
              label: {
                // color:'#fff',
                lineHeight: 14
              }
            },
            // yAxisIndex: 0,
            // smooth: true,
            // tooltip: {
            //   valueFormatter: function (value) {
            //     return value + ' °C';
            //   }
            // },
            data: commonData.yList,
          }
        ]
      };
      myChart.setOption(option);
      commonData.isInit = true
    }
    watch(() => innerData.curDataCfgEntity?.DataType, (val) => {
      if (val == DataTypeEnum.FFT) {
        loopGet(getFFT, 5000, loopGetRef)
      } else {
        commonData.isInit = false
      }
    },{immediate:true})
    onMounted(() => {

    })

    return () => {
      return (
        <div class={'w-full h-full flex flex-col '}>
          {/* <div class={'px-2 pt-2'}>
            <NSpace>
              <NButton class={'my-large-btn'} size={'large'} onClick={back} >返回</NButton>
            </NSpace>
          </div> */}
          <div class={'flex-shrink w-full h-full'} id={fftChartId}>

          </div>
        </div>
        // <div class={''}>
        //   {/* <NDropdown trigger="click" options={opt.value} onSelect={handleSelect}>

        //   </NDropdown> */}
        //   <NButton onClick={() => { innerData.setFftShow(true) }} >高频数据</NButton>
        //   <Transition name={'full-pop'}>
        //     {
        //       innerData.fftShow && <div class={' absolute w-full h-full flex flex-col bg-white top-0 left-0 z-10'}>
        //         <div class={'px-2 pt-2'}>
        //           <NSpace>
        //             <NButton class={'my-large-btn'} size={'large'} onClick={back} >返回</NButton>
        //           </NSpace>
        //         </div>
        //         <div class={'flex-shrink w-full h-full'} id={fftChartId}>

        //         </div>
        //       </div>
        //     }

        //   </Transition>

        // </div>
      )
    }
  }

})