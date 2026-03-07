import { formListItem, MyFormWrap, MyFormWrapIns } from "@/components/MyFormWrap/MyFormWrap";
import { callSpc } from "@/utils/call";
import { callFnName } from "@/utils/enum";
import { NButton, SelectProps, useMessage } from "naive-ui";
import { defineComponent, reactive, ref, watch } from "vue";
import { CategoryDataEntity, CategoryNodeEntity, DataConfigEntity } from "~/me";
import { isCategoryDataEntity, isCategoryNodeEntity } from "@/utils/typeUtil";
import { AlarmTypeList, DataTypeEnum, dataTypeEnumList, defaultDataConfigForm, UnilateralList } from "./enum";
import { useDataCfgInnerDataStore } from "./innerData";
import { ajaxPromiseAll } from "@/utils/utils";
import { useDataCfgOutInnerDataStore } from "../dataCfgOut/innerData";
import { callBrige } from "@/utils/callm";

export default defineComponent({
  name: 'ConfigRight',
  setup(props, ctx) {
    const innerData = useDataCfgInnerDataStore()
    const dataCfgOutInnerData = useDataCfgOutInnerDataStore()
    const msg = useMessage()
    const myFormRef = ref<MyFormWrapIns>()
    const UnilateralHide = ref(false)
    const AlarmTypeHide = ref(false)
    const UnilateralItem = { type: 'radio', label: '是否单边数据', prop: 'Unilateral', radioType: 'def', radioList: UnilateralList, width: 12, hide: UnilateralHide }
    const AlarmTypeItem = { type: 'radio', label: '报警方式', prop: 'AlarmType', radioType: 'def', radioList: AlarmTypeList, width: 10, hide: AlarmTypeHide }
    const formCfg = reactive({
      form: dataCfgOutInnerData.isEdit ? { ...dataCfgOutInnerData.curRow } as DataConfigEntity : { ...defaultDataConfigForm } as DataConfigEntity,
      optionMap: {
      } as Record<string, SelectProps['options']>,
      itemList: [
        {
          type: 'shadowBox', label: '', width: 24, childCompList: [
            { type: 'divider', label: '数据设定', width: 24 },
            { type: "input", label: "名称", prop: "Name", rule: 'must', width: 12 },
            { type: "input", label: "单位", prop: "Unit", width: 12 },
            { type: "numInput", label: "排序", prop: "SortNum", min: 0, width: 8 },
            { type: "numInput", label: "精度", prop: "Precision", min: 0, width: 8 },
            { type: "select", label: "所属节点", prop: "CategoryNodeId", rule: 'must', width: 8 },
          ]
        },
        {
          type: 'shadowBox', label: '', width: 24, childCompList: [
            { type: 'divider', label: '数据范围', width: 24 },
            { type: 'radio', label: '数据类型', prop: 'DataType', radioType: 'def', radioList: dataTypeEnumList, width: 12 },
            UnilateralItem,
            AlarmTypeItem,
            { type: 'switch', label: '启用状态', prop: 'State', checkedValue: 1, uncheckedValue: 0, width: 12 }, //0,1
            // { type: 'switch', label: '', prop: '44', checkedValue: 1, uncheckedValue: 0, width: 12 }, //0,1

          ]
        },
        { type: 'space', width: 24, style: { height: '20px' } },
      ] as formListItem[],
      hideBtn: false,
      noLargeBtn: false,
      btnStyleStr: `margin-right: 8px;margin-bottom:8px;`,
      renderToBtn: () => {
        return (
          <NButton class={' my-large-btn mr-3 relative mb-2 bg-white hover:bg-white'} onClick={cancel} size={'large'} >取消</NButton>
        )
      },
      submitFn: (form: DataConfigEntity) => {
        console.log("🚀 ~ file: index.tsx:179 ~ setup ~ form:", form)
        // if (!form.CategoryNodeId) {
        //   isCategoryDataEntity(innerData.selectItem!) && (form.CategoryNodeId = innerData.selectItem!.CategoryNodeId)
        //   isCategoryNodeEntity(innerData.selectItem!) && (form.CategoryNodeId = innerData.selectItem!.GId)
        // }
        callSpc(callFnName.saveDataConfig, form).then((res: number) => {
          if (res) {
            msg.success('保存成功')
          }
          dataCfgOutInnerData.getTbDataFn()
          dataCfgOutInnerData.setEditShow(false)
        })
      },
    })
    formCfg.optionMap.CategoryNodeId = dataCfgOutInnerData.nodeList.map(e => ({ label: e.NodeName, value: e.GId }))
    const cancel = () => {
      dataCfgOutInnerData.setEditShow(false)
    }
    watch(() => formCfg.form.DataType, (val) => {
      switch (val) {
        case DataTypeEnum.Chart: {
          UnilateralHide.value = false
          AlarmTypeHide.value = false
          break;
        }
        case DataTypeEnum.Alarm: {
          UnilateralHide.value = true
          AlarmTypeHide.value = false
          break;
        }
        default: {
          UnilateralHide.value = true
          AlarmTypeHide.value = true
        }
      }
    }, {
      immediate: true
    })
    const getForm = (selectItem?: typeof innerData.selectItem) => {
      let item = selectItem || innerData.selectItem
      if (!item) return
      // ajaxPromiseAll<[DataConfigEntity[], CategoryNodeEntity[]]>([,
      //   callSpc(callFnName.getCategoryNodes)])
      callBrige(callFnName.GetDataConfigs).then((list: DataConfigEntity[]) => {
        console.log("🚀 ~ file: ConfigRight.tsx:44 ~ callSpc ~ list:", list)
        let res = {} as DataConfigEntity | undefined
        if (isCategoryDataEntity(item!)) {
          let cid = item.CategoryNodeId
          res = list.find(e => e.CategoryNodeId == cid)
          res && (formCfg.form = { ...res })
        } else {
          res = list.find(e => e.CategoryNodeId == item!.GId)
          res && (formCfg.form = { ...res })
        }
        console.log("🚀 ~ file: ConfigRight.tsx:63 ~ callSpc ~ res:", res)
        if (!res) //没找到dataConfg,form就设为默认值
          return callBrige(callFnName.GetCategoryNodes)
        else
          return new Promise((resolve) => {
            resolve(false)
          })
      }).then((nodeList: CategoryNodeEntity[] | false) => {
        if (nodeList === false) return
        let node = {} as CategoryNodeEntity | undefined | null
        if (isCategoryDataEntity(item!)) {
          let cid = item.CategoryNodeId
          node = nodeList.find(e => e.GId == cid)
        } else {
          node = item
        }
        formCfg.form = { ...defaultDataConfigForm } as DataConfigEntity
        if (node) {
          formCfg.form.Name = node.NodeName   //自动把节点的名字同步到config上
        }
      })
    }
    // getForm()
    // watch(() => innerData.selectItem, (val) => {
    //   myFormRef.value?.resetValid()
    //   getForm(val)
    // })
    // callSpc(callFnName.deleteDataConfig,{GId:`66e110e4-348c-4143-bb48-678ee5fb2df4`})
    return () => {
      return (
        <div class={'w-full h-full relative pr-3 bg-white'}>
          <MyFormWrap ref={myFormRef} {...formCfg} form={formCfg.form} ></MyFormWrap>
        </div>
      )
    }
  }

})