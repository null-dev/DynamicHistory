/**
 * Copyright (c) 2017 Andy Bao
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
		$('#danger_domains').val(items.dangerDomains);
		$('#safe_domains').val(items.safeDomains);
		$('#bad_words').val(items.badWords);

		$('#do_regex_danger_domains').prop('checked', items.doRegexDangerDomains);
		$('#do_regex_safe_domains').prop('checked', items.doRegexSafeDomains);
		$('#do_regex_danger_keywords').prop('checked', items.doRegexDangerKeywords);
		$('#do_check_entire_url').prop('checked', items.doCheckEntireUrl);

		$('#do_prefix').prop('checked', items.doPrefix);
		$('#do_outline').prop('checked', items.doOutline);
		$('#do_badge').prop('checked', items.doBadge);

		$('#prefix_text').val(items.prefixText);
		$('#outline_color').val(items.outlineColor);
		$('#badge_text').val(items.badgeText);
		$('#badge_color').val(items.badgeColor);
		updateInputStates();

		//Initalize placeholders
		$('textarea').each(function() {
			if($(this).val() == '')
				$(this).val(pVal($(this)));
		});
	});
}
//Save settings
function saveSettings() {
	storage().set({
		dangerDomains: ignoreP($('#danger_domains')),
		safeDomains: ignoreP($('#safe_domains')),
		badWords: ignoreP($('#bad_words')),

		doRegexDangerDomains: $('#do_regex_danger_domains').prop('checked'),
		doRegexSafeDomains: $('#do_regex_safe_domains').prop('checked'),
		doRegexDangerKeywords: $('#do_regex_danger_keywords').prop('checked'),
		doCheckEntireUrl: $('#do_check_entire_url').prop('checked'),

		doPrefix: $('#do_prefix').prop('checked'),
		doOutline: $('#do_outline').prop('checked'),
		doBadge: $('#do_badge').prop('checked'),

		prefixText: $('#prefix_text').val(),
		outlineColor: $('#outline_color').val(),
		badgeText: $('#badge_text').val(),
		badgeColor: $('#badge_color').val()
	}, function() {
		//Update background page
		chrome.runtime.sendMessage({
			action: "updateSettings"
		});
	});
}
//Update disabled inputs and stuff
function updateInputStates() {
	$('#prefix_text').attr("disabled", !$("#do_prefix").is(":checked"));
	$('#outline_color').attr("disabled", !$("#do_outline").is(":checked"));
	let disableBadgeOptions = !$("#do_badge").is(":checked");
	$('#badge_text').attr("disabled", disableBadgeOptions);
	$('#badge_color').attr("disabled", disableBadgeOptions);
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
jQuery(document).ready(function () {
	//Hook placeholders
	$('textarea').focus(function(){
		if($(this).val() === pVal($(this))){
			$(this).val('');
		}
	});
	$('textarea').blur(function(){
		if($(this).val() ===''){
			$(this).val(pVal($(this)));
		}    
	});

	//Allows resetting of all settings
	$("#clear_btn").click(function () {
		$("#clear_modal").show();
		//Scroll to top hack
		$("#body").css("height", "500px");
		$("#body").css("overflow-y", "hidden");
		setTimeout(function() {
			$("#body").css("height", "");
			$("#body").css("overflow-y", "visible");
		}, 100);
	});
	let hideModal = function() {
		$("#clear_modal").hide();
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

	//Show oninstall link if chrome
	if (typeof browser === "undefined")
		$("#oninstall_link").show();

	//Load initial settings
	loadSettings();
});
