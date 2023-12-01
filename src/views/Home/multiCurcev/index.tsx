import { PlayArrowOutlined, StopCircleOutlined } from "@vicons/material";
import { NButton, NIcon, NSpace } from "naive-ui";
import { computed, defineComponent, onBeforeUnmount, reactive } from "vue";
import { DataConfigEntity } from "~/me";
import CurcevChartRow from "../curcev/CurcevChartRow";
import { useCurcevInnerDataStore } from "../curcev/innerData";
import { chartId } from "./enum";
import niotLogo from '@/assets/login_logos.png';

export default defineComponent({
  name: 'MultiCurcev',
  setup(props, ctx) {
    const curCevInnerData = useCurcevInnerDataStore()
    const commonData = reactive({
      curPage: 0,
      pageSize: 3,
    })
    const nextShow = computed(() => {
      return (commonData.curPage + 1) * commonData.pageSize < curCevInnerData.dataCfgList.length
    })
    const prevShow = computed(() => {
      return commonData.curPage > 0
    })
    const nextPage = () => {
      commonData.curPage = commonData.curPage + 1
    }
    const prevPage = () => {
      commonData.curPage = commonData.curPage - 1
    }

    onBeforeUnmount(() => {
      curCevInnerData.addReMounted()
    })

    return () => {
      return (
        <div class={'w-full h-full flex flex-col'}>
          <div class={'pl-2 flex'}>
            <NSpace align={'center'}>
              {curCevInnerData.isGetting ?
                <NButton type={'warning'} size={'large'} v-slots={{
                  icon: () => <NIcon><StopCircleOutlined /></NIcon>
                }} onClick={curCevInnerData.stopColFn} >停止采集</NButton>
                : <NButton type={'primary'} size={'large'} v-slots={{
                  icon: () => <NIcon><PlayArrowOutlined /></NIcon>
                }} onClick={curCevInnerData.startColFn} >开始采集</NButton>
              }
            </NSpace>

            <div class='ml-auto  h-16' >
              <NSpace align={'center'}>
                {nextShow.value && <NButton onClick={nextPage} size={'large'} >上一页</NButton>}
                {prevShow.value && <NButton onClick={prevPage} size={'large'} >下一页</NButton>}

              </NSpace>
              <img class={'h-full'} src={niotLogo} />

            </div>
          </div>
          <div class={'flex-shrink w-full h-full pb-2 overflow-hidden'}>
            <div class={'w-full h-full'}>
              {curCevInnerData.dataCfgList.slice(commonData.curPage * commonData.pageSize, (commonData.curPage + 1) * commonData.pageSize).map((e: DataConfigEntity, i) => {
                return <CurcevChartRow i={i} dataConfig={e} chartId={chartId} />
              })}
            </div>
          </div>
        </div>
      )
    }
  }

})