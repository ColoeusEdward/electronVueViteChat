// declare a service
//@ts-ignore
import { svc } from 'vue-hook-svc/dist/vue-hook-svc.mjs';
import { menuOption } from '~/me';

type state = {
  
}

class SomeService extends svc.ServiceBase {  //局部共享数据
  state = {
    curMenuItem:'',
  }

  setCurMenuItem(val:string){
    this.state.curMenuItem = val;
  }
  setInfoList(val:menuOption[]){
    // this.state.infoList = val;
  }
}

// create a global service
// export const globalSomeSvc = svc.createSingleton(SomeService);
// create a service func depends on the component's lifecycle
const useSvc = svc.createUseService(SomeService);
export {useSvc};
//  const useMyProductSvc = 
// export let GlobalSvcIns = svc.createSingleton(SomeService);