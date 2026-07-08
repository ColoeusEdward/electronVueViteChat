import { DialogReactive, NButton, SelectProps, useDialog } from "naive-ui";
import { computed, defineComponent, onMounted, onUpdated, reactive, Ref, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { commonMap2, refreshCommonMap2 } from "../../proto/proto";
import { ConnectComModel, DataAddressEntity, ModbusAdressSubItem } from "~/me";
import { commonFormItemListMap, propNameEnum, refreshCommonFormItemListMap } from "../../devConfig/enum";
import { useConfigStore } from "@/store/config";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";

export type ConnectFormIns = {
  myFormRef: Ref<MyFormWrapIns>,
  // submit: Function
}
const defForm = {

}
const DATA_TYPE_LENGTH_MAP: Record<number, number> = {
  0: 1,
  1: 1,
  2: 2,
  3: 2,
  4: 2,
  6: 1,
}
const DATA_CONVERSION_RADIO_LIST = [
  { label: '先乘后加', value: 0 },
  { label: '先加后乘', value: 1 },
]

const getLengthByDataType = (dataType: unknown) => DATA_TYPE_LENGTH_MAP[Number(dataType)]
export default defineComponent({
  name: 'ModbusForm',
  props: {
    show: Boolean,
    updateShowFn: Function,
    connectStr: String,
    updateParentFn: Function,
    getFormRefFn: Function,
    getSubmitFn: Function
  },
  setup(props, ctx) {
    const dialog = useDialog()
    const show = computed(() => props.show)
    const configStore = useConfigStore()
    const myFormRef = ref<MyFormWrapIns>()
    const curRow = computed(() => configStore.curAddressRow)
    const changeShow = () => {
      props.updateShowFn && props.updateShowFn(false)
    }
    const addressStr = computed(() => configStore.curAddressRow?.AddressString || '')
    const isAdressAddMore = computed(() => configStore.isAdressAddMore)
    const alldata = reactive({
      form: {} as DataAddressEntity,
      curDialogIns: null as DialogReactive | null,
      subItem: null
    })
    const isAdd = computed(() => configStore.addressFormIsAdd)
    // const optionMap: any = reactive({
    //   ...commonMap2
    // })
    const optionMap: any = ref({})

    const buildExchangeItem = (): formListItem => ({
      ...commonFormItemListMap[propNameEnum.Exchange],
      type: 'radio',
      radioType: 'btn',
      radioList: DATA_CONVERSION_RADIO_LIST,
      rule: ['mustNum'],
    })

    const buildItemList = (): formListItem[] => [
      commonFormItemListMap[propNameEnum.Name],
      commonFormItemListMap[propNameEnum.Permission],
      commonFormItemListMap[propNameEnum.State],
      commonFormItemListMap[propNameEnum.SlaveId],
      commonFormItemListMap[propNameEnum.Area],
      commonFormItemListMap[propNameEnum.Index],
      commonFormItemListMap[propNameEnum.DataType],
      commonFormItemListMap[propNameEnum.Length],
      buildExchangeItem(),
      commonFormItemListMap[propNameEnum.Rate],
      commonFormItemListMap[propNameEnum.Offset],
    ]

    const itemList = ref<formListItem[]>(buildItemList())
    const submit = (data: any) => {
      console.log("🪵 [AdressForm.tsx:43] ~ token ~ \x1b[0;32mdata\x1b[0m = ", data);
      // if (isAdressAddMore.value) {

      //   return
      // }
      let subItem: ModbusAdressSubItem = {
        SlaveId: data.SlaveId,
        Area: data.Area,
        Index: data.Index,
        Length: data.Length,
        DataType: data.DataType,
        Exchange: data.Exchange,
        Rate: data.Rate,
        Offset: data.Offset
      }
      data.AddressString = JSON.stringify(subItem)

      callBrige(callFnName.SaveDataAddress, data).then((res: any) => {
        window.$message.success('保存成功')
        if (!isAdressAddMore.value) {
          configStore.setAddressFormShow(false)
        } else {
          let SlaveId = alldata.form.SlaveId || 0
          let Index = alldata.form.Index || 0
          let Length = alldata.form.Length || 0
          alldata.form.Index = Index * 1 + Length * 1
          alldata.form.Name = ""
        }
        // props.updateParentFn && props.updateParentFn()
        configStore.updateAdressRowFn && configStore.updateAdressRowFn()
      })
    }


    const buildDefForm = (): any => {
      return {
        ...defForm,
        DeviceId: configStore.curDevConfigRow?.GId || '',
        Exchange: 0,
      }
    }

    const getData = () => {
      // callBrige(callFnName.GetDataAddresses, configStore.curDevConfigRow?.GId).then((res: any[]) => {
      //   console.log("🪵 [AdressTable.tsx:60] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
      //   alldata.subItem = res
      // })
    }


    ctx.expose({
      myFormRef,
      // submit
    } as ConnectFormIns)

    watch(() => addressStr.value, (v) => {
      // console.log("🪵 [ModbusForm.tsx:81] ~ token ~ \x1b[0;32mv\x1b[0m = ", v);
      // console.log("🪵 [index.tsx:44] ~ token ~ \x1b[0;curDevConfigRow\x1b[0m = ", configStore.curDevConfigRow);
      if (v) {
        if (isAdd.value) {
          alldata.form = { ...buildDefForm(), }
        } else {
          alldata.form = { Exchange: 0, ...curRow.value, ...JSON.parse(v) }
        }

        console.log("🪵 [ModbusForm.tsx:132] ~ token ~ \x1b[0;32malldata.form\x1b[0m = ", alldata.form);
      } else {
        alldata.form = { ...buildDefForm(), }
      }
    }, {
      immediate: true
    })

    //@ts-ignore
    watch(() => alldata.form.DataType, (dataType) => {
      const length = getLengthByDataType(dataType)
      if (length !== undefined) {
        alldata.form.Length = length
      }
      itemList.value = buildItemList()
    })
    watch(() => show.value, (v) => {

    })

    onMounted(() => {

      refreshCommonFormItemListMap()
      // Object.keys(commonMap2).forEach(key => {
      //   optionMap[key] = commonMap2[key]
      // })
      optionMap.value = refreshCommonMap2()
      itemList.value = buildItemList()
      props.getFormRefFn && props.getFormRefFn(myFormRef)
      props.getSubmitFn && props.getSubmitFn(submit)
    })

    return () => {
      return (
        // <div class={'w-[400px] h-[600px] bg-white absolute '}>
        <MyFormWrap ref={myFormRef} optionMap={optionMap.value} hideBtn={true} form={alldata.form} itemList={itemList.value}></MyFormWrap>
      )
    }
  }

})