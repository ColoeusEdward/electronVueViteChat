/*
 * @Author: 
 * @Description: electron窗口创建
 * @Date: 2022-12-27 11:45:09
 * @LastEditTime: 2023-02-03 10:17:50
 * @LastEditors: 
 */
import { BrowserWindow } from 'electron';
import * as path from 'path';
/**
 * packages.json,script中通过cross-env NODE_ENV=production设置的环境变量
 * 'production'|'development'
 */
const NODE_ENV = process.env.NODE_ENV;
/** 创建窗口方法 */
function createWindow() {
  // 生成窗口实例
  const Window = new BrowserWindow({
    minWidth: 914,
    minHeight: 600,
    width: 1000, // * 指定启动app时的默认窗口尺寸
    height: 720, // * 指定启动app时的默认窗口尺寸
    frame: false, // * app边框(包括关闭,全屏,最小化按钮的导航栏) @false: 隐藏
    transparent: true, // * app 背景透明
    hasShadow: true, // * app 边框阴影
    show: false, // 启动窗口时隐藏,直到渲染进程加载完成「ready-to-show 监听事件」 再显示窗口,防止加载时闪烁
    resizable: false, // 禁止手动修改窗口尺寸
    icon: './output/dist/faviconiot.ico', // 图标
    webPreferences: {
      // webSecurity:false,
      // 加载脚本
      preload: path.join(__dirname, '..', 'preload.js'),
      nodeIntegration: true,
    },
  });
  Window.setFullScreen(true)
  Window.setResizable(false)
  // 加载调试工具
  NODE_ENV === 'development' && Window.webContents.openDevTools();

  // 由优雅写法
  // 启动窗口时隐藏,直到渲染进程加载完成「ready-to-show 监听事件」 再显示窗口,防止加载时闪烁
  Window.once('ready-to-show', () => {
    Window.show(); // 显示窗口
  });

  // * 主窗口加载外部链接
  // 开发环境,加载vite启动的vue项目地址
  if (NODE_ENV === 'development') Window.loadURL('http://localhost:3920/');
  // else Window.loadURL(path.join(__dirname, "./output/dist/index.html"));
  else Window.loadFile(`./output/dist/index.html`);
  // else Window.loadURL('http://localhost:3920/');

  setOpHandler(Window)

}

//实现新窗口打开自动最大化
const setOpHandler = (window: BrowserWindow) => {
  window.webContents.setWindowOpenHandler(({ url }) => {
    let freescreen = url.search('preview') == -1
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        frame: true,
        show: false,
        maximizable: true,
        fullscreenable: freescreen,
        fullscreen: freescreen,
        webPreferences: {
          // webSecurity:false,
          // 加载脚本
          preload: path.join(__dirname, '..', 'preload.js'),
          nodeIntegration: true,
        },
      }
    }
  })
  window.webContents.on('did-create-window', (win: BrowserWindow) => {
    win.once('ready-to-show', () => win.maximize())
    setOpHandler(win)
  }
  )
}
// 导出模块
export { createWindow };
