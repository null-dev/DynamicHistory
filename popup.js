chrome.runtime.onMessage.addListener(function(request, sender) {
	if(request.action == "updateTabInfo") {
		let status;
		if(request.status) {
			status = "DynamicHistory is hiding this page's history!";
		} else {
			status = "DynamicHistory is NOT hiding this page's history.";
		}
		document.getElementById("status").textContent = status;
		document.getElementById("reason").textContent = request.reason;

		let targetText = request.target;
		if(targetText == null)
			targetText = "";

		document.getElementById("target").textContent = targetText;
	}
});

function updateTabInfo() {
	chrome.runtime.sendMessage({ action: "getTabInfo" });
}

window.onload = function() {
	updateTabInfo();
	setInterval(updateTabInfo, 1000);

	document.getElementById("options").onclick = function(tab) {
		chrome.runtime.openOptionsPage();
	};
};
