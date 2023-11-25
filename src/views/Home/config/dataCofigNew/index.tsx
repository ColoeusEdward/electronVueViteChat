import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { ajaxPromiseAll, sleep } from "@/utils/utils";
import classNames from "classnames";
import { NButton, NPopconfirm, NScrollbar, NSwitch, NTree, SelectProps, TreeProps, useMessage } from "naive-ui";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, Transition } from "vue";
import { CategoryDataEntity, CategoryNodeEntity, DataConfigEntity, DeviceConfigEntity, } from "~/me";
import { categoryClassList, limitRadioList } from "./enum";
import { useDataCfgInnerDataStore } from "./innerData";
import { isCategoryDataEntity, isCategoryNodeEntity } from '@/utils/typeUtil'
import ConfigRight from "./ConfigRight";


export default defineComponent({
  name: 'DataCofigNew',
  setup(props, ctx) {
    const innerData = useDataCfgInnerDataStore()
    innerData.cleanSelectItem()
    const msg = useMessage()
    let allList = [] as (CategoryNodeEntity | CategoryDataEntity)[]
    const treeCfg = reactive({
      data: [] as TreeProps['data'],
      showLine: true,
      selectedKeys: innerData.selectKey,
      nodeProps: (info: { option: CategoryNodeEntity | CategoryDataEntity }) => {
        let key = getEntityKeyAndName(info.option)
        return {
          class: classNames({ ' bg-[#f3f3f5] border border-solid border-blue-200 ': key == innerData.selectKey[0] }),
        }
      },
      onUpdateSelectedKeys: (keys: string[]) => {
        let item = allList.find(e => e.GId == keys[0].split('*')[0])
        item && innerData.setSelectItem({ ...item })
        item && innerData.setSelectKey([getEntityKeyAndName(item)])
        !innerData.isAddGroup && innerData.setEditShow(false)
      }
    })
    const getEntityKeyAndName = (item: CategoryNodeEntity | CategoryDataEntity) => {
      let name = ''
      if (isCategoryDataEntity(item))
        name = item.DataName
      if (isCategoryNodeEntity(item))
        name = item.NodeName
      return item.GId + '*' + name
    }
    const createTree = ([nodeList, dataList]: [CategoryNodeEntity[], CategoryDataEntity[]]) => {
      // allList.push(...[...nodeList, ...dataList])
      allList = [...nodeList, ...dataList]
      let dataMap: Record<string, CategoryDataEntity[]> = {}
      dataList.forEach(e => {
        if (!dataMap[e.CategoryNodeId]) {
          dataMap[e.CategoryNodeId] = [e]
        } else {
          dataMap[e.CategoryNodeId].push(e)
        }
      })
      let res = nodeList.map(e => {
        return {
          ...e,
          label: e.NodeName,
          key: getEntityKeyAndName(e),//为了确保树形组件能够正确刷新, key都要加上名字
          children: dataMap[e.GId] ? dataMap[e.GId].map(e => {
            return {
              ...e,
              label: e.DataName,
              key: getEntityKeyAndName(e)
            }
          }) : []
        }
      })

      return res
    }
    const getTreeData = () => {
      // treeCfg.data = []
      innerData.cleanSelectItem()
      // allList.splice(-0)
      allList = []
      ajaxPromiseAll<[CategoryNodeEntity[], CategoryDataEntity[]]>([callSpc(callFnName.getCategoryNodes), callSpc(callFnName.getCategoryDatas)]).then((e) => {
        treeCfg.data = createTree(e)

        // console.log("🚀 ~ file: index.tsx:67 ~ ajaxPromiseAll<[CategoryNodeEntity[],CategoryDataEntity[]]> ~ treeCfg.data:", treeCfg.data)
      })
    }
    innerData.setGetTreeDataFn(getTreeData)
    getTreeData()
    const addGroup = () => {
      innerData.setIsMemberAddMore(false)
      innerData.setEditShow(false)
      nextTick(() => {
        innerData.setIsEdit(false)
        innerData.setIsAddGroup(true)
        innerData.setEditShow(true)
      })

    }
    const addData = () => {
      if (!innerData.selectItem || !innerData.isGroup) {
        msg.warning('请选择一行分组')
        return
      }
      innerData.setIsMemberAddMore(false)
      innerData.setEditShow(false)
      nextTick(() => {
        innerData.setIsEdit(false)
        innerData.setIsAddGroup(false)
        innerData.setEditShow(true)
      })

    }
    const editItem = () => {
      innerData.setEditShow(false)
      innerData.setIsMemberAddMore(false)
      if (!innerData.selectItem) {
        msg.warning('请选择一行数据')
        return
      }
      nextTick(() => {
        innerData.setIsEdit(true)
        innerData.setIsAddGroup(false)
        innerData.setEditShow(true)
      })

    }
    const delItem = () => {
      if (!innerData.selectItem) {
        msg.warning('请选择一行数据')
        return
      }
      let freezeSelectItem = {...innerData.selectItem}
      callSpc(innerData.isGroup ? callFnName.deleteCategoryNode : callFnName.deleteCategoryData, innerData.selectItem).then(() => {
        if(innerData.isGroup){
          callSpc(callFnName.getDataConfigs).then((list:DataConfigEntity[]) => {   //连带删除 dataConfig
            let item = list.find(e => e.CategoryNodeId == freezeSelectItem.GId)
            item && callSpc(callFnName.deleteDataConfig,item)
          })
        }
        getTreeData()
      })
    }
    const initDatConfig = () => {
      callSpc(callFnName.initDataConfig).then(() => {
        getTreeData()
      })
    }

    onMounted(() => {
      innerData.setIsMemberAddMore(false)
    })

    return () => {
      return (
        <div class={'w-full h-full flex'}>
          <div class={'w-1/2 h-full  p-2 pt-0'}>
            <div class={'w-full h-full border border-solid border-gray-200 rounded-md relative flex'}>
              <NScrollbar>
                <div class={'h-full w-full flex-shrink pl-2 pt-2'}>
                  <NTree
                    default-expand-all
                    block-line
                    selectable
                    {...treeCfg}
                  />
                </div>
              </NScrollbar>


              {/* absolute right-2 top-2 */}
              <div class={' h-full w-[440px] pt-2 ml-2 relative'}>
                <div class={'flex justify-end '}>
                  <NButton class={'mr-2 mb-2'} onClick={addGroup} >添加分组</NButton>
                  <NButton class={'mr-2 mb-2'} v-show={innerData.isGroup} onClick={addData} >添加成员</NButton>
                </div>
                <div class={'flex justify-end '}>
                  <NButton class={'mr-2 mb-2'} onClick={editItem} >编辑选中</NButton>
                  <NPopconfirm onPositiveClick={delItem} placement={'bottom'} v-slots={{
                    trigger: () => <NButton class={'mr-2 mb-2'} type={'error'} onClick={() => { innerData.setEditShow(false) }} >移除选中</NButton>
                  }}>
                    确认删除吗?
                  </NPopconfirm>
                </div>
                <div class={'absolute bottom-2 right-2'}>
                  <NButton size={'large'} onClick={initDatConfig} >初始化数据配置</NButton>
                </div>
                <div class={'mt-2 px-2 relative'}>
                  <Transition name='full-pop'>
                    {(innerData.groupShow && !innerData.isMemberAddMore) && <GroupForm />}

                  </Transition>
                  <Transition name='full-pop'>
                    {(innerData.memberShow || innerData.isMemberAddMore) && <MemberForm />}
                    {/* {
                    console.log("🚀 ~ file: index.tsx:151 ~ return ~ innerData.groupShow && !innerData.isMemberAddMore:", innerData.groupShow ,innerData.memberShow , innerData.isMemberAddMore)
                    } */}
                    {/* {!innerData.isGroupData &&  <GroupForm />} */}
                  </Transition>
                </div>
              </div>
            </div>
          </div>
          <div class={'w-1/2 h-full '}>
            {innerData.selectItem && <ConfigRight />}
          </div>
        </div>
      )
    }
  }

})

