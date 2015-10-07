define(function(require, exports, module)
{
    'use strict';

	// glympse-adapter module
	var GlympseAdapter = require('glympse-adapter/GlympseAdapter');
	var GlympseAdapterDefines = require('glympse-adapter/GlympseAdapterDefines');
	var lib = require('glympse-adapter/lib/utils');

	var Defines = require('glympse-journey-core/Defines');

	// Feedback providers
	var providers = [ require('glympse-journey-core/models/providers/enroute') ];

	var _id = 'JourneyCore';
	var c = Defines.CMD;
	var m = Defines.MSG;
	var s = Defines.STATE;
	var p = Defines.PHASE;

	var msgAdapter = GlympseAdapterDefines.MSG;
	var stateAdapter = GlympseAdapterDefines.STATE;

	var cTimePromise = 'promise';
	var cTimeFuture = 'future';

	// Note: Format is fixed. If you change it, be sure to
	// update regex in grunt/replace.js
	console.log(_id + ' v(1.2.0)');


	/*
	 * vm: Valid instance of ViewManager interface
	 * cfgCore [object]: Settings for app, viewer, and adapter
	 *
	 * [object]: { app: { ...}, viewer: { ... }, adapter: { ... } }
	 */
	function JourneyCore(vm, cfgCore)
	{
		// Main config for app setup
		var cfg = cfgCore.app;

		// consts
		var dbg = lib.dbg(_id, cfg.dbg);

		// state
		var that = this;
		var adapter;
		var currPhase = null;
		var isAbandoned = false;
		var pushedBase = false;
		var timeStart = 0;
		var viewManager = vm;
		var initialized = false;


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

			//dbg('** NOTIFY ** - ' + msg, args);

			switch (msg)
			{
				case msgAdapter.StateUpdate:
				{
					if (initialized && !isAbandoned)
					{
						viewManager.cmd(msg, args);
					}

					if (args.id === stateAdapter.NoInvites)
					{
						isAbandoned = true;
					}
					break;
				}

				case dataUpdate:
				{
					// Format: { id:.., data:[ p0, p1, ..., pN ] }
					if (initialized && !isAbandoned)
					{
						parseData(args && args.data);
					}

					break;
				}

				case msgAdapter.Progress:
				{
					viewManager.cmd(msg, args.curr / args.total);
					break;
				}

				case msgAdapter.InviteReady:
				{
					break;
				}

				case msgAdapter.ViewerInit:
				{
					viewManager.cmd(msg, args);
					break;
				}

				case msgAdapter.AdapterReady:
				{
					break;
				}

				case msgAdapter.ViewerReady:
				{
					initialized = true;

					// Once the viewer is ready, seed with all cached properties
					//dbg('>>> Properties on initial invite', adapter.map.getInviteProperties());
					var oProps = adapter.map.getInviteProperties();
					var props = [];
					for (var id in oProps)
					{
						props.push($.extend(oProps[id], { n: id }));
					}

					parseData(props);

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

			//dbg('parseData', data);

			for (var i = 0, len = data.length; i < len; i++)
			{
				var item = data[i];
				var id = item.n;
				var val = item.v;
				var t = item.t;

				switch (id)
				{
					case stateAdapter.Eta:
					{
						// We're only interested in eta for its promise time in the DataUpdate,
						// as the adapter will pass along continuous current Eta info.
						if (val)
						{
							if (val.type === s.PromiseTime || val.type === s.FutureTime)
							{
								viewManager.cmd(update, { id: val.type, val: val });
							}
						}

						break;
					}

					case stateAdapter.Phase:
					{
						lastUpdated = (t > lastUpdated) ? t : lastUpdated;
						currPhase = { phase: val, t: t };
						viewManager.cmd(update, { id: id, val: currPhase });

						if (currPhase.phase === p.Aborted)
						{
							isAbandoned = true;
						}

						break;
					}

					case stateAdapter.Destination:
					{
						lastUpdated = (t > lastUpdated) ? t : lastUpdated;
						viewManager.cmd(update, { id: id, val: val });
						break;
					}

					case stateAdapter.InviteStart:
					{
						lastUpdated = (t > lastUpdated) ? t : lastUpdated;
						timeStart = Number(val);
						break;
					}

					case s.Visibility:
					{
						//dbg('VISIBILITY', val);
						viewManager.cmd(update, { id: id, val: val });
						break;
					}

					case s.StoreLocation:
					{
						if (!pushedBase)
						{
							pushedBase = true;
							viewManager.cmd(update, { id: id, val: val });
						}

						break;
					}

					case s.OrderInfo:
					{
						cfg.idOrder = val;
						viewManager.cmd(update, { id: id, val: val });
						break;
					}

					case s.ApptFrom:
					{
						arrivalFrom = val;
						break;
					}

					case s.ApptTo:
					{
						arrivalTo = val;
						break;
					}

					case s.ApptTimezone:
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
			cfgCore.adapter.anon = true;
			cfgCore.adapter.initialize = adapterPostInit;

			adapter = new GlympseAdapter(that, cfgCore);
			adapter.client($(cfg.elementViewer));
			cfg.adapter = adapter;
		}

		function adapterPostInit()
		{
			//dbg('POST INIT');
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
