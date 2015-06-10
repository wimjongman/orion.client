/*eslint-env browser, amd*/
/*global orion*/
window.onload = function() {
	var provider = new orion.PluginProvider();
	var callOrder = [];
	provider.registerService(['test.bogus', 'orion.cm.managedservice'], {
		updated: function(properties) {
			callOrder.push('orion.cm.managedservice');
		},
		test: function() {
			callOrder.push('test.bogus');
		},
		getCallOrder: function() {
			return callOrder;
		}
	}, {pid : 'test.pid'});
	provider.connect();
};

