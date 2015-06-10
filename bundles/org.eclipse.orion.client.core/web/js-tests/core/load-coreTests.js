/*eslint-env browser,amd*/
require({
	baseUrl: "../../",
	paths: {
		text: "requirejs/text",
		i18n: "requirejs/i18n",
	}
});
require(["mocha/sauce"], function(mocha) {
	mocha.setup("bdd");
	require([
		"js-tests/core/base64/base64Tests",
		"js-tests/core/config/configTests",
		"js-tests/core/deferred/deferredTests",
		"js-tests/core/metatype/metatypeTests",
		"js-tests/core/pluginregistry/pluginregistryTests",
		"js-tests/core/preferences/preferencesTests",
		"js-tests/core/serviceregistry/serviceregistryTests",
		"js-tests/core/serviceTracker/serviceTrackerTests",
		"js-tests/core/URITemplate/URITemplateTests",
		"js-tests/core/URL/URLTests",
		"js-tests/core/xhr/xhrTests",
	], function(){
		mocha.run();
	});
});