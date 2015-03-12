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
/*globals importScripts onmessage:true doctrine*/
/*eslint-env node, browser*/
importScripts('../../requirejs/require.js'); // synchronous
require({
	baseUrl: "../../",
	paths: {
		text: "requirejs/text",
		esprima: "esprima/esprima",
		estraverse: "estraverse/estraverse",
		escope: "escope/escope",
		logger: "javascript/logger",
		doctrine: 'doctrine/doctrine'
	},
	packages: [
		{
			name: "eslint/conf",
			location: "eslint/conf"
		},
		{
			name: "eslint",
			location: "eslint/lib",
			main: "eslint"
		},
	]
},
[
    'javascript/signatures',
	'tern/lib/tern',
	'tern/plugin/doc_comment', //TODO must load them, they self-register with Tern
	/*'tern/plugin/requirejs',*/
	'tern/defs/ecma5',
	'tern/defs/browser',
	'doctrine'  //stays last - exports into global
],
/* @callback */ function(Signatures, Tern, docPlugin, /*requirePlugin,*/ ecma5, browser) {
    
    var ternserver, pendingReads = Object.create(null);
    
    /**
     * @description Start up the Tern server, send a message after trying
     */
    function startServer() {
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
                getFile: _getFile
            };
        
        ternserver = new Tern.Server(options);
        if(ternserver) {
            postMessage("ternstarted");
        } else {
            postMessage("ternfailed");
        }
    }
    startServer();
    
    onmessage = function(event) {
        if(typeof(event.data) === 'object') {
            var _d = event.data;
            if(typeof(_d.request) === 'string') {
                switch(_d.request) {
                    case 'assist': {
                        doContentAssist(_d.args);
                        break;
                    }
                    case 'occurrences': {
                        doOccurrences(_d.args);
                        break;
                    }
                    case 'decl': {
                        doFindDeclaration(_d.args);
                        break;
                    }
                    case 'hover': {
                        doHover(_d.args);
                        break;
                    }
                    case 'delfile': {
                        deleteFile(_d.args);
                        break;
                    }
                    case 'contents': {
                        doContents(_d.args);
                        break;
                    }
                }
            }
        }
    };
    
    function doContents(args) {
        var err = args.error;
        var contents = args.contents;
        var file = args.file;
        var read = pendingReads[file];
        if(typeof(read) === 'function') {
            read(err, contents);
        }
        delete pendingReads[file];
    }
    
    /**
     * @description Handles the request for completion proposals
     * @param {Object} args The arguments from the framework
     * @returns Returns nothing, but posts the results back to the framework
     */
    function doContentAssist(args) {
        if(ternserver) {
           var proposals = [];
	       ternserver.request({
	           query: {
	           type: "completions", 
	           file: args.meta.location,
	           types: true, 
	           origins: true,
	           urls: true,
	           docs: true,
	           end: args.params.offset,
	           guess: true
	           }}, 
	           function(error, comps) {
	               if(error) {
	                   postMessage({error: error, message: 'Failed to compute proposals'});
	               }
	               if(comps && comps.completions) {
	                   var completions = comps.completions;
        	           for(var i = 0; i < completions.length; i++) {
            	           var completion = completions[i];
            		       proposals.push(_formatTernProposal(completion));
        			   }
        			   postMessage({request: 'assist', proposals:proposals});
	               }
	           });
	       
	   } else {
	       postMessage({message: 'failed to compute proposals, server not started'});
	   }
    }
    
    /**
	 * @name _formatTernProposal
	 * @description Formats the proposal
	 * @function
	 * @private
	 * @param {tern.Completion} completion The Tern proposal object
	 * @returns {orion.Proposal} An Orion-formatted proposal object
	 */
	function _formatTernProposal(completion) {
	    var proposal = {
            relevance: 100,
            style: 'emphasis',
            overwrite: true
        };
        proposal.name = completion.name;
        if(typeof(completion.type) !== 'undefined') {
            var type = completion.type.replace('->', ':');
            type = type.replace('?', 'Any');
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
            obj.content += formatMarkdownHover(completion.doc).content;
        }
        if(completion.url) {
            obj.content += '\n\n[Online documentation]('+completion.url+')';
        }
        proposal.hover = obj;
        return proposal;
	}
    
    /**
	 * @description Formats the hover info as markdown text
	 * @param {Object} node The AST node or {@link Definition}
	 * @returns returns
	 */
	function formatMarkdownHover(node) {
	    if(!node) {
	        return null;
	    }
	    try {
	        var format = Object.create(null);
	        var comment = Object.create(null);
	        if(typeof node === "string") {
	           comment.value = node;
	        }
	        if(comment) {
		        var doc = doctrine.parse(comment.value, {recoverable:true, unwrap : true});
		        format.params = [];
		        format.desc = (doc.description ? doc.description : '');
		        if(doc.tags) {
		            var len = doc.tags.length;
		            for(var i = 0; i < len; i++) {
		                var tag = doc.tags[i];
		                switch(tag.title) {
		                    case 'name': {
		                        if(tag.name) {
		                          format.name = tag.name; 
		                        }
		                        break;
		                    }
		                    case 'description': {
		                        if(tag.description !== null) {
		                          format.desc = (format.desc === '' ? tag.description : format.desc+'\n'+tag.description);
		                        }
		                        break;
		                    }
		                    case 'param': {
		                        format.params.push(_convertTagType(tag.type) +
		                                  (tag.name ? '__'+tag.name+'__ ' : '') + 
		                                  (tag.description ? tag.description+'\n' : ''));
		                        break;
		                    }
		                    case 'returns': 
		                    case 'return': {
		                        format.returns = _convertTagType(tag.type) +
		                              (tag.description ? tag.description+'\n' : '');
		                         break;
		                    }
		                    case 'since': {
		                        if(tag.description) {
		                          format.since = tag.description;
		                        }
		                        break;
		                    }
		                    case 'function': {
		                        format.isfunc = true;
		                        break;
		                    }
		                    case 'constructor': {
		                        format.iscon = true;
		                        break;
		                    }
		                    case 'private': {
		                        format.isprivate = true;
		                        break; 
		                    }
	                }
		            }
		        }
	        }
	        if(comment.node) {
    	        var _name = Signatures.computeSignature(comment.node);
    	        var title = '###';
    	        if(format.isprivate) {
    	            title += 'private ';
    	        }
    	        if(format.iscon) {
    	            title += 'constructor ';
    	        }
    	        title += _name.sig+'###';
	        }
	        var hover = '';
	        if(format.desc !== '') {
	            hover += format.desc+'\n\n';
	        }
	        if(format.params.length > 0) {
	            hover += '__Parameters:__\n\n';
	            for(i = 0; i < format.params.length; i++) {
	                hover += '>'+format.params[i] + '\n\n';
	            }
	        }
	        if(format.returns) {
	            hover += '__Returns:__\n\n>' + format.returns + '\n\n';
	        }
	        if(format.since) {
	            hover += '__Since:__\n\n>'+format.since;
	        }
	        //TODO scope this to not show when you are on a decl
	        /**var href = new URITemplate("#{,resource,params*}").expand(
	                      {
	                      resource: metadata.location, 
	                      params: {start:node.range[0], end: node.range[1]}
	                      }); //$NON-NLS-0$
	        hover += '\n\n\n  [Jump to declaration]('+href+')';*/
	    }
	    catch(e) {
	        //do nothing, show what we have
	    }
	    return {content: hover, title: title, type:'markdown'};
	}
    
    /**
	 * @description Converts the doctrine tag type to a simple form to appear in the hover
	 * @private
	 * @param {Object} tag Teh doctrine tag object
	 * @returns {String} The simple name to display for the given doctrine tag type
	 */
	function _convertTagType(type) {
	    if(!type) {
	        return '';
	    }
        switch(type.type) {
            case 'NameExpression': {
                if(type.name) {
                  return '*('+type.name+')* ';
                }
                break;
            }
            case 'RecordType': {
                return '*(Object)* ';
            }
            case 'FunctionType': {
                return '*(Function)* ';
            }
            case 'NullableType': 
            case 'NonNullableType':
            case 'OptionalType':
            case 'RestType': {
                return _convertTagType(type.expression);
            }
            case 'TypeApplication': {
                //we only want to care about the first part i.e. Object[] vs. Object.<string, etc>
                if(type.expression.name === 'Array') {
                    //we need to grab the first application
                    if(type.applications && type.applications.length > 0) {
                        var val = type.applications[0];
                        if(val.name) {
                            //simple type
                            return '*('+val.name+'[])* ';
                        } else if(val.fields && val.fields.length > 0) {
                            return _convertTagType(val.fields[0]);
                        } else {
                            //fallback to trying to format the raw value
                            return _convertTagType(val);
                        }
	                    
	                }
                }
                return _convertTagType(type.expression);
            }
            case 'UnionType': 
            case 'ArrayType': {
                if(type.elements && type.elements.length > 0) {
                    //always just take the first type
                    return _convertTagType(type.elements[0]);
                }
                break;
            }
            case 'FieldType': {
                return _convertTagType(type.value);
            }
            default: return '';
        }
	}
    
    /**
     * @description Removes a file from Tern
     * @param {Object} args the request args
     */
    function deleteFile(args) {
        if(ternserver && typeof(args.file) === 'string') {
            ternserver.delFile(args.file);
        } else {
            postMessage('Failed to delete file from Tern: '+args.file);
        }
    }
    
    /**
     * @description Handles the request for occurrences
     * @param {Object} args The arguments from the framework
     * @returns Returns nothing, but posts the results back to the framework
     */
    function doOccurrences(args) {
        //TODO
        var occurrences = [];
        postMessage(occurrences, [occurrences]); //avoid copy-back
    }
    
    /**
     * @description Handles the request for finding a declaration
     * @param {Object} args The arguments from the framework
     * @returns Returns nothing, but posts the results back to the framework
     */
    function doFindDeclaration(args) {
        //TODO
        var decl = {};
        postMessage(decl, [decl]); //avoid copy-back
    }
    
    /**
     * @description Handles the request for hover
     * @param {Object} args The arguments from the framework
     * @returns Returns nothing, but posts the results back to the framework
     */
    function doHover(args) {
        //TODO
        var hover = {};
        postMessage(hover, [hover]); //avoid copy-back
    }
    
    /**
     * @description Read a file from the workspace into Tern
     * @private
     * @param {String} file The full path of the file
     * @param {Function} callback The callback once the file has been read or failed to read
     */
    function _getFile(file, callback) {
        if(ternserver) {
           pendingReads[file] = callback;
           postMessage({request: 'read', file:file});
	    } else {
	       postMessage('Failed to read file into Tern: '+file);
	    }
    }
});