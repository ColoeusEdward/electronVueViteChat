import { useElementBounding } from "@vueuse/core";
import classNames from "classnames";
import { NDataTable } from "naive-ui";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";

export default defineComponent({
  name: 'MyNTable',
  // props:{
  //   tbData:Object
  // },
  setup(props, ctx) {

    const otherProp = computed(() => {
      // return props.tbData ? props.tbData : ctx.attrs
      let col = ctx.attrs.columns as any
      col.forEach((item: any) => {
        item.align = 'center'
      })
      return ctx.attrs
    })
    const data = reactive({
      maxHeight: '',
    })
    const MyNTableConRef = ref<HTMLDivElement>()
    const { height } = useElementBounding(MyNTableConRef)
    // const getMaxHeight = () => {
    //   if (MyNTableConRef.value) {
    //     data.maxHeight = MyNTableConRef.value.offsetHeight+''
    //     console.log("🚀 ~ file: index.tsx:17 ~ getMaxHeight ~ data.maxHeight:", data.maxHeight)
    //   }
    // }
    onMounted(() => {
      // console.log(MyNTableConRef.value)
      // getMaxHeight()
    })
    return () => {
      return (
        <div class={classNames('w-full h-full', { 'simple-style-table': otherProp.value.isSimpleStyle })} ref={MyNTableConRef}>
          <NDataTable bordered={false} maxHeight={height.value} striped singleLine={false} {...otherProp.value} size={'large'} >
          </NDataTable>
        </div>
      )
    }
  }

})