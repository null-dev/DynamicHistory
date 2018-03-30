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
 * Extension Content Script Helper
 */

void function() {
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
}();
