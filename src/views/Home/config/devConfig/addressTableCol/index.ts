import { mapKeyAndTitle } from "@/utils/utils";
import { propNameEnum } from "../enum";

 const defaultCol = [
  { ...mapKeyAndTitle(propNameEnum.DataName), resizable: true },
  { ...mapKeyAndTitle(propNameEnum.SlaveId), resizable: true },
  { ...mapKeyAndTitle(propNameEnum.Area), resizable: true },
  { ...mapKeyAndTitle(propNameEnum.Index), resizable: true },
  { ...mapKeyAndTitle(propNameEnum.Length), resizable: true },
  { ...mapKeyAndTitle(propNameEnum.DataType), resizable: true },
  { ...mapKeyAndTitle(propNameEnum.CountFormula), resizable: true },
]

 const fftCol = [
  { ...mapKeyAndTitle(propNameEnum.DataName), resizable: true },
  { ...mapKeyAndTitle(propNameEnum.Frequency), resizable: true },
  { ...mapKeyAndTitle(propNameEnum.DataType), resizable: true },

]

export const addressTableColMap:Record<string, typeof defaultCol> = {
  defaultCol,
  fftCol
}