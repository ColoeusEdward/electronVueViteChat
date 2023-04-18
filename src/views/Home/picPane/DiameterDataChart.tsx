import { } from "naive-ui";
import { defineComponent } from "vue";

export default defineComponent({
  name: 'DiameterDataChart',
  setup(props, ctx) {


    return () => {
      return (
        <div class={'w-full h-full pt-2 '}>
          <div class={'h-1/2 pb-2'}>
            <div class={'h-full border-1 border-solid border-[#e4e4e5] shadow-inner flex'}>
              <div class={'w-full h-full shrink py-1 px-2 flex justify-end items-center'}>
                <span class={'text-[#013b63] font-semibold'} style={{fontSize:'16rem'}} >74.01</span>
              </div>
              <div class={' grow p-2 h-full flex flex-col'} style={{backgroundImage:`linear-gradient(#cdcdcd, #f2f2f2 ,#cdcdcd)`}}>
                <span class={'mt-auto mb-[6vh] text-5xl font-bold text-[#5e5452]'}>mm</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

})