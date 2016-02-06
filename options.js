/**
 * DynamicHistory by: nulldev
 *
 * Core JS for Settings
 */
//Load settings
function loadSettings() {
  chrome.storage.sync.get({
    dangerDomains: '',
    safeDomains: '',
    badWords: '',
    doPrefix: true,
    doOutline: true,
    prefixText: '[DH] ',
    outlineColor: '#ff0000'
  }, function(items) {
    $('#danger_domains').val(items.dangerDomains);
    $('#safe_domains').val(items.safeDomains);
    $('#bad_words').val(items.badWords);
    $('#do_prefix').prop('checked', items.doPrefix);
    $('#do_outline').prop('checked', items.doOutline);
    $('#prefix_text').val(items.prefixText);
    $('#outline_color').val(items.outlineColor);
  });
}
//Save settings
function saveSettings() {
  chrome.storage.sync.set({
    dangerDomains: $('#danger_domains').val(),
    safeDomains: $('#safe_domains').val(),
    badWords: $('#bad_words').val(),
    doPrefix: $('#do_prefix').prop('checked'),
    doOutline: $('#do_outline').prop('checked'),
    prefixText: $('#prefix_text').val(),
    outlineColor: $('#outline_color').val()
  }, function() {
    //Update background page
    chrome.runtime.sendMessage({
        action: "updateSettings"
    });
  });
}
//Update disabled inputs and stuff
function updateInputStates() {
  $('#prefix_text').attr("disabled", !$("#do_prefix").is(":checked"));
  $('#outline_color').attr("disabled", !$("#do_outline").is(":checked"));
}
//Fires everytime something is changed. Saves settings and updates disabled inputs
function saveAndUpdate() {
  saveSettings();
  updateInputStates();
}
jQuery(document).ready(function () {
  //Allows resetting of all settings
  $("#clear").click(function () {
    if (confirm('Are you sure you want to reset all settings to their defaults? This action is irreversable!')) {
      chrome.storage.sync.clear(function() {
        location.reload();
      });
    }
    });
    //Bind auto-save listeners
   $("input[type=checkbox]").click(function () {
     saveAndUpdate();
   });
   $('input[type=text]').on('input propertychange', function() {
     saveAndUpdate();
   });
   $('input[type=color]').on('input', function() {
     saveAndUpdate();
   });
   $("textarea").on('change keyup paste', function() {
    saveAndUpdate();
   });
   $( window ).unload(function() {
    saveAndUpdate();
   });
   //Load initial settings
   loadSettings();
});
