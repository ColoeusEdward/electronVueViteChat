import { NButton, NPopconfirm, NSpace } from "naive-ui";
import { defineComponent } from "vue";

export default defineComponent({
  name: 'TableOpCol',
  props:{
    editFn:Function,
    delFn:Function
  },
  setup(props, ctx) {


    return () => {
      return (
        <NSpace>
          <NButton type="primary" size={'medium'} onClick={() => { props.editFn && props.editFn() }} >编辑</NButton>
          <NPopconfirm placement="right" title=""
            v-slots={{
              default: () => {
                return <div>确定删除?</div>
              },
              trigger: () => {
                return <NButton type="error" size={'medium'}>删除</NButton>
              }
            }}
            onPositiveClick={() => { props.delFn && props.delFn()}}>
          </NPopconfirm>
        </NSpace>
      )
    }
  }

})