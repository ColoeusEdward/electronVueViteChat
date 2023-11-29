import { NButton, NDatePicker, NDropdown, NIcon, NInput, NInputNumber, NSpace, NTimePicker, useMessage } from "naive-ui";
import { computed, defineComponent, onMounted, reactive } from "vue";
import niotLogo from '@/assets/login_logos.png';
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { CollectPointModel, DataConfigEntity } from "~/me";
import activeImg from '@/assets/LineDspButton_inactive.png'
import { useCurcevInnerDataStore } from "./innerData";
import { PlayArrowOutlined, StopCircleOutlined } from "@vicons/material";
import CurcevChartRow from "./CurcevChartRow";
import CpkBlock from "./CpkBlock";

export default defineComponent({
  name: 'Curcev',  //实时数据,

  setup(props, ctx) {
    const innerData = useCurcevInnerDataStore()
    innerData.isGetting = false
    const msg = useMessage()
    const commonData = reactive({
      cfgDataList: [] as DataConfigEntity[],
      curPage: 0,
      pageSize: 3,
      dropDowmProps: () => {
        return {
          style: {
            minWidth: '14vh'
          }
        }
      }
    })
    const getAllActiveConfigData = () => {
      return callSpc(callFnName.getDataConfigs).then((res: DataConfigEntity[]) => {
        let list = res.filter((e: DataConfigEntity) => e.State == 1)
        commonData.cfgDataList = list
      })
    }
    const startCollect = () => {
      refresh().then(() => {
        return callSpc(callFnName.startCollect)
      })
        .then(() => {
          innerData.setIsGetting(true)

        })
    }
    const stopCollect = () => {
      callSpc(callFnName.stopCollect).then(() => {
        innerData.setIsGetting(false)
      })
    }
    const refresh = () => {
      return getAllActiveConfigData().then(() => {
        // msg.success('配置已刷新')
      })
    }
    const nextPage = () => {

    }
    const prevPage = () => {

    }
    const nextShow = computed(() => {
      return (commonData.curPage + 1) * commonData.pageSize < commonData.cfgDataList.length
    })
    const prevShow = computed(() => {
      return commonData.curPage > 0
    })
    onMounted(() => {
      // getAllActiveConfigData()
    })
    return () => {
      return (
        <div class={'w-full h-full pt-2 shrink flex flex-col relative'}>
          {/* <CpkBlock /> */}
          <div class={'flex pl-2'}>
            <NSpace align={'center'}>
              <div></div>
              {innerData.isGetting ?
                <NButton type={'warning'} size={'large'} v-slots={{
                  icon: () => <NIcon><StopCircleOutlined /></NIcon>
                }} onClick={stopCollect} >停止采集</NButton>
                : <NButton type={'primary'} size={'large'} v-slots={{
                  icon: () => <NIcon><PlayArrowOutlined /></NIcon>
                }} onClick={startCollect} >开始采集</NButton>
              }
              <NButton onClick={refresh} size={'large'} >刷新配置</NButton>
              <div class={'flex items-center'} >
                <span class={'text-md w-fit mr-2'}>起始时间点</span>
                <NDatePicker v-model:value={innerData.startTime} type={'datetime'} />
              </div>

              {/* <div class={'flex items-center'} >
                <span class={'text-md w-fit mr-2'}>最大显示数据量</span>
                <NInputNumber value={innerData.maxDataNum} style={{width:'120px'}} onUpdateValue={(val: number) => {
                  innerData.setMaxDataNum(val)
                }} showButton={false} v-slots={{
                  'suffix': () => <span class={'text-md'}>条</span>
                }} ></NInputNumber>
              </div> */}
            </NSpace>

            {/* < NDropdown options={computeOption.value} trigger="click" placement="bottom-start" onSelect={handleMenuSelect} size={'large'} class={'text-2xl'}  nodeProps={commonData.dropDowmProps} >
              <NButton strong={true} type="primary" secondary size={'large'} class={'h-12 w-28 shrink mr-2 '} style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }}
              >
                <span class={'text-2xl'}>菜单</span>
              </NButton>
            </NDropdown > */}
            <div class='ml-auto  h-16' >
              <NSpace>
                {nextShow.value && <NButton onClick={nextPage} size={'large'} >上一页</NButton>}
                {prevShow.value && <NButton onClick={prevPage} size={'large'} >下一页</NButton>}

              </NSpace>
              <img class={'h-full'} src={niotLogo} />

            </div>
          </div>
          <div class={'h-full pb-2 overflow-hidden flex-shrink'}>
            <div class={'w-full h-full'}>
              {commonData.cfgDataList.slice(commonData.curPage * commonData.pageSize, (commonData.curPage + 1) * commonData.pageSize).map((e: DataConfigEntity, i) => {
                return <CurcevChartRow i={i} dataSourceItem={{
                  "label": "直径(平均值)",
                  "key": "avg",
                  "parent": "diameter1"
                }} dataConfig={e} />
              })}
            </div>
          </div>
        </div>
      )
    }
  }

})