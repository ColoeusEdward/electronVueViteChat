import { NButton, NPopselect, NIcon, NDropdown, DropdownProps } from "naive-ui";
import type { PopselectProps } from "naive-ui";
import { defineComponent, reactive, ref, computed, onMounted, watch } from "vue";
import PopBtnComp from "@/components/PopBtnComp/PopBtnComp";
import { useMain } from "@/store";
import MenuBtn from "./MenuBtn";
import { useRealTimeStore } from "@/store/realtime";
import * as echarts from 'echarts';
import { useTrendStore } from "@/store/trendStore";
import { storeToRefs } from "pinia";
import TrandChartRow from "./TrandChartRow";

export default defineComponent({
  name: 'Trend',
  setup(props, ctx) {
    const store = useMain()
    const trendStore = useTrendStore()

    return () => {
      return (
        <div class={'w-full h-full px-2 flex flex-col'}>
          <MenuBtn />
          <div class={'w-full h-full shrink flex flex-col mt-2'}>
            {trendStore.dataSourceList.map((e,i) => {
              return (
                <TrandChartRow dataSourceItem={e} key={i} i={i} />
              )
            })}
          </div>

        </div>
      )
    }
  }

})