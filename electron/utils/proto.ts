/*
 * @Author:  
 * @Description: 
 * @Date: 2022-12-29 10:01:20
 * @LastEditTime: 2022-12-29 10:06:40
 * @LastEditors:  
 */
import { Menu, protocol } from 'electron'


export function createProto() {
  // 注册自定义协议，例如 'myapp'
  protocol.registerFileProtocol('mygo', (request, callback) => {
    const url = request.url.slice(7); // 去掉协议头 'myapp://'
    const decodedUrl = decodeURIComponent(url); // 解码 URL
    try {
      // 返回图片的本地路径
      return callback(decodedUrl);
    } catch (error) {
      console.error('Failed to register protocol', error);
    }
  });
}