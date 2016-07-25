declare namespace spa.view {

  interface ViewContext {
    getService : <S>() => S;
    getTemplate : () => JQuery;
  }

  interface ViewFactory { (ctx : ViewContext) : JQuery }

  interface ViewDef {
    name? : string;
    newInstance : ViewFactory;
  }

  var defineView : (viewDef : ViewDef) => void;

  var loadView : (name : string, onload : ($ui : JQuery) => void) => void;
}

declare namespace spa.service {

  interface ServiceDef<S> {
    name? : string;
    service : S;
    __requires__? : string[];
  }

  type AsyncFunc<P,R> = (
      params : P,
      resultHandler : (result : R) => void,
      errorHandler? : () => void
    ) => void;

  var defineService : (serviceDef : ServiceDef<any>) => void;

  var getServiceDef : <S>(name : string) => ServiceDef<S>;
}

declare module spa.ui {

  interface DialogContext {
    title : string;
    $content : JQuery;
    showCloseButton? : boolean;
  }

  var showDialog : (ctx : DialogContext) => JQuery;
}
