declare namespace spa.view {

  interface ViewContext {
    getService : <S extends spa.service.ViewService>() => S;
    getTemplate : () => JQuery;
  }

  var defineView : (initializer : (ctx : ViewContext) => JQuery,
      viewName? : string) => void;

  var loadView : (name : string,
      onload : ($ui : JQuery) => void) => void;
}

declare namespace spa.service {

  interface ViewService {
    __requires__? : string[]
  }

  type AsyncFunc<P,R> = (
      params : P,
      resultHandler : (result : R) => void,
      errorHandler? : () => void
    ) => void;

  var defineService : (service : ViewService, serviceName? : string) => void;

  var getService : (serviceName : string) => ViewService;
}

declare module spa.ui {

  interface DialogContext {
    title : string;
    $content : JQuery;
    showCloseButton? : boolean;
  }

  var showDialog : (ctx : DialogContext) => JQuery;
}
