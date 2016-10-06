#[Changelog] glympse-journey-core

version |date        |notes
:-------|:-----------|:------
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
