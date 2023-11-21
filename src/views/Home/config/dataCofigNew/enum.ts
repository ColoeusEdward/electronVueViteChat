const categoryClassObj:Record<string,string> = {
  "Value": "数据值",
  "Std": "规格标准值",
  "Usl": "规格上限",
  "Lsl": "规格下限",
  "Utl": "规格上公差",
  "Ltl": "规格下公差",
  "Avg": "平均值",
  "Max": "最大值",
  "Min": "最小值",
  "Sd": "均方差",
  "Ca": "准确度",
  "Cp": "稳定度",
  "Cpk": "过程能力指数"
}
export const categoryClassList = Object.keys(categoryClassObj).map(e => {
  return {
    label: categoryClassObj[e],
    value: e
  }
})

export const limitRadioList = [{ label: "只读", value: 0 }, { label: "只写", value: 1 }, { label: "读写", value: 2 }]