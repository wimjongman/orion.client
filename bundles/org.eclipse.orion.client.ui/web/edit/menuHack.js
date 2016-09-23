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

	var mainMenu;
	var focusItem;
	
	var isSeparator = function(menuItem) { return menuItem.classList.contains("dropdownSeparator");	};
	var isMenuBar = function(menu) { return menu.classList.contains("commandList");	};
	
	var getSubMenu = function(curItem) {
		var ulList = curItem.getElementsByTagName("ul");
		if (ulList.length > 0) {  // use role=hasPopup ?
			return ulList[0];
		}
		return null;
	};
	
	var setSelectionFeedback = function(menuItem, showFeedback) {
		var selClass = isMenuBar(menuItem.parentNode) ? "dropdownSelection" : "dropdownMenuItemSelected";
		if (showFeedback) {
			menuItem.children[0].classList.add(selClass);
		} else {
			menuItem.children[0].classList.remove(selClass);
		}
	};

	var clearSelection = function(menu) {
		for (var i = 0; i < menu.children.length; i++) {
			if (!isSeparator(menu.children[i])) {
				setSelectionFeedback(menu.children[i], false);
			}
		}
	};
	
	var closeSubMenu = function(subMenu) {
		subMenu.classList.remove("dropdownMenuOpen");
		subMenu.parentNode.setAttribute("aria-expanded", "false");
		clearSelection(subMenu);
	};
	
	var openSubMenu = function(subMenu) {
		// Close any open sub menus at this level or below
		var openSubMenus = subMenu.parentNode.getElementsByClassName("dropdownMenuOpen");
		for (var i = openSubMenus.length-1; i >= 0; i--) {
			closeSubMenu(openSubMenus[i]);
		}
		
		if (!isMenuBar(subMenu)) {
			subMenu.classList.add("dropdownMenuOpen");
		}	
		subMenu.parentNode.setAttribute("aria-expanded", "true");

		// Make the owner of the sub menu 'selected'
		setSelectionFeedback(subMenu.parentNode, true);
	};
	
	var selectItem = function(menuItem, showSubMenu) {
		if (!menuItem || isSeparator(menuItem))
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
		if (isSeparator(nextCandidate))
			return nextItem(nextCandidate);
		return nextCandidate;
	};

	var prevItem = function(curItem) {
		var prevCandidate = curItem.previousSibling ? curItem.previousSibling : curItem.parentNode.lastChild;
		if (isSeparator(prevCandidate))
			return prevItem(prevCandidate);
		return prevCandidate;
	};
	
	var subMenuKeyHandler = function(keyEvent) {
		if (keyEvent.keyCode === lib.KEY.RIGHT || keyEvent.keyCode === lib.KEY.LEFT || keyEvent.keyCode === lib.KEY.ESCAPE || keyEvent.keyCode === lib.KEY.UP || keyEvent.keyCode === lib.KEY.DOWN) {
			switch(keyEvent.keyCode) {
				case lib.KEY.RIGHT:
					var subMenu = getSubMenu(focusItem);
					if (subMenu) {
						selectItem(subMenu.firstChild);
					}
					break;
				case lib.KEY.ESCAPE:
				case lib.KEY.LEFT:
					selectItem(focusItem.parentNode.parentNode);
					break;
				case lib.KEY.UP:
					selectItem(prevItem(focusItem));				
					break;
				case lib.KEY.DOWN:
					selectItem(nextItem(focusItem));				
					break;
			}
	
			keyEvent.preventDefault();
			keyEvent.stopPropagation();
		}
	};
	
	var menuBarKeyHandler = function(keyEvent) {
		if (keyEvent.keyCode === lib.KEY.RIGHT || keyEvent.keyCode === lib.KEY.LEFT || keyEvent.keyCode === lib.KEY.DOWN) {
			switch(keyEvent.keyCode) {
				case lib.KEY.RIGHT:
					selectItem(nextItem(focusItem));
					break;
				case lib.KEY.LEFT:
					selectItem(prevItem(focusItem));
					break;
				case lib.KEY.DOWN:
					var subMenu = getSubMenu(focusItem);
					if (subMenu) {
						selectItem(subMenu.firstChild);
					}
					break;
			}
			keyEvent.preventDefault();
			keyEvent.stopPropagation();
		}
	};
	
	var cleanupForExit = function() {
		// Close any open sub menus
		var openSubMenus = mainMenu.getElementsByClassName("dropdownMenuOpen");
		for (var i = openSubMenus.length-1; i >= 0; i--) {
			closeSubMenu(openSubMenus[i]);
		}
		
		// remove any selection hilighting from the main memu
		for (var j = 0; j < mainMenu.children.length; j++) {
			setSelectionFeedback(mainMenu.children[j], false);
		}
		
		focusItem = undefined;
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
	
	var renderItems = function(domParent, curItem, commandRegistry) {
		if (!curItem.items) return;
		
		var items = curItem.items;
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			
			if (item.groupId) {
				if (item.title) {
					item.domElement = appendDomElement(domParent, "li", "dropdownSubMenu", null, "menuitem");
					item.domElement.setAttribute("aria-haspopup", "true");
					item.domElement.setAttribute('aria-expanded', "false");
					var outerSpan = appendDomElement(item.domElement, "span", "dropdownTrigger dropdownMenuItem");
					appendDomElement(outerSpan, "span", "dropdownCommandName", item.title);
					appendDomElement(outerSpan, "span", "dropdownArrowRight core-sprite-closedarrow");
					
					// Now create the sub-menu
					var subMenu = appendDomElement(item.domElement, "ul", "dropdownMenu", null, "menu");					
					renderItems(subMenu, item, commandRegistry);
				} else {
					appendDomElement(domParent, "li", "dropdownSeparator");
					renderItems(domParent, item, commandRegistry);
					appendDomElement(domParent, "li", "dropdownSeparator");
				}
			} else if (item.commandId) {
				item.domElement = appendDomElement(domParent, "li", null, null, "menuitem");
				var cmdSpan = appendDomElement(item.domElement, "span", "dropdownMenuItem", null);
				var cmd = commandRegistry._commandList[item.commandId];
				appendDomElement(cmdSpan, "span", "dropdownCommandName", cmd.name);
				
				if (item.keyBinding) {
					var mod1 = item.keyBinding.mods.indexOf("1") >= 0;
					var mod2 = item.keyBinding.mods.indexOf("2") >= 0;
					var mod3 = item.keyBinding.mods.indexOf("3") >= 0;
					var mod4 = item.keyBinding.mods.indexOf("4") >= 0;
					
					var keyBinding = new mKeyBinding.KeyBinding(item.keyBinding.key, mod1, mod2, mod3, mod4);
					var bindingString = UIUtils.getUserKeyString(keyBinding);
					appendDomElement(cmdSpan, "span", "dropdownKeyBinding", bindingString);
				}
			} else if (item.menuId) {
				item.domElement = appendDomElement(domParent, "li", null, null, "menuitem");
				item.domElement.setAttribute("aria-haspopup", "true");
				item.domElement.setAttribute('aria-expanded', "false");
				var menuButton = appendDomElement(item.domElement, "button", "dropdownTrigger orionButton commandButton", item.title);
				menuButton.addEventListener("focus", function(e) {
					selectItem(e.currentTarget.parentNode);
				});

				// Now create the sub-menu
				var mainSubMenu = appendDomElement(item.domElement, "ul", "dropdownMenu", null, "menu");				
				renderItems(mainSubMenu, item, commandRegistry);
				
				item.domElement.addEventListener("click", function(e) {
					clearSelection(mainMenu);
					selectItem(e.currentTarget, true);
				}, false);
			}
			
			if (item.domElement) {
				item.domElement.tabIndex = -1;
				if (isMenuBar(item.domElement.parentNode)) {
					item.domElement.addEventListener("keydown", function(e) {
						menuBarKeyHandler(e);
					});
				} else {
					item.domElement.addEventListener("keydown", function(e) {
						subMenuKeyHandler(e);
					});
					item.domElement.addEventListener("mouseenter", function(e) {
						selectItem(e.currentTarget, true);
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
				mainMenu = appendDomElement(hackDiv, "ul", "commandList layoutLeft pageActions", null, "menu");
				lib.addAutoDismiss([mainMenu], cleanupForExit);
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