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

	// Note: Format is fixed. If you change it, be sure to
	// update regex in grunt/replace.js
	console.log(_id + ' v(1.3.1)');


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
		var msgDataUpdate = msgAdapter.DataUpdate;
		var msgStateUpdate = msgAdapter.StateUpdate;

		// state
		var that = this;
		var adapter;
		var currPhase = null;
		var pushedBase = false;
		var timeStart = 0;
		var viewManager = vm;
		var initialized = false;
		var lastUpdated = 0;


		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		this.toString = function()
		{
			return _id;
		};

		this.notify = function(msg, args)
		{
			//dbg('** NOTIFY ** - ' + msg, args);

			switch (msg)
			{
				case msgStateUpdate:
				{
					if (initialized)
					{
						parseState(args);
					}

					//if (args.id === stateAdapter.NoInvites)
					//{
					//	isAbandoned = true;
					//}
					break;
				}

				case msgDataUpdate:
				{
					// Format: { id:.., data:[ p0, p1, ..., pN ] }
					if (initialized)
					{
						parseData(args && args.data, false);
					}

					break;
				}

				case msgAdapter.Progress:
				{
					viewManager.cmd(msg, args.curr / args.total);
					break;
				}

				case msgAdapter.ViewerReady:
				{
					initialized = true;

					// Once the viewer is ready, seed with all cached properties
					//dbg('>>> Properties on initial invite', adapter.map.getInviteProperties());
					var oProps = adapter.map.getInviteProperties();
					var props = [];
					var stateProps = Object.keys(stateAdapter).map(mapAdapterStateKey);

					for (var id in oProps)
					{
						var prop = oProps[id];

						if (stateProps.indexOf(id) >= 0)
						{
							parseState({ id: id, t: prop.t, val: prop.v });
						}
						else
						{
							props.push($.extend(oProps[id], { n: id }));
						}
					}

					// Handle Journey/custom properties
					parseData(props, true);

					if (!currPhase)
					{
						timeStart = timeStart || (new Date()).getTime();

						// If no phase, use a default, or force the Live phase, as
						// it is a regular Glympse. Generally, demo mode will set
						// the desired defaultPhase, utilizing something like demobot0
						// as the invite.
						setCurrentPhase((cfg.defaultPhase || p.Live), timeStart);
						sendCurrentPhase();
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
					// Pass along any unknown/unused commands
					dbg('notify(): unhandled msg: "' + msg + '"', args);
					return viewManager.cmd(msg, args);
				}
			}

			return null;
		};


		///////////////////////////////////////////////////////////////////////////////
		// UTILITY
		///////////////////////////////////////////////////////////////////////////////

		function generateStateData(id, t, val)
		{
			return { id: id, t: t, val: val };
		}

		function setCurrentPhase(idPhase, t)
		{
			currPhase = { phase: idPhase, t: t };
		}

		function sendState(id, t, val)
		{
			viewManager.cmd(msgStateUpdate, generateStateData(id, t, val));
		}

		function sendCurrentPhase()
		{
			sendState(stateAdapter.Phase, (currPhase && currPhase.t) || 0, currPhase);
		}

		function handleForcePhase(newPhase)
		{
			currPhase = newPhase;
			sendCurrentPhase();
		}

		function handleAbortUpdate()
		{
			setCurrentPhase(p.Aborted, new Date().getTime());

			// Re-sync core + app
			parseState(msgStateUpdate, generateStateData(stateAdapter.Phase, new Date().getTime(), currPhase));
		}

		function mapAdapterStateKey(key)
		{
			return stateAdapter[key];
		}

		function updateLastUpdated(t)
		{
			if (t <= lastUpdated)
			{
				return;
			}

			lastUpdated = t;
			sendState(s.LastUpdate, t, t);
		}

		function parseState(data)
		{
			var id = data.id;
			var val = data.val;
			var t = data.t;
			var lastUpdate = lastUpdated;

			//dbg('>>>>> parseState - (' + id + ')', data);

			switch (id)
			{
				case stateAdapter.Eta:
				{
					// Parse "special" eta info
					if (val)
					{
						if (val.type === s.PromiseTime || val.type === s.FutureTime)
						{
							sendState(val.type, t, val);
							return;
						}
					}

					break;
				}

				case stateAdapter.Phase:
				{
					setCurrentPhase(val, t);
					sendCurrentPhase();

					/*if (currPhase.phase === p.Aborted)
					{
						isAbandoned = true;
					}*/

					updateLastUpdated(t);
					return;
				}

				case stateAdapter.Destination:
				{
					lastUpdate = (t > lastUpdate) ? t : lastUpdate;
					break;
				}

				case stateAdapter.InviteStart:
				{
					lastUpdate = (t > lastUpdate) ? t : lastUpdate;
					timeStart = Number(val);
					break;
				}

				/*default:
				{
					dbg('Unhandled state: ' + id, data);
				}*/
			}

			// Pass along to app container as well
			viewManager.cmd(msgStateUpdate, data);

			// Push lastUpdated info, if any
			updateLastUpdated(lastUpdate);
		}

		function parseData(data)
		{
			var customData;
			var lastUpdate = lastUpdated;

			var arrivalFrom = -1;
			var arrivalTo = -1;
			var arrivalOffset = null;	// Flag to indicate not set

			for (var i = 0, len = data.length; i < len; i++)
			{
				var item = data[i];
				var id = item.n;
				var val = item.v;
				var t = item.t;

				switch (id)
				{
					case s.Visibility:
					{
						lastUpdate = (t > lastUpdate) ? t : lastUpdate;
						sendState(id, t, val);
						break;
					}

					case s.StoreLocation:
					{
						if (!pushedBase)
						{
							pushedBase = true;
							sendState(id, t, val);
						}

						break;
					}

					case s.OrderInfo:
					{
						cfg.idOrder = val;
						sendState(id, t, val);
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

					default:
					{
						if (!customData)
						{
							customData = [];
						}

						customData.push(item);
					}
				}
			}

			if (arrivalFrom > 0 && arrivalTo > 0)
			{
				// Always show in local time where task was created
				var tNew = new Date();
				var d = (arrivalOffset === null || isNaN(arrivalOffset))
							? 0	// No offset at all if arrivalOffset is invalid/doesn't come through
							: (tNew.getTimezoneOffset() + arrivalOffset) * 60 * 1000;

				sendState(s.ArrivalRange, tNew.getTime(), { from: arrivalFrom + d, to: arrivalTo + d });
			}

			// Push lastUpdated info, if any
			updateLastUpdated(lastUpdate);

			// Pass along any unknown/custom data properties
			if (customData)
			{
				viewManager.cmd(msgDataUpdate, customData);
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
