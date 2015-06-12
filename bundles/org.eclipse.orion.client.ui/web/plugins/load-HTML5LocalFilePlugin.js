/*eslint-env browser, amd*/
/*global orion eclipse*/
window.onload = function() {
	var provider = new orion.PluginProvider();
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	if (window.requestFileSystem) {
		window.requestFileSystem(window.TEMPORARY, 10*1024*1024 , function(fs) {
			var base = fs.root.toURL();
			var service = new eclipse.HTML5LocalFileServiceImpl(fs);
			provider.registerService("orion.core.file", service, {Name:'HTML5 Local File contents', top:base, pattern:base});
			provider.connect();
		}, function(error) {
			console.log(error);
			provider.connect();
		});
	} else {
		provider.connect();
	}
};