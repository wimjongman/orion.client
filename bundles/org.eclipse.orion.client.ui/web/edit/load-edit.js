/*eslint-env browser, amd*/
require({
	baseUrl: "..",
	paths: {
		text: "requirejs/text",
		i18n: "requirejs/i18n",
		domReady: "requirejs/domReady"
	}
});
require(["edit/edit"]);