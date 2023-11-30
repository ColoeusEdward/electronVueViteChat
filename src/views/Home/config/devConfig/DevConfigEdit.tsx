import MyNTable from "@/components/MyNTable"
import { NButton, NPopconfirm, useMessage } from "naive-ui"
import { truncateSync } from "original-fs"
import { computed, defineComponent, onMounted, reactive, Transition, watch } from "vue"
import { DeviceConfigEntity } from "~/me"
import AddressBlock from "./AddressBlock"
import DriverForm from "./driverForm"
import { propNameMap } from "./enum"
import { useDevCfgInnerData } from "./innerData"

export default defineComponent({
  name: 'DevConfigEdit',
  setup(props, ctx) {
    let isMouted = false
    const innerData = useDevCfgInnerData()
    const msg = useMessage()
    const height = computed(() => {
      return `${innerData.contentHeight - 114 - 28}px`  //28是各种padding
    })
    const connectConfigStr = computed(() => {
      return innerData.devConfigForm.ConnectConfig
    })
    const tableCfg = reactive({
      columns: [
        { key: 'Name', title: '属性名', resizable: true },
        { key: 'Value', title: '属性值', resizable: true },
      ],
      data: [] as { Name: string, Value: string }[],

    })
    watch(() => innerData.devConfigForm.ConnectConfig, (val) => {
      let data = JSON.parse(val)
      tableCfg.data = Object.keys(data).map(key => {
        return {
          Name: propNameMap[key] || key,
          Value: data[key]
        }
      })
    })
    watch(innerData.addressDataList , (val) => {
      // console.log("🚀 ~ file: DevConfigEdit.tsx:39 ~ watch ~ val:", val)
      if (isMouted) {
        innerData.setAddressStrOfDevConfigForm(JSON.stringify(val))
      }
    },{deep:true})
    const getTbData = () => {
      if (innerData.isEdit && innerData.devConfigForm.ConnectConfig) {
        let data = JSON.parse(innerData.devConfigForm.ConnectConfig)
        tableCfg.data = Object.keys(data).map(key => {
          return {
            Name: propNameMap[key] || key,
            Value: data[key]
          }
        })
      }
    }
    getTbData()
    const driverName = computed(() => {
      return innerData.devConfigForm.DriverName
    })
    const editCfg = () => {
      if (!innerData.devConfigForm.DriverName) {
        msg.warning('请先选择设备驱动')
        return
      }
      if (innerData.devConfigForm.ConnectConfig) {
        let d = JSON.parse(innerData.devConfigForm.ConnectConfig)
        innerData.setConnectCfgForm(d)
      }
      innerData.setConnectCfgFormShow(true)
    }
    const addAddress = () => {
      if (innerData.addressCfgFormShow) return
      if (!innerData.devConfigForm.DriverName) {
        msg.warning('请先选择设备驱动')
        return
      }
      innerData.cleanAddressCfgForm()
      innerData.setAddressIsEdit(false)
      innerData.setAddressCfgFormShow(true)
    }
    const editAddress = () => {
      if (innerData.addressCfgFormShow) return
      if (!innerData.curAddressRow) {
        msg.warning('请选择一行数据')
        return
      }
      innerData.setAddressCfgForm({ ...innerData.curAddressRow })
      innerData.setAddressIsEdit(true)
      innerData.setAddressCfgFormShow(true)
    }
    const delAddress = () => {
      if (innerData.addressCfgFormShow) {
        msg.warning('请先保存修改')
        return
      }
      if (!innerData.curAddressRow) {
        msg.warning('请选择一行数据')
        return
      }
      let idx = innerData.addressDataList.findIndex(e => e.Id == innerData.curAddressRow!.Id)
      idx > -1 && innerData.addressDataList.splice(idx, 1)
      innerData.cleanAddressRow()
    }

    onMounted(() => {
      isMouted = true
    })


    return () => {
      return (
        <div class={' relative '} style={{ height: height.value }}>
          <div class={'h-full flex flex-col'}>
            <div class={'p-2 border-0 border-b border-gray-200 border-solid flex '}>
              <div class={'flex w-[40%] items-center'}>
                <span class={'text-2xl'}>连接配置</span>
                <NButton class={'my-large-btn mr-6 ml-auto'} type={'primary'} size={'large'} onClick={editCfg}>编辑配置</NButton>

              </div>
              <div class={'flex w-[60%] items-center'}>
                <span class={'text-2xl ml-6'}>数据地址</span>
                <NButton class={'my-large-btn mr-3 ml-auto'} type={'primary'} size={'large'} onClick={addAddress}>添加数据</NButton>
                <NButton class={'my-large-btn mr-3 '} type={'primary'} size={'large'} onClick={editAddress}>编辑数据</NButton>
                <NPopconfirm onPositiveClick={delAddress} placement={'bottom'} v-slots={{
                  trigger: () => <NButton class={'my-large-btn mr-3 '} type={'primary'} size={'large'} >删除数据</NButton>
                }}>
                  确认删除吗?
                </NPopconfirm>

              </div>
            </div>

            <div class={'h-full flex-shrink flex'}>
              <div class={'  w-[40%] h-full border-0 border-r border-solid border-gray-200 relative'} >
                <MyNTable {...tableCfg} />

                <Transition name='full-pop'>
                  <div v-show={innerData.connectCfgFormShow} class={'h-full w-full absolute top-0 left-0 p-2 z-[50] bg-white'}>
                    <DriverForm driverName={driverName.value} />
                  </div>
                </Transition>
              </div>
              <div class={' inline-block w-[60%] h-full'} >
                <AddressBlock />
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
})