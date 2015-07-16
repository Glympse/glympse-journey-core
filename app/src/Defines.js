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
			, Progress: 'Progress'
			, UpdateAuth: 'UpdateAuth'
		}
		
		, MSG:
		{
			  TokenUpdate: 'TokenUpdate'				// From feedback provider to UI component
			, FeedbackSubmitted: 'FeedbackSubmitted'	// From feedback provider to UI component
			, AdapterReady: 'AdapterReady'
			, DemoUpdate: 'DemoUpdate'
			, ForceAbort: 'ForceAbort'
		}
		
		, STATE:
		{
			  OrderInfo: 'OrderInfo'
			, LastUpdate: 'LastUpdate'
			, Destination: 'Destination'
			, ArrivalRange: 'ArrivalRange'		// ?? App-specific?
			, LastUpdated: 'LastUpdated'
			, StoreLocation: 'StoreLocation'	// ?? App-specific?
			, PromiseTime: 'PromiseTime'		// ?? App-specific?
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
