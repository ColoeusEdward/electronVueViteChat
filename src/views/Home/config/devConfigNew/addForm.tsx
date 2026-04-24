import { DialogReactive, NButton, useDialog } from "naive-ui";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import { useConfigStore } from "@/store/config";
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { } from "./enum";
import { defaultConnectComModel } from "../devConfig/enum";


export default defineComponent({
  name: 'addForm',
  props: {
    show: Boolean
  },
  setup(props, ctx) {
    const configStore = useConfigStore()
    const myFormRef = ref<MyFormWrapIns>()
    const show = computed(() => configStore.addFormShow)
    const dialog = useDialog()
    const alldata = reactive({
      form: {},
      curDialogIns: null as DialogReactive | null,
      itemList: [
        {
          type: 'radio', label: '设备类型', prop: "DriverName", width: 24, radioList: [
            { label: 'Modbus Tcp Client', value: 'Modbus Tcp Client' },
          ], radioType: 'def', rule: ['must']
        },
      ] as formListItem[],
    })
    const hideForm = () => {
      configStore.setAddFormShow(false)
    }
    const submit = (form: any) => {
      // console.log("🪵 [addForm.tsx:31] ~ token ~ \x1b[0;32mform\x1b[0m = ", form);
      form.ConnectString = JSON.stringify(defaultConnectComModel)
      callBrige(callFnName.SaveDevcieConfig, form).then((res: any[]) => {
        hideForm()
        window.$message.success('保存成功')
        configStore.updateDevConfigRowFn()
      })
    }
    watch(() => show.value, (v) => {

      if (v) {
        // connectStr.value && (alldata.form = JSON.parse(connectStr.value))
        alldata.curDialogIns = dialog.create({
          title: '新增设备',
          content: () => {
            return <div class={'min-h-[170px]'}>
              <MyFormWrap ref={myFormRef} optionMap={{}} hideBtn={true} form={alldata.form} itemList={alldata.itemList}></MyFormWrap>

            </div>
          },
          maskClosable: false,
          style: { width: '800px', minHeight: '200px', },
          action: () => {
            return <div class={'flex justify-around items-center w-full'}>
              <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { hideForm() }}>取消</NButton>
              <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
                // console.log("🪵 [ConForm.tsx:65] ~ token ~ \x1b[0;myFormRef.value\x1b[0m = ", myFormRef.value!);
                myFormRef.value?.submit(submit)
              }}>确定</NButton>
            </div>
          },
          positiveText: '确定',
          negativeText: '取消',
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
        <div></div>
      )
    }
  }

})