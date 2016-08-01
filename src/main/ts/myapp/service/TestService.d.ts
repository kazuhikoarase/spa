declare namespace myapp.service {

  type AsyncFunc<P,R> = spa.service.AsyncFunc<P,R>;

  type TestModel = myapp.model.TestModel;

  // at first, declare an interface.
  interface TestService {
    init : AsyncFunc<{}, TestModel>;
    exec : AsyncFunc<{ model : TestModel }, TestModel>;
  }
}
