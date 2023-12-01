import { DropdownProps, NButton, NDatePicker, NDropdown, NIcon, NInput, NInputNumber, NSpace, NTimePicker, NTooltip, useMessage } from "naive-ui";
import { computed, defineComponent, onMounted, reactive } from "vue";
import niotLogo from '@/assets/login_logos.png';
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { ActualResult, CollectPointModel, CpkModel, DataConfigEntity, SysConfigEntity } from "~/me";
import activeImg from '@/assets/LineDspButton_inactive.png'
import { useCurcevInnerDataStore } from "./innerData";
import { InfoOutlined, LayersClearOutlined, PlayArrowOutlined, StopCircleOutlined } from "@vicons/material";
import CurcevChartRow from "./CurcevChartRow";
import CpkBlock from "./CpkBlock";
import NormalDis from "./NormalDis";
import { menuIdSplit, menuOptList, menuPropEnum } from "./enum";
import { sleep } from "@/utils/utils";
import { useMain } from "@/store";

export default defineComponent({
  name: 'Curcev',  //实时数据,

  setup(props, ctx) {
    const innerData = useCurcevInnerDataStore()
    const store = useMain()
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
    const getSysCfg = () => {
      callSpc(callFnName.getSysConfigs).then((res: SysConfigEntity[]) => {
        // console.log("🚀 ~ file: index.tsx:39 ~ callSpc ~ res:", res)
        innerData.setSysConfig(res)
      })
    }
    getSysCfg()
    const getAllActiveConfigData = () => {
      return callSpc(callFnName.getDataConfigs).then((res: DataConfigEntity[]) => {
        let list = res.filter((e: DataConfigEntity) => e.State == 1)
        commonData.cfgDataList = list
        innerData.setDataCfgList(list)
        if (!innerData.curDataCfgEntity) {
          innerData.setCurDataCfgEntity(list[0])
        }
      })
    }
    const startCollect = () => {
      refresh().then(() => {
        return callSpc(callFnName.startCollect)
      })
        .then((res: string) => {
          if (res) {
            innerData.setCurProductCode(res)
            innerData.setIsGetting(true)
          }

        })
    }
    const stopCollect = () => {
      callSpc(callFnName.stopCollect).then(() => {
        innerData.setIsGetting(false)
      })
    }
    const refresh = (e?: any) => {
      getSysCfg()
      return getAllActiveConfigData().then(() => {
        e && msg.success('配置已刷新')
        innerData.getCpkFn()
      })
    }
    const clearCollect = () => {
      callSpc(callFnName.clearCollect)
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
    const menuOpt = computed(() => {
      let opt = menuOptList
      let sitem = opt!.find(e => e.key == menuPropEnum.dataSource)
      sitem && (sitem.children = commonData.cfgDataList.map(e => {
        return {
          label: e.Name,
          key: menuPropEnum.dataSource + menuIdSplit + e.GId,
          trueKey: e.GId
        }
      }))

      return opt
    })
    const handleSelect = (key: string) => {
      let type = key.split(menuIdSplit)[0]
      let trueKey = key.split(menuIdSplit)[1]
      if (type == menuPropEnum.dataSource) {
        let item = commonData.cfgDataList.find(e => e.GId == trueKey)
        innerData.setCurDataCfgEntity(item)
      }
    }
    const renderLabel: DropdownProps['renderLabel'] = (option) => {
      let text = option.label
      if (option.trueKey && innerData.curDataCfgEntity?.GId == option.trueKey) {
        text += ' ✔️'
      }

      return (
        <span>{text}</span>
      )
    }
    const nodeProps = () => {
      return {
        style: {
          minWidth: '14vh'
        }
      }
    }
    const curShowCpkValue = computed(
      () => {
        if (!innerData.curCpk) return 0
        if (innerData.curCpkKey) {
          let key = innerData.curCpkKey.name as keyof CpkModel
          return innerData.curCpk[key]
        } else {
          return innerData.curCpk?.Avg
        }
      }
    )
    onMounted(() => {
      sleep(50).then(() => {
        refresh()
      })
    })
    return () => {
      return (
        <div class={'w-full h-full pt-2 shrink flex flex-col relative'}>
          {/* <CpkBlock /> */}
          <div class={'flex pl-2'}>
            <NSpace align={'center'}>
              <div></div>
              <NDropdown options={menuOpt.value} renderLabel={renderLabel} onSelect={handleSelect} trigger="click" placement="bottom-start" size={'large'} class={'text-2xl'} nodeProps={nodeProps} >
                <NButton strong={true} type="primary" secondary size={'large'} class={'h-12 w-28 shrink mr-2 '} style={{ backgroundImage: `url(${activeImg})`, backgroundSize: '100% 100%', color: '#534d62' }}>   <span class={'text-2xl'}>菜单</span>
                </NButton>
              </NDropdown>
              {innerData.isGetting ?
                <NButton type={'warning'} size={'large'} v-slots={{
                  icon: () => <NIcon><StopCircleOutlined /></NIcon>
                }} onClick={stopCollect} >停止采集</NButton>
                : <NButton type={'primary'} size={'large'} v-slots={{
                  icon: () => <NIcon><PlayArrowOutlined /></NIcon>
                }} onClick={startCollect} >开始采集</NButton>
              }
              
              <NButton onClick={refresh} size={'large'} >刷新配置</NButton>
              <NButton type={'warning'} size={'large'} v-slots={{
                  icon: () => <NIcon><LayersClearOutlined /></NIcon>
                }} onClick={clearCollect} >清空数据</NButton>
              {/* <div class={'flex items-center'} >
                <span class={'text-md w-fit mr-2 flex-shrink-0 '}>产品编号</span>
                <NInput placeholder={''} style={"width: 430px"} value={innerData.curProductCode}></NInput>
              </div> */}
              <div class={'flex items-center'} >
                <span class={'text-md w-fit mr-2'}>起始时间点</span>
                <NDatePicker v-model:value={innerData.startTime} type={'datetime'} />
              </div>

              <NormalDis />

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
              {/* <NSpace>
                {nextShow.value && <NButton onClick={nextPage} size={'large'} >上一页</NButton>}
                {prevShow.value && <NButton onClick={prevPage} size={'large'} >下一页</NButton>}

              </NSpace> */}
              <img class={'h-full'} src={niotLogo} />

            </div>
          </div>
          <div class={'h-1/2 pb-2 px-2 relative'}>
            {innerData.curDataCfgEntity && <CpkBlock dataConfig={innerData.curDataCfgEntity} />}

            <div class={'h-full border-1 border-solid border-[#e4e4e5] shadow-inner flex'}>
              <div class={'w-full h-full shrink py-1 px-2 flex justify-end items-center relative'}>
                <div class={'absolute top-2 right-2  text-lg'}>
                  {/* {innerData.curCpkKey?.title} */}
                  <NSpace>
                    <div class={'mr-4'}>
                      <span class={'text-gray-500 mr-2'}>产品编号</span>
                      <span class={"text-blue-500"}>{innerData.curProductCode}</span>

                    </div>
                    <div>
                      <span class={'text-gray-500 mr-2'}>上限</span>
                      <span class={"text-blue-500"}>{innerData.curCpk?.Usl.toFixed(4)}</span>
                    </div>
                    <div>
                      <span class={'text-gray-500 mr-2'}>下限</span>
                      <span class={"text-blue-500"}>{innerData.curCpk?.Lsl.toFixed(4)}</span>
                    </div>
                    <div>
                      <span class={'text-gray-500 mr-2'}>标准值</span>
                      <span class={"text-blue-500"}>{innerData.curCpk?.Std.toFixed(4)}</span>
                    </div>
                  </NSpace>
                </div>
                {/* <span class={'text-[#013b63] font-semibold'} style={{ fontSize: store.isLowRes ? '12rem' : '16rem' }} >{curShowCpkValue.value.toFixed(6)}</span> */}
                <span class={'text-[#013b63] font-semibold'} style={{ fontSize: store.isLowRes ? '12rem' : '14rem' }} >{innerData.curNewVal.toFixed(6)}</span>

              </div>
              <div class={' grow p-2 h-full flex flex-col relative'} style={{ backgroundImage: `linear-gradient(#cdcdcd, #f2f2f2 ,#cdcdcd)` }}>
                {/* <div class={'absolute top-2 right-2'}>
                  <NTooltip v-slots={{
                    trigger: () => <NIcon class={'text-lg'}><InfoOutlined /></NIcon>
                  }}>
                      CPK需要等待采集一段时间才会有数据
                  </NTooltip>
                </div> */}
                <span class={'mt-auto mb-[6vh] text-5xl font-bold text-[#5e5452]'}>{innerData.curDataCfgEntity?.Unit}</span>
              </div>
            </div>
          </div>
          {
            innerData.curDataCfgEntity &&
            <CurcevChartRow height="50%" i={0} dataConfig={innerData.curDataCfgEntity} />
          }


          {/* <div class={'h-full pb-2 overflow-hidden flex-shrink'}>
            <div class={'w-full h-full'}>
              {commonData.cfgDataList.slice(commonData.curPage * commonData.pageSize, (commonData.curPage + 1) * commonData.pageSize).map((e: DataConfigEntity, i) => {
                return <CurcevChartRow i={i} dataSourceItem={{
                  "label": "直径(平均值)",
                  "key": "avg",
                  "parent": "diameter1"
                }} dataConfig={e} />
              })}
            </div>
          </div> */}
        </div>
      )
    }
  }

})