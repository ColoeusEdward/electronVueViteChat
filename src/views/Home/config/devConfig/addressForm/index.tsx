import { } from "naive-ui";
import { computed, defineComponent } from "vue";
import { driverInfo } from "../enum";
import FFTAddressModelForm from "./FFTAddressModelForm";
import ModbusAddressModelForm from "./ModbusAddressModelForm";
import SiemensAddressModelForm from "./SiemensAddressModelForm";
import SikoraAddressModelForm from "./SikoraAddressModelForm";

export default defineComponent({
  name: 'AddressForm',
  props: {
    driverName: {
      type: String,
      default: ''
    }
  },
  setup(props, ctx) {
    const addressType = computed(() => {
      return driverInfo[props.driverName]?.addressType
    })

    const driverFormMap: Record<string, any> = {
      ModbusAddressModel: <ModbusAddressModelForm />,
      FFTAddressModel: <FFTAddressModelForm />,
      SiemensAddressModel: <SiemensAddressModelForm/>,
      SikoraAddressModel:<SikoraAddressModelForm/>
    }


    return () => {
      return driverFormMap[addressType.value] || (
        <div>
          <span>未匹配到对应表单, {addressType.value}</span>
        </div>
      )
    }
  }

})