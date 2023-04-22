// *
//  * @Author:  
//  * @Description: 
//  * @Date: 2022-12-28 14:30:15
//  * @LastEditTime: 2023-01-04 10:36:42
//  * @LastEditors:  
//  */
import { BrowserWindow, ipcMain, screen, app } from "electron";
import { Rectangle } from "electron/main";
// var edge = require('electron-edge-js');
import edge from 'electron-edge-js'
import * as path from 'path';
/**
* @description 进程通讯 渲染进程点击顶部关闭,最小化...按钮时,传递 {val}参数,
* 主进程通过 BrowserWindow.fromWebContents(event.sender)拿到活动窗口的BrowserWindow实例,再通过minimize()等实例方法操作窗口
* @param {Electron.WebContents} event.sender
* @param val {'mini'|'big'|'close'}
* @example
* window.ipc.send('navBar', val) // 渲染进程中
* */

const invoke = edge.func({
  assemblyFile: path.resolve('resource/dll/electronedge.dll'),
  typeName: 'electronedge.Class1',
  methodName: 'Invoke'
})
// const serialObj = edge.func({
//   assemblyFile:path.resolve('resource/dll/Newtonsoft.Json.dll'),
//   typeName: 'Newtonsoft.Json.JsonConvert',
//   methodName: 'SerializeObject'
// })
export function onNT() {
  ipcMain.handle('test', (event, val) => {
    return new Promise((resolve, reject) => {
      invoke('这是自定义字符串', function (err, val) {
        if (err) {
          reject(err)
          throw err
        }
        resolve('dll返回的内容为：' + val)
        // this.$message({
        //   message: 'dll返回的内容为：' + val,
        //   type: 'success'
        // })
      })
    })
  })

  // ipcMain.handle('serialize', (event, val) => {
  //   return new Promise((resolve,reject) => {
  //     serialObj(val,function(err,val){
  //       if(err){
  //         reject(err)
  //         throw err
  //       }
  //       resolve(val)
  //     })
  //   })
  // })
}





