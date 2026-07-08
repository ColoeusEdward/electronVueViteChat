import SimpleTable from "@/components/SimpleTable";
import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { useConfigStore } from "@/store/config";
import { DialogReactive, NButton, NDrawer, NDrawerContent, useDialog } from "naive-ui";
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import { DataGroupEntity, simpleTableColumn } from "~/me";
import { useMyI18n } from "@/hooks/useMyI18n";
import { DataClassNameMap, ParamClassNameMap } from "../../enum";
import ModbusForm from "./form/ModbusForm";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'

export default defineComponent({
  name: 'SubDataDrawer',
  props: {
    show: Boolean,
    updateShowFn: Function as PropType<(value: boolean) => void>,
    parentRow: Object as PropType<DataGroupEntity | null | undefined>,
    data: {
      type: Array as PropType<DataGroupEntity[]>,
      default: () => []
    }
  },
  setup(props) {
    const configStore = useConfigStore()
    const { t } = useMyI18n()
    const dialog = useDialog()
    const formRef = ref<MyFormWrapIns>()
    const alldata = reactive({
      curSubmitFn: () => { },
      curDialogIns: null as DialogReactive | null,
      curChildRow: null as DataGroupEntity | null,
      coloumns: [
        { label: t('config.dataName'), prop: 'DataName', flex: 1 },
        { label: t('config.dataType'), prop: 'DataClass', flex: 1, mapFn: (col: any, item: DataGroupEntity) => { return DataClassNameMap[item.DataClass!] } },
        { label: t('config.paramType'), prop: 'ParamClass', flex: 1, mapFn: (col: any, item: DataGroupEntity) => { return ParamClassNameMap[item.ParamClass!] } },
        { label: t('config.unit'), prop: 'Unit', flex: 1 },
      ] as simpleTableColumn[],
    })
    const show = computed({
      get: () => props.show,
      set: (value: boolean) => {
        props.updateShowFn && props.updateShowFn(value)
      }
    })
    const childData = computed(() => {
      return props.parentRow?.GId ? props.data.filter(e => e.ParamId === props.parentRow?.GId) : []
    })
    const hideForm = () => {
      alldata.curDialogIns && alldata.curDialogIns.destroy()
      alldata.curDialogIns = null
    }
    const formCfg = reactive({
      getFormRefFn: (ref: any) => {
        formRef.value = ref.value
      },
      getSubmitFn: (fn: () => void) => {
        alldata.curSubmitFn = fn
      },
      updateParentFn: () => {
        hideForm()
        configStore.updateDevDataGroupRowFn && configStore.updateDevDataGroupRowFn()
      }
    })
    const addClick = () => {
      if (!props.parentRow?.GId) {
        window.$message.error(t('config.pleaseSelectOneRow'))
        return
      }
      alldata.curDialogIns = dialog.create({
        title: '添加子数据',
        content: () => {
          return <div class={'min-h-[170px] relative'}>
            <ModbusForm mode="child" parentRow={props.parentRow} {...formCfg}></ModbusForm>
          </div>
        },
        style: { width: '800px', minHeight: '200px', },
        action: () => {
          return <div class={'flex justify-around items-center w-full'}>
            <NButton style={{ width: '45%', height: '40px', fontSize: '22px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { hideForm() }}>{t('config.cancel')}</NButton>
            <NButton style={{ width: '45%', height: '40px', fontSize: '22px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
              formRef.value?.submit(alldata.curSubmitFn)
            }}>{t('config.confirm')}</NButton>
          </div>
        },
        maskClosable: false,
        onClose: () => {
          hideForm()
        },
        onMaskClick: () => {
          return false
        }
      })
    }
    const rowClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      alldata.curChildRow = item
    }

    return () => {
      return (
        <NDrawer
          v-model:show={show.value}
          height="50vh"
          placement="bottom"
          to="#devDataGroupTableCon"
          trapFocus={false}
          blockScroll={false}
          resizable
        >
          <NDrawerContent title={props.parentRow?.DataName || '子数据'} closable>
            {{
              default: () => (
                <div class={'h-full min-h-[260px] overflow-auto'}>
                  <SimpleTable
                    rowClickFn={rowClick}
                    btnShowList={[1, 0, 0]}
                    addAndEditAndDelFn={[addClick, () => { }, () => { }]}
                    isSmallPadding={true}
                    dat={childData.value}
                    col={alldata.coloumns} />
                </div>
              )
            }}
          </NDrawerContent>
        </NDrawer>
      )
    }
  }
})