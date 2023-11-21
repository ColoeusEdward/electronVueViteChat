import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { NButton, SelectProps, useMessage } from "naive-ui";
import { defineComponent,reactive } from "vue";
import { DriverAddressType } from "~/me";
import { adressSubmitFn, AreaList, commonFormItemListMap, DataTypeList, defaultConnectTcpModel, defaultModbusAddressModel, Endian32BitList, propNameEnum } from "../enum";
import { useDevCfgInnerData } from "../innerData";

export default defineComponent({
  name: 'ModbusAddressModelForm',
  setup(props,ctx) {
    const innerData = useDevCfgInnerData()
    const formCfg = reactive({
      form: innerData.addressCfgForm ,
      optionMap: {
      } as Record<string, SelectProps['options']>,
      itemList: [
        commonFormItemListMap[propNameEnum.DataName],
        commonFormItemListMap[propNameEnum.SlaveId],
        commonFormItemListMap[propNameEnum.Area],
        commonFormItemListMap[propNameEnum.Index],
        commonFormItemListMap[propNameEnum.Length],
        commonFormItemListMap[propNameEnum.DataType],
        commonFormItemListMap[propNameEnum.CountFormula],
        commonFormItemListMap[propNameEnum.ExchangeData],
        commonFormItemListMap[propNameEnum.Endian32Bit],
      ] as formListItem[],
      hideBtn: false,
      noLargeBtn:true,
      btnStyleStr:`margin-right: 8px;margin-bottom:8px;`,
      renderToBtn:() => {
        return (
          <NButton class={'mr-3 relative mb-2'} onClick={cancel} size={'large'} >取消</NButton>
        )
      },
      submitFn:(form:DriverAddressType) => {
        adressSubmitFn(form,innerData)
      }
    })
    formCfg.optionMap[propNameEnum.Area] = AreaList
    formCfg.optionMap[propNameEnum.DataType] = DataTypeList
    formCfg.optionMap[propNameEnum.Endian32Bit] = Endian32BitList
    formCfg.optionMap[propNameEnum.ExchangeData] = DataTypeList
    const cancel =() => {
      innerData.setAddressCfgFormShow(false)
    }
    return () => {
      return (
        <MyFormWrap {...formCfg} />
      )
    }
  }

})