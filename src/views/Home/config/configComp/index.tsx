import { useToolStore } from "@/store/tool";
import { PUBLISH_PROJECT_KEY } from "@/utils/enum";
import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import { NButton, useMessage } from "naive-ui";
import { defineComponent, nextTick, onMounted, ref, Transition } from "vue";
//@ts-ignore
import { WebtopoSvgEdit, WebtopoSvgPreview } from 'webtopo-svg-edit';
import 'webtopo-svg-edit/dist/style.css'
//@ts-ignore

//@ts-ignore
// import goViewLib from '@/components/goView/goViewLib.umd.cjs';
// import {ChartEditor} from '@/components/goView/goViewLib.js'
// import '@/components/goView/style.css'

const configCompStorageKey = 'configComp'

export default defineComponent({
  name: 'ConfigComp',
  setup(props, ctx) {
    const msg = useMessage()
    const previewShow = ref<boolean>(false)
    const dataModel = ref<object | null>(null)
    const toolStore = useToolStore()
    const configAny = ref<HTMLIFrameElement|null>(null)
    dataModel.value = getLocalStorage(configCompStorageKey)
    const previewId = getLocalStorage(PUBLISH_PROJECT_KEY)
    const isMounted = ref(false)
    const handleReturn = () => {

    }
    const handlePreview = (data: any) => {
      dataModel.value = data
      nextTick(() => {
        previewShow.value = true
      })
    }
    const handleSave = (res: any) => {
      setLocalStorage(configCompStorageKey, res)
      msg.success('保存成功')
    }
    const closePreview = () => {
      previewShow.value = false
    }
    // console.log( `imgurl: `,path.resolve(`mygo:///${toolStore.getRootPath}`))
    onMounted(() => {
      // console.log(`configAny`,configAny.value?.contentWindow);
      isMounted.value = true
      configAny.value && (configAny.value.contentWindow!.ipc = window.ipc)
    })

    return () => {
      return (
        <div class={'w-full h-full relative'}>
          {
            <iframe class={'w-full h-full'} src={`/datav/index.html#/chart/preview/${previewId}`} ref={configAny} ></iframe>
          }
          {/* <div class={'w-full h-full '} style={{backgroundImage:`url(mygo:///${toolStore.getRootPath}/resource/pic/project/Snipaste_2023-09-07_10-12-34.png)`}}></div> */}
          {/* <div class={'w-full h-full '} style={{backgroundImage:`url(mygo:///D:/Software/Neon.png)`}}></div> */}
          {/* <img class={'w-full h-full'}
            src={`mygo:///${toolStore.getRootPath}/resource\\pic\\project/Snipaste_2023-09-07_10-12-34.png`}
          /> */}
          {/* <ChartEditor /> */}
          {/* <WebtopoSvgEdit dataModel={JSON.stringify(dataModel.value)} onOnReturn={handleReturn} onOnPreview={handlePreview} onOnSave={handleSave} />
          <Transition name='full-pop'>
            {
              previewShow.value &&
              <div class={'absolute top-0 h-full w-full z-[1000] flex flex-col '} >
                <div class={'h-16 flex bg-white p-2'}>
                  <NButton class={'ml-auto'} onClick={closePreview} >关闭</NButton>
                </div>
                <div class={' p-4  pt-1 flex-grow bg-white'}>
                  <div class={'w-full h-full border rounded-xl shadow-xl border-gray-300 border-solid overflow-hidden'}>

                    <WebtopoSvgPreview canvasDrag={false} dataModel={dataModel.value} />
                  </div>
                </div>
              </div>
            }
          </Transition> */}

        </div>
      )
    }
  }

})