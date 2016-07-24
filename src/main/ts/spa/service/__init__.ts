/**
 * initialize namespace
 */

namespace spa.service {

  var services : { [serviceName : string] : ViewService } = {};

  export var defineService = (
      service : ViewService, serviceName? : string) => {
    services[serviceName] = service;
  };

  export var getService = (serviceName : string) => services[serviceName];
}
