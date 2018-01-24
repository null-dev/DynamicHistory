void function() {
	//Do not inject twice
	if(window._DynamicHistory_observer != null) return;

	var config = {
		attributes: true,
		childList: true,
		characterData: true,
		subtree: true
	};

	var postObserver = function() {
		window._DynamicHistory_observer.observe(document.body, config);

		//Post change immediately
		postChange();
	};

	window._DynamicHistory_observer = new MutationObserver(function(mutations) {
		window._DynamicHistory_observer.disconnect();

		//Maximum one change per 0.5s
		setTimeout(postObserver, 500);

		postChange();
	});

	let postChange = function() {
		//TODO It would be preferable to deduplicate this code
		let clonedDocument = document.documentElement.cloneNode(true);

		//Remove script/style nodes
		let excludedNodes = clonedDocument.querySelectorAll("script, style");
		for(let i = 0; i < excludedNodes.length; i++) {
			excludedNodes[i].remove();
		}

		chrome.runtime.sendMessage({
			action: "getSource",
			source: document.documentElement.outerHTML,
			textContent: document.title + clonedDocument.textContent
		});
	};


	postObserver();
}();

