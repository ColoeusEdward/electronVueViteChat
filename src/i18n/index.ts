import { createI18n } from 'vue-i18n'
import { ref } from 'vue'

// 支持的语言列表
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US', 'vi-VN', 'es-ES'] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

// 当前语言
export const currentLocale = ref<SupportedLocale>('zh-CN')

// 获取浏览器默认语言或用户历史选择
export const getLanguage = (): SupportedLocale => {
  const chooseLanguage = localStorage.getItem('language')
  if (chooseLanguage && SUPPORTED_LOCALES.includes(chooseLanguage as SupportedLocale)) {
    return chooseLanguage as SupportedLocale
  }

  // 如果没有缓存，获取浏览器语言
  const language = navigator.language.toLowerCase()
  if (language.includes('zh')) return 'zh-CN'

  return 'zh-CN' // 默认语言
}

// 使用 import.meta.env.BASE_URL 拼接 locales 绝对路径
// 解决 file:// 协议 + WebView2 base address 导致相对路径解析异常的问题
// dev: BASE_URL=/, locales 在 public/ 下被 Vite 映射为根路径
// 构建: BASE_URL=./, locales/ 与 index.html 同级
// const localesBase = `${import.meta.env.BASE_URL}locales/`
const localesBase = `/locales/`
console.log("🪵 [index.ts:29] ~ token ~ \x1b[0;32mlocalesBase\x1b[0m = ", import.meta.env.BASE_URL);

// 动态加载语言包
const loadLocaleMessages = async (locale: SupportedLocale): Promise<any> => {
  try {
    const response = await fetch(`${localesBase}${locale}.json`)
    if (!response.ok) {
      throw new Error(`Failed to load locale: ${locale}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Failed to load locale ${locale}:`, error)
    // 回退到默认语言
    if (locale !== 'zh-CN') {
      return loadLocaleMessages('zh-CN')
    }
    return {}
  }
}

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: getLanguage(),
  fallbackLocale: 'zh-CN',
  messages: {}, // 初始为空，稍后加载
})

// 初始化加载默认语言
const initI18n = async () => {
  const locale = getLanguage()
  const messages = await loadLocaleMessages(locale)
  i18n.global.setLocaleMessage(locale, messages)
  currentLocale.value = locale
}

// 切换语言
export const setLanguage = async (locale: SupportedLocale) => {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`)
    return
  }

  // 如果还没加载过该语言，先加载
  const messages = await loadLocaleMessages(locale)
  i18n.global.setLocaleMessage(locale, messages)

  // 设置当前语言
  i18n.global.locale.value = locale
  currentLocale.value = locale

  // 保存到本地存储
  localStorage.setItem('language', locale)
}

// 初始化
initI18n()

export const initApp = async () => {
  await initI18n()
  return i18n
}

export default i18n
