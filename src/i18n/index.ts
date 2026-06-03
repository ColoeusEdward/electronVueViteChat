import { createI18n } from 'vue-i18n'

import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// 获取浏览器默认语言或用户历史选择
export const getLanguage = (): string => {
  const chooseLanguage = localStorage.getItem('language')
  if (chooseLanguage) return chooseLanguage

  // 如果没有缓存，获取浏览器语言
  const language = navigator.language.toLowerCase()
  if (language.includes('zh')) return 'zh-CN'

  return 'zh-CN' // 默认语言
}

// const locale =
//   localStorage.getItem('locale') ||
//   navigator.language ||
//   'zh-CN'

const i18n = createI18n({
  legacy: false,
  locale: getLanguage(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export default i18n