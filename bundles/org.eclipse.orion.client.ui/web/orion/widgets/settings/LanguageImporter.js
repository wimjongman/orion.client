/*******************************************************************************
 * @license
 * Copyright (c) 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors: Anton McConville - IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/

define([
        'i18n!orion/settings/nls/messages',
        'orion/webui/dialog',
        'text!orion/widgets/themes/templates/ImportLanguageDialogTemplate.html',
        'orion/widgets/themes/dialogs/urlImportDialog',
        'orion/objects',
        'orion/widgets/settings/plist2js'
], function(messages, dialog, ImportLanguageDialogTemplate, urlImportDialog, objects, mPlist2js) {

        function LanguageImporter() {
        }


        function parseToXML(text) {
            try {
                var parser = new DOMParser();
                var xml = parser.parseFromString(text, "text/xml"); //$NON-NLS-0$
                var found = xml.getElementsByTagName("parsererror"); //$NON-NLS-0$
                if (!found || !found.length || !found[0].childNodes.length) {
                    return xml;
                }
            } catch (e) { /* suppress */ }
            return null;
        }

        LanguageImporter.prototype.parseToXML = parseToXML;

        // Changes XML to JSON
        function xmlToJson(xml) {
            // Create the return object
            var obj = {};
            if (xml.nodeType === 1) { // element
                // do attributes
                if (xml.attributes.length > 0) {
                    for (var j = 0; j < xml.attributes.length; j++) {
                        var attribute = xml.attributes.item(j);
                        obj[attribute.nodeName] = attribute.value;
                    }
                }
            } else if (xml.nodeType === 3) { // text
                obj = xml.nodeValue.trim(); // add trim here
            }
            // do children
            if (xml.hasChildNodes()) {
                for (var i = 0; i < xml.childNodes.length; i++) {
                    var item = xml.childNodes.item(i);
                    var nodeName = item.nodeName;
                    if (typeof(obj[nodeName]) === "undefined") { //$NON-NLS-0$
                        var tmp = xmlToJson(item);
                        if (tmp !== "") // if not empty string
                            obj[nodeName] = tmp;
                    } else {
                        if (typeof(obj[nodeName].push) === "undefined") { //$NON-NLS-0$
                            var old = obj[nodeName];
                            obj[nodeName] = [];
                            obj[nodeName].push(old);
                        }
                        tmp = xmlToJson(item);
                        if (tmp !== "") // if not empty string
                            obj[nodeName].push(tmp);
                    }
                }
            }
            return obj;
        }

        var ImportLanguageDialog = function(options) {
            options = options || {};
            this.options = options;
            objects.mixin(this, options);
            this._init(options);
        };
        ImportLanguageDialog.prototype = new dialog.Dialog();
        objects.mixin(ImportLanguageDialog.prototype, {
            TEMPLATE: ImportLanguageDialogTemplate,
            _init: function(options) {
                this.title = messages["Import a language"]; //$NON-NLS-1$
                this.buttons = [
                    /*{ text: "Import from a URL", callback: this.urlButtonClicked.bind(this), id: "urlThemeImportBtn" }, Hidden for now*/
                    { text: messages["Import"], callback: this.importFromTextarea.bind(this), id: "textAreaImportBtn" } //$NON-NLS-1$
                ];
                this.modal = true;

                this._initialize();
            },
            _bindToDom: function() {
                this.$importButton = this.$buttonContainer.firstChild;
                this.$importButton.classList.add('disabled'); //$NON-NLS-0$

                this.appendThemeList();
            },
            appendThemeList: function() {
                var docFragment = document.createDocumentFragment(),
                    dropZone = document.createElement("div"), //$NON-NLS-0$
                    textBox = document.createElement("textarea"); //$NON-NLS-0$

                dropZone.className = "drop-zone"; //$NON-NLS-0$
                dropZone.id = "dropZone"; //$NON-NLS-0$
                dropZone.textContent = messages["dndTheme"];
                docFragment.appendChild(dropZone);

                dropZone.addEventListener("dragenter", this.dragEnter.bind(this)); //$NON-NLS-0$
                dropZone.addEventListener("dragleave", this.dragLeave.bind(this)); //$NON-NLS-0$
                dropZone.addEventListener("dragover", this.dragOver.bind(this)); //$NON-NLS-0$
                dropZone.addEventListener("drop", this.dragAndDropped.bind(this)); //$NON-NLS-0$

                textBox.rows = "4"; //$NON-NLS-0$
                textBox.cols = "35"; //$NON-NLS-0$
                textBox.placeholder = messages["textLanguage"];
                textBox.id = "themeText"; //$NON-NLS-0$
                textBox.tabIndex = "-1"; //$NON-NLS-0$
                textBox.addEventListener("input", this.watchTextarea.bind(this)); //$NON-NLS-0$

                docFragment.appendChild(textBox);
                this.$importLanguageMessage.innerHTML = messages["ImportLanguageDialogMessage"];
                this.$importLanguageContainer.appendChild(docFragment, null);
            },
            watchTextarea: function() {
                var textArea = document.getElementById("themeText"); //$NON-NLS-0$
                if (textArea.value.length > 0) {
                    this.$importButton.classList.remove("disabled"); //$NON-NLS-0$
                } else {
                    this.$importButton.classList.add("disabled"); //$NON-NLS-0$
                }
            },
            dragEnter: function(e) {
                var dropZone = document.getElementById("dropZone"); //$NON-NLS-0$
                dropZone.className = "drop-zone over"; //$NON-NLS-0$
            },
            dragLeave: function(e) {
                var dropZone = document.getElementById("dropZone"); //$NON-NLS-0$
                dropZone.className = "drop-zone"; //$NON-NLS-0$
            },
            dragOver: function(e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy"; //$NON-NLS-0$
            },
            dragAndDropped: function(e) {
                e.stopPropagation();
                e.preventDefault();

                var file = e.dataTransfer.files[0],
                    reader = new FileReader();

                reader.onloadend = function(e) {
                    if (e.target.readyState === FileReader.DONE) {
                        var dropZone = document.getElementById("dropZone"); //$NON-NLS-0$
                        dropZone.className = "drop-zone"; //$NON-NLS-0$
                        this.importLanguage(this, e.target.result);
                    }
                }.bind(this);
                reader.readAsText(file);
            },
            importFromTextarea: function() {
                var styles = document.getElementById("languageText").value; //$NON-NLS-0$
                if (styles.length) {
                    this.importLanguage(this, styles);
                }
            },
            importLanguage: function(commandInvocation, styles) {
                importLanguage(commandInvocation, styles);
            },
            closeButtonClicked: function() {
                this.hide();
            },
            urlButtonClicked: function() {
                var importURLdialog = new urlImportDialog.showUrlImportDialog({
                    title: "Import language from a URL",
                    message: "A friendly explanation for the urls that can be used goes here",
                    func: this.onURL.bind(this, "Message to send")
                });
                this._addChildDialog(importURLdialog);
                importURLdialog.show();

            },
            onURL: function(huy, url) {
                alert(huy + " this.onURL.bind");
                alert(url);
            }
        });

        function showImportLanguageDialog(data) {
            new ImportLanguageDialog(data).show();
        }
        LanguageImporter.prototype.showImportLanguageDialog = showImportLanguageDialog;

		/** @returns {Document} */
		function parseXmlDocument(/**String*/ text) {
			var xmlDoc;
			if (window.DOMParser) {
				var parser = new DOMParser();
				xmlDoc = parser.parseFromString(text, "text/xml");
			} else {
				xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(text);
			}
			if (!xmlDoc) {
				throw new Error("Couldn't parse the file (are you sure it's a PList XML file?)");
			}
			return xmlDoc;
		}
		function convert(/**String*/ plist) {
			if (plist.replace(/^\s+|\s+$/g, "") === "") {
				alert("You didn't provide a .tmLanguage file :(");
			} else {
				try {
					var xmlDoc = parseXmlDocument(plist);
					return mPlist2js.convert(xmlDoc);
				} catch (e) {
					alert(e);
				}
			}
		}

        function importLanguage(data, language) {
        	var languageDocument = convert(language);
        	if (!languageDocument) {
        		return;
        	}

        	adaptGrammarToJS(languageDocument);
            data.options.addLanguage(languageDocument);
        }
        LanguageImporter.prototype.importLanguage = importLanguage;

        function getValuesFromXML(xml, tagName, attrId) {
            var attr = attrId || 0;
            var element = xml.getElementsByTagName(tagName)[0],
                returnValue;

            if (element) {
                var elementAttribute = element.attributes[attr] !== undefined ? element.attributes[attr] : false;
                if (elementAttribute && elementAttribute.name === "bold" && elementAttribute.value === "true") {
                    return "bold";
                } else if (elementAttribute && elementAttribute.name === "bold" && elementAttribute.value === "false") {
                    return "normal";
                }

                returnValue = elementAttribute !== undefined ? elementAttribute.value : "normal";
                return returnValue;
            }
        }
        LanguageImporter.prototype.getValuesFromXML = getValuesFromXML;

		var nonJSregexFeatures = [
			/\(\?[ims\-]:/, /* option on/off for subexp */
			/\(\?<[=!]/, /* lookbehind */
			/\(\?>/, /* atomic group */
		];
	
		function adaptGrammarToJS(languageDocument) {
			var jsRegExpOnly = true;
			if (languageDocument.patterns) {
				languageDocument.patterns.forEach(function(current) {
					jsRegExpOnly &= convertToJSRegExp(current);
				});
			}
			if (languageDocument.repository) {
				var repositoryKeys = Object.keys(languageDocument.repository);
				repositoryKeys.forEach(function(key) {
					jsRegExpOnly &= convertToJSRegExp(languageDocument.repository[key]);
				});				
			}
			if (!jsRegExpOnly) {
				languageDocument.needsOniguruma = true;
			}
		}
		
		function convertToJSRegExp(pattern) {
			var jsRegExpOnly = true;
			if (pattern.match) {
				var result = getJSRegExpEquivalent(pattern.match);
				if (result) {
					pattern.match = (result.flags ? "(?" + result.flags + ")" : "") + result.pattern;
				} else {
					pattern.matchNeedsOniguruma = true;
					jsRegExpOnly = false;
				}
			}
			if (pattern.begin) {
				result = getJSRegExpEquivalent(pattern.begin);
				if (result) {
					pattern.begin = (result.flags ? "(?" + result.flags + ")" : "") + result.pattern;
				} else {
					pattern.beginNeedsOniguruma = true;
					jsRegExpOnly = false;
				}
			}
			if (pattern.end) {
				result = getJSRegExpEquivalent(pattern.end);
				if (result) {
					pattern.end = (result.flags ? "(?" + result.flags + ")" : "") + result.pattern;
				} else {
					pattern.endNeedsOniguruma = true;
					jsRegExpOnly = false;
				}
			}
			return jsRegExpOnly;
		}

		/* converts an extended regex pattern into a normal one */
		function normalize(/**String*/ str) {
			var result = "";
			var insideCharClass = false;
			var len = str.length;
			for (var i = 0; i < len; ) {
				var chr = str.charAt(i);
				if (!insideCharClass && chr === "#") {
					/* skip to eol */
					while (i < len && chr !== "\r" && chr !== "\n") {
						chr = str.charAt(++i);
					}
				} else if (!insideCharClass && /\s/.test(chr)) {
					/* skip whitespace */
					while (i < len && /\s/.test(chr)) { 
						chr = str.charAt(++i);
					}
				} else if (chr === "\\") {
					result += chr;
					if (!/\s/.test(str.charAt(i + 1))) {
						result += str.charAt(i + 1);
						i++;
					}
					i++;
				} else if (chr === "[") {
					insideCharClass = true;
					result += chr;
					i++;
				} else if (chr === "]") {
					insideCharClass = false;
					result += chr;
					i++;
				} else {
					result += chr;
					i++;
				}
			}
			return result;
		}
	
		/**
		 * Checks if flag applies to entire pattern. If so, obtains replacement string by calling processor
		 * on the unwrapped pattern. Handles 2 possible syntaxes: (?f)pat and (?f:pat)
		 * @param {String} flag
		 * @param {String} str
		 * @param {Function} processor
		 */
		function processGlobalFlag(flag, str, processor) {
			var match = /^\(\?([^:)]+)\)/.exec(str);
			if (match) {
				if (match[1].indexOf(flag) !== -1) {
					var remainingFlags = match[1].replace(flag, "");
					if (remainingFlags.length) {
						remainingFlags = "(?" + remainingFlags + ")";
					}
					return remainingFlags + processor(str.substring(match[0].length));
				}
			}
			return str;
		}
		
		function getJSRegExpEquivalent(pattern, flags) {
			flags = flags || "";
	
			function getMatchingCloseParen(/*String*/pat, /*Number*/start) {
				var depth = 0;
				var len = pat.length;
				var flagStop = -1;
				for (var i = start; i < len && flagStop === -1; i++) {
					switch (pat.charAt(i)) {
						case "\\":
							i++; /* escape: skip next char */
							break;
						case "(":
							depth++;
							break;
						case ")":
							depth--;
							if (depth === 0) {
								flagStop = i;
							}
							break;
					}
				}
				return flagStop;
			}
	
			/*
			 * If there are flags scoped to first group and the first group spans the
			 * full pattern then convert the flags to global.
			 */
			var match = /^\(\?([^:)]+):/.exec(pattern); /* flag(s) scoped to first group */
			if (match) {
				var endIndex = getMatchingCloseParen(pattern, 0);
				if (pattern.search(/\)\s*$/) === endIndex) {
					/* group spans whole pattern */
					pattern = "(?" + match[1] + ")(" + pattern.substring(match[0].length, endIndex + 1);
				}
			}
	
			/* Handle global "x" flag (whitespace/comments) */
			pattern = processGlobalFlag("x", pattern, function(subexp) {
				return normalize(subexp);
			});
	
			/* Handle global "i" flag (case-insensitive) */
			pattern = processGlobalFlag("i", pattern, function(subexp) {
				flags += "i";
				return subexp;
			});
	
			/* now determine whether pattern can be represented by a standard JS RegExp */
			for (var i = 0; i < nonJSregexFeatures.length; i++) {
				if (nonJSregexFeatures[i].test(pattern)) {
					return null; /* using unsupportable features */
				}
			}
	
			/* can be represented as a JS RegExp */
			return {pattern: pattern, flags: flags};
		}

        return {
            LanguageImporter: LanguageImporter
        };
    }
);
