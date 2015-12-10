/*******************************************************************************
 * @license
 * Copyright (c) 2015 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 /*eslint-env amd, browser*/
define([
'orion/objects',
'javascript/finder',
'orion/Deferred',
'i18n!javascript/nls/messages',
"orion/i18nUtil"
], function(Objects, Finder, Deferred, Messages, i18nUtil) {

	/**
	 * @description Creates a new rename command
	 * @constructor
	 * @public
	 * @param {ASTManager} ASTManager The backing AST manager
	 * @param {TernServer} ternServer The running Tern server
	 * @returns {javascript.commands.RenameCommand} A new command
	 * @since 9.0
	 */
	function RenameCommand(ASTManager, ternServer, scriptResolver, CUProvider) {
		this.astManager = ASTManager;
		this.ternserver = ternServer;
		this.scriptResolver = scriptResolver;
		this.cuprovider = CUProvider;
		this.timeout = null;
	}

	Objects.mixin(RenameCommand.prototype, {
		/*
		 * override
		 * @callback
		 */
		execute: function(editorContext, options) {
			var that = this;
			var deferred = new Deferred();
			editorContext.getFileMetadata().then(function(metadata) {
				if(Array.isArray(metadata.parents) && metadata.parents.length > 1) {
					that.scriptResolver.setSearchLocation(metadata.parents[metadata.parents.length - 1].Location);
				} else {
					that.scriptResolver.setSearchLocation(null);	
				}
			    if(options.contentType.id === 'application/javascript') {
	    			return that._doRename(editorContext, options, deferred);
			    } else {
			        return editorContext.getText().then(function(text) {
			        	var offset = options.offset;
			        	var cu = that.cuprovider.getCompilationUnit(function(){
		            		return Finder.findScriptBlocks(text);
		            	}, {location:options.input, contentType:options.contentType});
    			        if(cu.validOffset(offset)) {
    			        	return that._doRename(editorContext, options, deferred);
    			        }
    			        return [];
			        }, deferred.reject);
			    }
			}, /* @callback */ function(err) {
				deferred.reject({Severity: 'Error', Message: Messages['noFileMeta']}); //$NON-NLS-1$
			});
			return deferred;
		},

		/**
		 * @description Actually do the work
		 * @function
		 * @private
		 * @param {orion.editor.EditorContext} editorContext The editor context
		 * @param {Object} params The parameters
		 * @returns {Deferred} A deferred to resolve
		 */
		_doRename: function _doRename(editorContext, params, deferred) {
			var that = this;
			return editorContext.getText().then(function(text) {
				if(that.timeout) {
					clearTimeout(that.timeout);
				}
				that.timeout = setTimeout(function() {
					deferred.reject({Severity: 'Error', Message: Messages['renameFailedTimedOut']}); //$NON-NLS-1$
					that.timeout = null;
				}, 5000);
				var files = [{type:'full', name:params.input, text:text}]; //$NON-NLS-1$
				that.ternserver.rename(params.input, params.offset, '', files, 
					function(val, err) {
						if(err) {
							deferred.reject({Severity: 'Warning', Message: badRename(err.error)}); //$NON-NLS-1$
						} else if(val.length > 0) {
							var offsets = [];
							for (var i = 0; i < val.length; i++) {
								offsets.push({
									offset: val[i].start,
									length: val[i].end - val[i].start
								});
							}
							var groups = [{data: {}, positions: offsets}];
							var linkModel = {groups: groups};
							editorContext.exitLinkedMode().then(function() {
								editorContext.enterLinkedMode(linkModel).then(deferred.resolve, deferred.reject);
							}, deferred.reject);
						}
					}
				);
			}, deferred.reject);
		}
	});

	/**
	 * @description Shims the default reason for not doing an inline rename, or returns the original error message if
	 * not the default
	 * @param {String} original The original message
	 * @returns {String} The message to present to the user
	 */
	function badRename(original) {
		if("Not at a variable." === original) {
			return Messages["badInlineRename"];
		}
		return i18nUtil.formatMessage(Messages["failedRename"], original);
	}

	return {
		RenameCommand : RenameCommand
	};
});
