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
 * Core JS for Settings
 */

//Get proper storage mechanism
function storage() {
	//Attempt to use synced storage, otherwise fallback to local storage
	return chrome.storage.sync || chrome.storage.local;
}

//Load settings
function loadSettings(callback) {
	storage().get(DEFAULT_OPTIONS(), function(items) {
		$('#danger_domains').val(items.dangerDomains);
		$('#safe_domains').val(items.safeDomains);
		$('#bad_words').val(items.badWords);
		$('#history_processor').val(items.historyProcessor);

		$('#do_regex_danger_domains').prop('checked', items.doRegexDangerDomains);
		$('#do_regex_safe_domains').prop('checked', items.doRegexSafeDomains);
		$('#do_regex_danger_keywords').prop('checked', items.doRegexDangerKeywords);
		$('#do_check_entire_url').prop('checked', items.doCheckEntireUrl);
		$('#scan_all').prop('checked', items.scanAll);
		$('#continuous_matching').prop('checked', items.continuousMatching);

		$('#do_prefix').prop('checked', items.doPrefix);
		$('#do_outline').prop('checked', items.doOutline);
		$('#do_badge').prop('checked', items.doBadge);
		$('#inject_css').prop('checked', items.injectCss);
		$('#inject_js').prop('checked', items.injectJs);

		$('#prefix_text').val(items.prefixText);
		$('#outline_color').val(items.outlineColor);
		$('#badge_text').val(items.badgeText);
		$('#badge_color').val(items.badgeColor);
		$('#css_code').val(items.cssCode);
		$('#js_code').val(items.jsCode);
		updateInputStates();

		//Initalize placeholders
		$('textarea').each(function() {
			if($(this).val() == '') {
				$(this).val(pVal($(this)));
				$(this).css('color', 'grey');
			}
		});

		if(callback)
			callback();
	});
}
//Save settings
let saveSettings = debounce(function() {
	storage().set({
		dangerDomains: ignoreP($('#danger_domains')),
		safeDomains: ignoreP($('#safe_domains')),
		badWords: ignoreP($('#bad_words')),
		historyProcessor: ignoreP($('#history_processor')),

		doRegexDangerDomains: $('#do_regex_danger_domains').prop('checked'),
		doRegexSafeDomains: $('#do_regex_safe_domains').prop('checked'),
		doRegexDangerKeywords: $('#do_regex_danger_keywords').prop('checked'),
		doCheckEntireUrl: $('#do_check_entire_url').prop('checked'),
		scanAll: $('#scan_all').prop('checked'),
		continuousMatching: $('#continuous_matching').prop('checked'),

		doPrefix: $('#do_prefix').prop('checked'),
		doOutline: $('#do_outline').prop('checked'),
		doBadge: $('#do_badge').prop('checked'),
		injectCss: $('#inject_css').prop('checked'),
		injectJs: $('#inject_js').prop('checked'),

		prefixText: $('#prefix_text').val(),
		outlineColor: $('#outline_color').val(),
		badgeText: $('#badge_text').val(),
		badgeColor: $('#badge_color').val(),
		cssCode: ignoreP($('#css_code')),
		jsCode: ignoreP($('#js_code'))
	}, function() {
		//Update background page
		chrome.runtime.sendMessage({
			action: "updateSettings"
		});
	});
}, 500);

//Update disabled inputs and stuff
function updateInputStates() {
	$('#prefix_text').attr("disabled", !$("#do_prefix").is(":checked"));
	$('#outline_color').attr("disabled", !$("#do_outline").is(":checked"));
	let disableBadgeOptions = !$("#do_badge").is(":checked");
	$('#badge_text').attr("disabled", disableBadgeOptions);
	$('#badge_color').attr("disabled", disableBadgeOptions);
	$('#css_code').attr("disabled", !$("#inject_css").is(":checked"));
	$('#js_code').attr("disabled", !$("#inject_js").is(":checked"));
}
//Fires everytime something is changed. Saves settings and updates disabled inputs
function saveAndUpdate() {
	saveSettings();
	updateInputStates();
}
function ignoreP(a) {
	if(a.val() == pVal(a))
		return '';
	else return a.val();
}
function pVal(a) {
	return a.data().placeholder.replace(/\\n/g, '\n');
}

