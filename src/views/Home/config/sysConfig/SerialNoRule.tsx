import { MyFormWrap } from "@/components/MyFormWrap/MyFormWrap";
import MyNTable from "@/components/MyNTable";
import { callSpc } from "@/utils/call";
import { callBrige } from "@/utils/callm";
import { callFnName } from "@/utils/enum";
import { ajaxPromiseAll, sleep } from "@/utils/utils";
import { NButton, NPopconfirm, NSpace, useMessage } from "naive-ui";
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
      sleep(50).then(() => {
        tableCfg.columns[1].title = t('config.sortPosition')
        tableCfg.columns[2].title = t('config.fieldType')
        tableCfg.columns[3].title = t('config.format')
      })

    })

    const rowClick = (row: SerialNoEntity) => {
      innerData.setCurRowKey([row.GId!])
      innerData.setCurRow(row)
    }
    const moveUp = () => {
      if (!innerData.curRow) {
        msg.warning(t('config.pleaseSelectOneRow'))
        return
      }
      let idx = tableCfg.data.findIndex(row => row.GId === innerData.curRow?.GId)
      if (idx > 0) {
        commonData.moveLoading = true
        tableCfg.data[idx - 1].SortNum++;
        tableCfg.data[idx].SortNum--;
        ajaxPromiseAll([callBrige(callFnName.SaveSerialNo, tableCfg.data[idx - 1]), callBrige(callFnName.SaveSerialNo, tableCfg.data[idx])])
          .then(() => {
            return getTbData()
          }).finally(() => {
            commonData.moveLoading = false
          })
      }
    }
    const moveDown = () => {
      if (!innerData.curRow) {
        msg.warning(t('config.pleaseSelectOneRow'))
        return
      }
      let idx = tableCfg.data.findIndex(row => row.GId === innerData.curRow?.GId)
      if (idx < tableCfg.data.length - 1) {
        commonData.moveLoading = true

        tableCfg.data[idx + 1].SortNum--;
        tableCfg.data[idx].SortNum++;
        ajaxPromiseAll([callBrige(callFnName.SaveSerialNo, tableCfg.data[idx + 1]), callBrige(callFnName.SaveSerialNo, tableCfg.data[idx])])
          .then(() => {
            return getTbData()
          }).finally(() => {
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
        <div class={'w-full h-full flex min-h-[380px]'}>
          <div class={"w-3/5 h-full"}>
            <MyNTable v-model:checked-row-keys={innerData.curRowKey}  {...tableCfg} />
          </div>
          <div class={"w-2/5 h-full flex pl-2"}>
            <div class={'border border-solid border-gray-200 rounded-md h-full p-2 flex-shrink-0'}>
              <NSpace>
                <NButton size='large' onClick={addItem} >{t('config.add')}</NButton>
                <NPopconfirm onPositiveClick={delItem} placement={'top'} v-slots={{
                  trigger: () => <NButton size='large' type={'error'} >{t('config.delete')}</NButton>
                }}>
                  {t('config.confirmDeleteRule')}
                </NPopconfirm>
              </NSpace>
              <NSpace class={'mt-2'}>
                <NButton size='large' disabled={commonData.moveLoading} onClick={moveUp}>{t('config.moveUp')}</NButton>
                <NButton size='large' disabled={commonData.moveLoading} onClick={moveDown} >{t('config.moveDown')}</NButton>
              </NSpace>
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