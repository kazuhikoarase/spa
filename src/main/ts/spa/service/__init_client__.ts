/**
 * initialize namespace for client
 */

namespace spa.service {

  export var clientService :
      (serviceName : string, methodName : string) => AsyncFunc<any, any> =
      (serviceName, methodName) => (params, resultHandler, errorHandler) => {
    $.ajax({
      type: 'POST',
      url: 'spa/invoker',
      contentType: 'application/json',
      data: JSON.stringify({
        serviceName : serviceName,
        methodName : methodName,
        params : params
      })
    }).done(function(data) {
      resultHandler(data.result);
    }).fail(function() {
      if (errorHandler) {
        errorHandler();
      }
    });
  };
}
