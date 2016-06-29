/*******************************************************************************
 * @license
 * Copyright (c) 2014 IBM Corporation and others. All rights reserved. This
 * program and the accompanying materials are made available under the terms of
 * the Eclipse Public License v1.0 (http://www.eclipse.org/legal/epl-v10.html),
 * and the Eclipse Distribution License v1.0
 * (http://www.eclipse.org/org/documents/edl-v10.html).
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define(['orion/keyAssist', 'orion/commands', 'i18n!orion/nls/messages'], function(mKeyAssist, mCommands, messages) {
	var keyAssist;
	function createKeyAssistCommand(commandRegistry) {
		keyAssist = new mKeyAssist.KeyAssistPanel({
			commandRegistry: commandRegistry
		});
		var keyAssistCommand = new mCommands.Command({
			name: messages["Show Keys"],
			tooltip: messages["ShowAllKeyBindings"],
			id: "orion.keyAssist", //$NON-NLS-0$
			callback: function () {
				if (keyAssist.isVisible()) {
					keyAssist.hide();
				} else {
					keyAssist.show();
				}
				return true;
			}
		});
		commandRegistry.addCommand(keyAssistCommand);
		return keyAssistCommand;
	}

	return {
		createKeyAssistCommand: createKeyAssistCommand,
	};
});