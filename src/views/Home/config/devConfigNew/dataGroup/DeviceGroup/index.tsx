import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import SimpleTable from "@/components/SimpleTable";
import { useConfigStore } from "@/store/config";
import { getSysConfig } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import classNames from "classnames";
import { DialogReactive, NPopconfirm, useDialog } from "naive-ui";
import { computed, defineComponent, Transition, ref, watch, reactive, onMounted } from "vue";
import { DeviceGroupEntity, simpleTableColumn } from "~/me";
import { DeviceClassEnum, DeviceClassNameMap, tabNameEnum } from "../../enum";
import DeviceGroupAddForm from "./DeviceGroupAddForm";

export default defineComponent({
  name: 'DeviceGroup',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const dialog = useDialog()
    const myFormRef = ref<MyFormWrapIns>()
    const classSelect = (row: simpleTableColumn, item: DeviceGroupEntity) => {
      rowClick(row, item)
      updateRow({ DeviceClass: item.DeviceClass })
    }
    const rowClick = (row: simpleTableColumn, item: DeviceGroupEntity) => {
      console.log("🪵 [index.tsx:38] ~ token ~ \x1b[0;32mitem\x1b[0m = ", item);
      configStore.setCurDeviceGroupRow(item)
    }
    const curGroupConfigRow = computed(() => configStore.curGroupConfigRow)
    const deleteClick = ({}, item: DeviceGroupEntity) => {
      // rowClick({} as any, item)
      // if (item.GId === curEnabledDataGroupId.value) {
      //   window.$message.error('已应用的分组不能删除')
      //   return
      // }
      callBrige(callFnName.DeleteDeviceGroup, item.GId).then(() => {
        window.$message.success('删除成功')
        getData()
      })
    }
    const enableClcik = (row: simpleTableColumn, item: DeviceGroupEntity) => {
      rowClick(row, item)
      callBrige(callFnName.EnableGroupConfig, item.GId).then(() => {
        window.$message.success('操作成功')
        // getData()
        // getSysConfig()
        dialog.create({ title: '提示', content: '应用新分组记得重新配置配方', positiveText: '确定' })
      })
    }
    const addClick = (row: simpleTableColumn, item: DeviceGroupEntity) => {
             configStore.setDeviceGroupAddFormShow(true)

    }


    const curEnabledDataGroupId = computed(() => configStore.sysConfig.CurrentGroupId)
    // const alldata = reactive({
    //   data:[],
    //   coloumns:[]
    // })
    const curRow = computed(() => {
      return configStore.curDeviceGroupRow
    })
    const stateClick = (row: simpleTableColumn, item: DeviceGroupEntity) => {
      rowClick(row, item)
      callBrige(callFnName.SaveDeviceGroup, item).then((res: any) => {
        window.$message.success('保存成功')
        getData()
      })
    }
    const adressClick = (row: simpleTableColumn, item: DeviceGroupEntity) => {
      // console.log("🪵 [index.tsx:21] ~ token ~ \x1b[0;32mrow\x1b[0m = ", row);
      configStore.setDevDataGroupShow(true)
      configStore.setConfigTab(tabNameEnum.devDataGroup)
      rowClick(row, item)
    }

    const alldata = reactive({

      curConnectRefType: null,
      data: [] as DeviceGroupEntity[],
      coloumns: [
        {
          label: '设备名称', prop: 'DeviceName', flex: 3, btnFn: ()=>{}, isInput: true,
          inputUpdateFn: (col, item) => {
            console.log("🪵 [index.tsx:30] ~ token ~ \x1b[0;32m otherData.curRow\x1b[0m = ", curRow.value);
            if (item) {
              configStore.setCurDeviceGroupRow(item)
              updateRow({ DeviceName: curRow.value!.DeviceName })
            }
          }
        },
        { label: '设备类型', prop: 'DeviceClass', flex: 3, btnText: "", mapFn: (col: any, item: any) => { return DeviceClassNameMap[item.DeviceClass] }, btnFn: classSelect, isSelect: true, selectOption: Object.keys(DeviceClassNameMap).map((item: any) => ({ label: DeviceClassNameMap[item], value: item })) },
        {
          label: '状态', prop: 'State', flex: 2, isSwitch: true, btnFn: stateClick,
          mapFn: (col: any, item: DeviceGroupEntity) => { return item.State == 1 ? '启用' : '禁用' }
        },
        // { label: '数据集合', prop: 'AddressIds', flex: 3, btnText: "查看", btnFn: adressClick },

        // {
        //   label: '', prop: 'op', btnText: '编辑', flex: 1, btnFn: (col: any, item: any) => {
        //     // configStore.setAddressFormShow(true)
        //     rowClick(col, item)
        //   }
        // },
        // {
        //   label: '', prop: 'op', btnText: '应用', flex: 1, btnFn: enableClcik, mapFn: (col: any, item: any) => {
        //     return item.GId == curEnabledDataGroupId.value ? '已应用' : '应用'
        //   }
        // },
        // { label: '', prop: 'op1', btnText: '删除', flex: 1, btnFn: deleteClick, btnType: 'danger' },
      ] as simpleTableColumn[],
    })

    const getData = () => {
      getSysConfig()
      callBrige(callFnName.GetDeviceGroups, configStore.curGroupConfigRow?.GId).then((res: DeviceGroupEntity[]) => {
        console.log("🪵 [index.tsx:58] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        // res = res.map(e => {
        //   let subItem = e.AddressString ? JSON.parse(e.AddressString) : defSubAdressItem
        //   return {
        //     ...e,
        //     SlaveId: subItem.SlaveId,
        //     Length: subItem.Length
        //   }
        // })
        res = res.map(e => ({ ...e, DeviceClass: e.DeviceClass?.toString(), isNewRow: false }))
        // res.push({
        //   // ...defAdressRow,
        //   DeviceName: '新增设备',
        //   // DeviceId: configStore.curDevConfigRow?.GId || '',
        //   isNewRow: true
        // })
        alldata.data = res
      })
    }
    configStore.setUpdateDevGroupRowFn(getData)
    const submit = (form: any) => {
      let str = JSON.stringify(form)
      // props.updateParentFn && props.updateParentFn({ ConnectString: str })
    }
    const updateRow = (dat: any) => {
      let data = { ...curRow.value, ...dat, }
      console.log("🪵 [index.tsx:136] ~ token ~ \x1b[0;32mdata\x1b[0m = ", data);
      callBrige(callFnName.SaveDeviceGroup, data).then((res: any[]) => {
        // console.log("🪵 [index.tsx:11] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        getData()
        window.$message.success('保存成功')
        // otherData.showConnectComForm = false
      })
    }
    watch(() => curGroupConfigRow.value, (v) => {
      if (v) {
        getData()
        // configStore.setUpdateAdressRowFn(getData)
      }
    }, {
      immediate: true
    })

    onMounted(() => {
        // getData()
    })

    return () => {
      return (
       <div class={'w-full h-full border border-gray-600 border-solid  overflow-hidden bg-white'}>
                <SimpleTable
                rowClickFn={rowClick}
                 addAndEditAndDelFn={[
                  addClick,
                  () => { },
                  deleteClick
                ]} isSmallPadding={true} dat={alldata.data} col={alldata.coloumns} />
          <DeviceGroupAddForm />

        </div>
          

      )
    }
  }


})


