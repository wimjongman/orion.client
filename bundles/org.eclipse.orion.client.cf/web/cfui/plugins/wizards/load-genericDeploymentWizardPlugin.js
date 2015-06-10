/*eslint-env browser, amd*/
require({
  baseUrl: '../../../',
  // set the paths to our library packages
  packages: [],
  paths: {
    text: 'requirejs/text',
    i18n: 'requirejs/i18n',
    domReady: 'requirejs/domReady'
  }
});

require(["orion/plugin"], function(PluginProvider){
	
	var headers = {
		name : "Cloud Foundry Generic Deployment Wizard",
		version : "1.0",
		description : "This plugin provides a generic deployment wizard integrating with Cloud Foundry."
	};
	
	function GenericDeploymentWizard(){};
	GenericDeploymentWizard.prototype = {
		constructor : GenericDeploymentWizard,
		
		getInitializationParameters : function(){
			return {
				LocationTemplate : "{+OrionHome}/cfui/plugins/wizards/generic/genericDeploymentWizard.html",
				Width : "478px",
				Height : "470px"
			};
		}
	};
	
	var genericDeploymentWizard = new GenericDeploymentWizard();
	
	var provider = new PluginProvider(headers);
	provider.registerServiceProvider("orion.project.deploy.wizard",
		genericDeploymentWizard, {
			id : "org.eclipse.orion.client.cf.wizard.generic"
		});
	
	provider.connect();
});

