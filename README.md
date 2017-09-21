# DynamicHistory
*Automagically delete history based on what's on the page!*

## About
DynamicHistory automagically deletes history for a page if a specified set of words are found on it. It will however not remove pages from the "Recent Pages/Tabs" list in your browser. It can also blacklist and whitelist domains from your history.

## Notes
This extension functions properly on both Chrome and Firefox. It is a hybrid WebExtension that will detect the browser type automatically upon installation. The project is also essentially complete so unless some bugs crop up, it will be receiving minimal updates.

## Webstore links
[![ChromeWebStoreButton](http://nulldev.xyz/projects/img/chrome-web-store.png)](https://chrome.google.com/webstore/detail/dynamichistory/ehkdegpnplleadlmjoaidmjiabocgpok) [![AddonsMozillaOrgButton](https://addons.cdn.mozilla.net/static/img/addons-buttons/AMO-button_1.png)](https://addons.mozilla.org/en-US/firefox/addon/dynamichistory/)

## Chrome installation
### From binary:
1. Download the extension from here: https://csg.nd.vu/s3/d/DynamicHistory.crx?d
2. Open the Chrome "extensions" page by copying and pasting this into the navigation bar: `chrome://extensions/`
3. Drag the extension downloaded in step 1 onto the extensions page
4. Disable "History Sync" if you are signed into chrome by following the instructions in the tab that opens up.

### From source:
1. Git clone the repo with: `git clone https://github.com/null-dev/DynamicHistory`
2. Open the Chrome "extensions" page by copying and pasting this into the navigation bar: `chrome://extensions/`
3. Drag the folder that was created in step 1 from the git clone onto the extensions page (or click "Load unpacked extension..." at the top of the page and browse to the cloned folder)
4. Disable "History Sync" if you are signed into chrome by following the instructions in the tab that opens up.

## Firefox installation
### From source:
1. Git clone the repo with: `git clone https://github.com/null-dev/DynamicHistory`
2. Visit "about:debugging#addons" in your browser (copy and paste it into the URL bar).
3. Click the "Load Temporary Add-on" button and choose the any file in the repo.

## Configuration
Here is a list of configuration options and their purposes. Note that `Danger Domains`, `Safe Domains` and `Dangerous Keywords` are all split by newlines.

`Dangerous domains`: The domains to always delete history on. Remember that `www.example.com` and `example.com` are different domains to remember to add both if needed.

`Safe domains`: The domains to never delete history on. Same warning as above about the `www` part.

`Dangerous keywords`: Any page with any of the specified words on it will have it's history deleted (unless it's in the `Safe Domains` section).

`Regex 'Dangerous domains'`: Use regex to match for dangerous domains.

`Regex 'Safe domains'`: Use regex to match for safe domains.

`Regex 'Dangerous keywords'`: Use regex to match for dangerous keywords.

`Append prefix`: Whether or not to add a prefix to the start of any page that has it's history removed. **THIS IS BUGGY AND WILL NOT WORK ON ALL PAGES**.

`Outline page`: Whether or not to add a colored border to any page that has it's history removed. **MAY NOT BE FULLY VISIBLE ON SOME RARE COMPLEX PAGES**.

`Show badge`:  Whether or not to show a badge beside the DynamicHistory icon when viewing a tab that has it's history removed.

`Prefix text`: The text to be used as a prefix if `Append Prefix` is enabled.

`Outline color`: The color of the outline if `Outline Page` is enabled.

`Badge text`: The text of the badge to show if "Show Badge" is enabled.

`Badge color`: The color of the badge to show if "Show Badge" is enabled.

## Known bugs
- History is not removed when Chrome's History Sync is enabled. This is a bug on Chrome's side and there is no viable workaround (as far as I know). If this is bothering you, you are welcome to help by voting for this issue here: https://code.google.com/p/chromium/issues/detail?id=395955
- Append prefix does not work (at all) on pages that use dynamic titles. The only know workaround is to append the text again every couple of seconds but since this may affect performance, it will not be implemented.
