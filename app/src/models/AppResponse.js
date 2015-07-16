define(function(require, exports, module)
{
    'use strict';
	
	var responseCode = require('glympse-journey-core/Defines').ResponseCode;
	
	
	// Exported class
	function AppResponse(cfg)
	{
		///////////////////////////////////////////////////////////////////////////////
		// PROPERTIES
		///////////////////////////////////////////////////////////////////////////////

		this.loaded = (cfg && cfg.loaded) || false;
		this.code = (cfg && cfg.code) || responseCode.noResponse;
		this.info = (cfg && cfg.info) || 'no response';


		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		this.clone = function()
		{
			return new AppResponse(this);
		};
	}

	module.exports = AppResponse;
});
