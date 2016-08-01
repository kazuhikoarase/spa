/**
 * initialize namespace
 */

namespace spa.view {

  var viewDefs : { [viewName : string] : ViewDef<any,any> } = {};

  export var defineView = <M,S>(viewDef : ViewDef<M,S>) => {
    var viewName : string = viewDef.name || __current_filename__.
      substring(0, __current_filename__.length - 3);
    viewDefs[viewName] = viewDef;
  };

  export var loadView = (viewName : string,
        onload : ($ui : JQuery) => void) => {

    if (!viewName.match(/^(\/.+)\/view\/([^\/]+)View$/) ) {
      throw 'bad viewName:' + viewName;
    }

    var viewPrefix = RegExp.$1;
    var viewBody = RegExp.$2;
    var urls : string[] = [
      viewPrefix + '/view/' + viewBody + 'View.js',
      viewPrefix + '/view/' + viewBody + 'View.html',
      viewPrefix + '/service/' + viewBody + 'Service.js',
    ];

    var numLoaded = 0;
    var $template : JQuery = null;
    var _model : any = null;

    $.each(urls, (i, url) => {
      $.ajax({ url : spa.__context_path__ + spa.__servlet_path__ +
            url }).done( (data) => {

        numLoaded += 1;
        if (url.match(/\.html$/) && data) {
          $template = $(data);
        }
        if (numLoaded < urls.length) {
          return;
        }

        // all files are loaded,
        var viewDef = viewDefs[viewName];
        var $view : JQuery = viewDef.newInstance({
          getService : () => spa.service.getServiceDef(
            viewPrefix + '/service/' + viewBody + 'Service').service,
          getTemplate : () => $template,
          getModel : () => {
            viewDef.viewToModel($view, _model);
            return _model
          },
          setModel : (model : any) => {
            _model = model;
            viewDef.modelToView(model, $view);
          }
        });
        onload($view);
      });
    });
  };
}
