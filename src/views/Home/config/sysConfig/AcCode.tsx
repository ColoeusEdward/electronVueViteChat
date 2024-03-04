import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import classNames from "classnames";
import { NButton, NInput, NModal, NSpace, useDialog } from "naive-ui";
import { computed, defineComponent, reactive } from "vue";
import { ActualResult } from "~/me";
import { useSysCfgInnerDataStore } from "./innderData";

export default defineComponent({
  name: 'AcCode',
  setup(props, ctx) {
    const attrs = ctx.attrs
    const commonData = reactive({
      showMod: false,
      btnLoading: false,
      machCode: '',
      regCode: ''
    })
    const innerData = useSysCfgInnerDataStore()

    const regText = computed(() => {
      if (innerData.regState) {
        return '已激活'
      } else {
        return '未激活'
      }
    })
    const check = () => {
      commonData.btnLoading = true
      callSpc(callFnName.getRegisterCode).then((res: ActualResult) => {
        commonData.regCode = res as unknown as string
      })
      callSpc(callFnName.getMachineCode).then((res: ActualResult) => {
        commonData.machCode = res as unknown as string
        commonData.btnLoading = false
        commonData.showMod = true
      })
    }
    const submitCallback = () => {
      if (!commonData.regCode) {
        window.$message.warning('请输入激活码!')
        return false
      }
      return callSpc(callFnName.checkRegister, commonData.regCode).then((res: ActualResult) => {
        if (res != null) {
          window.$message.success('激活成功')
          innerData.setRegState(true)
        }else{
          return false
        }
      })
    }
    const cancelCallback = () => {
      commonData.showMod = false
    }
    const copy = () => {
      navigator.clipboard.writeText(commonData.machCode)
      window.$message.success('复制成功')
    }
    return () => {
      return (
        <div class={'w-full h-full'}>
          <NSpace align={'center'} >
            <span >激活状态</span>
            <span class={classNames({ 'text-red-500': !innerData.regState, 'text-green-500': innerData.regState })} > {regText.value}</span>
            <NButton onClick={check} loading={commonData.btnLoading} >输入激活码</NButton>

          </NSpace>
          <NModal
            style="width: 38vw;"
            v-model:show={commonData.showMod}
            preset="dialog"
            title="输入激活码"
            size="huge"
            content={() => {
              return (
                <div class={' w-full pt-4'}>
                  <NSpace align={'center'}>
                    <div class={'w-[6vw] text-base text-right'}>当前机器码</div>
                    <div class={'w-[22vw]'}>
                      <NInput value={commonData.machCode} disabled placeholder="" />
                    </div>
                    <NButton onClick={copy}>复制</NButton>
                  </NSpace>
                  <NSpace align={'center'} class={'mt-4'}>
                    <div class={'w-[6vw] text-base text-right'}>激活码</div>
                    <div class={'w-[22vw]'}>
                      <NInput type="textarea" clearable v-model:value={commonData.regCode}  placeholder="" />
                    </div>
                  </NSpace>
                </div>
              )
            }}
            positive-text=" 提交 "
            negative-text=" 取消 "
            negative-button-props={{ size: 'large' }}
            positive-button-props={{ size: 'large' }}
            onPositiveClick={submitCallback}
            onNegativeClick={cancelCallback}
          >

          </NModal>
          {/* <div class={'w-[38vw]'}>
              <NInput clearable value={attrs.value} onUpdateValue={attrs['onUpdate:value']} placeholder="请输入激活码" />
            </div> */}
        </div>
      )
    }
  }

})