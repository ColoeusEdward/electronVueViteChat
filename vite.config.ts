/*
 * @Author:  
 * @Description:
 * @Date: 2022-12-27 10:33:58
 * @LastEditTime: 2023-01-04 14:13:57
 * @LastEditors:  
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver, NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import * as path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    }
  },
  plugins: [vue(),
  vueJsx(),
  Components({
    resolvers: [NaiveUiResolver()]
  })
  ],
  publicDir: 'public',
  build: {
    outDir: 'output/dist',
  },
  server: {
    strictPort: true, // * 固定端口(如果端口被占用则中止)
    host: true, // 0.0.0.0
    port: 3920 // 指定启动端口
  },
});

