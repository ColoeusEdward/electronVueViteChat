import { NButton, useDialog, DialogReactive, NRadioGroup, NRadio } from "naive-ui";
import type { DropdownProps } from 'naive-ui'
import { defineComponent, onUnmounted, ref, computed, reactive, watch, PropType } from "vue";
import { Tool } from '@vicons/tabler'
import { CandlestickChartRound, AreaChartOutlined, LocalPrintshopFilled, HistoryOutlined } from '@vicons/material'
import PopBtnComp from "@/components/PopBtnComp/PopBtnComp";
import activeImg from '@/assets/LineDspButton_inactive.png'
import { useConfigStore } from "@/store/config";
import { callFnName } from "@/utils/enum";
import { callBrige } from "@/utils/callm";
import { useCurcevInnerDataStore } from "./curcev/innerData";
import { useFormulaStore } from "@/store/formula";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import { usei18nStore } from "@/store/i18n";
import { DataGroupEntity, DeviceGroupEntity, MyLangStr } from "~/me";
import { DropdownMixedOption } from "naive-ui/es/dropdown/src/interface";
import { useMyI18n } from "@/hooks/useMyI18n";
import { sleep } from "@/utils/utils";
import classNames from "classnames";
import { useMain } from "@/store";

type ExportImageMessage = {
  Id: string
  ProductNo: string
  ChartType: 0 | 1
  Chart: string
}

const TimeBlock = defineComponent({
  name: 'TimeBlock',
  setup() {
    const store = useMain()
    const nowTime = ref(new Date().toLocaleString());
    const interval = setInterval(() => {
      nowTime.value = new Date().toLocaleString();
    }, 1000);
    onUnmounted(() => {
      clearInterval(interval);
    })
    return () => {
      return (
        <div class={'shrink '}>
          <NButton secondary strong={true} type="primary" size={'large'} class={'h-16 w-full p-0  ' + classNames({ ' px-4': store.isLandscape, "px-1": !store.isLandscape })} style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }} >
            <span class={'' + classNames({ 'text-xl': store.isLandscape, "text-lg": !store.isLandscape })}>{
              nowTime.value
            }</span>
          </NButton>
        </div>

      )
    }
  }
})



