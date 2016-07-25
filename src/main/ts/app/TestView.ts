namespace app {

  spa.view.defineView( (ctx) => {

    // load service for this view.
    var service = ctx.getService<TestViewService>();

    var $ui = ctx.getTemplate();
    var $a = $ui.find('#a');
    var $b = $ui.find('#b');

    $ui.find('#addBtn').on('click', (event) => {
      service.add({ a : +$a.val(), b : +$b.val() }, (res) => {
        $ui.find('#res').val('' + res);
      });
    });
    $ui.find('#subBtn').on('click', (event) => {
      service.subtract({ a : +$a.val(), b : +$b.val() }, (res) => {
        $ui.find('#res').val('' + res);
      });
    });

    return $ui;
  });
}
