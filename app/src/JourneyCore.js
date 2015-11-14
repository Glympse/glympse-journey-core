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

	var adapterMsg = GlympseAdapterDefines.MSG;
	var adapterState = GlympseAdapterDefines.STATE;

	// Note: Format is fixed. If you change it, be sure to
	// update regex in grunt/replace.js
	console.log(_id + ' v(1.5.7)');


	/*
	 * vm: Valid instance of ViewManager interface
	 * cfgCore [object]: Settings for app, viewer, and adapter
	 *
	 * [object]: { journey: { ... }, viewer: { ... }, adapter: { ... } }
	 */
	function JourneyCore(vm, cfgCore)
	{
		// Main config for app setup
		var cfg = cfgCore.journey || {};

		// consts
		var dbg = lib.dbg(_id, cfg.dbg);
		var msgDataUpdate = adapterMsg.DataUpdate;
		var msgStateUpdate = adapterMsg.StateUpdate;
		var cError = '[ERROR]: ';
		var cNumEngineUpdates = 3;
		var cNumMapUpdates = 1;
		var cNumComponentsToSync = 1;

		// state
		var that = this;

		var adapter;
		var currPhase = null;
		var etaTimeout;
		var etaUpdateInterval = cfg.etaUpdateInterval || 0;
		var initialized = false;
		var initChanges = 0;
		var initLoadedTiles = 0;
		var initSyncedComponents = 0;
		var lastUpdated = 0;
		var phaseMap = cfg.mapPhases || {};
		var phaseStateFilter = cfg.phaseStateFilter;
		var phaseStateQueue = {};
		var pushedBase = false;
		var isSnapshot = false;
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
			//dbg('** NOTIFY (' + initialized + ') ** - ' + msg, args);
			switch (msg)
			{
				case msgStateUpdate:
				{
					if (initialized)
					{
						parseState(args);
					}

					break;
				}

				case msgDataUpdate:
				{
					if (initialized)
					{
						parseData(args && args.data, false);
					}

					break;
				}

				case adapterMsg.Progress:
				{
					viewManager.cmd(msg, args.curr / args.total);
					break;
				}

				case adapterMsg.ViewerReady:
				{
					initialized = true;

					// Once the viewer is ready, seed with all cached properties
					//dbg('>>> Properties on initial invite', adapter.map.getInviteProperties());
					var oProps = adapter.map.getInviteProperties();
					var props = [];
					var stateProps = Object.keys(adapterState).map(mapAdapterStateKey);

					// Force phase first!
					var idPhase = adapterState.Phase;
					var prop = oProps[idPhase];

					stateProps.splice(stateProps.indexOf(idPhase), 1);

					if (prop)
					{
						parseState(generateStateData(idPhase, prop.t, prop.v));
					}

					if (!currPhase)
					{
						timeStart = timeStart || (new Date()).getTime();

						// If no phase, use a default or force the Live phase, as
						// it is a regular Glympse. Generally, demo mode will set
						// the desired defaultPhase, utilizing something like demobot0
						// as the invite.
						setCurrentPhase((cfg.defaultPhase || p.Live), timeStart);
						sendCurrentPhase();
					}

					for (var id in oProps)
					{
						// ignore already-handled phase
						if (id === idPhase)
						{
							continue;
						}

						prop = oProps[id];
						if (stateProps.indexOf(id) >= 0)
						{
							if (prop.v !== undefined)
							{
								parseState(generateStateData(id, prop.t, prop.v));
							}
						}
						else
						{
							props.push($.extend(oProps[id], { n: id }));
						}
					}

					// Handle Journey/custom properties
					parseData(props, true);

/*					if (isSnapshot)
					{
						// Wrap engine and map control
						var map = adapter.map.getMap();
						map.getEngine().addEventListener('render', mapTilesLoaded);
						map.addEventListener('mapviewchangeend', changeEnd);

						// Time-out semantics
						setTimeout(function()
						{
							if (initSyncedComponents >= 0)
							{
								initChanges = cNumMapUpdates;
								initLoadedTiles = cNumEngineUpdates;
								initSyncedComponents = cNumComponentsToSync;
								finalizeSnapshot();
							}
						}, 6077);
					}
*/
					setTimeout(function()
					{
						initSyncedComponents += viewManager.cmd(c.InitUi, { t: timeStart, providers: providers, adapter: adapter }) || 0;
						initChanges = cNumMapUpdates;
						initLoadedTiles = cNumEngineUpdates;
						finalizeSnapshot();
					}, 400);

					break;
				}

				case m.ForcePhase:
				{
					currPhase = args;
					sendCurrentPhase();
					break;
				}

				case m.ForceAbort:
				{
					setCurrentPhase(p.Aborted, new Date().getTime());
					sendCurrentPhase();
					break;
				}

				case m.ComponentLoaded:
				{
					if (initSyncedComponents >= 0)
					{
						initSyncedComponents++;
						if (isSnapshot)
						{
							finalizeSnapshot();
						}
					}
					break;
				}

				case adapterMsg.ViewerInit:
				{
					return viewManager.cmd(msg, { adapter: adapter, args: args });
				}

				// Known but unprocessed in core
				case adapterMsg.AdapterInit:
				case adapterMsg.AdapterReady:
				case adapterMsg.InviteInit:
				case adapterMsg.InviteReady:
				case adapterMsg.InviteAdded:
				{
					return viewManager.cmd(msg, args);
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

		/**
		 * Generate proper format of data for a StateUpdate
		 * @param   {String} id  State identifier
		 * @param   {Number} t   Timestamp when state was generated
		 * @param   {Object} val Value of updated state
		 * @returns {Object} Formatted StateUpdate object value
		 */
		function generateStateData(id, t, val)
		{
			return { id: id, t: t, val: val };
		}

		/**
		 * Update internally tracked Phase, consumeable by host app as necessary
		 * @param {String} idPhase Phase identifier
		 * @param {Number} t       Timestamp when Phase was generated
		 */
		function setCurrentPhase(idPhase, t)
		{
			currPhase = { phase: idPhase, t: t };
		}

		/**
		 * Determine if a state should be filtered from broadcast, given current phase.
		 * Note that the Phase state itself can never be filtered.
		 * @param   {Object}  cfgState Full state object to save if filtered on current phase
		 * @returns {Boolean} Flag if the passed state has been filtered/saved
		 */
		function phaseFilter(cfgState)
		{
			if (phaseStateFilter)
			{
				var id = cfgState.id;
				var filter = phaseStateFilter[id];

				if (filter && filter.length > 0 && id !== adapterState.Phase)
				{
					if (filter.indexOf(currPhase.phase) < 0)
					{
						phaseStateQueue[id] = cfgState;
						return true;
					}
				}
			}

			// Not/no longer filtered. Remove previous state from queue.
			phaseStateQueue[id] = undefined;
			return false;
		}

		/**
		 * Broadcast an updated state, if it isn't filtered based on current Phase
		 * @param {String} id  State identifier
		 * @param {Number} t   State update timestamp
		 * @param {Object} val Value of updated state
		 */
		function sendState(id, t, val)
		{
			var cfgState = generateStateData(id, t, val);
			if (phaseFilter(cfgState))
			{
				return;
			}

			viewManager.cmd(msgStateUpdate, cfgState);
		}

		/**
		 * Broadcast updated Phase state, and send along any filtered phase-based
		 * states, as necessary.
		 */
		function sendCurrentPhase()
		{
			sendState(adapterState.Phase, (currPhase && currPhase.t) || 0, currPhase);

			for (var id in phaseStateQueue)
			{
				var cfgState = phaseStateQueue[id];
				//dbg('id=' + id + ', cfgState =' + cfgState);
				if (cfgState && !phaseFilter(cfgState))
				{
					viewManager.cmd(msgStateUpdate, cfgState);
				}
			}

			if (etaTimeout)
			{
				clearTimeout(etaTimeout);
				etaTimeout = 0;
			}

			// Force an immediate ETA update on Live phase transition
			if (currPhase.phase === p.Live)
			{
				updateEstimatedEta();
			}
		}

		function updateEstimatedEta()
		{
			var invite = adapter.map.getInvites()[0];
			var eta = invite.getEtaEstimate() * 1000;
			var t = new Date().getTime();

			sendState(adapterState.Eta, t, { eta: (eta > 0) ? eta : 0, eta_ts: t });
			if (etaUpdateInterval > 0 && currPhase.phase === p.Live)
			{
				etaTimeout = setTimeout(updateEstimatedEta, etaUpdateInterval);
			}
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
				case adapterState.Eta:
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

				case adapterState.Phase:
				{
					setCurrentPhase(phaseMap[val] || val, t);
					sendCurrentPhase();
					updateLastUpdated(t);
					return;
				}

				case adapterState.Destination:
				{
					lastUpdate = (t > lastUpdate) ? t : lastUpdate;
					break;
				}

				case adapterState.InviteStart:
				{
					lastUpdate = (t > lastUpdate) ? t : lastUpdate;
					timeStart = Number(val);
					break;
				}

				case adapterState.Name:
				case adapterState.Avatar:
				{
					sendState(id, t, val);
					return;
				}

				case adapterState.Expired:
				{
					var altPhase = cfg.mapExpiredToPhase;

					if (val && altPhase)
					{
						setCurrentPhase(altPhase, t);
						sendCurrentPhase();
						return;
					}

					break;
				}
			}

			// Pass along to app container as well
			//viewManager.cmd(msgStateUpdate, data);
			sendState(id, t, val);

			// Push lastUpdated info, if any
			updateLastUpdated(lastUpdate);
		}

		/**
		 * Parse unknown data stream items passed up by the GlympseAdapter,
		 * looking for known EnRoute-based properties to present as state
		 * to the host app.
		 * @param {Array} data Array of unknown datastream properties in the format of { n: prop_id, t: timestamp, v: prop_value }
		 */
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

					case s.DriverId:
					case s.Duration:
					{
						sendState(id, t, val);
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

		function finalizeSnapshot()
		{
			if (!isSnapshot
			 || initChanges < cNumMapUpdates
			 || initLoadedTiles < cNumEngineUpdates
			 || initSyncedComponents < cNumComponentsToSync
			   )
			{
				return;
			}

/*			var map = adapter.map.getMap();

			map.getEngine().removeEventListener('render', mapTilesLoaded);
			map.removeEventListener('mapviewchangeend', changeEnd);
*/
			console.log('JOURNEY_READY');

			// Force off
			initSyncedComponents = -1;
		}


		///////////////////////////////////////////////////////////////////////////////
		// CALLBACKS
		///////////////////////////////////////////////////////////////////////////////

		/**
		 * Initialize the GlympseAdapter to handle Glympse API requests and
		 * property/state updates
		 */
		function adapterInit()
		{
			cfgCore.adapter.anon = true;
			cfgCore.adapter.initialize = adapterPostInit;

			adapter = new GlympseAdapter(that, cfgCore);
			adapter.client($(cfg.elementViewer));
		}

		/**
		 * Adapter callback made when a host-mode adapter connects to this application
		 * ---> Currently unused
		 */
		function adapterPostInit()
		{
			//dbg('POST INIT');
		}

		/**
		 * Array map callback used to generate list of valid EnRoute state identifiers
		 * @param   {String} key Object's key identifier
		 * @returns {O}      Object value from key reference
		 */
		function mapAdapterStateKey(key)
		{
			return adapterState[key];
		}

/*		function mapTilesLoaded(e)
		{
			//dbg('loaded: ' + initLoadedTiles + ', changes=' + initChanges);
			initLoadedTiles++;
			finalizeSnapshot();
		}

		function changeEnd(e)
		{
			//console.log('!!');
			initChanges++;
			finalizeSnapshot();
		}
*/

		///////////////////////////////////////////////////////////////////////////////
		// CTOR
		///////////////////////////////////////////////////////////////////////////////


		if (!cfgCore)
		{
			console.log(cError + 'Missing config!');
			return;
		}

		if (!cfgCore.adapter)
		{
			console.log(cError + 'Missing "adapter" config!');
			return;
		}

		if (!cfgCore.journey)
		{
			console.log(cError + 'Missing "journey" config!');
			return;
		}

		if (!cfgCore.viewer)
		{
			console.log(cError + 'Missing "viewer" config!');
			return;
		}

		if (!viewManager)
		{
			console.log(cError + 'viewManager not defined!');
			return;
		}

		// Set up for snapshot mode
		if (cfg.snapshotMode)
		{
			isSnapshot = true;
			cfgCore.viewer.screenOnly = true;
			console.log('SNAPSHOT_FINALIZE:JOURNEY_READY');
		}

		// Initialize the viewManager, linking this JourneyCore instance
		// to the application, and getting the number of components to
		// sync for snapshot purposes
		cNumComponentsToSync = viewManager.init(this, isSnapshot) || 0;

		// Add initial init delay to allow viewport to settle down
		setTimeout(adapterInit, 100);
	}


	module.exports = JourneyCore;
});