const GroupForm = defineComponent({
  name: '',
  setup(props, ctx) {
    const innerData = useDataCfgInnerDataStore()
    const formCfg = reactive({
      form: innerData.isEdit ? innerData.selectItem as CategoryNodeEntity : {},
      optionMap: {
      } as Record<string, SelectProps['options']>,
      itemList: [
        { type: "input", label: "分组名称", prop: "NodeName", rule: 'must', width: 24 },

      ] as formListItem[],
      hideBtn: false,
      noLargeBtn: true,
      btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
      renderToBtn: () => {
        return (
          <NButton class={'mr-3 relative mb-2'} onClick={cancel} size={'large'} >取消</NButton>
        )
      },
      submitFn: (form: CategoryNodeEntity) => {
        console.log("🚀 ~ file: index.tsx:179 ~ setup ~ form:", form)
        callSpc(callFnName.saveCategoryNode, form).then((res: number) => {
          innerData.getTreeDataFn()
          innerData.setEditShow(false)

        })
      },
      saveText: innerData.isEdit ? '编辑' : '添加'
    })

    const cancel = () => {
      innerData.setEditShow(false)
    }
    return () => {
      return (
        <div class={' absolute top-2 right-2'}>
          <MyFormWrap {...formCfg} ></MyFormWrap>
        </div>
      )
    }
  }

})

