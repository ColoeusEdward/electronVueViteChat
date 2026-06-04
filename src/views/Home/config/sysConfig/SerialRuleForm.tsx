import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { NButton, SelectProps, useMessage } from "naive-ui";
import { defineComponent, reactive, watch } from "vue";
import { useMyI18n } from "@/hooks/useMyI18n";
import { SerialNoEntity } from "~/me";
import { FieldTypeList, serialNoFormDefault } from "./enum";
import { useSysCfgInnerDataStore } from "./innderData";
import { sleep } from "@/utils/utils";

export default defineComponent({
  name: 'SerialRuleForm',
  setup(props, ctx) {
    const { t, i18nStore } = useMyI18n()
    const innerData = useSysCfgInnerDataStore()
    const msg = useMessage()
    const formCfg = reactive({
      form: { ...serialNoFormDefault } as SerialNoEntity,
      optionMap: {
        FieldType: FieldTypeList,
      } as Record<string, SelectProps['options']>,
      itemList: [
        { type: "select", label: t('config.fieldType'), prop: "FieldType", width: 24 },
        { type: "input", label: t('config.format'), prop: "Format", rule: 'must', width: 24 },

      ] as formListItem[],
      hideBtn: false,
      noLargeBtn: true,
      btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
      saveText: t('config.add'),
      renderToBtn: () => {
        return (
          <NButton class={'mr-3 relative mb-2'} onClick={cancel} size={'large'} >{t('config.cancel')}</NButton>
        )
      },
      submitFn: (form: SerialNoEntity) => {
        console.log("🚀 ~ file: index.tsx:179 ~ setup ~ form:", form)
        form.SortNum = innerData.tableLength + 1
        callBrige(callFnName.SaveSerialNo, form).then((res: number) => {
          if (res) {
            msg.success(t('config.saveSuccess'))
            innerData.setAddFormShow(false)
            innerData.getTbDataFn()
            formCfg.form = { ...serialNoFormDefault } as SerialNoEntity
          }
        })
      },
    })

    // 语言切换时更新 formCfg 中的标签
    watch(() => i18nStore.langChangeCount, () => {
      sleep(100).then(() => {
        formCfg.itemList[0].label = t('config.fieldType')
        formCfg.itemList[1].label = t('config.format')
        formCfg.saveText = t('config.add')
      })

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