import LargeBtnIcon from "@/components/LargeBtnIcon";
import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { ArrowBackIosRound, SaveAsRound, } from "@vicons/material";
import { useElementBounding } from "@vueuse/core";
import { NButton, NForm, SelectProps } from "naive-ui";
import { computed, defineComponent, onMounted, reactive, ref, toRefs } from "vue";
import { DeviceConfigEntity } from "~/me";
import { useDevCfgInnerData } from "./innerData";

export default defineComponent({
  name: 'Edit',
  props: {
    row: {
      type: Object
    },
  },
  setup(props, ctx) {
    const innerData = useDevCfgInnerData()
    const editConRef = ref<HTMLDivElement>()
    const {height} = useElementBounding(editConRef)
    const formCfg = reactive({
      form: {} as DeviceConfigEntity,
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
    const getDriverList = () => {
      callSpc('getSupportDevices').then((e: string[]) => {
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

    onMounted(() => {
      innerData.setContentHeight(height.value)
    })
    return () => {
      return (
        <div class={'w-full h-full top-0 left-0 absolute bg-white z-[500] p-2 pb-0'} ref={editConRef}>
          <div class={'flex'}>
            <NButton class={'my-large-btn mr-3'} renderIcon={() => <LargeBtnIcon><ArrowBackIosRound /></LargeBtnIcon>} size={'large'} onClick={cancel}>取消</NButton>
            <NButton class={'my-large-btn mr-3'} renderIcon={() => <LargeBtnIcon><SaveAsRound /></LargeBtnIcon>} type={'primary'} size={'large'} onClick={cancel}>保存</NButton>

          </div>
          <div class={'p-2 pt-5 pb-0'}>
            <MyFormWrap {...formCfg} >

            </MyFormWrap>
          </div>
        </div>
      )
    }
  }

})


//
const DevConfigEdit = defineComponent({
  name: 'DevConfigEdit',
  setup(props, ctx) {
    const innerData = useDevCfgInnerData()
    const height = computed(() => {
      return `${innerData.contentHeight-114-28}px`  //28是各种padding
    })
    const editCfg = () => {

    }

    return () => {
      return (
        <div class={' relative '} style={{height:height.value}}>
          <div class={'h-full flex flex-col'}>
            <div class={'p-2 border-0 border-b border-gray-200 border-solid flex '}>
              <div class={'flex w-[30%] items-center'}>
                <span class={'text-2xl'}>连接配置</span>
                <NButton class={'my-large-btn mr-6 ml-auto'} type={'primary'}  size={'large'} onClick={editCfg}>编辑配置</NButton>

              </div>
              <div class={'flex w-[70%] items-center'}>
                <span class={'text-2xl ml-6'}>数据地址</span>
                <NButton class={'my-large-btn mr-3 ml-auto'} type={'primary'} size={'large'} onClick={editCfg}>添加数据</NButton>
                <NButton class={'my-large-btn mr-3 '} type={'primary'} size={'large'} onClick={editCfg}>编辑数据</NButton>
                <NButton class={'my-large-btn mr-3 '} type={'primary'} size={'large'} onClick={editCfg}>删除数据</NButton>

              </div>
            </div>

            <div class={'h-full flex-shrink'}>
              <div class={' inline-block w-[30%] h-full border-0 border-r border-solid border-gray-200'} ></div>
              <div class={' inline-block w-[70%] h-full'} ></div>
            </div>
          </div>
        </div>
      )
    }
  }
})