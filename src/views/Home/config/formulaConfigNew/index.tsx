import AbsBottomBtn from "@/components/AbsBottomBtn";
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { useMain } from "@/store";
import { useConfigStore } from "@/store/config";
import { useFormulaStore } from "@/store/formula";
import { NButton, NTabPane, NTabs, useDialog } from "naive-ui";
import { defineComponent, reactive, ref } from "vue";
import FormulaList from "./FormulaList";
import FormulaParam from "./FormulaParam";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import { FormulaConfigEntity, FormulaParamEntity } from "~/me";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import DeviceGroupList from "./DeviceGroupList";

export default defineComponent({
  name: 'formulaConfig',
  setup(props, ctx) {
    const AbsBottomBtnFormula = AbsBottomBtn
    const configStore = useConfigStore()
    const dialog = useDialog()
    const store = useMain()
    const formulaStore = useFormulaStore()
    const myFormRef = ref<MyFormWrapIns>()
    const minWidth = store.isLandscape ? '12vw' : '120px'
    const maxWidth = store.isLandscape ? '25vw' : '400px'
    const alldata = reactive({
      curTabValue: 'formula',
      curDialogIns: null as any,
      defaultTab: 'formula',
      commonStyle: {
        maxWidth: maxWidth, fontSize: '20px', minWidth: minWidth, borderTop: '1px solid #58595a', borderRight: '1px solid #58595a', borderLeft: '1px solid #58595a', borderBottom: '1px solid #58595a',
        flexGrow: 1, background: '#fff', borderRadius: '12px 12px 0 0'
      },
      activeStyle: {
        background: `#f5f6f6`,
        backgroundSize: 'cover',
        borderBottom: "0px solid #58595a",
        color: '#000',
        zIndex: 6
      },
      addFormCfg: {
        itemList: [
          { type: 'input', label: '名称', prop: 'PN', width: 24, rule: 'must' },
          { type: 'input', label: '备注', prop: 'Note', width: 24, },
        ] as formListItem[],
        hideBtn: true,
        form: {},
        optionMap: {}

      }
    })

    const handleTabChange = (value: string) => {
      alldata.curTabValue = value
    }

    const cancel = () => {
      formulaStore.setFormulaShow(false)
    }
    const confirm = () => {
      formulaStore.setFormulaShow(false)
    }
    const hideForm = () => {
      if (alldata.curDialogIns) {
        alldata.curDialogIns.destroy()
      }
    }
    const addConfig = () => {
      let item = alldata.addFormCfg.form as FormulaConfigEntity
      item.GroupId = configStore.sysConfig.CurrentGroupId as string
      callBrige(callFnName.SaveFormulaConfig, item).then((res: number) => {
        // console.log("🪵 [index.tsx:70] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        window.$message.success('保存成功')
        formulaStore.updateConfigListFn()
        hideForm()
      })
    }
    const add = () => {
      alldata.curDialogIns = dialog.create({
        title: '新增配方',
        content: () => {
          return <div class={'min-h-[120px] limit-item-width-form'}>
            <MyFormWrap labelWidth={220} ref={myFormRef} {...alldata.addFormCfg} ></MyFormWrap>

          </div>
        },
        maskClosable: false,
        style: { width: '800px', minHeight: '200px', },
        action: () => {
          return <div class={'flex justify-around items-center w-full'}>
            <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { hideForm() }}>取消</NButton>
            <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
              // console.log("🪵 [ConForm.tsx:65] ~ token ~ \x1b[0;myFormRef.value\x1b[0m = ", myFormRef.value!);
              myFormRef.value?.submit(addConfig)
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
    }
    const del = () => {
      if (!formulaStore.curFormulaConfigRow) {
        window.$message.warning('请先选择要删除的配方')
        return
      }
      callBrige(callFnName.DeleteFormulaConfig, formulaStore.curFormulaConfigRow.GId).then((res: number) => {
        window.$message.success('删除成功')
        formulaStore.updateConfigListFn()
      })
    }
    const save = () => {
      let formMap = formulaStore.getParamFormMapFn() as unknown as Record<string, FormulaParamEntity>
      // console.log("🪵 [index.tsx:130] ~ token ~ \x1b[0;32mformMap\x1b[0m = ", formMap);
      callBrige(callFnName.SaveFormulaParams, Object.values(formMap)).then((res: number) => {
        window.$message.success('保存成功')
        formulaStore.updateConfigListFn()
      })
      let configList = formulaStore.getFormulaListFn()
      let applyItem = configList.find(e => e.GId == configStore.sysConfig.CurrentFormulaId)
      if (applyItem) {
        formulaStore.applayFormulaConfigFn(applyItem)
      }
    }

    {/* border-0 border-t border-gray-600 border-solid */ }

    return () => {
      // bg-[#f5f6f6]
      //  <div class={'h-full p-2  '}>

      //               </div>
      return (
        <div class={' bg-white w-screen h-screen absolute  flex flex-col z-10  overflow-hidden'}>
          <div class={'flex  '} style={{ height: 'calc(100% - 80px)' }}>
            <div class={'flex-1 p-2 h-full'}>
              <div class={'h-full bg-[#f5f6f6]'}>
                <NTabs value={alldata.curTabValue} type="card" animated size="large" barWidth={1148} pane-class={'shrink-0 h-full'} class={'config-tab h-full w-full'} onUpdateValue={handleTabChange} defaultValue={alldata.defaultTab} >
                  <NTabPane displayDirective="show:lazy" name={"formula"} tab="配方" tabProps={{ style: { ...alldata.commonStyle, ...alldata.curTabValue == 'formula' ? alldata.activeStyle : {} } }}>
                    <div style={{ height: 'calc(100vh - 160px)' }} class={'w-full h-full p-2 border-0 border-l border-r border-b border-gray-600 border-solid rounded-xl rounded-t-none'}>
                      <div class={'h-full w-[58%] inline-block'}>
                        <FormulaList />

                      </div>
                      <div class={'h-full w-[41%] inline-block ml-2'}>
                        <DeviceGroupList />
                      </div>

                    </div>
                    {/* 
                    <div class={' h-full  bg-[#f5f6f6] border border-gray-600 border-solid  rounded-xl overflow-hidden'}>
                    </div> */}

                  </NTabPane>
                </NTabs>
              </div>
            </div>

            <div class={'flex-1'}>
              <div class={'flex-1 p-2 h-full'}>
                <div class={'h-full bg-[#f5f6f6]'}>
                  <FormulaParam />
                </div>
              </div>
            </div>
          </div>

          <AbsBottomBtn class={'flex-shrink-0'} type={'formula'} cancelFn={cancel} confirmFn={confirm} otherFnGroup={{ addFn: add, delFn: del, saveFn: save }} />
        </div>
      )
    }
  }

})