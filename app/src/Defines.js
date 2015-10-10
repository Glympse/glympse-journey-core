define(function(require, exports, module)
{
    'use strict';

	module.exports =
	{
		  strings: { }		// ?? Necessary??
		, CMD:
		{
			  InitUi: 'InitUi'
			, SendFeedback: 'SendFeedback'		// From UI to provider
			, UpdateAuth: 'UpdateAuth'
		}

		, MSG:
		{
			  TokenUpdate: 'TokenUpdate'				// From feedback provider to UI component
			, FeedbackSubmitted: 'FeedbackSubmitted'	// From feedback provider to UI component
			, ForcePhase: 'ForcePhase'					// Used by ViewController/app for forced view updates (i.e. demos)
			, ForceAbort: 'ForceAbort'
		}

		, STATE:
		{
			// StateUpdate items
			  ArrivalRange: 'ArrivalRange'		// ?? App-specific?
			, FutureTime: 'future'
			, LastUpdate: 'LastUpdate'
			, OrderInfo: 'order_id'
			, PromiseTime: 'promise'
			, StoreLocation: 'base_location'
			, Visibility: 'visibility'

			// Supporting data-stream properties (not broadcast)
			, ApptFrom: 'appt_from'
			, ApptTo: 'appt_to'
			, ApptTimezone: 'appt_tz'
		}

		, PHASE:
		{
			  Initial: 'initial'
			, Pre: 'pre'			// Same as initial?
			, Eta: 'eta'
			, Live: 'live'
			, Arrived: 'arrived'
			, Feedback: 'feedback'
			, Completed: 'completed'
			, NotSet: 'notset'
			, Aborted: 'not_completed'
		}

		, ResponseCode: {
			  success: 0
			, errorLoading: 1
			, noStatus: 2
			, noData: 3
			, noToken: 4
			, throttled: 5
			, unknown: 6
			, noResponse: 999
		}
	};
});
