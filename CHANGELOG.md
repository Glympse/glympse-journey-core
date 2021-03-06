#[Changelog] glympse-journey-core

version |date        |notes
:-------|:-----------|:------
1.10.1  | 2018/08/16 | Added `grunt jsdoc` task + some JSDoc annotations in code
1.10.0  | 2018/06/29 | Update handling for eta_range
1.9.3   | 2018/06/26 | Removed surveyIdInfo and surveyOptions logic in favor of generating IDs internally
1.9.2   | 2018/06/21 | Bugfix for ETA handling: ignore older data-property
1.9.1   | 2018/06/21 | Added handling of eta_range property
1.9.0   | 2018/06/05 | Change for 'driverId' handling: send 'driverId' via DataUpdate event
1.8.2   | 2017/12/20 | Bump minimum required glympse-adapter version to 2.11.1.
1.8.1   | 2017/10/24 | Bugfix for location checking: infinite timeout loop after the 2nd live phase event.
1.8.0   | 2017/09/09 | `numNoLocChecks` option + glympse-adapter 2.10.0
1.7.3/4 | 2017/08/07 | Bugfixes + glympse-adapter 2.9.0
1.7.2   | 2017/06/22 | Phase.None added
1.7.1   | 2017/06/17 | Loc bugfix
1.7.0   | 2017/06/17 | Localization class, sync to GA 2.4.0
1.6.0   | 2017/02/10 | Sync of glympse-adapter 2.0.0
1.5.20  | 2016/10/13 | Added `agentFirstNameOnly` config option
1.5.19  | 2016/10/06 | Delay sending "live" phase update if no location for up to 20 seconds (temp hack)
1.5.18  | 2016/07/26 | Set Feedback's userToken to undefined if no access_token (fixes upload feedback issue)
1.5.17  | 2016/07/24 | Added `getState`, `getStateVal`, `setStateVal` to common.utils
1.5.16  | 2016/07/23 | Sync to `glympse-adapter` v(1.3.10) (be sure to `bower install` to get the latest). Small docs update.
1.5.15  | 2016/07/07 | Better handling of null feedback optional fields
1.5.14  | 2016/06/24 | Don't allow expired phase map when phase is already `completed` or `cancelled`
1.5.13  | 2016/06/07 | Versions sync
1.5.12  | 2016/06/07 | Support events API (drop old feedback API)
1.5.11  | 2016/05/11 | Versions sync
1.5.10  | 2016/05/11 | Don't include feedback items if no items to report
1.5.9   | 2015/11/30 | Clean up ETA updates from viewer, some code refactor/cleanup
1.5.8   | 2015/11/17 | New comment/rating fields for feedback submission
1.5.7   | 2015/11/14 | Code cleanup
1.5.6   | 2015/11/13 | Added snapshotMode support, additional `README.md` updates
1.5.5   | 2015/11/02 | Added `Cancelled` phase
1.5.4   | 2015/10/30 | Support Expired/phase -> alternate phase mapping
1.5.3   | 2015/10/28 | Bugfixes / safeguards
1.5.2   | 2015/10/27 | Added: etaUpdateInterval setting
1.5.1   | 2015/10/26 | Normalize invite codes for feedback endpoint
1.5.0   | 2015/10/25 | `journey` config property, remove `app` cfg dependency, change signatures for `ViewerInit` and `InitUi`
1.4.0   | 2015/10/23 | phaseStateFilter added, various cleanup
1.3.3   | 2015/10/19 | Ensure default "phase" info is passed first, if not already sent
1.3.2   | 2015/10/19 | Force "phase" as initial state property advertised during ViewerReady message
1.3.1	| 2015/10/19 | Fix ArrivalRange offset calculation
1.3.0   | 2015/10/8  | Align state and data messaging models (breaks older clients)
1.2.0   | 2015/10/7  | Move to new glympse-adapter module, examples updated
1.1.0   | 2015/07/26 | Remove demo dependencies, build cleanup, support 'future' eta type
1.0.1/2 | 2015/07/16 | Bower cfg updates (no build)
1.0.0   | 2015/07/15 | Initial release
