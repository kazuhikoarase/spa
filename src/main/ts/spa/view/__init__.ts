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

  var suffixList : string[] = [ '.html', '.js', 'Service.js' ];

  export var loadView = (viewName : string,
        onload : ($ui : JQuery) => void) => {

    var numLoaded = 0;
    var $template : JQuery = null;
    var _model : any = null;

    $.each(suffixList, (i, suffix) => {
      $.ajax({ url : spa.__context_path__ + spa.__servlet_path__ +
            viewName + suffix }).done( (data) => {

        numLoaded += 1;
        if (suffix == '.html' && data) {
          $template = $(data);
        }
        if (numLoaded < suffixList.length) {
          return;
        }

        // all files are loaded,
        var viewDef = viewDefs[viewName];
        var $view : JQuery = viewDef.newInstance({
          getService : () => spa.service.getServiceDef(
            viewName + 'Service').service,
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
