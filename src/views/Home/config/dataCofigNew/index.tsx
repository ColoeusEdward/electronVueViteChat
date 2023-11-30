import { formListItem, MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { ajaxPromiseAll, sleep } from "@/utils/utils";
import classNames from "classnames";
import { NButton, NPopconfirm, NScrollbar, NSpace, NSwitch, NTree, SelectProps, TreeProps, useMessage } from "naive-ui";
import { defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, Transition } from "vue";
import { CategoryDataEntity, CategoryNodeEntity, DataConfigEntity, DeviceConfigEntity, } from "~/me";
import { categoryClassList, categoryClassObj, limitList, limitRadioList } from "./enum";
import { useDataCfgInnerDataStore } from "./innerData";
import { isCategoryDataEntity, isCategoryNodeEntity } from '@/utils/typeUtil'
import ConfigRight from "./ConfigRight";
import CDataRight from "./CDataRight";
import DevConfig from "../devConfig";
import DetailRigth from "./DetailRigth";


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
              label: e.ComposeName,
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
        e[1] = e[1].map(e => {
          return {
            ...e,
            ComposeName: `${e.DataName}-${e.DeviceName}-${categoryClassObj[e.Class]}-${limitList[e.Limit]}`
          }
        })
        treeCfg.data = createTree(e)

        // console.log("🚀 ~ file: index.tsx:67 ~ ajaxPromiseAll<[CategoryNodeEntity[],CategoryDataEntity[]]> ~ treeCfg.data:", treeCfg.data)
      })
      // callSpc(callFnName.getCategoryNodes).then((nodeList: CategoryNodeEntity[]) => {
      //   innerData.setCurGroupData(nodeList)
      //   treeCfg.data = createTree([nodeList, []])
      // })
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
      let freezeSelectItem = { ...innerData.selectItem }
      callSpc(innerData.isGroup ? callFnName.deleteCategoryNode : callFnName.deleteCategoryData, innerData.selectItem).then(() => {
        if (innerData.isGroup) {
          callSpc(callFnName.getDataConfigs).then((list: DataConfigEntity[]) => {   //连带删除 dataConfig
            let item = list.find(e => e.CategoryNodeId == freezeSelectItem.GId)
            item && callSpc(callFnName.deleteDataConfig, item)
          })
        }
        getTreeData()
      })
    }
    const initDatConfig = () => {
      callSpc(callFnName.initDataConfig).then(() => {
        msg.success('初始化完毕')
        getTreeData()
      })
    }

    onMounted(() => {
      innerData.setIsMemberAddMore(false)
    })

    return () => {
      return (
        <div class={'w-full h-full flex relative'}>
          <div class={'w-1/2 h-full flex flex-col'}>
            <div class={'w-full h-full  p-2 pt-0'}>
              <div class={'w-full h-full border border-solid border-gray-200 rounded-md relative flex'}>
                <NScrollbar>
                  <div class={'h-full w-full flex-shrink pl-2 pt-2'}>
                    <NTree
                      block-line
                      selectable
                      default-expand-all
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
                    {
                      innerData.isMember &&
                      <NPopconfirm onPositiveClick={delItem} placement={'bottom'} v-slots={{
                        trigger: () => <NButton class={'mr-2 mb-2'} type={'error'} onClick={() => { innerData.setEditShow(false) }} >移除选中</NButton>
                      }}>
                        确认删除吗?
                      </NPopconfirm>
                    }

                  </div>
                  <div class={'absolute bottom-2 right-2'}>
                    <NSpace vertical align={'end'}>
                      <NButton size={'large'} type={'primary'} onClick={() => { innerData.setDevCfgShow(true) }} >设备配置</NButton>
                      <NButton size={'large'} onClick={initDatConfig} >初始化数据配置</NButton>
                    </NSpace>

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

          </div>
          {/* {innerData.selectItem && <ConfigRight />} */}
          <div class={'w-1/2 h-full'}>
            <DetailRigth />
          </div>

          <Transition name={'full-pop'}>
            {
              innerData.devCfgShow &&
              <div class={'absolute top-0 left-0 w-full h-full bg-white z-50 flex flex-col'} >
                <DevConfig />
                {/* <div >
                <NButton class={'absolute top-2 right-2'} onClick={() => { innerData.setDevCfgShow(false) }} >返回</NButton>
              </div>
              <div class={'w-full h-full flex-shrink'}>

              </div> */}
              </div>
            }

          </Transition>

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

export const MemberForm = defineComponent({
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
        // { type: "select", label: "所属节点", prop: "CategoryNodeId", rule: 'must', width: 24 },
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
          // innerData.getCDataFn()
          if (!innerData.isMemberAddMore) {
            // innerData.setMemberEditShow(false)
            innerData.setEditShow(false)
            // formCfg.form = {...form}
          }
        })
      },
      saveText: innerData.isEdit ? '编辑' : '添加',
      hasAddMore: !innerData.isEdit,
    })
    formCfg.optionMap.Class = categoryClassList
    // formCfg.optionMap.CategoryNodeId = innerData.curGroupData.map(e => {
    //   return {
    //     label: e.NodeName,
    //     value: e.GId
    //   }
    // })
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
      // innerData.setMemberEditShow(false)
    }
    onBeforeUnmount(() => {
      innerData.setIsMemberAddMore(false)
    })
    return () => {
      return (
        <div class={' absolute top-2 right-2 w-full'}>
          {/* <MyFormWrap {...formCfg} v-model:isAddMore={innerData.isMemberAddMore} ></MyFormWrap> */}
          <MyFormWrap {...formCfg} ></MyFormWrap>
        </div>
      )

    }
  }

})