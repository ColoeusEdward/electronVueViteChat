import { useConfigStore } from "@/store/config";
import { DialogReactive, NButton, NSpace, NTag, useDialog } from "naive-ui";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import SimpleTable from "@/components/SimpleTable";
import { DataGroupEntity, DeviceConfigEntity, simpleTableColumn } from "~/me";
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";


export default defineComponent({
  name: 'DevChooseList',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const dialog = useDialog()
    const myFormRef = ref<MyFormWrapIns>()
    const alldata = reactive({
      curDialogIns: null as DialogReactive | null,
      data: [],
      coloumns: [
        { label: '设备名称', prop: 'Name', flex: 2, },
      ] as simpleTableColumn[],
      form: {} as { DeviceIds: string[] },
      itemList: [
        {
          type: 'checkbox', label: '设备勾选', prop: "DeviceIds", width: 24, checkboxList: [
            // { label: 'Modbus Tcp Client', value: 'Modbus Tcp Client' },
          ], rule: ['mustArr']
        },
      ] as formListItem[],
      filterList: [] as { label: string, value: string }[],
    })
    const show = computed(() => configStore.DevChooseShow)
    const curDataGroupRow = computed(() => configStore.curDataGroupRow)
    const hideForm = () => {
      configStore.setDevChooseShow(false)
    }
    const submit = () => {
      console.log("🪵 [DevChooseList.tsx:39] ~ token ~ \x1b[0;32malldata.form.DeviceIds\x1b[0m = ", alldata.form.DeviceIds);
      let dat: DataGroupEntity = { ...curDataGroupRow.value!, DeviceIds: JSON.stringify(alldata.form.DeviceIds) }
      console.log("🪵 [DevChooseList.tsx:39] ~ token adttt ~ \x1b[0;32mdat\x1b[0m = ", dat);
      callBrige(callFnName.SaveDataGroup, dat).then((res: any[]) => {
        window.$message.success('保存成功')
        hideForm()
        configStore.updateDataGroupRowFn()
        //updatefn
      })
    }
    const getDevList = () => {
      return callBrige(callFnName.GetDevcieConfigs).then((res: DeviceConfigEntity[]) => {

        alldata.itemList[0].checkboxList = res.map(e => ({ label: e.Name + ` (${e.DriverName})`, value: e.GId! }))
      })
    }
    const initDevChooseList = () => {
      let devStr = curDataGroupRow.value?.DeviceIds
      let list = curDataGroupRow.value?.DeviceIds ? JSON.parse(curDataGroupRow.value?.DeviceIds) : []
      alldata.form = { DeviceIds: list }
      alldata.filterList = alldata.itemList[0].checkboxList!.filter(e => devStr!.includes(e.value))
    }
    watch(() => show.value, (v) => {

      if (v) {
        getDevList().then(() => {
          initDevChooseList()
          // connectStr.value && (alldata.form = JSON.parse(connectStr.value))
          alldata.curDialogIns = dialog.create({
            title: '查看设备',
            content: () => {
              return <div class={'min-h-[170px] max-h-[700px] overflow-auto'}>
                {/* <MyFormWrap ref={myFormRef} optionMap={{}} hideBtn={true} form={alldata.form} itemList={alldata.itemList}></MyFormWrap> */}
                {/* <SimpleTable dat={alldata.data} col={alldata.coloumns}></SimpleTable> */}
                <NSpace>
                  {
                    alldata.filterList.map((e, i) => {
                      return <NTag >{e.label}</NTag>
                    })
                  }
                </NSpace>
              </div>
            },
            maskClosable: false,
            style: { width: '800px', minHeight: '200px', },
            action: () => {
              return <div class={'flex justify-around items-center w-full'}>
                <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { hideForm() }}>取消</NButton>
                {/* <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
                  // console.log("🪵 [ConForm.tsx:65] ~ token ~ \x1b[0;myFormRef.value\x1b[0m = ", myFormRef.value!);
                  myFormRef.value?.submit(submit)
                }}>确定</NButton> */}
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
              hideForm()

            }
            // onAfterLeave: () => {
            //   changeShow()
            // }
          })
        })

      } else {
        alldata.curDialogIns && alldata.curDialogIns?.destroy()
      }
    })

    return () => {
      return (
        <div >

        </div>
      )
    }
  }

})