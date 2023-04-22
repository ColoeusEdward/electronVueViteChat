import { NInputNumber } from "naive-ui";
import { defineComponent, onMounted, onUnmounted, watch, ref, Transition, Teleport, nextTick } from "vue";
import * as echarts from 'echarts';
import { useRealTimeStore } from "@/store/realtime";
import { sleep } from "@/utils/utils";
import { storeToRefs } from "pinia";
import { useMain } from "@/store";
import Slider from "vue3-slider"
import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";

type InputType = InstanceType<typeof NInputNumber>|null
const AngleSlider = defineComponent({
  name: 'AngleSlider',
  setup(props, ctx) {
    const store = useMain()
    const angle = ref(0)
    const keyBoardAngle = ref<string|number>('')
    const keyborardShow = ref(false)
    const isMounted = ref(false)
    const inputRef = ref<InputType>()
    let keyboardIns:Keyboard



    const handleDragEnd = () => {
      // console.log(angle.value)
      store.setEccAngle(angle.value)
    }

    const valueClick = () => {
      keyborardShow.value = !keyborardShow.value
    }
    const onChange = (value:string) => {
      let num = Number(value)
      if(num>=359){
        num = 359
      }
      keyBoardAngle.value = num
      // keyboardIns.setInput(String(num))
    }
    const onKeyPress = (button:string) => {
      if(button == '{enter}'){
        angle.value = Number(keyBoardAngle.value) 
        store.setEccAngle(angle.value)
        keyborardShow.value = false
      }
      if(button == '0' && keyBoardAngle.value == 0){  //该组件有个bug,开头狂按0会正常写入组件内部, 需要手动清空
        keyboardIns.clearInput()
      }
    }

    watch(keyborardShow,(nv) => {
      if(nv){
        keyboardIns.clearInput()
        keyBoardAngle.value = ''
        keyboardIns.setInput('')
      }
    })

    onMounted(() => {
      isMounted.value = true
      nextTick(() => {
        keyboardIns = new Keyboard({
          display: {
            '{bksp}': '←',
            '{enter}': 'OK'
          },
          inputPattern:/^(?:[1-9][0-9]{0,2}|0)$/,
          // maxLength: 3,
          layout: {
            default: [
              '1 2 3',
              '4 5 6',
              '7 8 9',
              '0 {bksp} {enter}'
            ]
          },
          onChange: input => onChange(input),
          onKeyPress: button => onKeyPress(button)
        });
      })

    })

    return () => {

      return (
        <div class={'absolute right-4 bottom-8 h-[10vh] w-[10vh] flex flex-col items-center justify-center'}>
          <span class={'text-lg font-medium mb-2'}>扭转</span>
          <Slider v-model={angle.value} color="#456e9c" track-color="#FEFEFE" orientation={'circular'} max={359} min={0} onDragEnd={handleDragEnd} />

          <span class={'absolute top-1/2 left-1/2  -ml-8 w-16 h-8 flex items-center justify-center text-lg font-medium shadow-md rounded-lg cursor-pointer border-0 border-t border-solid border-t-gray-200'} onClick={valueClick} >{angle.value + '°'}</span>

          {
            isMounted.value && <Teleport to="#OutToleranceCon">
              <Transition name='slide-fade'>
                <div class={' absolute bottom-8 right-[16vh] w-[26vh] h-[36vh] flex flex-col items-center justify-end'} v-show={keyborardShow.value}>
                  <NInputNumber ref={(e) => {inputRef.value = e as InputType}} class={'w-full'} value={Number(keyBoardAngle.value)} size={'large'} />
                  <div class={'simple-keyboard w-full h-full shrink'}></div>
                </div>
              </Transition>
            </Teleport>
          }


        </div>
      )
    }
  },
})

export default defineComponent({
  name: 'OutToleranceChart',
  setup(props, ctx) {
    const realtimeStore = useRealTimeStore()
    const store = useMain()
    let inter: NodeJS.Timer
    let unit = `mm`
    let startFetch = true
    let myChart: echarts.ECharts
    let absMap = 1000 //当前上限值, 应该允许自由设定

    // const loopGetData = async () => {
    //   while (startFetch) {
    //     await sleep(1000)
    //     realtimeStore.fetchDiameter1Data()
    //     // console.log("🚀 ~ file: Diameter1DataChart.tsx:105 ~ realtimeStore.diameter1Data:", realtimeStore.diameter1Data)
    //     myChart.setOption({
    //       series: [
    //         {
    //           data: realtimeStore.realData.diameter1Data
    //         }
    //       ]
    //     });
    //   }
    // }

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
      //  console.log("🚀 ~ file: outToleranceChart.tsx:174 ~ watch ~ nv:", nv)
      myChart.setOption({
        series: buildSeries(nv)
      });
    }, { deep: true })

    onMounted(() => {
      initEchart()
    })
    onUnmounted(() => {
      startFetch = false
      // clearInterval(inter)
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