import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { NButton, SelectProps } from "naive-ui";
import { defineComponent, reactive,watch } from "vue";
import { ConnectTcpModel } from "~/me";
import { commonFormItemListMap, defaultConnectTcpModel, Endian32BitList, propNameEnum } from "../enum";
import { useDevCfgInnerData } from "../innerData";

export default defineComponent({
  name: 'ConnectTcpModelForm',
  setup(props, ctx) {
    const innerData = useDevCfgInnerData()
    const formCfg = reactive({
      form: innerData.isEdit ? innerData.connectCfgForm : { ...defaultConnectTcpModel },
      optionMap: {
        Endian32Bit: Endian32BitList
      } as Record<string, SelectProps['options']>,
      itemList: [
        commonFormItemListMap[propNameEnum.Host],
        commonFormItemListMap[propNameEnum.Port],
        commonFormItemListMap[propNameEnum.SlaveId],
        commonFormItemListMap[propNameEnum.Endian32Bit],
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