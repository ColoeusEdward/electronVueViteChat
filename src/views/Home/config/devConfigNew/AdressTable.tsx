import { c, DialogReactive, NButton, useDialog } from "naive-ui";
import { computed, defineComponent, PropType, reactive, ref, watch } from "vue";
import btnActiveImg from '@/assets/LineDspButton_inactive.png'
import ModbusAddressModelForm from "../devConfig/addressForm/ModbusAddressModelForm";
import { DeviceConfigEntity, ModbusAdressRow, ModbusAdressSubItem, simpleTableColumn } from "~/me";
import ConnectComForm, { ConnectFormIns } from "./connect/ConnectComForm";
import { MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import SimpleTable from "@/components/SimpleTable";
import { DataClassEnum, DataClassNameMap, DeviceClassNameMap, ParamClassEnum, ParamClassNameMap, PermissionNameList, tabNameEnum } from "./enum";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { useConfigStore } from "@/store/config";
import { AlarmTypeNameList, UnilateralNameList } from "../dataCofigNew/enum";
import AdressForm from "./AdressForm";

const defSubAdressItem: ModbusAdressSubItem = {
  Area: 0,
  Index: 0,
  Length: 2,
  DataType: 0,
  Exchange: 0,
  Rate: 1,
  Offset: 0
}
const defAdressRow: ModbusAdressRow = {
  DataName: '',
  DeviceId: '',
  DeviceClass: 1,
  DataClass: 101,
  ParamClass: 0,
  Unilateral: 0,
  AlarmType: 1,
  Permission: 0,
  State: 1,
  AddressString: JSON.stringify(defSubAdressItem),
  Unit: 'mm',
  Precision: 3,
}

export default defineComponent({
  name: 'AdressForm',
  props: {
    show: Boolean,
    updateShowFn: Function,
    curRow: Object as PropType<DeviceConfigEntity>,
    updateParentFn: Function,
  },
  setup(props, ctx) {
    const show = computed(() => props.show)
    const configStore = useConfigStore()
    const dialog = useDialog()
    const myFormRef = ref<MyFormWrapIns>()

    const rowClick = (row: simpleTableColumn, item: ModbusAdressRow) => {
      configStore.setCurAddressRow(item)
    }
    const deleteClick = (row: simpleTableColumn, item: ModbusAdressRow) => {
      rowClick(row, item)
      callBrige(callFnName.DeleteDataAddress, item.GId).then(() => {
        window.$message.success('删除成功')
        getData()
      })
    }
    const addClick = (row: simpleTableColumn, item: ModbusAdressRow) => {
      if (item.isNewRow) {
        rowClick(row, { ...item, DataName: '' })
        configStore.setAddressFormShow(true)
      }
    }
    const stateClick = (row: simpleTableColumn, item: ModbusAdressRow) => {
      rowClick(row, item)
      callBrige(callFnName.SaveDataAddress, item).then((res: any) => {
        window.$message.success('保存成功')
        getData()
      })
    }
    const alldata = reactive({
      form: {},
      curDialogIns: null as DialogReactive | null,
      curConnectRefType: null,
      data: [] as ModbusAdressRow[],
      coloumns: [
        { label: '数据名', prop: 'DataName', flex: 2, btnFn: addClick },
        { label: '数据分类', prop: 'DeviceClass', flex: 2, mapFn: (col: any, item: ModbusAdressRow) => { return DeviceClassNameMap[item.DeviceClass] } },
        { label: '数据类型', prop: 'DataClass', flex: 2, mapFn: (col: any, item: ModbusAdressRow) => { return DataClassNameMap[item.DataClass] } },
        { label: '参数类型', prop: 'ParamClass', flex: 2, mapFn: (col: any, item: ModbusAdressRow) => { return ParamClassNameMap[item.ParamClass] } },
        { label: '是否单边数据', prop: 'Unilateral', flex: 2, mapFn: (col: any, item: ModbusAdressRow) => { return UnilateralNameList[item.Unilateral] } },
        // { label: '报警类型', prop: 'AlarmType', flex: 2, mapFn: (col: any, item: ModbusAdressRow) => { return AlarmTypeNameList[item.AlarmType] } },
        // { label: '从站地址', prop: 'SlaveId', flex: 1, },
        { label: '读写权限', prop: 'Permission', flex: 1, mapFn: (col: any, item: ModbusAdressRow) => { return PermissionNameList[item.ParamClass] } },
        // { label: '精度', prop: 'Precision', flex: 1 },
        // { label: '单位', prop: 'Unit', flex: 1  },
        {
          label: '状态', prop: 'State', flex: 1, isSwitch: true, btnFn: stateClick,
          mapFn: (col: any, item: ModbusAdressRow) => { return item.State == 1 ? '启用' : '禁用' }
        },
        {
          label: '', prop: 'op', btnText: '编辑', flex: 1, btnFn: (col: any, item: any) => {
            configStore.setAddressFormShow(true)
            rowClick(col, item)
          }
        },
        { label: '', prop: 'op1', btnText: '删除', flex: 1, btnFn: deleteClick, btnType: 'danger' },
      ] as simpleTableColumn[],
    })

    const getData = () => {
      callBrige(callFnName.GetDataAddresses, configStore.curDevConfigRow?.GId).then((res: ModbusAdressRow[]) => {
        console.log("🪵 [AdressTable.tsx:60] ~ token ~ \x1b[0;32mres\x1b[0m = ", res);
        res = res.map(e => {
          let subItem = e.AddressString ? JSON.parse(e.AddressString) : defSubAdressItem
          return {
            ...e,
            SlaveId: subItem.SlaveId,
            Length: subItem.Length
          }
        })
        res.push({
          ...defAdressRow,
          DataName: '新增数据',
          DeviceId: configStore.curDevConfigRow?.GId || '',
          isNewRow: true
        })
        alldata.data = res
      })
    }
    const submit = (form: any) => {
      let str = JSON.stringify(form)
      props.updateParentFn && props.updateParentFn({ ConnectString: str })
    }

    watch(() => configStore.configTab, (v) => {
      if (v == tabNameEnum.dataAddress) {
        getData()
        configStore.setUpdateAdressRowFn(getData)
      }
    }, {
      immediate: true
    })

    return () => {
      return (
        <div class={'w-full  overflow-x-hidden -top-5 px-4 text-lg bg-[#f5f6f6]'} style={{}}>
          <SimpleTable dat={alldata.data} col={alldata.coloumns} />

          <AdressForm />
        </div>
      )
    }
  }

})