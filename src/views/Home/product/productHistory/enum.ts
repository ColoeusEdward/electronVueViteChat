import i18n from "@/i18n";

const t = i18n.global.t

export const getLogTypeMap = (): Record<string, string> => ({
  Alarm: t('config.alarm'),
  Operate: t('config.operation'),
})
export const LogTypeMap: Record<string, string> = getLogTypeMap()

export const getLogOption = () => ({
  Start: t('config.startCollect'),
  Stop: t('config.stopCollect'),
  Clear: t('menu.cleanData'),
  Shaft: t('menu.switchShaft'),
  USL: t('config.exceedUpper'),
  LSL: t('config.exceedLower'),
})
export const LogOption = getLogOption()

// 刷新所有国际化文本的函数
export const refreshProductHistoryEnums = () => {
  // 刷新 LogTypeMap
  const newLogTypeMap = getLogTypeMap()
  Object.keys(newLogTypeMap).forEach(key => {
    LogTypeMap[key] = newLogTypeMap[key]
  })

  // 刷新 LogOption
  const newLogOption = getLogOption()
  Object.keys(newLogOption).forEach(key => {
    LogOption[key as keyof typeof LogOption] = newLogOption[key as keyof typeof LogOption]
  })
}

