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

		var cfgAdapter = cfg.adapter || {};
		var cfgApp = cfg.app || {};
		var cfgViewer = cfg.viewer || {};

		var invites = (cfgAdapter.t && cfgAdapter.t.split(';')) || '';
		var rawInvites = [];
		for (var i = 0, len = invites.length; i < len; i++)
		{
			rawInvites.push(invites[i].split(',')[0]);
		}

		cfgApp.invite = rawInvites.join(';');

		// Ensure configs are valid
		cfg.adapter = cfgAdapter;
		cfg.app = cfgApp;
		cfg.viewer = cfgViewer;

		vm = new ViewManager(cfgApp);
		core = new JourneyCore(vm, cfg);
	});
});
