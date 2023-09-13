"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author:
 * @Description: electron主进程
 * @Date: 2022-12-27 11:44:25
 * @LastEditTime: 2023-01-13 15:58:29
 * @LastEditors:
 */
process.env.EDGE_USE_CORECLR = '1'; //想要调用net core dll必须加上这一行
const electron_1 = require("electron");
// 创建窗口方法
const createWindow_1 = require("./utils/createWindow");
const navbar_1 = require("./utils/navbar");
const calendar_1 = require("./utils/calendar");
// 是否开启调试工具
const devTools_1 = require("./utils/devTools");
const nt_1 = require("./utils/nt");
const proto_1 = require("./utils/proto");
const shortcut_1 = require("./utils/shortcut");
// const remote = require('electron').remote;
electron_1.app.on("ready", () => {
    (0, proto_1.createProto)();
    (0, createWindow_1.createWindow)(); // 创建窗口
    (0, shortcut_1.createShortcut)();
    // 设置菜单栏
    electron_1.Menu.setApplicationMenu(null);
    (0, navbar_1.onNavbar)();
    (0, calendar_1.onCalendar)();
    (0, nt_1.onNT)();
    // 是否开启调试工具
    (0, devTools_1.onDevTools)();
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他打开的窗口，那么程序会重新创建一个窗口。
    electron_1.app.on("activate", () => electron_1.BrowserWindow.getAllWindows().length === 0 && (0, createWindow_1.createWindow)());
});
// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 macOS窗口全部关闭时,dock中程序不会退出
electron_1.app.on("window-all-closed", () => {
    process.platform !== "darwin" && electron_1.app.quit();
});
