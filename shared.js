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
