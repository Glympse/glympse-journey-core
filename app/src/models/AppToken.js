define(function(require, exports, module)
{
    'use strict';
	
	var responseCode = require('glympse-journey-core/Defines').ResponseCode;
	
	
	// Exported class
	function AppToken(cfg)
	{
		///////////////////////////////////////////////////////////////////////////////
		// PROPERTIES
		///////////////////////////////////////////////////////////////////////////////

		this.appKey = (cfg && cfg.appKey) || 'NO_APP_KEY';
		this.code = (cfg && cfg.code) || responseCode.noResponse;
		this.expires = (cfg && cfg.expires) || null;
		this.info = (cfg && cfg.info) || 'default state';
		this.loaded = (cfg && cfg.loaded) || false;
		this.token = (cfg && cfg.token) || null;
		this.tokenType = (cfg && cfg.tokenType) || null;


		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		this.clone = function()
		{
			return new AppToken(this);
		};
	}
	
	module.exports = AppToken;
});
