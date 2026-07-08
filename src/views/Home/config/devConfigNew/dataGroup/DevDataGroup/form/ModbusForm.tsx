import { computed, defineComponent, onMounted, PropType, reactive, Ref, ref, watch } from "vue";
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { DataGroupEntity } from "~/me";
import { useConfigStore } from "@/store/config";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { commonMap2, refreshCommonMap2 } from "@/views/Home/config/proto/proto";
import { commonFormItemListMap, propNameEnum, refreshCommonFormItemListMap } from "@/views/Home/config/devConfig/enum";
import { DataClassNameMap, ParamClassEnum } from "../../../enum";
import { useMyI18n } from "@/hooks/useMyI18n";

export type ConnectFormIns = {
  myFormRef: Ref<MyFormWrapIns | undefined>,
  // submit: Function
}
const defForm = {

}
export default defineComponent({
  name: 'ModbusForm',
  props: {
    show: Boolean,
    updateShowFn: Function,
    connectStr: String,
    updateParentFn: Function,
    getFormRefFn: Function,
    getSubmitFn: Function,
    mode: {
      type: String as PropType<'parent' | 'child'>,
      default: 'parent'
    },
    parentRow: Object as PropType<DataGroupEntity | null | undefined>,
    editRow: Object as PropType<DataGroupEntity | null | undefined>
  },
  setup(props, ctx) {
    // const show = computed(() => props.show)
    const configStore = useConfigStore()
    const { t } = useMyI18n()
    const myFormRef = ref<MyFormWrapIns>()
    const curRow = computed(() => configStore.curDevDataGroupRow)
    const curDeviceGroupRow = computed(() => configStore.curDeviceGroupRow)
    const isChildMode = computed(() => props.mode === 'child')
    const alldata = reactive({
      form: {} as DataGroupEntity,
    })
    const optionMap: any = reactive({
      ...commonMap2
    })
    const itemList = ref<formListItem[]>([])

    const cloneFormItem = (item: formListItem, data?: Partial<formListItem>) => {
      return { ...item, ...data }
    }

    const filterParamClassOptions = () => {
      const list = [...(commonMap2[propNameEnum.ParamClass] || [])]
      optionMap[propNameEnum.ParamClass] = isChildMode.value
        ? list.filter(e => e.value !== ParamClassEnum.Value)
        : list.filter(e => e.value === ParamClassEnum.Value)
    }

    const buildItemList = () => {
      refreshCommonMap2()
      refreshCommonFormItemListMap()
      Object.keys(commonMap2).forEach(key => {
        optionMap[key] = commonMap2[key]
      })
      filterParamClassOptions()
      const paramClassItem = cloneFormItem(commonFormItemListMap[propNameEnum.ParamClass], {
        label: isChildMode.value ? t('config.paramType') : commonFormItemListMap[propNameEnum.ParamClass].label
      })
      itemList.value = isChildMode.value ? [
        cloneFormItem(commonFormItemListMap[propNameEnum.DataName]),
        paramClassItem,
      ] : [
        cloneFormItem(commonFormItemListMap[propNameEnum.DataName]),
        cloneFormItem(commonFormItemListMap[propNameEnum.DataClass]),
        paramClassItem,
        cloneFormItem(commonFormItemListMap[propNameEnum.Unilateral]),
        cloneFormItem(commonFormItemListMap[propNameEnum.AlarmType]),
        cloneFormItem(commonFormItemListMap[propNameEnum.State]),
        cloneFormItem(commonFormItemListMap[propNameEnum.Unit]),
        cloneFormItem(commonFormItemListMap[propNameEnum.Precision]),
      ]
    }

    const getDefaultParamClass = () => {
      return isChildMode.value ? optionMap[propNameEnum.ParamClass]?.[0]?.value : ParamClassEnum.Value
    }

    const buildDefForm = (): DataGroupEntity => {
      const baseForm: DataGroupEntity = isChildMode.value && props.parentRow ? { ...props.parentRow } : {}
      delete baseForm.GId
      delete baseForm.ParamId
      delete baseForm.ParamClass
      const form: DataGroupEntity = {
        ...defForm,
        ...baseForm,
        DeviceGroupId: baseForm.DeviceGroupId || curDeviceGroupRow.value?.GId || '',
        ParamClass: getDefaultParamClass(),
        Unilateral: baseForm.Unilateral ?? 0,
        AlarmType: baseForm.AlarmType ?? 1,
        State: baseForm.State ?? 1,
        Unit: baseForm.Unit ?? '',
        Precision: baseForm.Precision ?? 0,
      }
      if (isChildMode.value) {
        form.ParamId = props.parentRow?.GId
      }
      return form
    }

    const initForm = () => {
      buildItemList()
      buildCurDataClassOpt().then(() => {
        if (isChildMode.value) {
          alldata.form = props.editRow ? {
            ...props.editRow,
            Unilateral: props.editRow.Unilateral ?? 0,
            Precision: props.editRow.Precision ?? 0,
          } : { ...buildDefForm() }
          return
        }
        if (curRow.value) {
          alldata.form = {
            ...curRow.value,
            ParamClass: ParamClassEnum.Value,
            AlarmType: curRow.value.AlarmType ?? 1,
            State: curRow.value.State ?? 1,
            Unilateral: curRow.value.Unilateral ?? 0,
            Precision: curRow.value.Precision ?? 0,
          }
        } else {
          alldata.form = { ...buildDefForm() }
        }
      })
    }

    const submit = (data: DataGroupEntity) => {
      let saveData: DataGroupEntity = {
        ...data,
        DeviceGroupId: data.DeviceGroupId || curDeviceGroupRow.value?.GId,
      }
      if (isChildMode.value) {
        saveData = {
          ...saveData,
          ParamId: props.parentRow?.GId,
          ParamClass: saveData.ParamClass ?? getDefaultParamClass(),
        }
        if (!props.editRow) {
          delete saveData.GId
        }
        delete saveData.State
        delete saveData.AlarmType
      } else {
        saveData = {
          ...saveData,
          ParamClass: ParamClassEnum.Value,
          State: saveData.State ?? 1,
          AlarmType: saveData.AlarmType ?? 1,
          Unilateral: saveData.Unilateral ?? 0,
          Precision: saveData.Precision ?? 0,
        }
      }
      callBrige(callFnName.SaveDataGroup, saveData).then((res: any) => {
        window.$message.success(t('config.saveSuccess'))
        if (!isChildMode.value) {
          configStore.setDevDataGroupAddressFormShow(false)
        }
        props.updateParentFn && props.updateParentFn()
        configStore.updateDevDataGroupRowFn && configStore.updateDevDataGroupRowFn()
      })
    }

    const buildCurDataClassOpt = () => {
      if (!curDeviceGroupRow.value) return Promise.resolve([])
      return callBrige(callFnName.GetDataClass, curDeviceGroupRow.value?.DeviceClass).then((res: number[]) => {
        optionMap.DataClass = res.map(e => { return { label: DataClassNameMap[e], value: e } })
      })
    }

    ctx.expose({
      myFormRef,
      // submit
    } as ConnectFormIns)

    watch(() => [curRow.value, props.mode, props.parentRow?.GId, props.editRow?.GId, curDeviceGroupRow.value?.GId], () => {
      initForm()
    }, {
      immediate: true
    })
    onMounted(() => {
      props.getFormRefFn && props.getFormRefFn(myFormRef)
      props.getSubmitFn && props.getSubmitFn(submit)
    })

    return () => {
      return (
        // <div class={'w-[400px] h-[600px] bg-white absolute '}>
        <MyFormWrap key={props.mode + '-' + (props.editRow?.GId || props.parentRow?.GId || curRow.value?.GId || 'new')} ref={myFormRef} optionMap={optionMap} hideBtn={true} form={alldata.form} itemList={itemList.value}></MyFormWrap>
      )
    }
  }

})