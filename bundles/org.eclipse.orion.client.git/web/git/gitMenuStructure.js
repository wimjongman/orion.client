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
	"i18n!git/nls/gitmessages",
	"orion/util"
], function(messages, util
) {
	var initMenus = function (commandRegistry) {
		if ("true" !== localStorage.getItem("useMenuStruct"))
			return;

		var gitIncomingActionsStructure = {
			scopeId: "IncomingActions",
			pathRoot: "",
			items: [
				{ commandId: "eclipse.orion.git.rebase" },
				{ commandId: "eclipse.orion.git.merge" },
				{ commandId: "eclipse.orion.git.mergeSquash" },
				{ groupId: "eclipse.gitFetchGroup", title: messages["fetchGroup"], tooltip: messages["fetchGroup"], defaultActionId: "eclipse.orion.git.fetch",  items: [
					{ commandId: "eclipse.orion.git.fetch" },
					{ commandId: "eclipse.orion.git.fetchForce" },
				]},
			]};

		var gitOutgoingActionsStructure = {
			scopeId: "OutgoingActions",
			pathRoot: "",
			items: [
				{ groupId: "eclipse.gitPushGroup", title: messages["pushGroup"], tooltip: messages["pushGroup"], defaultActionId: "eclipse.orion.git.push",  items: [
					{ commandId: "eclipse.orion.git.push" },
					{ commandId: "eclipse.orion.git.pushForce" },
					{ commandId: "eclipse.orion.git.pushBranch" },
					{ commandId: "eclipse.orion.git.pushForceBranch" },
					{ commandId: "eclipse.orion.git.pushToGerrit" },
				]},
			]};

		var dropdownRepositoryActionsStructure = {
			scopeId: "dropdownRepositoryActionsNode",
			pathRoot: "",
			items: [
				{ groupId: "eclipse.gitGroup",  items: [
					{ commandId: "eclipse.cloneGitRepository", urlBinding: "cloneGitRepository/url" },
					{ commandId: "eclipse.initGitRepository" },
					{ commandId: "eclipse.createGitProject", bindingOnly: true, urlBinding: "createProjectContext/name" },
				]},
			]};

		var gitPageActionsStructure = {
			scopeId: "pageActions",
			pathRoot: "",
			items: [
				{ commandId: "orion.toggleSidePane", bindingOnly: true, keyBinding: { key: "l", mods: util.isMac ? "24" : "12" } },
			]};

		var gitCommitsSectionActionsStructure = {
			scopeId: "commitsSectionActionArea",
			pathRoot: "",
			items: [
				{ commandId: "eclipse.orion.git.commit.toggleFilter", keyBinding: { key: "h", mods: "12" } },
				{ commandId: "eclipse.orion.git.rebaseContinueCommand" },
				{ commandId: "eclipse.orion.git.rebaseSkipPatchCommand" },
				{ commandId: "eclipse.orion.git.eclipse.orion.git.rebaseAbortCommand" },
				{ commandId: "eclipse.orion.git.commit.graph" },
				{ commandId: "eclipse.orion.git.commit.simpleLog" },
				{ commandId: "eclipse.orion.git.sync" },
			]};

		var gitFilterActionsStructure = {
			scopeId: "commitFilterActions",
			pathRoot: "",
			items: [
				{ commandId: "eclipse.orion.git.commit.clearFilter" },
				{ commandId: "eclipse.orion.git.commit.performFilter" },
			]};

		var gitExplorerSelectionStructure = {
			scopeId: "explorerSelection",
			pathRoot: "",
			items: [
				{ commandId: "orion.explorer.expandAll" },
				{ commandId: "orion.explorer.collapseAll" },
			]};

		var gitBranchesActionsStructure = {
			scopeId: "dropdownBranchesActionsNode",
			pathRoot: "",
			items: [
				{ commandId: "eclipse.addBranch" },
				{ commandId: "eclipse.addRemote" },
			]};

		var gitConfigActionsStructure = {
			scopeId: "dropdownConfigActionsNode",
			pathRoot: "",
			items: [
				{ commandId: "eclipse.orion.git.addConfigEntryCommand" },
			]};

		var gitStatusSectionActionsStructure = {
			scopeId: "statusSectionActionArea",
			pathRoot: "",
			items: [
				{ commandId: "eclipse.orion.git.showStagedPatchCommand" },
				{ commandId: "eclipse.orion.git.checkoutStagedCommand" },
				{ commandId: "eclipse.orion.git.precommitCommand" },
			]};

		var gitStatusSectionSelectionStructure = {
			scopeId: "statusSectionSelectionArea",
			pathRoot: "",
			items: [
				{ commandId: "eclipse.orion.git.popStash" },
				{ commandId: "eclipse.orion.git.precreateStashCommand" },
				{ commandId: "eclipse.orion.git.applyPatch" },
			]};

		var gitDiffSectionSelectionStructure = {
			scopeId: "diffSectionSelectionArea",
			pathRoot: "",
			items: [
				{ commandId: "eclipse.checkoutCommit" },
				{ commandId: "eclipse.orion.git.undoCommit" },
				{ commandId: "eclipse.orion.git.resetIndex" },
				{ commandId: "eclipse.orion.git.addTag" },
				{ commandId: "eclipse.orion.git.cherryPick" },
				{ commandId: "eclipse.orion.git.revert" },
				{ commandId: "eclipse.openGitCommit" },
				{ commandId: "eclipse.orion.git.showCommitPatchCommand" },
			]};

		var gitCompareWidgetRightActionsStructure = {
			scopeId: "compareWidgetRightActions",
			pathRoot: "",
			items: [
				{ commandId: "orion.compare.openComparePage" },
				{ commandId: "orion.compare.ignoreWhitespace" },
				{ commandId: "orion.compare.generateLink" },
				{ commandId: "orion.compare.copyToLeft", keyBinding: { key: 37, mods: "13"} },
				{ commandId: "orion.compare.copyToRight", keyBinding: { key: 39, mods: "13"} },
				{ commandId: "orion.compare.nextDiff", keyBinding: { key: 40, mods: "1"} },
				{ commandId: "orion.compare.prevDiff", keyBinding: { key: 38, mods: "1"} },
				{ commandId: "orion.compare.nextChange", bindingOnly: true, keyBinding: { key: 40, mods: "13"} },  // if(compareWidget.options.wordLevelNav) === false
				{ commandId: "orion.compare.prevChange", bindingOnly: true, keyBinding: { key: 38, mods: "13"} },
			]};

		var gitCompareWidgetLeftActionsStructure = {
			scopeId: "compareWidgetLeftActions",
			pathRoot: "",
			items: [
				{ commandId: "orion.compare.toggleInline2Way" },  // compareCommands#198
				{ commandId: "eclipse.orion.git.toggleMaximizeCommand" },
			]};

		var gitItemCommandsStructure = {
			scopeId: "itemLevelCommands",
			pathRoot: "",
			items: [
				// From gitRepoList
				{ commandId: "eclipse.git.addSubmodule" },
				{ commandId: "eclipse.git.syncSubmodules" },
				{ commandId: "eclipse.git.updateSubmodules" },
				{ commandId: "eclipse.git.deleteSubmodule" },
				{ commandId: "eclipse.git.deleteClone" },
				// From gitBranchList
				{ commandId: "eclipse.orion.git.applyStash" },
				{ commandId: "eclipse.checkoutTag" },
				{ commandId: "eclipse.checkoutBranch" },
				{ commandId: "eclipse.orion.git.fetchRemote" },
				{ commandId: "eclipse.checkoutPullRequest" },
				{ commandId: "eclipse.orion.git.dropStash" },
				{ commandId: "eclipse.removeBranch" },
				{ commandId: "eclipse.removeRemoteBranch" },
				{ commandId: "eclipse.removeRemote" },
				{ commandId: "eclipse.removeTag" },
				{ commandId: "eclipse.openGithubPullRequest" },
				// From gitCionfigList
				{ commandId: "eclipse.orion.git.editConfigEntryCommand" },
				{ commandId: "eclipse.orion.git.deleteConfigEntryCommand" },
				// From gitChangeList
				{ commandId: "eclipse.orion.git.diff.showCurrent" },
				{ commandId: "eclipse.openGitDiff" },
				// From gitCommitList
				{ commandId: "eclipse.checkoutCommit" },
				{ commandId: "eclipse.orion.git.undoCommit" },
				{ commandId: "eclipse.orion.git.resetIndex" },
				{ commandId: "eclipse.orion.git.addTag" },
				{ commandId: "eclipse.orion.git.cherryPick" },
				{ commandId: "eclipse.orion.git.revert" },
				{ commandId: "eclipse.openGitCommit" },
				{ commandId: "eclipse.orion.git.showCommitPatchCommand" },
			]};
					
		// Register the menus
		console.log("==================== Start Menu Registration ====================");
		commandRegistry.addMenu(gitIncomingActionsStructure);
		commandRegistry.addMenu(gitOutgoingActionsStructure);
		commandRegistry.addMenu(dropdownRepositoryActionsStructure);
		commandRegistry.addMenu(gitPageActionsStructure);
		commandRegistry.addMenu(gitCommitsSectionActionsStructure);
		commandRegistry.addMenu(gitFilterActionsStructure);
		commandRegistry.addMenu(gitExplorerSelectionStructure);
		commandRegistry.addMenu(gitBranchesActionsStructure);
		commandRegistry.addMenu(gitConfigActionsStructure);
		commandRegistry.addMenu(gitStatusSectionActionsStructure);
		commandRegistry.addMenu(gitStatusSectionSelectionStructure);
		commandRegistry.addMenu(gitDiffSectionSelectionStructure);
		commandRegistry.addMenu(gitCompareWidgetLeftActionsStructure);
		commandRegistry.addMenu(gitCompareWidgetRightActionsStructure);
		commandRegistry.addMenu(gitItemCommandsStructure);
		console.log("==================== End Menu Registration ====================");
	};
	
	return { initMenus : initMenus };

});
