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
'orion/Deferred',
'i18n!javascript/nls/messages'
], function(Objects, Deferred, Messages) {

	/**
	 * @description Creates a new open declaration command
	 * @constructor
	 * @public
	 * @param {javascript.ASTManager} ASTManager The backing AST manager
	 * @param {TernServer} ternServer The running Tern server
	 * @param {javascript.CUProvider} cuProvider
	 * @returns {javascript.commands.OpenImplementationCommand} A new command
	 * @since 10.0
	 */
	function OpenImplementationCommand(ASTManager, ternServer, cuProvider) {
		this.astManager = ASTManager;
		this.ternserver = ternServer;
		this.cuprovider = cuProvider;
		this.timeout = null;
	}

	Objects.mixin(OpenImplementationCommand.prototype, {
		/* override */
		execute: function(editorContext, options) {
			var that = this;
			var deferred = new Deferred();
			editorContext.getText().then(function(text) {
		     	return that._findImpl(editorContext, options, text, deferred);
			}, deferred.reject);
			return deferred;
		},

		_findImpl: function(editorContext, options, text, deferred) {
			if(this.timeout) {
				clearTimeout(this.timeout);
			}
			this.timeout = setTimeout(function() {
				deferred.reject({Severity: 'Error', Message: Messages['implTimedOut']}); //$NON-NLS-1$
				this.timeout = null;
			}, 5000);
			var files = [{type: 'full', name: options.input, text: text}]; //$NON-NLS-1$
			this.ternserver.implementation(options.input, options.offset, true, files,
				function(val, err) {
					clearTimeout(this.timeout);
					if(err) {
						deferred.reject(err.message);
					} else if(val) {
						if(val.guess) {
							//TODO handle a guess
						}
						var opts = Object.create(null);
						opts.start = val.start;
						opts.end = val.end;
						deferred.resolve(editorContext.openEditor(val.file, opts));
					} else {
						deferred.reject({Severity: 'Warning', Message: Messages['noImplFound']}); //$NON-NLS-1$
					}
				}.bind(this)
			);
		}
	});

	return {
		OpenImplementationCommand : OpenImplementationCommand
	};
});