import { NDivider } from "naive-ui";
import { defineComponent } from "vue";

export default defineComponent({
  name: 'DetailRigth',
  setup(props, ctx) {


    return () => {
      return (
        <div class={'w-full h-full'}>
          <NDivider titlePlacement={'left'} >详情</NDivider>
        </div>
      )
    }
  }

})