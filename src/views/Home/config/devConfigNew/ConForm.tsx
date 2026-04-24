import { DialogReactive, NButton, useDialog } from "naive-ui";
import { computed, defineComponent, PropType, reactive, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import ModbusAddressModelForm from "../devConfig/addressForm/ModbusAddressModelForm";
import { DeviceConfigEntity } from "~/me";
import ConnectComForm, { ConnectFormIns } from "./connect/ConnectComForm";
import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";

export default defineComponent({
  name: 'ConForm  ',
  props: {
    show: Boolean,
    updateShowFn: Function,
    curRow: Object as PropType<DeviceConfigEntity>,
    updateParentFn: Function,
    connectStr: String
  },
  setup(props, ctx) {
    const show = computed(() => props.show)
    const dialog = useDialog()
    const myFormRef = ref<MyFormWrapIns>()
    const alldata = reactive({
      form: {},
      curDialogIns: null as DialogReactive | null,
      curConnectRefType: null
    })
    const getConForm = (driveName: string) => {
      let res = null;
      switch (driveName) {
        case 'Modbus Tcp Client':
          res = ConnectComForm
          break;
        default:
          res = ConnectComForm
          break;
      }
      return res
    }

    const submit = (form: any) => {
      let str = JSON.stringify(form)
      props.updateParentFn && props.updateParentFn({ ConnectString: str })
    }
    {/* <ConnectComForm show={show.value} updateShowFn={props.updateShowFn} connectStr={props.connectStr} ></ConnectComForm> */ }
    watch(() => show.value, (v) => {

      if (v) {
        // connectStr.value && (alldata.form = JSON.parse(connectStr.value))
        alldata.curDialogIns = dialog.create({
          title: '连接配置',
          content: () => {
            return <div class={'min-h-[170px]'}>
              {/* <MyFormWrap ref={myFormRef} optionMap={optionMap} hideBtn={true} form={alldata.form} itemList={itemList.value}></MyFormWrap> */}
              {(() => {
                const targetForm = getConForm(props.curRow?.DriverName || '')
                return <targetForm getFormRefFn={(ref: any) => { myFormRef.value = ref.value }} show={show.value} updateShowFn={props.updateShowFn} connectStr={props.connectStr} ></targetForm>
              })()
              }
            </div>
          },
          maskClosable: false,
          style: { width: '800px', minHeight: '200px', },
          action: () => {
            return <div class={'flex justify-around items-center w-full'}>
              <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { props.updateShowFn && props.updateShowFn(false) }}>取消</NButton>
              <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
                // console.log("🪵 [ConForm.tsx:65] ~ token ~ \x1b[0;myFormRef.value\x1b[0m = ", myFormRef.value!);
                myFormRef.value?.submit(submit)
              }}>确定</NButton>
            </div>
          },
          positiveText: '确定',
          negativeText: '取消',
          onPositiveClick: () => {
            props.updateShowFn && props.updateShowFn(false)
          },
          onNegativeClick: () => {
            props.updateShowFn && props.updateShowFn(false)
          },
          onClose: () => {
            props.updateShowFn && props.updateShowFn(false)
            // ctx.emit('update:show', false) 
          },
          onMaskClick: () => {
            // props.updateShowFn && props.updateShowFn(false)
            return false
          }
          // onAfterLeave: () => {
          //   changeShow()
          // }
        })
      } else {
        alldata.curDialogIns && alldata.curDialogIns?.destroy()
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