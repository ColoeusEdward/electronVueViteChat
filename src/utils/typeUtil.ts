import { CategoryDataEntity, CategoryNodeEntity } from "~/me"

export const isCategoryNodeEntity = (obj: CategoryNodeEntity | CategoryDataEntity): obj is CategoryNodeEntity => {
  return (obj as CategoryNodeEntity).NodeName != undefined
}
export const isCategoryDataEntity = (obj: CategoryNodeEntity | CategoryDataEntity): obj is CategoryDataEntity => {
  return (obj as CategoryDataEntity).DataName != undefined
}