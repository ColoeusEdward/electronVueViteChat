/*
 * @Author:  
 * @Description:
 * @Date: 2022-12-27 10:33:58
 * @LastEditTime: 2023-01-13 17:43:43
 * @LastEditors:  
 */
import { createApp } from 'vue'
import './style.scss'

import App from './App.vue'
import  router  from "./router/index";
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import drag from "v-drag"
let app = createApp(App)
const pinia = createPinia()
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//     app.component(key, component)
// }

app
// .use(router)
.use(pinia)
.use(drag)
// .use(ElementPlus, {
//     locale: zhCn,
//   })
  .mount('#app')
