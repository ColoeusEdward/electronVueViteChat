import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, NDropdown } from "naive-ui";
import { computed, defineComponent } from "vue";
import { useCurcevInnerDataStore } from "./innerData";

export default defineComponent({
  name: 'NormalDis', //正态分布曲线
  setup(props, ctx) {
    const innerData = useCurcevInnerDataStore()
    const opt = computed(() => {
      return innerData.dataCfgList.map(e => {
        return {
          label: e.Name,
          key: e.GId
        }
      })
    })
    const handleSelect = (val: string) => {
      getNorDis(val)
    }
    const getNorDis = (id: string) => {
      callSpc(callFnName.getNormalDistribution, innerData.curDataCfgEntity?.GId).then((res: DistanceModelType) => {
        console.log("🚀 ~ file: NormalDis.tsx:18 ~ getNorDis ~ res:", res)
      })
    }

    return () => {
      return (
        <div class={''}>
          {/* <NDropdown trigger="click" options={opt.value} onSelect={handleSelect}>
            
          </NDropdown> */}
          <NButton onClick={getNorDis} >正态分布</NButton>
        </div>
      )
    }
  }

})