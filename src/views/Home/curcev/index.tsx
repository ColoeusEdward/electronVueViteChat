import { DropdownProps, NButton, NDatePicker, NDropdown, NIcon, NInput, NInputNumber, NSpace, NTimePicker, NTooltip, useMessage } from "naive-ui";
import { ComponentPublicInstance, computed, defineComponent, nextTick, onBeforeUnmount, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import niotLogo from '@/assets/login_logos.png';
import { callSpc, getSysConfig } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { ActualResult, CollectPointModel, CPKEntity, CpkModel, DataConfigEntity, DataValue, FFTModel, ModbusAdressRow, SysConfigEntity } from "~/me";
import activeImg from '@/assets/LineDspButton_inactive.png'
import activeWarningImg from '@/assets/LineDspButton_inactive_warning3.png'
import { useCurcevInnerDataStore } from "./innerData";
import { InfoOutlined, LayersClearOutlined, PlayArrowOutlined, StopCircleOutlined } from "@vicons/material";
import CurcevChartRow, { CurcevChartRowIns } from "./CurcevChartRow";
import CpkBlock from "./CpkBlock";
import NormalDis from "./NormalDis";
import { frontFnNameEnum, menuIdSplit, menuOptList, MenuOptType, menuPropEnum } from "./enum";
import { buildMenuOpt, getRandomInt, getRegState, loopGet, sleep, updateFormulaConfig } from "@/utils/utils";
import { useMain } from "@/store";
import { useSysCfgInnerDataStore } from "../config/sysConfig/innderData";
import FFT from "./FFT";
import { DataTypeEnum, DataTypeOnIndex } from "../config/dataCofigNew/enum";
import { NBaseLoading } from "naive-ui/es/_internal";
import { callBrige } from "@/utils/callm";
import { useConfigStore } from "@/store/config";
import { DropdownMixedOption } from "naive-ui/es/dropdown/src/interface";
import classNames from "classnames";

let defCfgData: DataConfigEntity[] = [
  {
    GId: '0',
    Name: '直径1',
    DataType: 1,
    SortNum: 0,
    Precision: 0,
    Unit: '',
    State: 1,
    AlarmType: 0,
    Unilateral: 0,
    Distance: 0,
    CreateTime: "111",
    children: [
      {
        GId: "3",
        Name: '直径(平均值)',
        DataType: 1,
        SortNum: 0,
        Precision: 0,
        Unit: '',
        State: 1,
        AlarmType: 0,
        Unilateral: 0,
        Distance: 1,
        CreateTime: "111",
      },
      {
        GId: "4",
        Name: '椭圆度',
        DataType: 1,
        SortNum: 0,
        Precision: 0,
        Unit: '',
        State: 1,
        AlarmType: 0,
        Unilateral: 0,
        Distance: 1,
        CreateTime: "111",
      },
      {
        GId: "1",
        Name: '直径X(平均值)',
        DataType: 1,
        SortNum: 0,
        Precision: 0,
        Unit: '',
        State: 1,
        AlarmType: 0,
        Unilateral: 0,
        Distance: 1,
        CreateTime: "111",
      },
      {
        GId: "2",
        Name: '直径Y(平均值)',
        DataType: 1,
        SortNum: 0,
        Precision: 0,
        Unit: '',
        State: 1,
        AlarmType: 0,
        Unilateral: 0,
        Distance: 0,
        CreateTime: "111",
      }
    ]
  }
]

export default defineComponent({
  name: 'Curcev',  //实时数据,

  setup(props, ctx) {
    const innerData = useCurcevInnerDataStore()
    const store = useMain()
    const configStore = useConfigStore()
    // innerData.isGetting = false
    const msg = useMessage()
    const chartRef = ref<ComponentPublicInstance<{}, CurcevChartRowIns> | null>(null)
    const commonData = reactive({
      cfgDataList: [] as DataConfigEntity[],
      curPage: 0,
      pageSize: 3,
      getCfgLoading: false,
      menuOpt: [] as DropdownMixedOption[],
      timerIns: null as any,
      tol: { up: 0, down: 0, }, //上下限
    })
    const getSysCfg = () => {
      callBrige(callFnName.GetSysConfig).then((res: SysConfigEntity[]) => {
        innerData.setSysConfig(res)
      })
    }
    const chartAdressList = computed(() => configStore.chartDataAdressList)
    // getSysCfg()
    const getAllActiveConfigData = () => {
      commonData.getCfgLoading = true
      // return callBrige(callFnName.GetDataConfigs)
      return new Promise<DataConfigEntity[]>((resolve, reject) => resolve([])).then((res: DataConfigEntity[]) => {
        if (res && res.length == 0) {
          commonData.cfgDataList = defCfgData
          innerData.setDataCfgList(defCfgData)
          if (!innerData.curDataCfgEntity) {
            innerData.setCurDataCfgEntity(defCfgData[0].children![0])
            nextTick(() => {
              innerData.getCpkFn()
            })
          }
          return
          //  sleep(500).then(() => refresh())
        } else {
          res = []
        }
        let list = res
        // console.log("🚀 ~ returncallSpc ~ list:", list)
        commonData.cfgDataList = list.sort((a, b) => a.SortNum - b.SortNum)
        innerData.setDataCfgList(list)
        if (!innerData.curDataCfgEntity) {
          innerData.setCurDataCfgEntity(list[0])
          nextTick(() => {

            // innerData.getCpkFn()

          })
        }
      }).finally(() => {
        commonData.getCfgLoading = false
      })
    }

    const startCollect = () => {
      return refresh().then(() => {
        return callBrige(callFnName.StartCollect)
      })
        .then((res: string) => {

          innerData.setIsGetting(true)


        })
    }
    const stopCollect = () => {
      return callBrige(callFnName.StopCollect).then(() => {
        innerData.setIsGetting(false)
      })
    }
    const testFn = () => {
      console.log(`testfnfffff`,);
    }
    window.frontFn[frontFnNameEnum.startCollect] = startCollect
    window.frontFn[frontFnNameEnum.stopCollect] = stopCollect
    window.frontFn[frontFnNameEnum.testFn] = testFn


    innerData.setStartColFn(startCollect)
    innerData.setStopColFn(stopCollect)
    const refresh = (e?: any) => {
      return getSysConfig().then(() => {
        updateFormulaConfig(configStore)
        return configStore.initServiceFn()
      }).then(() => {
        if (e) {
          msg.success('配置已刷新')
        }
      })
      // return getAllActiveConfigData().then(() => {
      //   e && msg.success('配置已刷新')
      // })
    }
    const clearCollect = () => {
      return callBrige(callFnName.ClearCollect).then(() => {
      })
    }
    innerData.setCleanColFn(clearCollect)
    const shaftCollect = () => {
      return callBrige(callFnName.ShaftCollect).then(() => {
      })
    }
    innerData.setShaftColFn(shaftCollect)

    const nextPage = () => {

    }
    const prevPage = () => {

    }
    const mainFixNum = computed(() => {
      // innerData.dataCfgList.
      let val = configStore.curChartAdress?.Precision
      return Number(val)
    })
    const nextShow = computed(() => {
      return (commonData.curPage + 1) * commonData.pageSize < commonData.cfgDataList.length
    })
    const prevShow = computed(() => {
      return commonData.curPage > 0
    })
    const curDataType = computed(() => {
      return innerData.curDataCfgEntity?.DataType
    })
    watch(() => chartAdressList.value, (v: ModbusAdressRow[]) => {
      // console.log("🪵 [index.tsx:216] ~ token ~ \x1b[0;32mv\x1b[0m = ", v);
      let list = v
      let opt = menuOptList
      let sitem = opt!.find(e => e.key == menuPropEnum.dataSource)
      if (sitem) {
        if (list.length == 0) {
          // commonData.cfgDataList.map(e => buildMenuOpt(e))
          sitem.children = list.map(e => buildMenuOpt(e)) as any
        } else {
          sitem.children = list.map(e => buildMenuOpt(e))
          // .filter((e: ModbusAdressRow) => (e.State == 1 && DataTypeOnIndex.includes(e.DataType))).map(e => {
          //   return {
          //     ...buildMenuOpt(e),
          //     children: e.children?.map(ee => buildMenuOpt(ee))
          //   }
          // }) as MenuOptType[]
        }
      }
      commonData.menuOpt = opt as any
      // console.log("🪵 [index.tsx:234] ~ token ~ \x1b[0;32mcommonData.menuOpt\x1b[0m = ", commonData.menuOpt);
    }, {
      immediate: true
    })
    // const menuOpt = computed(() => {
    //   let opt = menuOptList
    //   console.log("🪵 [index.tsx:216] ~ token ~ \x1b[0;32mopt\x1b[0m = ", opt);
    //   let sitem = opt!.find(e => e.key == menuPropEnum.dataSource)
    //   if (sitem) {
    //     if (chartAdressList.value.length == 0) {
    //       let list: MenuOptType[] = []
    //       // commonData.cfgDataList.map(e => buildMenuOpt(e))
    //       sitem.children = list
    //     } else {
    //       sitem.children = chartAdressList.value
    //       // .filter((e: ModbusAdressRow) => (e.State == 1 && DataTypeOnIndex.includes(e.DataType))).map(e => {
    //       //   return {
    //       //     ...buildMenuOpt(e),
    //       //     children: e.children?.map(ee => buildMenuOpt(ee))
    //       //   }
    //       // }) as MenuOptType[]
    //     }

    //   }
    //   // sitem && (sitem.children = commonData.cfgDataList.filter((e: DataConfigEntity) => (e.State == 1 && DataTypeOnIndex.includes(e.DataType))).map(e => {
    //   //   return {
    //   //         ...buildMenuOpt(e),
    //   //     children: e.children
    //   //   }
    //   // }) as MenuOptType[])
    //   console.log("🪵 [index.tsx:241] ~ token ~ \x1b[0;32mopt\x1b[0m = ", opt);

    //   return opt
    // })
    const handleSelect = (key: string) => {
      let type = key.split(menuIdSplit)[0]
      let trueKey = key.split(menuIdSplit)[1]
      if (type == menuPropEnum.dataSource) {
        let item = configStore.chartDataAdressList.find(e => e.GId == trueKey)
        configStore.setCurChartAdress(item)
        // let item = commonData.cfgDataList.find(e => e.GId == trueKey)
        // innerData.setCurDataCfgEntity(item)
        // innerData.getCpkFn()
      }
      if (type == menuPropEnum.uploadLineShot) {
        getLineShot()
      }
    }
    const getLineShot = () => {
      let chartIns = chartRef.value?.getChartIns()
      let picInfo = chartIns.getDataURL({
        type: 'png',
        pixelRatio: 1.5, //放大两倍下载，之后压缩到同等大小展示。解决生成图片在移动端模糊问题
        backgroundColor: '#fff'
      })
      // console.log("🚀 ~ getLineShot ~ picInfo:", picInfo)
    }

    getRegState()

    const renderLabel: DropdownProps['renderLabel'] = (option) => {
      if (!option.trueKey && option.GId) {
        option.trueKey = option.GId
        option.label = option.DataName
      }
      let text = option.label
      if (option.trueKey && configStore.curChartAdress?.GId == option.trueKey) {
        text += ' ✔️'
      }

      return (
        <span>{text}</span>
      )
    }
    const nodeProps = () => {
      return {
        style: {
          minWidth: '14vh'
        }
      }
    }
    const loopGetCpk = () => {
      if (configStore.curChartAdress) {
        callBrige(callFnName.GetCpkData, configStore.curChartAdress.GId).then((res: CPKEntity) => {
          // console.log("🪵 [index.tsx:319] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
          configStore.setCurCpk(res)
        })
      }
      // if (innerData.isGetting) {
      //   sleep(configStore.sysConfig.CpkInterval || 500).then(() => {
      //     loopGetCpk()
      //   })
      // }
    }

    const loopGetRealTime = () => {
      if (configStore.curChartAdress) {
        callBrige(callFnName.GetRealtimeData, configStore.curChartAdress.GId).then((res: DataValue) => {
          // console.log("🪵 [index.tsx:332] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
          configStore.setCurRealTimeData(res)
        })
      }
      // if (innerData.isGetting) {
      //   sleep(configStore.sysConfig.ColloctInterval || 500).then(() => {
      //     loopGetRealTime()
      //   })
      // }
    }
    const curParamItem = computed(() => {
      let list = configStore.curEnableFormulaParamList
      let item = list?.find(e => e.DataId == configStore.curChartAdress?.GId)
      if (item) {
        commonData.tol.up = item?.Standard * 1 + item?.UpperTol * 1
        commonData.tol.down = item?.Standard * 1 - item?.LowerTol
      }
      return item
    })
    const curPrecision = computed(() => {
      return configStore.curChartAdress?.Precision == undefined ? 3 : configStore.curChartAdress?.Precision
    })
    const valueIsOk = computed(() => {
      curParamItem.value;
      let dat = { ok: false, msg: '' }
      if (realTimeValue.value * 1 >= commonData.tol.down && realTimeValue.value * 1 <= commonData.tol.up) {
        dat.ok = true
        return dat
      } else {
        if (realTimeValue.value * 1 < commonData.tol.down) {
          dat.ok = false
          dat.msg = 'dowm'
          return dat
        }
        if (realTimeValue.value * 1 > commonData.tol.up) {
          dat.ok = false
          dat.msg = 'up'
          return dat
        }
      }
    })
    watch(() => innerData.isGetting, (val) => {
      // console.log("🪵 [index.tsx:330] ~ token ~ \x1b[0;32mval\x1b[0m = ", val);
      if (val) {
        // loopGetCpk()
        // loopGetRealTime()
      }
    }, {
      immediate: true
    })

    const loopGetData = () => {
      if (innerData.isGetting) {
        loopGetCpk()
        loopGetRealTime()
      }
    }
    // const curShowCpkValue = computed(
    //   () => {
    //     if (!innerData.curCpk) return 0
    //     if (innerData.curCpkKey) {
    //       let key = innerData.curCpkKey.name as keyof CpkModel
    //       return innerData.curCpk[key]
    //     } else {
    //       return innerData.curCpk?.Avg
    //     }
    //   }
    // )
    console.log(`curcev create`,);
    const realTimeValue = computed(() => {
      let val = configStore.curRealTimeData?.Value
      if (!val) val = 0
      return val
    })
    onMounted(() => {
      sleep(500).then(() => {
        // console.log("🪵 [index.tsx:395] ~ token ~ \x1b[0;32mconfigStore.sysConfig.ColloctInterval\x1b[0m = ", configStore.sysConfig.ColloctInterval);
        commonData.timerIns = setInterval(() => {
          loopGetData()
        }, configStore.sysConfig.ColloctInterval || 500)
      })

      if (innerData.isFirst) {
        sleep(100).then(() => {
          innerData.setIsFirst(false)
          return refresh()
        })
      } else {
        // return refresh()
      }
      // refresh()
    })
    onBeforeUnmount(() => {
      innerData.addReMounted()
      commonData.getCfgLoading = true
      commonData.timerIns && clearInterval(commonData.timerIns)
    })
    return () => {
      return (
        <div class={'w-full h-full shrink flex flex-col relative'}>
          {/* <CpkBlock /> */}
          <div class={'flex pl-2'}>
            <NSpace align={'center'}>
              <div></div>
              <NDropdown options={commonData.menuOpt} renderLabel={renderLabel} onSelect={handleSelect} trigger="click" placement="bottom-start" size={'large'} class={'text-2xl'} nodeProps={nodeProps} >
                {/* style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }} */}
                <NButton style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }} secondary strong={true} type="default" size={'large'} class={'h-12 w-28 shrink mr-2 '} >   <span class={'text-2xl'}>菜单</span>
                </NButton>
              </NDropdown>
              {/* {innerData.isGetting ?
                <NButton type={'warning'} size={'large'} v-slots={{
                  icon: () => <NIcon><StopCircleOutlined /></NIcon>
                }} onClick={stopCollect} >停止采集</NButton>
                : <NButton type={'primary'} size={'large'} v-slots={{
                  icon: () => <NIcon><PlayArrowOutlined /></NIcon>
                }} onClick={startCollect} >开始采集</NButton>
              } */}

              <NButton style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }} secondary strong={true} onClick={refresh} size={'large'} >刷新配置</NButton>
              {/* <NButton type={'warning'} style={{ backgroundImage: `url(${activeWarningImg})`, backgroundSize: '100% 100%', color: '#534d62' }} secondary strong={true} size={'large'} v-slots={{
                icon: () => false && <NIcon><LayersClearOutlined /></NIcon>
              }} onClick={clearCollect} >清空数据</NButton> */}
              {/* <div class={'flex items-center'} >
                <span class={'text-md w-fit mr-2 flex-shrink-0 '}>产品编号</span>
                <NInput placeholder={''} style={"width: 430px"} value={innerData.curProductCode}></NInput>
              </div> */}
              {/* <div class={'flex items-center'} >
                <span class={'text-md w-fit mr-2'}>起始时间点</span>
                <NDatePicker v-model:value={innerData.startTime} type={'datetime'} />
              </div> */}

              <NormalDis />
              {/* <FFT /> */}

              {/* <div class={'flex items-center'} >
                <span class={'text-md w-fit mr-2'}>最大显示数据量</span>
                <NInputNumber value={innerData.maxDataNum} style={{width:'120px'}} onUpdateValue={(val: number) => {
                  innerData.setMaxDataNum(val)
                }} showButton={false} v-slots={{
                  'suffix': () => <span class={'text-md'}>条</span>
                }} ></NInputNumber>
              </div> */}
            </NSpace>

            {/* < NDropdown options={computeOption.value} trigger="click" placement="bottom-start" onSelect={handleMenuSelect} size={'large'} class={'text-2xl'}  nodeProps={commonData.dropDowmProps} >
              <NButton strong={true} type="primary" secondary size={'large'} class={'h-12 w-28 shrink mr-2 '} style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }}
              >
                <span class={'text-2xl'}>菜单</span>
              </NButton>
            </NDropdown > */}
            <div class='ml-auto  h-16' >
              {/* <NSpace>
                {nextShow.value && <NButton onClick={nextPage} size={'large'} >上一页</NButton>}
                {prevShow.value && <NButton onClick={prevPage} size={'large'} >下一页</NButton>}

              </NSpace> */}
              <img class={'h-full'} src={niotLogo} />

            </div>
          </div>
          {innerData.curDataCfgEntity && <CpkBlock dataConfig={innerData.curDataCfgEntity} />}
          {
            // curDataType.value == DataTypeEnum.Chart 
            true
            &&
            <>
              <div class={'h-[360px] pb-2 px-2 relative'}>

                <div class={'h-full border-1 border-solid border-[#e4e4e5] shadow-inner flex'}>
                  <div class={'w-full h-full shrink py-1 px-2 flex justify-end items-center relative'}>
                    {
                      !valueIsOk.value?.ok &&
                      <div class={' absolute top-0 left-2  text-2xl ' + classNames({
                        'text-[#ff0000]': !valueIsOk.value?.ok && valueIsOk.value?.msg == 'dowm',
                        'text-[#ff8d3f]': !valueIsOk.value?.ok && valueIsOk.value?.msg == 'up'
                      })}>
                        {valueIsOk.value?.msg == 'dowm' ? '- 公差' : '+ 公差'}
                      </div>
                    }

                    <div class={'absolute top-2 right-2  text-lg'}>

                      {/* <NSpace>

                        <div>
                          <span class={'text-gray-500 mr-2'}>上限</span>
                          <span class={"text-blue-500"}>{configStore.curCpk?.UpperLimit.toFixed(curPrecision.value)}</span>
                        </div>
                        <div>
                          <span class={'text-gray-500 mr-2'}>下限</span>
                          <span class={"text-blue-500"}>{configStore.curCpk?.LowerLimit.toFixed(curPrecision.value)}</span>
                        </div>

                        <div>
                          <span class={'text-gray-500 mr-2'}>标准值</span>
                          <span class={"text-blue-500"}>{configStore.curCpk?.Standard.toFixed(curPrecision.value)}</span>
                        </div>
                        <div>
                          <span class={'text-gray-500 mr-2'}>标准差</span>
                          <span class={"text-blue-500"}>{configStore.curCpk?.StdDev.toFixed(curPrecision.value)}</span>
                        </div>
                        <div>
                          <span class={'text-gray-500 mr-2'}>CP</span>
                          <span class={"text-blue-500"}>{configStore.curCpk?.CP.toFixed(curPrecision.value)}</span>
                        </div>
                        <div>
                          <span class={'text-gray-500 mr-2'}>CA</span>
                          <span class={"text-blue-500"}>{configStore.curCpk?.CA.toFixed(curPrecision.value)}</span>
                        </div>
                        <div>
                          <span class={'text-gray-500 mr-2'}>CPK</span>
                          <span class={"text-blue-500"}>{configStore.curCpk?.CPK.toFixed(curPrecision.value)}</span>
                        </div>

                      </NSpace> */}
                    </div>
                    {/* <span class={'text-[#013b63] font-semibold'} style={{ fontSize: store.isLowRes ? '12rem' : '16rem' }} >{curShowCpkValue.value.toFixed(6)}</span> */}
                    <span class={' font-semibold value-number ' + classNames({
                      'text-[#003a62]': valueIsOk.value?.ok,
                      'text-[#ff0000]': !valueIsOk.value?.ok && valueIsOk.value?.msg == 'dowm',
                      'text-[#ff8d3f]': !valueIsOk.value?.ok && valueIsOk.value?.msg == 'up'
                    })} style={{ fontSize: store.isLowRes ? '8rem' : '12rem' }} >{realTimeValue.value.toFixed(mainFixNum.value)}</span>

                  </div>
                  <div class={' grow p-2 h-full flex flex-col relative'} style={{ backgroundImage: `linear-gradient(#cdcdcd, #f2f2f2 ,#cdcdcd)` }}>
                    {/* <div class={'absolute top-2 right-2'}>
                <NTooltip v-slots={{
                  trigger: () => <NIcon class={'text-lg'}><InfoOutlined /></NIcon>
                }}>
                    CPK需要等待采集一段时间才会有数据
                </NTooltip>
              </div> */}
                    <span class={'mt-auto mb-[6vh] text-5xl font-bold text-[#5e5452]'}>{configStore.curChartAdress?.Unit}</span>
                  </div>
                </div>
              </div>
              {
                configStore.curChartAdress &&
                <CurcevChartRow height="50%" i={0} adressRow={configStore.curChartAdress} ref={chartRef} />
              }
            </>
          }
          {curDataType.value == DataTypeEnum.FFT && <FFT />}



          {/* <div class={'h-full pb-2 overflow-hidden flex-shrink'}>
            <div class={'w-full h-full'}>
              {commonData.cfgDataList.slice(commonData.curPage * commonData.pageSize, (commonData.curPage + 1) * commonData.pageSize).map((e: DataConfigEntity, i) => {
                return <CurcevChartRow i={i} dataSourceItem={{
                  "label": "直径(平均值)",
                  "key": "avg",
                  "parent": "diameter1"
                }} dataConfig={e} />
              })}
            </div>
          </div> */}
        </div>
      )
    }
  }

})