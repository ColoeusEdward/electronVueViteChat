import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { NButton, SelectProps } from "naive-ui";
import { defineComponent, reactive,watch } from "vue";
import { ConnectTcpModel } from "~/me";
import { commonFormItemListMap, defaultConnectComModel, defaultConnectTcpModel, Endian32BitList, PortNameList, propNameEnum } from "../enum";
import { useDevCfgInnerData } from "../innerData";

export default defineComponent({
  name: 'ConnectComModel',
  setup(props, ctx) {
    const innerData = useDevCfgInnerData()
    const formCfg = reactive({
      form: innerData.isEdit ? innerData.connectCfgForm : { ...defaultConnectComModel },
      optionMap: {
        Endian32Bit: Endian32BitList
      } as Record<string, SelectProps['options']>,
      itemList: [
        commonFormItemListMap[propNameEnum.PortName],
        commonFormItemListMap[propNameEnum.BaudRate],
        commonFormItemListMap[propNameEnum.DataBits],
        commonFormItemListMap[propNameEnum.StopBits],
        commonFormItemListMap[propNameEnum.Parity],
        commonFormItemListMap[propNameEnum.SlaveId],
        commonFormItemListMap[propNameEnum.Cycle],
        commonFormItemListMap[propNameEnum.Timeout],
        commonFormItemListMap[propNameEnum.Endian32Bit],
        commonFormItemListMap[propNameEnum.EndianString],
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
    formCfg.optionMap[propNameEnum.PortName] = PortNameList

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