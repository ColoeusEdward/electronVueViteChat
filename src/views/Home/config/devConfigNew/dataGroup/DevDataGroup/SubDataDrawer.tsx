import SimpleTable from "@/components/SimpleTable";
import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { useConfigStore } from "@/store/config";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { DialogReactive, NButton, NDrawer, NDrawerContent, useDialog } from "naive-ui";
import { computed, defineComponent, PropType, reactive, ref, watch } from "vue";
import { DataGroupEntity, simpleTableColumn } from "~/me";
import { useMyI18n } from "@/hooks/useMyI18n";
import { DataClassNameMap, ParamClassEnum, paramClassOptions, refreshParamClassOptions } from "../../enum";
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
    const curDeviceGroupRow = computed(() => configStore.curDeviceGroupRow)
    const rowClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      alldata.curChildRow = item
    }
    const updateRow = (dat: Partial<DataGroupEntity>) => {
      if (!alldata.curChildRow?.GId) return
      const data: DataGroupEntity = {
        ...alldata.curChildRow,
        ...dat,
        ParamId: props.parentRow?.GId,
      }
      callBrige(callFnName.SaveDataGroup, data).then(() => {
        window.$message.success(t('config.saveSuccess'))
        configStore.updateDevDataGroupRowFn && configStore.updateDevDataGroupRowFn()
      })
    }
    const dataClassSelect = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      updateRow({ DataClass: item.DataClass })
    }
    const paramClassSelect = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      updateRow({ ParamClass: item.ParamClass })
    }
    const deleteClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      if (!item?.GId) {
        window.$message.error(t('config.pleaseSelectOneRow'))
        return
      }
      callBrige(callFnName.DeleteDataGroup, item.GId).then(() => {
        window.$message.success(t('config.deleteSuccess'))
        configStore.updateDevDataGroupRowFn && configStore.updateDevDataGroupRowFn()
      })
    }
    const alldata = reactive({
      curSubmitFn: () => { },
      curDialogIns: null as DialogReactive | null,
      curChildRow: null as DataGroupEntity | null,
      coloumns: [
        {
          label: t('config.dataName'), prop: 'DataName', flex: 1, isInput: true,
          inputUpdateFn: (col, item) => {
            if (item) {
              rowClick(col, item)
              updateRow({ DataName: item.DataName })
            }
          }
        },
        // { label: t('config.dataType'), prop: 'DataClass', flex: 1, isSelect: true, selectOption: [], btnFn: dataClassSelect },
        { label: t('config.paramType'), prop: 'ParamClass', flex: 1, isSelect: true, selectOption: [], btnFn: paramClassSelect },
        // {
        //   label: t('config.unit'), prop: 'Unit', flex: 1, isInput: true,
        //   inputUpdateFn: (col, item) => {
        //     if (item) {
        //       rowClick(col, item)
        //       updateRow({ Unit: item.Unit })
        //     }
        //   }
        // },
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
    const buildCurDataClassOpt = () => {
      if (!curDeviceGroupRow.value) return Promise.resolve([])
      return callBrige(callFnName.GetDataClass, curDeviceGroupRow.value?.DeviceClass).then((res: number[]) => {
        alldata.coloumns.find(e => e.prop === 'DataClass')!.selectOption = res.map(e => { return { label: DataClassNameMap[e], value: e } })
      })
    }
    const buildParamClassOpt = () => {
      refreshParamClassOptions()
      alldata.coloumns.find(e => e.prop === 'ParamClass')!.selectOption = paramClassOptions.filter(e => e.value !== ParamClassEnum.Value)
    }
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
    const openForm = (editRow?: DataGroupEntity | null) => {
      if (!props.parentRow?.GId) {
        window.$message.error(t('config.pleaseSelectOneRow'))
        return
      }
      alldata.curDialogIns = dialog.create({
        title: editRow ? '编辑子数据' : '添加子数据',
        content: () => {
          return <div class={'min-h-[170px] relative'}>
            <ModbusForm mode="child" parentRow={props.parentRow} editRow={editRow} {...formCfg}></ModbusForm>
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
    const addClick = () => {
      openForm(null)
    }
    const editClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      if (!item?.GId) {
        window.$message.error(t('config.pleaseSelectOneRow'))
        return
      }
      openForm(item)
    }

    watch(() => curDeviceGroupRow.value?.GId, () => {
      buildCurDataClassOpt()
    }, { immediate: true })
    buildParamClassOpt()

    return () => {
      return (
        <NDrawer
          v-model:show={show.value}
          height="80%"
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
                    btnShowList={[1, 1, 1]}
                    addAndEditAndDelFn={[addClick, editClick, deleteClick]}
                    isSmallPadding={true}
                    dat={childData.value as any}
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