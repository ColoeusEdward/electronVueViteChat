import { MyFormWrap, formListItem } from "@/components/MyFormWrap/MyFormWrap";
import { SelectProps } from "naive-ui";
import { computed, defineComponent, nextTick, reactive, ref } from "vue";
import proto from "./proto/proto";
import { v4 as uuidv4 } from 'uuid';
import { useConfigStore } from "@/store/config";

export default defineComponent({
  name: 'ConnectForm',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const loading = ref(false)
    const remarkItem = { type: 'input', label: '备注', prop: 'Remark', width: 8 }
    const itemList = ref<formListItem[]>([
      { type: 'select', label: '协议类型', prop: 'ProtoType', width: 6, rule: 'must' },
      { type: 'input', label: '名称', prop: 'Name', width: 6, rule: 'must' },

    ])
    const optionMap: Record<string, SelectProps['options']> = reactive({
      ProtoType: [
        "Modbus-TCP-Slave",
        "DVP-Master",
        "Fatek-FBs",
        "Fins-HostLink",
        "FP-Mewtocol",
        "Fx-Serial-Master",
        "Modbus-ASCII-Master",
        "Modbus-ASCII-Slave",
        "Modbus-RTU-Master",
        "Modbus-RTU-Slave",
        "Modbus-TCP-Master",
        "MQTT",
        "NST-IDCard",
        "NST-SIKORA-SC400",
        "NST-TAKIKAWA",
        "NST-ZUMBACH",
        "OPC-UA-Client",
        "OPC-UA-Server",
        "S7-1200-TCP",
        "S7-200-PPI",
        "S7-Smart-TCP",
      ].map(e => ({
        label: e,
        value: e
      }))
    })

    const submit = (fdata: commonForm) => {
      console.log(fdata)
      loading.value = true
      if (!fdata.id) {
        fdata.id = uuidv4()
        configStore.addConnectData(fdata)
      } else {
        configStore.editConnectRow(fdata)
      }

      ctx.emit('update:show', false)
      nextTick(() => {
        loading.value = false
      })
    }

    const finalItemList = computed(() => {
      let form = ctx.attrs.form as commonForm
      let curProtoType = form.ProtoType || 'Modbus-TCP-Master'
      let curProtoInfo = proto[curProtoType.split('-').join('')]
      curProtoInfo && Object.assign(form, curProtoInfo.defaultForm)
      let list = curProtoInfo.itemList
      itemList.value[0].disabled = false
      if (form.id) {
        itemList.value[0].disabled = true
      }
      return [
        ...itemList.value,
        ...(curProtoInfo && curProtoInfo.itemList) ? list : [],
        remarkItem
      ]
    })

    const finalOptionMap = computed(() => {
      let form = ctx.attrs.form as commonForm
      let curProtoType = form.ProtoType || 'Modbus-TCP-Master'
      let curProtoInfo = proto[curProtoType.split('-').join('')]
      return {
        ...optionMap,
        ...(curProtoInfo && curProtoInfo.optionMap) ? curProtoInfo.optionMap : {}
      }
    })

    return () => {
      return (
        <MyFormWrap optionMap={finalOptionMap.value} itemList={finalItemList.value} submitFn={submit} btnStyleStr={'margin-right:40px;margin-bottom:10px;'} loading={loading.value} />
      )
    }
  }

})