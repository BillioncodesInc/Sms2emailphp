// Minimal, safe modal behavior (Bootstrap 3)
// - No dimming (handled via CSS + options)
// - No auto-focus
// - No pointer-events hacks
// - Cleans up any accidental backdrops

$(function () {
  // Initialize both modals with backdrop disabled (no dim)
  try {
    $('#myModal, #myModal1').modal({
      backdrop: false,
      show: false,
      keyboard: true
    });
  } catch (e) {
    // ignore if modal plugin not ready yet
  }

  // Ensure no lingering backdrops are left around
  $(document).on('show.bs.modal', '#myModal, #myModal1', function () {
    $('.modal-backdrop').remove();
  });

  $(document).on('shown.bs.modal', '#myModal, #myModal1', function () {
    // Do not auto-focus anything
    // Remove any leftover backdrops just in case
    $('.modal-backdrop').remove();
  });

  $(document).on('hidden.bs.modal', '#myModal, #myModal1', function () {
    // Cleanup
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open').css('padding-right', '');
  });

  // Fully disable Bootstrap's enforceFocus to avoid odd focus behavior
  if ($.fn.modal && $.fn.modal.Constructor) {
    $.fn.modal.Constructor.prototype.enforceFocus = function () {};
  }
});
