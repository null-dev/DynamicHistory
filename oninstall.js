/**
 * DynamicHistory by: nulldev
 *
 * OnInstall JS
 */
jQuery(document).ready(function () {
  $("#options_button").click(function () {
    chrome.runtime.openOptionsPage();
  });
});
