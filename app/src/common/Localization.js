define(function (require, exports, module)
{
	'use strict';

	function Localization()
	{
		// app-specific
		var lib = require('common/utils');

		var cLocaleEn = 'en';
		var localesQueue = [];
		var resultStrings = [];

		function _addStrings(stringsObj, locale)
		{
			if (!locale)
			{
				return;
			}
			var langs = locale.replace('_', '-').toLowerCase().split('-');
			while (langs.length) {
				var lang = langs.join('-');
				var langStrings = stringsObj[lang];
				if (lang && (localesQueue.indexOf(lang) === -1))
				{
					localesQueue.push(lang);
				}
				if (langStrings && (resultStrings.indexOf(langStrings)  === -1))
				{
					resultStrings.push(langStrings);
				}
				langs.pop();
			}
		}

		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		this.defineStrings = function (stringsObj)
		{
			// 1. Add strings with lang from urlParams
			_addStrings(stringsObj, stringsObj.lang);
			// 2. Add strings for browser's locale
			_addStrings(stringsObj, lib.getBrowserLoc());
			// 3. Add strings for defaultLoc from config
			_addStrings(stringsObj, stringsObj.defaultLoc);
			// 4. Add strings for default lang (en)
			_addStrings(stringsObj, cLocaleEn);
		};

		this.getString = function (stringId)
		{
			for (var i = 0, len = resultStrings.length; i < len; i++)
			{
				var val = resultStrings[i][stringId];
				if (val)
				{
					return val;
				}
			}
			console.warn('NOT_FOUND: String not found: ' + stringId);
			return '';
		};

		// Need this function to get localized version of additional strings (e.g. rescheduleWrapper in `fido` config).
		// May be need store all strings under `strings` key in config and get rid of this function
		this.getLocalizedStrings = function(strings) {
			for (var i = 0, len = localesQueue.length; i < len; i++)
			{
				if (strings[localesQueue[i]]) {
					return strings[localesQueue[i]];
				}
			}
			return {};
		}
	}
	module.exports = new Localization();
});
