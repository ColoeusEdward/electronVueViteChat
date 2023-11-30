import LargeBtnIcon from "@/components/LargeBtnIcon";
import MyNTable from "@/components/MyNTable";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { sleep } from "@/utils/utils";
import { AddOutlined, DeleteForeverFilled, EditFilled } from "@vicons/material";
import { NButton, NPopconfirm, NSpace, useMessage } from "naive-ui";
import { defineComponent, reactive, Transition } from "vue";
import { CategoryNodeEntity, DataConfigEntity } from "~/me";
import ConfigRight from "../dataCofigNew/ConfigRight";
import { AlarmTypeNameList, dataTypeEnumList, dataTypeEnumNameList, UnilateralNameList, } from "../dataCofigNew/enum";
import { useDataCfgOutInnerDataStore } from "./innerData";

export default defineComponent({
  name: 'DataCfgOut',
  setup(props, ctx) {
    const innerData = useDataCfgOutInnerDataStore()
    const msg = useMessage()
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        { key: 'Name', title: '数据名称', resizable: true },
        {
          key: 'DataType', title: '数据类型', resizable: true, render: (row: DataConfigEntity) => {
            return <span>{dataTypeEnumNameList[row.DataType - 1]}</span>
          }
        },
        { key: 'Unit', title: '单位', width: 100, resizable: true },
        { key: 'Precision', title: '精度', width: 100, resizable: true },
        { key: 'Distance', title: '仪器偏移量', width: 100, resizable: true },
        {
          key: 'Unilateral', title: '单边数据', resizable: true, render: (row: DataConfigEntity) => {
            return <span>{UnilateralNameList[row.Unilateral]}</span>
          }
        },
        {
          key: 'AlarmType', title: '报警类型', resizable: true, render: (row: DataConfigEntity) => {
            return <span>{AlarmTypeNameList[row.AlarmType]}</span>
          }
        },
        {
          key: 'State', title: '启用状态', resizable: true, render: (row: DataConfigEntity) => {
            return <span>{row.State ? '已启用' : '禁用'}</span>
          }
        },
        { key: 'NodeName', title: '所属节点', resizable: true },
        { key: 'SortNum', title: '排序', width: 100, resizable: true },
        { key: 'CreateTime', title: '创建时间', resizable: true },

      ],
      data: [] as DataConfigEntity[],
      rowProps: (row: DataConfigEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: DataConfigEntity) => row.GId
    })
    const rowClick = (row: DataConfigEntity) => {
      innerData.setCurRowKey([row.GId!])
      innerData.setCurRow(row)
    }
    const getNodeList = () => {
      callSpc(callFnName.getCategoryNodes).then((list: CategoryNodeEntity[]) => {
        innerData.setNodeList(list)
      })
    }
    getNodeList()
    const getTableData = () => {
      callSpc(callFnName.getDataConfigs).then((list: DataConfigEntity[]) => {
        tableCfg.data = list.sort((a, b) => a.SortNum - b.SortNum).map(e => {
          return {
            ...e,
            NodeName: innerData.nodeList.find(ee => ee.GId == e.CategoryNodeId)?.NodeName
          }
        })
      })
    }
    getTableData()
    innerData.setGetTabDataFn(getTableData)
    const add = () => {
      innerData.setEditShow(false)
      sleep(10).then(() => {
        innerData.setIsEdit(false)
        innerData.setEditShow(true)
      })
    }
    const edit = () => {
      if (!innerData.curRow) {
        msg.warning('请选择一行数据')
        return
      }
      innerData.setEditShow(false)
      sleep(10).then(() => {
        innerData.setIsEdit(true)
        innerData.setEditShow(true)
      })
    }
    const del = () => {
      if (!innerData.curRow) {
        msg.warning('请选择一行数据')
        return
      }
      callSpc(callFnName.deleteDataConfig, innerData.curRow).then((res: number) => {
        getTableData()
      })
    }

    return () => {
      return (
        <div class={'w-full h-full flex flex-col'}>
          <div class={'pl-2 pb-2'}>
            <NSpace>
              <NButton type={'primary'} renderIcon={() => <LargeBtnIcon><AddOutlined /></LargeBtnIcon>} class={'my-large-btn'} size={'large'} onClick={add}>新增</NButton>
              <NButton type={'primary'} class={'my-large-btn'} size={'large'} onClick={edit} renderIcon={() => <LargeBtnIcon><EditFilled /></LargeBtnIcon>}  >编辑</NButton>
              <NPopconfirm onPositiveClick={del} placement={'bottom'} v-slots={{
                trigger: () => <NButton renderIcon={() => <LargeBtnIcon><DeleteForeverFilled /></LargeBtnIcon>} class={'my-large-btn'} type={'error'} size={'large'} >删除</NButton>
              }}>
                确认删除吗?
              </NPopconfirm>
            </NSpace>
          </div>
          <div class={'flex-shrink h-full w-full relative'}>
            <MyNTable v-model:checked-row-keys={innerData.curRowKey} {...tableCfg} />
            <Transition name={'full-pop'}>
              {
                innerData.editShow &&
                <div class={'absolute bottom-0 right-0 w-full px-2  bg-white'}>
                  <ConfigRight />
                </div>
              }
            </Transition>
          </div>
        </div>
      )
    }
  }

})