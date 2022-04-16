/**
 * Beej's Drag-n-Drop demo library, Rev 1
 *
 * Usage:
 *
 *  1. give all draggable elements class="draggable"
 *  2. give all droptarget elements class="droptarget"
 *  3. call beejdnd.init()
 *
 * When an item is dropped on a droptarget, the droptarget will receive
 * a 'drop' event.  The second argument to the drop event is the DOM
 * element that is dropped on the target:
 *
 * function drophandler(ev, draggable) {
 *    alert(draggable.id + ' was dropped on ' + ev.target.id);
 * }
 *
 * Also, if a draggable element has class "stayinparent", its motion
 * will be restricted to its parent element.
 *
 * ---------------------------------------------------------------------
 * MIT License
 *
 * Copyright (c) 2010 Brian "Beej Jorgensen" Hall <beej@beej.us>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Namespace holder for everything
 */
var beejdnd = (function () {
  /**
   * Information about the drag state
   */
  var dragInfo = {
    element: null, // currently dragged element
    offset: { x: 0, y: 0 }, // mouse offset within the element
    parentOffset: null, // offset of the draggable's parent container
    zindex: "", // stored CSS z-index, if any, of the dragged element
    limited: false, // true if 'limit' should be applied to draggable motion
    limit: { x0: 0, y0: 0, x1: 0, y1: 0 }, // in parent container space, if 'limited' is true
    width: 0, // width of draggable
    height: 0, // height of draggable
  };

  /**
   * Mousedown handler for draggable objects
   *
   * This is only bound to draggable objects, so there's no need to test
   * for that.
   *
   * All the mouse positioning lameness in here is because pageX and pageY
   * are apparently the only cross-browser ways of getting the mouse
   * position.
   */
  function dragstart(e) {
    var position;
    var draggableParent;
    var mxInParent, myInParent; // mouse coords in parent container
    var pageCoords = {};

    getPageCoords(e, pageCoords); // get touch info

    dragInfo.element = e.target;

    // get the mouse coordinates relative to the draggable's parent
    // container:

    dragInfo.parentOffset = $(dragInfo.element).parent().offset();
    mxInParent = pageCoords.pageX - dragInfo.parentOffset.left;
    myInParent = pageCoords.pageY - dragInfo.parentOffset.top;

    // Calculate and save the offset within the draggable element where
    // the mousedown occurred. This will be used later to keep the
    // relative positioning of the dragged object and the mouse during a
    // mouse move:

    position = $(dragInfo.element).position(); // .left and .top in parent container

    dragInfo.offset.x = mxInParent - position.left;
    dragInfo.offset.y = myInParent - position.top;

    // Store the original z-index:

    dragInfo.zindex = $(dragInfo.element).css("z-index");

    // Then set the z-index to something huge so the element appears on
    // top of everything else:

    $(dragInfo.element).css("z-index", "999999");

    // These are useful values to know later:

    dragInfo.width = $(dragInfo.element).width();
    dragInfo.height = $(dragInfo.element).height();

    // check to see if this element has class "stayinparent".
    // if, so, limit the draggable to inside the parent element:

    if ($(dragInfo.element).hasClass("stayinparent")) {
      dragInfo.limited = true;
      dragInfo.limit.x0 = 0;
      dragInfo.limit.y0 = 0;
      dragInfo.limit.x1 =
        $(dragInfo.element).parent().width() - dragInfo.width - 1;
      dragInfo.limit.y1 =
        $(dragInfo.element).parent().height() - dragInfo.height - 1;
    } else {
      dragInfo.limited = false;
    }

    return false;
  }

  /**
   * Mousemove handler
   */
  function drag(e) {
    var mxInParent, myInParent;
    var nx, ny;

    // This is bound to the window, so we have to test to make sure we're
    // currently dragging an object:

    if (dragInfo.element) {
      var pageCoords = {};

      getPageCoords(e, pageCoords); // get touch info

      // current mouse position on the page

      // get the mouse coordinates relative to the draggable's parent
      // container:
      mxInParent = pageCoords.pageX - dragInfo.parentOffset.left;
      myInParent = pageCoords.pageY - dragInfo.parentOffset.top;

      // subtract away the offset within the dragged object that we
      // got in the dragstart() function (comment this out to see what
      // happens when we don't take the offset into account):

      x = mxInParent - dragInfo.offset.x;
      y = myInParent - dragInfo.offset.y;

      // if we're restricting movement:

      if (dragInfo.limited) {
        x = Math.max(x, dragInfo.limit.x0);
        x = Math.min(x, dragInfo.limit.x1);
        y = Math.max(y, dragInfo.limit.y0);
        y = Math.min(y, dragInfo.limit.y1);
      }

      // set the actual position of the dragged element to the mouse
      // position (offset by the drag offset):

      $(dragInfo.element).css({ left: x + "px", top: y + "px" });

      return false;
    }
  }

  /**
   * Mouseup handler
   */
  function drop(e) {
    var x, y, offset;

    if (dragInfo.element) {
      var pageCoords = {};

      getPageCoords(e, pageCoords); // get touch info

      // restore the z-index

      $(dragInfo.element).css("z-index", dragInfo.zindex);

      // test for a droptarget by comparing the mouse coordinates to
      // each droptarget's position and dimensions:

      $(".droptarget").each(function (index, Element) {
        // find the droptarget on the page

        offset = $(Element).offset();

        // convert mouse coordinates into "droptarget space"

        x = pageCoords.pageX - offset.left;
        y = pageCoords.pageY - offset.top;

        // see if it's inbounds:

        if (
          x > 0 &&
          y > 0 &&
          x < $(Element).width() &&
          y < $(Element).height()
        ) {
          // trigger an event
          $(Element).trigger("drop", [dragInfo.element]);
        }
      });

      // no longer dragging:

      dragInfo.element = null;

      return false;
    }
  }

  /**
   * Internal helper function that looks at an event, and transfers
   * the first touch coordinate to pageX and pageY.  It's a hackish
   * way to support touches in the demo.
   *
   * @param ev the jQuery normalized event
   * @param result will hold pageX and pageY
   */
  function getPageCoords(ev, result) {
    var first;

    if (ev.originalEvent.changedTouches != undefined) {
      first = ev.originalEvent.changedTouches[0];
      result.pageX = first.pageX;
      result.pageY = first.pageY;
    } else {
      result.pageX = ev.pageX;
      result.pageY = ev.pageY;
    }
  }

  /**
   * Init the drag-n-drop system
   *
   * Call this after the DOM has loaded--it looks for .draggable elements.
   */
  function init() {
    // clear data
    dragInfo.element = null;

    // set up the mouse handlers on all the draggable objects
    $(".draggable").bind("mousedown", dragstart);
    $(".draggable").bind("touchstart", dragstart);

    // but we'll take mousemove and mouseup events from anywhere if
    // we're dragging:
    $(document).bind("mousemove", drag);
    $(document).bind("touchmove", drag);
    $(document).bind("mouseup", drop);
    $(document).bind("touchend", drop);
  }

  /**
   * Call to shut down the system and unbind the handlers
   */
  function shutdown() {
    $(".draggable").unbind("mousedown", dragstart);
    $(".draggable").unbind("touchstart", dragstart);
    $(document).unbind("mousemove", drag);
    $(document).unbind("touchmove", drag);
    $(document).unbind("mouseup", drop);
    $(document).unbind("touchend", drop);
  }

  // expose public functions
  return {
    init: init,
    shutdown: shutdown,
  };
})(); // end of namespace wrapper
