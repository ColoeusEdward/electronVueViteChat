import { useConfigStore } from "@/store/config";
import { DialogReactive, NButton, NSpace, NTab, NTag, useDialog } from "naive-ui";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import SimpleTable from "@/components/SimpleTable";
import { DataGroupEntity, DeviceConfigEntity, ModbusAdressRow, simpleTableColumn } from "~/me";
import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { dataClassOptions, deviceClassOptions } from "../enum";
import { ajaxPromiseAll } from "@/utils/utils";


export default defineComponent({
  name: 'AdressChooseList',
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
      form: {} as { AddressIds: string[] },
      itemList: [
        {
          type: 'checkbox', label: '地址勾选', prop: "AddressIds", width: 24, checkboxList: [
            // { label: 'Modbus Tcp Client', value: 'Modbus Tcp Client' },
          ], rule: ['mustArr']
        },
      ] as formListItem[],
      filterList: [] as { label: string, value: string }[],
    })
    const show = computed(() => configStore.AdressChooseShow)
    const curDataGroupRow = computed(() => configStore.curDataGroupRow)
    const hideForm = () => {
      configStore.setAdressChooseShow(false)
    }
    const submit = () => {
      let dat: DataGroupEntity = { ...curDataGroupRow.value!, AddressIds: JSON.stringify(alldata.form.AddressIds) }
      console.log("🪵 [DevChooseList.tsx:39] ~ token ~ \x1b[0;32mdat\x1b[0m = ", dat);
      callBrige(callFnName.SaveDataGroup, dat).then((res: any[]) => {
        window.$message.success('保存成功')
        hideForm()
        configStore.updateDataGroupRowFn()

        //updatefn
      })
    }

    const getAdressist = () => {
      let devIdList: string[] = curDataGroupRow.value?.DeviceIds ? JSON.parse(curDataGroupRow.value?.DeviceIds) : []
      // let adressList = JSON.parse(curDataGroupRow.value?.AddressIds || '[]') as string[]
      console.log("🪵 [AdressChooseList.tsx:51] ~ token ~ \x1b[0;32madressList\x1b[0m = ", devIdList);
      return ajaxPromiseAll(devIdList.map(e => callBrige(callFnName.GetDataAddresses, e))).then((ress: ModbusAdressRow[][]) => {
        let finalList = [] as { label: string, value: string }[]
        ress.forEach((res, i) => {
          let list = res.map(e => {
            let devClass = (deviceClassOptions.find(ee => ee.value == e.DeviceClass) || {}).label
            let dataclass = (dataClassOptions.find(ee => ee.value == e.DataClass) || {}).label
            return { label: e.DataName + ` (${dataclass}/${devClass})`, value: e.GId! }
          })
          finalList.push(...list)
        })
        alldata.itemList[0].checkboxList = finalList
        // console.log("🪵 [AdressChooseList.tsx:66] ~ token ~ \x1b[0;32mfinalList\x1b[0m = ", finalList);

      })
      // callBrige(callFnName.GetDataAddressesWithIds, curDataGroupRow.value?.AddressIds).then((res: ModbusAdressRow[]) => {
      //   alldata.itemList[0].checkboxList = res.map(e => {
      //     let devClass = (deviceClassOptions.find(ee => ee.value == e.DeviceClass) || {}).label
      //     let dataclass = (dataClassOptions.find(ee => ee.value == e.DataClass) || {}).label
      //     return { label: e.DataName + `(${devClass}/${dataclass})`, value: e.GId! }
      //   })
      // })
    }
    const initAdressChooseList = () => {
      let listStr = curDataGroupRow.value?.AddressIds
      console.log("🪵 [AdressChooseList.tsx:80] ~ token ~ \x1b[0;32mlistStr\x1b[0m = ", listStr);
      let list = curDataGroupRow.value?.AddressIds ? JSON.parse(curDataGroupRow.value?.AddressIds) : []
      // console.log("🪵 [AdressChooseList.tsx:78] ~ token ~ \x1b[0;32mlist\x1b[0m = ", list);
      alldata.form = { AddressIds: list }
      alldata.filterList = alldata.itemList[0].checkboxList!.filter(e => listStr!.includes(e.value))
      console.log("🪵 [AdressChooseList.tsx:85] ~ token ~ \x1b[0;32malldata.filterList \x1b[0m = ", alldata.filterList);
    }
    watch(() => show.value, (v) => {

      if (v) {
        getAdressist().then(() => {
          initAdressChooseList()
          alldata.curDialogIns = dialog.create({
            title: '查看地址',
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
              hideForm()
              // props.updateShowFn && props.updateShowFn(false)
              // return false
            }
            // onAfterLeave: () => {
            //   changeShow()
            // }
          })
        })
        // connectStr.value && (alldata.form = JSON.parse(connectStr.value))

      } else {
        alldata.curDialogIns && alldata.curDialogIns?.destroy()
      }
    })

    // watch(() => configStore.configTab, (v) => {
    //   if(v == '')
    // })
    return () => {
      return (
        <div >

        </div>
      )
    }
  }

})