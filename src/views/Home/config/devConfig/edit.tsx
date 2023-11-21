import LargeBtnIcon from "@/components/LargeBtnIcon";
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { sleep } from "@/utils/utils";
import { ArrowBackIosRound, SaveAsRound, } from "@vicons/material";
import { useElementBounding, watchOnce } from "@vueuse/core";
import { NButton, NForm, SelectProps, useMessage } from "naive-ui";
import { computed, defineComponent, nextTick, onMounted, reactive, ref, toRefs, watch } from "vue";
import { DeviceConfigEntity } from "~/me";
import DevConfigEdit from "./DevConfigEdit";
import { useDevCfgInnerData } from "./innerData";

export default defineComponent({
  name: 'Edit',
  props: {
    row: {
      type: Object
    },
  },
  setup(props, ctx) {
    const data = reactive({
      saveLoading: false
    })
    const innerData = useDevCfgInnerData()
    const editConRef = ref<HTMLDivElement>()
    const MyFormWrapRef = ref<MyFormWrapIns>()
    const msg = useMessage()
    const { height } = useElementBounding(editConRef)
    const formCfg = reactive({
      form: innerData.devConfigForm,
      optionMap: {} as Record<string, SelectProps['options']>,
      itemList: [
        { type: 'input', label: '设备名称', prop: 'Name', width: 12, rule: ['must'] },
        { type: 'select', label: '设备驱动', prop: 'DriverName', width: 12, rule: ['must'] },
        {
          type: 'free', width: 24, renderComp: () => {
            return (
              <DevConfigEdit />
            )
          }
        }
      ] as formListItem[],
      hideBtn: true
    })

    // watch(() => innerData.devConfigForm, (val) => {
    //   console.log("🚀 ~ file: edit.tsx:48 ~ watch ~ val:", val)
    //   formCfg.form = val
    //   // Object.assign(formCfg.form, val)
    // })
    const getDriverList = () => {
      callSpc(callFnName.getSupportDevices).then((e: string[]) => {
        // console.log("🚀 ~ file: edit.tsx:49 ~ callSpc ~ e:", e)
        formCfg.optionMap.DriverName = e.map(e => {
          return {
            label: e,
            value: e
          }
        })
      })
    }
    getDriverList()
    const cancel = () => {
      innerData.setEditShow(false)
    }
    const save = () => {
      if (!innerData.devConfigForm.ConnectConfig) {
        msg.warning('请补全连接配置')
        return
      }
      if (!innerData.devConfigForm.AddressConfigs) {
        msg.warning('请补全数据地址配置')
        return
      }
      data.saveLoading = true
      MyFormWrapRef.value?.submit().then(() => {
        let form = innerData.devConfigForm
        if (form.State == undefined || form.State == null) {
          form.State = 1
        }
        return callSpc(callFnName.saveDeviceConfig, form)
      }).then((res: number) => {
        innerData.setEditShow(false)
        innerData.resetFn()
      }).finally(() => {
        data.saveLoading = false
      })
    }
    // watchOnce(() => innerData.editShow,() => {
    //   // sleep(200).then(() => {
    //   // })
    // })
    onMounted(() => {
      innerData.setContentHeight(height.value)
      // formCfg.form = innerData.devConfigForm
      // console.log("🚀 ~ file: edit.tsx:99 ~ onMounted ~ innerData.devConfigForm:", innerData.devConfigForm)
      // console.log("🚀 ~ file: edit.tsx:47 ~ setup ~ formCfg:", formCfg.form)
      // sleep(200).then(() => {
      //   console.log("🚀 ~ file: edit.tsx:99 ~ onMounted ~ innerData.devConfigForm:", innerData.devConfigForm)
      // })

    })
    return () => {
      return (
        <div class={'w-full h-full top-0 left-0 absolute bg-white z-[500] p-2 pb-0'} ref={editConRef}>
          <div class={'flex'}>
            <NButton class={'my-large-btn mr-3'} renderIcon={() => <LargeBtnIcon><ArrowBackIosRound /></LargeBtnIcon>} size={'large'} onClick={cancel}>取消</NButton>
            <NButton loading={data.saveLoading} class={'my-large-btn mr-3'} renderIcon={() => <LargeBtnIcon><SaveAsRound /></LargeBtnIcon>} type={'primary'} size={'large'} onClick={save}>保存</NButton>

          </div>
          <div class={'p-2 pt-5 pb-0'}>
            <MyFormWrap ref={MyFormWrapRef} {...formCfg} >

            </MyFormWrap>
          </div>
        </div>
      )
    }
  }

})


//
