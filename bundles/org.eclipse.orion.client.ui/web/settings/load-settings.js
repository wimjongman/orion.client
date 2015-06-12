/*eslint-env browser, amd*/
require({ baseUrl: '..',
	      packages: [],
	      paths: {
	          text: 'requirejs/text',
	          i18n: 'requirejs/i18n',
	          domReady: 'requirejs/domReady',
	          csslint: 'csslint/csslint',
	      } 
});
require(["settings/settings"]);