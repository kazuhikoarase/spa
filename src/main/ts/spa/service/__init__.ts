/**
 * initialize namespace
 */

namespace spa.service {

  var services : { [serviceName : string] : ServiceDef<any> } = {};

  export var defineService = (serviceDef : ServiceDef<any>) => {
    var serviceName : string = serviceDef.name || __current_filename__.
      substring(0, __current_filename__.length - 3);
    services[serviceName] = serviceDef;
  };

  export var getServiceDef =
    <S>(serviceName : string) => services[serviceName];
}
