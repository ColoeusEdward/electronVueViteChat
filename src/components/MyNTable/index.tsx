import { NDataTable } from "naive-ui";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";

export default defineComponent({
  name: 'MyNTable',
  setup(props, ctx) {
    const otherProp = computed(() => {
      return ctx.attrs
    })
    const data = reactive({
      maxHeight: ''
    })
    const MyNTableConRef = ref<HTMLDivElement>()
    const getMaxHeight = () => {
      if (MyNTableConRef.value) {
        data.maxHeight = MyNTableConRef.value.offsetHeight+''
      }
    }
    onMounted(() => {
      // console.log(MyNTableConRef.value)
      getMaxHeight()
    })
    return () => {
      return (
        <div class={'w-full h-full'} ref={MyNTableConRef}>
          <NDataTable bordered={false} maxHeight={data.maxHeight} striped singleLine={false} {...otherProp.value} size={'large'} >
          </NDataTable>
        </div>
      )
    }
  }

})