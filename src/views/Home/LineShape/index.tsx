import { NButton } from "naive-ui";
import { defineComponent, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useMain } from "@/store";
import MenuBtn from "./MenuBtn";
import { useLineShapeStore, LineShapeDataSource } from "@/store/lineShape";
import { useConfigStore } from "@/store/config";
import { ajaxPromiseAll, sleep } from "@/utils/utils";
import { lineShapeChartId } from "./enum";
import * as echarts from 'echarts';
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { DataValue, FormulaParamEntity } from "~/me";
import classNames from "classnames";
import { useMyI18n } from "@/hooks/useMyI18n";

export default defineComponent({
  name: 'LineShape',
  setup(props, ctx) {
    const store = useMain()
    let myChart: echarts.ECharts
    const lineShapeStore = useLineShapeStore()
    const configStore = useConfigStore()
    const { t, i18nStore } = useMyI18n()
    const isLandscape = computed(() => store.isLandscape)
    const alldata = reactive({
      show: true,
      datList: [
        {
          label: '平均线径:',
          prop: 'OD' as keyof LineShapeDataSource,
          value: 0,
          diff: 0,
          param: {} as FormulaParamEntity
        },
        {
          label: '线径X:',
          prop: 'DiameterX' as keyof LineShapeDataSource,
          value: 0,
          diff: 0,
          param: {} as FormulaParamEntity
        },
        {
          label: '线径Y:',
          prop: 'DiameterY' as keyof LineShapeDataSource,
          value: 0,
          diff: 0,
          param: {} as FormulaParamEntity
        },
      ],
      valObj: {
        OD: 0,
        DiameterX: 0,
        DiameterY: 0
      },
      timeInstance: null as NodeJS.Timer | null,
      chartHeight: 0
    })

    // 动态获取 datList 的 labels，确保语言切换时能及时刷新
    const datListLabels = computed(() => {
      // 依赖 i18nStore.langChangeCount 以在语言切换时重新计算
      const _ = i18nStore.langChangeCount
      return {
        OD: t('data.averageLine') + ':',
        DiameterX: t('config.diameterX') + ':',
        DiameterY: t('config.diameterY') + ':'
      }
    })

    // 动态获取图例和 series 的 names，确保语言切换时能及时刷新
    const chartNames = computed(() => {
      const _ = i18nStore.langChangeCount
      return {
        average: t('data.average'),
        upperLimit: t('data.limitHeight'),
        lowerLimit: t('data.limitLow')
      }
    })

    const chartShow = computed(() => {

      return lineShapeStore.curLineShapeMenuOption.OD && lineShapeStore.curLineShapeMenuOption.DiameterX && lineShapeStore.curLineShapeMenuOption.DiameterY
    })

    const curParamList = computed(() => configStore.curEnableFormulaParamList)
    const curODParam = computed(() => curParamList.value?.find(e => e.DataGroupId === lineShapeStore.curLineShapeMenuOption.OD?.GId))
    const curODParamUpAndLow = computed(() => {
      let standardVal = curODParam.value?.Standard || 0
      return curODParam.value?.Standard && curODParam.value?.UpperTol && curODParam.value?.LowerTol ? {
        upper: (standardVal / 2) + Number(curODParam.value?.UpperTol),
        lower: -(standardVal / 2) - curODParam.value?.LowerTol
      } : {}
    })

    const getData = () => {
      let reqList = [
        lineShapeStore.curLineShapeMenuOption.OD,
        lineShapeStore.curLineShapeMenuOption.DiameterX,
        lineShapeStore.curLineShapeMenuOption.DiameterY
      ].map(e => callBrige(callFnName.GetRealtimeData, e?.GId))
      return ajaxPromiseAll(reqList).then((res: DataValue[]) => {
        if (!res || !res[0]) return
        alldata.valObj.OD = res[0].Value
        alldata.valObj.DiameterX = res[1].Value
        alldata.valObj.DiameterY = res[2].Value
      })
    }

    const initChart = () => {
      let ele = document.getElementById(lineShapeChartId)
      if (!ele) return
      myChart = echarts.init(ele, undefined, {});

      let opt = {
        legend: {
          show: true,
          left: 'left',           // 图例组件离容器左侧的距离
          top: 'middle',          // 垂直居中（也可以设为 'top' 等）
          orient: 'vertical',     // 布局朝向：垂直排列（若想水平靠左，删掉此行即可）
          itemGap: 30,            // 图例每项之间的间隔
          itemWidth: 80,
          itemHeight: 5,
          textStyle: {
            fontSize: 20,
            color: '#333'
          },
          icon: 'path://m0.010277,5.945418l24.979446,0l0,2.109164l-24.979446,0l0,-2.109164z', //
          lineStyle: {
            width: 3             // 【核心】直接在这里定义全局图例线条的粗细！
          },
          data: [
            {
              name: chartNames.value.average,
              itemStyle: {
                color: '#8fdbf8'
              },
            },
            {
              name: chartNames.value.upperLimit,
              itemStyle: {
                color: '#00C853'
              },
            },
            {
              name: chartNames.value.lowerLimit,
              itemStyle: {
                color: '#FF1744'
              },
            }
          ]
        },
        grid: {
          left: 230,
          right: 30,
          top: 30,
          bottom: 30,
        },
        xAxis: {
          type: 'value',
          min: function (value: any) {
            return (curODParamUpAndLow.value.lower || -1)
          },
          max: function (value: any) {
            return (curODParamUpAndLow.value.upper || 1)
          },
          name: 'X',              // 在 Y 轴显示 "Y" 字样
          nameTextStyle: {
            fontSize: 20
          },
          // nameLocation: 'end',    // 显示在 Y 轴的顶端末尾
          axisLine: { onZero: true },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.1)',
              width: 1,
              type: 'solid'
            }
          }
        },
        yAxis: {
          type: 'value',
          min: function (value: any) {
            return (curODParamUpAndLow.value.lower || -1)
          },
          max: function (value: any) {
            return (curODParamUpAndLow.value.upper || 1)
          },
          name: 'Y',              // 在 Y 轴显示 "Y" 字样
          nameTextStyle: {
            fontSize: 20
          },
          // nameLocation: 'end',    // 显示在 Y 轴的顶端末尾
          axisLine: { onZero: true },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.1)',
              width: 1,
              type: 'solid'
            }
          }
        },
        series: [
          // 天蓝色圆形（基于平均线径）
          {
            name: chartNames.value.average,
            type: 'custom',
            renderItem: function (params: any, api: any) {
              let length = alldata.valObj.OD
              var size = api.size([length, length]);
              return {
                type: 'circle',
                transition: ['shape'],
                shape: {
                  cx: api.coord([0, 0])[0],
                  cy: api.coord([0, 0])[1],
                  r: size[0] / 2
                },
                style: api.style({
                  fill: 'none',
                  stroke: '#87CEEB',  // 天蓝色
                  lineWidth: 3
                })
              };
            },
            zlevel: -1,
            data: [[0, 0]]
          },
          // 实心椭圆（基于线径X和线径Y）
          {
            type: 'custom',
            renderItem: function (params: any, api: any) {
              // 线径X作为长轴，线径Y作为短轴
              let radiusX = alldata.valObj.DiameterX / 2
              let radiusY = alldata.valObj.DiameterY / 2
              var sizeX = api.size([radiusX, 0]);
              var sizeY = api.size([0, radiusY]);
              return {
                type: 'ellipse',
                transition: ['shape'],
                shape: {
                  cx: api.coord([0, 0])[0],
                  cy: api.coord([0, 0])[1],
                  rx: sizeX[0],
                  ry: sizeY[1]
                },
                style: api.style({
                  fill: '#003a62',  // 椭圆填充颜色
                  // opacity: 0.8
                })
              };
            },
            zlevel: -2,
            data: [[0, 0]]
          },
          // 上限圆形
          {
            name: chartNames.value.upperLimit,
            type: 'custom',
            renderItem: function (params: any, api: any) {
              let upperTol = curODParam.value?.UpperTol ? Number(curODParam.value.UpperTol) : 0
              let radius = (curODParam.value?.Standard! / 2) + upperTol
              var size = api.size([radius, radius]);
              return {
                type: 'circle',
                transition: ['shape'],
                shape: {
                  cx: api.coord([0, 0])[0],
                  cy: api.coord([0, 0])[1],
                  r: size[0]
                },
                style: api.style({
                  fill: 'none',
                  stroke: '#00C853',
                  lineWidth: 2,
                  // lineDash: [5, 5]
                })
              };
            },
            zlevel: -0,
            data: [[0, 0]]
          },
          // 下限圆形
          {
            name: chartNames.value.lowerLimit,
            type: 'custom',
            renderItem: function (params: any, api: any) {
              let lowerTol = curODParam.value?.LowerTol ? Number(curODParam.value.LowerTol) : 0
              let radius = (curODParam.value?.Standard! / 2) - lowerTol
              var size = api.size([radius, radius]);
              return {
                type: 'circle',
                transition: ['shape'],
                shape: {
                  cx: api.coord([0, 0])[0],
                  cy: api.coord([0, 0])[1],
                  r: size[0]
                },
                style: api.style({
                  fill: 'none',
                  stroke: '#FF1744',
                  lineWidth: 2,
                  // lineDash: [5, 5]
                })
              };
            },
            zlevel: -0,
            data: [[0, 0]]
          }
        ]
      }
      myChart.setOption(opt)
    }

    const updateChart = () => {
      myChart.setOption({
        series: [
          { data: [[0, 0]] },
          { data: [[0, 0]] },
          { data: [[0, 0]] },
          { data: [[0, 0]] },
          { data: [[0, 0]] }
        ]
      })
    }

    const getConShortSize = () => {
      let { offsetHeight, offsetWidth } = document.getElementById('line-shape-con') as HTMLDivElement
      let size = offsetHeight - offsetWidth > 0 ? offsetWidth : offsetHeight
      alldata.chartHeight = size - 60
    }

    watch(() => curParamList.value, (v) => {
      if (v && v.length > 0 && chartShow.value) {
        alldata.datList[0].param = curParamList.value!.find(e => e.DataGroupId === lineShapeStore.curLineShapeMenuOption.OD?.GId) as FormulaParamEntity
        alldata.datList[1].param = curParamList.value!.find(e => e.DataGroupId === lineShapeStore.curLineShapeMenuOption.DiameterX?.GId) as FormulaParamEntity
        alldata.datList[2].param = curParamList.value!.find(e => e.DataGroupId === lineShapeStore.curLineShapeMenuOption.DiameterY?.GId) as FormulaParamEntity
      }
    }, {
      immediate: true
    })

    watch(() => alldata.valObj.OD, () => {
      updateChart()
      alldata.datList[0].value = alldata.valObj.OD
      alldata.datList[1].value = alldata.valObj.DiameterX
      alldata.datList[2].value = alldata.valObj.DiameterY

      alldata.datList.forEach(e => {
        e.diff = e.value - (e.param?.Standard || 0)
      })
    })

    watch(() => chartShow.value, (v) => {
      if (v) {
        getData()
        alldata.timeInstance = setInterval(() => {
          getData()
        }, configStore.sysConfig.ColloctInterval || 1000)
      }
    })

    watch(() => configStore.showDataAdressList, () => {
      alldata.show = false
      sleep(50).then(() => {
        alldata.show = true
      })
    })

    // 监听语言切换，重新初始化图表
    watch(() => i18nStore.langChangeCount, () => {
      if (chartShow.value && myChart) {
        sleep(50).then(() => {
          // 重新初始化图表以更新图例和 series 的 name
          initChart()
        })

      }
    })

    onMounted(() => {
      getConShortSize()
      sleep(50).then(() => {
        if (chartShow.value) {
          initChart()
          getData()
          alldata.timeInstance = setInterval(() => {
            getData()
          }, configStore.sysConfig.ColloctInterval || 1000)
        }
      })
    })

    onBeforeUnmount(() => {
      alldata.timeInstance && clearInterval(alldata.timeInstance)
    })

    return () => {
      return (
        <div class={'w-full h-full px-2 flex flex-col'}>
          <div class={"flex justify-center flex-shrink-0 "}>
            {
              alldata.show && <div class={'flex max-w-[800px] w-full justify-between ' + classNames({
                'ml-[10px]': isLandscape.value,
                'ml-2': !isLandscape.value
              })}>
                {
                  alldata.datList.map((e, i) => {
                    return <div class={'text-lg flex items-center relative'} key={i}>
                      <span class={'mr-2'}>{datListLabels.value[e.prop as keyof typeof datListLabels.value]}</span>
                      <MenuBtn propName={e.prop} />
                      <span class={'absolute right-2 top-10 text-xl w-[110px] text-center ' + classNames({
                        'text-[#003a62]': !e.param || (e.diff <= (e.param.UpperTol || 0) && e.diff >= -(e.param.LowerTol || 0)),
                        'text-[#ff0000]': e.param && e.diff < -(e.param.LowerTol || 0),
                        'text-[#ff8d3f]': e.param && e.diff > (e.param.UpperTol || 0),
                      })}>{e.value}</span>
                    </div>
                  })
                }
              </div>
            }
          </div>

          <div class={'w-full h-full shrink flex justify-center items-end'} id="line-shape-con">
            {
              chartShow.value && <div id={lineShapeChartId} class={'w-full h-full aspect-square max-w-full max-h-full relative'}
                style={{
                  height: alldata.chartHeight + 'px',
                  width: alldata.chartHeight + 200 + 'px',
                  left: '-100px'
                }} ></div>
            }


          </div>

        </div>
      )
    }
  }
})
