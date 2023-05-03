import { ref } from "vue";


export const useDb = () => {
  const request = window.indexedDB.open('nt', 0.1);
  var db = ref<any>(null)
  request.onupgradeneeded = function (event) {
    //@ts-ignore
    db.value = event.target?.result;
    var objectStore;
    if (!db.objectStoreNames.contains('dataMap')) {
      objectStore = db.createObjectStore('dataMap', { keyPath: 'id' });
      objectStore.createIndex('ProtoType', 'ProtoType', { unique: false });
    }
  }
  return { request, db }
}