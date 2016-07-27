namespace spa.ui {

  export var createSVGElement = (tagName : string) =>
    $(document.createElementNS('http://www.w3.org/2000/svg', tagName) );

  export var createSVG = (w : number, h : number) =>
    createSVGElement('svg').attr({
      version: '1.1', width: w, height: h,
      viewBox: '0 0 ' + w + ' ' + h });

  var createMaximizeButton = () => {
    var $btn = createSVG(12, 12).css('float', 'right').
      append(createSVGElement('rect').attr({
          x : 0, y : 0, width: 12, height: 12,
          fill: '#999999', stroke: 'none'}) ).append(
      createSVGElement('path').attr({ d: 'M 2 2 L 10 10 M 2 10 L 10 2',
        fill: 'none', stroke: '#333333', 'stroke-width' : '2'}) ).
      on('mouseover', (event) => { $btn.css('opacity', '0.7'); } ).
      on('mouseout', (event) => { $btn.css('opacity', ''); } );
    return $btn;
  };


  var dialogsKey = '__spa_dialogs__';

  var getDialogs = (ctx : DialogContext) => {
    var dialogs : JQuery[] = ctx.$parent.data(dialogsKey);
    if (!dialogs) {
      dialogs = [];
      ctx.$parent.data(dialogsKey, dialogs);
    }
    return dialogs;
  };

  var setDialogs = (ctx : DialogContext, dialogs : JQuery[]) => {
    ctx.$parent.data(dialogsKey, dialogs);
  };

  var WindowState = {
    NORMAL : 'normal',
    MINIMIZED : 'minimized',
    MAXIMIZED : 'maximized'
  };

  var crtBtn = () => createSVG(12, 12).
      css('float', 'right').css('margin-left', '2px').
      append(createSVGElement('rect').attr({
          x : 0, y : 0, width: 12, height: 12,
          fill: '#999999', stroke: 'none'}) ).
      on('mouseover', function(event) { $(this).css('opacity', '0.7'); } ).
      on('mouseout', function(event) { $(this).css('opacity', ''); } ).
      on('mousedown', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });

  export var showDialog = (ctx : DialogContext) => {

    var windowState = WindowState.NORMAL;

    var lastWindowRect : { left : string, top : string,
      width : number, height : number } = null;
    var minimized = false;
    var maximized = false;

    var updateWindowState = () => {
      var newWindowState = WindowState.NORMAL;
      if (minimized) {
        newWindowState = WindowState.MINIMIZED;
      } else if (maximized) {
        newWindowState = WindowState.MAXIMIZED;
      }
      if (newWindowState == windowState) {
        return;
      }
      windowState = newWindowState;
      if (windowState == WindowState.NORMAL) {
        restoreRect();
      } else if (windowState == WindowState.MINIMIZED) {
        storeRect();
      } else if (windowState == WindowState.MAXIMIZED) {
        storeRect();
        maximize();
      }
    };

    var storeRect = () => {
      lastWindowRect = {
        left : $dlg.css('left'),
        top : $dlg.css('top'),
        width : $dlg.width(),
        height : $dlg.height()
      };
    };

    var restoreRect = () => {
      $dlg.css('left', lastWindowRect.left).
        css('top', lastWindowRect.top).
        css('width', lastWindowRect.width + 'px').
        css('height', lastWindowRect.height + 'px');
    };

    var maximize = () => {
      $dlg.css('left', '0px').
        css('top', '0px').
        css('width', ctx.$parent.width() + 'px').
        css('height', ctx.$parent.height() + 'px');
    };

    var $minimizeButton = crtBtn().append(
        createSVGElement('path').attr({ d: 'M 2 10 L 10 10',
          fill: 'none', stroke: '#333333', 'stroke-width' : '2'}) ).
      on('mouseup', (event) => {
        //minimized = !minimized;
        //updateWindowState();
      });

    var $maximizeButton = crtBtn().append(
        createSVGElement('rect').attr({
          x : 2, y : 2, width: 8, height: 8,
          fill: 'none', stroke: '#333333', 'stroke-width' : '2'}) ).
      on('mouseup', (event) => {
        maximized = !maximized;
        updateWindowState();
      });

    var $closeButton = crtBtn().append(
        createSVGElement('path').attr({ d: 'M 2 2 L 10 10 M 2 10 L 10 2',
          fill: 'none', stroke: '#333333', 'stroke-width' : '2'}) ).
      on('mouseup', (event) => {
        dispose();
      });

    if (!ctx.showCloseButton) {
      $closeButton.css('display', 'none');
    }

    var parentResizeHandler = (event : JQueryEventObject) => {
      if (windowState == WindowState.MAXIMIZED) {
        maximize();
      }
    };

    var dispose = () => {
      var dialogs = getDialogs(ctx);
      var newDialogs : JQuery[] = [];
      for (var i = 0; i < dialogs.length; i += 1) {
        if (dialogs[i] != $dlg) {
          newDialogs.push(dialogs[i]);
        }
      }
      setDialogs(ctx, newDialogs);
      $dlg.remove();
      ctx.$parent.off('contentResize', parentResizeHandler);
    };

    var toFront = () => {
      var dialogs = getDialogs(ctx);
      var newDialogs : JQuery[] = [];
      for (var i = 0; i < dialogs.length; i += 1) {
        if (dialogs[i] != $dlg) {
          newDialogs.push(dialogs[i]);
        }
      }
      newDialogs.push($dlg);
      for (var i = 0; i < newDialogs.length; i += 1) {
        newDialogs[i].css('z-index', 1000 + i);
      }
      setDialogs(ctx, newDialogs);
    };

    var dragPoint : { x : number, y : number } = null;
    var mouseDownHandler = (event : JQueryEventObject) => {
      if (windowState == WindowState.MAXIMIZED) {
        return;
      }
      event.preventDefault();
      toFront();
      var off = $dlg.offset();
      dragPoint = { x : event.pageX - off.left, y : event.pageY - off.top };
      $(document).on('mousemove', mouseMoveHandler).
        on('mouseup', mouseUpHandler);
    };
    var mouseMoveHandler = (event : JQueryEventObject) => {
      $dlg.css('left', (event.pageX - dragPoint.x) + 'px').
        css('top', (event.pageY - dragPoint.y) + 'px');
    };
    var mouseUpHandler = (event : JQueryEventObject) => {
      $(document).off('mousemove', mouseMoveHandler).
        off('mouseup', mouseUpHandler);
    };

    var $dlg = $('<div></div>').addClass('dialog-frame').
      css('position', 'absolute').
      append($('<div></div>').addClass('dialog-title').
        css('cursor', 'default').text(ctx.title).
        append($closeButton).
        append($maximizeButton).
        append($minimizeButton).
        append($('<br style="clear:both;" />') ).
        on('mousedown', mouseDownHandler) ).append(ctx.$content);
    ctx.$parent.append($dlg).on('contentResize', parentResizeHandler);

    $dlg.css('left', '0px').css('top', '0px');

    getDialogs(ctx).push($dlg);

    toFront();

    return $dlg;
  };
}
