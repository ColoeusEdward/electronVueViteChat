import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { useConfigStore } from "@/store/config";
import { SelectProps, useMessage } from "naive-ui";
import { defineComponent, reactive, ref } from "vue";

export default defineComponent({
  name: "OPCUATopForm",
  setup(props, ctx) {
    const msg = useMessage()
    const configStore = useConfigStore()
    const form = ref<Record<string, string>>({
      ...(configStore.dataConfig.OPCUATopForm || {
        EndpointUrl: "opc.tcp://",
      })
    });

    const itemList = ref<formListItem[]>([
      {
        type: "input",
        label: "EndpointUrl",
        prop: "EndpointUrl",
        rule: 'must'
      },
      {
        type: "select",
        label: "Security Mode",
        prop: "SecurityMode",
        rule: 'must'
      },
      {
        type: "select",
        label: "SecurityPolicy",
        prop: "SecurityPolicy",
        rule: 'must'
      },
      {
        type: "input",
        label: "UserName",
        prop: "UserName",
      },
      {
        type: "input",
        label: "Password",
        prop: "Password",
      },
    ].map(e => ({
      ...e,
      width: 8
    })));
    const optionMap = reactive<Record<string, SelectProps['options']>>({
      SecurityMode: [
        'None', 'Sign', 'SignAndEncrypt'
      ].map(e => ({
        label: e,
        value: e
      })),
      SecurityPolicy: [
        "None",
        "Basic128Rsa15",
        "Basic256",
        "Basic256Sha256",
        "Aes128Sha256Rsa0aep",
        "Aes256Sha256RsaPss",
      ].map(e => ({
        label: e,
        value: e
      }))

    })

    const submit = (fdata:any) => {
      configStore.setOPCUATopForm(fdata)
      msg.success('保存成功')
    }

    return () => {
      return (
        <div class={"w-full  p-2 "}>
          <MyFormWrap form={form.value} itemList={itemList.value} optionMap={optionMap} needBtmSpace={false} submitFn={submit} ></MyFormWrap>
        </div>
      );
    };
  },
});
