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
/*global chrome*/
define(["orion/Deferred", "orion/encoding-shim", "orion/URL-shim"], function(Deferred) {

	function readEntries(dirEntry) {
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
	}

	/**
	 * An implementation of the file service that understands the Orion 
	 * server file API. This implementation is suitable for invocation by a remote plugin.
	 */

	function ChromeFileImpl(rootLocation) {
		var _rootLocation = rootLocation;
		var _rootURL = new URL(rootLocation, window.location.href);
		var _rootEntry = null;
		
		function _toEntry(location) {
			var d = new Deferred();
			var url = new URL(location, window.location.href);
			if (url.href === _rootURL.href) {
				return d.resolve(_rootEntry);
			}
			var path = decodeURIComponent(url.pathname.substring(_rootURL.pathname.length));
			if (path.slice(-1) === "/") {
				_rootEntry.getDirectory(path, {create:false}, d.resolve, d.reject);
			} else {
				_rootEntry.getFile(path, {create:false}, d.resolve, d.reject);
			}
			return d.promise;
		}
		
		function _toLocation(entry) {
			var location = entry.fullPath.replace(_rootEntry.fullPath, _rootLocation.slice(0,-1));
			if (entry.isDirectory) {
				location += "/";
			}
			return location;
		}
		
		function _toJSON(entry) {
			var deferred = new Deferred();
			entry.getMetadata(function(metadata) {
				var result = {
					Attributes: {
						Archive: false,
						Hidden: false,
						ReadOnly: false,
						SymLink: false
					}
				};
				result.Location = _toLocation(entry);
				result.Name = entry.name;
				result.Length = metadata.size;
				result.LocalTimeStamp = metadata.modificationTime.getTime();
				result.Directory = entry.isDirectory;
				if (result.Directory) {
					result.ChildrenLocation = result.Location;
				}
				deferred.resolve(result);
			}, deferred.reject);
			return deferred;
		}
		

		
		function _chooseRootEntry() {
			var d = new Deferred();
			chrome.fileSystem.chooseEntry({
			 	type: 'openDirectory'
			 }, function(root) {
		 		if (!root) {
		 			d.reject("No root chosen");
		 			return;
		 		}
	 			chrome.storage.local.set({"_root": chrome.fileSystem.retainEntry(root)});
	 			_rootEntry = root;		
	 			d.resolve(root);
			});
			return d.promise;
		}
		function _restoreRootEntry() {
			var d = new Deferred();
			chrome.storage.local.get("_root", function (value) {
				if (value._root) {
					chrome.fileSystem.restoreEntry(value._root, function(root) {
						_rootEntry = root;
						d.resolve(root);
					});
				} else {
					d.reject();
				}
			});		
			return d.promise;
		}
		
		
		function _createParents(entry) {
			var d = new Deferred();
			var result = [];
			var rootFullPath = _rootEntry.fullPath;

			function handleParent(parent) {
				if (parent.fullPath !== rootFullPath) {
					var location = _toLocation(parent);
					result.push({
						Name: parent.name,
						Location: location,
						ChildrenLocation: location
					});
					parent.getParent(handleParent, d.reject);
				} else {
					d.resolve(result);
				}
			}
			if (rootFullPath === entry.fullPath) {
				d.resolve(null);
			} else {
				entry.getParent(handleParent, d.reject);
			}
			return d.promise;
		}

		/**
		 * Obtains the children of a remote resource
		 * @param location The location of the item to obtain children for
		 * @return A deferred that will provide the array of child objects when complete
		 */
		function fetchChildren(location) {
			return _toEntry(location).then(function(dirEntry) {
				return readEntries(dirEntry);
			}).then(function(entries) {
				return Deferred.all(entries.map(_toJSON));
			});
		}


		/**
		 * Loads all the user's workspaces. Returns a deferred that will provide the loaded
		 * workspaces when ready.
		 */
		function loadWorkspaces() {
			return loadWorkspace();
		}

		/**
		 * Loads the workspace with the given id and sets it to be the current
		 * workspace for the IDE. The workspace is created if none already exists.
		 * @param {String} location the location of the workspace to load
		 * @param {Function} onLoad the function to invoke when the workspace is loaded
		 */
		function loadWorkspace(location) {
			var result;
			location = location || _rootLocation;
			
			if (!_rootEntry) {
				return _restoreRootEntry().then(null, _chooseRootEntry).then(function() {
					return loadWorkspace(location);
				});
			}

			return _toEntry(location).then(function(dirEntry) {
				return _toJSON(dirEntry).then(function(json) {
					result = json;
					return readEntries(dirEntry);
				}).then(function(entries) {
					return Deferred.all(entries.map(_toJSON));
				}).then(function(children) {
					if (children) {
						result.Children = children;
					}
					return _createParents(dirEntry);
				}).then(function(parents) {
					if (parents) {
						result.Parents = parents;
					}
					return result;
				});
			});
		}

		/**
		 * Adds a project to a workspace.
		 * @param {String} url The workspace location
		 * @param {String} projectName the human-readable name of the project
		 * @param {String} serverPath The optional path of the project on the server.
		 * @param {Boolean} create If true, the project is created on the server file system if it doesn't already exist
		 */
		function createProject(parentLocation, projectName, serverPath, create) {
			return createFolder(parentLocation, projectName).then(function(project) {
				project.ContentLocation = project.Location;
				return project;
			});
		}
		/**
		 * Creates a folder.
		 * @param {String} parentLocation The location of the parent folder
		 * @param {String} folderName The name of the folder to create
		 * @return {Object} JSON representation of the created folder
		 */
		function createFolder(parentLocation, folderName) {
			return _toEntry(parentLocation).then(function(dirEntry) {
				var d = new Deferred();
				dirEntry.getDirectory(folderName, {
					create: true
				}, function() {
					d.resolve(read(parentLocation + folderName + "/", true));
				}, d.reject);
				return d.promise;
			});
		}
		/**
		 * Create a new file in a specified location. Returns a deferred that will provide
		 * The new file object when ready.
		 * @param {String} parentLocation The location of the parent folder
		 * @param {String} fileName The name of the file to create
		 * @return {Object} A deferred that will provide the new file object
		 */
		function createFile(parentLocation, fileName) {
			return _toEntry(parentLocation).then(function(dirEntry) {
				var d = new Deferred();
				dirEntry.getFile(fileName, {
					create: true
				}, function() {
					d.resolve(read(parentLocation + fileName, true));
				}, d.reject);
				return d.promise;
			});
		}
		/**
		 * Deletes a file, directory, or project.
		 * @param {String} location The location of the file or directory to delete.
		 */
		function deleteFile(location) {
			return _toEntry(location).then(function(entry) {
				var d = new Deferred();
				var remove = (entry.removeRecursively) ? "removeRecursively" : "remove";
				entry[remove](function() {
					d.resolve();
				}, d.reject);
				return d;
			});
		}

		/**
		 * Moves a file or directory.
		 * @param {String} sourceLocation The location of the file or directory to move.
		 * @param {String} targetLocation The location of the target folder.
		 * @param {String} [name] The name of the destination file or directory in the case of a rename
		 */
		function moveFile(sourceLocation, targetLocation, name) {
			if (sourceLocation.indexOf(_rootLocation) === -1 || targetLocation.indexOf(_rootLocation) === -1) {
				throw "Not supported";
			}

			return _toEntry(sourceLocation).then(function(entry) {
				return _toEntry(targetLocation).then(function(parent) {
					var d = new Deferred();
					entry.moveTo(parent, name, function() {
						d.resolve(read(targetLocation + encodeURIComponent(name || entry.name) + (entry.isDirectory ? "/":""), true));
					}, d.reject);
					return d.promise;
				});
			});
		}

		/**
		 * Copies a file or directory.
		 * @param {String} sourceLocation The location of the file or directory to copy.
		 * @param {String} targetLocation The location of the target folder.
		 * @param {String} [name] The name of the destination file or directory in the case of a rename
		 */
		function copyFile(sourceLocation, targetLocation, name) {
			if (sourceLocation.indexOf(_rootLocation) === -1 || targetLocation.indexOf(_rootLocation) === -1) {
				throw "Not supported";
			}

			return _toEntry(sourceLocation).then(function(entry) {
				return _toEntry(targetLocation).then(function(parent) {
					var d = new Deferred();
					entry.copyTo(parent, name, function() {
						d.resolve(read(targetLocation + encodeURIComponent(name || entry.name) + (entry.isDirectory ? "/":""), true));
					}, d.reject);
					return d.promise;
				});
			});
		}
		/**
		 * Returns the contents or metadata of the file at the given location.
		 *
		 * @param {String} location The location of the file to get contents for
		 * @param {Boolean} [isMetadata] If defined and true, returns the file metadata, 
		 *   otherwise file contents are returned
		 * @return A deferred that will be provided with the contents or metadata when available
		 */
		function read(location, isMetadata) {
			return _toEntry(location).then(function(entry) {
				if (isMetadata) {
					return _toJSON(entry).then(function(file) {
						return _createParents(entry).then(function(parents) {
							if (parents) {
								file.Parents = parents;
							}
							return file;
						});
					});
				}
				var d = new Deferred();
				entry.file(function(file) {
					var reader = new FileReader();
					reader.readAsText(file);
					reader.onload = function() {
						d.resolve(reader.result);
					};
					reader.onerror = function() {
						d.reject(reader.error);
					};
				});
				return d.promise;
			});
		}
		/**
		 * Writes the contents or metadata of the file at the given location.
		 *
		 * @param {String} location The location of the file to set contents for
		 * @param {String|Object} contents The content string, or metadata object to write
		 * @param {String|Object} args Additional arguments used during write operation (i.e. ETag) 
		 * @return A deferred for chaining events after the write completes with new metadata object
		 */
		function write(location, contents, args) {
			return _toEntry(location).then(null, function() {
				var lastSlash = location.lastIndexOf("/");
				var parentLocation = (lastSlash === -1) ? _rootLocation : location.substring(0, lastSlash + 1);
				var name = decodeURIComponent(location.substring(lastSlash + 1));
				return createFile(parentLocation, name).then(function() {
					return _toEntry(location).then(_toJSON);
				});
			}).then(function(entry) {
				var d = new Deferred();
				entry.createWriter(function(writer) {
					var blob = new Blob([contents]);
					writer.write(blob);
					var truncated = false;
					writer.onwrite = function() {
						if (!truncated) {
							truncated = true;
							writer.truncate(blob.size);
						} else {
							d.resolve(_toJSON(entry));
						}
					};
					writer.onerror = function() {
						d.reject(writer.error);
					};
				});
				return d.promise;
			});
		}
		/**
		 * Imports file and directory contents from another server
		 *
		 * @param {String} targetLocation The location of the folder to import into
		 * @param {Object} options An object specifying the import parameters
		 * @return A deferred for chaining events after the import completes
		 */
		function remoteImport(targetLocation, options) {
			throw "Not supported";
		}
		/**
		 * Exports file and directory contents to another server
		 *
		 * @param {String} sourceLocation The location of the folder to export from
		 * @param {Object} options An object specifying the export parameters
		 * @return A deferred for chaining events after the export completes
		 */
		function remoteExport(sourceLocation, options) {
			throw "Not supported";
		}
		
		function readBlob(location) {
			return _toEntry(location).then(function(entry) {
				var d = new Deferred();
				entry.file(function(file) {
					d.resolve(file);
				});
				return d.promise;
			});
		}
		function writeBlob(location, contents, args) {
			return write(location, contents, args);
		}
				
		this.fetchChildren = fetchChildren;		
		this.loadWorkspaces = loadWorkspaces;
		this.loadWorkspace = loadWorkspace;
		this.createProject = createProject;
		this.createFolder = createFolder;
		this.createFile = createFile;
		this.deleteFile = deleteFile;
		this.moveFile = moveFile;
		this.copyFile = copyFile;		
		this.read = read;
		this.write = write;
		this.remoteImport = remoteImport;
		this.remoteExport = remoteExport;
		this.readBlob = readBlob;
		this.writeBlob = writeBlob;		
	}

	return ChromeFileImpl;
});