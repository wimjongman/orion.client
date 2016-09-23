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
	'orion/commands',
	'orion/keyBinding',
	'orion/uiUtils',
	"orion/util",
	'orion/webui/littlelib'
], function(
	messages, mCommands, mKeyBinding, UIUtils, util,  lib
) {
	var mainMenuStructure = {
		menuBarId: "orion.main.menu",
		items: [
			{ menuId: "orion.menuBarFileGroup", title: messages["File"], items: [
				{ groupId: "orion.newContentGroup", title: messages["New"], items: [
					{ commandId: "eclipse.newFile" },
					{ commandId: "eclipse.newFolder" },
					{ commandId: "orion.new.project" },
					{ commandId: "orion.new.linkProject", filter: "Not Electron" },
					{ groupId: "orion.projectsNewGroup", title: messages["Project"], items: [
						{ commandId: "eclipse.newFolder" },
					] },
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
			{ menuId: "orion.menuBarEditGroup", title: messages["Edit"], items: [
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
			{ menuId: "orion.menuBarViewGroup", title: messages["View"], items: [
				{ commandId: "eclipse.downFolder", keyBinding: { key: 40, mods: "3" }, filter: "Not Electron" },
				{ commandId: "eclipse.upFolder", keyBinding: { key: 38, mods: "3" }, filter: "Not Electron" },
				{ commandId: "orion.sidebar.viewmode" },
				{ groupId: "orion.slideoutMenuGroup", title: messages["Slideout"], items: [
					{ commandId: "eclipse.newFolder" },
				] },
				{ groupId: "eclipse.openWith", title: messages["OpenWith"], items: [
					{ commandId: "eclipse.newFolder" },
				] },
				{ groupId: "eclipse.fileCommandExtensions", title: messages["OpenRelated"], items: [
					{ commandId: "eclipse.newFolder" },
				] },
			] },
			{ menuId: "orion.menuBarToolsGroup", title: messages["Tools"], items: [
				{ commandId: "orion.keyAssist", keyBinding: { key: 191, mods: "23" } },
				{ commandId: "orion.problemsInFolder", keyBinding: { key: "p", mods: "13" } },
				{ commandId: "orion.edit.showTooltip", keyBinding: { key: 113, mods: "" } },
				{ commandId: "orion.edit.blame", keyBinding: { key: "b", mods: "12" } },
				{ commandId: "orion.edit.diff", keyBinding: { key: "d", mods: "12" } },
				{ groupId: "orion.editorMenuBarMenuDelimitersGroup", title: messages["Convert Line Delimiters"], pos: 2000, items: [
					{ commandId: "orion.edit.convert.crlf", handler: this },
					{ commandId: "orion.edit.convert.lf", handler: this },
				] },
				{ commandId: "orion.edit.reloadWithEncoding", pos: 2001 },
			] },
		]
	};

	var focusItem;
	
	var getSubMenu = function(curItem) {
		var ulList = curItem.getElementsByTagName("ul");
		if (ulList.length > 0) {  // use role=hasPopup ?
			return ulList[0];
		}
		return null;
	};
	
	var setSelectionFeedback = function(menuItem, showFeedback) {
		var selClass = menuItem.parentNode.classList.contains("commandList") ? "dropdownSelection" : "dropdownMenuItemSelected";
		if (showFeedback) {
			menuItem.children[0].classList.add(selClass);
		} else {
			menuItem.children[0].classList.remove(selClass);
		}
	};
	
	var closeSubMenu = function(subMenu) {
		subMenu.classList.remove("dropdownMenuOpen");
		
		// Clear any 'selected' state
		for (var i = 0; i < subMenu.children.length; i++) {
			var item = subMenu.children[i];
			if (item.classList.contains("dropdownSeparator"))
				continue;
			setSelectionFeedback(item, false);
		}
	};
	
	var openSubMenu = function(subMenu) {
		// Close any open sub menus at this level or below
		var openSubMenus = subMenu.parentNode.getElementsByClassName("dropdownMenuOpen");
		for (var i = openSubMenus.length-1; i >= 0; i--) {
			closeSubMenu(openSubMenus[i]);
		}
		
		if (!subMenu.classList.contains("commandList")) {
			subMenu.classList.add("dropdownMenuOpen");
		}	

		// Make the owner of the sub menu 'selected'
		setSelectionFeedback(subMenu.parentNode, true);
	};
	
	var selectItem = function(menuItem, showSubMenu) {
		if (!menuItem || menuItem.classList.contains("dropdownSeparator"))
			return;

		if (focusItem) {
			setSelectionFeedback(focusItem, false);
		}
		
		// Ensure that the menu we're in is showing
		openSubMenu(menuItem.parentNode);
		setSelectionFeedback(menuItem, true);

		menuItem.focus();
		focusItem = menuItem;
		
		var subMenu = getSubMenu(menuItem);
		if (showSubMenu && subMenu) {
			openSubMenu(subMenu);
		}
	};
	
//	var updateItems = function(curItem, commandRegistry) {
//		if (!curItem.items) return;
//		
//		var items = curItem.items;
//		for (var i = 0; i < items.length; i++) {
//			var item = items[i];
//			
//			if (item.groupId) {
//				if (item.title) {
//					updateItems(item, commandRegistry);
//				} else {
//					updateItems(item, commandRegistry);
//				}
//			} else if (item.commandId) {
//				var command = commandRegistry._commandList[item.commandId];
//				var enabled = command && (command.visibleWhen ? command.visibleWhen(item) : true);
//				item.domElement.style.display = enabled ? "block" : "none";
//			}
//		}
//	};

	var nextItem = function(curItem) {
		var nextCandidate = curItem.nextSibling ? curItem.nextSibling : curItem.parentNode.firstChild;
		if (nextCandidate.classList.contains("dropdownSeparator"))
			return nextItem(nextCandidate);
		return nextCandidate;
	};

	var prevItem = function(curItem) {
		var prevCandidate = curItem.previousSibling ? curItem.previousSibling : curItem.parentNode.lastChild;
		if (prevCandidate.classList.contains("dropdownSeparator"))
			return prevItem(prevCandidate);
		return prevCandidate;
	};
	
	var subMenuKeyHandler = function(keyEvent) {
		var keys = {	tab: 9, enter: 13, esc: 27, space: 32, left: 37,  up: 38, right: 39, down: 40};

		var keyHandled = false;
		var curItem = focusItem;
		switch(keyEvent.keyCode) {
			case keys.right:
				var subMenu = getSubMenu(curItem);
				if (subMenu) {
					selectItem(subMenu.firstChild);
				}
				keyHandled = true;
				break;
			case keys.esc:
			case keys.left:
				selectItem(focusItem.parentNode.parentNode);
				keyHandled = true;
				break;
			case keys.up:
				selectItem(prevItem(curItem));				
				keyHandled = true;
				break;
			case keys.down:
				selectItem(nextItem(curItem));				
				keyHandled = true;
				break;
		}

		if (keyHandled) {
			keyEvent.preventDefault();
			keyEvent.stopPropagation();
		}
	};
	
	var menuBarKeyHandler = function(keyEvent) {
		var keys = {	tab: 9, enter: 13, esc: 27, space: 32, left: 37,  up: 38, right: 39, down: 40};

		var keyHandled = false;
		var curItem = focusItem;
		switch(keyEvent.keyCode) {
			case keys.right:
				selectItem(nextItem(curItem));
				keyHandled = true;
				break;
			case keys.left:
				selectItem(prevItem(curItem));
				keyHandled = true;
				break;
			case keys.down:
				var subMenu = getSubMenu(curItem);
				if (subMenu) {
					selectItem(subMenu.firstChild);
				}
				keyHandled = true;
				break;
		}

		if (keyHandled) {
			keyEvent.preventDefault();
			keyEvent.stopPropagation();
		}
	};
	
	// *********** Rendering code *************
	var appendDomElement = function(domParent, type, classList, text, role) {
		var newElement = document.createElement(type);		
		if (classList) {
			var classes = classList.split(" ");
			for (var i = 0; i < classes.length; i++) {				
				newElement.classList.add(classes[i]);
			}
		}
		if (text)	
			newElement.textContent = text;			
		if (role)	
			newElement.setAttribute("role", role);		
		domParent.appendChild(newElement);
		return newElement;
	};
	
	var renderSeparator = function(domParent) {
		appendDomElement(domParent, "li", "dropdownSeparator");
	};
	
	var renderItems = function(domParent, curItem, commandRegistry) {
		if (!curItem.items) return;
		
		var items = curItem.items;
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			
			if (item.groupId) {
				if (item.title) {
					item.domElement = appendDomElement(domParent, "li", "dropdownSubMenu");
					var outerSpan = appendDomElement(item.domElement, "span", "dropdownTrigger dropdownMenuItem", null, "menuitem");
					appendDomElement(outerSpan, "span", "dropdownCommandName", item.title);
					appendDomElement(outerSpan, "span", "dropdownArrowRight core-sprite-closedarrow");
					
					// Now create the sub-menu
					var subMenu = appendDomElement(item.domElement, "ul", "dropdownMenu", null, "menu");					
					renderItems(subMenu, item, commandRegistry);
				} else {
					renderSeparator(domParent);
					renderItems(domParent, item, commandRegistry);
					renderSeparator(domParent);
				}
			} else if (item.commandId) {
				item.domElement = appendDomElement(domParent, "li");
				var outerSpan = appendDomElement(item.domElement, "span", "dropdownMenuItem", null, "menuitem");
				var cmd = commandRegistry._commandList[item.commandId];
				appendDomElement(outerSpan, "span", "dropdownCommandName", cmd.name);
				
				if (item.keyBinding) {
					var mod1 = item.keyBinding.mods.indexOf("1") >= 0;
					var mod2 = item.keyBinding.mods.indexOf("2") >= 0;
					var mod3 = item.keyBinding.mods.indexOf("3") >= 0;
					var mod4 = item.keyBinding.mods.indexOf("4") >= 0;
					
					var keyBinding = new mKeyBinding.KeyBinding(item.keyBinding.key, mod1, mod2, mod3, mod4);
					var bindingString = UIUtils.getUserKeyString(keyBinding);
					appendDomElement(outerSpan, "span", "dropdownKeyBinding", bindingString);
				}
				item.domElement.addEventListener("mouseover", function(e) {
					selectItem(e.currentTarget);
				}, false);
			} else if (item.menuId) {
				item.domElement = appendDomElement(domParent, "li");
				var menuButton = appendDomElement(item.domElement, "button", "dropdownTrigger orionButton commandButton", item.title);
				menuButton.addEventListener("focus", function(e) {
					selectItem(e.currentTarget.parentNode);
				});

				// Now create the sub-menu
				var subMenu = appendDomElement(item.domElement, "ul", "dropdownMenu", null, "menu");				
				renderItems(subMenu, item, commandRegistry);
				
				item.domElement.addEventListener("click", function(e) {
					selectItem(e.currentTarget, true);
				}, false);
			}
			
			if (item.domElement) {
				item.domElement.tabIndex = -1;
				if (item.domElement.parentNode.classList.contains("commandList")) {
					item.domElement.addEventListener("keydown", function(e) {
						menuBarKeyHandler(e);
					});
				} else {
					item.domElement.addEventListener("keydown", function(e) {
						subMenuKeyHandler(e);
					});
					item.domElement.addEventListener("mouseenter", function(e) {
						var item = e.currentTarget;
						selectItem(item, true);
					}, false);
				}
			}
		}
		
		// Remove leading or trailing separators
		if (domParent.firstChild.classList.contains("dropdownSeparator"))
			domParent.removeChild(domParent.firstChild);
		if (domParent.lastChild.classList.contains("dropdownSeparator"))
			domParent.removeChild(domParent.lastChild);
	};
	
	var initMenuHack = function (commandRegistry) {
		this.commandRegistry = commandRegistry;
		
		var menuHackCmd = new mCommands.Command({
			commandRegistry: commandRegistry,
			selectionClass: "dropdownSelection", //$NON-NLS-0$
			name: "Menu HAck !!",
			tooltip: "Hack the Menu",
			id: "orion.menu.hack", //$NON-NLS-0$
			visibleWhen: function() {
				return true;
			},
			callback: function() {
				console.log("Testing the Menu Hack command");
				var hackDiv = lib.node("HackDiv");
				if (hackDiv) {
					while(hackDiv.firstChild){
					    hackDiv.removeChild(hackDiv.firstChild);
					}
				} else {
					focusItem = undefined;
					hackDiv =  appendDomElement(lib.node("rightPane"), "div", "mainToolbar");
					hackDiv.id = "HackDiv";
					hackDiv.style.left = "500px";
					hackDiv.style.top = "200px";
					hackDiv.style.display = "block";
					hackDiv.style.visibility = "visible";
					hackDiv.style.position = "absolute";
					hackDiv.style.zIndex = 500;
				}
				var mainMenu = appendDomElement(hackDiv, "ul", "commandList layoutLeft pageActions", null, "menu");
				mainMenu.id = "mainMenu";
	
				renderItems(mainMenu, mainMenuStructure, commandRegistry);
				console.log("Done Testing the Menu Hack command");
			}
		});
		commandRegistry.addCommand(menuHackCmd);
		commandRegistry.registerCommandContribution("editActions", "orion.menu.hack", 5000, "orion.menuBarEditGroup"); //$NON-NLS-1$ //$NON-NLS-0$
	};
	
	return { initMenuhack : initMenuHack };

});