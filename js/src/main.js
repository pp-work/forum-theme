;(function ($, window, document, undefined) {
  'use strict';

  window.icheck = {
    autoInit: false
  , autoAjax: false
  };

  $(document).on('ready ajaxSuccess', function () {
    // Initialize or re-initialize iCheck
    $('input:not(.icheck-input)').icheck();
  });

  $.expr[':'].external = function(obj){
    return !obj.href.match(/^mailto\:/)
           && (obj.hostname != location.hostname)
           && !obj.href.match(/^javascript\:/)
           && !obj.href.match(/^$/)
  };

  $.expr[':'].internal = function(obj){
    return $(obj).attr('href') !== undefined && !$.expr[':'].external(obj);
  };

  $(document).ready(function() {
    // Open external links in new window/tab
    $('.Message a:external').attr('target', '_blank');
    $('.Message a:internal').attr('target', '');

    // Create anchors for footnotes so we can use offset for navbar
    $('.footnotes ol li').each(function() {
        $(this).children('p').prepend('<a id="' + this.id + '" class="anchor" />');
        $(this).removeAttr('id');
    });

    // Special case for links from footnotes back to main text
    $('a[href^="#fnref"]').click(function(e) {
      var target = this.hash.replace(/#/, '');

      // Use document.getElementById so we don't need to escape footnote IDs with : in them
      target = document.getElementById(target);
      window.location.hash = this.hash;
      $('html,body').animate({
        scrollTop: $(target).offset().top - 65
      });
      return false;

    });
  });

  $(window).load(function() {

    if (window.location.hash.substring(0, 6) == "#fnref") {
      var target = window.location.hash.replace(/#/, '');
      target = document.getElementById(target);

      $('html,body').animate({
        scrollTop: $(target).offset().top - 65
      });
      return false;

    } else if (window.location.hash != "") {
      window.location.href = window.location.hash;
    }

  });

  $(document).on('ready', function () {

    //Click event to scroll to top
    $('.scrollToTop').on('click', function(event) {
      if ($(event.target).is('.navbar, .navbar-header, .navbar-collapse')) {
        $('html, body').animate({scrollTop : 0}, 400);
        return false;
      }
    });
  });

  $(function () {

    // Programmatically hide buttons that are supposed to be hidden. This
    // ensures that the initial display state is correctly stored and applied
    // if the button is later shown.
    $('.Button.Hidden').removeClass('Hidden').hide();

    // Attach spinner to the .InProgress element in flyouts
    $(document).on('click', '.ToggleFlyout', function (e) {
      $('.InProgress', e.currentTarget).spin({
          lines  : 11
        , radius : 5
        , length : 5
        , width  : 2
        });
    });

    // Close the cog menu when user clicks outside of it
    $(document).on('click', function () {
      $('.Flyout').hide();
      $('.ToggleFlyout.OptionsMenu.Open').removeClass('Open');
    });

    // Attach spinner to the .TinyProgress element when editing comment
    $(document).on('click', '.EditComment', function (e) {
      $('.TinyProgress', $(e.currentTarget).closest('.Item'))
        .empty()
        .spin({
          lines  : 9
        , radius : 3
        , length : 3
        , width  : 2
        });
    });

    // Attach spinner to the .MorePager when loading more content
    $(document).on('click', '.MorePager a', function (e) {
      $(e.currentTarget).parent()
        .spin({
          lines  : 9
        , radius : 3
        , length : 3
        , width  : 2
        });
    });

    var overlay = '.Overlay'
      , dialog  = '> .Popup';

    /**
     * Show the modal backdrop, but hide the actual modal dialog while it's
     * loading.
     *
     * @this {overlay}
     */
    var preparePopup = function () {
      var $overlay  = $(this)
        , $backdrop = $('<div class="backdrop fade">');

      // Lock body scrolling
      $('body').addClass('modal-open');

      // Prepare dialog animation
      $(dialog, $overlay).addClass('fade');

      // Attach a backdrop to the overlay if one doesn't already exist
      if (!$overlay.data('backdrop')) {
        $overlay.data('backdrop', $backdrop);

        // Append the modal backdrop to overlay
        $overlay.append($backdrop);
      }

      // Fake async addition of class
      setTimeout(function () {
        // Fade in backdrop and add spinner
        $backdrop.addClass('in');
        /* Why is there a spinner here?
        .spin({
          lines  : 11
        , radius : 10
        , length : 10
        , width  : 4
        });*/
      }, 0);
    };

    /**
     * Fade in the modal dialog when it's time to reveal it.
     *
     * @this {overlay}
     */
    var revealPopup = function () {
      var $overlay  = $(this)
        , $backdrop = $overlay.data('backdrop');

      // Fade in modal dialog
      $(dialog, $overlay).addClass('in');

      if ($backdrop.length) {
        // Remove spinner from modal backdrop
        $backdrop.spin(false);
      }
    };

    /**
     * When it's time to close the modal, first fade out the modal dialog,
     * then fade out the modal backdrop, and lastly remove the entire modal
     * from the DOM.
     *
     * @this {overlay}
     */
    var closePopup = function () {
      var $overlay  = $(this)
        , $backdrop = $overlay.data('backdrop');

      // Fade out the modal dialog
      $(dialog, $overlay).removeClass('in');

      setTimeout(function () {
        if ($backdrop.length) {
          // Fade out the backdrop
          $backdrop.removeClass('in');
        }

        // Re-enable body scrolling
        $('body').removeClass('modal-open');
      }, 150);

      setTimeout(function () {
        // Remove overlay from the DOM
        $(overlay).remove();
      }, 300);
    };

    $(document)
      .on('popupLoading', function () {
        $(overlay).each(preparePopup);
      })
      .on('popupReveal', function () {
        $(overlay).each(revealPopup);
      })
      .on('popupClose', function (e) {
        $(overlay).each(closePopup);
      });

    var confirmPopupEls = [
      'a.Delete'
    , 'a.DeleteComment'
    , 'a.DeleteFile'
    , 'a.PopConfirm'
    , 'a.ClearConversation'
    , 'ul#DP_Remove a'
    ];

    // When only a confirmation modal is shown, the "popupLoading" and
    // "popupReveal" events are never triggered. Manually trigger them to make
    // sure that the modal is actually shown.
    $(document).on('click', confirmPopupEls.join(), function (e) {
      $(document).trigger('popupLoading');

      setTimeout(function () {
        $(document).trigger('popupReveal');
      }, 150);
    });

  });

  /**
   * Override the popup.close method to ensure that the modal isn't immdiately
   * removed from the DOM upon closing the dialog. This version of the method
   * instead lets it be up to listeners to actually close the modal, just like
   * it's the reponsibility of listeners to show the modal.
   *
   * @param  {Object} settings
   * @param  {Object} response
   * @return {bool}
   */
  $.popup.close = function (settings, response) {
    $(document).unbind('keydown.popup');
    $('#' + settings.popupId).trigger('popupClose');

    return false;
  };

})(jQuery, window, document);
