import { useMain } from "@/store";
import { } from "naive-ui";
import { defineComponent } from "vue";
import { useDataConfigPartStore } from "./dataConfigPartStore";
import LeftTable from "./LeftTable";
import Common from "./RightBlock/Common";
import ModbusTCPSlave from "./RightBlock/ModbusTCPSlave";
import OPCUA from "./RightBlock/OPCUA";

export default defineComponent({
  name: 'DataConfig',
  setup(props, ctx) {
    const dataConfigPartStore = useDataConfigPartStore()
    const store = useMain()
    let obj: Record<string, any> = {
      ModbusTCPSlave: <ModbusTCPSlave />,
      OPCUAClient: <OPCUA />,
      OPCUAServer: <OPCUA />
    }
    return () => {

      return (
        <div class={'w-full h-full  flex border-0 border-y-2 border-solid border-gray-300'}>
          <div class={'w-[20vw] min-w-fit h-full shrink border-0 border-r-2 border-solid border-gray-300'}>
            <LeftTable />
          </div>
          <div class={'w-[80vw] h-full shrink relative'} id={'dataConfigRightBlock'}>
            {obj[dataConfigPartStore.checkedRowItem?.ProtoType.split('-').join('') || ''] ||
              (dataConfigPartStore.checkedRowItem?.ProtoType && <Common />)}
          </div>
        </div>
      )
    }
  }

})