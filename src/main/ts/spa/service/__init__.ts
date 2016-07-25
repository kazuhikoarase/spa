/**
 * initialize namespace
 */

namespace spa.service {

  var services : { [serviceName : string] : ViewService } = {};

  export var defineService = (
      service : ViewService, serviceName? : string) => {
    var serviceName = serviceName || __current_filename__.
      substring(0, __current_filename__.length - 3);
    services[serviceName] = service;
  };

  export var getService = (serviceName : string) => services[serviceName];
}
