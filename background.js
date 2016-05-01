/**
 * DynamicHistory by: nulldev
 *
 * Core extension JS
 */
 //Check if a tab should have it's history killed
function killHistory(tab) {
  //Check if tab is undefined
  if (!tab) {
    return;
  }
  chrome.tabs.executeScript(tab.id, {
      file: "content.js"
    }, function() {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        console.log("[DynamicHistory] Error injecting script!")
      }
    });
}
//Check a page if it matches the history filters
function checkPage(tab, theHtml) {
  var pageDomain = extractDomain(tab.url);
  if(!contains(safeDomains, pageDomain)
    && (contains(dangerDomains, pageDomain)
      || stringContainsAnyStringsOfArrayOfStrings(theHtml, badWords)
      || stringContainsAnyStringsOfArrayOfStrings(theHtml, escapedBadWords))) {
		  //Dangerous
        removeHistory(tab.url);
        markPage(tab);
        tabMap[tab.id] = tab.url;
  } else {
	  //Safe
	  releaseTab(tab);
  }
}
function removeHistory(url) {
  var details = {url:url};
  chrome.history.deleteUrl(details);
}
var tabMap = {};
//Mark a page as dangerous
function markPage(tab) {
  if(doPrefix) {
    chrome.tabs.executeScript(tab.id, {
      code: "document.title = \"" + prefixText + "\" + document.title"
    });
  }
  if(doOutline) {
    chrome.tabs.executeScript(tab.id, {
      code: "document.body.style.border = '5px solid " + outlineColor + "';"
    });
  }
  updateBadge(tab, true);
}
//Declare a tab as safe now
function releaseTab(tab) {
	 updateBadge(tab, false);
}
//Entity map for html escaping
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};
//Escape html
function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}
//Extract domain from url
function extractDomain(url) {
  var domain;
  //find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }

  //find & remove port number
  domain = domain.split(':')[0];

  return domain;
}
//Some utility contains stuff
function contains(a, obj) {
  var i = a.length;
  while (i--) {
   if (a[i] === obj) {
     return true;
   }
 }
 return false;
}
function stringsContainString(a, obj) {
  var i = a.length;
  while (i--) {
   if (a[i].indexOf(obj) > -1) {
     return true;
   }
 }
 return false;
}
function stringContainsAnyStringsOfArrayOfStrings(a, obj) {
  var i = obj.length;
  while(i--) {
    if(a.indexOf(obj[i]) > -1) {
      return true;
    }
  }
  return false;
}
function cleanArray(arr, deleteValue) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == deleteValue) {
      arr.splice(i, 1);
      i--;
    }
  }
  return this;
};
//Global variables
var splitElement = "\n";
var dangerDomains;
var safeDomains;
var badWords;
var escapedBadWords;
var doPrefix;
var doOutline;
var prefixText;
var outlineColor;
var doBadge;
var badgeColor;
var badgeText;
//Load settings
function loadSettings() {
  chrome.storage.sync.get({
    dangerDomains: '',
    safeDomains: '',
    badWords: '',
    doPrefix: true,
    doOutline: true,
    doBadge: true,
    prefixText: '[DH] ',
    outlineColor: '#ff0000',
    badgeText: '!',
    badgeColor: '#ff0000'
  }, function(items) {
    dangerDomains = items.dangerDomains.split(splitElement);
    cleanArray(dangerDomains, '');
    safeDomains = items.safeDomains.split(splitElement);
    cleanArray(safeDomains, '');
    badWords = items.badWords.split(splitElement);
    cleanArray(badWords, '');
    doPrefix = items.doPrefix;
    doOutline = items.doOutline;
    doBadge = items.doBadge;
    prefixText = items.prefixText;
    outlineColor = items.outlineColor;
    badgeText = items.badgeText;
    badgeColor = items.badgeColor;
    //Escape bad words
    escapedBadWords = [];
    var i = badWords.length;
    while(i--) {
      escapedBadWords.push(escapeHtml(badWords[i]));
    }
  });
}
//Listener for receiving the HTML body from the content script
function onTabUpdate(request, sender) {
    if (request.action == "getSource") {
      checkPage(sender.tab, request.source);
    }
}
chrome.runtime.onMessage.addListener(onTabUpdate);
//Listener for updating settings
chrome.runtime.onMessage.addListener(function(request, sender) {
  if(request.action == "updateSettings") {
    loadSettings();
  }
});
//Add listener for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.url) {
    if(tabMap[tabId]) {
      removeHistory(tabMap[tabId]);
      tabMap[tabId] = undefined;
    }
  }
  if(changeInfo.status == "complete") {
    killHistory(tab);
  }
});
chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
   killHistory(tab);
});
function updateBadge(tab, dangerous) {
	if(doBadge) {
		if(dangerous) {
			chrome.browserAction.setBadgeBackgroundColor({color:badgeColor, tabId: tab.id});
			chrome.browserAction.setBadgeText({text:badgeText, tabId: tab.id});
		} else {
			chrome.browserAction.setBadgeText({text:'', tabId: tab.id});
		}
	}
}
//Load settings
loadSettings();
//Check install
function install_notice() {
    if (localStorage.getItem('install_time'))
        return;

    var now = new Date().getTime();
    localStorage.setItem('install_time', now);
    chrome.tabs.create({url: "oninstall.html"});
}
install_notice();
//Open options page onclick
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.runtime.openOptionsPage();
});
