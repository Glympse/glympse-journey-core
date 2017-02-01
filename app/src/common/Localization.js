define(function(require, exports, module)
{
    'use strict';

	// app-specific
	var lib = require('common/utils');

	var cLocaleEn = 'en';

    var strings;
	var currLoc;
    var currLangMarket;
    var defaultLoc = cLocaleEn;


	var Localization =
	{

		///////////////////////////////////////////////////////////////////////////////
		// PROPERTIES
		///////////////////////////////////////////////////////////////////////////////

		getLoc: function()
		{
			return currLoc;
		},
		setLoc: function(newLoc)
		{
			currLoc = newLoc;
		},
		getDefaultLoc: function()
		{
			return defaultLoc;
		},
		setDefaultLoc: function(newDefaultLoc)
		{
			_setDefaultLoc(newDefaultLoc);
		},


		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		init: function(stringSet)
		{
			strings = stringSet;
			defaultLoc = _setDefaultLoc(strings.defaultLoc);

			if (!currLoc)
			{
				currLoc = lib.getBrowserLoc();
			}

			//if there are no locales, we don't need to worry about them
            if (!strings.hasLocales) {
                currLoc = cLocaleEn;
                return;
            }

            //set the locale from the param override
			if (strings.lang)
			{
				currLoc = strings.lang;
			}

            if (currLoc.indexOf('-') > -1)
            {
				currLangMarket = currLoc;
				currLoc = currLangMarket.split('-')[0];
			}
		},

		getString: function(stringId)
		{
			var langMarketStrings = strings[currLangMarket] || {};
			var langStrings = strings[currLoc] || {};
			var defaultLocStrings = strings[defaultLoc] || {};
			var hardcodedLocStrings = strings[cLocaleEn] || {};

			var currString = langMarketStrings[stringId] || langStrings[stringId] || defaultLocStrings[stringId] || hardcodedLocStrings[stringId];
            //console.log(stringId + ': ' + currString);

			if (currString === undefined)
			{
				console.log('NOT_FOUND: String not found: ' + stringId);
			}

			return currString;
		}

	};

	function _setDefaultLoc(targetDefaultLoc)
    {
		//check if config default exists
		if (targetDefaultLoc && !strings[targetDefaultLoc])
		{
			console.log('loc not found: ' + targetDefaultLoc);
			targetDefaultLoc = undefined;
		}

		//set default loc if specified in config, otherwise set to the standard/previous default
		return (targetDefaultLoc || (strings[defaultLoc] && defaultLoc) || strings[cLocaleEn]);
	}

	module.exports = Localization;
});
