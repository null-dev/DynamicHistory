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
		let excludedNodes = clonedDocument.querySelectorAll("script, style, object, video, audio, img, source");
		for(let i = 0; i < excludedNodes.length; i++) {
			let thisNode = excludedNodes[i];
			thisNode.remove();
			// Browser does not unload video after removal from DOM
			// We have to unload it ourselves :(
			try { thisNode.pause(); } catch(e) {}
			try { thisNode.src = ""; } catch(e) {}
		}

		chrome.runtime.sendMessage({
			action: "getSource",
			source: document.documentElement.outerHTML,
			textContent: document.title + clonedDocument.textContent
		});
	};


	postObserver();
}();

