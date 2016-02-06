/**
 * DynamicHistory by: nulldev
 *
 * Extension Content Script Helper
 */
chrome.runtime.sendMessage({
  action: "getSource",
  source: document.documentElement.outerHTML
});
