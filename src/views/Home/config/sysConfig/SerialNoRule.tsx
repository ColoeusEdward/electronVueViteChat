import { MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import MyNTable from "@/components/MyNTable";
import { callSpc } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { ajaxPromiseAll, sleep } from "@/utils/utils";
import { NButton, NPopconfirm, useMessage } from "naive-ui";
import { defineComponent, onMounted, reactive, Transition, watch } from "vue";
import { useMyI18n } from "@/hooks/useMyI18n";
import { SerialNoEntity } from "~/me";
import { FieldTypeList, originFieldTypeList } from "./enum";
import { useSysCfgInnerDataStore } from "./innderData";
import SerialRuleForm from "./SerialRuleForm";

export default defineComponent({
  name: 'SerialNoRule',  //编码规则
  setup(props, ctx) {
    const { t, i18nStore } = useMyI18n()
    const innerData = useSysCfgInnerDataStore()
    const msg = useMessage()
    const commonData = reactive({
      moveLoading: false,
    })
    const tableCfg = reactive({
      columns: [
        {
          type: 'selection',
          multiple: false,
        },
        { key: 'SortNum', title: t('config.sortPosition'), resizable: true },
        {
          key: 'FieldType', title: t('config.fieldType'), resizable: true, render: (row: SerialNoEntity) => {
            return originFieldTypeList[row.FieldType]
          }
        },
        { key: 'Format', title: t('config.format'), resizable: true },
      ],
      data: [] as SerialNoEntity[],
      rowProps: (row: SerialNoEntity) => {
        return {
          onClick: () => rowClick(row)
        }
      },
      rowKey: (row: SerialNoEntity) => row.GId
    })

    // 语言切换时更新 tableCfg 中的标题
    watch(() => i18nStore.langChangeCount, () => {
      sleep(100).then(() => {
        tableCfg.columns[1].title = t('config.sortPosition')
        tableCfg.columns[2].title = t('config.fieldType')
        tableCfg.columns[3].title = t('config.format')
      })

    })

    const rowClick = (row: SerialNoEntity) => {
      innerData.setCurRowKey([row.GId!])
      innerData.setCurRow(row)
    }
    const restoreSelection = (gid: string) => {
      const restored = tableCfg.data.find(row => row.GId === gid)
      if (restored) {
        innerData.setCurRowKey([restored.GId!])
        innerData.setCurRow(restored)
      }
    }
    const moveUp = () => {
      if (!innerData.curRow) {
        msg.warning(t('config.pleaseSelectOneRow'))
        return
      }
      const savedGId = innerData.curRow.GId
      let idx = tableCfg.data.findIndex(row => row.GId === savedGId)
      if (idx > 0) {
        commonData.moveLoading = true
        const temp = tableCfg.data[idx - 1].SortNum
        tableCfg.data[idx - 1].SortNum = tableCfg.data[idx].SortNum
        tableCfg.data[idx].SortNum = temp
        ajaxPromiseAll([callBrige(callFnName.SaveSerialNo, tableCfg.data[idx - 1]), callBrige(callFnName.SaveSerialNo, tableCfg.data[idx])])
          .then(() => getTbData())
          .then(() => restoreSelection(savedGId!))
          .finally(() => {
            commonData.moveLoading = false
          })
      }
    }
    const moveDown = () => {
      if (!innerData.curRow) {
        msg.warning(t('config.pleaseSelectOneRow'))
        return
      }
      const savedGId = innerData.curRow.GId
      let idx = tableCfg.data.findIndex(row => row.GId === savedGId)
      if (idx < tableCfg.data.length - 1) {
        commonData.moveLoading = true
        const temp = tableCfg.data[idx + 1].SortNum
        tableCfg.data[idx + 1].SortNum = tableCfg.data[idx].SortNum
        tableCfg.data[idx].SortNum = temp
        ajaxPromiseAll([callBrige(callFnName.SaveSerialNo, tableCfg.data[idx + 1]), callBrige(callFnName.SaveSerialNo, tableCfg.data[idx])])
          .then(() => getTbData())
          .then(() => restoreSelection(savedGId!))
          .finally(() => {
            commonData.moveLoading = false
          })
      }
    }
    const getTbData = () => {
      innerData.cleanRow()
      return callBrige(callFnName.GetSerialNos).then((res: SerialNoEntity[]) => {
        tableCfg.data = res.sort((a, b) => {
          return a.SortNum - b.SortNum
        })
        innerData.setTalbeLength(res.length)
      })
    }
    getTbData()
    innerData.setGetTbDataFn(getTbData)
    const delItem = () => {
      if (!innerData.curRow) {
        msg.warning(t('config.pleaseSelectOneRow'))
        return
      }
      callBrige(callFnName.DeleteSerialNo, innerData.curRow).then(() => {
        getTbData()
      })
    }
    const addItem = () => {
      innerData.setAddFormShow(true)
    }
    onMounted(() => {
      innerData.setAddFormShow(false)
    })

    return () => {
      return (
        <div class={'w-full flex min-h-[300px] bg-white rounded-lg p-3'}>
          <div class={"flex-1 min-w-0"}>
            <MyNTable v-model:checked-row-keys={innerData.curRowKey}  {...tableCfg} />
          </div>
          <div class={"flex pl-3 gap-2"}>
            <div class={'flex flex-col gap-2 flex-shrink-0'} style={{ width: '80px' }}>
              <NButton size='large' block onClick={addItem}>{t('config.add')}</NButton>
              <NPopconfirm onPositiveClick={delItem} placement={'top'} v-slots={{
                trigger: () => <NButton size='large' block type={'error'}>{t('config.delete')}</NButton>
              }}>
                {t('config.confirmDeleteRule')}
              </NPopconfirm>
              <NButton size='large' block disabled={commonData.moveLoading} onClick={moveUp}>{t('config.moveUp')}</NButton>
              <NButton size='large' block disabled={commonData.moveLoading} onClick={moveDown}>{t('config.moveDown')}</NButton>
            </div>
            <Transition name={'full-pop'}>
              <SerialRuleForm v-show={innerData.addFormShow} />
            </Transition>
          </div>
        </div>
      )
    }
  }

})