function bindHpTemplates() {
	bindTemplate("Replace http with https", `
if(item.url.startsWith("http") && !item.url.startsWith("https"))
	item.url = item.url.replace("http", "https");
`);

	bindTemplate("Remove anchors", `
for(let i = item.url.length - 1; i >= 0; i--) {
	let c = item.url[i];
	if(c === '/') break;
	if(c === '#') {
		item.url = item.url.substring(0, i);
		break;
	}
}
		`);

	bindTemplate("Replace all history entries with 'http://example.com/'", `
item.url = "http://example.com/";
		`);

	bindTemplate("Make all history entries link to the Wayback Machine", `
if(!item.url.startsWith("https://web.archive.org/web/*/"))
	item.url = "https://web.archive.org/web/*/" + item.url;
		`);

	bindTemplate("Fill your history with Rick Rolls", `
if(!item.url.startsWith("https://www.youtube.com/watch?v=dQw4w9WgXcQ"))
	item.url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&ignored=" + Math.random();
		`);

	bindTemplate("Leave no history (without using incognito mode)", `
item.remove();
		`);
}

function bindTemplate(name, code) {
	let btn = document.createElement("button");
	btn.textContent = name;
	btn.onclick = function() {
		let box = $("#history_processor");
		if(box.val() == pVal(box)) {
			box.val('');
			box.css('color', 'black');
		}

		box.val((box.val().trim() + "\n\n" + "//" + name + "\n" + code.trim()).trim());

		saveSettings();
	}
	btn.style.marginTop = "8px";
	let t = document.getElementById("hp_templates");
	t.appendChild(btn);
	t.appendChild(document.createElement("br"));
}

function scrollToTop() {
	//Scroll to top hack
	$("#body").css("height", "500px");
	$("#body").css("overflow-y", "hidden");
	setTimeout(function() {
		$("#body").css("height", "");
		$("#body").css("overflow-y", "visible");
	}, 100);
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

jQuery(document).ready(function () {
	//Hook placeholders
	$('textarea').focus(function(){
		if($(this).val() === pVal($(this))){
			$(this).val('');
		}
		$(this).css('color', 'black');
	});
	$('textarea').blur(function(){
		if($(this).val() === ''){
			$(this).val(pVal($(this)));
			$(this).css('color', 'grey');
		}    
	});

	//Allows resetting of all settings
	let clearModal = $("#clear_modal");
	$("#clear_btn").click(function () {
		clearModal.show();
		scrollToTop();
	});
	let hideModal = function() {
		clearModal.hide();
	};
	$("#clear_modal .close").click(hideModal);
	$("#clear_no_btn").click(hideModal);
	$("#clear_yes_btn").click(function() {
		chrome.storage.sync.clear(function() {
			loadSettings();
		});
		hideModal();
	});
	window.onclick = function(event) {
		if (event.target == $("#clear_modal")[0]) {
			hideModal();
		}
	};

	//Bind auto-save listeners
	$("input[type=checkbox]").click(function () {
		saveAndUpdate();
	});
	$('input[type=text]').on('input propertychange', function() {
		saveAndUpdate();
	});
	$('input[type=color]').on('input', function() {
		saveAndUpdate();
	});
	$("textarea").on('change keyup paste', function() {
		saveAndUpdate();
	});
	$( window ).unload(function() {
		saveAndUpdate();
	});

	//Bind history processor templates
	bindHpTemplates();

	//Show oninstall link if chrome
	if (isChrome)
		$("#oninstall_link").show();

	//Load initial settings
	loadSettings();

	$('#backup_btn').click(function() {
		storage().get(DEFAULT_OPTIONS(), function(items) {
			dlFile("DynamicHistory_" + moment().format() + ".json", JSON.stringify(items));
		});
	});

	let fileInput = $('#file_input');

	$('#restore_btn').click(function() {
		//Clear old restore
		fileInput.prop('value', null);
		fileInput.click();
	});

	fileInput.on('change', function() {
		readBackup(fileInput);
	});

	//Disable history processor on firefix (no eval)
	if(!isChrome)
		$("#custom_hist_proc").hide();
});

function readBackup(element) {
	let file = element[0].files[0]
	if (file) {
		let fr = new FileReader();
		fr.onload = function(e) {
			storage().set(JSON.parse(e.target.result), function() {
				loadSettings(function() {
					saveAndUpdate();
					let restoreModal = $("#restore_modal");
					restoreModal.show();
					scrollToTop();

					//Hack to trigger textarea placeholder updaters
					$('textarea').focus();
					$('textarea').blur();

					let hideModal = function() {
						restoreModal.hide();
					};
					$("#restore_modal .close").click(hideModal);
					$("#restore_close_btn").click(hideModal);
				});
			});
		};
		fr.readAsText(file);
	}
}

function dlFile(filename, data) {
	let blob = new Blob([data], {type: 'text/json'});
	let elem = window.document.createElement('a');
	elem.href = window.URL.createObjectURL(blob);
	elem.download = filename;        
	document.body.appendChild(elem);
	elem.click();        
	elem.remove();
}
