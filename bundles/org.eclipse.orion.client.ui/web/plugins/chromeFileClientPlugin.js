/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define(["orion/Deferred", "orion/plugin", "plugins/filePlugin/ChromeFileImpl", 'i18n!orion/navigate/nls/messages', "domReady!"], function(Deferred, PluginProvider, ChromeFileServiceImpl, messages) {
	
	function connect() {
		var headers = {
			name: "Orion File Service",
			version: "1.0",
			description: "This plugin provides file access to a user's workspace."
		};
		var pluginProvider = new PluginProvider(headers);
		registerServiceProviders(pluginProvider);
		pluginProvider.connect();
	}

	var tryParentRelative = true;
	function makeParentRelative(location) {
		if (tryParentRelative) {
			try {
				if (typeof window === "undefined") {
					return location.substring(self.location.href.indexOf(self.location.host) + self.location.host.length);
				}
				if (window.location.host === parent.location.host && window.location.protocol === parent.location.protocol) {
					return location.substring(parent.location.href.indexOf(parent.location.host) + parent.location.host.length);
				} else {
					tryParentRelative = false;
				}
			} catch (e) {
				tryParentRelative = false;
			}
		}
		return location;
	}

	function registerServiceProviders(provider) {
		var fileBase = makeParentRelative(new URL("../chrome", self.location.href).href);
	
		var service = new ChromeFileServiceImpl(fileBase);
		//provider.registerService("orion.core.file", trace(service), {
		provider.registerService("orion.core.file", service, {
			//Name: 'Orion Content',  // HACK  see https://bugs.eclipse.org/bugs/show_bug.cgi?id=386509
			Name: messages['Orion Content'],
			nls: 'orion/navigate/nls/messages',
			top: fileBase,
			ranking: -1,
			pattern: fileBase
		});
	}

	return {
		connect: connect,
		registerServiceProviders: registerServiceProviders
	};
});