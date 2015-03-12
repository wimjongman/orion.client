/*******************************************************************************
 * @license
 * Copyright (c) 2015 IBM Corporation, Inc. and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *   IBM Corporation - Initial API and implementation
 ******************************************************************************/
/*eslint-env amd */
define([
	'orion/Deferred',  //$NON-NLS-0$
	'orion/objects',  //$NON-NLS-0$
], /* @callback */ function(Deferred, Objects) {

	/**
	 * @description Creates a new TernContentAssist object
	 * @constructor
	 * @public
	 * @param {orion.FileClient} fileClient The Orion fileClient 
	 * @param {javascript.ASTManager} astManager An AST manager to create ASTs with
	 * @param {Object} ternWorker The Tern worker
	 * @since 9.0
	 */
	function TernContentAssist(fileClient, astManager, ternWorker) {
	    this.fileclient = fileClient;
		this.astManager = astManager;
		this.ternworker = ternWorker;
	}

	/**
	 * Main entry point to provider
	 */
	Objects.mixin(TernContentAssist.prototype, {

		/**
		 * @description Implements the Orion content assist API v4.0
		 */
		computeContentAssist: function(editorContext, params) {
		    var that = this;
		    return editorContext.getFileMetadata().then(function(meta) {
	           var d = new Deferred();
	           if(that.ternworker) {
	               that.ternworker.addEventListener('message', function(event) {
	                   var _d = event.data;
	                   if(typeof(_d) === 'object') {
	                       if(_d.request === 'assist') {
	                           d.resolve(_d.proposals);
	                       }
	                   } else if(!_d) {
	                       d.reject('No proposals');
	                   }
	               });
	               that.ternworker.postMessage({args: {meta: meta, params: params}, request: 'assist'});
	               return d;
	           }
		    });
		},
		
		/**
		 * Notifies the AST manager of a change to the model.
		 * @param {Object} event
		 */
		updated: function(event) {
	        if(this.ternworker && event.file.location) {
		        this.ternworker.postMessage({request: 'delfile', file: event.file.location});
		    }
		}
		
	});
	
	return {
		TernContentAssist : TernContentAssist
	};
});
