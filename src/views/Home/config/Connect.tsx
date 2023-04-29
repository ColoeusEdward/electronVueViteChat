import { useConfigStore } from "@/store/config";
import { DataTableProps, NButton, NDataTable, NDrawer, NDrawerContent, NPopconfirm, NSpace } from "naive-ui";
import { defineComponent, ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import SimpleModel from "@/components/SimpleModel/SimpleModel";
import ConnectForm from "./ConnectForm";

export default defineComponent({
  name: 'Connect',
  setup(props, ctx) {
    const configStore = useConfigStore()
    const formShow = ref(false)
    const form = ref<connectForm>({

    })
    const delRow = (row: any) => {

    }
    const addRow = () => {
      form.value = {}
      formShow.value = true
    }
    const colList: DataTableProps['columns'] = [
      { key: 'ProtoType', title: '协议类型' },
      { key: 'DevInt', title: '通讯接口' },
      { key: 'Name', title: '名称' },
      { key: 'Remark', title: '备注' },
      {
        key: 'op', title: '操作',width:200, render(row) {
          return <NSpace>
            <NButton type="primary" size={'medium'}>编辑</NButton>
            <NPopconfirm placement="right" title=""
              v-slots={{
                default: () => {
                  return <div>确定删除?</div>
                },
                trigger: () => {
                  return <NButton type="error" size={'medium'}>删除</NButton>
                }
              }}
              onConfirm={() => { delRow(row) }}>
            </NPopconfirm>
          </NSpace>
        }
      },
    ]


    return () => {
      return (
        <div class={'w-full h-full px-2 flex flex-col'}>
          <div class={'w-full h-10 flex justify-end items-center pb-2'}>
            <NButton size={'large'} onClick={addRow} >新建</NButton>
          </div>
          <div class={'h-full shrink relative border-0 border-b-2 border-solid border-gray-300'} id={'tableCon'}>
            <NDataTable columns={colList} data={configStore.connect.data} size={'large'} >
            </NDataTable>

            <NDrawer v-model:show={formShow.value} placement={'bottom'} to={'#tableCon'} trapFocus={false} height={'30vh'} blockScroll={false}>
              <NDrawerContent title={''}>
                <ConnectForm form={form.value} />
              </NDrawerContent>
            </NDrawer>
          </div>

        </div>
      )
    }
  }

})