import { useToolStore } from "@/store/tool";
import { getLocalStorage, setLocalStorage } from "@/utils/utils";
import { NButton, useMessage } from "naive-ui";
import { defineComponent, nextTick, ref, Transition } from "vue";
//@ts-ignore
import { WebtopoSvgEdit, WebtopoSvgPreview } from 'webtopo-svg-edit';
import 'webtopo-svg-edit/dist/style.css'

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
    dataModel.value = getLocalStorage(configCompStorageKey)
    const handleReturn = () => {

    }
    const handlePreview = (data: any) => {
      dataModel.value = data
      nextTick(() => {
        previewShow.value = true
      })
    }
    const handleSave = (res: any) => {
      console.log("🚀 ~ file: index.tsx:22 ~ handleSave ~ res:", res)
      setLocalStorage(configCompStorageKey, res)
      msg.success('保存成功')
    }
    const closePreview = () => {
      previewShow.value = false
    }



    return () => {
      return (
        <div class={'w-full h-full relative'}>
          <img class={'w-full h-full'}
            src={`mygo:///${toolStore.getRootPath}/resource\\pic\\project/Snipaste_2023-09-07_10-12-34.png`}
            // src={pic}
          />
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