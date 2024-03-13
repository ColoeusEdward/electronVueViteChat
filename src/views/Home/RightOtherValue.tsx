import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { ajaxPromiseAll, loopGet } from "@/utils/utils";
import { } from "naive-ui";
import { computed, defineComponent, reactive } from "vue";
import { CollectPointModel, DataConfigEntity } from "~/me";
import { DataTypeEnum, DataTypeOnRight } from "./config/dataCofigNew/enum";
import { useCurcevInnerDataStore } from "./curcev/innerData";
import { RightValueType, ValueRow } from "./RightValueBlock";

export default defineComponent({
  name: 'RightOtherValue',  //其他数据源
  setup(props, ctx) {
    const curcevDataStore = useCurcevInnerDataStore()
    const commonData = reactive({
      resList:[] as {model:CollectPointModel, config:DataConfigEntity}[],
    })
    const isGetting = computed(() => curcevDataStore.isGetting)
    const dataList = computed(() => {
      // console.log("🚀 ~ dataList ~ curcevDataStore.dataCfgList:", curcevDataStore.dataCfgList)
      return curcevDataStore.dataCfgList.filter(e => DataTypeOnRight.includes(e.DataType))
    })
    const getDatas = () => {
      let reqList = dataList.value.map(e => {
        return callSpc(callFnName.getLastPoint, e.GId )
      })
      return ajaxPromiseAll(reqList).then((res:CollectPointModel[]) => {
        commonData.resList = res.map((e,i) => {
          return {
            model:e,
            config:dataList.value[i]
          }
        })
        // commonData.resList = new Array(10).fill(0).map((e,i) => {
        //   return {
        //     model:res[0],
        //     config:dataList.value[0]
        //   }
        // })
      })
    }
    loopGet(getDatas,5000,isGetting)
    return () => {
      return (
        <div class={' h-full px-2 flex flex-col overflow-y-auto'}>
          {/* <NScrollbar> */}
          {commonData.resList.map((e, i) => {
            let d:RightValueType = {
              value:e.model.Value,
              title:e.config.Name,
              unit:e.config.Unit,
            }
            return <ValueRow key={i} x={0} y={i} data={d} fixNum={e.config.Precision} />
          })}
          {/* </NScrollbar> */}

        </div>
      )
    }
  }

})