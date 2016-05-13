/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:  IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/

define([
	'orion/EventTarget',
], function(EventTarget) {

	var SETTINGS_SECTION = "/editor/languages/settings"; //$NON-NLS-0$
	var SETTINGS_KEY = "editorLanguages"; //$NON-NLS-0$

	function EditorLanguagesPreferences(preferences, callback) {
		this._preferences = preferences;
		EventTarget.attach(this);
		preferences.addEventListener("changed", function (e) {
			if (e.namespace === SETTINGS_SECTION) {
				this.dispatchEvent({type: "Changed"}); //$NON-NLS-0$
			}
		}.bind(this));
		if (callback) {
			this.addEventListener("Changed", function(evt) { //$NON-NLS-0$
				callback(evt.preferences);
			});
		}
	}

	EditorLanguagesPreferences.prototype = /** @lends edit.EditorPreferences.prototype */ {
		_initialize: function(prefs) {
			return prefs[SETTINGS_KEY] || {};
		},
		getPrefs: function(callback) {
			this._preferences.get(SETTINGS_SECTION).then(function(prefs) {
				var object = this._initialize(prefs);
				if (typeof object === "string") { //$NON-NLS-0$
					object = JSON.parse(object);
				}
				callback(object);
			}.bind(this));
		},
		setPrefs: function(object, callback) {
			var data = {};
			data[SETTINGS_KEY] = object;
			this._preferences.put(SETTINGS_SECTION, data).then(function() {
				object = this._initialize(data);
				if (callback) {
					callback(object);
				}
				this.dispatchEvent({type: "Changed", preferences: object}); //$NON-NLS-0$
			}.bind(this));
		}
	};

	return { EditorLanguagesPreferences: EditorLanguagesPreferences };
});
