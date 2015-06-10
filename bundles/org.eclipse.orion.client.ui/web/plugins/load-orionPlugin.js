/*eslint-env browser, amd*/
require({
  baseUrl: '..',

  // set the paths to our library packages
  packages: [],
  paths: {
	  text: 'requirejs/text',
	  i18n: 'requirejs/i18n',
	  domReady: 'requirejs/domReady'
  }
});	
require(["plugins/orionPlugin"], function(plugin) {
	plugin.connect();
});

