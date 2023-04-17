// declare a service
import { svc } from 'vue-hook-svc';

type globalState = {
  
}

class SomeService {  //全局共享数据
  state:globalState = {
    
  }

}

// create a global service
// export const globalSomeSvc = svc.createSingleton(SomeService);
// create a service func depends on the component's lifecycle
// const useMyProductSvc = svc.createUseService(SomeService);
//  const useMyProductSvc = 
export let GlobalSvcIns = svc.createSingleton(SomeService);