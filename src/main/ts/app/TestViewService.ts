namespace app {

  declare type AsyncFunc<P,R> = spa.service.AsyncFunc<P,R>;

  // at first, declare an interface.
  export interface TestViewService {
    add : AsyncFunc<{ a : number, b : number }, number>;
    subtract : AsyncFunc<{ a : number, b : number }, number>;
  }

  // then, implement it.
  var service : TestViewService = {

    add : (params, rh) => {
      console.log('hello, here is server.');
      rh(params.a + params.b); },

    subtract : (params, rh) => rh(params.a - params.b)

  };

  spa.service.defineService({ service : service });
}
