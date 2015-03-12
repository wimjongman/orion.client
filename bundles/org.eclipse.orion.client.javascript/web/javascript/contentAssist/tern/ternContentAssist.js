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
	'tern/plugin/doc_comment', //TODO must load them, they self-register with Tern
	'tern/plugin/requirejs',
	'orion/fileClient',
	'javascript/hover',
	'tern/defs/ecma5',
	'tern/defs/browser'
], /* @callback */ function(Deferred, Objects, Tern, docPlugin, requirePlugin, FileClient, Hover, ecma5, browser) {

	/**
	 * @description Creates a new TernContentAssist object
	 * @constructor
	 * @public
	 * @param {orion.FileClient} fileClient The Orion fileClient 
	 * @param {javascript.ASTManager} astManager An AST manager to create ASTs with
	 * @since 9.0
	 */
	function TernContentAssist(fileClient, astManager, ternWorker) {
	    this.fileclient = fileClient;
	    var _self = this;
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
		        return that._getServer().then(function(server) {
		           var d = new Deferred();
		           var proposals = [];
    			   if(server) {
    			       server.request({query: {
    			                         type: "completions", 
    			                         file: meta.location,
    			                         types: true, 
    			                         origins: true,
    			                         urls: true,
    			                         docs: true,
    			                         end: params.offset,
    			                         guess: true
    			                       }}, 
    			                         function(error, comps) {
    			                             if(error) {
    			                                 d.reject(error);
    			                             }
    			                             if(comps && comps.completions) {
    			                                 var completions = comps.completions;
    			                                 for(var i = 0; i < completions.length; i++) {
    			                                     var completion = completions[i];
        			                                 proposals.push(that._formatTernProposal(completion));
            							         }
            							         d.resolve(proposals);
    			                             }
    			                         }
    			                      );
    			   } 
    			   return d;
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
                var type = completion.type.replaceAll('->', ':');
                type = type.replaceAll('?', 'Any');
                if(/^fn/.test(type)) {
                    proposal.name = completion.name + type.slice(2);
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
        		            proposal.name += ' : Any';
        		            break;
        		        } 
        		        default: null;
        		    }
    		    }
            }
            proposal.proposal = proposal.name;
            var obj = Object.create(null);
            obj.type = 'markdown';
            obj.content = '';
            if(!completion.doc) {
                obj.content += proposal.name;
            } else {
                obj.content += Hover.formatMarkdownHover(completion.doc).content;
            }
            if(completion.url) {
                obj.content += '\n\n[Online documentation]('+completion.url+')';
            }
            proposal.hover = obj;
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
    		        defs: [ecma5, browser],
    		        projectDir: '/',
    		        plugins: {
    		            doc_comment: {
    		                fullDocs: true
    		            },
    		            requirejs: {
    		                baseURL: '/'
    		            }
    		        },
    		        getFile: this._getFile.bind(this)
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
		 * @param {Function} callback The loaded callback
		 * @returns {Object} The file object
		 */
		_getFile: function _getFile(file, callback) {
		    if(this.server) {
	           return this.fileclient.read(file).then(function(f) {
	               callback(null, f);
	           },
	           function(error) {
	               callback(error, null);
	           });
		    }
		},
		
		/**
		 * Notifies the AST manager of a change to the model.
		 * @param {Object} event
		 */
		updated: function(event) {
		    this._getServer().then(function(server) {
		        if(event.file.location) {
    		        server.delFile(event.file.location);
    		    }
		    });
		}
		
	});
	
	return {
		TernContentAssist : TernContentAssist
	};
});
