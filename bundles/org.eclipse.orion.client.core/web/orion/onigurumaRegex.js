/*******************************************************************************
 * @license
 * Copyright (c) 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
/**
 * @name orion.onigurumaRegex
 * @class TODO Utilities for dealing with regular expressions.
 * @description TODO Utilities for dealing with regular expressions.
 */
define("orion/onigurumaRegex", ["orion/oniguruma"], function(mOniguruma) { //$NON-NLS-0$

	function OnigurumaRegex(pattern, flags) {
		this.lastIndex = 0;
		pattern = pattern || "";
		flags = flags || "";

		var ppRegex = _malloc(4);
		var pPattern = _malloc(pattern.length + 1);
		Module.writeStringToMemory(pattern, pPattern);
		var options = 0 /* ONIG_OPTION_NONE */;
		if (/[iI]/.test(flags)) {
			options |= 1 /* ONIG_OPTION_IGNORECASE */;
			this.ignoreCase = true;
		}
		if (/[mM]/.test(flags)) {
			options |= 4 /* ONIG_OPTION_MULTILINE */;
			this.multiline = true;
		}
		if (/[gG]/.test(flags)) {
			this.global = true;
		}
		this._OnigEncodingASCII = allocate([48, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 50, 0, 0, 0, 52, 0, 0, 0, 54, 0, 0, 0, 56, 0, 0, 0, 58, 0, 0, 0, 60, 0, 0, 0, 62, 0, 0, 0, 64, 0, 0, 0, 66, 0, 0, 0, 68, 0, 0, 0, 70, 0, 0, 0, 72, 0, 0, 0], ["*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0], Module.ALLOC_NORMAL);
		this._OnigSyntaxRuby = allocate([2146948438, 0, 0, 0, 736218, 0, 0, 0, -2086665253, 0, 0, 0, 0, 0, 0, 0, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0], ALLOC_NORMAL);
		var pInfo = _malloc(12);
		var r = Oniguruma.onig_new(ppRegex, pPattern, pPattern + pattern.length, options, this._OnigEncodingASCII, this._OnigSyntaxRuby, pInfo);	
		if (r < 0) {
			/* invalid Oniguruma regex */
			console.log("something bad: " + r + " regex: " + pattern);
		} else {
			this.source = pattern;
			this._pRegex = Module.getValue(ppRegex, "*");
			this._pRegion = Oniguruma.onig_region_new();
		}
		
		_free(pInfo);
		_free(pPattern);
		_free(ppRegex);
	}

	OnigurumaRegex.prototype = {
		exec: function(string) {
			if (this.global) {
				if (string !== this._lastString) {
					this.lastIndex = 0;
					this._lastString = string;
				}
			}

			var pString = _malloc(string.length + 1);
			Module.writeStringToMemory(string, pString);
			var pStart = pString;
			if (this.global) {
				pStart += this.lastIndex;
			}

			var r = Oniguruma.onig_search(this._pRegex, pString, pString + string.length, pStart, pString + string.length, this._pRegion, 0 /* ONIG_OPTION_NONE */);
			_free(pString);
			
//console.log("exec " + this.source + " on " + string + " result: " + (r >= 0));
			
			if (r === -1) {
				return null;
			}
			
			if (r < 0) {
				/* error, do something */
				return null;
			}
			
			/* match */
			
			/*
				struct OnigRegion {
					int  allocated;
					int  num_regs;
					int* beg;
					int* end;
				}
			*/
			
			var result = {input: string};
			var matchCount = Module.getValue(this._pRegion + 4, "i32");
			var start = Module.getValue(this._pRegion + 8, "*");
			var end = Module.getValue(this._pRegion + 12, "*");
			for (var i = 0; i < matchCount; i++) {
				var currentStart = Module.getValue(start + i * 4, "i32");
				var currentEnd = Module.getValue(end + i * 4, "i32");
				result[i] = string.substring(currentStart, currentEnd);
				if (i === 0) {
					result.index = currentStart;
					if (this.global) {
						this.lastIndex = currentEnd;
					}
				}
			}
			return result;
		},

		isOniguruma: true,

		test: function(string) {
			if (this.global) {
				if (string !== this._lastString) {
					this.lastIndex = 0;
					this._lastString = string;
				}
			}

			var pString = _malloc(string.length + 1);
			Module.writeStringToMemory(string, pString);
			var pStart = pString;
			if (this.global) {
				pStart += this.lastIndex;
			}
			var r = Oniguruma.onig_search(this._pRegex, pString, pString + string.length, pStart, pString + string.length, this._pRegion, 0 /* ONIG_OPTION_NONE */);
			_free(pString);

//console.log("test " + this.source + " on " + string + " result: " + (r >= 0));

			if (this.global && r >= 0) {
				var end = Module.getValue(this._pRegion + 12, "*");
				var matchEnd = Module.getValue(end, "i32");
				this.lastIndex = matchEnd;
			}

			return r >= 0;
		},

		free: function() {
			if (this._pRegion) {
				Oniguruma.onig_region_free(this._pRegion, 1);
				this._pRegion = 0;
			}

			if (this._pRegex) {
				Oniguruma.onig_free(this._pRegex);
				this._pRegex = 0;
			}

			if (this._OnigEncodingASCII) {
				_free(this._OnigEncodingASCII);
				this._OnigEncodingASCII = 0;
			}

			if (this._OnigSyntaxRuby) {
				_free(this._OnigSyntaxRuby);
				this._OnigSyntaxRuby = 0;
			}
		}
	};

	return OnigurumaRegex;
});
