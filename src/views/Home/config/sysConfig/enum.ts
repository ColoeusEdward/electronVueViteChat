
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