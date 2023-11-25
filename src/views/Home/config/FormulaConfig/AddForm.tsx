import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, SelectProps } from "naive-ui";
import { defineComponent, reactive, watch } from "vue";
import { FormulaConfigEntity } from "~/me";
import { defaulFormulaConfigForm } from "./enum";
import { useFormulaCfgInnerDataStore } from "./innderData";

export default defineComponent({
  name: 'AddForm',
  setup(props, ctx) {
    const innerData = useFormulaCfgInnerDataStore()
    const formCfg = reactive({
      form: {...defaulFormulaConfigForm} as FormulaConfigEntity,
      optionMap: {
      } as Record<string, SelectProps['options']>,
      itemList: [
        { type: "input", label: "料号", prop: "PN", rule: 'must', width: 24 },
        { type: "input", label: "注释", prop: "Note",  width: 24 },

      ] as formListItem[],
      hideBtn: false,
      noLargeBtn: true,
      btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
      renderToBtn: () => {
        return (
          <NButton class={'mr-3 relative mb-2'} onClick={cancel} size={'large'} >取消</NButton>
        )
      },
      submitFn: (form: FormulaConfigEntity) => {
        console.log("🚀 ~ file: index.tsx:179 ~ setup ~ form:", form)
        callSpc(callFnName.saveFormulaConfig, [form,[]],true).then((res: number) => {
          innerData.getTbDataFn()
          innerData.setAddFormShow(false)
        })
      },
      saveText: '添加'
    })

    const cancel = () => {
      innerData.setAddFormShow(false)
    }
    watch(() => innerData.addFormShow,(val) => {
      if(!val){
        formCfg.form = {...defaulFormulaConfigForm} as FormulaConfigEntity
      }
    })

    return () => {
      return (
        <div class={'w-full min-h-0 max-h-full absolute p-2 pl-4 bottom-0 left-0'}>
          <MyFormWrap {...formCfg} />
        </div>
      )
    }
  }

})