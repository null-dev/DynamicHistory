/**
 * Copyright (c) 2018 Andy Bao
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * Background JS
 */

//Check if a tab should have it's history killed by checking it's HTML
function killHistory(tab) {
	//Check if tab is undefined
	if (!tab) return;

	//Immediately check URLs (before we have content script)
	checkPage(tab, null);

	//Inject content script
	if(tab.id != null) {
		if(opt.continuousMatching) {
			chrome.tabs.executeScript(tab.id, {
				file: "dynamicdetection.js"
			}, function() {
				// If you try and inject into an extensions page or the webstore/NTP you'll get an error
				if (chrome.runtime.lastError) {
					console.log("Error injecting dynamic detection script!", chrome.runtime.lastError)
				}
			});
		} else {
			chrome.tabs.executeScript(tab.id, {
				file: "content.js"
			}, function() {
				// If you try and inject into an extensions page or the webstore/NTP you'll get an error
				if (chrome.runtime.lastError) {
					console.log("Error injecting script!", chrome.runtime.lastError)
				}
			});
		}
	}
}

//Check a page if it matches the history filters
function checkPage(tab, theHtml) {
	if(tab.url == null) return;
	let pageDomain = extractDomain(tab.url);
	let result = isDangerous(tab, theHtml);
	if(result.result) {
		//Dangerous
		removeHistory(tab.url);
		if(tab.id != null) {
			markPage(tab);
			releaseTabMapEntry();
			tabMap[tab.id] = {
				url: tab.url,
				reason: result.reason,
				target: result.target,
				status: true
			};
		}
	} else {
		//Safe
		if(tab.id != null) {
			releaseTabMapEntry();
			tabMap[tab.id] = {
				url: tab.url,
				reason: result.reason,
				target: result.target,
				status: false
			};
			releaseTab(tab);
		}
	}

	//Update popup
	updatePopup();
}

//Check HTML
function isDangerous(tab, theHtml) {
	//Get domain
	if(tab.url == null) return {
		result: false,
		reason: "Tab URL is null"
	};

	let pageDomain;
	if(opt.doCheckEntireUrl)
		pageDomain = tab.url
	else
		pageDomain = extractDomain(tab.url);

	//Test ignore domains
	if (opt.doRegexSafeDomains) {
		let result = batchTest(safeDomains, pageDomain);
		if (result.result)
			return {result: false, reason: "Domain matches safe domain regex: ", target: result.item};
	} else {
		let result = contains(safeDomains, pageDomain);
		if (result.result)
			return {result: false, reason: "Domain is safe domain: ", target: result.item};
	}

	//Test danger domains
	if (opt.doRegexDangerDomains) {
		let result = batchTest(dangerDomains, pageDomain);
		if (result.result)
			return {result: true, reason: "Domain matches dangerous domain regex: ", target: result.item};
	} else {
		let result = contains(dangerDomains, pageDomain);
		if (result.result)
			return {result: true, reason: "Domain is dangerous domain: ", target: result.item};
	}

	if(theHtml != null) {
		//Test keywords
		if(opt.doRegexDangerKeywords) {
			let result = batchTest(badWords, theHtml);
			if (result.result)
				return {result: true, reason: "HTML matches dangerous keyword regex: ", target: result.item};
		} else {
			let result = stringContainsAnyStringsOfArrayOfStrings(theHtml, badWords);
			if(!result.result) {
				result = stringContainsAnyStringsOfArrayOfStrings(theHtml, escapedBadWords);
				if(result.result)
					return {result: true, reason: "Dangerous keyword (escaped) found on page: ", target: result.item};
			} else {
				return {result: true, reason: "Dangerous keyword found on page: ", target: result.item};
			}
		}
	}

	return {result: false, reason: "Page does not match any dangerous keywords or domains"};
}

//Remove the history for a url
function removeHistory(url) {
	let details = {url:url};
	chrome.history.deleteUrl(details);
}

let injectedTabIds = [];

let tabMap = {};
//Mark a page as dangerous
function markPage(tab) {
	if(opt.doPrefix) {
		chrome.tabs.executeScript(tab.id, {
			code: "void function(a){if(!document.title.startsWith(a)) document.title = a + document.title;}(\"" + escapeQuotes(opt.prefixText) + "\");"
		});
	}
	if(opt.doOutline) {
		chrome.tabs.executeScript(tab.id, {
			code: "document.body.style.border = '5px solid " + opt.outlineColor + "';"
		});
	}
	if(opt.injectCss) {
		let cssObj = { code: opt.cssCode };
		let afterRemove = function() {
			chrome.tabs.insertCSS(tab.id, cssObj);
		};

		if(isChrome) {
			//Not yet implemented: https://bugs.chromium.org/p/chromium/issues/detail?id=608854
			afterRemove();
		} else {
			chrome.tabs.removeCSS(tab.id, cssObj, afterRemove);
		}
	}
	if(opt.injectJs) {
		let dhVar = "window._DynamicHistory_" + tab.id;
		chrome.tabs.executeScript(tab.id, {
			code: "void function() {if(" + dhVar + " == null){" + dhVar + " = 1;" + opt.jsCode + "}}();"
		});
	}
	updateBadge(tab, true);
}

function escapeQuotes(js) {
	return js.replace('"', '\\"');
}

