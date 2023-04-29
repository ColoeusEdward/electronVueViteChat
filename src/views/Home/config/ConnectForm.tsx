import { MyFormWrap, formListItem } from "@/components/MyFormWrap/MyFormWrap";
import { SelectProps } from "naive-ui";
import { computed, defineComponent, reactive, ref } from "vue";
import proto from "./proto/proto";


export default defineComponent({
  name: 'ConnectForm',
  setup(props, ctx) {
    const remarkItem = { type: 'input', label: '备注', prop: 'Remark', width: 8 }
    const itemList = ref<formListItem[]>([
      { type: 'select', label: '协议类型', prop: 'ProtoType', width: 6,rule:'must' },
      { type: 'input', label: '名称', prop: 'Name', width: 6,rule:'must' },

    ])
    const optionMap: Record<string, SelectProps['options']> = reactive({
      ProtoType: [
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

    const submit = (fdata: object) => {
      console.log("🚀 ~ file: ConnectForm.tsx:43 ~ submit ~ fdata:", fdata)

    }

    const finalItemList = computed(() => {
      let form = ctx.attrs.form as connectForm
      let curProtoType = form.ProtoType || 'Modbus-TCP-Master'
      let curProtoInfo = proto[curProtoType.split('-').join('')]
      curProtoInfo && Object.assign(form, curProtoInfo.defaultForm)
      return [
        ...itemList.value,
        ...(curProtoInfo && curProtoInfo.itemList) ? curProtoInfo.itemList : [],
        remarkItem
      ]
    })

    const finalOptionMap = computed(() => {
      let form = ctx.attrs.form as connectForm
      let curProtoType = form.ProtoType || 'Modbus-TCP-Master'
      let curProtoInfo = proto[curProtoType.split('-').join('')]
      return {
        ...optionMap,
        ...(curProtoInfo && curProtoInfo.optionMap) ? curProtoInfo.optionMap : {}
      }
    })

    return () => {
      return (
        <MyFormWrap optionMap={finalOptionMap.value} itemList={finalItemList.value} submitFn={submit} btnStyleStr={'margin-right:40px;margin-bottom:10px;'} />
      )
    }
  }

})