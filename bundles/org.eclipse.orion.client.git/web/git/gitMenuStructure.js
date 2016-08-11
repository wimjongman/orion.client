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

		var gitPageActionsStructure = {
			scopeId: "pageActions",
			pathRoot: "",
			items: [
				{ commandId: "orion.toggleSidePane", bindingOnly: true, keyBinding: { key: "l", mods: util.isMac ? "24" : "12" } },
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
		commandRegistry.addMenu(gitIncomingActionsStructure);
		commandRegistry.addMenu(gitOutgoingActionsStructure);
		commandRegistry.addMenu(gitPageActionsStructure);
		commandRegistry.addMenu(gitItemCommandsStructure);
	}
	
	return { initMenus : initMenus };

});
