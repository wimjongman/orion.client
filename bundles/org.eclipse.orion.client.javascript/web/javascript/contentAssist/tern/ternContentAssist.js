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
	'tern/lib/tern',  //$NON-NLS-0$
	'javascript/contentAssist/tern/ternLoader' // //$NON-NLS-0$
], function(Deferred, Objects, Tern, TernLoader) {

	/**
	 * @description Creates a new TernContentAssist object
	 * @constructor
	 * @public
	 * @param {javascript.ASTManager} astManager An AST manager to create ASTs with
	 * @since 9.0
	 */
	function TernContentAssist(astManager) {
		this.astManager = astManager;
	}

	/**
	 * Main entry point to provider
	 */
	Objects.mixin(TernContentAssist.prototype, {

        lastFile: null,
        server: null,
        
		/**
		 * Called by the framework to initialize this provider before any <tt>computeContentAssist</tt> calls.
		 */
		initialize: function() {
		    this._getServer();
		},
        
		/**
		 * @description Implements the Orion content assist API v4.0
		 */
		computeContentAssist: function(editorContext, params) {
		    var that = this;
		    return editorContext.getFileMetadata().then(function(meta) {
		        return editorContext.getText().then(function(text) {
    		        return that._getServer().then(function(server) {
    		            var proposals = [];
        			   if(server) {
        			       //XXX hack, because we don't have access to the text of the file until now
        			       server.addFile(meta.location, text);
        			       server.request({query: {
        			                         type: "completions", 
        			                         file: meta.location,
        			                         types: true, 
        			                         origins: true,
        			                         docs: true,
        			                         end: params.offset,
        			                         guess: true
        			                       }}, 
        			                         function(error, comps) {
        			                             if(error) {
        			                                    // 
        			                             }
        			                             if(comps && comps.completions) {
        			                                 var completions = comps.completions;
        			                                 for(var i = 0; i < completions.length; i++) {
        			                                     var completion = completions[i];
            			                                 proposals.push(that._formatTernProposal(completion));
                							             }
                							             return proposals;
        			                             }
        			                         }
        			                      );
        			   } 
        			   return proposals;
        			});
    		    });
		    });
		},
		
		/**
		 * @name _formatTernProposal
		 * @description Formats the proposal
		 * @function
		 * @private
		 * @param {tern.Completion} completion The Tern proposal object
		 * @returns {orion.Proposal} An Orion-formatted proposal object
		 */
		_formatTernProposal: function _formatTernProposal(completion) {
		    var proposal = {
                relevance: 100,
                style: 'emphasis',
                overwrite: true
            };
            proposal.name = completion.name;
            if(typeof(completion.type) !== 'undefined') {
                if(completion.type.slice(0, 2) === 'fn') {
                    proposal.name = completion.name + completion.type.slice(2);
                } else {
                    switch(completion.type) {
        		        case '{}': {
        		            proposal.name += ' : Object';
        		            break;
        		        }
        		        case 'number': {
        		            proposal.name += ' : Number';
        		            break;
        		        }
        		        case 'string': {
        		            proposal.name += ' : String';
        		            break;
        		        }
        		        case '?': {
        		            proposal.name += ' : DOES NOT COMPUTE';
        		            break;
        		        } 
        		        default: null;
        		    }
    		    }
            }
            proposal.proposal = proposal.name;
            if(typeof(completion.doc) !== 'undefined') {
                proposal.description = ' - ' + completion.doc;
            }
            return proposal;
		},
		
		/**
		 * @name _startServer
		 * @description Starts the Tern server in a Deferred
		 * @function
		 * @private
		 */
		_getServer: function _getServer() {
		    return new Deferred().resolve(this._startServer());
		},
		
		/**
		 * @name _startServer
		 * @description Starts the Tern server if not done so
		 * @function
		 * @private
		 * @returns {tern.Server} The new or existing Tern server
		 */
		_startServer: function _startServer() {
		    if(!this.server) {
		        var options = {
    		        async: true,
    		        debug:true,
    		        defs: [],
    		        projectDir: '/',
    		        plugins: TernLoader.getTernPlugins(),
    		        getFile: this._getFile
    		    };
    		    this.server = new Tern.Server(options);
		    }
	        return this.server;
		},
		
		/**
		 * @name _getFile
		 * @description Tern server callback
		 * @function
		 * @private
		 * @param {String} file The file to load
		 * @returns {Object} The file object
		 */
		_getFile: function _getFile(file) {
		    if(this.server) {
		        //TODO this is a callback from the server
		        //TODO use the file client to get the contents
		    }
		},
		
		/**
		 * Notifies the AST manager of a change to the model.
		 * @param {Object} event
		 */
		updated: function(event) {
		    this._getServer().then(function(server) {
		        if(event.file.location) {
    		        server.addFile(event.file.location);
    		    }
		    });
		}
	});
	
	return {
		TernContentAssist : TernContentAssist
	};
});
