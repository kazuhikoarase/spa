/**
 * initialize namespace for server
 */

namespace spa.service {

  declare var java : any;
  declare var Packages : any;
  declare var _ctx : any;
  declare var _logger : any;

  var enc = 'UTF-8';

  export var getLogger = () => _logger;

  var sync = (lock : any, callback : () => void) => {
    Packages.spa.core.ISync.$.$(lock,
      new Packages.spa.core.ISync({ scope : callback }) );
  };

  var invoke = (req : any) => {
    var serviceDef = getServiceDef<any>(req.serviceName);
    if (!serviceDef) {
      serviceDef = loadService<any>(req.serviceName);
    }
    var service = serviceDef.service;
    var result : any = null;
    service[req.methodName](req.params, (r : any) => { result = r; });
    return { result : result };
  };

  var evalfile = (path : string) => {
    sync(_ctx, () => {
      spa.__current_filename__ = '' + path;
      _ctx.evalfile(path);
      spa.__current_filename__ = null;
    });
  };

  var loadService = <S>(serviceName : string) => {
    evalfile(serviceName + '.js'); 
    var serviceDef = getServiceDef<S>(serviceName);
    if (serviceDef.__requires__) {
      var modules = serviceDef.__requires__;
      for (var i = 0; i < modules.length; i += 1) {
        evalfile(modules[i]);
      }
    }
    return serviceDef;
  }

  _ctx.setServiceListener(new Packages.spa.servlet.ServiceListener({

    service : (request : any, response : any) => {

      console.log(request.getContextPath() +
              ' - ' + request.getServletPath() +
              ' - ' + request.getPathInfo() );

      var path = request.getPathInfo();

      if (path == '/invoker') {

        var buf = java.lang.reflect.Array.newInstance(
          java.lang.Byte.TYPE, 4096);
        var contentLength = +request.getHeader('content-length');

        var bout = new java.io.ByteArrayOutputStream();
        try {
          var reqIn = request.getInputStream();
          while (contentLength > 0) {
            var len : number = reqIn.read(buf, 0,
              Math.min(contentLength, buf.length) );
            if (len == -1) {
              response.sendError(500, 'unexpected end of file.');
              return;
            }
            bout.write(buf, 0, len);
            contentLength -= len;
          }
        } finally {
          bout.close();
        }

        var reqObj = JSON.parse(new java.lang.String(bout.toByteArray(), enc) );
        var resObj = invoke(reqObj);

        var res = new java.lang.String(JSON.stringify(resObj) ).getBytes(enc);
        response.setContentType('application/json;charset=' + enc);
        var resOut = response.getOutputStream();
        try {
          resOut.write(res, 0, res.length);
        } finally {
          resOut.close();
        }

      } else if (path.endsWith('Service.js') ) {

        var serviceName = '' + path.substring(0, path.length() - 3);
        loadService<any>(serviceName);

        response.setContentType('text/javascript;charset=' + enc);
        var writer = response.getWriter();
        try {
          writer.println(spa.service.getClientServiceScript(serviceName) );
        } finally {
          writer.close();
        }

      } else if (path.endsWith('.js') ) {

        response.setContentType('text/javascript;charset=' + enc);
        var writer = response.getWriter();
        try {
          writer.println('spa.__current_filename__ = "' + path +'";');
          writer.println(_ctx.getResourceAsString(path) );
          writer.println('spa.__current_filename__ = null;');
        } finally {
          writer.close();
        }

      } else if (path.endsWith('.html') ) {

        response.setContentType('text/html;charset=' + enc);
        var writer = response.getWriter();
        try {
          writer.println(_ctx.getResourceAsString(path) );
        } finally {
          writer.close();
        }

      } else {
        response.sendError(404, path);
      }
    }
  }) );

  export var getClientServiceScript = (serviceName : string) => {

    var src = '';

    src += '!function(svc){';
    src += 'var cs = spa.service.clientService;';
    src += 'spa.service.defineService({name:svc,service:{';

    var service = getServiceDef(serviceName).service;
    var methodName : string;
    var numMethods = 0;

    for (methodName in service) {
      if (numMethods > 0) {
        src += ',';
      }
      src += methodName;
      src += ':cs(svc,"';
      src += methodName;
      src += '")';
      numMethods += 1;
    }

    src += '}});';
    src += '}("' + serviceName + '");';

    return src;
  }
}

!function(global : any) {
  global.console = {
    log : (msg : any) => { spa.service.getLogger().info('' + msg); }
  }
}(this);
