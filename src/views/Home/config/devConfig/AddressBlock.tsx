import MyNTable from "@/components/MyNTable";
import { } from "naive-ui";
import { computed, defineComponent, reactive, Transition, watch } from "vue";
import { DriverAddressType } from "~/me";
import AddressForm from "./addressForm";
import { propNameEnum, propNameMap } from "./enum";
import { useDevCfgInnerData } from "./innerData";

export default defineComponent({
  name: 'AddressBlock',
  setup(props, ctx) {
    const innerData = useDevCfgInnerData()
    const mapKeyAndTitle = (str: string) => {
      return {
        key: str,
        title: propNameMap[str]
      }
    }
    const driverName = computed(() => {
      return innerData.devConfigForm.DriverName
    })
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        { ...mapKeyAndTitle(propNameEnum.DataName), resizable: true },
        { ...mapKeyAndTitle(propNameEnum.SlaveId), resizable: true },
        { ...mapKeyAndTitle(propNameEnum.Area), resizable: true },
        { ...mapKeyAndTitle(propNameEnum.Index), resizable: true },
        { ...mapKeyAndTitle(propNameEnum.Length), resizable: true },
        { ...mapKeyAndTitle(propNameEnum.DataType), resizable: true },
        { ...mapKeyAndTitle(propNameEnum.CountFormula), resizable: true },
      ],
      data: innerData.addressDataList,
      rowKey: (row: DriverAddressType) => row.DataName,
      rowProps: (row: DriverAddressType) => {
        return {
          onClick: () => rowClick(row)
        }
      },
    })
    const rowClick = (row: DriverAddressType) => {
      innerData.setCurAddressRowKey([row.DataName])
      innerData.setCurAddressRow(row)
    }
    watch(
      () => innerData.devConfigForm.AddressConfigs,
      (val) => {
        if (val && innerData.addressDataList.length == 0) {
          let list = JSON.parse(innerData.devConfigForm.AddressConfigs)
          innerData.setAddressDataList(list)
          // tableCfg.data = innerData.addressDataList
        }
      }
    )

    const getTbData = () => {
      if (innerData.isEdit && innerData.devConfigForm.AddressConfigs) {
        let list = JSON.parse(innerData.devConfigForm.AddressConfigs)
        innerData.setAddressDataList(list)
        // tableCfg.data = innerData.addressDataList
      }
    }
    getTbData()
    return () => {
      return (
        <div class={'w-full h-full relative'}>
          <MyNTable v-model:checked-row-keys={innerData.curAddressRowKey} {...tableCfg} />

          <Transition name='full-pop'>
            <div v-show={innerData.addressCfgFormShow} class={'h-full w-full absolute top-0 left-0 p-2 z-[50] bg-white'}>
              <AddressForm driverName={driverName.value} />
            </div>
          </Transition>

        </div>
      )
    }
  }

})