import { SerialNoEntity } from "~/me"

export const formDivideStyle = {fontSize: '20px',}
let sixList = new Array(7).fill(0).map((e,i)=>{
  return {
    label: i,
    value: i,
  }
})
export const optionMap:Record<string, any> = {
  Precision:sixList,
  MaxChartNum:sixList.slice(1),
  ExportRealType:['Excel2007'].map(e=>{
    return {
      label: e,
      value: e
    }
  }),
  ExportStatiType:['PDF'].map(e=>{
    return {
      label: e,
      value: e
    }
  }),
  ReportPrinter:[]
}

export const serialNoFormDefault:SerialNoEntity = {
  SortNum: 1,
  FieldType:0,
  Format:'',
}

export const originFieldTypeList = [`固定字符`,`日期`,`班别`,`流水号`]
export const FieldTypeList = originFieldTypeList.map((e,i)=>{
  return {
    label: e,
    value: i
  }
})