import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { NButton, SelectProps } from "naive-ui";
import { defineComponent, reactive,watch } from "vue";
import { ConnectTcpModel } from "~/me";
import { commonFormItemListMap,  defaultConnectSiemensModel, defaultConnectSikoraTcpModel, Endian32BitList, PlcModelList, PortNameList, propNameEnum } from "../enum";
import { useDevCfgInnerData } from "../innerData";

export default defineComponent({
  name: 'ConnectSikoraTcpModel',
  setup(props, ctx) {
    const innerData = useDevCfgInnerData()
    const formCfg = reactive({
      form: innerData.isEdit ? innerData.connectCfgForm : { ...defaultConnectSikoraTcpModel },
      optionMap: {
        Endian32Bit: Endian32BitList
      } as Record<string, SelectProps['options']>,
      itemList: [
        commonFormItemListMap[propNameEnum.Host],
        commonFormItemListMap[propNameEnum.Port],
        commonFormItemListMap[propNameEnum.Cycle],
        commonFormItemListMap[propNameEnum.Timeout],
      ] as formListItem[],
      hideBtn: false,
      noLargeBtn: true,
      btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
      renderToBtn: () => {
        return (
          <NButton class={'mr-3 relative mb-2'} onClick={cancel} size={'large'} >取消</NButton>
        )
      },
      submitFn: (form: object) => {
        innerData.setConnectStrOfDevConfigForm(JSON.stringify(form))
        innerData.connectCfgFormShow = false
      }
    })
    // formCfg.optionMap[propNameEnum.PlcModel] = PlcModelList

    watch(() => innerData.connectCfgForm,(val) => {
      formCfg.form = val
    })
    const cancel = () => {
      innerData.connectCfgFormShow = false
    }
    return () => {
      return (
        <MyFormWrap {...formCfg} />
      )
    }
  }

})