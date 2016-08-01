namespace app.service {

  declare type AsyncFunc<P,R> = spa.service.AsyncFunc<P,R>;

  declare type TestViewModel = app.model.TestViewModel;

  // at first, declare an interface.
  export interface TestViewService {
    init : AsyncFunc<{}, TestViewModel>;
    exec : AsyncFunc<{ model : TestViewModel }, TestViewModel>;
  }

  // then, implement it.
  var service : TestViewService = {

    init : function(params, rh) {
      // initial model
      var model : TestViewModel = {
        a : '1',
        b : '2',
        ope : '',
        res : '?'
      };
      rh(model);
    },

    exec : function(params, rh) {

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

      rh(params.model);
    }
  };

  spa.service.defineService({
    __requires__ : [], // additional modules.
    service : service
  });
}
