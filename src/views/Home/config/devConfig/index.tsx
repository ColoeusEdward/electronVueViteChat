import LargeBtnIcon from "@/components/LargeBtnIcon";
import { callSpc } from "@/utils/call";
import { AddOutlined, DeleteForeverFilled, EditFilled, KeyboardReturnRound } from "@vicons/material";
import { NButton, NDataTable, NIcon, useMessage } from "naive-ui";
import { defineComponent, reactive, Transition } from "vue";
import { DeviceConfigEntity } from "~/me";
import { useDevCfgInnerData } from "./innerData";
import Edit from "./edit";
import { devStateList } from "./enum";
import MyNTable from "@/components/MyNTable";

export default defineComponent({
  name: 'DevConfig',
  setup(props, ctx) {
    const innerData = useDevCfgInnerData()
    const msg = useMessage()
    const tableCfg = reactive({
      colList: [
        {
          type: 'selection',
          multiple: false,
        },
        { key: 'Name', title: '设备名称', resizable: true },
        { key: 'DriverName', title: '驱动名称', resizable: true },
        {
          key: 'State', title: '设备状态', resizable: true, render: (row: DeviceConfigEntity) => {
            return devStateList[row.State]
          }
        },
        { key: 'CreateTime', title: '创建时间', resizable: true },
        { key: 'Remark', title: '备注', resizable: true },
      ],
      data: [] as DeviceConfigEntity[],
      height:'',
      rowProps:(row: DeviceConfigEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      } ,
      rowKey: (row: DeviceConfigEntity) => row.GId
    })
    const getTableData = () => {
      callSpc('getDeviceConfigs').then((e: DeviceConfigEntity[]) => {
        // let d= {...e[0]}
        // d.GId = '2233444'
        // e.push(d)
        tableCfg.data = e
      })
    }
    getTableData()
    const rowClick = (e: DeviceConfigEntity) => {
      innerData.setCurRowKey([e.GId])
      innerData.setCurRow(e)
    }
    const addDev = () => {
      innerData.setIsEdit(false)
      innerData.setEditShow(true)
      // innerData.cleanCurRow()
    }
    const editDev = () => {
      if(!innerData.curRow){
        msg.warning('请选择一行数据')
        return
      }
      innerData.setIsEdit(true)
      innerData.setEditShow(true)
    }
    const delDev = () => {
      if(!innerData.curRow){
        msg.warning('请选择一行数据')
        return
      }
    }

    return () => {
      return (
        <div class={'w-full h-full flex-col'}>
          <div class={'flex flex-shrink-0 justify-start items-center p-2 pt-0 border-0 border-b border-solid border-b-gray-200'}>
            <NButton class={' ml-3 my-large-btn mr-3'} renderIcon={() => <LargeBtnIcon><AddOutlined /></LargeBtnIcon>} type="primary" size={'large'} onClick={addDev}>添加设备</NButton>
            <NButton class={'my-large-btn mr-3'} renderIcon={() => <LargeBtnIcon><EditFilled /></LargeBtnIcon>} type="primary" size={'large'} onClick={editDev}>编辑设备</NButton>
            <NButton class={'my-large-btn mr-3'} renderIcon={() => <LargeBtnIcon><DeleteForeverFilled /></LargeBtnIcon>} type="primary" size={'large'} onClick={delDev}>删除设备</NButton>
            {/* <NButton class={'my-large-btn mr-3'} renderIcon={() => <LargeBtnIcon><KeyboardReturnRound /></LargeBtnIcon>} type="" size={'large'} onClick={addDev}>返回</NButton> */}
          </div>
          <div class={'relative h-full flex-shrink'} style={{height:'calc(100% - 60px)'}}>
            {/* <NDataTable bordered={false} maxHeight={''} striped singleLine={false} columns={tableCfg.colList} data={tableCfg.data} size={'large'} >
            </NDataTable> */}
            {/* @ts-ignore */}
            <MyNTable v-model:checked-row-keys={innerData.curRowKey} data={tableCfg.data} rowKey={tableCfg.rowKey} rowProps={tableCfg.rowProps} columns={tableCfg.colList}></MyNTable>
            <Transition name='full-pop'>
              <Edit v-show={innerData.editShow} />
            </Transition>
          </div>

        </div>
      )
    }
  }

})