const MemberForm = defineComponent({
  name: 'MemberForm,',
  setup(props, ctx) {
    const innerData = useDataCfgInnerDataStore()
    const selectItemFreeze = { ...innerData.selectItem } as CategoryDataEntity
    const formCfg = reactive({
      form: innerData.isEdit ? innerData.selectItem as CategoryDataEntity : { Limit: 0 },
      optionMap: {
      } as Record<string, SelectProps['options']>,
      itemList: [
        { type: "input", label: "数据名称", prop: "DataName", rule: 'must', width: 24 },
        { type: "select", label: "设备名称", prop: "DeviceName", rule: 'must', width: 24 },
        { type: "select", label: "数据分类", prop: "Class", rule: 'must', width: 24 },
        { type: "radio", label: "读写权限", radioList: limitRadioList, prop: "Limit", width: 24 },  //(0:只读,1:只写,2:读写)
      ] as formListItem[],
      hideBtn: false,
      noLargeBtn: true,
      btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
      renderToBtn: () => {
        return (
          <NButton class={'mr-3 relative mb-2 '} onClick={cancel} size={'large'} >取消</NButton>
        )
      },
      submitFn: (form: CategoryDataEntity) => {
        !form.CategoryNodeId && (form.CategoryNodeId = selectItemFreeze!.GId)
        callSpc(callFnName.saveCategoryData, form).then((res: number) => {
          innerData.getTreeDataFn()
          if (!innerData.isMemberAddMore) {
            innerData.setEditShow(false)
            // formCfg.form = {...form}
          }
        })
      },
      saveText: innerData.isEdit ? '编辑' : '添加',
      hasAddMore: !innerData.isEdit,
    })
    formCfg.optionMap.Class = categoryClassList
    const getDevList = () => {
      callSpc(callFnName.getDeviceConfigs).then((res: DeviceConfigEntity[]) => {
        formCfg.optionMap.DeviceName = res.map(e => {
          return {
            label: e.Name,
            value: e.Name
          }
        })
      })
    }
    getDevList()
    const cancel = () => {
      innerData.setIsMemberAddMore(false)
      innerData.setEditShow(false)
    }
    onBeforeUnmount(() => {
      innerData.setIsMemberAddMore(false)
    })
    return () => {
      return (
        <div class={' absolute top-2 right-2'}>
          <MyFormWrap {...formCfg} v-model:isAddMore={innerData.isMemberAddMore} ></MyFormWrap>
        </div>
      )

    }
  }

})