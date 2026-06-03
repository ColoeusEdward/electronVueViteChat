import { NTabs, NTabPane, NPopselect, NButton, NIcon, useDialog, DialogReactive, NRadioGroup, NRadio, DropdownMenuProps, } from "naive-ui";
import type { DropdownProps } from 'naive-ui'
import { defineComponent, onUnmounted, ref, computed, reactive, watch } from "vue";
import { Tool } from '@vicons/tabler'
import { CandlestickChartRound, AreaChartOutlined, LocalPrintshopFilled, HistoryOutlined } from '@vicons/material'
import PopBtnComp from "@/components/PopBtnComp/PopBtnComp";
import activeImg from '@/assets/LineDspButton_inactive.png'
import { useConfigStore } from "@/store/config";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { callBrige } from "@/utils/callm";
import { useCurcevInnerDataStore } from "./curcev/innerData";
import { useFormulaStore } from "@/store/formula";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import { useI18n } from 'vue-i18n'
import { usei18nStore } from "@/store/i18n";
import { MyLangStr } from "~/me";
import { DropdownMixedOption } from "naive-ui/es/dropdown/src/interface";
const TimeBlock = defineComponent({
  name: 'TimeBlock',
  setup() {
    const nowTime = ref(new Date().toLocaleString());
    const interval = setInterval(() => {
      nowTime.value = new Date().toLocaleString();
    }, 1000);
    onUnmounted(() => {
      clearInterval(interval);
    })
    return () => {
      return (
        <NButton secondary strong={true} type="primary" size={'large'} class={'h-16 w-full shrink mr-2 flex-1'} style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }} >
          <span class={'text-xl'}>{
            nowTime.value
          }</span>
        </NButton>
      )
    }
  }
})



