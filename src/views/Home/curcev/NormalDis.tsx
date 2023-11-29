import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, NDropdown, NSpace } from "naive-ui";
import { computed, defineComponent, Transition } from "vue";
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
      innerData.setNormalDisShow(true)
      innerData.setIsGetting(false)
    }
    const back = () => {
      innerData.setNormalDisShow(false)
      innerData.setIsGetting(true)
    }
    return () => {
      return (
        <div class={''}>
          {/* <NDropdown trigger="click" options={opt.value} onSelect={handleSelect}>
            
          </NDropdown> */}
          <NButton onClick={getNorDis} >正态分布</NButton>
          <Transition name={'full-pop'}>
            {
              innerData.normalDisShow && <div class={' absolute w-full h-full bg-white top-0 left-0 z-10'}>
                <div class={'px-2 pt-2'}>
                  <NSpace>
                    <NButton class={'my-large-btn'} size={'large'} onClick={back} >返回</NButton>
                  </NSpace>
                </div>
              </div>
            }

          </Transition>

        </div>
      )
    }
  }

})