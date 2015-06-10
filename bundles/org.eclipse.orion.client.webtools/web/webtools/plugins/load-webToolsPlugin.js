/*eslint-env browser, amd*/
require({
	baseUrl: "../../",
	paths: {
		text: "requirejs/text",
		i18n: "requirejs/i18n",
		domReady: "requirejs/domReady",
		csslint: "csslint/csslint"
	},
	packages: []
});
require(["webtools/plugins/webToolsPlugin"]);
