import { NInputNumber } from "naive-ui";
import { defineComponent, onMounted, onUnmounted, watch, ref, Transition, Teleport, nextTick } from "vue";
import * as echarts from 'echarts';
import { useRealTimeStore } from "@/store/realtime";
import { sleep } from "@/utils/utils";
import { storeToRefs } from "pinia";
import { useMain } from "@/store";
import AngleSlider from "./AngleSlider";



export default defineComponent({
  name: 'OutToleranceChart',
  setup(props, ctx) {
    const realtimeStore = useRealTimeStore()
    const store = useMain()
    let unit = `mm`
    let myChart: echarts.ECharts
    let absMap = 1000 //当前上限值, 应该允许自由设定



    const buildSeries = (nv: Record<string, any>) => {
      let dataItem = nv[`${store.dataSource.key}Data`]
      const lastX = dataItem ? dataItem.diameterX[dataItem.diameterX.length - 1].value[1] : 0

      const lastY = dataItem ? dataItem.diameterY[dataItem.diameterY.length - 1].value[1] : 0
      // console.log("🚀 ~ file: outToleranceChart.tsx:40 ~ buildSeries ~ lastY:", lastY)      
      // console.log("🚀 ~ file: outToleranceChart.tsx:38 ~ buildSeries ~ lastX:", lastX)
      let series = [
        {
          name: '平均值',
          type: 'line',
          symbol: 'none',
          smooth: true,
          data: (function calculateCirclePoints(
            centerX,
            centerY,
            rx, ry,
            numberOfPoints
          ) {
            var points = [];
            var angle = 0;
            var increment = (2 * Math.PI) / numberOfPoints;

            for (var i = 0; i < numberOfPoints; i++) {
              var x = centerX + rx * Math.cos(angle);
              var y = centerY + ry * Math.sin(angle);
              points.push([x, y]);
              angle += increment;
            }

            return points;
          })(0, 0, lastX, lastY, 300)
        },
        {
          name: '上限',
          type: 'line',
          symbol: 'none',
          smooth: true,
          data: (function calculateCirclePoints(
            centerX,
            centerY,
            radius,
            numberOfPoints
          ) {
            var points = [];
            var angle = 0;
            var increment = (2 * Math.PI) / numberOfPoints;

            for (var i = 0; i < numberOfPoints; i++) {
              var x = centerX + radius * Math.cos(angle);
              var y = centerY + radius * Math.sin(angle);
              points.push([x, y]);
              angle += increment;
            }

            return points;
          })(0, 0, 900, 300)
        },
        {
          name: '下限',
          type: 'line',
          symbol: 'none',
          smooth: true,
          data: (function calculateCirclePoints(
            centerX,
            centerY,
            radius,
            numberOfPoints
          ) {
            var points = [];
            var angle = 0;
            var increment = (2 * Math.PI) / numberOfPoints;

            for (var i = 0; i < numberOfPoints; i++) {
              var x = centerX + radius * Math.cos(angle);
              var y = centerY + radius * Math.sin(angle);
              points.push([x, y]);
              angle += increment;
            }

            return points;
          })(0, 0, 100, 300)
        }
      ]
      return series
    }

    const initEchart = () => {
      let ele = document.getElementById('OutToleranceChart')

      if (!ele) return
      myChart = echarts.init(ele);


      // 绘制图表
      myChart.setOption(
        {
          legend: {
            data: ['平均值', '上限', '下限',]
          },
          grid: {
            height: ele.clientHeight - 100,
            width: ele.clientHeight - 100,
            left: 'center'
          },
          xAxis: {
            name: "X",
            type: 'value',
            max: absMap,
            min: -absMap
            // interval: 1
          },
          yAxis: {
            name: 'Y',
            type: 'value',
            max: absMap,
            min: -absMap
            // interval: 1
          },
          dataZoom: [
            {
              show: true,
              type: 'inside',
              filterMode: 'none',
              xAxisIndex: [0],
              startValue: -absMap,
              endValue: absMap
            },
            {
              show: true,
              type: 'inside',
              filterMode: 'none',
              yAxisIndex: [0],
              startValue: -absMap,
              endValue: absMap
            }
          ],
          color: ['#5470c6', '#43963e', '#9e152a'],
          series: buildSeries(realtimeStore.realData)
        }
      );
      // loopGetData()
    }

    const { realData } = storeToRefs(realtimeStore)
    watch(realData, (nv) => {
      myChart.setOption({
        series: buildSeries(nv)
      });
    }, { deep: true })

    onMounted(() => {
      initEchart()
    })


    return () => {
      return (
        <div class={'w-full h-full pt-2 shrink flex items-center justify-center relative'} id={'OutToleranceCon'} >
          <div class={' w-full h-full '} id={'OutToleranceChart'} ></div>

          <AngleSlider v-show={store.dataSource.key == 'ecc'} />

          {/* {store.dataSource.key == 'ecc' && <AngleSlider />} */}
        </div>
      )
    }
  }

})