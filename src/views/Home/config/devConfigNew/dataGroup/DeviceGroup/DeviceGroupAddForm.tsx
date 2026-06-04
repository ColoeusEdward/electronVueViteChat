import { DialogReactive, NButton, useDialog } from "naive-ui";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import { useConfigStore } from "@/store/config";
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { deviceClassOptions, refreshDeviceClassOptions } from "../../enum";
import { useMyI18n } from "@/hooks/useMyI18n";
// import { } from "./enum";
// import { defaultConnectComModel } from "../devConfig/enum";


export default defineComponent({
  name: 'DeviceGroupAddForm',
  props: {
    show: Boolean
  },
  setup(props, ctx) {
    const configStore = useConfigStore()
    const { t, i18nStore } = useMyI18n()
    const myFormRef = ref<MyFormWrapIns>()
    const show = computed(() => configStore.DeviceGroupAddFromShow)
    const dialog = useDialog()
    const alldata = reactive({
      form: {},
      curDialogIns: null as DialogReactive | null,
      itemList: [
        {
          type: 'input', label: t('config.deviceName'), prop: "DeviceName", width: 24, rule: ['must'],
        },
        { type: 'select', label: t('config.deviceType'), prop: "DeviceClass", width: 12, rule: ['mustNum'], },
        // { type: 'switch', label: '状态', prop: "State", width: 12, rule: ['must'], }
        // {
        //   type: 'text', label: '*', prop: "", text: '( 设备集合与地址集合 由后端根据当前启用的设备和地址自动进行配置 )', width: 24
        // }
      ] as formListItem[],
      optionMap: {
        DeviceClass: deviceClassOptions
      }
    })
    const hideForm = () => {
      configStore.setDeviceGroupAddFormShow(false)
    }
    const submit = (form: any) => {
      form.GroupId = configStore.curGroupConfigRow?.GId
      // console.log("🪵 [addForm.tsx:31] ~ token ~ \x1b[0;32mform\x1b[0m = ", form);
      // form.ConnectString = JSON.stringify(defaultConnectComModel)
      callBrige(callFnName.SaveDeviceGroup, form).then((res: any[]) => {
        hideForm()
        window.$message.success(t('config.saveSuccess'))
        configStore.updateDevGroupRowFn()
      })
    }
    watch(() => show.value, (v) => {
      console.log("🪵 [DeviceGroupAddForm.tsx:49] ~ token ~ \x1b[0;32mv\x1b[0m = ", v);

      if (v) {
        // 刷新 deviceClassOptions 的国际化文本
        refreshDeviceClassOptions()
        // connectStr.value && (alldata.form = JSON.parse(connectStr.value))
        alldata.curDialogIns = dialog.create({
          title: t('config.addDevice'),
          content: () => {
            return <div class={'min-h-[170px]'}>
              <MyFormWrap ref={myFormRef} optionMap={alldata.optionMap} hideBtn={true} form={alldata.form} itemList={alldata.itemList}></MyFormWrap>

            </div>
          },
          maskClosable: false,
          style: { width: '800px', minHeight: '200px', },
          action: () => {
            return <div class={'flex justify-around items-center w-full'}>
              <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { hideForm() }}>{t('config.cancel')}</NButton>
              <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
                // console.log("🪵 [ConForm.tsx:65] ~ token ~ \x1b[0;myFormRef.value\x1b[0m = ", myFormRef.value!);
                myFormRef.value?.submit(submit)
              }}>{t('config.confirm')}</NButton>
            </div>
          },
          positiveText: t('config.confirm'),
          negativeText: t('config.cancel'),
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