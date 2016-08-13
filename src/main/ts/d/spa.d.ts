

/// <reference path="jquery.d.ts"/>

declare namespace spa.view {

  interface ViewContext<M,S> {
    getService : () => S;
    getTemplate : () => JQuery;
    getModel : () => M;
    setModel : (model : M) => void;
  }

  interface ViewFactory<M,S> { (ctx : ViewContext<M,S>) : JQuery }

  interface ViewDef<M,S> {
    name? : string;
    newInstance : ViewFactory<M,S>;
    viewToModel : ($view : JQuery, model : M) => void;
    modelToView : (model : M, $view : JQuery) => void;
  }

  var defineView : <M,S>(viewDef : ViewDef<M,S>) => void;

  var loadView : (name : string,
    onload : ($ui : JQuery, resources? : string[]) => void) => void;
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

  interface Point {
    x : number;
    y : number;
  }

  interface Rect extends Point {
    width : number;
    height : number;
  }

  interface WindowContext {
    $parent : JQuery;
    $content : JQuery;
    title? : string;
    defaultWindowRect? : Rect;
    getMaximumRect? : () => Rect;
    showCloseButton? : boolean;
  }

  var showWindow : (ctx : WindowContext) => JQuery;
}
