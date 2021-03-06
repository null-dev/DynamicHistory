window.addEventListener('message', function(event) {
	try {
		let item = event.data.apiItem;

		//Add API functions
		item.removalQueued = false;
		item.remove = function() {
			item.removalQueued = true;
		};

		eval(event.data.code);

		//Clear API functions
		item.remove = null;

		event.source.postMessage(event.data, event.origin);
	} catch(e) {
		console.error("Could not run history processor!", e);
	}
});
