void function() {
	//Do not inject twice
	if(window._DynamicHistory_observer != null) return;

	let config = {
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

	let parser = new DOMParser(); 

	let postChange = function() {
		//TODO It would be preferable to deduplicate this code
		let clonedDocument = parser.parseFromString(document.documentElement.outerHTML, "text/html");

		//Remove script/style nodes
		let excludedNodes = clonedDocument.querySelectorAll("script, style, object, video, audio, img, source");
		for(let i = 0; i < excludedNodes.length; i++) {
			let thisNode = excludedNodes[i];
			thisNode.remove();
		}

		chrome.runtime.sendMessage({
			action: "getSource",
			source: document.documentElement.outerHTML,
			textContent: document.title + clonedDocument.documentElement.textContent
		});
	};


	postObserver();
}();

