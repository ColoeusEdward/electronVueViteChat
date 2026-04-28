import { useConfigStore } from "@/store/config";
import { useFormulaStore } from "@/store/formula";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import classNames from "classnames";
import { } from "naive-ui";
import { computed, defineComponent, reactive, watch } from "vue";
import { DataGroupEntity, FormulaConfigEntity, ModbusAdressRow } from "~/me";

export default defineComponent({
  name: 'formulaList',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const formulaStore = useFormulaStore()
    const curGroupId = computed(() => configStore.sysConfig.CurrentGroupId)
    const curFormulaId = computed(() => configStore.sysConfig.CurrentFormulaId)
    const curFormulaConfigRow = computed(() => formulaStore.curFormulaConfigRow)
    const alldata = reactive({
      list: [] as FormulaConfigEntity[],
      curDataGroup: {}
    })
    const getData = () => {
      // if(!curGroupId.value) {
      //   window.$message.error('请先选择分组')
      //   return
      // }

      // console.log("🪵 [formulaList.tsx:13] ~ token ~ \x1b[0;32mcurGroupId.value\x1b[0m = ", curGroupId.value);
      callBrige(callFnName.GetFormulaConfigs, curGroupId.value).then((res: FormulaConfigEntity[]) => {

        // console.log("🪵 [formulaList.tsx:11] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        // alldata.list = new Array(50).fill(0).map(e => { return { ...res[0] } }) as unknown as FormulaConfigEntity[]
        // console.log("🪵 [formulaList.tsx:25] ~ token ~ \x1b[0;32malldata.list \x1b[0m = ", alldata.list);
        alldata.list = res
        // console.log("🪵 [formulaList.tsx:31] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
      })
    }

    getData()
    formulaStore.setUpdateConfigListFn(getData)
    const rowClick = (row: FormulaConfigEntity) => {
      formulaStore.setCurFormulaConfigRow(row)
    }

    watch(() => curGroupId.value, (v) => {
      if (!v) return
      getData()
      callBrige(callFnName.GetDataGroups).then((res: DataGroupEntity[]) => {
        let curItem = res.find(e => e.GId == curGroupId.value)
        console.log("🪵 [formulaList.tsx:48] ~ token ~ \x1b[0;32mcurItem\x1b[0m = ", curItem);
        formulaStore.setCurEnableDataGroup(curItem)
      })
    }, {
      immediate: true
    })

    return () => {
      return (
        <div class={'w-full h-full border border-gray-600 border-solid rounded-xl overflow-hidden bg-white'}>
          <div class={"w-full h-full overflow-auto "}>
            {
              alldata.list.map((e, i) => {
                return <div class={classNames('text-2xl p-2 bg-white flex', { 'bg-[#f5f6f6]': i % 2 != 0, 'bg-[#688eb2] text-white': curFormulaConfigRow.value?.GId == e.GId })}
                  onClick={() => { rowClick(e) }} >
                  <span>
                    {e.PN}
                    {e.Note && <>{` (${e.Note})`}</>}
                  </span>
                  <span class={'ml-auto mr-2'}>
                    {curFormulaId.value == e.GId ? '已启用' : ''}
                  </span>
                </div>
              })
            }
          </div>

        </div>
      )
    }
  }

})