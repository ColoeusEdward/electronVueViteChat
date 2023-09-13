import { useMain } from "@/store";
import { computed, onMounted, reactive } from "vue";


// * code 展示
export const useDbEdit = (key: string, onlyRead?: boolean) => {
  
  var transaction: any = null
  const dbObj = reactive({
    dbObjectStore: <any>null,
    dbOverPromise: <Promise<any> | null>null
  })
  const dbStore = useMain()
  return dbStore.getDbPromise.then(() => {
    transaction = dbStore.db.transaction([key], onlyRead ? "readonly" : "readwrite");
    dbObj.dbObjectStore = transaction.objectStore(key);
    dbObj.dbOverPromise = new Promise<any>((resolve, reject) => {
      transaction.oncomplete = function (event: any) {
        resolve(event)
      };
    })
    return new Promise<typeof dbObj>((resolve, reject) => {
      resolve(dbObj)
    })
  })

}
