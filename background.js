/**
 * DynamicHistory by: nulldev
 *
 * Core extension JS
 */
//Check if a tab should have it's history killed
function killHistory(tab) {
	//Check if tab is undefined
	if (!tab) return;

	//Inject content script
	chrome.tabs.executeScript(tab.id, {
		file: "content.js"
	}, function() {
		// If you try and inject into an extensions page or the webstore/NTP you'll get an error
		if (chrome.runtime.lastError) {
			console.log("Error injecting script!", chrome.runtime.lastError)
		}
	});
}
//Check a page if it matches the history filters
function checkPage(tab, theHtml) {
	let pageDomain = extractDomain(tab.url);
	if(isDangerous(tab, theHtml)) {
		//Dangerous
		removeHistory(tab.url);
		markPage(tab);
		tabMap[tab.id] = tab.url;
	} else {
		//Safe
		releaseTab(tab);
	}
}

//Check HTML
function isDangerous(tab, theHtml) {
	//Get domain
	let pageDomain;
	if(doCheckEntireUrl)
		pageDomain = tab.url
	else
		pageDomain = extractDomain(tab.url);

	//Test ignore domains
	if (doRegexSafeDomains) {
		if (batchTest(safeDomains, pageDomain))
			return false;
	} else {
		if(contains(safeDomains, pageDomain))
			return false;
	}

	//Test danger domains
	if (doRegexDangerDomains) {
		if (batchTest(dangerDomains, pageDomain))
			return true;
	} else {
		if(contains(dangerDomains, pageDomain))
			return true;
	}

	//Test keywords
	if(doRegexDangerKeywords) {
		if(batchTest(badWords, theHtml))
			return true;
	} else {
		if(stringContainsAnyStringsOfArrayOfStrings(theHtml, badWords)
			|| stringContainsAnyStringsOfArrayOfStrings(theHtml, escapedBadWords))
			return true;
	}

	return false;
}

//Remove the history for a url
function removeHistory(url) {
	let details = {url:url};
	chrome.history.deleteUrl(details);
}
let tabMap = {};
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
let entityMap = {
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

//Test a bunch of regexes against a string
let regexCache = {};
function batchTest(regexes, string) {
	for (let i = 0; i < regexes.length; i++) {
		try {
			let regexString = regexes[i];

			//Find regex in cache
			let regex = regexCache[regexString];
			if(regex == null) {
				regex = new RegExp(regexString);
				regexCache[regexString] = regex;
			}

			if (regex.test(string)) return true;
		} catch (e) {
			console.log("Regex error!", e);
		}
	}
	return false;
}

//Extract domain from url
function extractDomain(url) {
	let domain;
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
	let i = a.length;
	while (i--) {
		if (a[i] === obj) {
			return true;
		}
	}
	return false;
}
function stringsContainString(a, obj) {
	let i = a.length;
	while (i--) {
		if (a[i].indexOf(obj) > -1) {
			return true;
		}
	}
	return false;
}
function stringContainsAnyStringsOfArrayOfStrings(a, obj) {
	let i = obj.length;
	while(i--) {
		if(a.indexOf(obj[i]) > -1) {
			return true;
		}
	}
	return false;
}
function cleanArray(arr, deleteValue) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == deleteValue) {
			arr.splice(i, 1);
			i--;
		}
	}
	return this;
};
//Global variables
let splitElement = "\n";
let dangerDomains;
let safeDomains;
let badWords;
let escapedBadWords;

let doRegexDangerDomains;
let doRegexSafeDomains;
let doRegexDangerKeywords;
let doCheckEntireUrl;

let doPrefix;
let doOutline;
let doBadge;

let prefixText;
let outlineColor;
let badgeColor;
let badgeText;
//Get proper storage mechanism
function storage() {
	return chrome.storage.sync || chrome.storage.local;
}
//Load settings
function loadSettings() {
	storage().get({
		dangerDomains: '',
		safeDomains: '',
		badWords: '',

		doRegexDangerDomains: false,
		doRegexSafeDomains: false,
		doRegexDangerKeywords: false,
		doCheckEntireUrl: false,

		doPrefix: true,
		doOutline: true,
		doBadge: true,

		prefixText: '[DH] ',
		outlineColor: '#ff0000',
		badgeText: '!',
		badgeColor: '#ff0000'
	}, function(items) {
		//Clear regex cache
		regexCache = [];

		dangerDomains = items.dangerDomains.split(splitElement);
		cleanArray(dangerDomains, '');
		safeDomains = items.safeDomains.split(splitElement);
		cleanArray(safeDomains, '');
		badWords = items.badWords.split(splitElement);
		cleanArray(badWords, '');

		doRegexDangerDomains = items.doRegexDangerDomains;
		doRegexSafeDomains = items.doRegexSafeDomains;
		doRegexDangerKeywords = items.doRegexDangerKeywords;
		doCheckEntireUrl = items.doCheckEntireUrl;

		doPrefix = items.doPrefix;
		doOutline = items.doOutline;
		doBadge = items.doBadge;

		prefixText = items.prefixText;
		outlineColor = items.outlineColor;
		badgeText = items.badgeText;
		badgeColor = items.badgeColor;

		//Escape bad words
		escapedBadWords = [];
		let i = badWords.length;
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

function installNotice() {
	//Update install time
	let now = new Date().getTime();
	chrome.storage.local.set({installTime: now}, function() {});

	//If we are using chrome, notify the user of the chrome bug, otherwise open options page
	if (typeof browser === "undefined")
		chrome.tabs.create({url: "oninstall.html"});
	else
		chrome.runtime.openOptionsPage();
}
if(localStorage.getItem('install_time') == null)
	chrome.storage.local.get({installTime: -1}, function(items) {
		if(items.installTime === -1)
			installNotice();
	});

//Open options page onclick
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.runtime.openOptionsPage();
});
