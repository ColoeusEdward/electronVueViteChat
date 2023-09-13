/*
 * @Author:  
 * @Description: 快捷键 
 * @Date: 2022-12-29 10:01:20
 * @LastEditTime: 2022-12-29 10:06:40
 * @LastEditors:  
 */
import { BrowserWindow, globalShortcut, ipcMain, Menu } from 'electron'


export function createShortcut() {
  // ipcMain.handle('radioPlay', (event, arg) => {
  //   return new Promise((resolve, reject) => {
  //     resolve('play')
  //   })
  // })
  globalShortcut.register('Alt+F12', () => {

    const window: Electron.BrowserWindow | null = BrowserWindow.getFocusedWindow()
    window?.webContents.openDevTools();
  })

  globalShortcut.register('Alt+F5', () => {

    const window: Electron.BrowserWindow | null = BrowserWindow.getFocusedWindow()
    window?.webContents.reload();
  })
}