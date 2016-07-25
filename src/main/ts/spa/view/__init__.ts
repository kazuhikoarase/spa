/**
 * initialize namespace
 */

namespace spa.view {

  var initializers : { [viewName : string] :
    (ctx : ViewContext) => JQuery} = {};

  export var defineView = (initializer : (ctx : ViewContext) => JQuery,
        viewName? : string) => {
    var viewName = viewName || __current_filename__.
      substring(0, __current_filename__.length - 3);
    initializers[viewName] = initializer;
  };

  var suffixList : string[] = [ '.html', '.js', 'Service.js' ];

  export var loadView = (viewName : string,
        onload : ($ui : JQuery) => void) => {

    var numLoaded = 0;
    var $template : JQuery = null;

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
        var initializer = initializers[viewName];
        var $ui = initializer({
          getService : () => spa.service.getService(viewName + 'Service'),
          getTemplate : () => $template
        });
        onload($ui);
      });
    });
  };
}
