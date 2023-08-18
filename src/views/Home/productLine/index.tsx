import { } from "naive-ui";
import { defineComponent, ref } from "vue";
import niotLogo from '@/assets/login_logos.png';
import blankDevPic from '@/assets/pic/Line/Kabel.png'


export default defineComponent({
  name: 'ProductLine',
  setup(props, ctx) {
    const devNum = 14
    const devList = ref<connectDevForm[]>([])
    devList.value = new Array(devNum).fill({
      picPath: blankDevPic,
    })

    return () => {
      return (
        <div class={'w-full h-full flex flex-col'}>
          <div class={'h-16 flex items-center'}>

            <div class='ml-auto  h-16' >
              <img class={'h-full'} src={niotLogo} />
            </div>
          </div>
          <div class={'h-full shrink'} >
            <div class={'h-1/3'}></div>
            <div class={'h-1/2  relative left-2 '}>
              {
                devList.value.map((item, index) => {
                  return <img class={'h-full w-1/3 absolute top-0' + ``} style={{ left: `${index * 5}%`, top: `${index * 1.7}%` }} src={item.picPath} />
                })
              }
            </div>
          </div>

        </div>
      )
    }
  }

})