//Declare a tab as safe now
function releaseTab(tab) {
	//TODO Possible revert CSS changes?
	/*if(opt.doOutline) {
		chrome.tabs.executeScript(tab.id, {
			code: "document.body.style.border = null;"
		});
	}
	if(opt.injectCss) {
		//TODO Not yet implemented on Chrome: https://bugs.chromium.org/p/chromium/issues/detail?id=608854
		if(!isChrome)
			chrome.tabs.removeCSS(tab.id, { code: opt.cssCode });
	}*/
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
				let tempRegexIndexer = regexString.replace("\/", "aa");
				let firstSlash = tempRegexIndexer.indexOf("/");
				let secondSlash = tempRegexIndexer.indexOf("/", firstSlash + 1);
				if(firstSlash < 0)
					firstSlash = -1;
				if(secondSlash < 0)
					secondSlash = tempRegexIndexer.length;

				let realRegex = regexString.substring(firstSlash + 1, secondSlash);
				let flags = regexString.substring(secondSlash + 1);

				regex = new RegExp(realRegex, flags);
				regexCache[regexString] = regex;
			}

			if (regex.test(string)) return {
				item: regexString,
				result: true
			};
		} catch (e) {
			console.log("Regex error!", e);
		}
	}
	return {result: false};
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
			return {result: true, item: a[i]};
		}
	}
	return {result: false};
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
			return {result: true, item: obj[i]};
		}
	}
	return {result: false};
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
let historyProcessor;

let opt; //Master options variable

//Load settings
function loadSettings() {
	storage().get(DEFAULT_OPTIONS(), function(items) {
		//Clear regex cache
		regexCache = [];

		dangerDomains = items.dangerDomains.split(splitElement);
		cleanArray(dangerDomains, '');
		safeDomains = items.safeDomains.split(splitElement);
		cleanArray(safeDomains, '');
		badWords = items.badWords.split(splitElement);
		cleanArray(badWords, '');
		historyProcessor = items.historyProcessor;

		//Escape bad words
		escapedBadWords = [];
		let i = badWords.length;
		while(i--) {
			escapedBadWords.push(escapeHtml(badWords[i]));
		}

		opt = items;
	});
}
//Settings update and document body listener
chrome.runtime.onMessage.addListener(function(request, sender) {
	if(request.action === "updateSettings") {
		loadSettings();
	} else if (request.action === "getSource") {
		let scanTarget;
		if(opt.scanAll)
			scanTarget = request.source;
		else
			scanTarget = request.textContent;

		checkPage(sender.tab, scanTarget);
	} else if(request.action === "getTabInfo") {
		updatePopup();
	}
});

function updatePopup() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		//No active tab!
		if(tabs.length <= 0) return;

		let entry = tabMap[tabs[0].id];

		if(entry != null)
			chrome.runtime.sendMessage({
				action: "updateTabInfo",
				reason: entry.reason,
				target: entry.target,
				status: entry.status
			});
		else
			chrome.runtime.sendMessage({
				action: "updateTabInfo",
				reason: "DynamicHistory is still processing this page",
				status: false
			});
	});
}

//Add listener for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	//Ignore if only the title updated (we modify the title sometimes so we might get into a loop)
	let isTitleUpdate = changeInfo.title != null;
	for(let property in changeInfo) {
		if(property != "title" && changeInfo[property] != null) {
			isTitleUpdate = false;
		}
	}

	if(!isTitleUpdate)
		killHistory(tab);
});

function releaseTabMapEntry(tabId) {
	if(tabMap[tabId] != null) {
		if(tabMap[tabId].status)
			removeHistory(tabMap[tabId].url);

		tabMap[tabId] = undefined;
	}
}

chrome.tabs.onRemoved.addListener(function(tabId) {
	releaseTabMapEntry(tabId);
});

chrome.tabs.onCreated.addListener(function(tab) {
	killHistory(tab);
});
chrome.history.onVisited.addListener(function(item) {
	//Kill history with virtual tab
	killHistory({url: item.url});

	//Process history
	triggerHistoryProcessor(item);
});

window.addEventListener('message', function(event) {
	let data = event.data;
	if(data.apiItem.removalQueued) {
		console.debug("History processor: Removing history item.", data.apiItem);
		chrome.history.deleteUrl({url: data.item.url});
	} else if(data.apiItem.url != data.item.url) {
		console.debug("History processor: Changing URL from '" + data.item.url + "' to '" + data.apiItem.url + "'.");
		chrome.history.deleteUrl({url: data.item.url});
		chrome.history.addUrl({url: data.apiItem.url});
	}
});

let sandboxIframe = null;
function triggerHistoryProcessor(item) {
	//Do not execute empty history processor
	if(historyProcessor.trim().length <= 0)
		return;

	if(sandboxIframe == null)
		sandboxIframe = document.getElementById("sandbox");

	let apiItem = {
		url: item.url,
		title: item.title,
		lastVisitTime: item.lastVisitTime,
		visitCount: item.visitCount,
		typedCount: item.typedCount
	};

	sandboxIframe.contentWindow.postMessage({code: historyProcessor, apiItem: apiItem, item: item}, '*');
}

function updateBadge(tab, dangerous) {
	if(opt.doBadge) {
		if(dangerous) {
			chrome.browserAction.setBadgeBackgroundColor({color:opt.badgeColor, tabId: tab.id});
			chrome.browserAction.setBadgeText({text:opt.badgeText, tabId: tab.id});
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
	if (isChrome)
		chrome.tabs.create({url: "oninstall.html"});
	else
		chrome.runtime.openOptionsPage();
}
if(localStorage.getItem('install_time') == null)
	chrome.storage.local.get({installTime: -1}, function(items) {
		if(items.installTime === -1)
			installNotice();
	});
