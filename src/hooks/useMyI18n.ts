import { usei18nStore } from "@/store/i18n"
import { useI18n } from "vue-i18n"

export const useMyI18n = () => {
  const { t } = useI18n()
  const i18nStore = usei18nStore()
  return { t, i18nStore }
}