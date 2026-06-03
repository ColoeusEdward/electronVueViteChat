// src/store/app.ts
import { defineStore } from 'pinia'
import i18n, { getLanguage, setLanguage as setI18nLanguage } from '@/i18n/index'
import { MyLangStr } from '~/me'

export const usei18nStore = defineStore('i18n', {
  state: () => ({
    language: getLanguage() || 'zh-CN',
    langChangeCount: 0
  }),
  actions: {
    async setLanguage(lang: MyLangStr) {
      if (lang != this.language) {
        // console.log("🪵 [i18n.ts:14] ~ token ~ \x1b[0;32mthis.langChangeCount\x1b[0m = ", this.langChangeCount);
        this.langChangeCount++
      }
      this.language = lang

      // 使用新的动态加载方式设置语言
      await setI18nLanguage(lang)

      // 可选：如果是后台管理系统，可以在这里同步修改 HTML 标签的 lang 属性
      document.documentElement.lang = lang
    }
  }
})
