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
			, ShowInvites: 'ShowInvites'
			, UpdateAuth: 'UpdateAuth'
		}

		, MSG:
		{
			  TokenUpdate: 'TokenUpdate'				// From feedback provider to UI component
			, FeedbackSubmitted: 'FeedbackSubmitted'	// From feedback provider to UI component
			, AdapterReady: 'AdapterReady'
			, ForcePhase: 'ForcePhase'					// Used by ViewController/app for forced view updates (i.e. demos)
			, ForceAbort: 'ForceAbort'
		}

		, STATE:
		{
			// Data-stream properties
			  ApptFrom: 'appt_from'
			, ApptTo: 'appt_to'
			, ApptTimezone: 'appt_tz'
			, FutureTime: 'future'
			, OrderInfo: 'order_id'
			, PromiseTime: 'promise'
			, StoreLocation: 'base_location'
			, Visibility: 'visibility'

			// Meta-state
			, ArrivalRange: 'ArrivalRange'		// ?? App-specific?
			, LastUpdate: 'LastUpdate'
			, LastUpdated: 'LastUpdated'
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
