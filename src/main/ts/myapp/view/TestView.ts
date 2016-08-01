namespace myapp.view {

  declare type TestModel = myapp.model.TestModel;
  declare type TestService = myapp.service.TestService;

  var newInstance : spa.view.ViewFactory<TestModel, TestService> =
      function(ctx) {

    // get the service for this view.
    var service = ctx.getService();

    var $view = ctx.getTemplate();

    $view.find('#addBtn').on('click', function(event) {
      var model = ctx.getModel();
      model.ope = '+';
      service.exec({ model : model }, function(model) {
        ctx.setModel(model);
      });
    });

    $view.find('#subBtn').on('click', function(event) {
      var model = ctx.getModel();
      model.ope = '-';
      service.exec({ model : model }, function(model) {
        ctx.setModel(model);
      });
    });

    service.init({}, function(model) {
      ctx.setModel(model);
    });

    return $view;
  };

  spa.view.defineView({

    newInstance : newInstance,

    /**
     * called before call server.
     */
    viewToModel : ($view, model) => {
      model.a = $view.find('#a').val();
      model.b = $view.find('#b').val();
      model.res = $view.find('#res').val();
    },

    /**
     * called after call server.
     */
    modelToView : (model, $view) => {
      $view.find('#a').val(model.a);
      $view.find('#b').val(model.b);
      $view.find('#res').val(model.res);
    }
  });
}
