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
      timeInstance: null as NodeJS.Timer | null,
      chartHeight: 0
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
    const getConShortSize = () => {
      let { offsetHeight, offsetWidth } = document.getElementById('ecc-con') as HTMLDivElement
      let size = offsetHeight - offsetWidth > 0 ? offsetWidth : offsetHeight
      console.log("🪵 [index.tsx:262] ~ token ~ \x1b[0;32msize\x1b[0m = ", size);
      alldata.chartHeight = size - 20
    }

    const maxWidth = computed(() => {
      return store.isLandscape ? '100%' : '100%'
    })
    watch(() => curParamList.value, (v) => {
      if (v && v.length > 0 && chartShow.value) {
        alldata.datList[0].param = curParamList.value!.find(e => e.DataGroupId === eccStore.curEccMenuOption.OD?.GId) as FormulaParamEntity
        alldata.datList[1].param = curParamList.value!.find(e => e.DataGroupId === eccStore.curEccMenuOption.Ecc?.GId) as FormulaParamEntity
        alldata.datList[2].param = curParamList.value!.find(e => e.DataGroupId === eccStore.curEccMenuOption.Angel?.GId) as FormulaParamEntity
        alldata.datList[3].param = curParamList.value!.find(e => e.DataGroupId === eccStore.curEccMenuOption.CUOD?.GId) as FormulaParamEntity


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

      alldata.datList.forEach(e => {
        e.diff = e.value - (e.param?.Standard || 0)
      })
      // console.log("🪵 [index.tsx:255] ~ token ~ \x1b[0;32malldata.datList\x1b[0m = ", alldata.datList);
    })
    watch(() => chartShow.value, (v) => {
      if (v) {
        sleep(100).then(() => {
          initChart()
          getData()
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
        if (chartShow.value) {
          initChart()
          initMoreChart()
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
                chartShow.value && <div id="ecc-chart" class={'w-full h-full aspect-square max-w-full max-h-full'}
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