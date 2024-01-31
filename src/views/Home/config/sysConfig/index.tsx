import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { useConfigStore } from "@/store/config";
import { callSpc, chooseFolder, getPrinterList, getSysConfig, } from "@/utils/call";
import { NButton, NScrollbar, NTag, useMessage } from "naive-ui";
import { mapState } from "pinia";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { ActualResult } from "~/me";
import { formDivideStyle, optionMap } from "./enum";
import SerialNoRule from "./SerialNoRule";

export default defineComponent({
  name: 'SysConfig',
  setup(props, ctx) {
    getSysConfig()

    const configStore = useConfigStore()
    const loading = ref(false)
    const msg = useMessage()
    const cfgData = computed(() => {
      return configStore.sysConfig
    })
    // .then(() => {
    //   cfgData = reactive({
    //     ...configStore.sysConfig
    //   })
    // })
    const formOpt = reactive({
      optionMap: optionMap,
      itemList: [
        { type: 'divider', label: '设备信息', width: 24 },
        { type: 'input', label: '公司名称', prop: 'CompanyName', width: 12 },
        { type: 'input', label: '设备编号', prop: 'MachineCode', width: 12 },
        { type: 'divider', label: '数据展示', width: 24 },
        { type: 'select', label: '默认小数位数', prop: 'Precision', width: 12 },
        { type: 'select', label: '单屏曲线数量', prop: 'MaxChartNum', width: 12 },
        { type: 'input', label: '统计最小点数', prop: 'CpkMinPonitNum', width: 12 },
        { type: 'input', label: '统计数据周期', prop: 'CpkInterval', width: 12, suffix: 'ms' },
        { type: 'input', label: '图形刷新周期', prop: 'RefreshInterval', width: 12, suffix: 'ms' },
        { type: 'input', label: '最大显示点数', prop: 'MaxPonitNum', width: 12 },
        { type: 'divider', label: '数据采集', width: 24 },
        { type: 'input', label: '控制信号间隔', prop: 'ControlInterval', width: 12, suffix: 'ms' },
        { type: 'input', label: '数据采集间隔', prop: 'ColloctInterval', width: 12, suffix: 'ms' },
        { type: 'input', label: '报警信号间隔', prop: 'AlarmInterval', width: 12, suffix: 'ms' },
        { type: 'switch', label: '报警信息写入数据库', prop: 'AlarmToDb', width: 12,checkedValue: '1', uncheckedValue: '0', },
        { type: 'divider', label: '统计报表', width: 24 },
        { type: 'switch', label: '导出实时数据', prop: 'EnableExportReal', checkedValue: 'True', uncheckedValue: 'False', defaultValue: 'False', width: 12, },
        // { type: 'select', label: '报表文件类型', prop: 'ExportRealType', width: 12 },
        { type: 'switch', label: '导出趋势曲线', prop: 'EnableExportStati', checkedValue: 'True', uncheckedValue: 'False', defaultValue: 'False', width: 12, suffix: 'ms' },
        // { type: 'select', label: '曲线文件类型', prop: 'ExportStatiType', width: 12 },
        {
          type: 'input', label: '导出路径', prop: 'ExportPath', width: 12, suffix: () => {
            return <label onClick={() => {
              chooseFolder().then((e) => {
                e && (cfgData.value.ExportPath = e)
              })
            }} class={'z-50 relative -right-2'} >
              <NTag bordered={false} >选择目录</NTag>
            </label>
          }
        },
        { type: 'text', },
        { type: 'switch', label: '打印统计数据', prop: 'EnablePrintStati', checkedValue: 'True', uncheckedValue: 'False', defaultValue: 'False', width: 12, },
        { type: 'select', label: '使用的打印机', prop: 'ReportPrinter', width: 12 },
        { type: 'divider', label: '编码规则', width: 24 },
        { type: 'free', label: '编码规则', renderComp:() => {
          return <SerialNoRule />
        }, width: 24 },

        { type: 'divider', label: '其他配置', width: 24 },
        { type: 'input', label: '激活码', prop: 'Cdkey', width: 12 },
        // { type: 'free', label: '激活码', renderComp:() => {
        //   return <SerialNoRule />
        // }, width: 12 },
        { type: 'switch', label: '触控键盘输入', prop: 'InputType', checkedValue: 'True', uncheckedValue: 'False', defaultValue: 'True', width: 12, suffix: 'ms' },
        { type: 'text', label: '软件版本', prop: 'Version', text: '1.0.0', width: 24 },

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
      let oriSysConfig = configStore.originSysConfig
      Object.keys(cfgData.value).map(e => {
        oriSysConfig.find(e1 => {
          if (e1.Name == e) {
            e1.Value = cfgData.value[e]
          }
        })
      })
      callSpc(window.spcJsBind.saveSysConfigs([...oriSysConfig]))
      .then((e:number) => {
        if(e>0){
          msg.success('保存成功')
        }
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





    onMounted(() => {
    })
    //height:50px;width:20vw;font-size:22px
    // class={'relative -right-2'} tertiary size={'small'} onClick={() => {
    //   fileInput.value && fileInput.value.click()
    // }} 
    //for={'sysConfigFileInput'}
    return () => {
      return (

        // <NScrollbar class={'w-full h-full relative'} >

        <div class={'w-full h-full  overflow-x-hidden -top-5 px-2 '} style={{ height: 'calc(100% + 20px)' }}>
          <MyFormWrap form={cfgData.value} optionMap={formOpt.optionMap} itemList={formOpt.itemList} submitFn={submit} btnStyleStr={'margin-right:50px;margin-bottom:10px;'} loading={loading.value} />
        </div>
        // </NScrollbar>

      )
    }
  }

})