export default defineComponent({
  name: 'BtmBtn',  //底部按钮栏
  props: {
    setStopTrendLoading: Function as PropType<(value: boolean) => void>
  },
  setup(props) {
    const curCevInnerData = useCurcevInnerDataStore()
    const configStore = useConfigStore()
    const formulaStore = useFormulaStore()
    const dialog = useDialog()
    const { t, i18nStore } = useMyI18n()
    const sysConfig = computed(() => configStore.sysConfig)
    const alldata = reactive({
      curDialogIns: null as DialogReactive | null,
      curSubmitFn: () => { },
      exitChooseList: [{
        label: t('config.exitApplication'),
        key: 'shutdownApp',
      },
      {
        label: t('config.restartApplication'),
        key: 'restartApp',
      },
      {
        label: t('config.shutdown'),
        key: 'shutdown',
      }],
      curExitType: 'shutdownApp',
      trandChartStart: false
    })

    const getChartDataGroupsForExport = async () => {
      const currentGroupId = sysConfig.value.CurrentGroupId
      if (!currentGroupId) {
        return [] as DataGroupEntity[]
      }

      const deviceGroups = await callBrige(callFnName.GetDeviceGroups, currentGroupId) as DeviceGroupEntity[] | undefined
      if (!deviceGroups?.length) {
        return [] as DataGroupEntity[]
      }

      const dataGroupResults = await Promise.all(
        deviceGroups
          .map(item => item.GId)
          .filter((id): id is string => !!id)
          .map(id => callBrige(callFnName.GetChartDataGroups, id) as Promise<DataGroupEntity[] | undefined>)
      )

      const dataGroupMap = new Map<string, DataGroupEntity>()
      dataGroupResults.forEach(list => {
        list?.forEach(item => {
          if (item.GId) {
            dataGroupMap.set(item.GId, item)
          }
        })
      })

      return Array.from(dataGroupMap.values())
    }

    const buildExportImageMessages = async () => {
      const productNo = (await callBrige(callFnName.GetSerialNo) as string | undefined) || curCevInnerData.curProductCode || ''
      const dataGroups = await getChartDataGroupsForExport()
      const exportImages: ExportImageMessage[] = []

      for (const dataGroup of dataGroups) {
        const dataGroupId = dataGroup.GId
        if (!dataGroupId) {
          continue
        }

        const realtimeChart = await window.exportRealtime({ id: dataGroupId, dataGroup })
        if (realtimeChart) {
          exportImages.push({
            Id: dataGroupId,
            ProductNo: productNo,
            ChartType: 0,
            Chart: realtimeChart
          })
        }

        const distributionChart = await window.exportDistribution({ id: dataGroupId, dataGroup })
        if (distributionChart) {
          exportImages.push({
            Id: dataGroupId,
            ProductNo: productNo,
            ChartType: 1,
            Chart: distributionChart
          })
        }
      }

      return exportImages
    }

    const stopTrendCollection = async () => {
      if (!alldata.trandChartStart) {
        return
      }

      props.setStopTrendLoading?.(true)
      await sleep(0)

      try {
        const exportImages = await buildExportImageMessages()
        console.log("🪵 [BtmBtn.tsx:162] ~ token ~ \x1b[0;32mexportImages\x1b[0m = ", exportImages);
        if (exportImages.length > 0) {
          await callBrige(callFnName.SaveExportImage, JSON.stringify(exportImages))
        }
      } catch (err) {
        console.error('collectStop export images failed', err)
      } finally {
        props.setStopTrendLoading?.(false)
        alldata.trandChartStart = false
        curCevInnerData.stopColFn && curCevInnerData.stopColFn()
      }
    }

    // 语言切换时更新 exitChooseList 中的标签
    watch(() => i18nStore.langChangeCount, () => {
      sleep(100).then(() => {
        alldata.exitChooseList[0].label = t('config.exitApplication')
        alldata.exitChooseList[1].label = t('config.restartApplication')
        alldata.exitChooseList[2].label = t('config.shutdown')
      })

    })

    const shutdownConfirm = () => {
      let exitMapFn: Record<string, () => void> = {
        shutdownApp: () => {
          callBrige(callFnName.CloseApp, `true`).then(() => {
          })
        },
        restartApp: () => {
          callBrige(callFnName.RestartApp, `true`).then(() => {
          })
        },
        shutdown: () => {
          callBrige(callFnName.ShutdownPc, `true`).then(() => {
          })
        }
      }
      exitMapFn[alldata.curExitType] && exitMapFn[alldata.curExitType]()
    }
    const handleOptClick: DropdownProps['onSelect'] = (value: string) => {
      let valueMap: Record<string, () => void> = {
        option: () => {
          configStore.setIsShowConfig(true)
        },
        datav: () => {
          window.open('datav/index.html')
        },
        shutdown: () => {
          // callBrige(callFnName.CloseApp, `true`).then(() => {
          // })
          alldata.curDialogIns = dialog.create({
            title: t('config.exitOptions'),
            content: () => {
              return <div class={'exit-menu min-h-[170px] h-full relative flex flex-col items-center justify-center'}>
                <NRadioGroup class={"h-full"} style={{
                  height: '200px',
                }} v-model:value={alldata.curExitType} size={'large'} >
                  {
                    alldata.exitChooseList.map((item) => {
                      return <NRadio value={item.key}>{item.label}</NRadio>
                    })
                  }
                </NRadioGroup>
              </div>
            },
            style: { width: '400px', minHeight: '200px', },
            action: () => {
              return <div class={'flex justify-around items-center w-full'}>
                <NButton style={{ width: '45%', height: '40px', fontSize: '22px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { alldata.curDialogIns?.destroy() }}>{t('config.cancel')}</NButton>
                <NButton style={{ width: '45%', height: '40px', fontSize: '22px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
                  shutdownConfirm()
                }}>{t('config.confirm')}</NButton>
              </div>
            },
            positiveText: t('config.confirm'),
            negativeText: t('config.cancel'),
            maskClosable: true,
            onPositiveClick: () => {
            },
            onNegativeClick: () => {
            },
            onClose: () => {
              // ctx.emit('update:show', false) 
            },
            onMaskClick: () => {
              // hideForm()
              return false
            }
            // onAfterLeave: () => {
            //   changeShow()
            // }
          })
        },
        Reload: () => {
          window.location.reload()
        },
        productHistory: () => {
          configStore.setProductHistoryShow(true)
        },
        productLog: () => {
          configStore.setProductLogShow(true)
        },
        // formulaCfg: () => {
        //   configStore.setFormulaCfgShow(true)
        // },
        devTool: () => {
          // callSpc(callFnName.openDevTool).then(() => {
          // })
        },
        collectStart: () => {
          alldata.trandChartStart = true
          curCevInnerData.startColFn && curCevInnerData.startColFn()
        },
        collectStop: () => {
          stopTrendCollection()
        },
        collectClean: () => {
          curCevInnerData.cleanColFn && curCevInnerData.cleanColFn()

        },
        shaftCollect: async () => {
          if (!curCevInnerData.isGetting) {
            window.$message.warning(t('config.pleaseStartCollecting'))
            return
          }
          props.setStopTrendLoading?.(true)
          await sleep(0)
          try {
            const exportImages = await buildExportImageMessages()
            if (exportImages.length > 0) {
              await callBrige(callFnName.SaveExportImage, JSON.stringify(exportImages))
            }
            curCevInnerData.shaftColFn && await curCevInnerData.shaftColFn()
          } catch (err) {
            console.error('shaftCollect export images failed', err)
          } finally {
            props.setStopTrendLoading?.(false)
          }
        },
        formulaCfg: () => {
          // console.log("🪵 [BtmBtn.tsx:120] ~ token ~ \x1b[0;32mformulaStore\x1b[0m = ", formulaStore);
          if (sysConfig.value.CurrentGroupId) {
            formulaStore.setFormulaShow(true)
          } else {
            dialog.warning({ title: t('config.prompt'), content: t('config.pleaseApplyGroupInConfig'), positiveText: t('config.confirm') })
            // window.$message.warning('请先前往配置页面应用分组')
          }
        }
        // devTool: () => {
        //   window.ipc.send('devTools','open')
        // }
      }
      if (value.search('lang') > -1) {
        handleLang(value)
      } else {
        valueMap[value] && valueMap[value]()
      }

    }
    const handleLang = (str: string) => {
      let list = str.split('-')
      list.shift()
      let st = list.join('-')
      console.log("🪵 [BtmBtn.tsx:240] ~ token ~ \x1b[0;32mst\x1b[0m = ", st);
      if (!st) return
      i18nStore.setLanguage(st as MyLangStr)
      return st
    }

    const compKey = computed(() => {
      return 'BtmBtn' + i18nStore.langChangeCount
    })

    //@ts-ignore
    // const popSelectList = ref<{ option: DropdownMixedOption[], name: string, icon?: JSX.Element, clickFn?: () => void }[]>([
    //   { option: maintainOption.value, name: '维护', icon: <Tool /> },
    //   { option: productOption, name: '产品表', icon: <CandlestickChartRound /> },
    //   // { option: chartOption, name: '配方', icon: <AreaChartOutlined /> },
    //   { option: maintainOption3.value, name: '趋势图(关)', icon: <AreaChartOutlined /> },
    //   { option: screenPrintOption, name: '屏幕打印', icon: <LocalPrintshopFilled /> },
    //   { option: [] as DropdownMixedOption[], name: '产品历史', icon: <HistoryOutlined />, clickFn: () => { configStore.setProductHistoryShow(true) } },
    //   // { option: maintainOption2.value, name: 'test', icon: <LocalPrintshopFilled /> },
    // ])
    const trendChartBtnText = computed(() => {
      return alldata.trandChartStart ? `(${t('menu.startChart')})${t('menu.trendChart')}` : `(${t('menu.stopChart')})${t('menu.trendChart')}`
    })

    const popSelectList = computed(() => {
      // 强制依赖 langChangeCount 以在语言切换时重新计算
      const _ = i18nStore.langChangeCount
      //@ts-ignore
      return [
        {
          option: [
            { label: t('menu.config'), key: 'option' },
            { label: t('menu.log'), key: 'log' },
            {
              label: t('menu.lang'), key: 'lang', props: { "class": 'btm-menu-2level' },
              children: [
                { label: '简体中文', key: 'lang-' + 'zh-CN' },
                { label: 'English', key: 'lang-' + 'en-US' },
                { label: 'Tiếng Việt', key: 'lang-' + 'vi-VN' },
                { label: 'Español', key: 'lang-' + 'es-ES' },
              ]
            },
            { label: t('menu.exit'), key: 'shutdown' },
          ],
          name: t('menu.maintain'),
          icon: <Tool />
        },
        {
          option: [
            { label: t('menu.recipe'), key: 'formulaCfg' },
          ],
          name: t('menu.prodTable'),
          icon: <CandlestickChartRound />
        },
        {
          option: [
            { label: t('menu.start'), key: 'collectStart' },
            { label: t('menu.stop'), key: 'collectStop' },
            { label: t('menu.switchShaft'), key: 'shaftCollect' },
            { label: t('menu.cleanData'), key: 'collectClean' },
          ],
          name: trendChartBtnText.value,
          icon: <AreaChartOutlined />
        },
        {
          option: [
            { label: t('menu.startPrint'), key: 'screenPrint' },
          ],
          name: t('menu.printScreen'),
          icon: <LocalPrintshopFilled />
        },
        {
          option: [],
          name: t('menu.prodHistory'),
          icon: <HistoryOutlined />,
          clickFn: () => { configStore.setProductHistoryShow(true) }
        },
      ]
    })
    return () => {
      return (
        <div class={'w-full h-24 mt-auto  flex items-center px-2 flex-1 pb-2  '}  >
          {popSelectList.value.map((item, index) => {
            return (
              //@ts-ignore
              <PopBtnComp clickFn={item.clickFn} disabled={!!item.clickFn} name={item.name} floatLabel={item.floatLabel} options={item.option} onSelect={handleOptClick}
                v-slots={{
                  //@ts-ignore
                  icon: () => {
                    return item.icon
                  }
                }}
              />
            )
          })}
          <TimeBlock />
        </div>
      )
    }
  }

})
