import { } from "naive-ui";
import { computed, defineComponent } from "vue";
import { driverInfo } from "../enum";
import ConnectFFTModelForm from "./ConnectFFTModelForm";
import ConnectTcpModelForm from "./ConnectTcpModelForm";

export default defineComponent({
  name: 'DriverForm',  //连接配置表单
  props: {
    driverName: {
      type: String,
      default: ''
    }
  },
  setup(props, ctx) {
    const conectType = computed(() => {
      return driverInfo[props.driverName]?.connectType
    })

    const driverFormMap: Record<string, any> = {
      ConnectTcpModel: <ConnectTcpModelForm />,
      ConnectFFTModel: <ConnectFFTModelForm />
    }
    

    return () => {
      return driverFormMap[conectType.value]
    }
  }

})