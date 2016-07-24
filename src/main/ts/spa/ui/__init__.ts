namespace spa.ui {

  export var createSVGElement = (tagName : string) =>
    $(document.createElementNS('http://www.w3.org/2000/svg', tagName) );

  export var createSVG = (w : number, h : number) =>
    createSVGElement('svg').attr({
      version: '1.1', width: w, height: h,
      viewBox: '0 0 ' + w + ' ' + h });

  var dialogs : JQuery[] = [];

  export var showDialog = function(ctx : DialogContext) {

    var $btn = createSVG(12, 12).css('float', 'right').
      append(createSVGElement('rect').attr({
          x : 0, y : 0, width: 12, height: 12,
          fill: '#999999', stroke: 'none'}) ).append(
      createSVGElement('path').attr({ d: 'M 2 2 L 10 10 M 2 10 L 10 2',
        fill: 'none', stroke: '#333333', 'stroke-width' : '2'}) ).
      on('mouseover', (event) => { $btn.css('opacity', '0.7'); } ).
      on('mouseout', (event) => { $btn.css('opacity', ''); } ).
      on('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
      }).on('mouseup', function(event) {
        var newDialogs : JQuery[] = [];
        for (var i = 0; i < dialogs.length; i += 1) {
          if (dialogs[i] != $dlg) {
            newDialogs.push(dialogs[i]);
          }
        }
        dialogs = newDialogs;
        $dlg.remove();
      });
    if (!ctx.showCloseButton) {
      $btn.css('display', 'none');
    }

    var toFront = function() {
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
      dialogs = newDialogs;
    };

    var dragPoint : { x : number, y : number } = null;
    var mouseDownHandler = function(event : JQueryEventObject) {
      event.preventDefault();
      toFront();
      var off = $dlg.offset();
      dragPoint = { x : event.pageX - off.left, y : event.pageY - off.top };
      $(document).on('mousemove', mouseMoveHandler).
        on('mouseup', mouseUpHandler);
    };
    var mouseMoveHandler = function(event : JQueryEventObject) {
      $dlg.css('left', (event.pageX - dragPoint.x) + 'px').
        css('top', (event.pageY - dragPoint.y) + 'px');
    };
    var mouseUpHandler = function(event : JQueryEventObject) {
      $(document).off('mousemove', mouseMoveHandler).
        off('mouseup', mouseUpHandler);
    };

    var $dlg = $('<div></div>').addClass('dialog-frame').
      css('position', 'absolute').
      append($('<div></div>').addClass('dialog-title').
        css('cursor', 'default').text(ctx.title).append($btn).
        append($('<br style="clear:both;" />') ).
        on('mousedown', mouseDownHandler) ).append(ctx.$content);
    $('BODY').append($dlg);

    $dlg.css('left', '0px').css('top', '0px');

    dialogs.push($dlg);
    toFront();

    return $dlg;
  };
}
