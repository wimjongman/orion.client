/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
define([
	"orion/util"
], function(util
) {
	var initMenus = function (commandRegistry) {
		if ("true" !== localStorage.getItem("useMenuStruct"))
			return;
				
		var pageNavigationActionsActionsStructure = {
			scopeId: "pageNavigationActions",
			pathRoot: "",
			items: [
				{commandId: "orion.edit.gotoLine", bindingOnly: true, keyBinding: util.isMac ? { key: "1", mods: "4" } : { key: "1", mods: "1" }, urlBinding: "gotoLine/line" },
				{commandId: "orion.edit.find", bindingOnly: true, keyBinding: { key: "f", mods: "1" }, urlBinding: "find/find" },
				{ commandId: "orion.compare.openComparePage" },
				{ commandId: "orion.compare.generateLink", keyBinding: { key: "l", mods: "12"} },
				{ commandId: "orion.compare.toggleInline2Way" },
				{ commandId: "orion.compare.ignoreWhitespace" },
				{ commandId: "orion.compare.copyToLeft", keyBinding: { key: 37, mods: "13"} },
				{ commandId: "orion.compare.copyToRight", keyBinding: { key: 39, mods: "13"} },
				{ commandId: "orion.compare.nextDiff", keyBinding: { key: 40, mods: "1"} },
				{ commandId: "orion.compare.prevDiff", keyBinding: { key: 38, mods: "1"} },
				{ commandId: "orion.compare.nextChange", bindingOnly: true, keyBinding: { key: 40, mods: "13"} },
				{ commandId: "orion.compare.prevChange", bindingOnly: true, keyBinding: { key: 38, mods: "13"} },
			]};

		// Register the menus
		commandRegistry.addMenu(pageNavigationActionsActionsStructure);
	};
	
	return { initMenus : initMenus };

});
