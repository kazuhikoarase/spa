/**
 * initialize namespace for client
 */

namespace spa.service {

  export var clientService :
      (serviceName : string, methodName : string) => AsyncFunc<any, any> =
      (serviceName, methodName) => (params, resultHandler, errorHandler) => {
    $.ajax({
      type: 'POST',
      url: spa.__context_path__ + spa.__servlet_path__ + '/invoker',
      contentType: 'application/json',
      data: JSON.stringify({
        serviceName : serviceName,
        methodName : methodName,
        params : params
      })
    }).done( (data) => {
      resultHandler(data.result);
    }).fail( () => {
      if (errorHandler) {
        errorHandler();
      }
    });
  };
}
