namespace spa.ui {

  export var createSVGElement = (tagName : string) =>
    $(document.createElementNS('http://www.w3.org/2000/svg', tagName) );

  export var createSVG = (w : number, h : number) =>
    createSVGElement('svg').attr({
      version: '1.1', width: w, height: h,
      viewBox: '0 0 ' + w + ' ' + h });

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
    WINDOW_ACTIVATE : 'windowActivate',
    WINDOW_DEACTIVATE : 'windowDeactivate',
    WINDOW_CLOSE : 'windowClose'
  };

  interface Point {
    x : number;
    y : number;
  }

  var btnSize = 15;
  var btnSymGap = 2.5;

  var crtBtn = () => createSVG(btnSize, btnSize).
      css('float', 'right').css('margin-left', '2px').
        append(createSVGElement('rect').
        attr('class', 'window-frame-button').
        css('stroke', 'none').
        attr({ x: 0, y: 0, width: btnSize, height: btnSize}) ).
        on('mouseover', function(event) {
          $(this).css('opacity', '0.7');
        } ).on('mouseout', function(event) {
          $(this).css('opacity', '');
        } ).on('mousedown', function(event) {
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
    var parentOff = $win.parent().offset();
    var off = $win.offset();
    return {
      x : off.left - parentOff.left,
      y : off.top - parentOff.top,
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
    var titlebar_mouseDownHandler = (event : JQueryEventObject) => {
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
    return titlebar_mouseDownHandler;
  };

  export var showWindow = (ctx : WindowContext) => {

    var minWidth = 100;
    var minHeight = 100;

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

      var frameBorderWidth = windowState == WindowState.NORMAL? '4px' : '0px';
      $content.
        css('left', frameBorderWidth).css('top', frameBorderWidth).
        css('right', frameBorderWidth).css('bottom', frameBorderWidth);
      updateContentSize();
    };

    var updateContentSize = () => {
      ctx.$content.
        outerWidth($content.innerWidth() ).
        outerHeight($content.innerHeight() - $titlebar.outerHeight() );
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
        attr('class', 'window-frame-button').
        css('fill', 'none').
        attr('stroke-width', '1') ).
      on('mouseup', (event) => {
        minimized = !minimized;
        updateWindowState();
      });

    var $normalSymbol = createSVGElement('g').
      append(createSVGElement('rect').
      attr('class', 'window-frame-button').
      attr({
          x : btnSymGap + 2, y : btnSymGap,
          width: btnSize - btnSymGap * 2 - 2,
          height: btnSize - btnSymGap * 2 - 2, 'stroke-width' : '1'}) ).
      append(createSVGElement('rect').
      attr('class', 'window-frame-button').
      attr({
          x : btnSymGap, y : btnSymGap + 2,
          width: btnSize - btnSymGap * 2 - 2,
          height: btnSize - btnSymGap * 2 - 2,
          'stroke-width' : '1'}) );

    var $maximumSymbol = createSVGElement('g').
      append(createSVGElement('rect').
      attr('class', 'window-frame-button').css('fill', 'none'). 
      attr({
          x : btnSymGap, y : btnSymGap,
          width: btnSize - btnSymGap * 2, height: btnSize - btnSymGap * 2,
          'stroke-width' : '1'}) );

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
        attr('class', 'window-frame-button').css('fill', 'none').
        attr({ 'stroke-width' : '2' }) ).
      on('mouseup', (event) => {
        $win.trigger(WindowEvent.WINDOW_CLOSE);
      });

    if (!ctx.showCloseButton) {
      $closeButton.css('display', 'none');
    }
    // pending
    $minimizeButton.css('display', 'none');

    var parent_resizeHandler = (event : JQueryEventObject) => {
      if (windowState == WindowState.MAXIMIZED) {
        maximize();
      }
    };

    var setActivated = ($win : JQuery, activated : boolean) => {
      var activeClass = 'window-active';
      var _activated = $win.hasClass(activeClass);
      if (_activated == activated) {
        return;
      }
      if (activated) {
        $win.addClass(activeClass).trigger(WindowEvent.WINDOW_ACTIVATE);
      } else {
        $win.removeClass(activeClass).trigger(WindowEvent.WINDOW_DEACTIVATE);
      }
    };

    var updateWindowList = (remove : boolean) => {
      var windowList = getWindowList(ctx);
      var newWindowList : JQuery[] = [];
      for (var i = 0; i < windowList.length; i += 1) {
        setActivated(windowList[i], false);
        if (windowList[i] != $win) {
          newWindowList.push(windowList[i]);
        }
      }
      if (!remove) {
        newWindowList.push($win);
      }
      for (var i = 0; i < newWindowList.length; i += 1) {
        newWindowList[i].css('z-index', 1000 + i);
      }
      setWindowList(ctx, newWindowList);
      if (newWindowList.length > 0) {
        setActivated(newWindowList[newWindowList.length - 1], true);
      }
    };

    var titlebar_mouseDownHandler : (event : JQueryEventObject) => void =
        createDragHandler( (event) => {
          if (windowState == WindowState.MAXIMIZED) {
            return null;
          }
          event.preventDefault();
          var parentOff = ctx.$parent.offset();
          var off = $win.offset();
          return { 
            x : event.pageX - off.left + parentOff.left,
            y : event.pageY - off.top + parentOff.top };
        }, (event, dragPoint) => {
          var x = event.pageX - dragPoint.x;
          var y = event.pageY - dragPoint.y;
          /*
          var maxRect = getMaximumRect();
          x = Math.max(maxRect.x, Math.min(x,
            maxRect.x + maxRect.width - minWidth) );
          y = Math.max(maxRect.y, Math.min(y,
            maxRect.y + maxRect.height - minHeight) );
          */
          //TODO
          $win.css('left', x + 'px').css('top', y + 'px');
        });

    var $titlebar = $('<div></div>').addClass('window-title').
        css('cursor', 'default').text(ctx.title).
        append($closeButton).
        append($maximizeButton).
        append($minimizeButton).
        append($('<br/>').css('clear', 'both') ).
        on('mousedown', titlebar_mouseDownHandler).
        on('dblclick', function(event) {
          $maximizeButton.trigger('mouseup');
        });

    var resize_mouseDownHandler :
          (event : JQueryEventObject) => void = function() {

      var kind : string = null;
      var $rect : JQuery = null;
      var org  = { x : 0, y : 0, width : 0, height : 0 };

      return createDragHandler( (event) => {
        if (windowState == WindowState.MAXIMIZED) {
          return null;
        }
        event.preventDefault();
        updateWindowList(false);
        kind = $(event.currentTarget).attr('resize-kind');
        $rect = $('<div></div>').css('position', 'absolute').
          css('left', '0px').css('top', '0px').
          css('right', '0px').css('bottom', '0px').
          //css('background-color', '#000000').css('opacity', 0.2).
          css('z-index', 100).
          css('cursor', $(event.currentTarget).css('cursor') );
        $('BODY').append($rect);
        /*
        var off = $win.offset();
        org = { left : off.left, top : off.top,
          width : $win.width(), height : $win.height() };
        */
        org = getWindowRect($win);
        return { x : event.pageX, y : event.pageY };
      }, (event, dragPoint) => {

        var tbl = resizeTbl[kind];
        var dx = event.pageX - dragPoint.x;
        var dy = event.pageY - dragPoint.y;

        var newRect = { x : org.x, y : org.y,
          width : org.width, height : org.height };

        if (tbl.x == -1) {
          newRect.x += dx;
        }
        if (tbl.y == -1) {
          newRect.y += dy;
        }

        var maxRect = getMaximumRect();
        newRect.x = Math.max(maxRect.x,
          Math.min(newRect.x, org.x + org.width - minWidth) );
        newRect.y = Math.max(maxRect.y,
          Math.min(newRect.y, org.y + org.height - minHeight) );

        if (tbl.x == -1) {
          newRect.width -= newRect.x - org.x;
        }
        if (tbl.y == -1) {
          newRect.height -= newRect.y - org.y;
        }

        if (tbl.x == 1) {
          newRect.width += dx;
        }
        if (tbl.y == 1) {
          newRect.height += dy;
        }

        newRect.width = Math.max(minWidth,
          Math.min(newRect.width, maxRect.width) );
        newRect.height = Math.max(minHeight,
          Math.min(newRect.height, maxRect.height) );

        setWindowRect($win, newRect);

        updateContentSize();

      }, (event) => {
        $rect.remove();
      });
    }();

    var frameCornerSize = '8px';

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
      css('width', frameCornerSize).css('height', frameCornerSize);
    var creVBar = (kind : string) => creResize(kind).
      addClass('window-frame-resize-bar').
      css('width', frameCornerSize).css('top', '0px').
      css('bottom', '0px').css('cursor', 'ew-resize');
    var creHBar = (kind : string) => creResize(kind).
      addClass('window-frame-resize-bar').
      css('height', frameCornerSize).css('left', '0px').
      css('right', '0px').css('cursor', 'ns-resize');

    var $resizeCorners = [
      creCorner('lt').css('left', '0px').css('top', '0px').
        css('cursor', 'nwse-resize'),
      creCorner('lb').css('left', '0px').css('bottom', '0px').
        css('cursor', 'nesw-resize'),
      creCorner('rt').css('right', '0px').css('top', '0px').
        css('cursor', 'nesw-resize'),
      creCorner('rb').css('right', '0px').css('bottom', '0px').
        css('cursor', 'nwse-resize')
    ];

    var $resizeBars = [
      creVBar('l').css('left', '0px'),
      creVBar('r').css('right', '0px'),
      creHBar('t').css('top', '0px'),
      creHBar('b').css('bottom', '0px')
    ];

    var $content = $('<div></div>').css('position', 'absolute').
      addClass('window-content').
      append($titlebar).
      append(ctx.$content);

    var $win = $('<div></div>').addClass('window-frame').
      css('position', 'absolute').
      on('mousedown', (event) => {
        updateWindowList(false);
      }).on(WindowEvent.WINDOW_CLOSE, (event) => {
        updateWindowList(true);
        $win.remove();
        ctx.$parent.off('resize', parent_resizeHandler);
      });

    $.each($resizeBars, (i, $ui) => {
      $win.append($ui);
    });
    $.each($resizeCorners, (i, $ui) => {
      $win.append($ui);
    });
    $win.append($content);

    $content.on('testEvent', (event) => {
      console.log('#1,' +
        event.isDefaultPrevented() + ',phase:' + event.eventPhase)
    });
    $content.on('testEvent', (event) => {
      console.log('#2,' +
        event.isDefaultPrevented() + ',phase:' + event.eventPhase)
      event.preventDefault();
    });
    $content.on('testEvent', (event) => {
      console.log('#3,' +
        event.isDefaultPrevented() + ',phase:' + event.eventPhase)
    });
    $content.trigger('testEvent');

    if (ctx.defaultWindowRect) {
      setWindowRect($win, ctx.defaultWindowRect);
    } else {
      // TODO
      setWindowRect($win, { x : 0, y : 0, width : 300, height : 200 });
    }

    ctx.$parent.append($win).on('resize', parent_resizeHandler);

    updateWindowState();

    updateWindowList(false);

    return $win;
  };
}
