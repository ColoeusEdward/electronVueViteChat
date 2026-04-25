import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import SimpleTable from "@/components/SimpleTable";
import { useConfigStore } from "@/store/config";
import { getSysConfig } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { DialogReactive, useDialog } from "naive-ui";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { DataGroupEntity, simpleTableColumn } from "~/me";
import { tabNameEnum } from "../enum";
import AdressChooseList from "./AdressChooseList";
import DataGroupAddFrom from "./DataGroupAddFrom";
import DevChooseList from "./DevChooseList";

export default defineComponent({
  name: 'dataGroup',

  setup(props, ctx) {
    const configStore = useConfigStore()
    const dialog = useDialog()
    const myFormRef = ref<MyFormWrapIns>()
    const curEnabledDataGroupId = computed(() => configStore.sysConfig.CurrentGroupId)
    // const alldata = reactive({
    //   data:[],
    //   coloumns:[]
    // })
    const curRow = computed(() => {
      return configStore.curDataGroupRow
    })
    const devClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      configStore.setDevChooseShow(true)
    }
    const adressClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      configStore.setAdressChooseShow(true)
    }
    const rowClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      configStore.setCurDataGroupRow(item)
    }
    const deleteClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      if (item.GId === curEnabledDataGroupId.value) {
        window.$message.error('已应用的分组不能删除')
        return
      }
      callBrige(callFnName.DeleteDataGroup, item.GId).then(() => {
        window.$message.success('删除成功')
        getData()
      })
    }
    const enableClcik = (row: simpleTableColumn, item: DataGroupEntity) => {
      rowClick(row, item)
      callBrige(callFnName.EnableDataGroup, item.GId).then(() => {
        window.$message.success('操作成功')
        // getData()
        getSysConfig()
      })
    }
    const addClick = (row: simpleTableColumn, item: DataGroupEntity) => {
      if (item.isNewRow) {
        // rowClick(row, { ...item, Name: '' })
        // configStore.setAddressFormShow(true)
        configStore.setDataGroupAddFromShow(true)
      }
    }
    const alldata = reactive({
      form: {},
      curDialogIns: null as DialogReactive | null,
      curConnectRefType: null,
      data: [] as DataGroupEntity[],
      coloumns: [
        {
          label: '分组名称', prop: 'Name', flex: 3, btnFn: addClick, isInput: true,
          inputUpdateFn: () => {
            console.log("🪵 [index.tsx:30] ~ token ~ \x1b[0;32m otherData.curRow\x1b[0m = ", curRow.value);
            if (curRow.value) {
              updateRow({ Name: curRow.value.Name })
            }
          }
        },
        { label: '设备集合', prop: 'DeviceIds', flex: 3, btnText: "查看", btnFn: devClick },
        { label: '地址集合', prop: 'AddressIds', flex: 3, btnText: "查看", btnFn: adressClick },

        // {
        //   label: '', prop: 'op', btnText: '编辑', flex: 1, btnFn: (col: any, item: any) => {
        //     // configStore.setAddressFormShow(true)
        //     rowClick(col, item)
        //   }
        // },
        {
          label: '', prop: 'op', btnText: '应用', flex: 1, btnFn: enableClcik, mapFn: (col: any, item: any) => {
            return item.GId == curEnabledDataGroupId.value ? '已应用' : '应用'
          }
        },
        { label: '', prop: 'op1', btnText: '删除', flex: 1, btnFn: deleteClick, btnType: 'danger' },
      ] as simpleTableColumn[],
    })

    const getData = () => {
      getSysConfig()
      callBrige(callFnName.GetDataGroups).then((res: DataGroupEntity[]) => {
        console.log("🪵 [index.tsx:58] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        // res = res.map(e => {
        //   let subItem = e.AddressString ? JSON.parse(e.AddressString) : defSubAdressItem
        //   return {
        //     ...e,
        //     SlaveId: subItem.SlaveId,
        //     Length: subItem.Length
        //   }
        // })
        res.push({
          // ...defAdressRow,
          Name: '新增分组',
          // DeviceId: configStore.curDevConfigRow?.GId || '',
          isNewRow: true
        })
        alldata.data = res
      })
    }
    configStore.setUpdateDataGroupRowFn(getData)
    const submit = (form: any) => {
      let str = JSON.stringify(form)
      // props.updateParentFn && props.updateParentFn({ ConnectString: str })
    }
    const updateRow = (dat: any) => {
      let data = { ...curRow.value, ...dat, }
      callBrige(callFnName.SaveDataGroupOnlyName, data).then((res: any[]) => {
        // console.log("🪵 [index.tsx:11] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        getData()
        window.$message.success('保存成功')
        // otherData.showConnectComForm = false
      })
    }
    watch(() => configStore.configTab, (v) => {
      if (v == tabNameEnum.dataGroup) {
        getData()
        // configStore.setUpdateAdressRowFn(getData)
      }
    }, {
      immediate: true
    })

    return () => {
      return (
        <div class={'w-full  overflow-x-hidden -top-5 px-4 text-lg bg-[#f5f6f6]'} style={{}}>
          <SimpleTable dat={alldata.data} col={alldata.coloumns} />

          <DevChooseList />
          <AdressChooseList />
          <DataGroupAddFrom />
        </div>
      )
    }
  }

})