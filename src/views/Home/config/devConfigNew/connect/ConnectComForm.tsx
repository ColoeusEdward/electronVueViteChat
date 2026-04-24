import { DialogReactive, NButton, SelectProps, useDialog } from "naive-ui";
import { computed, defineComponent, onMounted, onUpdated, reactive, Ref, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { commonMap2 } from "../../proto/proto";
import { ConnectComModel } from "~/me";
import { commonFormItemListMap, propNameEnum } from "../../devConfig/enum";

export type ConnectFormIns = {
  myFormRef: Ref<MyFormWrapIns>,
  // submit: Function
}

export default defineComponent({
  name: 'ConnectComForm',
  props: {
    show: Boolean,
    updateShowFn: Function,
    connectStr: String,
    updateParentFn: Function,
    getFormRefFn: Function
  },
  setup(props, ctx) {
    const dialog = useDialog()
    const show = computed(() => props.show)
    const myFormRef = ref<MyFormWrapIns>()
    const changeShow = () => {
      props.updateShowFn && props.updateShowFn(false)
    }
    const connectStr = computed(() => props.connectStr)
    const alldata = reactive({
      form: {},
      curDialogIns: null as DialogReactive | null
    })
    const optionMap: any = reactive({
      ...commonMap2
    })
    const itemList = ref<formListItem[]>([
      commonFormItemListMap[propNameEnum.PortName],
      commonFormItemListMap[propNameEnum.BaudRate],
      commonFormItemListMap[propNameEnum.DataBits],
      commonFormItemListMap[propNameEnum.StopBits],
      commonFormItemListMap[propNameEnum.Parity],
      commonFormItemListMap[propNameEnum.SlaveId],
      commonFormItemListMap[propNameEnum.Cycle],
      commonFormItemListMap[propNameEnum.Timeout],
      commonFormItemListMap[propNameEnum.Endian32bit],
      commonFormItemListMap[propNameEnum.Endian16bit],
      // { type: 'select', label: '32位数据高低位', prop: 'Endian32bit', width: 12, rule: 'must' },
      // { type: 'select', label: '16位数据高低位', prop: 'Endian16bit', width: 12, rule: 'must' },
      commonFormItemListMap[propNameEnum.EndianString],
      // { type: 'input', label: '串口名', prop: 'PortName', width: 12, rule: 'must' },
      // // { type: 'select', label: 'Port', prop: 'Port', width: 12, rule: 'must' },
      // { type: 'select', label: '波特率', prop: 'BaudRate', width: 12, rule: 'must' },
      // { type: 'select', label: '数据位', prop: 'DataBits', width: 12, rule: 'must' },
      // { type: 'select', label: '停止位', prop: 'StopBits', width: 12, rule: 'must' },
      // { type: 'select', label: '校验位', prop: 'Parity', width: 12, rule: 'must' },
      // { type: 'input', label: '从站地址', prop: 'SlaveId', width: 12, rule: 'must' },
      // {
      //   type: 'input', label: '采集周期', prop: 'Cycle', width: 12, rule: 'must', suffix: () => {
      //     return <span>ms</span>
      //   }
      // },
      // {
      //   type: 'input', label: '通讯超时', prop: 'Timeout', width: 12, rule: 'must', suffix: () => {
      //     return <span>ms</span>
      //   }
      // },
      // { type: 'select', label: '32位数据高低位', prop: 'Endian32bit', width: 12, rule: 'must' },
      // { type: 'select', label: '16位数据高低位', prop: 'Endian16bit', width: 12, rule: 'must' },
      // { type: 'select', label: '字符串数据高低位', prop: 'EndianString', width: 12, rule: 'must' },

      // { type: 'select', label: 'Interface', prop: 'Interface', width: 6, rule: 'must' },
      // {
      //   type: 'input', label: 'Distance', prop: 'Distance', width: 6, rule: 'must', suffix: () => {
      //     return <span>M</span>
      //   }
      // },

    ])




    ctx.expose({
      myFormRef,
      // submit
    } as ConnectFormIns)

    watch(() => connectStr.value, (v) => {
      if (v) {
        alldata.form = JSON.parse(v)
      } else {
        alldata.form = {}
      }
    }, {
      immediate: true
    })
    watch(() => show.value, (v) => {
      // if (v) {
      //   connectStr.value && (alldata.form = JSON.parse(connectStr.value))
      //   alldata.curDialogIns = dialog.create({
      //     title: '连接配置',
      //     content: () => {
      //       return <div class={'min-h-[170px]'}>
      //         <MyFormWrap ref={myFormRef} optionMap={optionMap} hideBtn={true} form={alldata.form} itemList={itemList.value}></MyFormWrap>
      //       </div>
      //     },
      //     style: { width: '800px', minHeight: '200px', },
      //     action: () => {
      //       return <div class={'flex justify-around items-center w-full'}>
      //         <NButton style={{ width: '45%', height: '40px', fontSize: '30px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true}>取消</NButton>
      //         <NButton style={{ width: '45%', height: '40px', fontSize: '30px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
      //           myFormRef.value?.submit(submit)
      //         }}>确定</NButton>
      //       </div>
      //     },
      //     positiveText: '确定',
      //     negativeText: '取消',
      //     onPositiveClick: () => {
      //       props.updateShowFn && props.updateShowFn(false)
      //     },
      //     onNegativeClick: () => {
      //       props.updateShowFn && props.updateShowFn(false)
      //     },
      //     onClose: () => {
      //       props.updateShowFn && props.updateShowFn(false)
      //       // ctx.emit('update:show', false) 
      //     },
      //     onMaskClick: () => {
      //       props.updateShowFn && props.updateShowFn(false)
      //     }
      //     // onAfterLeave: () => {
      //     //   changeShow()
      //     // }
      //   })
      // } else {
      //   alldata.curDialogIns && alldata.curDialogIns?.destroy()
      // }
    })

    onMounted(() => {
      props.getFormRefFn && props.getFormRefFn(myFormRef)
    })

    return () => {
      return (
        // <div class={'w-[400px] h-[600px] bg-white absolute '}>
        <MyFormWrap ref={myFormRef} optionMap={optionMap} hideBtn={true} form={alldata.form} itemList={itemList.value}></MyFormWrap>
      )
    }
  }

})