import MyNTable from "@/components/MyNTable";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { RefreshOutlined } from "@vicons/material";
import { NButton, NDivider, NIcon, NInput, NPopconfirm, NSpace, useMessage } from "naive-ui";
import { computed, defineComponent, reactive, Transition } from "vue";
import { FormulaConfigEntity } from "~/me";
import AddForm from "./AddForm";
import { ActiveStateEnum } from "./enum";
import FormulaDataList from "./FormulaDataList";
import { useFormulaCfgInnerDataStore } from "./innderData";

export default defineComponent({
  name: 'FormulaConfig',  //配方配置
  setup(props, ctx) {
    const innerData = useFormulaCfgInnerDataStore()
    const msg = useMessage()
    const commonData = reactive({
      filterText: ''
    })
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        { key: 'PN', title: '线材型号', resizable: true },
        { key: 'Note', title: '注释', resizable: true },
        {
          key: 'Active', title: '启用状态', resizable: true, render: (row: FormulaConfigEntity) => {
            return ActiveStateEnum[row.Active]
          }
        },
      ],
      tdata: [] as FormulaConfigEntity[],
      rowProps: (row: FormulaConfigEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: FormulaConfigEntity) => row.GId
    })
    const ftdata = computed(() => {
      let list = tableCfg.tdata.filter(item => {
        return item.PN ? item.PN.search(commonData.filterText) > -1 : true
      })
      return list
    })
    const activeRow = computed(() => {
      return tableCfg.tdata.find(e => e.Active == 1)
    })
    const rowClick = (row: FormulaConfigEntity) => {
      innerData.setCurRowKey([row.GId!])
      innerData.setCurRow(row)
    }
    const getTbData = () => {
      innerData.cleanRow()

      callSpc(callFnName.getFormulaConfigs).then((res: FormulaConfigEntity[]) => {
        tableCfg.tdata = res
      })
    }
    getTbData()
    innerData.setGetTabDataFn(getTbData)
    const addForm = () => {
      innerData.setAddFormShow(true)
    }
    const delForm = () => {
      if (!innerData.curRow) {
        msg.warning('请选择一行数据')
        return
      }
      callSpc(callFnName.deleteFormulaConfig, innerData.curRow).then((res: number) => {
        getTbData()
      })
    }
    const changeActiveRow = () => {
      if (!innerData.curRow) {
        msg.warning('请选择一行数据')
        return
      }
      callSpc(callFnName.activeFormulaConfig, innerData.curRow).then((res: number) => {
        getTbData()
      })
    }
    return () => {
      return (
        <div class={'w-full h-full flex flex-col'}>
          <div class={'flex-shrink-0'}>
            <NDivider titlePlacement="left">生产信息</NDivider>
            <div class={'flex w-full'}>
              <NSpace align={'center'} class={' w-full'}>
                <span class={'flex-shrink-0 p-2 '}  >当前启用配方</span>
                <NInput size={'large'}  placeholder={''} value={activeRow.value?.PN} ></NInput>
                <NInput size={'large'} placeholder={'请输入线材型号进行筛选'} clearable v-model:value={commonData.filterText} ></NInput>
                {/* <NButton size={'large'}  >查询配方</NButton> */}
              </NSpace>
              {/* <NButton class={'ml-auto mr-2'} size={'large'}> 添加配方</NButton>
              <NButton class={'ml-auto mr-2'} type={'primary'} size={'large'}> 应用配方</NButton>
              <NButton class={'ml-auto mr-2'} type={'error'} size={'large'}> 删除配方</NButton> */}

            </div>
            <NDivider titlePlacement="left">产品配方</NDivider>
          </div>
          <div class={'h-full flex-shrink flex'}>
            <div class={'w-2/5 relative'}>
              <NSpace class={'pl-2 pb-2'}>
              <NButton class={' '} size={'large'} onClick={addForm} > 添加配方</NButton>

                <NButton class={' '} type={'primary'} size={'large'} onClick={changeActiveRow} > 应用配方</NButton>
                <NPopconfirm onPositiveClick={delForm} placement={'bottom'} v-slots={{
                  trigger: () => <NButton class={' '} type={'error'} size={'large'} > 删除配方</NButton>
                }}>
                  确认删除吗?
                </NPopconfirm>
              </NSpace>
              {/* @ts-ignore */}
              <MyNTable v-model:checkedRowKeys={innerData.curRowKey} {...tableCfg} data={ftdata.value} ></MyNTable>
              <Transition name={'full-pop'}>
                <AddForm v-show={innerData.addFormShow} />
              </Transition>
              <div class={"absolute top-0 right-0 "} title={'刷新'}>
                <NButton onClick={() => { getTbData() }} circle v-slots={{
                  icon: () => <NIcon><RefreshOutlined /></NIcon>
                }}  ></NButton>
              </div>
            </div>
            <div class={'w-3/5'}>
              <FormulaDataList v-show={innerData.curRow} />
            </div>
          </div>
        </div>
      )
    }
  }

})