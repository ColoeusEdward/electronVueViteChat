import { } from "naive-ui";
import { computed, defineComponent } from "vue";
import { driverInfo } from "../enum";
import ConnectComModelForm from "./ConnectComModelForm";
import ConnectFFTModelForm from "./ConnectFFTModelForm";
import ConnectSiemensModelForm from "./ConnectSiemensModelForm";
import ConnectSikoraComModelForm from "./ConnectSikoraComModelForm";
import ConnectSikoraTcpModelForm from "./ConnectSikoraTcpModelForm";
import ConnectTcpModelForm from "./ConnectTcpModelForm";
import ConnectZumbachComModelForm from "./ConnectZumbachComModelForm";
import ConnectZumbachTcpModelForm from "./ConnectZumbachTcpModelForm";

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
      ConnectFFTModel: <ConnectFFTModelForm />,
      ConnectComModel: <ConnectComModelForm />,
      ConnectSiemensModel: <ConnectSiemensModelForm/>,
      ConnectSikoraTcpModel: <ConnectSikoraTcpModelForm/>,
      ConnectSikoraComModel: <ConnectSikoraComModelForm/>,
      ConnectZumbachComModel: <ConnectZumbachComModelForm/>,
      ConnectZumbachTcpModel: <ConnectZumbachTcpModelForm/>
    }
    

    return () => {
      return driverFormMap[conectType.value]
    }
  }

})