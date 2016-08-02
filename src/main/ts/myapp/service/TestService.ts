namespace myapp.service {

  type AsyncFunc<P,R> = spa.service.AsyncFunc<P,R>;

  type TestModel = myapp.model.TestModel;

  // at first, declare an interface.
  export interface TestService {
    init : AsyncFunc<{}, TestModel>;
    exec : AsyncFunc<{ model : TestModel }, TestModel>;
  }

  // then, implement it.
  var service : TestService = {

    init : function(params, resultHandler) {
      // initial model
      var model : TestModel = {
        a : '1',
        b : '2',
        ope : '',
        res : '?'
      };
      resultHandler(model);
    },

    exec : function(params, resultHandler) {

      var model = params.model;

      // do something on server...
      var a = +model.a;
      var b = +model.b;
      if (model.ope == '+') {
        model.res = '' + (a + b);
      } else if (model.ope == '-') {
        model.res = '' + (a - b);
      } else {
      }

      resultHandler(params.model);
    }
  };

  spa.service.defineService({
    __requires__ : [], // additional modules.
    service : service
  });
}
