namespace app {

  export interface TestViewService extends spa.service.ViewService {
    add : spa.service.AsyncFunc<{ a : number, b : number }, number>;
    subtract : spa.service.AsyncFunc<{ a : number, b : number }, number>;
  }

  spa.service.defineService(<TestViewService>{

    add : (params, rh) => {
      console.log('here is server');
      rh(params.a + params.b); },

    subtract : (params, rh) => rh(params.a - params.b)

  }, '/app/TestViewService');
}
