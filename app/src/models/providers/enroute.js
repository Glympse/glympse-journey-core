define(function(require, exports, module)
{
    'use strict';
	
	var lib = require('glympse-journey-core/common/utils');
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

		function sendFeedback(vals)
		{
			var items = [{ _id: cfg.surveyIdRating, value: vals.rating }];
			var idInfo = cfg.surveyIdInfo;
			var i, len;
			for (i = 0, len = idInfo.length; i < len; i++)
			{
				items.push({ _id: idInfo[i], value: vals.info[i] }); 
			}
			
			if (vals.options)
			{
				var idOptions = cfg.surveyOptions;
				for (i = 0, len = idOptions.length; i < len; i++)
				{
					items.push({ _id: idOptions[i], value: vals.options[i] });
				}
			}
			
			// Handle update change in user token, as necessary
			if (!userToken)
			{
				updateAuth();
				if (!userToken)
				{
					userToken = null;
				}
			}
			
			var data = {
				  'survey_id': cfg.surveyId
				, 'uid': userToken
				, 'items': items
			};

			$.ajax(
			{
				type: 'POST',
				beforeSend: function(request)
				{
					request.setRequestHeader('Authorization', 'Glympse ' + userToken);
				},
				url: urlFeedback.replace('$INVITE', cfg.idInvite),
				data: JSON.stringify(data),
				processData: false
			})
			.done(function(data)
			{
				processFeedbackSubmission(data);
			})
			.fail(function(xOptions, status)
			{
				controller.notify(m.FeedbackSubmitted
								, new AppResponse({ code: rc.errorLoading
												  , info: 'Error loading: ' + urlFeedback })
								 );
			});
		}


		///////////////////////////////////////////////////////////////////////////////
		// CALLBACKS
		///////////////////////////////////////////////////////////////////////////////

		function processFeedbackSubmission(data)
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

			controller.notify(m.FeedbackSubmitted, response);
		}
	}

	// Consts
	EnRoute.id = 'enroute';

	// Export
	module.exports = EnRoute;

});
