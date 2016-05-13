/******************************************************************************* 
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define(['orion/editor/textStyler', 'orion/editor/textMateStyler', 'orion/editor/AsyncStyler', 'orion/Deferred', 'orion/editorLanguagesPreferences',], 
		function(mTextStyler, mTextMateStyler, AsyncStyler, Deferred, mEditorLanguagesPreferences) {

	var languagesPreferences;

	/**
	 * Returns a promise that will provide a styler for the given content type.
	 * @param {orion.serviceregistry.ServiceRegistry} serviceRegistry
	 * @param {orion.core.ContentTypeRegistry} contentTypeService
	 * @param {orion.core.ContentType} contentType
	 * @param {orion.editor.TextView} textView
	 * @param {orion.editor.AnnotationModel} annotationModel
	 * @param {String} [fileName] Deprecated.
	 * @param {Boolean} [allowAsync=true]
	 * @returns {orion.Deferred}
	 */
	function createStyler(serviceRegistry, contentTypeService, contentType, textView, annotationModel, fileName, allowAsync) {
		
		/* returns a promise if provider matches, or null otherwise */
		function getPromise(provider, extension) {
			var contentTypeIds = provider.getProperty("contentType") || provider.getProperty("contentTypes"), //$NON-NLS-1$ //$NON-NLS-0$
			    fileTypes = provider.getProperty("fileTypes"); //$NON-NLS-0$
			if (contentTypeIds) {
				return Deferred.when(contentTypeService.isSomeExtensionOf(contentType, contentTypeIds)).then(
					function (isMatch) {
						return isMatch ? provider : null;
					});
			} else if (extension && fileTypes && fileTypes.indexOf(extension) !== -1) {
				var d = new Deferred();
				d.resolve(provider);
				return d;
			}
			return null;
		}
		
		function isAllowed(provider) {
			return allowAsync || provider.getProperty("type") !== "highlighter"; //$NON-NLS-1$ //$NON-NLS-0$
		}

		if (!this.orionGrammars) {
			this.orionGrammars = {};
		}

		/* check services */
		var extension = fileName && fileName.split(".").pop().toLowerCase(); //$NON-NLS-0$
		var serviceRefs = serviceRegistry.getServiceReferences("orion.edit.highlighter"); //$NON-NLS-0$
		var textmateGrammars = [], promises = [];
		for (var i = 0; i < serviceRefs.length; i++) {
			var serviceRef = serviceRefs[i];
			var type = serviceRef.getProperty("type"); //$NON-NLS-0$
			if (type === "grammar") { //$NON-NLS-0$
				textmateGrammars.push(serviceRef.getProperty("grammar")); //$NON-NLS-0$
			} else if (type !== "highlighter") { //$NON-NLS-0$
				var id = serviceRef.getProperty("id"); //$NON-NLS-0$
				if (id && !this.orionGrammars[id]) {
					this.orionGrammars[id] = {
						id: id,
						contentTypes: serviceRef.getProperty("contentTypes"), //$NON-NLS-0$
						patterns: serviceRef.getProperty("patterns"), //$NON-NLS-0$
						repository: serviceRef.getProperty("repository") //$NON-NLS-0$
					};
				}
			}
			var promise = getPromise(serviceRef, extension);
			if (promise) {
				promises.push(promise);
			}
		}

		/* check preferences for imported grammars */
		var keys = Object.keys(languagesPreferences);
		keys.forEach(function(key) {
			var grammar = languagesPreferences[key];
			var grammarId = grammar.scopeName || grammar.name;

			var fakeServiceRef = (function(id, grammar, fileTypes) {
				var result = {};
				result.getProperty = function(key) {
					if (key === "fileTypes") return fileTypes; //$NON-NLS-0$
					if (key === "type") return "imported"; //$NON-NLS-1$ //$NON-NLS-0$
					if (key === "grammar") return grammar; //$NON-NLS-0$
					if (key === "id") return id; //$NON-NLS-0$
					return null;
				};
				return result;
			})(grammarId, grammar, grammar.fileTypes.join(","));

			/* will override an identically-named grammar defined in a service */		
			this.orionGrammars[grammarId] = {
				id: grammarId,
				contentTypes: grammar.fileTypes,
				patterns: grammar.patterns,
				repository: grammar.repository
			};
				
			var promise = getPromise(fakeServiceRef, extension);
			if (promise) {
				promises.push(promise);
			}
		}.bind(this));

		return Deferred.all(promises, function(error) {return {_error: error};}).then(function(promises) {
			var matches = [];
			for (var i = 0; i < promises.length; i++) {
				var promise = promises[i];
				if (promise && !promise._error && isAllowed(promise)) {
					matches.push(promise);
				}
			}
			
			function getTypeRank(type) {
				if (type === "imported") {
					return 1;
				}
				if (type === "grammar") {
					return 3;
				}
				if (type === "highlighter") {
					return 4;
				}
				return 2; /* default syntax styling service */
			}
			matches.sort(function(e1, e2) {
				var e1Value = getTypeRank(e1.getProperty("type"));
				var e2Value = getTypeRank(e2.getProperty("type"));
				return e1Value < e2Value ? -1 : 1;
			});

			if (matches.length) {
				var provider = matches[0];
				var type = provider.getProperty("type"); //$NON-NLS-0$
				if (type === "highlighter") { //$NON-NLS-0$
					var styler = new AsyncStyler(textView, serviceRegistry, annotationModel);
					styler.setContentType(contentType);
					return styler;
				}
				if (type === "grammar") { //$NON-NLS-0$
					var textmateGrammar = provider.getProperty("grammar"); //$NON-NLS-0$
					return new mTextMateStyler.TextMateStyler(textView, textmateGrammar, textmateGrammars);
				}
				var grammars = [];
				for (var key in this.orionGrammars) {
				    grammars.push(this.orionGrammars[key]);
				}
				mTextStyler.createPatternBasedAdapter(grammars, provider.getProperty("id"), contentType ? contentType.id : provider.getProperty("id")).then(function(stylerAdapter) {
					return new mTextStyler.TextStyler(textView, annotationModel, stylerAdapter);
				});
			} else if (!contentType || contentType.id !== "text/x-markdown") { //$NON-NLS-0$
				/* even if a grammar was not found create a default pattern adapter so that whitespace will be shown if appropriate */
				mTextStyler.createPatternBasedAdapter([], "").then(function(stylerAdapter) {
					return new mTextStyler.TextStyler(textView, annotationModel, stylerAdapter);
				});
			}
		});
	}

	/**
	 * @name orion.highlight.SyntaxHighlighter
	 * @class
	 * @description 
	 * <p>Requires service {@link orion.core.ContentTypeRegistry}</p>
	 * @param {orion.serviceregistry.ServiceRegistry} serviceRegistry Registry to look up highlight providers from.
	 * @param {orion.core.ContentType} [contentTypeService=null] A stand alone content type service that is not registered in the service registry.
	 */
	function SyntaxHighlighter(serviceRegistry, contentTypeService, preferences) {
		this.serviceRegistry = serviceRegistry;
		this.contentTypeService = contentTypeService;
		if (preferences) {			
			new mEditorLanguagesPreferences.EditorLanguagesPreferences(preferences).getPrefs(function(result) {
				languagesPreferences = result;
			}.bind(this));
		}
		this.styler = null;
	}
	SyntaxHighlighter.prototype = /** @lends orion.highlight.SyntaxHighlighter.prototype */ {
		/**
		 * @param {orion.core.ContentType} contentType
		 * @param {orion.editor.TextView} textView
		 * @param {orion.editor.AnnotationModel} annotationModel
		 * @param {String} [fileName] <i>Deprecated.</i> For backwards compatibility only, service-contributed highlighters
		 * will be checked against the file extension instead of contentType.
		 * @param {Boolean} [allowAsync=true] If true, plugin-contributed asynchronous highlighters (i.e. <code>type == "highlighter"</code>
		 * will be consulted. If false, only rule-based highlighters will be consulted.
		 * @returns {orion.Deferred} A promise that is resolved when this highlighter has been set up.
		 */
		setup: function(fileContentType, textView, annotationModel, fileName, allowAsync) {
			allowAsync = typeof allowAsync === "undefined" ? true : allowAsync; //$NON-NLS-0$
			if (this.styler) {
				if (this.styler.destroy) {
					this.styler.destroy();
				}
				this.styler = null;
			}
			var self = this;
			return createStyler(this.serviceRegistry, this.contentTypeService ? this.contentTypeService : this.serviceRegistry.getService("orion.core.contentTypeRegistry"), //$NON-NLS-0$
				fileContentType, textView, annotationModel, fileName, allowAsync).then(
					function(styler) {
						self.styler = styler;
						return styler;
					});
		},
		getStyler: function() {
			return this.styler;
		}
	};
	return {
		createStyler: createStyler,
		SyntaxHighlighter: SyntaxHighlighter
	};
});
