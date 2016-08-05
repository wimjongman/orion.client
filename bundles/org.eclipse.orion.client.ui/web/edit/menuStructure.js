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
	"i18n!orion/edit/nls/messages",
	"orion/util"
], function(
	messages, util
) {
	var initMenus = function (commandRegistry) {
		if ("true" !== localStorage.getItem("useMenuStruct"))
			return;
		
		var fileMenuStructure = {
			scopeId: "fileActions",
			pathRoot: "",
			items: [
				{ groupId: "orion.menuBarFileGroup", title: messages["File"], items: [
					{ groupId: "orion.newContentGroup", title: messages["New"], items: [
						{ commandId: "eclipse.newFile" },
						{ commandId: "eclipse.newFolder" },
						{ commandId: "orion.new.project" },
						{ commandId: "orion.new.linkProject", filter: "Not Electron" },
						{ groupId: "orion.projectsNewGroup", title: messages["Project"] },
					] },
					{ groupId: "orion.edit.saveGroup", items: [
						{ commandId: "orion.edit.openFolder", keyBinding: { key: "o", mods: "1" } },
						{ commandId: "orion.edit.openRecent", keyBinding: { key: "r", mods: "1" } },
						{ commandId: "orion.openResource", keyBinding: { key: "f", mods: "1" } },
						{ commandId: "orion.edit.save", keyBinding: { key: "s", mods: "1" } },
					] },
					{ groupId: "orion.importGroup", title: messages["Import"], filter: "Not Electron", items: [
						{ commandId: "orion.import" },
						{ commandId: "orion.importZipURL" },
						{ commandId: "orion.importSFTP" },
					] },
					{ groupId: "orion.exportGroup", title: messages["Export"], filter: "Not Electron", items: [
						{ commandId: "eclipse.downloadSingleFile" },
						{ commandId: "eclipse.downloadFile" },
						{ commandId: "eclipse.exportSFTPCommand" },
					] },
				] },
			]
		};

		var editMenuStructure = {
			scopeId: "editActions",
			pathRoot: "",
			items: [
				{ groupId: "orion.menuBarEditGroup", title: messages["Edit"], items: [
					{ groupId: "orion.edit.undoGroup", items: [
						{ commandId: "orion.edit.undo", keyBinding: { key: "z", mods: "1" } },
						{ commandId: "orion.edit.redo", keyBinding: util.isMac ? { key: "z", mods: "12" } : { key: "y", mods: "1" } },
					] },
					{ groupId: "orion.findGroup", items: [
						{commandId: "orion.edit.find", keyBinding: { key: "f", mods: "1" }, urlBinding: "find/find" },
						{commandId: "orion.edit.gotoLine", keyBinding: util.isMac ? { key: "1", mods: "4" } : { key: "1", mods: "1" },
									urlBinding: "gotoLine/line" },
						{commandId: "orion.searchInFolder" },
						{commandId: "orion.quickSearch", keyBinding: { key: "h", mods: "1" } },
						{commandId: "orion.openSearch", keyBinding: { key: "h", mods: "12" } },
					] },
					{ groupId: "orion.formatGroup", items: [
						{commandId: "eclipse.renameResource", keyBinding: { key: 113, mods: "" } },
						{commandId: "orion.edit.format", keyBinding: { key: "f", mods: "23" },
									urlBinding: "format/format" },
					] },
					{ groupId: "orion.compareGroup", items: [
						{commandId: "eclipse.compareWith" },
						{commandId: "eclipse.compareWithEachOther" },
					] },
					{ groupId: "orion.clipboardGroup", items: [
						{commandId: "eclipse.cut", keyBinding: { key: "x", mods: "1" } },
						{commandId: "eclipse.copySelections", keyBinding: { key: "c", mods: "1" } },
						{commandId: "eclipse.pasteSelections", keyBinding: { key: "v", mods: "1" } },
						{commandId: "eclipse.deleteFile", keyBinding: { key: 46, mods: "" } },
					] },
				] },
			]
		};
		
		var viewMenuStructure = {
			scopeId: "viewActions",
			pathRoot: "",
			items: [
				{ groupId: "orion.menuBarViewGroup", title: messages["View"], items: [
					{ commandId: "eclipse.downFolder", keyBinding: { key: 40, mods: "3" }, filter: "Not Electron" },
					{ commandId: "eclipse.upFolder", keyBinding: { key: 38, mods: "3" }, filter: "Not Electron" },
					{ commandId: "orion.sidebar.viewmode" },
					{ groupId: "orion.slideoutMenuGroup", title: messages["Slideout"] },
					{ groupId: "eclipse.openWith", title: messages["OpenWith"] },
					{ groupId: "eclipse.fileCommandExtensions", title: messages["OpenRelated"] },
				] },
		]};

		var toolsMenuStructure = {
			scopeId: "toolsActions",
			pathRoot: "",
			items: [
				{ groupId: "orion.menuBarToolsGroup", title: messages["Tools"], items: [
					{ groupId: "orion.editorMenuBarMenuDelimitersGroup", title: messages["Convert Line Delimiters"], pos: 2000, items: [
						{ commandId: "orion.edit.convert.crlf", handler: this },
						{ commandId: "orion.edit.convert.lf", handler: this },
					] },
					{ commandId: "orion.edit.reloadWithEncoding", pos: 2001 },
				] },
			]};

		var editorContextMenuStructure = {
			scopeId: "editorContextMenuActions",
			pathRoot: "",
			items: [
				{ groupId: "orion.editorContextMenuGroup", items: [
					{ groupId: "orion.edit.copyGroup", items: [
						{ commandId: "orion.edit.copy" },
						{ commandId: "orion.edit.cut" },
						{ commandId: "orion.edit.paste" },
					] },
					{ groupId: "orion..edit.undoGroup", items: [
						{ commandId: "orion.edit.undo" },
						{ commandId: "orion.edit.redo" },
					] },
					{ groupId: "orion.edit.findGroup", items: [
						{ commandId: "orion.edit.find" },
						{ commandId: "orion.edit.gotoLine" },
						{ commandId: "orion.quickSearch" },
						{ commandId: "orion.openSearch" },
					] },
					{ groupId: "orion.edit.format", items: [
						{commandId: "orion.edit.format", keyBinding: { key: "f", mods: "23" },
									urlBinding: "format/format" },
					]},
					{ groupId: "orion.editorContextMenuToolsGroup", title: messages["Tools"], items: [
						{ commandId: "orion.edit.blame" },
						{ commandId: "orion.edit.diff" },
						{ groupId: "orion.editorContextMenuDelimitersGroup", title: messages["Convert Line Delimiters"], pos: 900, items: [
							{ commandId: "orion.edit.convert.crlf" },
							{ commandId: "orion.edit.convert.lf" },
						] },
						{ commandId: "orion.edit.reloadWithEncoding", pos: 1000 },  // Need the 'pos' to allow entensions to go before these elements
					] },
				] },
			]
		};

		var navContextMenuStructure = {
			scopeId: "pageSidebarContextMenucommonNavContextMenu",
			pathRoot: "",
			items: [
				{ groupId: "orion.commonNavContextMenuGroup", items: [
					{ groupId: "orion.newGroup", title: messages["New"], items: [
						{ commandId: "eclipse.newFile" },
						{ commandId: "eclipse.newFolder" },
						{ commandId: "orion.new.project" },
						{ commandId: "orion.new.linkProject", filter: "Not Electron" },  // non-Electron only
						{ groupId: "orion.New", items: [
							{ groupId: "orion.projectsNewGroup", title: messages["Project"] },
						]}
					] },
					{ groupId: "orion.editGroup", items: [
						{ commandId: "eclipse.cut" },
						{ commandId: "eclipse.copySelections" },
						{ commandId: "eclipse.pasteSelections" },
						{ commandId: "eclipse.deleteFile" },
						{ commandId: "eclipse.renameResource" },
					] },
					{ groupId: "orion.relatedActions", items: [
						{ groupId: "orion.OpenWith", title: messages["OpenWith"] },
						{ groupId: "orion.Extensions", title: messages["OpenRelated"] },
						{ commandId: "eclipse.compareWith" },
						{ commandId: "eclipse.compareWithEachOther" },
					] },
					{ groupId: "orion.ImportExport", items: [
						{ groupId: "orion.ImportGroup", title: messages["Import"], filter: "Not Electron", items: [    // Web-IDE only
							{ commandId: "orion.import" },
							{ commandId: "orion.importZipURL" },
							{ commandId: "orion.importSFTP" },
						] },
						{ groupId: "orion.ExportGroup", title: messages["Export"], filter: "Not Electron", items: [    // Web-IDE only
							{ commandId: "eclipse.downloadSingleFile" },
							{ commandId: "eclipse.downloadFile" },
							{ commandId: "eclipse.exportSFTPCommand" },
						] },
					] },
					{ commandId:  "orion.searchInFolder" },
					{ commandId:  "orion.problemsInFolder" },
				] },
			]
		};
		
		commandRegistry.addMenu(fileMenuStructure);
		commandRegistry.convertMenu(fileMenuStructure.scopeId, "", commandRegistry._menus[fileMenuStructure.scopeId].items, 0);

		commandRegistry.addMenu(editMenuStructure);
		commandRegistry.convertMenu(editMenuStructure.scopeId, "", commandRegistry._menus[editMenuStructure.scopeId].items, 0);

		commandRegistry.addMenu(viewMenuStructure);
		commandRegistry.convertMenu(viewMenuStructure.scopeId, "", commandRegistry._menus[viewMenuStructure.scopeId].items, 0);

		commandRegistry.addMenu(toolsMenuStructure);
		commandRegistry.convertMenu(toolsMenuStructure.scopeId, "", commandRegistry._menus[toolsMenuStructure.scopeId].items, 0);

		commandRegistry.addMenu(editorContextMenuStructure);
		commandRegistry.convertMenu(editorContextMenuStructure.scopeId, "", commandRegistry._menus[editorContextMenuStructure.scopeId].items, 0);

		commandRegistry.addMenu(navContextMenuStructure);
		commandRegistry.convertMenu(navContextMenuStructure.scopeId, "", commandRegistry._menus[navContextMenuStructure.scopeId].items, 0);
	}
	
	return { initMenus : initMenus };

});