import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { NButton, SelectProps, useMessage } from "naive-ui";
import { defineComponent, reactive } from "vue";
import { SerialNoEntity } from "~/me";
import { FieldTypeList, serialNoFormDefault } from "./enum";
import { useSysCfgInnerDataStore } from "./innderData";

export default defineComponent({
  name: 'SerialRuleForm',
  setup(props, ctx) {
    const innerData = useSysCfgInnerDataStore()
    const msg = useMessage()
    const formCfg = reactive({
      form: { ...serialNoFormDefault } as SerialNoEntity,
      optionMap: {
        FieldType: FieldTypeList,
      } as Record<string, SelectProps['options']>,
      itemList: [
        { type: "select", label: "字段类型", prop: "FieldType", width: 24 },
        { type: "input", label: "格式", prop: "Format", rule: 'must', width: 24 },

      ] as formListItem[],
      hideBtn: false,
      noLargeBtn: true,
      btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
      saveText: '添加',
      renderToBtn: () => {
        return (
          <NButton class={'mr-3 relative mb-2'} onClick={cancel} size={'large'} >取消</NButton>
        )
      },
      submitFn: (form: SerialNoEntity) => {
        console.log("🚀 ~ file: index.tsx:179 ~ setup ~ form:", form)
        form.SortNum = innerData.tableLength + 1
        callBrige(callFnName.SaveSerialNo, form).then((res: number) => {
          if (res) {
            msg.success('保存成功')
            innerData.setAddFormShow(false)
            innerData.getTbDataFn()
            formCfg.form = { ...serialNoFormDefault } as SerialNoEntity
          }
        })
      },
    })
    const cancel = () => {
      innerData.setAddFormShow(false)
    }
    return () => {
      return (
        <div class={'w-full h-full flex-shrink relative p-2'}>
          <MyFormWrap {...formCfg} />
        </div>
      )
    }
  }

})