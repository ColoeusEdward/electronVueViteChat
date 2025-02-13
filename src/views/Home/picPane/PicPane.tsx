import { NButton, NPopselect, NIcon, NDropdown, DropdownProps } from "naive-ui";
import type { PopselectProps } from "naive-ui";
import { defineComponent, reactive, ref, computed } from "vue";
import PopBtnComp from "@/components/PopBtnComp/PopBtnComp";
import { useMain } from "@/store";
import MenuBtn from "./MenuBtn";
import DiameterDataChart from "./DiameterDataChart";
import OutToleranceChart from "./OutToleranceChart";
export default defineComponent({
  name: 'PicPane',
  setup(props, ctx) {
    const store = useMain()


    return () => {
      return (
        <div class={'w-full h-full px-2 flex flex-col'}>
          <MenuBtn />
          {store.displayChart.key == 'dataChart' && <DiameterDataChart />}
          {store.displayChart.key == 'outTolerance' && <OutToleranceChart />}
        </div>
      )
    }
  }

})