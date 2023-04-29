<!--
 * @Author:  
 * @Description:
 * @Date: 2022-12-27 10:33:58
 * @LastEditTime: 2023-04-17 19:38:42
 * @LastEditors: your name
-->

<template>
  <NConfigProvider :locale="zhCN" :theme-overrides="themeOverride" >
    <div
    class="h-[100vh] flex flex-col bg-ele-white overflow-hidden">
    
    <!-- 侧边栏总组件 -->
    <!-- <navSider v-if="mainHeaderShow" /> -->

    <Home />
    <!-- 窗口基础功能 ：关闭 最小化，最大化 -->
    <!-- <div class="w-100px self-end flex justify-around items-center my-5px border-r">
      <el-icon
        size="18px"
        @click="navBar('close')">
        <Close />
      </el-icon>
      <el-icon
        size="18px"
        @click="navBar('big')">
        <FullScreen />
        </el-icon>
        <el-icon
          size="18px"
          @click="navBar('mini')"
          class="">
          <Minus />
        </el-icon>
      </div> -->

    </div>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount, onBeforeUnmount } from 'vue';
import mainHeader from './header/mainHeader.vue';
import navSider from './navSider/navSider.vue';
import bus from './utils/bus';
import { NConfigProvider,zhCN } from 'naive-ui'
import Home from './views/Home/index';
import {themeOverride} from '@/utils/theme';

const mainHeaderShow = ref(true);

onBeforeMount(() => {
  bus.on('mainHeaderShow', settingMain);
});
onBeforeUnmount(() => {
  bus.off('mainHeaderShow', settingMain);
});
// 窗口事件
const navBar = (val: string) => {
  console.log(window.ipc, 'window.ipc');

  window.ipc.send('navBar', val);
};
const settingMain = (msg: any) => {
  console.log(msg, 'msg');

  mainHeaderShow.value = msg;
};
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
