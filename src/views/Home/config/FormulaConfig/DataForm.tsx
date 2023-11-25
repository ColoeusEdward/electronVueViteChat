import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, SelectProps } from "naive-ui";
import { defineComponent, reactive, watch } from "vue";
import { DataConfigEntity, FormulaDataEntity } from "~/me";
import { defaulFormulaDataForm } from "./enum";
import { useFormulaCfgInnerDataStore } from "./innderData";

export default defineComponent({
  name: 'DataForm',
  setup(props, ctx) {
    const innerData = useFormulaCfgInnerDataStore()
    const formCfg = reactive({
      form: { ...defaulFormulaDataForm } as FormulaDataEntity,
      optionMap: {
      } as Record<string, SelectProps['options']>,
      itemList: [
        { type: "select", label: "数据采集配置", prop: "DataId", rule: 'must', width: 24 },
        { type: "numInput", label: "标准值", prop: "Standard", width: 24 },
        { type: "numInput", label: "上公差", prop: "UpperTol", width: 24 },
        { type: "numInput", label: "下公差", prop: "LowerTol", width: 24 },

      ] as formListItem[],
      hideBtn: false,
      noLargeBtn: true,
      btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
      renderToBtn: () => {
        return (
          <NButton class={'mr-3 relative mb-2'} onClick={cancel} size={'large'} >取消</NButton>
        )
      },
      submitFn: (form: FormulaDataEntity) => {
        console.log("🚀 ~ file: index.tsx:179 ~ setup ~ form:", form)
        let curCfgRow = innerData.curRow
        let dataList = [...innerData.dataList]
        if (!form.FormulaId)
          form.FormulaId = curCfgRow?.GId
        if (innerData.dataIsEdit) {
          dataList[dataList.findIndex(e => e.GId === form.GId)] = form
        } else {
          dataList.push(form)
        }
        callSpc(callFnName.saveFormulaConfig, [curCfgRow, [...dataList]], true).then((res: number) => {
          innerData.getDataTbDataFn()
          innerData.setDataFormShow(false)
        })
      },
      saveText: innerData.dataIsEdit ? '编辑' : '添加'
    })
    const getDataConfigOpt = () => {
      callSpc(callFnName.getDataConfigs).then((res: DataConfigEntity[]) => {
        formCfg.optionMap.DataId = res.map(e => {
          return {
            label: e.Name,
            value: e.GId
          }
        })
      })
    }
    const cancel = () => {
      innerData.setDataFormShow(false)
    }
    watch(() => innerData.dataFormShow, (val) => {
      if (val) {
        getDataConfigOpt()
        // ,(delete formCfg.form.FormulaId),(delete formCfg.form.GId)
        !innerData.dataIsEdit && (formCfg.form = { ...defaulFormulaDataForm })
        innerData.dataIsEdit && innerData.curDataRow && (formCfg.form = { ...innerData.curDataRow })
      }
    })
    watch(() => innerData.curDataRow, (val) => {
      innerData.setDataFormShow(false)
    })

    return () => {
      return (
        <div class={'w-full min-h-0 max-h-full absolute p-2 pl-4 bottom-0 left-0 bg-white'}>
          <MyFormWrap {...formCfg} />
        </div>
      )
    }
  }

})