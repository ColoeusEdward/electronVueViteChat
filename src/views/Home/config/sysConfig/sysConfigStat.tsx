import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { useConfigStore } from "@/store/config";
import { callSpc, chooseFolder, getPrinterList, getSysConfig, } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { showKeyBoard } from "@/utils/utils";
import { NButton, NDialogProvider, NModal, NScrollbar, NTag, useMessage } from "naive-ui";
import { mapState } from "pinia";
import { computed, defineComponent, onMounted, reactive, ref, watch } from "vue";
import { ActualResult, SysConfigEntity, SysConfigModel } from "~/me";
import AcCode from "./AcCode";
import { formDivideStyle, noKeyBoardInputClass, optionMap } from "./enum";
import SerialNoRule from "./SerialNoRule";

export default defineComponent({
  name: 'SysConfig',
  setup(props, ctx) {
    getSysConfig()
    const myFormRef = ref<MyFormWrapIns>()
    const configStore = useConfigStore()
    const loading = ref(false)
    const msg = useMessage()
    const alldata = reactive({
      cfgData: {} as SysConfigModel
    })
    const cfgData = computed(() => {
      return configStore.sysConfig
    })
    watch(() => cfgData.value, () => {
      alldata.cfgData = { ...cfgData.value }
    }, {
      immediate: true
    })
    // .then(() => {
    //   cfgData = reactive({
    //     ...configStore.sysConfig
    //   })
    // })
    const formOpt = reactive({
      optionMap: optionMap,
      itemList: [

        {
          type: 'box', label: '', width: 24, childCompList: [
            { type: 'divider', label: '统计报表', width: 24 },
            { type: 'switch', label: '允许实时数据导出', prop: 'EnableExportReal', checkedValue: 1, uncheckedValue: 0, defaultValue: 0, width: 12, },
            // { type: 'select', label: '报表文件类型', prop: 'ExportRealType', width: 12 },
            { type: 'switch', label: '允许统计数据导出', prop: 'EnableExportStati', checkedValue: 1, uncheckedValue: 0, defaultValue: 0, width: 12, suffix: 'ms' },
            // { type: 'select', label: '曲线文件类型', prop: 'ExportStatiType', width: 12 },
            {
              type: 'input', label: '导出路径', prop: 'ExportPath', class: noKeyBoardInputClass, width: 12, suffix: () => {
                return <label onClick={(e) => {
                  e.stopImmediatePropagation()
                  e.stopPropagation()
                  e.preventDefault()
                  chooseFolder().then((e) => {
                    e && (alldata.cfgData.ExportPath = e)
                  })
                }} class={'z-50 relative -right-2'} >
                  <NTag bordered={false} >选择目录</NTag>
                </label>
              }
            },
            // { type: 'text', },
            { type: 'switch', label: '允许打印统计数据', prop: 'EnablePrintStati', checkedValue: 1, uncheckedValue: 0, defaultValue: 0, width: 12, },
            { type: 'select', label: '使用的打印机', prop: 'ReportPrinter', width: 12 },
          ]
        },
        // {
        //   type: 'box', label: '', width: 24, childCompList: [
        //     { type: 'divider', label: '编码规则', width: 24 },
        //     {
        //       type: 'free', label: '编码规则', renderComp: () => {
        //         return <SerialNoRule />
        //       }, width: 24
        //     },
        //   ]
        // },

      ] as formListItem[]
    })
    formOpt.itemList = formOpt.itemList.map((e) => {
      if (e.type == 'divider') {
        e.style = formDivideStyle
      }
      return e
    })
    const submit = () => {
      loading.value = true
      // let oriSysConfig = configStore.originSysConfig
      // Object.keys(cfgData.value).map(e => {
      //   oriSysConfig.find(e1 => {
      //     if (e1.Name == e) {
      //       e1.Value = cfgData.value[e]
      //     }
      //   })
      // })
      // console.log("🪵 [index.tsx:124] ~ token ~ \x1b[0;32moriSysConfig\x1b[0m = ", oriSysConfig);
      console.log("🪵 [index.tsx:134] ~ token ~ \x1b[0;32malldata.cfgData\x1b[0m = ", alldata.cfgData);
      callBrige(callFnName.SaveSysConfig, alldata.cfgData)
        .then((e: number) => {
          msg.success('保存完成')
          configStore.setSysConfig(alldata.cfgData)
        }).finally(() => {
          loading.value = false
        })
    }
    const getPrinter = () => {
      getPrinterList().then(e => {
        formOpt.optionMap.ReportPrinter = e.map(e => {
          return {
            label: e,
            value: e
          }
        })
      })
    }
    getPrinter()
    watch(() => configStore.allSubmitCount, (val) => {
      myFormRef.value?.submit(submit)
    })
    watch(() => configStore.configTab, (val) => {
      getSysConfig()
    }, {
      immediate: true
    })
    watch(() => cfgData.value.InputType, (val) => {
      // if (val == "True") {
      //   // showKeyBoard()
      // }
    })

    onMounted(() => {
      // callSpc(callFnName.initKeyboardConfig)

    })
    //height:50px;width:20vw;font-size:22px
    // class={'relative -right-2'} tertiary size={'small'} onClick={() => {
    //   fileInput.value && fileInput.value.click()
    // }} 
    //for={'sysConfigFileInput'}
    return () => {
      return (

        // <NScrollbar class={'w-full h-full relative'} >

        <div class={'w-full h-full  overflow-x-hidden -top-5 px-4 text-lg bg-[#f5f6f6] '} style={{ height: 'calc(100% + 20px)' }}>
          <MyFormWrap class={'limit-item-width-form'} labelWidth={180} ref={myFormRef} form={alldata.cfgData} optionMap={formOpt.optionMap} hideBtn={true} itemList={formOpt.itemList} submitFn={submit} btnStyleStr={'margin-right:50px;margin-bottom:10px;'} loading={loading.value} />
        </div>
        // </NScrollbar>

      )
    }
  }

})