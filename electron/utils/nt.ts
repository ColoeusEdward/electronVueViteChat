// *
//  * @Author:  
//  * @Description: 
//  * @Date: 2022-12-28 14:30:15
//  * @LastEditTime: 2023-01-04 10:36:42
//  * @LastEditors:  
//  */
import { BrowserWindow, ipcMain, screen, app, webFrame } from "electron";
import { Rectangle } from "electron/main";
// var edge = require('electron-edge-js');
import edge from 'electron-edge-js'
import * as path from 'path';
import fs from 'fs'
/**
* @description 进程通讯 渲染进程点击顶部关闭,最小化...按钮时,传递 {val}参数,
* 主进程通过 BrowserWindow.fromWebContents(event.sender)拿到活动窗口的BrowserWindow实例,再通过minimize()等实例方法操作窗口
* @param {Electron.WebContents} event.sender
* @param val {'mini'|'big'|'close'}
* @example
* window.ipc.send('navBar', val) // 渲染进程中
* */

const invoke = edge.func({
  assemblyFile: 'resource/dll/electronedge.dll',
  typeName: 'electronedge.Class1',
  methodName: 'Invoke'
})
const invoke1 = edge.func({
  assemblyFile: 'resource/dll/dlltest.dll',
  typeName: 'dlltest.test',
  methodName: 'Invoke'
})
// const serialObj = edge.func({
//   assemblyFile:path.resolve('resource/dll/Newtonsoft.Json.dll'),
//   typeName: 'Newtonsoft.Json.JsonConvert',
//   methodName: 'SerializeObject'
// })
let lastKeyBoardProcess: any = null
const rootPath = app.getAppPath() + '/../..'
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
  ipcMain.handle('test1', (event, val) => {
    return new Promise((resolve, reject) => {
      invoke1('这是自定义字符串', function (err, val) {
        if (err) {
          reject(err)
          throw err
        }

        resolve('dll返回的内容为： ' + val)

      })
    })
  })

  ipcMain.handle('keyboard', (event, val) => {
    if (lastKeyBoardProcess) {
      console.log("🚀 ~ file: nt.ts:71 ~ ipcMain.handle ~ lastKeyBoardProcess.pid:", lastKeyBoardProcess.pid)
      process.kill(lastKeyBoardProcess.pid)
    }
    const exec = require('child_process').spawn
    // exec('osk.exe')
    let exPath = path.resolve('resource/Numpad_1.7.1/Numpad_1.7.1.exe')
    lastKeyBoardProcess = exec(exPath)
  })

  ipcMain.handle('getRootPath', (event, val) => {
    let paths = app.getAppPath()
    const definitelyPosix = paths.split(path.sep).join(path.posix.sep);
    console.log("🚀 ~ 获取根目录中 file: nt.ts:84 ~ ipcMain.handle ~ paths:", definitelyPosix)
    return definitelyPosix
  })

  ipcMain.handle('closeWin', (event, val) => {
    console.log("🚀 ~ file: nt.ts:86 ~ ipcMain.handle ~")
    const window = BrowserWindow.getFocusedWindow()
    console.log("🚀 ~ file: nt.ts:86 ~ ipcMain.handle ~ window:", window)

    window?.close()
  })

  ipcMain.handle('savePreviewPic', (event, val) => {
    // const window: Electron.BrowserWindow | null = BrowserWindow.fromWebContents(event.sender)
    const bufferData = Buffer.from(val.blob);
    const filePath = rootPath + `/resource/pic/project/${val.name}`
    if (val.oldName) {
      const oldFilePath = rootPath + `/resource/pic/project/${val.oldName}`
      fs.rm(oldFilePath, (err) => {
        if (err) {
          console.error('Error saving PNG file:', err);
        }
      })
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, bufferData, (err) => {
        if (err) {
          console.error('Error saving PNG file:', err);
          resolve(false)
        } else {
          console.log('PNG file saved successfully!');
          // window?.webContents.session.clearCache()
          resolve(true)
        }
      })
    })

  })

  ipcMain.handle('savePic', (event, val) => {
    // const window: Electron.BrowserWindow | null = BrowserWindow.fromWebContents(event.sender)
    const bufferData = Buffer.from(val.blob);
    const savePath = val.path || '/resource/pic/project'
    const filePath = rootPath + `${savePath}/${val.name}`
    if (val.oldName) {
      const oldFilePath = rootPath + `${savePath}/${val.oldName}`
      fs.rm(oldFilePath, (err) => {
        if (err) {
          console.error('Error saving PNG file:', err);
        }
      })
    }
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, bufferData, (err) => {
        if (err) {
          console.error('Error saving PNG file:', err);
          resolve(false)
        } else {
          console.log('PNG file saved successfully!');
          // window?.webContents.session.clearCache()
          resolve(true)
        }
      })
    })

  })

  ipcMain.handle('delPic', (event, val) => {
    const savePath = val.path || '/resource/pic/project'
    let filePath = rootPath + `${savePath}/${val.name}`
    if (val.fullPath) {
      filePath = val.fullPath.replace('mygo:///', '')
      // console.log("🚀 ~ file: nt.ts:156 ~ ipcMain.handle ~ filePath:", filePath)
    }
    return new Promise((resolve, reject) => {
      fs.rm(filePath, (err) => {
        if (err) {
          console.error('Error delete PNG file:', err);
          resolve(false)
        }
        resolve(true)
      })
    })
  })

  ipcMain.handle('readCustomPicList', (event, val) => {
    const savePath = '/resource/pic/custom'
    let filePath = 'mygo:///' + rootPath + `${savePath}`

    return new Promise((resolve, reject) => {
      fs.readdir(filePath, (err, files) => {
        if (err) {
          console.error('Error delete PNG file:', err);
          resolve(false)
        }
        resolve(files)
      })
    })
  })

  ipcMain.handle('fakeData', (event, val) => {
    let num = Math.random()*1000

    return new Promise((resolve, reject) => {
      resolve(num)
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





