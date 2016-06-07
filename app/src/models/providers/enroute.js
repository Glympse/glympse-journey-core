define(function(require, exports, module)
{
    'use strict';

	var lib = require('glympse-adapter/lib/utils');
	var Defines = require('glympse-journey-core/Defines');

	var c = Defines.CMD;
	var m = Defines.MSG;
	var rc = Defines.ResponseCode;
	var cResult = 'result';

	var AppResponse = require('glympse-journey-core/models/AppResponse');


	// Exported class
	function EnRoute(controller, cfg)
	{
		// consts
		var urlFeedback = cfg.baseUrl;
		var dbg = lib.dbg('providers.' + EnRoute.id, cfg.dbg);

		// components

		// state
		var userToken;


		///////////////////////////////////////////////////////////////////////////////
		// PUBLICS
		///////////////////////////////////////////////////////////////////////////////

		this.cmd = function(cmd, args)
		{
			switch (cmd)
			{
				case c.UpdateAuth:
				{
					updateAuth();
					break;
				}

				case c.SendEvent:
				{
					//dbg('SEND EVENT', args);
					sendEvent(args);
					break;
				}

				case c.SendFeedback:
				{
					//dbg('SEND FEEDBACK', args);
					sendFeedback(args);
					break;
				}

				default:
				{
					dbg('Unknown cmd "' + cmd + '"', args);
					break;
				}
			}
		};

		this.notify = function(msg, args)
		{
			switch (msg)
			{
				default:
				{
					dbg('Unknown msg "' + msg + '"', args);
					break;
				}
			}
		};


		///////////////////////////////////////////////////////////////////////////////
		// UTILITY
		///////////////////////////////////////////////////////////////////////////////

		function updateAuth()
		{
			// FIXME: Query through viewer API instead of short-circuiting
			userToken = lib.getCookie('access_token');
			//console.log('Got userToken: ' + userToken);
		}

		function sendEvent(id)
		{
			updateToken();
			postEventMessage('action', { action: id }, m.EventSubmitted);
		}

		function sendFeedback(vals)
		{
			var i, len;
			var items = [];
			var idInfo = cfg.surveyIdInfo;
			var idOptions = cfg.surveyOptions;

			for (i = 0, len = idInfo.length; i < len; i++)
			{
				items.push({ _id: idInfo[i], value: vals.info[i] });
			}

			if (idOptions && vals.options)
			{
				for (i = 0, len = idOptions.length; i < len; i++)
				{
					items.push({ _id: idOptions[i], value: vals.options[i] });
				}
			}

			updateToken();

			var data = { survey_id: cfg.surveyId
					   , uid: userToken
					   , rating: vals.rating
					   , comment: vals.comments
					   };

			if (items.length > 0)
			{
				data.items = items;
			}

			postEventMessage('feedback', data, m.FeedbackSubmitted);
		}

		function updateToken()
		{
			// Handle update change in user token, as necessary
			if (!userToken)
			{
				updateAuth();
				if (!userToken)
				{
					userToken = null;
				}
			}
		}

		function postEventMessage(eventType, data, msg)
		{
			$.ajax(
			{
				type: 'POST',
				beforeSend: function(request)
				{
					request.setRequestHeader('Authorization', 'Glympse ' + userToken);
				},
				url: urlFeedback.replace('$INVITE', lib.normalizeInvite(cfg.idInvite)),
				data: JSON.stringify({ type: eventType, data: data }),
				processData: false
			})
			.done(function(data)
			{
				processFeedbackSubmission(data, msg);
			})
			.fail(function(xOptions, status)
			{
				controller.notify(msg
								, new AppResponse({ code: rc.errorLoading
												  , info: 'Error loading: ' + urlFeedback })
								 );
			});
		}


		///////////////////////////////////////////////////////////////////////////////
		// CALLBACKS
		///////////////////////////////////////////////////////////////////////////////

		function processFeedbackSubmission(data, msg)
		{
			var response = new AppResponse({ loaded: true });

			if (data)
			{
				var statusCode = data[cResult];

				response.code = rc.success;
				response.info = statusCode;

				if (!statusCode)
				{
					response.code = rc.missingStatus;
					response.info = 'No status_code';
				}
				else if (statusCode !== 'ok')
				{
					response.code = rc.unknown;
				}
			}

			controller.notify(msg, response);
		}
	}

	// Consts
	EnRoute.id = 'enroute';

	// Export
	module.exports = EnRoute;

});
