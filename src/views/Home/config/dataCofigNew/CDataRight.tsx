import MyNTable from "@/components/MyNTable";
import { callSpc } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { sleep } from "@/utils/utils";
import { NButton, NPopconfirm, NSpace, useMessage } from "naive-ui";
import { defineComponent, onMounted, reactive, Transition } from "vue";
import { CategoryDataEntity } from "~/me";
import { MemberForm } from ".";
import { categoryClassObj } from "./enum";
import { useDataCfgInnerDataStore } from "./innerData";

export default defineComponent({
  name: 'CDataRight',
  setup(props, ctx) {
    const innerData = useDataCfgInnerDataStore()
    const msg = useMessage()
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        { key: 'DataName', title: '数据名称', resizable: true },
        { key: 'DeviceName', title: '设备名称', resizable: true },
        { key: 'NodeName', title: '节点名', resizable: true },

        { key: 'CreateTime', title: '创建时间', resizable: true },
        {
          key: 'Class', title: '类型', resizable: true, render: (row: CategoryDataEntity) => {
            return <span>{categoryClassObj[row.Class]}</span>
          }
        },
      ],
      data: [] as CategoryDataEntity[],
      rowProps: (row: CategoryDataEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: CategoryDataEntity) => row.GId
    })
    const rowClick = (row: CategoryDataEntity) => {
      innerData.setCurCDataRowKey([row.GId])
      innerData.setCurCDataRow(row)
    }
    const getTableData = () => {
      innerData.cleanCurCDataRow()
      callBrige(callFnName.GetCategoryDatas).then((e: CategoryDataEntity[]) => {
        // let d= {...e[0]}
        // d.GId = '2233444'
        // e.push(d)
        tableCfg.data = e.map(e => {
          return {
            ...e,
            NodeName: innerData.curGroupData.find(ee => ee.GId == e.CategoryNodeId)?.NodeName
          }
        })
        console.log("🚀 ~ file: CDataRight.tsx:44 ~ callSpc ~ e:", e)
      })
    }
    innerData.setGetCDataFn(getTableData)
    const add = () => {
      innerData.setMemberEditShow(false)
      sleep(10).then(() => {
        innerData.setIsMemberEdit(false)
        innerData.setMemberEditShow(true)
      })


    }
    const edit = () => {
      if (!innerData.curCDataRow) {
        msg.warning('请选择一行数据')
        return
      }
      innerData.setMemberEditShow(false)
      sleep(10).then(() => {
        innerData.setMemberEditShow(true)
        innerData.setIsMemberEdit(true)
      })

    }
    const del = () => {
      callSpc(callFnName.deleteCategoryData, innerData.curCDataRow).then((res: number) => {
        getTableData()
      })
    }
    const showDevCfg = () => {
      innerData.setDevCfgShow(true)
    }
    onMounted(() => {
      getTableData()
    })

    return () => {
      return (
        <div class={'w-full h-full flex flex-col'}>
          <div class={'flex pb-2 pr-2'}>
            <NButton type={'primary'} size={'large'} onClick={showDevCfg} >设备配置</NButton>
            <div class={'ml-auto'}>
              <NSpace>
                <NButton size={'large'} onClick={add}>新增</NButton>
                <NButton size={'large'} onClick={edit} >编辑</NButton>
                <NPopconfirm onPositiveClick={del} placement={'bottom'} v-slots={{
                  trigger: () => <NButton type={'error'} size={'large'} >删除</NButton>
                }}>
                  确认删除吗?
                </NPopconfirm>
              </NSpace>
            </div>
          </div>
          <div class={' w-full h-full flex-shrink relative'}>
            <MyNTable v-model:checked-row-keys={innerData.curCDataRowKey}  {...tableCfg} />
            <Transition name="full-pop">
              {innerData.memberEditShow && <MemberForm />}
            </Transition>
          </div>
        </div>
      )
    }
  }

})