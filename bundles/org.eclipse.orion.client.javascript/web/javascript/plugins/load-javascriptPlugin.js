/*eslint-env amd*/
require({
	baseUrl: "../../",
	paths: {
		i18n: 'requirejs/i18n',
		esprima: "esprima/esprima",
		estraverse: "estraverse/estraverse",
		escope: "escope/escope",
		logger: "javascript/logger",
		doctrine: 'doctrine/doctrine'
	},
	packages: [
		{
			name: "eslint/conf",
			location: "eslint/conf"
		},
		{
			name: "eslint",
			location: "eslint/lib",
			main: "eslint"
		},
	]
});

require(["javascript/plugins/javascriptPlugin"]);

