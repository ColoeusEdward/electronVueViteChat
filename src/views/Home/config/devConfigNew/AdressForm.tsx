import { DialogReactive, NButton, NSwitch, useDialog } from "naive-ui";
import { computed, defineComponent, PropType, reactive, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import ModbusAddressModelForm from "../devConfig/addressForm/ModbusAddressModelForm";
import { DeviceConfigEntity, ModbusAdressSubItem } from "~/me";
import { useConfigStore } from "@/store/config";
import ModbusForm from "./address/ModbusForm";
import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";

export default defineComponent({
  name: 'AdressForm',
  props: {
    updateShowFn: Function,
    // curRow: Object as PropType<DeviceConfigEntity>,
  },
  setup(props, ctx) {
    const configStore = useConfigStore()
    const dialog = useDialog()
    const formRef = ref<MyFormWrapIns>()
    const alldata = reactive({
      form: {},
      curDialogIns: null as DialogReactive | null,
      curSubmitFn: () => { },
      isMoreAdd: false
    })
    const isAddMore = computed(() => {
      return configStore.isAdressAddMore
    })
    const show = computed(() => {
      return configStore.addressFormShow
    })
    const formCfg = reactive({
      getFormRefFn: (ref: any) => {
        formRef.value = ref.value
      },
      getSubmitFn: (fn: () => void) => {
        alldata.curSubmitFn = fn
      },
    })
    const curDevRow = computed(() => configStore.curDevConfigRow)
    const curAddressRow = computed(() => configStore.curAddressRow)
    const getAdressForm = (driveName: string) => {
      switch (driveName) {
        case 'Modbus Tcp Client':
          return <ModbusForm {...formCfg} ></ModbusForm>
        default:
          break;
      }
    }

    const hideForm = () => {
      configStore.setAddressFormShow(false)
    }
    watch(() => show.value, (v) => {

      if (v) {
        // connectStr.value && (alldata.form = JSON.parse(connectStr.value))
        alldata.curDialogIns = dialog.create({
          title: '数据地址',
          content: () => {
            return <div class={'min-h-[170px] relative'}>
              {
                !curAddressRow.value?.GId &&
                <div class={'absolute -top-9 left-32'}>
                  <NSwitch value={isAddMore.value} onUpdate:value={(v: boolean) => {
                    configStore.setIsAdressAddMore(v)
                  }} size={'large'} v-slots={{
                    checked: () => { return <div >连续添加</div> },
                    unchecked: () => { return <div class={'text-black'}>连续添加</div> }
                  }} />
                </div>
              }

              {/* <MyFormWrap ref={myFormRef} optionMap={optionMap} hideBtn={true} form={alldata.form} itemList={itemList.value}></MyFormWrap> */}
              {getAdressForm(curDevRow.value?.DriverName || '')}
            </div>
          },
          style: { width: '800px', minHeight: '200px', },
          action: () => {
            return <div class={'flex justify-around items-center w-full'}>
              <NButton style={{ width: '45%', height: '40px', fontSize: '22px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { hideForm() }}>取消</NButton>
              <NButton style={{ width: '45%', height: '40px', fontSize: '22px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
                formRef.value?.submit(alldata.curSubmitFn)
              }}>确定</NButton>
            </div>
          },
          positiveText: '确定',
          negativeText: '取消',
          maskClosable: false,
          onPositiveClick: () => {
            hideForm()
          },
          onNegativeClick: () => {
            hideForm()
          },
          onClose: () => {
            hideForm()
            // ctx.emit('update:show', false) 
          },
          onMaskClick: () => {
            // hideForm()
            return false
          }
          // onAfterLeave: () => {
          //   changeShow()
          // }
        })
      } else {
        alldata.curDialogIns && alldata.curDialogIns?.destroy()
        configStore.setIsAdressAddMore(false)
      }
    })
    return () => {
      return (
        <div class={'w-full h-full'}>

        </div>
      )
    }
  }

})