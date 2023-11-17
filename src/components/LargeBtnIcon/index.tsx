import { NIcon } from "naive-ui";
import { defineComponent } from "vue";

export default defineComponent({
  name: 'LargeBtnIcon',
  props:{
    size:Number
  },
  setup(props, ctx) {



    return () => {
      return (
        <NIcon class={'text-3xl mr-3'} style={{fontSize:props.size+'px'}}>
          {ctx.slots.default && ctx.slots.default()}
        </NIcon>
      )
    }
  }

})