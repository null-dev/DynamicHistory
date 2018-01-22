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
}();
