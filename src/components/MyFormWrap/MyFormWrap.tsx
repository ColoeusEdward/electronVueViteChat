import { FormRules, NForm, NFormItem, NGi, NGrid, NInput, NSelect, InputProps, NButton, SelectProps, NSwitch } from "naive-ui";
import { defineComponent, ref, PropType, onMounted } from "vue";

export interface formListItem {
  type: string
  label: string
  prop: string
  placeholder?: string
  inputType?: InputProps['type']
  row?: number
  width?: number
  rule?: string
  checkedValue?: string,
  uncheckedValue?: string
}
export const MyFormWrap = defineComponent({
  name: 'MyFormWrap',
  props: {
    itemList: Array as PropType<formListItem[]>,
    form: { type: Object, default: {} },
    rule: Object as PropType<FormRules>,
    submitFn: Function,
    hideBtn: Boolean,
    optionMap: Object as PropType<Record<string, SelectProps['options']>>,
    btnStyleStr: String
  },
  setup(props, ctx) {
    const formRef = ref<InstanceType<typeof NForm>>()
    const finalRule = ref({})
    const defaultRule: FormRules = {
      must: { required: true, message: '请输入该项', trigger: 'blur' },
    }

    const buildRule = () => {
      let baseRule = props.rule ? Object.assign(props.rule, defaultRule) : defaultRule
      let ruleOfProp: Record<string, any> = {}
      props.itemList?.forEach((e) => {
        e.rule && (ruleOfProp[e.prop] = baseRule[e.rule])
      })
      finalRule.value = ruleOfProp
    }

    const validForm = () => {
      return formRef.value?.validate()
    }
    const submit = async (propSubmit: typeof props.submitFn) => {
      await validForm()
      propSubmit && propSubmit({ ...props.form })
    }

    onMounted(() => {
      buildRule()
    })

    const renderSwitch = (form: typeof props.form, item: formListItem) => {
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NSwitch v-model:value={form[item.prop]} size={'large'} checkedValue={item.checkedValue || true} uncheckedValue={item.uncheckedValue || false} />
        </NFormItem>
      )
    }
    const renderInput = (form: typeof props.form, item: formListItem) => {
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NInput size={'large'} v-model:value={form[item.prop]} placeholder="" clearable type={item.inputType || 'text'} rows={item.row || 3} />
        </NFormItem>
      )
    }
    const renderSelect = (form: typeof props.form, item: formListItem, optionMap: Record<string, any>) => {
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NSelect filterable v-model:value={form[item.prop]} options={optionMap[item.prop]} size={'large'} />
        </NFormItem>
      )
    }
    return () => {


      const renderComp = (itemList: formListItem[] | undefined, form: object, optionMap: object) => {
        const obj: Record<string, any> = {
          input: renderInput,
          select: renderSelect,
          switch: renderSwitch
        }
        return itemList?.map((item) => {
          return (
            <NGi span={item.width || 12}>
              {obj[item.type] && obj[item.type](form, item, optionMap)}
            </NGi>
          )
        }) || []
      }

      return (
        <div class={'w-full h-full'}>
          <NForm model={props.form} ref={formRef} rules={finalRule.value} size="medium" labelPlacement="left" >
            <NGrid xGap={12} yGap={2}>
              {renderComp(props.itemList, props.form || {}, props.optionMap || {})}
            </NGrid>
          </NForm>
          {!props.hideBtn &&
            [<div style={{ display: 'flex' }} class={'invisible w-full'}>
              <NButton style="width:100px;height:40px;margin-left:auto;" type="primary" size={'large'} onClick={() => { props.submitFn && submit(props.submitFn) }}>提交</NButton>
            </div>,
            <div class={'flex w-full absolute bottom-0'}>
              <NButton style={"width:100px;height:40px;margin-left:auto;" + (props.btnStyleStr || '')} type="primary" size={'large'} onClick={() => { props.submitFn && submit(props.submitFn) }}>提交</NButton>
            </div>]
          }
        </div>
      )
    }
  }

})