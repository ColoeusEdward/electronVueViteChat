import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { sleep } from "@/utils/utils";
import classNames from "classnames";
import { NInput, NScrollbar, NSpace } from "naive-ui";
import { computed, defineComponent, PropType, reactive, watch } from "vue";
import { CollectPointModel, DataConfigEntity, CpkModel } from "~/me";
import { cpkModelPropName } from "./enum";
import { useCurcevInnerDataStore } from "./innerData";

export default defineComponent({
  name: 'CpkBlock',
  props: {
    dataConfig: Object as PropType<DataConfigEntity>,
  },
  setup(props, ctx) {
    const innerData = useCurcevInnerDataStore()
    const commonData = reactive({
      show: false,
      cpkdata: {} as CpkModel
    })
    const showSide = () => {
      commonData.show = !commonData.show
    }

    const loopGet = () => {
      if (!innerData.isGetting || !commonData.show || !props.dataConfig) return
      callSpc(callFnName.getCpkData, props.dataConfig.GId).then((res: CpkModel) => {
        commonData.cpkdata = res
        innerData.setCurCpk(res)
        return sleep(5000)
      }).then(() => {
        loopGet()
      })
    }
    const cpkChoose= (item:typeof modelList.value[0]) => {
      innerData.setCurCpkKey(item)
    }
    const modelList = computed(() => {
      let list = Object.keys(commonData.cpkdata).map((e: string) => {
        let ee = e as keyof CpkModel
        return {
          name: e,
          title: cpkModelPropName[ee],
          value: commonData.cpkdata[ee].toFixed(3)
        }
      })
      if(!innerData.curCpkKey) {
        innerData.setCurCpkKey(list[0])
      }
      return list
    })
    watch(() => innerData.isGetting && commonData.show, (val) => {
      if (val) {
        loopGet()
      }
    })

    return () => {
      return (
        <div class={classNames('h-full w-[350px] absolute  bg-white rounded-md shadow-md border border-solid border-gray-200 p-2 left-side-ani z-20', { '-left-[350px] ': !commonData.show, 'left-0': commonData.show })}>
          <div class={'absolute top-1/2 -mt-[42px] -right-7 rounded-md shadow-md border border-solid bg-white border-gray-200 p-2 hover:bg-gray-100'} onClick={showSide} >
            C<br />
            P<br />
            K<br />
          </div>
          {
            commonData.show && 
            <NScrollbar>
              <NSpace >
                {modelList.value.map((e) => {
                  return <div class={'p-2 hover:bg-gray-100 shadow-md rounded-md'} onClick={() => {cpkChoose(e)}} title={e.title} >
                    <div>{e.name}</div>
                    <div class={'w-fit border border-solid border-gray-600 rounded-sm px-1'}  >{e.value}</div>
                  </div>
                })}
              </NSpace>
            </NScrollbar>
          }

        </div>
      )
    }
  }

})