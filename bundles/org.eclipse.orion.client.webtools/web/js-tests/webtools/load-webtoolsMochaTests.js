/*eslint-env browser, amd*/
require({
	baseUrl: "../../",
	paths: {
		text: "requirejs/text",
		i18n: "requirejs/i18n",
		csslint: "csslint/csslint"
	}
});
require(["mocha/sauce"], function(mocha) {
	mocha.setup("bdd");
	require([
		"js-tests/webtools/cssOutlinerTests",
		"js-tests/webtools/cssQuickFixTests",
		"js-tests/webtools/cssValidatorTests",
		"js-tests/webtools/cssParserTests",
		"js-tests/webtools/utilTests",
		"js-tests/webtools/htmlParserTests"
	], function(){
		mocha.run();
	});
});