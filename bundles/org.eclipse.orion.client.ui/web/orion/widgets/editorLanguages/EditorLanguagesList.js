/*******************************************************************************
 * @license
 * Copyright (c) 2012, 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: Anton McConville - IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
/* This PluginList widget provides a HTML list placeholder for PluginEntries, and
   provides JavaScript functions for user management of Orion plugins. It is designed
   to contain PluginEntry widgets */

define(['i18n!orion/settings/nls/messages', 'orion/i18nUtil', 'require', 'orion/Deferred', 'orion/commands', 'orion/commandRegistry', 'orion/commonHTMLFragments', 'orion/objects', 'orion/webui/littlelib',
		'orion/widgets/editorLanguages/EditorLanguagesEntry', 'orion/explorers/explorer', 'orion/editorLanguagesPreferences', 'orion/widgets/settings/LanguageImporter'
		], function(messages, i18nUtil, require, Deferred, mCommands, mCommandRegistry, mHTMLFragments, objects, lib, EditorLanguagesEntry, mExplorer, mEditorLanguagesPreferences, mLanguageImporter) {

	var Explorer = mExplorer.Explorer;
	var SelectionRenderer = mExplorer.SelectionRenderer;

	function _normalizeURL(location) {
		if (location.indexOf("://") === -1) { //$NON-NLS-0$
			var temp = document.createElement('a'); //$NON-NLS-0$
			temp.href = location;
	        return temp.href;
		}
		return location;
	}
	
	/**
	 * PluginListRenderer
	 */
	function PluginListRenderer(commandService, explorer) {
		SelectionRenderer.call(this, {}, explorer);
		this.commandService = commandService;
	}
	PluginListRenderer.prototype = Object.create(SelectionRenderer.prototype);
	PluginListRenderer.prototype.getCellElement = function(col_no, item, tableRow) {
		if (col_no === 0) {
			var pluginEntry = new EditorLanguagesEntry({plugin: item, commandService: this.commandService});
			pluginEntry.show();
			return pluginEntry.node;
		}
	};

	/**
	 * PluginListExplorer
	 */
	function PluginListExplorer(commandService) {
		this.renderer = new PluginListRenderer(commandService, this);
	}
	PluginListExplorer.prototype = Object.create(Explorer.prototype);

	/**
	 * PluginList
	 * UI interface element showing a list of plugins
	 */
	function PluginList(options, parentNode) {
		objects.mixin(this, options);
		this.node = parentNode || document.createElement("div"); //$NON-NLS-0$
	}
	objects.mixin(PluginList.prototype, {
		templateString: '' +  //$NON-NLS-0$
						'<div id="pluginSectionHeader" class="pluginSectionHeader sectionWrapper toolComposite">' +  /* pluginSectionHeader */ //$NON-NLS-0$
							'<div class="sectionAnchor sectionTitle layoutLeft"></div>' + /* pluginTitle */ //$NON-NLS-0$
							'<div class="sectionItemCount layoutLeft">0</div>' + /* pluginCount */ //$NON-NLS-0$
							'<div id="commands" class="pluginCommands layoutRight sectionActions"></div>' + /* pluginCommands */ //$NON-NLS-0$
						'</div>' + //$NON-NLS-0$

						'<div class="pageDescription"></div>' + //$NON-NLS-0$
				        '<div class="displaytable layoutBlock sectionTable">' + //$NON-NLS-0$
							'<div class="plugin-list-container">' + //$NON-NLS-0$
								'<div class="plugin-list" id="plugin-list" style="overflow:hidden;"></div>' + //$NON-NLS-0$ /* pluginList */
							'</div>' + //$NON-NLS-0$
						'</div>', //$NON-NLS-0$
				
		pluginDialogState: false,
		
		includeMaker: false,
		
		target: "_self", //$NON-NLS-0$

		createElements: function() {
			this.node.innerHTML = this.templateString;
			this.pluginSectionHeader = lib.$(".pluginSectionHeader", this.node); //$NON-NLS-0$
			this.pluginTitle = lib.$(".sectionAnchor", this.node); //$NON-NLS-0$
			this.pluginCount = lib.$(".sectionItemCount", this.node); //$NON-NLS-0$
			this.pluginCommands = lib.$(".commands", this.node); //$NON-NLS-0$
			this.description = lib.$(".pageDescription", this.node); //$NON-NLS-0$	
			this.pluginList = lib.$(".plugin-list", this.node); //$NON-NLS-0$
			this.postCreate();
		},

		destroy: function() {
			if (this.node) {
				lib.empty(this.node);
				this.node = this.pluginSectionHeader = this.pluginTitle = this.pluginCount = this.pluginCommands = this.description = this.pluginList = null;
			}
		},
				
		postCreate: function(){
			var _this = this;
			if (this.pluginSectionHeader) {
				// add a slideout
				var slideoutFragment = mHTMLFragments.slideoutHTMLFragment("pluginSlideout"); //$NON-NLS-0$
				var range = document.createRange();
				range.selectNode(this.pluginSectionHeader);
				slideoutFragment = range.createContextualFragment(slideoutFragment);
				this.pluginSectionHeader.appendChild(slideoutFragment);
			}
			this.render();
		},

		updateToolbar: function(id){
			if(this.pluginCommands) {
				this.commandService.destroy(this.pluginCommands);
			}
		},

		addLanguage: function(value) {
			
			
			
			var editorLanguagesPreferences = new mEditorLanguagesPreferences.EditorLanguagesPreferences(this.settings.preferences);
			editorLanguagesPreferences.getPrefs(function (prefs) {
				prefs[value.name] = value;
				editorLanguagesPreferences.setPrefs(prefs, function () {
					this._progress(messages["Language Imported"], "Normal"); //$NON-NLS-0$
				}.bind(this));
			}.bind(this));
		},
		
		_progress: function(msg, severity) {
			if (this.registry) {
				var messageService = this.registry.getService("orion.page.message"); //$NON-NLS-0$
				messageService.setProgressResult( {Message:msg, Severity:severity} );
			}
		},
		
		show: function(){
			this.createElements();

			this.updateToolbar();

			// set up the toolbar level commands	
			var installPluginCommand = new mCommands.Command({
				name: messages["Import"],
				tooltip: messages["Import a language"],
				id: "orion.installPlugin", //$NON-NLS-0$
				callback: function(data) {
					var languageImporter = new mLanguageImporter.LanguageImporter();
					languageImporter.showImportLanguageDialog(this);
				}.bind(this)
			});
			
			this.commandService.addCommand(installPluginCommand);
			this.commandService.registerCommandContribution("commands", "orion.installPlugin", 2, /* not grouped */ null, false, /* no key binding yet */ null, new mCommandRegistry.URLBinding("installPlugin", "url")); //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
			// Render the commands in the heading, emptying any old ones.
			this.commandService.renderCommands("commands", "commands", this, this, "button"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$

			this.description.textContent = messages["EditorLanguagesInfo"];
		},
	
		render: function(referenceplugin){
			
			var pluginRegistry = this.settings.pluginRegistry;
		
//			// Declare row-level commands so they will be rendered when the rows are added.
//			var reloadPluginCommand = new mCommands.Command({
//				name: messages["Reload"],
//				tooltip: messages["ReloadPlug"],
//				id: "orion.reloadPlugin", //$NON-NLS-0$
//				imageClass: "core-sprite-refresh", //$NON-NLS-0$
//				visibleWhen: function(items) {  // we expect a URL
//					return typeof items === "string"; //$NON-NLS-0$
//				},
//				callback: function(data) {
//					this.reloadPlugin(data.items);
//				}.bind(this)
//			});			
//			this.commandService.addCommand(reloadPluginCommand);
//			this.commandService.registerCommandContribution("pluginCommand", "orion.reloadPlugin", 1); //$NON-NLS-1$ //$NON-NLS-0$
//
			var uninstallLanguageCommand = new mCommands.Command({
				name: messages["Delete"],
				tooltip: messages["DeleteLanguageFromConfig"],
				imageClass: "core-sprite-delete", //$NON-NLS-0$
				id: "orion.uninstallLanguage", //$NON-NLS-0$
				visibleWhen: function(url) {  // we expect a URL
					return true;//!pluginRegistry.getPlugin(url).isDefaultPlugin; //$NON-NLS-0$
				},
				callback: function(data) {
					this.removeLanguage(data.items);
				}.bind(this)
			});			
			this.commandService.addCommand(uninstallLanguageCommand);
			this.commandService.registerCommandContribution("commands", "orion.uninstallPlugin", 1); //$NON-NLS-1$ //$NON-NLS-0$
//
//			var disablePluginCommand = new mCommands.Command({
//				name: messages["Disable"],
//				tooltip: messages["DisableTooltip"],
//				id: "orion.disablePlugin", //$NON-NLS-0$
//				imageClass: "core-sprite-stop", //$NON-NLS-0$
//				visibleWhen: function(url) {  // we expect a URL
//					var plugin = pluginRegistry.getPlugin(url);
//					if (plugin.isDefaultPlugin) {
//						return false;
//					}
//					return plugin._getAutostart() !== "stopped"; //$NON-NLS-0$
//				},
//				callback: function(data) {
//					this.disablePlugin(data.items);
//				}.bind(this)
//			});			
//			this.commandService.addCommand(disablePluginCommand);
//			this.commandService.registerCommandContribution("pluginCommand", "orion.disablePlugin", 3); //$NON-NLS-1$ //$NON-NLS-0$
//
//			
//			var enablePluginCommand = new mCommands.Command({
//				name: messages["Enable"],
//				tooltip: messages["EnableTooltip"],
//				id: "orion.enablePlugin", //$NON-NLS-0$
//				imageClass: "core-sprite-start", //$NON-NLS-0$
//				visibleWhen: function(url) {  // we expect a URL
//					var plugin = pluginRegistry.getPlugin(url);
//					if (plugin.isDefaultPlugin) {
//						return false;
//					}
//					return plugin._getAutostart() === "stopped"; //$NON-NLS-0$
//				},
//				callback: function(data) {
//					this.enablePlugin(data.items);
//				}.bind(this)
//			});			
//			this.commandService.addCommand(enablePluginCommand);
//			this.commandService.registerCommandContribution("pluginCommand", "orion.enablePlugin", 4); //$NON-NLS-1$ //$NON-NLS-0$
		
			var list = this.pluginList;
		
//			if(referenceplugin){
//				list = referenceplugin.pluginList;
//			}

			// mamacdon: re-rendering the list starts here
//			lib.empty( list );

			var editorLanguagesPreferences = new mEditorLanguagesPreferences.EditorLanguagesPreferences(this.settings.preferences);
			editorLanguagesPreferences.getPrefs(function(languages) {
				var languagesArray = [];
				for (var o in languages) {
				    languagesArray.push(languages[o]);
				}

				this.pluginCount.textContent = languagesArray.length;
				languagesArray.sort(function(a, b) {
					return (a.name || a.scopeName) < (b.name || b.scopeName) ? -1 : 1;
				});
				
				// TODO maybe this should only be done once
				this.explorer = new PluginListExplorer(this.commandService);
				this.pluginListTree = this.explorer.createTree(this.pluginList.id, new mExplorer.SimpleFlatModel(languagesArray, "language", function(item) { //$NON-NLS-1$ //$NON-NLS-0$
					return item.name || item.scopeName;
				}), { /*setFocus: false,*/ noSelection: true});
	
				for( var p = 0; p < languages.length; p++ ){
					var pluginEntry = new EditorLanguagesEntry({plugin: languages[p], commandService:this.commandService});
					list.appendChild(pluginEntry.node);
					pluginEntry.show();
				}
			}.bind(this));

			this.pluginTitle.textContent = messages['Languages'];
			
			//Temporary code
//			for (var i=0; i<plugins.length; i++) {
//				if (plugins[i]._default) {
//					plugins[i].isDefaultPlugin = true;
//				}
//			}			
			

		},
		
		pluginURLFocus: function(){
			this.pluginUrlEntry.value = '';
			this.pluginUrlEntry.style.color = "" ; //$NON-NLS-0$
		},
		
		pluginURLBlur: function(){
			if( this.pluginUrlEntry.value === '' ){
				this.pluginUrlEntry.value = messages['TypePlugURL'];
				this.pluginUrlEntry.style.color = "#AAA" ; //$NON-NLS-0$
			}
		},
		
		createPlugin: function( data ){
			var path = require.toUrl("settings/maker.html"); //$NON-NLS-0$
			window.open( path, this.target );
		},
		
		addPlugin: function( pluginUrl ){
			this.statusService.setMessage(i18nUtil.formatMessage(messages["Installed"], pluginUrl), 5000, true);
			var data = {};
			data[pluginUrl] = true;
			this.settings.preferences.put("/plugins", data).then(function() { //$NON-NLS-0$
				this.render();
			}.bind(this)); // this will force a sync
		},
		
		getPluginsLink: function( data ){		
			return this.pluginsUri;
		},

		pluginError: function( error ){
			this.statusService.setErrorMessage(error);
		},
		
		installHandler: function(newPluginUrl){
			if (/^\S+$/.test(newPluginUrl.trim())) {
				this.statusService.setMessage(i18nUtil.formatMessage(messages["Installing"], newPluginUrl), null, true);
				if( this.settings.pluginRegistry.getPlugin(newPluginUrl) ){
					this.statusService.setErrorMessage(messages["Already installed"]);
				} else {
					this.settings.pluginRegistry.installPlugin(newPluginUrl).then(function(plugin) {
						plugin.start({lazy:true}).then(this.addPlugin.bind(this, plugin.getLocation()), this.pluginError.bind(this));
					}.bind(this), this.pluginError.bind(this));
				}
			}
		},
		
		reloaded: function(){
			var settingsPluginList = this.settings.pluginRegistry.getPlugins();
			this.statusService.setMessage( ( settingsPluginList.length===1 ? i18nUtil.formatMessage(messages["ReloadedPlug"], settingsPluginList.length): i18nUtil.formatMessage(messages["ReloadedNPlugs"], settingsPluginList.length)), 5000, true );
			this.render();
		},
		
		setTarget: function(target) {
			this.target = target;
		},
		
		removeLanguage: function( url ){

			/* The id of the source element is programmed with the
				url of the plugin to remove. */
				
			// TODO: Should be internationalized
				
			var confirmMessage = i18nUtil.formatMessage(messages["UninstallCfrm"], url); //$NON-NLS-1$
			if (window.confirm(confirmMessage)) {
				//TODO doit!
				console.log("delete it!");
			}
		}
	});
	
	return PluginList;
});