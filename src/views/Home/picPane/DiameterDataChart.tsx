import { } from "naive-ui";
import { computed, defineComponent, onMounted, onUnmounted, watch } from "vue";
import * as echarts from 'echarts';
import { useRealTimeStore } from "@/store/realtime";
import { sleep } from "@/utils/utils";
import { useMain } from "@/store";
import { storeToRefs } from "pinia";



export default defineComponent({
  name: 'DiameterDataChart',
  setup(props, ctx) {
    const realtimeStore = useRealTimeStore()
    const store = useMain()
    let inter: NodeJS.Timer
    let unit = `mm`
    let startFetch = true
    let myChart: echarts.ECharts

    const initEchart = () => {
      let ele = document.getElementById('DiameterDataChart')
      if (!ele) return
      myChart = echarts.init(ele);


      // 绘制图表
      myChart.setOption({
        title: {
          text: 'Dynamic Data & Time Axis'
        },
        toolbox: {
          feature: {
            // dataZoom: {
            //   yAxisIndex: 'none'
            // },
            restore: {},
            saveAsImage: {}
          }
        },
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
        series: [
          {
            name: 'Fake Data',
            type: 'line',
            showSymbol: false,
            data: (realtimeStore.realData[`${store.dataSource.key}Data`]?.avg || []).slice(-store.timeZone.key*60),
            smooth: false,
          }
        ],
        grid: {
          right: '2%',
          left: '10%'
        }
      });
    }


    const {realData} = storeToRefs(realtimeStore)
    
    watch(realData, (nv) => {
      myChart.setOption({
        series: [
          {
            data: nv[`${store.dataSource.key}Data`] ? nv[`${store.dataSource.key}Data`][store.displayWay.key].slice(-store.timeZone.key*60) || [] : [],
          }
        ]
      });
    },{deep:true})
    onMounted(() => {
      initEchart()
    })
    onUnmounted(() => {
      startFetch = false
      // clearInterval(inter)
    })

    return () => {
      let dataItem = realtimeStore.realData[`${store.dataSource.key}Data`]?.[store.displayWay.key] || []
      const avgValue = dataItem.length > 0 ? dataItem[dataItem.length-1].value[1] : 0

      return (
        <div class={'w-full h-full pt-2 shrink'}>
          <div class={'h-1/2 pb-2'}>
            <div class={'h-full border-1 border-solid border-[#e4e4e5] shadow-inner flex'}>
              <div class={'w-full h-full shrink py-1 px-2 flex justify-end items-center'}>
                <span class={'text-[#013b63] font-semibold'} style={{ fontSize: store.isLowRes ? '12rem' : '16rem' }} >{avgValue}</span>
              </div>
              <div class={' grow p-2 h-full flex flex-col'} style={{ backgroundImage: `linear-gradient(#cdcdcd, #f2f2f2 ,#cdcdcd)` }}>
                <span class={'mt-auto mb-[6vh] text-5xl font-bold text-[#5e5452]'}>mm</span>
              </div>
            </div>
          </div>

          <div class={'h-1/2 pb-2 overflow-hidden'}>
            <div class={'w-full h-full'} id={'DiameterDataChart'}>
            </div>
          </div>
        </div>
      )
    }
  }

})