import { useConfigStore } from "@/store/config";
import { DialogReactive, NButton, useDialog } from "naive-ui";
import { computed, defineComponent, Transition, ref, watch, reactive } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import SimpleTable from "@/components/SimpleTable";
import { DataGroupEntity, DeviceConfigEntity, DeviceGroupEntity, DataAddressEntity, simpleTableColumn } from "~/me";
import { DataClassEnum, DataClassNameMap, DeviceClassNameMap, ParamClassNameMap } from "../../enum";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { AreaList, DataTypeList } from "../../../devConfig/enum";
import { ajaxPromiseAll } from "@/utils/utils";

export default defineComponent({
  name: 'DevList',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const dialog = useDialog()
    const myFormRef = ref<MyFormWrapIns>()
    const devDataGroupDevListShow = computed(() => configStore.devDataGroupDevListShow)
    const curDeviceGroupRow = computed(() => configStore.curDeviceGroupRow)
    const DevRowClick = (row: simpleTableColumn, item: DeviceGroupEntity) => {
      console.log("🪵 [index.tsx:38] ~ token ~ \x1b[0;32mitem\x1b[0m = ", item);
      // configStore.setCurDeviceGroupRow(item)
      alldata.curDev = item
      getDataAdressList()
    }
    const adressChoose = (row: simpleTableColumn, item: DataAddressEntity) => {
      console.log("🪵 [DevList.tsx:25] ~ token ~ \x1b[0;32mitem.isChoose\x1b[0m = ", item.isChoose);
      item.isChoose = !item.isChoose
      alldata.adressData = [...alldata.adressData]
    }
    const alldata = reactive({
      curDialogIns: null as DialogReactive | null,
      form: {} as any,
      itemList: [
        {
          type: 'input', label: '设备名称', prop: "Name", width: 12, rule: ['must'],
        },
      ],
      data: [] as DeviceConfigEntity[],
      coloumns: [
        { label: '设备名称', prop: 'Name', flex: 2, },
        { label: '设备类型', prop: 'DriverName', flex: 2, },
        { label: '', prop: 'op', flex: 1, btnText: '选择', btnFn: DevRowClick },
      ] as simpleTableColumn[],
      curDev: null as DeviceGroupEntity | null,

      adressData: [] as DataAddressEntity[],
      adressColoumns: [
        { label: '数据名称', prop: 'Name', flex: 1, isInput: true, },
        { label: '区域', prop: 'adressItem.Area', flex: 2, mapFn: (col: any, item: DataAddressEntity) => { return AreaList.find(a => a.value == item.adressItem?.Area)?.label } },
        { label: '类型', prop: 'adressItem.DataType', flex: 2, mapFn: (col: any, item: DataAddressEntity) => { return DataTypeList.find(a => a.value == item.adressItem?.DataType)?.label } },
        { label: '', prop: 'isChoose', flex: 1, isRadio: true, btnFn: adressChoose, mapFn: (col: any, item: DataAddressEntity) => { return item.isChoose ? '已选中' : '选择' } },
        // { label: '数据分类', prop: 'DeviceClass', flex: 2, mapFn: (col: any, item: DataAddressEntity) => { return DeviceClassNameMap[item.DeviceClass] } },
        // { label: '数据类型', prop: 'DataClass', flex: 2, mapFn: (col: any, item: DataAddressEntity) => { return DataClassNameMap[item.DataClass] } },
        // { label: '参数类型', prop: 'ParamClass', flex: 2, mapFn: (col: any, item: DataAddressEntity) => { return ParamClassNameMap[item.ParamClass] } },


      ] as simpleTableColumn[],
      curDataClass: [],
    })
    const hideForm = () => {
      configStore.setDevDataGroupDevListShow(false)
    }
    const backDevChoose = () => {
      alldata.curDev = null
    }
    const getDevList = () => {
      callBrige(callFnName.GetDevcieConfigs).then((res: DeviceConfigEntity[]) => {
        alldata.data = res
      })
    }
    const getDataAdressList = () => {
      callBrige(callFnName.GetDataAddresses, alldata.curDev?.GId).then((res: DataAddressEntity[]) => {
        alldata.adressData = res.map(e => {
          return {
            ...e,
            adressItem: e.AddressString ? JSON.parse(e.AddressString) : null
          }
        })
      })
    }
    const submit = () => {
      let list = alldata.adressData.filter(e => e.isChoose)
      let reqList = list.map(e => {
        console.log("🪵 [DevList.tsx:85] ~ token ~ \x1b[0;32me\x1b[0m = ", e);
        let dat: DataGroupEntity = {
          ...e,
          DeviceGroupId: curDeviceGroupRow.value?.GId,
          DataId: e.GId,
          DataName: e.Name,
          DataClass: alldata.curDataClass[0],
          State: 1,
          AlarmType: 2
        }
        delete dat.GId
        return callBrige(callFnName.SaveDataGroup, dat)
      })
      ajaxPromiseAll(reqList).then(() => {
        window.$message.success('保存成功')
        hideForm()
        configStore.updateDevDataGroupRowFn()
      })
    }
    const getCurDataClass = () => {
      if (!curDeviceGroupRow.value) return
      return callBrige(callFnName.GetDataClass, curDeviceGroupRow.value?.DeviceClass).then((res: any) => {
        alldata.curDataClass = res
      })
    }

    watch(devDataGroupDevListShow, (val) => {
      if (val) {
        alldata.curDev = null
        getDevList()
        getCurDataClass()

        alldata.curDialogIns = dialog.create({
          title: '新增数据',
          content: () => {
            return <div class={'min-h-[170px]'}>
              <div class={"h-[40px] flex justify-start items-center"}>
                {
                  alldata.curDev && <NButton style={{ width: '160px', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { backDevChoose() }}>返回</NButton>
                }
              </div>
              {
                //@ts-ignore
                !alldata.curDev ? <SimpleTable
                  originMode={true} dat={alldata.data} col={alldata.coloumns}></SimpleTable>
                  :
                  //@ts-ignore
                  <SimpleTable originMode={true} dat={alldata.adressData} col={alldata.adressColoumns}></SimpleTable>
              }

            </div>
          },
          maskClosable: false,
          style: { width: '800px', minHeight: '200px', },
          action: () => {
            return <div class={'flex justify-around items-center w-full'}>
              <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => { hideForm() }}>取消</NButton>
              <NButton style={{ width: '45%', height: '40px', fontSize: '24px', backgroundImage: `url(${btnActiveImg})`, backgroundSize: '100% 100%', color: '#534d62' }} strong={true} onClick={() => {
                // console.log("🪵 [ConForm.tsx:65] ~ token ~ \x1b[0;myFormRef.value\x1b[0m = ", myFormRef.value!);
                // myFormRef.value?.submit(submit)
                submit()
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
        <div class={'absolute'} >
          <span></span>
        </div>
      )
    }
  }

})