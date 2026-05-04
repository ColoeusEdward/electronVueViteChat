import { NButton, NPopselect, NIcon, NDropdown, DropdownProps } from "naive-ui";
import { defineComponent, reactive, ref, computed, onMounted, watch } from "vue";
import { useMain } from "@/store";
import MenuBtn from "./MenuBtn";
import { useRealTimeStore } from "@/store/realtime";
import { storeToRefs } from "pinia";
import { useStatisticalStore } from "@/store/statistical";
import StatisticalChartBlock from "./StatisticalChartBlock";
import { sleep } from "@/utils/utils";

export default defineComponent({
  name: 'Statistical',
  setup(props, ctx) {
    const store = useMain()
    const staticalStore = useStatisticalStore()
    const alldata = reactive({
      tempHide: false
    })
    const dataSourceList = computed(() => {
      return staticalStore.curDisDataAdressList
    })
    watch(() => staticalStore.curDisDataAdressList, (val) => {
      alldata.tempHide = true
      sleep(200).then(() => {
        alldata.tempHide = false
      })
    })
    return () => {
      return (
        <div class={'w-full h-full px-2 flex flex-col'}>
          <MenuBtn />
          <div class={'w-full h-full shrink flex flex-wrap flex-col mt-2'}>
            {!alldata.tempHide && dataSourceList.value.map((e, i) => {
              return (
                <StatisticalChartBlock dataSourceItem={e} key={i} i={i} listNum={dataSourceList.value.length} />
                // <div >

                // </div>
              )
            })}
          </div>

        </div>
      )
    }
  }

})