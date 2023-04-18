/*
 * @Author:  
 * @Description:
 * @Date: 2023-01-13 17:44:59
 * @LastEditTime: 2023-01-29 15:34:32
 * @LastEditors:  
 */
import { DropdownProps } from "naive-ui";
import { defineStore } from "pinia" // 定义容器

export const useMain = defineStore('useStore', {
    /**
     * 存储全局状态
     * 1.必须是箭头函数: 为了在服务器端渲染的时候避免交叉请求导致数据状态污染
     * 和 TS 类型推导
    */
    state: () => {
        return {
            dataSource: { label: '直径1', key: 'diameter', },
            timeZone: { label: '30min', key: 30, },
            isTorBar: true,                                     //公差条是否选中
            displayChart: { label: '数字显示/趋势图', key: 'dataChart' },         //显示的图表类型
            displayWay: { label: '平均值', key: 'avg' },                //显示的方式  
        }
    },
    /**
     * 用来封装计算属性 有缓存功能  类似于computed
     */
    getters: {

    },
    /**
     * 编辑业务逻辑  类似于methods
     */
    actions: {
        setDataSource(value:any) {
            this.dataSource = value;
        },
        setTimeZone(value: any) {
            this.timeZone = value;
        },
        setDisplayChart(value: any) {
            this.displayChart = value;
        },
        setDisplayWay(value: any) {
            this.displayWay = value;
        },
        changeIsTorBar() {
            this.isTorBar = !this.isTorBar;
        }

    }

})