export default defineComponent({
  name: 'BtmBtn',  //底部按钮栏
  setup(props) {
    const curCevInnerData = useCurcevInnerDataStore()
    const configStore = useConfigStore()
    const formulaStore = useFormulaStore()
    const dialog = useDialog()
    const i18nStore = usei18nStore()
    const { t } = useI18n()
    const sysConfig = computed(() => configStore.sysConfig)
    const alldata = reactive({
      curDialogIns: null as DialogReactive | null,
      curSubmitFn: () => { },
      exitChooseList: [{
        label: '退出应用',
        key: 'shutdownApp',
      },
      {
        label: '重启应用',
        key: 'restartApp',
      },
      {
        label: '关机',
        key: 'shutdown',
      }],
      curExitType: 'shutdownApp',
      trandChartStart: false
    })
    const maintainOption = ref<DropdownMixedOption[]>([])
    const productOption = ref<DropdownMixedOption[]>([])
    const chartOption = [
      { label: '配方配置', key: 'formulaCfg' },
    ]
    const screenPrintOption = ref<DropdownMixedOption[]>([])
    const maintainOption2 = ref<DropdownMixedOption[]>([
      { label: '配置', key: 'option' },
      // { label: '关机', key: 'shutdown' },
      { label: 'Reload', key: 'Reload' },
      { label: '开发者工具', key: 'devTool' },
    ])
    const maintainOption3 = ref<DropdownMixedOption[]>([])
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
            title: '退出选项',
            content: () => {
              return <div class={'exit-menu min-h-[170px] h-full relative flex flex-col items-center justify-center'}>
                <NRadioGroup class={"h-full"} style={{
                  height: '200px',
                }} v-model:value={alldata.curExitType} size={'large'} >
                  {
                    alldata.exitChooseList.map((item) => {
                      return <NRadio value={item.value}>{item.label}</NRadio>
                    })
                  }
                </NRadioGroup>
              </div>
            },
            style: { width: '400px', minHeight: '200px', },
            action: () => {
              return <div class={'flex justify-around items-center w-full'}>
                <NButton style={{ width: '45%', height: '40px', fontSize: '22px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { alldata.curDialogIns?.destroy() }}>取消</NButton>
                <NButton style={{ width: '45%', height: '40px', fontSize: '22px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
                  shutdownConfirm()
                }}>确定</NButton>
              </div>
            },
            positiveText: '确定',
            negativeText: '取消',
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
          let item = popSelectList.value[2]
          alldata.trandChartStart = true
          item.name =
            curCevInnerData.startColFn && curCevInnerData.startColFn()
        },
        collectStop: () => {
          let item = popSelectList.value[2]
          alldata.trandChartStart = false
          item.name = `${t('menu.trendChart')}(${t('menu.stopChart')})`
          curCevInnerData.stopColFn && curCevInnerData.stopColFn()
        },
        collectClean: () => {
          curCevInnerData.cleanColFn && curCevInnerData.cleanColFn()

        },
        shaftCollect: () => {
          if (!curCevInnerData.isGetting) {
            window.$message.warning('请先开始采集')
            return
          }
          curCevInnerData.shaftColFn && curCevInnerData.shaftColFn()
        },
        formulaCfg: () => {
          // console.log("🪵 [BtmBtn.tsx:120] ~ token ~ \x1b[0;32mformulaStore\x1b[0m = ", formulaStore);
          if (sysConfig.value.CurrentGroupId) {
            formulaStore.setFormulaShow(true)
          } else {
            dialog.warning({ title: '提示', content: '请先前往配置页面应用分组', positiveText: '确定' })
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
    const getData = () => {
      maintainOption.value = [
        { label: t('menu.config'), key: 'option' },
        { label: t('menu.log'), key: 'log' },
        // { label: '诊断程序', key: 'diag' },
        {
          label: t('menu.lang'), key: 'lang', props: { "class": 'btm-menu-2level' },
          children: [
            { label: '简体中文', key: 'lang-' + 'zh-CN' },
            { label: 'English', key: 'lang-' + 'en-US' },
          ]
        },
        // { label: '趋势图/打印机', key: 'chartAndprint' },
        { label: t('menu.exit'), key: 'shutdown' },
        // { label: '组态test', key: 'datav' },
        // { label: '检查元素', key: 'devTool' },
      ]
      productOption.value = [
        { label: t('menu.recipe'), key: 'formulaCfg' },
        // { label: '产品历史记录', key: 'productHistory' },
        // { label: '产品日志', key: 'productLog' },
        // { label: '设定产品表', key: 'setproduct' },
      ]
      maintainOption3.value = [
        { label: t('menu.start'), key: 'collectStart' },
        { label: t('menu.stop'), key: 'collectStop' },
        { label: t('menu.switchShaft'), key: 'shaftCollect' },
        { label: t('menu.cleanData'), key: 'collectClean' },
      ]
      screenPrintOption.value = [
        { label: t('menu.startPrint'), key: 'screenPrint' },
        // { label: '打印机打印', value: 'printerPrint' },
      ]
    }
    getData()

    const trendChartBtnText = computed(() => {
      return alldata.trandChartStart ? `${t('menu.trendChart')}(${t('menu.startChart')})` : `${t('menu.trendChart')}(${t('menu.stopChart')})`
    })

    const popSelectList = computed(() => {
      let test = compKey.value
      getData()
      //@ts-ignore
      return [
        { option: maintainOption.value, name: t('menu.maintain'), icon: <Tool /> },
        { option: productOption.value, name: t('menu.prodTable'), icon: <CandlestickChartRound /> },
        // { option: chartOption, name: '配方', icon: <AreaChartOutlined /> },
        { option: maintainOption3.value, name: trendChartBtnText.value, icon: <AreaChartOutlined /> },
        { option: screenPrintOption.value, name: t('menu.printScreen'), icon: <LocalPrintshopFilled /> },
        { option: [] as DropdownMixedOption[], name: t('menu.prodHistory'), icon: <HistoryOutlined />, clickFn: () => { configStore.setProductHistoryShow(true) } },
      ]
    })
    return () => {
      return (
        <div class={'w-full h-24 mt-auto  flex items-center  px-2 '}  >
          {popSelectList.value.map((item, index) => {
            console.log("🪵 [BtmBtn.tsx:287] ~ token ~ \x1b[0;32mitem\x1b[0m = ", item);
            return (
              //@ts-ignore
              <PopBtnComp key={compKey.value + index} clickFn={item.clickFn} disabled={!!item.clickFn} name={item.name} options={item.option} onSelect={handleOptClick}
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