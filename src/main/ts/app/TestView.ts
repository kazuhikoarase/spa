namespace app {

  spa.view.defineView( (ctx) => {

    var $ui = ctx.getTemplate();
    var service = ctx.getService<TestViewService>();

    var $a = $ui.find('#a');
    var $b = $ui.find('#b');
    var $res = $ui.find('#res');
    var $btn = $ui.find('#btn');

    $btn.on('click', (event) => {
      service.add({ a: +$a.val(), b: +$b.val() }, (res) => {
        $res.val('' + res);
      });
    });

    return $ui;
  }, '/app/TestView');
}
