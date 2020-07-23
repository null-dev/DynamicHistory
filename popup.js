chrome.runtime.onMessage.addListener(function(request, sender) {
	if(request.action == "updateTabInfo") {
		let className;
		let status;
		if(request.status) {
			status = "DynamicHistory has removed this page from history!";
			className = "removed";
		} else {
			status = "DynamicHistory has NOT removed this page from history.";
			className = "notremoved";
		}
		document.getElementById("status").textContent = status;
		document.getElementById("reason").textContent = request.reason;

		let targetText = request.target;
		if(targetText == null)
			targetText = "";

		let target = document.getElementById("target");

		target.className = className;
		target.textContent = targetText;
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
