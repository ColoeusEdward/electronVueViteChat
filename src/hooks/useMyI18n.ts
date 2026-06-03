import { usei18nStore } from "@/store/i18n"
import { useI18n } from "vue-i18n"
import { setLanguage, currentLocale, SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n"

export const useMyI18n = () => {
  const { t, locale } = useI18n()
  const i18nStore = usei18nStore()

  // 切换语言
  const changeLanguage = async (lang: SupportedLocale) => {
    await setLanguage(lang)
  }

  // 获取当前语言
  const getCurrentLocale = () => currentLocale.value

  // 获取支持的语言列表
  const getSupportedLocales = () => SUPPORTED_LOCALES

  return {
    t,
    locale,
    i18nStore,
    changeLanguage,
    getCurrentLocale,
    getSupportedLocales,
    currentLocale,
  }
}
