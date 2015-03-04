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
'tern/plugin/angular',
'tern/plugin/component',
'tern/plugin/doc_comment',
'tern/plugin/node',
'tern/plugin/requirejs'
], function(Angular, Component, DocComment, Node, RequireJS) {
	
	/**
	 * @name getTernPlugins
	 * @description Returns the object of Tern plugins to load in the server
	 * @returns {Object} The Tern plugin object
	 */
	function getTernPlugins() {
	    //TODO this is a hack - need to look them up and load as needed, we do not want all defs loaded unless
	    //there is a directive stating the user is using them
	    return {
	      angular: Angular,
//	      component: Component,
	      doc_comment: DocComment,
	      node: Node,
	      requirejs: RequireJS
	    };
	}
	
	return {
		getTernPlugins: getTernPlugins
	};
});
