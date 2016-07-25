namespace app {

  declare type AsyncFunc<P,R> = spa.service.AsyncFunc<P,R>;

   // at first, declare an interface.
  export interface TestViewService extends spa.service.ViewService {
    add : AsyncFunc<{ a : number, b : number }, number>;
    subtract : AsyncFunc<{ a : number, b : number }, number>;
  }

  // then, implement it.
  spa.service.defineService(<TestViewService>{

    add : (params, rh) => {
      console.log('hello, here is server.');
      rh(params.a + params.b); },

    subtract : (params, rh) => rh(params.a - params.b)

  });
}
