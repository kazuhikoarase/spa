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

  var windowListKey = '__spa_window_list__';

  var getWindowList = (ctx : WindowContext) => {
    var windowList : JQuery[] = ctx.$parent.data(windowListKey);
    if (!windowList) {
      windowList = [];
      ctx.$parent.data(windowListKey, windowList);
    }
    return windowList;
  };

  var setWindowList = (ctx : WindowContext, windowList : JQuery[]) => {
    ctx.$parent.data(windowListKey, windowList);
  };

  var WindowState = {
    NORMAL : 'normal',
    MINIMIZED : 'minimized',
    MAXIMIZED : 'maximized'
  };

  var WindowEvent = {
    DISPOSE_WINDOW : 'disposeWindow'
  };

  interface Point {
    x : number;
    y : number;
  }

  var btnFill = '#aaaaaa';
  var btnStroke = '#333333';
  var btnSize = 15;
  var btnSymGap = 2.5;

  var crtBtn = () => createSVG(btnSize, btnSize).
      css('float', 'right').css('margin-left', '2px').
      append(createSVGElement('rect').attr({
          x : 0, y : 0, width: btnSize, height: btnSize,
          fill: btnFill, stroke: 'none'}) ).
      on('mouseover', function(event) { $(this).css('opacity', '0.7'); } ).
      on('mouseout', function(event) { $(this).css('opacity', ''); } ).
      on('mousedown', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });

  var path = () => {
    var d = '';
    var builder = {
     m : (x : number, y : number) => {
       d += 'M' + x + ' ' + y;
       return builder;
     },
     l : (x : number, y : number) => {
       d += 'L' + x + ' ' + y;
       return builder;
     },
     z : () => {
       d += 'Z';
       return builder;
     },
     build : () => createSVGElement('path').attr({ d: d })
    };
    return builder;
  };

  var getWindowRect : ($win : JQuery) => Rect = ($win) => {
    return {
      x : $win.css('left'),
      y : $win.css('top'),
      width : Math.ceil($win.innerWidth() ),
      height : Math.ceil($win.innerHeight() )
    };
  };

  var setWindowRect : ($win : JQuery, rect : Rect) => JQuery = ($win, rect) => {
    var left = typeof rect.x == 'number'? rect.x + 'px' : rect.x;
    var top = typeof rect.y == 'number'? rect.y + 'px' : rect.y;
    $win.css('left', left).
      css('top', top).
      css('width', rect.width + 'px').
      css('height', rect.height + 'px');
    return $win;
  };

  var createDragHandler = (
    mouseDown : (event : JQueryEventObject) => Point,
    mouseMove : (event : JQueryEventObject, dragPoint : Point) => void,
    mouseUp? : (event : JQueryEventObject) => void
  ) => {
    var dragPoint : Point = null;
    var mouseDownHandler = (event : JQueryEventObject) => {
      dragPoint = mouseDown(event);
      if (dragPoint == null) {
        return;
      }
      $(document).on('mousemove', mouseMoveHandler).
        on('mouseup', mouseUpHandler);
    };
    var mouseMoveHandler = (event : JQueryEventObject) => {
      mouseMove(event, dragPoint);
    };
    var mouseUpHandler = (event : JQueryEventObject) => {
      if (mouseUp) {
        mouseUp(event);
      }
      $(document).off('mousemove', mouseMoveHandler).
        off('mouseup', mouseUpHandler);
    };
    return mouseDownHandler;
  };

  export var showWindow = (ctx : WindowContext) => {

    var windowState : string = null;
    var lastWindowRect : Rect = null;

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
      $normalSymbol.css('display',
        windowState != WindowState.NORMAL? '' : 'none');
      $maximumSymbol.css('display',
        windowState == WindowState.NORMAL? '' : 'none');
    };

    var storeRect = () => {
      lastWindowRect = getWindowRect($win)
    };

    var restoreRect = () => {
      if (lastWindowRect == null) {
        return;
      }
      setWindowRect($win, lastWindowRect);
    };

    var defaultGetMaximumRect : () => Rect = () => {
      return { x : 0, y : 0,
        width : ctx.$parent.width(),
        height : ctx.$parent.height() };
    };

    var getMaximumRect : () => Rect = ctx.getMaximumRect?
      ctx.getMaximumRect : defaultGetMaximumRect;

    var maximize = () => {
      setWindowRect($win, getMaximumRect() );
    };

    var $minimizeButton = crtBtn().append(
        path().m(btnSymGap, btnSize - btnSymGap).
          l(btnSize - btnSymGap, btnSize - btnSymGap).build().
        attr({fill: 'none', stroke: btnStroke, 'stroke-width' : '1'}) ).
      on('mouseup', (event) => {
        minimized = !minimized;
        updateWindowState();
      });

    var $normalSymbol = createSVGElement('g').
      append(createSVGElement('rect').attr({
          x : btnSymGap + 2, y : btnSymGap,
          width: btnSize - btnSymGap * 2 - 2,
          height: btnSize - btnSymGap * 2 - 2,
          fill: btnFill, stroke: btnStroke, 'stroke-width' : '1'}) ).
      append(createSVGElement('rect').attr({
          x : btnSymGap, y : btnSymGap + 2,
          width: btnSize - btnSymGap * 2 - 2,
          height: btnSize - btnSymGap * 2 - 2,
          fill: btnFill, stroke: btnStroke, 'stroke-width' : '1'}) );

    var $maximumSymbol = createSVGElement('g').
      append(createSVGElement('rect').attr({
          x : btnSymGap, y : btnSymGap,
          width: btnSize - btnSymGap * 2, height: btnSize - btnSymGap * 2,
          fill: 'none', stroke: btnStroke, 'stroke-width' : '1'}) );

    var $maximizeButton = crtBtn().
      append($normalSymbol).append($maximumSymbol).
      on('mouseup', (event) => {
        maximized = !maximized;
        updateWindowState();
      });

    var $closeButton = crtBtn().append(
        path().m(btnSymGap, btnSymGap).
          l(btnSize - btnSymGap, btnSize - btnSymGap).
          m(btnSymGap, btnSize - btnSymGap).
          l(btnSize - btnSymGap, btnSymGap).build().
        attr({ fill: 'none', stroke: btnStroke, 'stroke-width' : '2'}) ).
      on('mouseup', (event) => {
        $win.trigger(WindowEvent.DISPOSE_WINDOW);
      });

    if (!ctx.showCloseButton) {
      $closeButton.css('display', 'none');
    }
    // pending
    $minimizeButton.css('display', 'none');

    var parentResizeHandler = (event : JQueryEventObject) => {
      if (windowState == WindowState.MAXIMIZED) {
        maximize();
      }
    };

    var toFront = () => {
      var windowList = getWindowList(ctx);
      var newWindowList : JQuery[] = [];
      for (var i = 0; i < windowList.length; i += 1) {
        if (windowList[i] != $win) {
          newWindowList.push(windowList[i]);
        }
      }
      newWindowList.push($win);
      for (var i = 0; i < newWindowList.length; i += 1) {
        newWindowList[i].css('z-index', 1000 + i);
      }
      setWindowList(ctx, newWindowList);
    };

    var mouseDownHandler : (event : JQueryEventObject) => void =
        createDragHandler( (event) => {
          if (windowState == WindowState.MAXIMIZED) {
            return null;
          }
          event.preventDefault();
          toFront();
          var parentOff = ctx.$parent.offset();
          var off = $win.offset();
          return { 
            x : event.pageX - off.left + parentOff.left,
            y : event.pageY - off.top + parentOff.top };
        }, (event, dragPoint) => {
          $win.css('left', (event.pageX - dragPoint.x) + 'px').
            css('top', (event.pageY - dragPoint.y) + 'px');
        });

    var $titlebar = $('<div></div>').addClass('window-title').
        css('cursor', 'default').text(ctx.title).
        append($closeButton).
        append($maximizeButton).
        append($minimizeButton).
        append($('<br/>').css('clear', 'both') ).
        on('mousedown', mouseDownHandler).
        on('dblclick', function(event) {
          $maximizeButton.trigger('mouseup');
        });

    var resize_mouseDownHandler :
          (event : JQueryEventObject) => void = function() {
      var kind : string = null;
      var $rect : JQuery = null;
      return createDragHandler( (event) => {
        if (windowState == WindowState.MAXIMIZED) {
          return null;
        }
        event.preventDefault();
        toFront();
        kind = $(event.currentTarget).attr('resize-kind');
        $rect = $('<div></div>').css('position', 'absolute').
          css('left', '0px').css('top', '0px').
          css('right', '0px').css('bottom', '0px').
//          css('background-color', '#000000').css('opacity', 0.2).
          css('z-index', 10000). // ja, pending.
          css('cursor', $(event.currentTarget).css('cursor') );
        $('BODY').append($rect);
        return {
          x : event.pageX - $win.width(),
          y : event.pageY - $win.height() };
      }, (event, dragPoint) => {
        console.log(kind);
        var w = Math.max(100, event.pageX - dragPoint.x);
        var h = Math.max(100, event.pageY - dragPoint.y);
        $win.css('width', w + 'px').css('height', h + 'px');
      }, (event) => {
        $rect.remove();
      });
    }();

    var barWidth = '4px';
    var cornerSize = '8px';

    var resizeTbl : { [kind : string] : { x : number, y : number } } = {
      lt : {x : -1, y : -1}, lb : {x : -1, y : 1},
      rt : {x :  1, y : -1}, rb : {x :  1, y : 1},
      l : {x : -1, y :  0}, r : {x : 1, y : 0},
      t : {x :  0, y : -1}, b : {x : 0, y : 1}
    };

    var creResize = (kind : string) => $('<div></div>').
      attr('resize-kind', kind).
      css('position', 'absolute').
      on('mousedown', resize_mouseDownHandler);
    var creCorner = (kind : string) => creResize(kind).
      addClass('window-frame-resize-corner').
      css('width', cornerSize).css('height', cornerSize);
    var creVBar = (kind : string) => creResize(kind).
      addClass('window-frame-resize-bar').
      css('width', cornerSize).css('top', '0px').
      css('bottom', '0px').css('cursor', 'ew-resize');
    var creHBar = (kind : string) => creResize(kind).
      addClass('window-frame-resize-bar').
      css('height', cornerSize).css('left', '0px').
      css('right', '0px').css('cursor', 'ns-resize');

    var $resizeCorners = {
      lt : creCorner('lt').css('left', '0px').css('top', '0px').
        css('cursor', 'nwse-resize'),
      lb : creCorner('lb').css('left', '0px').css('bottom', '0px').
        css('cursor', 'nesw-resize'),
      rt : creCorner('rt').css('right', '0px').css('top', '0px').
        css('cursor', 'nesw-resize'),
      rb : creCorner('rb').css('right', '0px').css('bottom', '0px').
        css('cursor', 'nwse-resize')
    };

    var $resizeBars = {
      l : creVBar('l').css('left', '0px'),
      r : creVBar('r').css('right', '0px'),
      t : creHBar('t').css('top', '0px'),
      b : creHBar('b').css('bottom', '0px')
    };

    var $content = $('<div></div>').css('position', 'absolute').
      css('left', barWidth).css('top', barWidth).css('right', barWidth).css('bottom', barWidth).
      addClass('window-content').
      append($titlebar).
      append(ctx.$content)/*.
      append($resizeKnob)*/;

    var $win = $('<div></div>').addClass('window-frame').
      css('position', 'absolute').
      on(WindowEvent.DISPOSE_WINDOW, (event) => {
        var windowList = getWindowList(ctx);
        var newWindowList : JQuery[] = [];
        for (var i = 0; i < windowList.length; i += 1) {
          if (windowList[i] != $win) {
            newWindowList.push(windowList[i]);
          }
        }
        setWindowList(ctx, newWindowList);
        $win.remove();
        ctx.$parent.off('contentResize', parentResizeHandler);
      });

    $.each($resizeBars, (id, $ui) => {
      $win.append($ui);
    });
    $.each($resizeCorners, (id, $ui) => {
      $win.append($ui);
    });
    $win.append($content);

    if (ctx.defaultWindowRect) {
      setWindowRect($win, ctx.defaultWindowRect);
    } else {
      setWindowRect($win, { x : 0, y : 0, width : 300, height : 200 });
    }

    ctx.$parent.append($win).
      on('contentResize', parentResizeHandler);

    updateWindowState();

    getWindowList(ctx).push($win);

    toFront();

    return $win;
  };
}
