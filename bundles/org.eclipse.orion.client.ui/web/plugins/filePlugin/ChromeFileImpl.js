/*******************************************************************************
 * @license
 * Copyright (c) 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
/*global URL*/
define(["orion/xhr", "orion/Deferred", "orion/encoding-shim", "orion/URL-shim"], function(xhr, Deferred) {
	
	function ChromeFileImpl(fileBase) {
		this.fileBase = fileBase;
	}
	

	ChromeFileImpl.prototype = {
		readEntries: function (dirEntry) {
			var deferred = new Deferred();
			var reader = dirEntry.createReader();
			var entries = [];
			function handleEntries(results) {
				if (results.length) {
					entries = entries.concat(Array.prototype.slice.call(results));
					reader.readEntries(handleEntries, deferred.reject);
				} else {
					deferred.resolve(entries);
				}
			}
			reader.readEntries(handleEntries, deferred.reject);
			return deferred;
		},
		fetchChildren: function(location) {
			var fetchLocation = location;
			var that = this;

			if (fetchLocation===this.fileBase) {
				return new Deferred().resolve([]);
			}

			return this.readEntries(this.rootDir).then(function(entries) {
				for (var i = 0; i < entries.length; i++) {
					if (entries[i].fullPath === location.substring(that.fileBase.length, location.indexOf("?") || location.length)) {
						console.out("HI");
						return Deferred.when(that.loadEntry(entries[i]), d.resolve, d.reject);
					}	
				}
			});

		},
		_getEntry: function(location) {
			return resolveEntryURL(location || this._rootLocation);
		},
		loadEntry: function(dirEntry, getChildren) {
			var that = this;
			var result = this.createJSONFromEntry(dirEntry);
			if (dirEntry.isDirectory) {
				return this.readEntries(dirEntry).then(function(entries) {
					//return Deferred.all(entries.map(that.createJSONFromEntry));
					return entries.map(that.createJSONFromEntry);
				}).then(function(children) {
					if (children) {
						result.Children = children;
					}
					return result;
				});	
			}
			return result;
		},
		loadWorkspaces: function() {
			return this.loadWorkspace("");
		},
		loadWorkspace: function(location) {
			var that = this;
			var d = new Deferred();

			chrome.storage.local.get("loadedDir", function (value) {
				if (value.loadedDir) {
					chrome.fileSystem.restoreEntry(value.loadedDir, function(restoredEntry) {
						that.rootDir = restoredEntry;
						Deferred.when(that.loadEntry(restoredEntry), d.resolve, d.reject);
					});
				} else {
					chrome.fileSystem.chooseEntry(
					 {
					 	type: 'openDirectory'
					 }, 
					 function(dirEntry) {
				 		if (!dirEntry) {
				 			//no file
				 			return;
				 		}
				 			chrome.storage.local.set({"loadedDir": chrome.fileSystem.retainEntry(dirEntry)});
				 			that.rootDir = dirEntry;
				 			Deferred.when(that.loadEntry(dirEntry), d.resolve, d.reject);
						});
				}

			});

			
			return d;
		},
		createJSONFromEntry: function(entry) {
			var result = {};
			result.Location = "/orionClient/chrome" + entry.fullPath;
			result.Name = entry.name;
			result.Directory = entry.isDirectory;
			if (entry.isDirectory) {
				result.ChildrenLocation = result.Location;
			}
			return result;
		},
		loadDirectory: function(theEntry) {
			var  dirEnt = theEntry;
			if (dirEnt.isDirectory) {
				var dirReader = dirEnt.createReader();
				var entries = [];

			}
		},
		createProject: function(url, projectName, serverPath, create) {
			throw new Error("Not supported"); //$NON-NLS-0$ 
		},
		deleteFile: function(location) {
			throw new Error("Not supported"); //$NON-NLS-0$ 
		},
		moveFile: function(sourceLocation, targetLocation, name) {
			throw new Error("Not supported"); //$NON-NLS-0$ 
		},
		copyFile: function(sourceLocation, targetLocation, name) {
			throw new Error("Not supported"); //$NON-NLS-0$ 
		},
		read: function(location, isMetadata) {
			var that = this;
			var d = new Deferred();
		

			if (this.rootDir) {
				if (isMetadata) {
					this.readEntries(this.rootDir).then(function(entries) {
						for (var i = 0; i < entries.length; i++) {
							if (entries[i].fullPath === location.substring(that.fileBase.length, location.indexOf("?") || location.length)) {
								console.out("HI");
								Deferred.when(that.loadEntry(entries[i]), d.resolve, d.reject);
							}	
						}
					});
				} else {

				}
			} else {
				chrome.storage.local.get("loadedDir", function (value) {
					if (value.loadedDir) {
						chrome.fileSystem.restoreEntry(value.loadedDir, function(restoredEntry) {
							that.readEntries(restoredEntry).then(function(entries) {
								for (var i = 0; i < entries.length; i++) {
									if (entries[i].fullPath === location.substring(that.fileBase.length, location.indexOf("?") || location.length)) {
										console.out("HI");
										Deferred.when(that.loadEntry(entries[i]), d.resolve, d.reject);
									}	
								}
							});
						});
					}
				});
			}
			
		
			return d;

			
		},
		/**
		 * Creates a folder.
		 * @param {String} parentLocation The location of the parent folder
		 * @param {String} folderName The name of the folder to create
		 * @return {Object} JSON representation of the created folder
		 */
		createFolder: function(parentLocation, folderName) {
			var that = this;
			return this._getEntry(parentLocation).then(function(dirEntry) {
				var d = new Deferred();
				dirEntry.getDirectory(folderName, {create:true}, function() {d.resolve(that.read(parentLocation + "/" + folderName, true));}, d.reject);
				return d;
			});
		},
		/**
		 * Create a new file in a specified location. Returns a deferred that will provide
		 * The new file object when ready.
		 * @param {String} parentLocation The location of the parent folder
		 * @param {String} fileName The name of the file to create
		 * @return {Object} A deferred that will provide the new file object
		 */
		createFile: function(fileName) {
			var that = this;
			
			var d = new Deferred();
			fileName.getFile(fileName, {create:true}, function() {d.resolve(that.read(parentLocation + "/" + fileName, true));}, d.reject);
			return d;
			
		}, 
		write: function(location, contents, args) {
			throw new Error("Not supported"); //$NON-NLS-0$ 
		},
		remoteImport: function(targetLocation, options) {
			throw new Error("Not supported"); //$NON-NLS-0$ 
		},
		remoteExport: function(sourceLocation, options) {
			throw new Error("Not supported"); //$NON-NLS-0$ 
		},
		readBlob: function(location) {
			return xhr("GET", location, { //$NON-NLS-0$ 
				responseType: "arraybuffer", //$NON-NLS-0$ 
				timeout: GIT_TIMEOUT
			}).then(function(result) {
				return result.response;
			});
		},
		writeBlob: function(location, contents, args) {
			throw new Error("Not supported"); //$NON-NLS-0$ 
		}
	};
	ChromeFileImpl.prototype.constructor = ChromeFileImpl;

	return ChromeFileImpl;
});