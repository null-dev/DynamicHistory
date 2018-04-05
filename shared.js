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
 * Shared JS
 */

let isChrome = typeof browser === "undefined";

function DEFAULT_OPTIONS() {
	return {
		dangerDomains: '',
		safeDomains: '',
		badWords: '',
		historyProcessor: '',

		doRegexDangerDomains: false,
		doRegexSafeDomains: false,
		doRegexDangerKeywords: false,
		doCheckEntireUrl: false,
		scanAll: false,
		continuousMatching: false,

		doPrefix: true,
		doOutline: true,
		doBadge: true,
		injectCss: false,
		injectJs: false,

		prefixText: '[DH] ',
		outlineColor: '#ff0000',
		badgeText: '!',
		badgeColor: '#ff0000',
		cssCode: '',
		jsCode: ''
	};
}

//Get proper storage mechanism
function storage() {
	// Reliable storage shim
	return {
		get: function(def, callback) {
			// Always try sync storage first
			if(chrome.storage.sync != null) {
				chrome.storage.sync.get(def, function(items) {
					if(items != null) {
						// Sync storage works! Use sync storage items!
						callback(items);
					} else {
						// Sync storage not available
						// use local
						chrome.storage.local.get(def, callback);
					}
				});
			} else {
				// Sync storage not enabled so only choice is local
				chrome.storage.local.get(def, callback);
			}
		},
		set: function(contents, callback) {
			// Set both storages (cannot reliably detect which is available)
			if(chrome.storage.sync != null) {
				// Set sync first (callback will still be called even
				// if sync is disabled)
				chrome.storage.sync.set(contents, function() {
					// Done setting sync, set local
					chrome.storage.local.set(contents, callback);
				});
			} else {
				// Sync not enabled, only set local
				chrome.storage.local.set(contents, callback);
			}
		},
		clear: function(callback) {
			// Clear both storages (cannot reliably detect which is available)
			if(chrome.storage.sync != null) {
				// Clear sync first (callback will still be called even
				// if sync is disabled)
				chrome.storage.sync.clear(function() {
					// Done clearing sync, clear local
					chrome.storage.local.clear(callback);
				});
			} else {
				// Sync not enabled, only clear local
				chrome.storage.local.clear(callback);
			}
		}
	};
}
