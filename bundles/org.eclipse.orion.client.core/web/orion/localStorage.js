/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd, node*/
/*globals chrome*/
(function(root, factory) { // UMD
    if (typeof define === "function" && define.amd) { //$NON-NLS-0$
        define(factory);
    } else if (typeof exports === "object") { //$NON-NLS-0$
        module.exports = factory();
    } else {
        root.orion = root.orion || {};
        root.orion.Deferred = factory();
    }
}(this, function() {
    return {
    	load: function(name, parentRequire, onLoad, config) {
	    	if (typeof(chrome) !== "undefined" && typeof(chrome.storage) !== "undefined" && typeof(chrome.storage.local) !== "undefined") {
				chrome.storage.local.get(null, function(items) {
					var _keys = null;
					var obj = items;

			        function _getKeys() {
			            return (_keys = _keys || Object.keys(obj));
			        }
			
			        var result = {
			            key: function(index) {
			                return _getKeys()[index];
			            },
			            getItem: function(key) {
			                return obj[key] || null;
			            },
			            setItem: function(key, value) {
			                obj[key] = value;
			                _keys = null;
			                var temp = {};
			                temp[key] = value;
			                chrome.storage.local.set(temp);
			            },
			            removeItem: function(key) {
			                delete obj[key];
			                _keys = null;
			                chrome.storage.local.remove(key);
			            },
			            clear: function() {
			                _getKeys().forEach(function(key) {
			                    delete obj[key];
			                }.bind(this));
			                _keys = null;
			                chrome.storage.local.clear();			                
			            }
        			};
        			onLoad(result);
        		});
        	} else {
				onLoad(localStorage);
			}
	    }
    };
}));









