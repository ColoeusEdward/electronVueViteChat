import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, NDropdown, NSpace } from "naive-ui";
import { computed, defineComponent, nextTick, reactive, Transition, watch } from "vue";
import { DistributionModel } from "~/me";
import { useCurcevInnerDataStore } from "./innerData";
import * as echarts from 'echarts';
import { nornameDisChartId } from "./enum";
import { sleep } from "@/utils/utils";


export default defineComponent({
  name: 'NormalDis', //正态分布曲线
  setup(props, ctx) {
    const innerData = useCurcevInnerDataStore()
    const commonData = reactive({
      disData:{} as DistributionModel
    })
    let myChart: echarts.ECharts

    const opt = computed(() => {
      return innerData.dataCfgList.map(e => {
        return {
          label: e.Name,
          key: e.GId
        }
      })
    })
 
    const getNorDis = () => {
      return callSpc(callFnName.getNormalDistribution, innerData.curDataCfgEntity?.GId).then((res: DistributionModel) => {
        console.log("🚀 ~ file: NormalDis.tsx:18 ~ getNorDis ~ res:", res)
        commonData.disData = res
        initChart()
      })
      // innerData.setIsGetting(false)
    }
    const back = () => {
      innerData.setNormalDisShow(false)
      // innerData.setIsGetting(true)
    }
    const initChart = () => {
      let xMin = commonData.disData.NdX[0]*0.99
      let xMax = commonData.disData.NdX[commonData.disData.NdX.length - 1]*1.01

      let ele = document.getElementById(nornameDisChartId)
      if (!ele) return
      myChart = echarts.init(ele, undefined, {
        useDirtyRect: true
      });
      let option = {
        animation:false,
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
          data: ['正态曲线', '频数',]
        },
        xAxis: [
          {
            type: 'value',
            // data: commonData.disData.GaussX,
            // axisPointer: {
            //   type: 'shadow'
            // },
            splitLine: {
              show: true
            },
            max: xMax,
            min: xMin,
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '正态曲线',
            // min: 0,
            // max: 250,
            // interval: 50,
            max: function (value: any) {
              return value.max.toFixed(3)
            },
            min: function (value: any) {
              return value.min.toFixed(3)
            },
            // axisLabel: {
            //   formatter: '{value} ml'
            // }
          }
          ,
          {
            type: 'value',
            name: '频数',
            // min: 0,
            // max: 25,
            // interval: 5,
            max: function (value: any) {
              return value.max.toFixed(3)
            },
            min: function (value: any) {
              return value.min.toFixed(3)
            },
            // axisLabel: {
            //   formatter: '{value} °C'
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
            name: '频数',
            type: 'bar',
            yAxisIndex: 1,
            // tooltip: {
            //   valueFormatter: function (value) {
            //     return value + ' ml';
            //   }
            // },
            data: commonData.disData.NdY.map( (e,i) => {
              return [commonData.disData.NdX[i],e]
            }),
            markLine: {
              symbol: 'none',
              lineStyle: {
                color: 'red',
                type: 'dashed'
              },
              label: {
                formatter: '上限: '+commonData.disData.Usl.toFixed(3),
                position: 'end'
              },
              data: [{
                xAxis: commonData.disData.Lsl, // set the y-axis value for the upper limit
                label: {
                  formatter: '下限: '+commonData.disData.Lsl.toFixed(3),
                  position: 'end'
                }
              }, {
                xAxis: commonData.disData.Std, // set the y-axis value for the upper limit
                label: {
                  formatter: '标准值: '+commonData.disData.Std.toFixed(3),
                  position: 'end'
                },
                lineStyle: {
                  color: 'green',
                  type: 'dashed'
                },
              },{
                xAxis: commonData.disData.Usl // set the y-axis value for the upper limit
              },]
            }

          },
          {
            name: '正态曲线',
            type: 'line',
            yAxisIndex: 0,
            // tooltip: {
            //   valueFormatter: function (value) {
            //     return value + ' °C';
            //   }
            // },
            data: commonData.disData.GaussY.map( (e,i) => {
              return [commonData.disData.GaussX[i],e]
            })
          }
        ]
      };
      myChart.setOption(option);
    }
    const loopRefresh = () => {
      if (innerData.normalDisShow) {
        getNorDis()
        sleep(10000).then(() => {
          loopRefresh()
        })
      }
    }
    
    watch(() => innerData.normalDisShow, (val) => {
      if (val) {
        nextTick(() => {
          // getNorDis()
          loopRefresh()
        })
        // sleep(50).then(() => {
        //   initChart()
        // })
      }
    })
    return () => {
      return (
        <div class={''}>
          {/* <NDropdown trigger="click" options={opt.value} onSelect={handleSelect}>
            
          </NDropdown> */}
          <NButton onClick={() => {innerData.setNormalDisShow(true)}} >正态分布</NButton>
          <Transition name={'full-pop'}>
            {
              innerData.normalDisShow && <div class={' absolute w-full h-full flex flex-col bg-white top-0 left-0 z-10'}>
                <div class={'px-2 pt-2'}>
                  <NSpace>
                    <NButton class={'my-large-btn'} size={'large'} onClick={back} >返回</NButton>
                  </NSpace>
                </div>
                <div class={'flex-shrink w-full h-full'} id={nornameDisChartId}>
                  
                </div>
              </div>
            }

          </Transition>

        </div>
      )
    }
  }

})