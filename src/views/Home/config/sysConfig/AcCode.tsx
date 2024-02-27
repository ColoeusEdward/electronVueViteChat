import { NButton, NInput, NSpace } from "naive-ui";
import { defineComponent } from "vue";

export default defineComponent({
  name: 'AcCode',
  setup(props, ctx) {
    const attrs = ctx.attrs
    const check = () => {

    }
    return () => {
      return (
        <div class={'w-full h-full'}>
          <NSpace align={'center'} >
            <span >激活码</span>
            <div class={'w-[38vw]'}>
              <NInput clearable value={attrs.value} onUpdateValue={attrs['onUpdate:value']} placeholder="请输入激活码" />
            </div>
            <NButton onClick={check} >激活检查</NButton>
          </NSpace>
        </div>
      )
    }
  }

})