// <div class={"w-full h-full overflow-auto "}
//                   style={{
//                     height: 'calc(100% - 60px)'
//                   }}>
//                   {
//                     alldata.data.map((e, i) => {
//                       return <div class={classNames('text-2xl p-2 bg-white w-full  flex items-center', { 'bg-[#f5f6f6]': i % 2 != 0, 'bg-[#688eb2] text-white': curRow.value?.GId == e.GId })}
//                         onClick={() => { rowClick({} as any, e) }} >
//                         <span>
//                           {e.DeviceName}/
//                           {e.State == 1 ? '已启用' : '禁用'}
//                           {/* {e.Note && <>{` (${e.Note})`}</>} */}
//                           {/* {e.GroupConfigItem && <>{` (分组:${e.GroupConfigItem.GroupName})`}</>} */}
//                         </span>
//                         <span class={'ml-auto mr-2  py-1 px-3 bg-white text-black border border-gray-500 border-solid'}
//                           onClick={() => { enableClcik({} as any, e) }}>
                            
//                           {e.State == 1 ? `已启用` : '启用'}
//                         </span>
//                       </div>
//                     })
//                   }
//                 </div>
//                 <div class={'h-[60px]  flex  items-center'}>
//                   <span class={'ml-2 mr-2  py-2 px-8 bg-white text-black border border-gray-500 border-solid'}
//                     onClick={() => { addClick() }}>
//                     新增
//                   </span>

//                   <span class={'ml-2 mr-2  py-2 px-8 bg-white text-black border border-gray-500 border-solid'}
//                     onClick={() => { editClick() }}>
//                     编辑
//                   </span>

//                   <NPopconfirm placement="right" title=""
//                     v-slots={{
//                       default: () => {
//                         return <div>确定吗?</div>
//                       },
//                       trigger: () => {
//                         return <span class={'ml-2 mr-2  py-2 px-8 bg-white text-black border border-gray-500 border-solid'} >
//                           删除
//                         </span>
//                       }
//                     }}
//                     onPositiveClick={() => { deleteClick() }}>
//                   </NPopconfirm>

//                 </div>