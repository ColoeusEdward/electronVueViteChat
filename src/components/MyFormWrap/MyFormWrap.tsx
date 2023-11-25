import classNames from "classnames";
import { FormRules, NForm, NFormItem, NGi, NGrid, NInput, NSelect, InputProps, NButton, SelectProps, NSwitch, NDivider, NScrollbar, NRadioGroup, NRadioButton, NInputNumber, NRadio } from "naive-ui";
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
  suffix?: () => JSX.Element,
  style?: Record<string, string>,
  defaultValue?: string | number | boolean,
  text?: string,
  renderComp?: () => JSX.Element,   //自由渲染内容
  radioList?: { value: string | number, label: string }[],
  min?: number,
  max?: number,
  radioType?: 'btn' | 'def'
}
export type MyFormWrapIns = {
  submit: Function,
  resetValid:Function
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
    saveText: String,
    noLargeBtn: Boolean,
    renderToBtn: Function as PropType<() => JSX.Element>   //自由渲染按钮内容
  },
  setup(props, ctx) {
    const formRef = ref<InstanceType<typeof NForm>>()
    const finalRule = ref({})
    const defaultRule: FormRules = {
      must: { required: true, message: '请输入该项', trigger: 'blur' },
    }
    const pform = computed(() => {
      return props.form
    })

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
    const resetValid = () => {
      formRef.value?.restoreValidation()
    }
    const submit = (propSubmit: typeof props.submitFn) => {
      return validForm().then(() => {
        propSubmit && propSubmit({ ...props.form })
      })
    }
    const isAddMoreUpdate = (val: boolean) => {
      ctx.emit('update:isAddMore', val)
    }
    const hasAddMore = computed(() => {
      return props.hasAddMore
    })

    ctx.expose({
      submit,
      resetValid
    } as MyFormWrapIns)


    onMounted(() => {
      buildRule()
    })
    const renderRadio = (form: typeof props.form, item: formListItem) => {
      let radioMap = {
        btn: item.radioList?.map((e: any) => (
          <NRadioButton value={e.value} key={e.value}>
            {e.label}
          </NRadioButton>
        )),
        def: item.radioList?.map((e: any) => (
          <NRadio value={e.value} key={e.value}>
            {e.label}
          </NRadio>
        ))
      }
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NRadioGroup v-model:value={form[item.prop]} size={'large'} disabled={item.disabled}>
            {item.radioType ? radioMap[item.radioType] : radioMap.btn}
          </NRadioGroup>
        </NFormItem>
      )
    }
    const renderSwitch = (form: typeof props.form, item: formListItem) => {
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NSwitch v-model:value={form[item.prop]} size={'large'} checkedValue={item.checkedValue || true} uncheckedValue={item.uncheckedValue || false} disabled={item.disabled} defaultValue={item.defaultValue} />
        </NFormItem>
      )
    }
    const renderInput = (form: typeof props.form, item: formListItem) => {
      typeof form[item.prop] === 'number' && (form[item.prop] = form[item.prop] + "")
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NInput size={'large'} v-model:value={form[item.prop]} placeholder="" clearable type={item.inputType || 'text'} rows={item.row || 3} disabled={item.disabled} v-slots={{
            suffix: typeof item.suffix === 'function' ? item.suffix : () => item.suffix
          }} />
        </NFormItem>
      )
    }
    const renderNumInput = (form: typeof props.form, item: formListItem) => {
      // typeof form[item.prop] === 'string' && (form[item.prop] = Number(form[item.prop]))
      return (
        <NFormItem label={item.label} path={item.prop}>
          <NInputNumber size={'large'} min={item.min} max={item.max} v-model:value={form[item.prop]} placeholder="" clearable rows={item.row || 3} disabled={item.disabled} v-slots={{
            suffix: typeof item.suffix === 'function' ? item.suffix : () => item.suffix
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
    const renderDivider = (form: typeof props.form, item: formListItem) => {
      return (
        <NDivider titlePlacement="left" style={item.style} >
          {item.label}
        </NDivider>
      )
    }
    const renderText = (form: typeof props.form, item: formListItem) => {
      return (
        <NFormItem label={item.label} path={item.prop}>
          <span style={item.style} >{item.text}</span>
        </NFormItem>
      )
    }
    const renderFreeComp = (form: typeof props.form, item: formListItem) => {
      return item.renderComp && item.renderComp()
    }
    return (context: any) => {

      const renderComp = (itemList: formListItem[] | undefined, form: object, optionMap: object) => {
        const obj: Record<string, any> = {
          input: renderInput,
          select: renderSelect,
          switch: renderSwitch,
          divider: renderDivider,
          text: renderText,
          free: renderFreeComp,
          radio: renderRadio,
          numInput: renderNumInput
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
        <div class={'w-full h-full  '}>
          <NForm model={props.form} ref={formRef} rules={finalRule.value} size="medium" labelPlacement="left" >
            <NGrid xGap={12} yGap={2}>
              {renderComp(props.itemList, pform.value || {}, props.optionMap || {})}
            </NGrid>
          </NForm>
          {!props.hideBtn &&
            [props.needBtmSpace ? <div style={{ display: 'flex' }} class={'invisible w-full'}>
              <NButton style="width:100px;height:40px;margin-left:auto;" type="primary" size={'large'} onClick={() => { props.submitFn && submit(props.submitFn) }}>提交</NButton>
            </div> : '',
            <div class={'flex w-auto absolute right-0 bottom-0 items-center z-[500]'}>
              <div class={'mr-4 ml-auto mb-2'} >
                {props.hasAddMore && [
                  <span class={'mr-2 align-middle text-md'}>连续添加</span>,
                  <NSwitch value={props.isAddMore} size={'large'} checkedValue={true} uncheckedValue={false} onUpdateValue={isAddMoreUpdate}  ></NSwitch>
                ]}
              </div>
              {props.renderToBtn && props.renderToBtn()}
              <NButton class={classNames({ 'my-large-btn': !props.noLargeBtn })} style={"" + (props.btnStyleStr || '')} type="primary" loading={props.loading} size={'large'} onClick={() => { props.submitFn && submit(props.submitFn) }}>{props.saveText || '保存'}</NButton>
            </div>]
          }
        </div>

      )
    }
  }

})