define(function(require, exports, module)
{
    'use strict';

	var Defines =
	{
		  strings: { }		// ?? Necessary??
		, CMD:
		{
			  InitUi: 'InitUi'
			, SendEvent: 'SendEvent'			// From UI to provider
			, SendFeedback: 'SendFeedback'		// From UI to provider
			, UpdateAuth: 'UpdateAuth'
		}

		, MSG:
		{
			  TokenUpdate: 'TokenUpdate'				// From feedback provider to UI component
			, EventSubmitted: 'EventSubmitted'			// From feedback provider to UI component
			, FeedbackSubmitted: 'FeedbackSubmitted'	// From feedback provider to UI component
			, ForcePhase: 'ForcePhase'					// Used by ViewController/app for forced view updates (i.e. demos)
			, ForceAbort: 'ForceAbort'
			, ComponentLoaded: 'ComponentLoaded'		// Used by snapshot mode to ensure UI sync
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
			, DriverId: 'driver_id'
			, Duration: 'duration'

			// Supporting data-stream properties (not broadcast)
			, ApptFrom: 'appt_from'
			, ApptTo: 'appt_to'
			, ApptTimezone: 'appt_tz'
		}

		, PHASE:
		{
			  None: '-'
			, Initial: 'initial'
			, Pre: 'pre'			// Same as initial?
			, Eta: 'eta'
			, Live: 'live'
			, Arrived: 'arrived'
			, Feedback: 'feedback'
			, Completed: 'completed'
			, NotSet: 'notset'
			, Aborted: 'not_completed'
			, Cancelled: 'cancelled'
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


	// Global namespace registration
	if (!window.glympse)
	{
		window.glympse = {};
	}

	if (!window.glympse.JourneyCoreDefines)
	{
		window.glympse.JourneyCoreDefines = Defines;
	}


	module.exports = Defines;
});
