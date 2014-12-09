/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors: IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
/*global requirejs*/
define([], function() {
	function getMessages(root, withTanslation) {
		return withTanslation ? {
			root:root,
			"ja": true,
			"zh": true,
			"zh-tw": true,
			"fr": true,
			"de": true,
			"it": true,
			"es": true,
			"pt-br": true						
		} : { root:root};
	}
	return {
		getMessages: getMessages
	};
});