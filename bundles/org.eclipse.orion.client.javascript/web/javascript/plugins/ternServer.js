/*******************************************************************************
 * @license
 * Copyright (c) 2015 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env amd */
define([
	"requirejs/require",
	"tern/lib/tern",
	"javascript/plugins/ternDefaults",
	"orion/Deferred",
	"orion/objects",
	"orion/serialize",
	"i18n!javascript/nls/workermessages",
	"i18n!javascript/nls/messages",
	"orion/i18nUtil"
],
/* @callback */ function(requirejs, Tern, defaultOptions, Deferred, Objects, Serialize, Messages, javascriptMessages, i18nUtil) {
	
	var ternserver, scriptresolver, fileclient;
	
	/**
	 * @name TernServer
	 * @description Creates a new TernServer
	 * @param {ScriptResolver} scriptResolver The resolver used to find scripts for getFile
	 * @param {FileClient} fileClient The file client 
	 * @returns {TernServer} A new TernServer instance
	 */
	function TernServer(scriptResolver, fileClient) {
		scriptresolver = scriptResolver;
		fileclient = fileClient;
	}
	
	Objects.mixin(TernServer.prototype, {
		/**
	     * @description Add a file to the Tern server
	     * @param {String} file The fully qualified name of the file
	     * @param {String} text The optional text of the file 
	     */
	    addFile: function addFile(file, text) {
	    	if(ternserver) {
		    	ternserver.addFile(file, text);
			}
	    },
	    /**
	     * @description Checks if the type reference at the given offset matches the given origin type
	     * @param {String} file The fully qualified name of the file context
	     * @param {Number} offset The offset of the identifier to check
	     * @param {Object} origin The original type information
	     * @param {Array.<Object>} files The optional array of file objects
	     * @param {Function} callback The callback which is called to return the results
	     */
	    checkRef: function checkRef(file, offset, origin, files, callback) {
	    	if(ternserver) {
	    		ternserver.request({
		           query: {
			           type: "checkRef",  //$NON-NLS-1$
			           file: file,
			           end: offset,
			           origin: origin
		           },
		           files: Array.isArray(files) ? files : []},
		           function(error, type) {
						if(error) {
							callback(null, {error: typeof(error) === 'string' ? error : error.message, message: Messages['failedType']});
						} else {
							callback(type);
						}
		           });
			} else {
		       callback(null, {message: Messages['failedTypeNoServer']});
		   	}
	
	    },
	    /**
	     * @description Computes content assist for the given options
	     * @param {String} file The fully qualified name of the file context
	     * @param {Number} offset The offset of the completion
	     * @param {Boolean} keywords If keywords should be returned as well
	     * @param {Array.<Object>} files The optional array of file objects
	     * @param {Function} callback The callback which is called to return the results
	     */
	    completions: function completions(file, offset, keywords, files, callback) {
	    	if(ternserver) {
		       ternserver.request({
		           query: {
		           type: "completions",  //$NON-NLS-1$
		           file: file,
		           types: true,
		           origins: true,
		           urls: true,
		           docs: true,
		           end: offset,
		           sort:true,
		           includeKeywords: keywords,
		           caseInsensitive: true
		           },
		           files: Array.isArray(files) ? files : []},
		           function(error, completions) {
		               if(error) {
							callback(null, {error: error.message, message: Messages['failedToComputeProposals']});
		               } else if(completions && completions.completions) {
							callback(completions.completions);
		               } else {
							callback([]);
		               }
		           });
	
		   } else {
		       callback(null, {message: Messages['failedToComputeProposalsNoServer']});
		   }
	    },
	    /**
	     * @description Computes the definition of the identifier at the given offset
	     * @param {String} file The fully qualified name of the file context
	     * @param {Number} offset The offset of the completion
	     * @param {Boolean} guess If we should take a guess at the definition if one cannot be computed
	     * @param {Array.<Object>} files The optional array of file objects
	     * @param {Function} callback The callback which is called to return the results
	     */
	    definition: function definition(file, offset, guess, files, callback) {
	    	if(ternserver) {
		       ternserver.request({
		           query: {
			           type: "definition",  //$NON-NLS-1$
			           file: file,
			           end: offset,
			           guess: guess
		           },
		           files: Array.isArray(files) ? files : []},
		           function(error, decl) {
		               if(error) {
		                  callback(null, {error: error.message, message: Messages['failedToComputeDecl']});
		               }
		               if(decl && typeof(decl.start) === 'number' && typeof(decl.end) === "number") {
							callback(decl);
						} else {
							callback(null);
						}
		           });
		   } else {
		       callback(null, {message: Messages['failedToComputeDeclNoServer']});
		   }
	    },
	    /**
	     * @description Deletes the given file from the server. Does nothing if the file does not exist
	     * @param {String] file The fully qualified name of the file to delete
	     */
	    delFile: function delFile(file) {
	    	if(ternserver) {
	            ternserver.delFile(file);
	        }
	    },
	    /**
	     * @description Computes the documentation associated with the given offset in the file
	     * @param {String} file The fully qualified name of the file context
	     * @param {Number} offset The offset of the completion
	     * @param {String} docFormat The format of the doc. If not given 'full' is assumed
	     * @param {Array.<Object>} files The optional array of file objects
	     * @param {Function} callback The callback which is called to return the results
	     */
	    documentation: function documentation(file, offset, docFormat, files, callback) {
	    	if(ternserver) {
		       ternserver.request({
		           query: {
			           type: "documentation",  //$NON-NLS-1$
			           file: file,
			           end: offset,
			           docFormat: typeof(docFormat) === 'string' ? docFormat : 'full' //$NON-NLS-1$
		           },
		           files: Array.isArray(files) ? files : []},
		           function(error, doc) {
		               if(error) {
		                   callback(null, {error: error.message, message: Messages['failedToComputeDoc']});
		               } else if(doc && doc.doc) {
							callback(doc.doc);
		               } else {
							callback(null);
		               }
		           });
		   } else {
		       callback(null, {request: 'documentation', message: Messages['failedToComputeDocNoServer']}); //$NON-NLS-1$
		   }
	    },
	    /**
	     * @description Returns the list of environments from plugins in Tern, if any
	     * @param {Function} callback The callback which is called to return the results
	     */
	    environments: function environments(callback) {
	    	if(ternserver) {
		       ternserver.request({
		           query: {
			           type: 'environments' //$NON-NLS-1$
		           }}, 
		           function(error, envs) {
		               if(error) {
		                   callback(null, {error: error.message, message: Messages['failedGetEnvs']});
		               }
		               if(typeof(envs) === 'object') {
							callback(envs);
						} else {
							callback(null);
						}
		           });
		   } else {
		       callback(null, {message: Messages['failedGetEnvsNoServer']});
		   }
	    },
	    /**
	     * @description Computes the implementation of the identifier at the given offset
	     * @param {String} file The fully qualified name of the file context
	     * @param {Number} offset The offset of the completion
	     * @param {Boolean} guess If we should take a guess at the definition if one cannot be computed
	     * @param {Array.<Object>} files The optional array of file objects
	     * @param {Function} callback The callback which is called to return the results
	     */
	    implementation: function implementation(file, offset, guess, files, callback) {
	    	if(ternserver) {
		       ternserver.request({
		           query: {
			           type: "implementation",  //$NON-NLS-1$
			           file: file,
			           end: offset,
			           guess: guess
		           },
		           files: Array.isArray(files) ? files : []},
		           function(error, impl) {
		               if(error) {
		                   callback(null, {error: error.message, message: Messages['failedToComputeImpl']});
		               } else  if(impl && impl.implementation && typeof(impl.implementation.start) === 'number' && typeof(impl.implementation.end) === "number") {
							callback(impl.implementation);
						} else {
							callback(null);
						}
		           });
		   } else {
		       callback(null, {message: Messages['failedToComputeImplNoServer']});
		   }
	    },
	    /**
	     * @description Returns the list of plugins installed in Tern, if any
	     * @param {Function} callback The callback which is called to return the results
	     */
	    installedPlugins: function installedPlugins(callback) {
	    	if(ternserver) {
		       ternserver.request({
		           query: {
			           type: 'installed_plugins' //$NON-NLS-1$
		           }}, 
		           function(error, plugins) {
		               if(error) {
							callback(null, {error: error.message, message: Messages['failedGetInstalledPlugins']});
		               }
		               if(plugins != null && typeof(plugins) === 'object') {
							callback(plugins);
						} else {
							callback([]);
						}
		           });
		   } else {
		       callback(null, {message: Messages['failedGetInstalledPluginsNoServer']});
		   }
	    },
	    /**
	     * @description Runs ESLint on the given file context
	     * @param {String} file The fully qualified name of the file context
	     * @param {Object} rules The map of ESLint rules
	     * @param {Object} env The map of existing environment names
	     * @param {Array.<Object>} files The optional array of file objects
	     * @param {Function} callback The callback which is called to return the results
	     */
	    lint: function lint(file, rules, env, files, callback) {
	    	if(ternserver) {
				ternserver.request({
					query: {
						type: "lint",  //$NON-NLS-1$
						file: file,
						config: {
							rules: rules
						},
						env: env ? env : Object.create(null)
					},
					files: Array.isArray(files) ? files : []},
					function(error, problems) {
						if(error) {
							callback(null, {error: error.message, message: Messages['failedToComputeProblems']});
						} else if(problems && Array.isArray(problems)) {
							callback(problems);
						} else {
							callback([]);
						}
					});
			} else {
		       callback(null, {message: Messages['failedToComputeProblemsNoServer']});
		   }
	    },
	    /**
	     * @description Computes an outline of the given file
	     * @param {String} file The fully qualified name of the file context
	     * @param {Array.<Object>} files The optional array of file objects
	     * @param {Function} callback The callback which is called to return the results
	     */
	    outline: function outline(file, files, callback) {
	    	if(ternserver) {
	    		ternserver.request({
					query: {
						type: "outline", //$NON-NLS-1$
						file: file
					},
					files: Array.isArray(files) ? files : []},
					function(error, outline) {
						if(error) {
							callback(null, {error: error.message, message: Messages['failedToComputeOutline']});
						} else if(outline && Array.isArray(outline)) {
							callback(outline);
						} else {
							callback([]);
						}
					}
				);
			} else {
		       callback(null, {message: Messages['failedToComputeOutlineNoServer']});
		   }
	    },
	    /**
	     * @description Computes a rename array for the identifier at the given offset
	     * @param {String} file The fully qualified name of the file context
	     * @param {Number} offset The offset of the completion
	     * @param {String} newname The new name to change to
	     * @param {Array.<Object>} files The optional array of file objects
	     * @param {Function} callback The callback which is called to return the results
	     */
	    rename: function rename(file, offset, newname, files, callback) {
	    	if(ternserver) {
		       ternserver.request({
		           query: {
			           type: "rename",  //$NON-NLS-1$
			           file: file,
			           end: offset,
			           newName: newname
		           },
		           files: Array.isArray(files) ? files : []},
		           function(error, changes) {
		               if(error) {
							callback(null, {error: error.message, message: Messages['failedRename']});
		               } else if(changes && Array.isArray(changes.changes)) {
							callback(changes.changes);
		               } else {
							callback([]);
		               }
		           });
		   } else {
		       callback(null, {message: Messages['failedRenameNoServer']});
		   }
	    },
		/**
		 * @description Start up the Tern server, send a message after trying
	     * @param {Object} jsonOptions The optional map of JSON options to start the server with
	     * @param {Function} callback The callback which is called to return the results
	     */
	    startServer: function startServer(jsonOptions, callback) {
			if (ternserver){
				ternserver.reset();
				ternserver = null;
			}
	        var options = {
	                async: true,
	                debug: false,
	                projectDir: '/',
	                getFile: doRead
			};
	        var pluginsDir = defaultOptions.pluginsDir;
	        var defsDir = defaultOptions.defsDir;
	        var defNames = [];
	        if (jsonOptions) {
				if (jsonOptions.plugins){
					options.plugins = jsonOptions.plugins;
				}
				if(jsonOptions.pluginDir) {
					pluginsDir = jsonOptions.pluginsDir;
				}
				if (Array.isArray(jsonOptions.libs)){
					defNames = jsonOptions.libs;
					defsDir = jsonOptions.defsDir;
				}
				if (Array.isArray(jsonOptions.defs)){
					defNames = jsonOptions.defs;
					defsDir = jsonOptions.defsDir;
				}
				if (typeof jsonOptions.ecmaVersion === 'number'){
					options.ecmaVersion = jsonOptions.ecmaVersion;
				}
				if (typeof jsonOptions.dependencyBudget === 'number'){
					options.dependencyBudget = jsonOptions.dependencyBudget;
				}
	        }
	        function defaultStartUp(err) {
				options.plugins = defaultOptions.plugins;
				options.defs = defaultOptions.defs;
				ternserver = new Tern.Server(options);
				callback(err);
	        }
	        if(!options.plugins && (!defNames || defNames.length < 1)) {
				defaultStartUp();
	        } else {
				Deferred.all(loadPlugins(options.plugins, pluginsDir)).then(/* @callback */ function(plugins) {
					Deferred.all(loadDefs(defNames, defsDir)).then(function(json) {
							options.defs = json;
							ternserver = new Tern.Server(options);
							callback();
						}, defaultStartUp);
		        }, defaultStartUp);
	        }
	    },
	    /**
	     * @description Computes the type information at the given offset
	     * @param {String} file The fully qualified name of the file context
	     * @param {Number} offset The offset of the completion
	     * @param {Function} callback The callback which is called to return the results
	     */
	    type: function type(file, offset, callback) {
	    	if(ternserver) {
	    		ternserver.request({
		           query: {
			           type: "type",  //$NON-NLS-1$
			           file: file,
			           end: offset
		           }},
		           function(error, type) {
		               if(error) {
		                   callback(null, {error: typeof(error) === 'string' ? error : error.message, message: Messages['failedType']});
		               } else {
							callback(type);
		               }
		           });
		 	} else {
		       callback(null, {message: Messages['failedTypeNoServer']});
		   }
	    }
	
	});
	
    
    
    /**
     * @description Loads the plugins listed in the given plugins object
     * @param {Object} plugins The object of plugins
     * @param {String} pluginsDir The base directory to load plugins from, if not defined, the default of 'tern/plugin/' is assumed
     * @returns {Promise} The promise to resolve all of the plugin loads
     * @since 11.0
     */
    function loadPlugins(plugins, pluginsDir) {
		var promises = [];
		if(plugins) {
			Object.keys(plugins).forEach(function(key) {
				if(defaultOptions.plugins[key]) {
					//default plugins are statically loaded
					return;
				}
				var plugin = plugins[key];
				var loc = plugin.location;
				if(typeof(loc) !== 'string') {
					if(typeof(pluginsDir) === 'string') {
						loc = pluginsDir + key;
					} else {
						//assume it is in /tern/plugin/
						loc = 'tern/plugin/' + key; //$NON-NLS-1$
					}
				}
				var deferred = new Deferred();
				try {
					promises.push(deferred);    		
					requirejs([loc], function(_) {
						deferred.resolve(_);
					},
					function(err) {
						deferred.reject(err);
					});
				}
				catch(err) {
					deferred.reject(err);
				}
			});
		}
		return promises;
    }
    
    /**
     * @description Load any defs from the .tern-project file
     * @param {Array.<String>|Object} defs The definitions, either from an array of names or an object of names with additional metadata
     * @param {String} defsDir The optional directory where to find the definitions. If not given the 'tern/defs' directory is assumed
     * @returns {Promise} Returns a promise to resolve all def loads
     * @since 11.0
     */
    function loadDefs(defs, defsDir) {
		var _defs = [];
		if(Array.isArray(defs)) {
			defs.forEach(function(_def) {
				_defs.push(_loadDef(_def, defsDir, _defs));
			});
		} else if(defs && typeof(defs) === 'object') {
			Object.keys(defs).forEach(function(key) {
				var def = defs[key];
				if(typeof(def.location) === 'string') {
					_defs.push(_loadDef(def.location, defsDir, _defs));
				} else {
					_defs.push(_loadDef(key, defsDir, _defs));
				}
			});
		}
		return _defs;
    }
    
    /**
     * @description Delegate to actually load a definition
     * @private
     * @param {String} def The name of the definition load try and load
     * @param {String} defsDir The optional base directory to load from
     * @param {Array.<Object>} defs The collector array for loaded defs
     * @since 11.0
     */
    function _loadDef(def, defsDir) {
		var loc = def;
		if(typeof(defsDir) === 'string') {
			loc = defsDir + def;
		} else {
			//assume it is in /tern/defs/
			loc = 'json!tern/defs/' + def; //$NON-NLS-1$
		}
		if(!/^json!/i.test(loc)) {
			loc = 'json!'+loc; //$NON-NLS-1$
		}
		if(!/$.json/i.test(def)) {
			loc = loc + '.json'; //$NON-NLS-1$
		}
		var deferred = new Deferred();
		try {
			requirejs([loc], function(_) {
				deferred.resolve(_);
			},
			function(err) {
				deferred.reject(err);
			});
		}
		catch(err) {
			deferred.reject(err);
		}
		return deferred;
    }
    
    /**
	 * @description Handler for Tern read requests
	 * @param {Object|String}} file The file to read
	 * @param {Function} callback The finction to call back to
	 */
	function doRead(file, callback) {
		if(typeof(file) === 'object') {
			var _l = file.logical;
			var val = Object.create(null);
			val.logical = _l;
			scriptresolver.getWorkspaceFile(_l).then(function(files) {
				if(files && files.length > 0) {
					var rel = scriptresolver.resolveRelativeFiles(_l, files, {location: file.file, contentType: {name: 'JavaScript'}}); //$NON-NLS-1$
					if(rel && rel.length > 0) {
						return fileclient.read(rel[0].location).then(function(contents) {
							val.contents = contents;
							val.file = rel[0].location;
							val.path = rel[0].path;
							callback(null, val);
						},
						function(reject) {
							callback(reject);
						});
					} else {
						callback(i18nUtil.formatMessage(javascriptMessages['failedToReadFile'], _l));
					}
				} else {
					callback(i18nUtil.formatMessage(javascriptMessages['failedToReadFile'], _l));
				}
			},
			/* @callback */ function(err) {
				callback(i18nUtil.formatMessage(javascriptMessages['failedToReadFile'], _l));
			});
		} else {
			if(!/\.js|\.htm|\.htm$/ig.test(file)) {
				//no extension given, guess at js
				file += '.js'; //$NON-NLS-1$
			}
			try {
				return fileclient.read(file).then(function(contents) {
							callback(null, contents);
						},
						/* @callback */ function(err) {
							callback(err);
						});
			}
			catch(err) {
				callback(i18nUtil.formatMessage(javascriptMessages['failedToReadFile'], file));
			}
		}
	}
    
    return TernServer;
});