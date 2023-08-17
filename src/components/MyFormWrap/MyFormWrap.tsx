import { FormRules, NForm, NFormItem, NGi, NGrid, NInput, NSelect, InputProps, NButton, SelectProps, NSwitch } from "naive-ui";
import { Placement } from "naive-ui/es/drawer/src/DrawerBodyWrapper";
import { defineComponent, ref, PropType, onMounted, computed, defineExpose } from "vue";

export interface formListItem {
  type: string
  label: string
  prop: string
  placeholder?: string
  inputType?: InputProps['type']
  row?: number
  width?: number
  rule?: string | string[]
  checkedValue?: string,
  uncheckedValue?: string,
  disabled?: boolean,
  placement?: Placement,
  suffix?:() => JSX.Element
}
export type MyFormWrapIns = {
  submit: Function
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
    btnStyleStr: String,
    loading: Boolean,
    hasAddMore: Boolean,  //是否有连续添加开关
    isAddMore: Boolean,       //连续添加开关状态
    needBtmSpace: {
      type: Boolean,
      default: true
    },     //是否需要底部占位
    saveText:String
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
        if (!e.rule) return
        if (Array.isArray(e.rule)) {
          ruleOfProp[e.prop] = e.rule.map(ee => baseRule[ee])
        } else {
          ruleOfProp[e.prop] = baseRule[e.rule]
        }
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
    const isAddMoreUpdate = (val: boolean) => {
      ctx.emit('update:isAddMore', val)
    }
    const hasAddMore = computed(() => {
      return props.hasAddMore
    })

    ctx.expose({
      submit
    } as MyFormWrapIns)


    onMounted(() => {
      buildRule()
    })

    const renderSwitch = (form: typeof props.form, item: formListItem) => {
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NSwitch v-model:value={form[item.prop]} size={'large'} checkedValue={item.checkedValue || true} uncheckedValue={item.uncheckedValue || false} disabled={item.disabled} />
        </NFormItem>
      )
    }
    const renderInput = (form: typeof props.form, item: formListItem) => {
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NInput size={'large'} v-model:value={form[item.prop]} placeholder="" clearable type={item.inputType || 'text'} rows={item.row || 3} disabled={item.disabled} v-slots={{
            suffix:item.suffix
          }} />
        </NFormItem>
      )
    }
    const renderSelect = (form: typeof props.form, item: formListItem, optionMap: Record<string, any>) => {
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NSelect filterable v-model:value={form[item.prop]} options={optionMap[item.prop]} size={'large'} placement={item.placement} disabled={item.disabled} />
        </NFormItem>
      )
    }
    return (context: any) => {

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
        <div class={'w-full h-full relative'}>
          <NForm model={props.form} ref={formRef} rules={finalRule.value} size="medium" labelPlacement="left" >
            <NGrid xGap={12} yGap={2}>
              {renderComp(props.itemList, props.form || {}, props.optionMap || {})}
            </NGrid>
          </NForm>
          {!props.hideBtn &&
            [props.needBtmSpace ? <div style={{ display: 'flex' }} class={'invisible w-full'}>
              <NButton style="width:100px;height:40px;margin-left:auto;" type="primary" size={'large'} onClick={() => { props.submitFn && submit(props.submitFn) }}>提交</NButton>
            </div> : '',
            <div class={'flex w-full absolute bottom-0 items-center'}>
              <div class={'mr-4 ml-auto mb-2'} >
                {props.hasAddMore && [
                  <span class={'mr-2 align-middle text-lg'}>连续添加</span>,
                  <NSwitch value={props.isAddMore} size={'large'} checkedValue={true} uncheckedValue={false} onUpdateValue={isAddMoreUpdate}  ></NSwitch>
                ]}
              </div>

              <NButton style={"width:100px;height:40px;" + (props.btnStyleStr || '')} type="primary" loading={props.loading} size={'large'} onClick={() => { props.submitFn && submit(props.submitFn) }}>{props.saveText || '保存'}</NButton>
            </div>]
          }
        </div>
      )
    }
  }

})