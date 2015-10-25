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
		var cfgJourney = cfg.journey || {};
		var cfgViewer = cfg.viewer || {};

		var provider = cfgApp.provider;

		if (provider)
		{
			var invites = (cfgAdapter.t && cfgAdapter.t.split(';')) || [];
			provider.idInvite = (invites.length > 0) ? invites[0].split(',')[0] : null;
		}

		// Ensure configs are valid
		cfg.adapter = cfgAdapter;
		cfg.app = cfgApp;
		cfg.journey = cfgJourney;
		cfg.viewer = cfgViewer;

		vm = new ViewManager(cfgApp);
		if (cfgApp.defaultPhase)
		{
			cfgJourney.defaultPhase = cfgApp.defaultPhase;
		}

		core = new JourneyCore(vm, cfg);
	});
});
