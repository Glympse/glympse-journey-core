// App entry point
define(function(require, exports, module)
{
    'use strict';
	
    // import dependencies
	var JourneyCore = require('glympse-journey-core/JourneyCore');
	var ViewManager = require('ViewManager');

	var cfg;
	var core;
	var vm;
	
	
	$(document).ready(function()
	{
		cfg = window.cfgApp;
		
		var invites = (cfg.viewer.t && cfg.viewer.t.split(';')) || '';
		var rawInvites = [];
		for (var i = 0, len = invites.length; i < len; i++)
		{
			rawInvites.push(invites[i].split(',')[0]);
		}
		
		cfg.app.invite = rawInvites.join(';');
		cfg.adapter.element = $('#glympser');
		
		vm = new ViewManager(cfg.app);
		core = new JourneyCore(vm, cfg);
	});
});
