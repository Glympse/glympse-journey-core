define(function (require, exports, module)
{
	'use strict';

	function Localization()
	{
		// app-specific
		var lib = require('common/utils');

		var cLocaleEn = 'en';

		var strings;
		var currLoc;
		var currLangMarket;
		var defaultLoc = cLocaleEn;

		var langMarketStrings;
		var langStrings;
		var defaultLocStrings;
		var hardcodedLocStrings;


		function _setDefaultLoc(targetDefaultLoc)
		{
			var newDefault = ((strings[targetDefaultLoc] && targetDefaultLoc) || (strings[defaultLoc] && defaultLoc) || (strings[cLocaleEn] && cLocaleEn));

			// Notify if we've switched
			if (newDefault !== targetDefaultLoc)
			{
				console.log('[Localization] loc not found: "' + targetDefaultLoc + '" .. using "' + newDefault + '" instead');
			}

			defaultLoc = newDefault;
		}

		function _setLoc()
		{
			currLoc = currLoc.replace('_', '-').toLowerCase();

			if (currLoc.indexOf('-') > -1)
			{
				currLangMarket = currLoc;
				currLoc = currLangMarket.split('-')[0];
			}

			langMarketStrings = strings[currLangMarket] || {};
			langStrings = strings[currLoc] || {};

		}

		///////////////////////////////////////////////////////////////////////////////
		// PROPERTIES
		///////////////////////////////////////////////////////////////////////////////

		this.getLoc = function ()
		{
			return currLoc;
		};
		this.setLoc = function (newLoc)
		{
			currLoc = newLoc;
			_setLoc();
		};
		this.getDefaultLoc = function ()
		{
			return defaultLoc;
		};
		this.setDefaultLoc = function (newDefaultLoc)
		{
			_setDefaultLoc(newDefaultLoc);
		};


		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		this.defineStrings = function (stringSet)
		{
			strings = stringSet;
			defaultLoc = _setDefaultLoc(strings.defaultLoc);

			if (!currLoc)
			{
				currLoc = lib.getBrowserLoc();
			}

			//if there are no locales, we don't need to worry about them
			if (!strings.hasLocales)
			{
				currLoc = cLocaleEn;
			}
			else
			//set the locale from the param override
			if (strings.lang)
			{
				currLoc = strings.lang;
			}

			_setLoc();

			defaultLocStrings = strings[defaultLoc] || {};
			hardcodedLocStrings = strings[cLocaleEn] || {};
		};

		this.getString = function (stringId)
		{
			var currString = langMarketStrings[stringId] || langStrings[stringId] || defaultLocStrings[stringId] || hardcodedLocStrings[stringId];
			//console.log(stringId + ': ' + currString);

			if (currString === undefined)
			{
				console.log('NOT_FOUND: String not found: ' + stringId);
				currString = '';
			}

			return currString;
		}

	}

	module.exports = Localization;
});
