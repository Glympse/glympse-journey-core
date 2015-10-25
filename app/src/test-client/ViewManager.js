define(function(require, exports, module)
{
    'use strict';

	// Glympse Adapter
	var GlympseAdapterDefines = require('glympse-adapter/GlympseAdapterDefines');
	var lib = require('glympse-adapter/lib/utils');

	// JourneyCore
	var Defines = require('glympse-journey-core/Defines');

	var c = Defines.CMD;
	var s = Defines.STATE;
	var p = Defines.PHASE;
	var m = Defines.MSG;
	var phase = Defines.PHASE;

	var adapterState = GlympseAdapterDefines.STATE;
	var adapterMsg = GlympseAdapterDefines.MSG;


	// Exported class
	function ViewManager(cfg)
	{
		// consts
		var dbg = lib.dbg('ViewManager');

		var controller;

		// ui - general
		var app = $('#divApp');
		var outputText = $('#outputText');

		// state
		var adapter;
		var currPhase;


		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		this.init = function(newController)
		{
			logEvent('init(): controller=' + (newController != null));
			controller = newController;
		};

		var etaCnt = 0;

		this.cmd = function(cmd, args)
		{
			if (cmd !== c.InitUi && (cmd !== adapterMsg.StateUpdate || args.id !== adapterState.Eta || (etaCnt++ % 60) === 0))
			{
				logEvent('cmd: <b>' + cmd + '</b>' + ((args) ? ', args' : ''), args);
			}

			switch (cmd)
			{
				case adapterMsg.Progress:
				{
					break;
				}

				case adapterMsg.ViewerInit:
				{
					adapter = cfg.adapter;
					break;
				}

				case c.InitUi:
				{
					logEvent('cmd: <b>InitUi</b>: adapter:' + args.adapter + ', providers: ' + args.providers.length + ', t: ' + args.t);
					break;
				}

				case adapterMsg.DataUpdate:
				{
					dbg('DataUpdate() unhandled data', args);
					break;
				}

				case adapterMsg.StateUpdate:
				{
					//dbg('STATE', args);
					switch (args.id)
					{
						case adapterState.Name:
						case adapterState.Eta:
						case adapterState.Avatar:
						case adapterState.InviteEnd:
						{
							break;
						}

						case adapterState.Arrived:
						{
							this.cmd(adapterMsg.DataUpdate, { id: adapterState.Phase
															, val: { phase: (args.val.hasArrived) ? phase.Arrived : phase.Live
																   , t: args.val.t
																   }
															});
							break;
						}

						case adapterState.Expired:
						{
							var isExpired = args.val;
							if (isExpired)
							{
								this.cmd(adapterMsg.DataUpdate, { id: adapterState.Phase
																, val: { phase: phase.Feedback, t: new Date().getTime() }
																});
							}

							break;
						}

						case adapterState.NoInvites:
						{
							break;
						}

						case adapterState.Phase:
						{
							currPhase = (args && args.val);
							$('#currentPhase').text(currPhase && currPhase.phase);
							break;
						}

						default:
						{
							dbg('StateUpdate() unknown id: "' + args.id + '" ', args);
							break;
						}
					}

					break;
				}

				default:
				{
					dbg('cmd() - unknown cmd: "' + cmd + '"', args);
					break;
				}
			}

			return null;
		};

		this.notify = function(msg, args)
		{
			var url;

			switch (msg)
			{
				case m.FeedbackSubmitted:
				{
					break;
				}

				default:
				{
					dbg('notify() - unknown msg: "' + msg + '"', args);
					break;
				}
			}

			return null;
		};


		///////////////////////////////////////////////////////////////////////////
		// UTILITY
		///////////////////////////////////////////////////////////////////////////

		function logEvent(tag, data)
		{
			var div = $(document.createElement('div'));
			div.html(tag + ((!data) ? '' : (': <i>' + ((typeof data === 'string') ? data : JSON.stringify(data)) + '</i>')));
			outputText.append(div);
			outputText.stop().animate({ scrollTop: outputText[0].scrollHeight }, 250);
		}


		///////////////////////////////////////////////////////////////////////////
		// CALLBACKS
		///////////////////////////////////////////////////////////////////////////

		///////////////////////////////////////////////////////////////////////////
		// INIT
		///////////////////////////////////////////////////////////////////////////
		$('#btnOutputClear').click(function()
		{
			outputText.empty();
		});
	}


	module.exports = ViewManager;
});
