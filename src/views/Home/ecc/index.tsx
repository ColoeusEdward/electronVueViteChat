import { NButton, NPopselect, NIcon, NDropdown, DropdownProps } from "naive-ui";
import type { PopselectProps } from "naive-ui";
import { defineComponent, reactive, ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import PopBtnComp from "@/components/PopBtnComp/PopBtnComp";
import { useMain } from "@/store";
import MenuBtn from "./MenuBtn";
import { EccDataSource, useEccStore } from "@/store/ecc";
import niotLogo from '@/assets/login_logos.png';
import classNames from "classnames";
import { useConfigStore } from "@/store/config";
import { ajaxPromiseAll, sleep } from "@/utils/utils";
import { eccChartId } from "./enum";
import * as echarts from 'echarts';
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { DataValue, FormulaParamEntity } from "~/me";
import { useMyI18n } from "@/hooks/useMyI18n";
// import DiameterDataChart from "./DiameterDataChart";
// import OutToleranceChart from "./OutToleranceChart";
export default defineComponent({
  name: 'Ecc',
  setup(props, ctx) {
    const store = useMain()
    let myChart: echarts.ECharts
    const eccStore = useEccStore()
    const configStore = useConfigStore()
    const { t, i18nStore, locale } = useMyI18n()
    const isLandscape = computed(() => store.isLandscape)
    const alldata = reactive({
      show: true,
      datList: [
        {
          label: '平均线径:',
          prop: 'OD' as keyof EccDataSource,
          value: 0,
          diff: 0,
          param: {} as FormulaParamEntity
        },
        {
          label: '偏心度:',
          prop: 'Ecc' as keyof EccDataSource,
          value: 0,
          diff: 0,
          param: {} as FormulaParamEntity
        },
        {
          label: '偏心角:',
          prop: 'Angel' as keyof EccDataSource,
          diff: 0,
          value: 0,
          param: {} as FormulaParamEntity
        },
        {
          label: '导体线径:',
          prop: 'CUOD' as keyof EccDataSource,
          value: 0,
          diff: 0,
          param: {} as FormulaParamEntity
        },
      ],
      valObj: {
        Ecc: 0,
        OD: 0,
        Angel: 0,
        CUOD: 0
      },
      wallThicknessList: [] as { Angle: number, Thickness: number }[],
      timeInstance: null as NodeJS.Timer | null,
      chartHeight: 0,
      bhParam: {} as FormulaParamEntity | undefined
    })

    // 动态获取 datList 的 labels，确保语言切换时能及时刷新
    const datListLabels = computed(() => {
      // 依赖 i18nStore.langChangeCount 以在语言切换时重新计算
      const _ = i18nStore.langChangeCount
      return {
        OD: t('data.averageLine') + ':',
        Ecc: t('data.deviation') + ':',
        Angel: t('data.deviationAngle') + ':',
        CUOD: t('data.guideLine') + ':'
      }
    })
    const chartShow = computed(() => {
      return eccStore.curEccMenuOption.OD && eccStore.curEccMenuOption.Ecc && eccStore.curEccMenuOption.CUOD && eccStore.curEccMenuOption.Angel
    })
    const curParamList = computed(() => configStore.curEnableFormulaParamList)
    const curODParam = computed(() => curParamList.value?.find(e => e.DataGroupId === eccStore.curEccMenuOption.OD?.GId))
    const curODParamUpAndLow = computed(() => {
      let standardVal = curODParam.value?.Standard || 0
      return curODParam.value?.Standard && curODParam.value?.UpperTol && curODParam.value?.LowerTol ? {
        upper: standardVal / 2 + Number(curODParam.value?.UpperTol),
        lower: -standardVal / 2 - curODParam.value?.LowerTol
      } : {}
    })
    const getData = () => {
      let reqList = [eccStore.curEccMenuOption.Ecc, eccStore.curEccMenuOption.OD, eccStore.curEccMenuOption.CUOD, eccStore.curEccMenuOption.Angel].map(e => callBrige(callFnName.GetRealtimeData, e?.GId))
      return ajaxPromiseAll(reqList).then((res: DataValue[]) => {
        if (!res || !res[0]) return

        alldata.valObj.Ecc = res[0].Value
        alldata.valObj.OD = res[1].Value
        alldata.valObj.CUOD = res[2].Value
        alldata.valObj.Angel = res[3].Value
      })
    }

    const initChart = () => {
      let ele = document.getElementById(eccChartId)
      console.log("🪵 [index.tsx:49] ~ token ~ \x1b[0;32mele\x1b[0m = ", ele);
      if (!ele) return
      myChart = echarts.init(ele, undefined, {
        // useDirtyRect: true
      });
      console.log("🪵 [index.tsx:89] ~ token ~ \x1b[0;32mcurODParamUpAndLow.value.lower\x1b[0m = ", curODParamUpAndLow.value.lower);
      let opt = {
        grid: {
          left: 30,
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
          axisLine: { onZero: true }, // 让 X 轴的轴线通过 Y 轴的 0 点
          currentTransform: null,
          // ❌ 隐藏 X 轴在垂直方向的分隔线
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.1)', // 推荐使用 rgba，通过透明度让网格线显得更高级、不抢戏
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
          axisLine: { onZero: true }, // 让 Y 轴的轴线通过 X 轴的 0 点
          // ❌ 隐藏 X 轴在垂直方向的分隔线
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(0, 0, 0, 0.1)', // 推荐使用 rgba，通过透明度让网格线显得更高级、不抢戏
              width: 1,
              type: 'solid'
            }
          }
        },

        series: [
          // 1. 最外层的红色圈：用空心散点实现
          // {
          //   type: 'scatter',
          //   data: [[0, 0]], // 定位在 (0,0) 原点
          //   symbol: 'circle',
          //   symbolSize: 80, // 散点大小（直径，相当于半径 40）
          //   itemStyle: {
          //     color: 'none',       // 内部不填充
          //     borderColor: '#FF4D4F', // 红色边框
          //     borderWidth: 2
          //   },
          //   silent: true // 禁用鼠标交互，纯作展示
          // },

          // 2. 中间的实心蓝色大圆：用实心散点实现
          // {
          //   type: 'scatter',
          //   data: [[0, 0]], // 定位在 (0,0) 原点
          //   symbol: 'circle',
          //   symbolSize: (curODParam.value?.Standard || 6) * 600, // 直径 60（相当于半径 30）
          //   itemStyle: {
          //     color: '#003a62' // 蓝色填充
          //   },
          //   zlevel: -3,
          //   silent: true
          // },
          {
            type: 'custom',
            renderItem: function (params: any, api: any) {
              // console.log("🪵 [index.tsx:153] ~ token ~ \x1b[0;32mparams\x1b[0m = ", params);
              // 将坐标轴上的距离（例如 X轴方向 2 个单位，Y轴方向 2 个单位）转换为当前的像素大小
              let length = alldata.valObj.OD
              // console.log("🪵 [index.tsx:159] ~ token ~ \x1b[0;32mlength\x1b[0m = ", length, alldata.valObj.OD);
              var size = api.size([length, length]);
              return {
                type: 'circle',
                transition: ['shape'],
                shape: {
                  cx: api.coord([0, 0])[0], // 圆心 X 像素坐标
                  cy: api.coord([0, 0])[1], // 圆心 Y 像素坐标
                  r: size[0] / 2            // 半径通过 api.size 计算得出
                },
                style: api.style({
                  fill: '#003a62'
                })
              };
            },
            zlevel: -3, // 确保叠在最上面

            data: [[0, 0]]
          },

          {
            type: 'custom',
            renderItem: function (params: any, api: any) {
              // console.log("🪵 [index.tsx:153] ~ token ~ \x1b[0;32mparams\x1b[0m = ", params);
              // 将坐标轴上的距离（例如 X轴方向 2 个单位，Y轴方向 2 个单位）转换为当前的像素大小
              let length = alldata.valObj.CUOD
              // 1. 将角度转换为弧度
              let radian = alldata.valObj.Angel * Math.PI / 180;
              // 2. 计算在 X 轴的投影
              let x = alldata.valObj.Ecc * Math.cos(radian);
              let y = alldata.valObj.Ecc * Math.sin(radian);
              let pos = [x, y]
              var size = api.size([length, length]);
              return {
                type: 'circle',
                transition: ['shape'],
                shape: {
                  cx: api.coord(pos)[0], // 圆心 X 像素坐标
                  cy: api.coord(pos)[1], // 圆心 Y 像素坐标
                  r: size[0] / 2            // 半径通过 api.size 计算得出
                },
                style: api.style({
                  fill: '#e8e9e9'
                })
              };
            },
            zlevel: -1, // 确保叠在最上面

            data: [[0, 0]]
          },

          // 3. 最内层的白色小圆：定位带偏移的散点
          // {
          //   type: 'scatter',
          //   // 这里直接修改数值，就可以让白色小圆围绕原点轻微变动（比如 X轴+0.8，Y轴-0.5）
          //   data: [[0, 0]],
          //   symbol: 'circle',
          //   symbolSize: 100, // 直径 20（相当于半径 10）
          //   itemStyle: {
          //     color: '#e8e9e9' // 白色填充
          //   },
          //   zlevel: -1, // 确保叠在最上面
          //   silent: true
          // }
        ]
      }
      myChart.setOption(opt)
    }
    const initMoreChart = () => {
      myChart.setOption({


      })
    }
    const updateChart = () => {
      myChart && myChart.setOption({
        series: [
          { data: [0, 0] }
        ]
      })
    }
    const updateWallThicknessLabels = () => {
      if (!myChart) return
      const list = alldata.wallThicknessList
      if (!list || list.length === 0) {
        myChart.setOption({ graphic: { elements: [] } })
        return
      }

      const axisMin = curODParamUpAndLow.value.lower || -1
      const axisMax = curODParamUpAndLow.value.upper || 1
      const maxRange = Math.max(Math.abs(axisMin), Math.abs(axisMax))
      const arrowInnerRadius = maxRange * 1.025 * 0.85
      const labelRadius = maxRange * 1.09 * 0.85

      const centerPx = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [0, 0])
      if (!centerPx) return

      const elements: any[] = []

      // ── 扇形光束：根据偏心角 Angel 从圆心射出 ──
      const fanCenterAngle = alldata.valObj.Angel
      const fanHalfAngle = 25  // 半角 15°，总宽 30°
      const fanSliceCount = 50
      const fanOuterRadius = alldata.valObj.OD / 2

      if (fanCenterAngle !== 0) {
        const angleStartRad = (fanCenterAngle - fanHalfAngle) * Math.PI / 180
        const angleEndRad = (fanCenterAngle + fanHalfAngle) * Math.PI / 180

        for (let i = 0; i < fanSliceCount; i++) {
          const a1 = angleStartRad + (i / fanSliceCount) * (angleEndRad - angleStartRad)
          const a2 = angleStartRad + ((i + 1) / fanSliceCount) * (angleEndRad - angleStartRad)

          // 颜色插值：中轴橙 → 边缘深蓝
          const midAngleDeg = fanCenterAngle - fanHalfAngle + ((i + 0.5) / fanSliceCount) * (fanHalfAngle * 2)
          const t = Math.abs(midAngleDeg - fanCenterAngle) / fanHalfAngle
          const r = Math.round(255 * (1 - t))
          const g = Math.round(140 * (1 - t) + 58 * t)
          const b = Math.round(98 * t)
          const opacity = 0.7 * (1 - t * 0.5)

          const c1 = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [0, 0])
          const c2 = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [0, 0])
          const c3 = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [fanOuterRadius * Math.cos(a2), fanOuterRadius * Math.sin(a2)])
          const c4 = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [fanOuterRadius * Math.cos(a1), fanOuterRadius * Math.sin(a1)])

          if (!c1 || !c2 || !c3 || !c4 || isNaN(c1[0])) continue

          elements.push({
            type: 'polygon',
            shape: {
              points: [[c1[0], c1[1]], [c2[0], c2[1]], [c3[0], c3[1]], [c4[0], c4[1]]],
            },
            // transition: ['shape'],

            style: {
              fill: `rgb(${r},${g},${b})`,
              opacity,
            },
            silent: true,
            zlevel: -2,
          })
        }
      }

      for (const item of list) {
        const angleRad = item.Angle * Math.PI / 180
        const cosA = Math.cos(angleRad)
        const sinA = Math.sin(angleRad)

        const labelPos = [labelRadius * cosA, labelRadius * sinA]
        const arrowInnerPos = [arrowInnerRadius * cosA, arrowInnerRadius * sinA]

        const labelPx = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, labelPos)
        const arrowEndPx = myChart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, arrowInnerPos)

        if (!labelPx || !arrowEndPx || isNaN(labelPx[0])) continue

        // Arrow line (from label position toward center)
        elements.push({
          type: 'line',
          shape: {
            x1: labelPx[0], y1: labelPx[1],
            x2: arrowEndPx[0], y2: arrowEndPx[1],
          },
          style: {
            stroke: '#FF8C00',
            lineWidth: 2,
          },
          silent: true,
        })

        // Arrowhead triangle at the inner end of the line
        const arrowSize = 9
        const dirX = -cosA
        const dirY = sinA
        const perpX = -dirY
        const perpY = dirX

        const tipX = arrowEndPx[0]
        const tipY = arrowEndPx[1]
        const baseLeftX = arrowEndPx[0] + perpX * arrowSize / 2 - dirX * arrowSize * 0.6
        const baseLeftY = arrowEndPx[1] + perpY * arrowSize / 2 - dirY * arrowSize * 0.6
        const baseRightX = arrowEndPx[0] - perpX * arrowSize / 2 - dirX * arrowSize * 0.6
        const baseRightY = arrowEndPx[1] - perpY * arrowSize / 2 - dirY * arrowSize * 0.6

        elements.push({
          type: 'polygon',
          shape: {
            points: [[tipX, tipY], [baseLeftX, baseLeftY], [baseRightX, baseRightY]],
          },
          style: {
            fill: '#FF8C00',
          },
          silent: true,
        })

        // 壁厚公差检测：根据 bhParam 的标准值与公差判断壁厚是否超差
        let textColor = '#00aa00' // 绿色：在公差范围内
        const bhParam = alldata.bhParam
        if (bhParam?.Standard != null) {
          const upperLimit = bhParam.Standard + (bhParam.UpperTol || 0)
          const lowerLimit = bhParam.Standard - (bhParam.LowerTol || 0)
          if (item.Thickness > upperLimit) {
            textColor = '#FF8C00' // 橙色：超过上公差
          } else if (item.Thickness < lowerLimit) {
            textColor = '#ff0000' // 红色：超过下公差
          }
        }

        // Text label (offset outward from label position)
        const textOffset = 14
        const textPxX = labelPx[0] + textOffset * cosA
        // 上方三个文字额外向上偏移12px（像素Y为负方向）
        const topExtraOffset = sinA > 0.3 ? -12 : 0
        const textPxY = labelPx[1] - textOffset * sinA + topExtraOffset

        let textAlign: string
        let textVerticalAlign: string
        if (cosA > 0.3) textAlign = 'left'
        else if (cosA < -0.3) textAlign = 'right'
        else textAlign = 'center'

        if (sinA > 0.3) textVerticalAlign = 'bottom'
        else if (sinA < -0.3) textVerticalAlign = 'top'
        else textVerticalAlign = 'middle'

        elements.push({
          type: 'text',
          left: textPxX - 30,
          top: textPxY,
          style: {
            text: item.Thickness.toFixed(5),
            textAlign,
            textVerticalAlign,
            fill: textColor,
            font: 'bold 18px sans-serif',
          },
          silent: true,
        })
      }

      myChart.setOption({
        graphic: { elements },
      })
    }
    const getConShortSize = () => {
      let { offsetHeight, offsetWidth } = document.getElementById('ecc-con') as HTMLDivElement
      let size = offsetHeight - offsetWidth > 0 ? offsetWidth : offsetHeight
      // console.log("🪵 [index.tsx:262] ~ token ~ \x1b[0;32msize\x1b[0m = ", size);
      alldata.chartHeight = size - 20
    }

    const getWallThickness = (od: number, ecc: number, angel: number, cuod: number) => {
      if (od === 0 || ecc === 0 || angel === 0 || cuod === 0) return
      callBrige(callFnName.CalcWallThickness, [od, ecc, angel, cuod].map(e => Number(e)), true).then((res: any[]) => {
        alldata.wallThicknessList = res
      })
    }

    watch(() => curParamList.value, (v) => {
      if (v && v.length > 0 && chartShow.value) {
        alldata.datList[0].param = curParamList.value!.find(e => e.DataGroupId === eccStore.curEccMenuOption.OD?.GId) as FormulaParamEntity
        alldata.datList[1].param = curParamList.value!.find(e => e.DataGroupId === eccStore.curEccMenuOption.Ecc?.GId) as FormulaParamEntity
        alldata.datList[2].param = curParamList.value!.find(e => e.DataGroupId === eccStore.curEccMenuOption.Angel?.GId) as FormulaParamEntity
        alldata.datList[3].param = curParamList.value!.find(e => e.DataGroupId === eccStore.curEccMenuOption.CUOD?.GId) as FormulaParamEntity

        alldata.bhParam = curParamList.value!.find(e => {
          if (!e.DataGroupId || e.DataGroupId.search(/\*/) == -1) return false
          return e.DataGroupId.split('*')[1] == 'bh'
        })

      }
    }, {
      immediate: true
    })
    watch(() => alldata.valObj.OD, () => {
      updateChart()
      alldata.datList[0].value = alldata.valObj.OD
      alldata.datList[1].value = alldata.valObj.Ecc
      alldata.datList[2].value = alldata.valObj.Angel
      alldata.datList[3].value = alldata.valObj.CUOD

      getWallThickness(alldata.valObj.OD, alldata.valObj.Ecc, alldata.valObj.Angel, alldata.valObj.CUOD)

      alldata.datList.forEach(e => {
        e.diff = e.value - (e.param?.Standard || 0)
      })
      // console.log("🪵 [index.tsx:255] ~ token ~ \x1b[0;32malldata.datList\x1b[0m = ", alldata.datList);
    })
    watch(() => alldata.wallThicknessList, () => {
      updateWallThicknessLabels()
    })
    watch(() => chartShow.value, (v) => {
      if (v) {
        sleep(100).then(() => {
          // initChart()
          getData()
          alldata.timeInstance && clearInterval(alldata.timeInstance)
          alldata.timeInstance = setInterval(() => {
            getData()
          }, configStore.sysConfig.ColloctInterval || 1000)
        })

      }
    })
    watch(() => configStore.showDataAdressList, () => {
      alldata.show = false
      sleep(50).then(() => {
        alldata.show = true
      })
    })

    onMounted(() => {
      getConShortSize()
      sleep(50).then(() => {
        initChart()
        if (chartShow.value) {
          initMoreChart()
          alldata.timeInstance && clearInterval(alldata.timeInstance)
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
              alldata.show && <div class={'flex   w-full justify-between ' + classNames({
                'ml-[10px] max-w-[1300px]': isLandscape.value && locale.value !== 'zh-CN',
                'ml-[10px] max-w-[900px]': isLandscape.value && locale.value == 'zh-CN',
                'ml-2 max-w-[100%]': !isLandscape.value && locale.value !== 'zh-CN',
                'ml-2 max-w-[800px]': !isLandscape.value && locale.value == 'zh-CN'
              })}>
                {
                  alldata.datList.map((e, i) => {
                    return <div class={'text-lg flex  items-center relative'} key={i}>
                      <span class={'mr-2'}>{datListLabels.value[e.prop as keyof typeof datListLabels.value]}</span>
                      <MenuBtn propName={e.prop} />
                      <span class={'absolute right-2 top-12 text-xl w-[110px] text-center ' + classNames({
                        'top-12': locale.value == 'zh-CN',
                        'top-14': locale.value != 'zh-CN',
                        'invisible': !chartShow.value,
                        'text-[#003a62]': !e.param || (e.diff <= (e.param.UpperTol || 0) && e.diff >= -(e.param.LowerTol || 0)),
                        'text-[#ff0000]': e.param && e.diff < -(e.param.LowerTol || 0),
                        'text-[#ff8d3f]': e.param && e.diff > (e.param.UpperTol || 0),

                      })}>{e.value}</span>
                    </div>
                  })
                }
              </div>
            }

            {/* <div class='ml-auto  h-16' >
       
              <img class={'h-full'} src={niotLogo} />
            </div> */}
          </div>
          {
            <div class={'w-full h-full shrink flex justify-center items-end'} id="ecc-con">
              {
                <div id="ecc-chart" class={'w-full h-full aspect-square max-w-full max-h-full'}
                  style={{
                    height: alldata.chartHeight + 'px',
                    width: alldata.chartHeight + 'px'
                  }} ></div>
              }

            </div>
          }
          {/* <MenuBtn /> */}
          {/* {store.displayChart.key == 'dataChart' && <DiameterDataChart />}
          {store.displayChart.key == 'outTolerance' && <OutToleranceChart />} */}
        </div>
      )
    }
  }

})