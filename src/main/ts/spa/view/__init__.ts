/**
 * initialize namespace
 */

namespace spa.view {

  var initializers : { [name : string] : (ctx : ViewContext) => JQuery} = {};

  export var defineView = (initializer : (ctx : ViewContext) => JQuery,
        name : string) => {
    initializers[name] = initializer;
  };

  var suffixList : string[] = [ '.html', '.js', 'Service.js' ];

  export var loadView = (name : string,
        onload : ($ui : JQuery) => void) => {

    var numLoaded = 0;
    var $template : JQuery = null;

    $.each(suffixList, (i, suffix) => {
      $.ajax({ url: 'spa' + name + suffix }).done( (data) => {

        numLoaded += 1;
        if (suffix == '.html' && data) {
          $template = $(data);
        }
        if (numLoaded < suffixList.length) {
          return;
        }

        // all files are loaded,
        var initializer = initializers[name];
        var $ui = initializer({
          getService : () => spa.service.getService(name + 'Service'),
          getTemplate : () => $template
        });
        onload($ui);
      });
    });
  };
}
