define(function(require, exports, module)
{
    'use strict';

	// glympse-view-client-adapter module
	var ViewClientAdapter = require('glympse-viewer-client-adapter/ViewClientAdapter');
	var AdapterDefines = require('glympse-viewer-client-adapter/adapter/ViewClientAdapterDefines');
	
	var lib = require('glympse-journey-core/common/utils');
	var Defines = require('glympse-journey-core/Defines');
	
	// Feedback providers
	var providers = [ require('glympse-journey-core/models/providers/enroute') ];

	var _id = 'JourneyCore';
	var c = Defines.CMD;
	var m = Defines.MSG;
	var s = Defines.STATE;
	var p = Defines.PHASE;

	var idOasisPort = 'glympse';
	var cTimePromise = 'promise';
	var cTimeFuture = 'future';
	
	// Note: Format is fixed. If you change it, be sure to
	// update regex in grunt/replace.js
	console.log(_id + ' v(1.1.0)');
	
	
	/*
	 * vm: Valid instance of ViewManager interface
	 * cfgCore [object]: Settings for app, viewer, and adapter
	 *
	 * [object]: { app: { ...}, viewer: { ... }, adapter: { ... } }
	 */
	function JourneyCore(vm, cfgCore)
	{
		// Main config for app setup
		var cfg = (cfgCore && cfgCore.app) || { };
		
		// consts
		var dbg = lib.dbg(_id, cfg.dbg);
		var msgAdapter = AdapterDefines.MSG;
		var stateAdapter = AdapterDefines.STATE;
		
		// state
		var that = this;
		var currPhase = null;
		var isAbandoned = false;
		var pushedBase = false;
		var timeStart = 0;
		var viewManager = vm;
		
		
		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		this.toString = function()
		{
			return _id;
		};
		
		this.notify = function(msg, args)
		{
			var dataUpdate = msgAdapter.DataUpdate;

			switch (msg)
			{
				case dataUpdate:
				{
					// Format: { id:.., data:[ p0, p1, ..., pN ] }
					if (!isAbandoned)
					{
						parseData(args && args.data);
					}
					
					break;
				}

				case msgAdapter.StateUpdate:
				{
					if (!isAbandoned)
					{
						viewManager.cmd(msg, args);
					}
					
					if (args.id === stateAdapter.NoInvites)
					{
						isAbandoned = true;
					}
					break;
				}
				
				case m.AdapterReady:
				{
					viewManager.cmd(c.Progress, 1 / 3);
					break;
				}
					
				case msgAdapter.ViewerInit:
				{
					viewManager.cmd(c.Progress, 2 / 3);
					viewManager.cmd(msg, args);
					break;
				}

				case msgAdapter.ViewerReady:
				{
					if (!currPhase)
					{
						timeStart = timeStart || (new Date()).getTime();
						
						// If no phase, use a default, or force the Live phase, as
						// it is a regular Glympse. Generally, demo mode will set
						// the desired defaultPhase, utilizing something like demobot0
						// as the invite.
						currPhase = { phase: (cfg.defaultPhase || p.Live), t: timeStart };
						viewManager.cmd(dataUpdate, { id: stateAdapter.Phase, val: currPhase });
					}
					
					setTimeout(function()
					{
						viewManager.cmd(c.InitUi, timeStart);
					}, 400);
					
					viewManager.cmd(c.Progress, 3 / 3);
					break;
				}
					
				case m.ForcePhase:
				{
					handleForcePhase(args);
					break;
				}
					
				case m.ForceAbort:
				{
					handleAbortUpdate();
					break;
				}
				
				default:
				{
					dbg('notify(): unknown msg: "' + msg + '"', args);
					break;
				}
			}

			return null;
		};
		
		
		///////////////////////////////////////////////////////////////////////////////
		// UTILITY
		///////////////////////////////////////////////////////////////////////////////

		function handleForcePhase(newPhase)
		{
			currPhase = newPhase;
			viewManager.cmd(msgAdapter.DataUpdate, { id: stateAdapter.Phase
												   , val: currPhase });
		}
		
		function handleAbortUpdate()
		{
			currPhase = { phase: p.Aborted, t: new Date().getTime() };
			
			// Generate a datastream element to parse
			that.notify(msgAdapter.DataUpdate
					   , { id:'inv-ite'
						 , data:
						 [
							 { t: new Date().getTime(), n: 'phase', v: currPhase.phase }
						 ]
						 }
					   );
		}
		
		
		///////////////////////////////////////////////////////////////////////////////
		// UTILITY
		///////////////////////////////////////////////////////////////////////////////
		
		function parseData(data)
		{
			var arrivalFrom = -1;
			var arrivalTo = -1;
			var arrivalOffset = 0;
			var update = msgAdapter.DataUpdate;
			var lastUpdated = 0;
			
			for (var i = 0, len = data.length; i < len; i++)
			{
				var item = data[i];
				var id = item.n;
				var val = item.v;
				var t = item.t;
				
				if (t > lastUpdated && (id === 'start_time' || id === 'destination'))
				{
					lastUpdated = t;
				}
				
				switch (id)
				{
					case 'start_time':
					{
						timeStart = Number(val);
						break;
					}
						
					case 'destination':
					{
						viewManager.cmd(update, { id: s.Destination, val: val });
						break;
					}
					
					case 'eta':
					{
						// We're only interested in eta for its promise time in the DataUpdate,
						// as the adapter will pass along continuous current Eta info.
						if (val)
						{
							if (val.type === cTimePromise)
							{
								viewManager.cmd(update, { id: s.PromiseTime, val: val });
							}
							else if (val.type === cTimeFuture)
							{
								viewManager.cmd(update, { id: s.FutureTime, val: val });
							}
						}
						
						break;
					}
						
					case 'base_location':
					{
						if (!pushedBase)
						{
							pushedBase = true;
							viewManager.cmd(update, { id: s.StoreLocation, val: val });
						}
						
						break;
					}
					
					case 'order_id':
					{
						cfg.idOrder = val;
						viewManager.cmd(update, { id: s.OrderInfo, val: val });
						break;
					}
					
					case 'phase':
					{
						currPhase = { phase: val, t: t };
						viewManager.cmd(update, { id: stateAdapter.Phase, val: currPhase });
						
						if (currPhase.phase === p.Aborted)
						{
							isAbandoned = true;
						}
						
						break;
					}
						
					case 'appt_from':
					{
						arrivalFrom = val;
						break;
					}
					
					case 'appt_to':
					{
						arrivalTo = val;
						break;
					}
					
					case 'appt_tz':
					{
						var vals = val.split(':');
						arrivalOffset = Number(vals[0]) * 60 + Number(vals[1]);
						break;
					}
				}
			}
			
			if (arrivalFrom > 0 && arrivalTo > 0)
			{
				// Always show in local time where task was created
				var d = ((new Date()).getTimezoneOffset() + arrivalOffset) * 60 * 1000;
				viewManager.cmd(update, { id: s.ArrivalRange, val: { from: arrivalFrom + d
																   , to: arrivalTo + d
																   } });
			}

			if (lastUpdated)
			{
				viewManager.cmd(update, { id: s.LastUpdate, val: lastUpdated });
			}
		}
		

		///////////////////////////////////////////////////////////////////////////////
		// CALLBACKS
		///////////////////////////////////////////////////////////////////////////////
		
		function adapterInit()
		{
			cfgCore.adapter.initialize = adapterPostInit;
			
			var adapter = new ViewClientAdapter(that, cfgCore);
			adapter.run(cfgCore.adapter.element);
		}
		
		function adapterPostInit()
		{
			viewManager.cmd(c.Progress, 1 / 3);
		}
		
		
		///////////////////////////////////////////////////////////////////////////////
		// CTOR
		///////////////////////////////////////////////////////////////////////////////
		

		if (!cfgCore || !cfgCore.app || !cfgCore.viewer || !cfgCore.adapter)
		{
			dbg('[ERROR]: Invalid config! Aborting...', cfgCore);
			return;
		}
		
		if (!viewManager)
		{
			dbg('[ERROR]: viewManager not defined! Aborting...');
			return;
		}
		
		// Initialize the viewManager
		if (!cfg.providers)
		{
			cfg.providers = providers;
		}
		
		viewManager.init(this);
		
		// Add initial init delay to allow viewport to settle down
		setTimeout(adapterInit, 100);
	}

	
	module.exports = JourneyCore;
});
