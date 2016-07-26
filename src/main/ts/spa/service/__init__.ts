/**
 * initialize namespace
 */

namespace spa.service {

  var serviceDefs : { [serviceName : string] : ServiceDef<any> } = {};

  export var defineService = (serviceDef : ServiceDef<any>) => {
    var serviceName : string = serviceDef.name || __current_filename__.
      substring(0, __current_filename__.length - 3);
    serviceDefs[serviceName] = serviceDef;
  };

  export var getServiceDef =
    <S>(serviceName : string) => serviceDefs[serviceName];
}
