#Glympse Journey (Core)
=======================

##Overview
The Glympse Journey Core (GJC) component is the Journey engine, handling all interaction with the Glympse
En Route suite of products. In addition, it handles all setup and interaction with the Glympse Viewer
component, providing an API extension of the Glympse Viewer via its usage of the
[Glympse View Client Adapter](https://github.com/Glympse/glympse-viewer-client-adapter).

##Structure
The GJC is to be used as the main controller for any web-based EnRoute viewing experience. It facilitates
all interaction with:
 
- The Glympse Viewer
- The Glympse En Route-generated data stream items
- The Glympse View Client Adapter (used for passing state along to iframe-hosted experiences)
- Custom UI component faciliting the display and interaction with users -- the Journey "app"

It operates on the core premise of EnRoute "phases", which are discrete instances of a customer's
order journey. Please refer to the Glympse EnRoute programming guide for additional information
related to the definition of each discrete phase instance.

The GJC operates on a structured configration, covering:

- Application settings
- Glympse viewer configuration
- Glympse view client adapter options

Below are all of the available settings, as related to the GJC and its sub-components:

	{
		app: {
			  dbg: 0|1 -- console.log output
			, screenOnly: bool --  Skip animations for fast screenshoting
			, mapCompletedToFeedbak: bool -- Force feedback phase if completed phase is seen
			, mapEtaNotLive: bool -- Treat Eta phase as live map phase (necessary in core?)
			, invite: INVITE_ID -- Glympse-generated invite code to be viewed
			, provider: {  -- Feedback provider configuration (example shows EnRoute Feedback provider)
			        id: "enroute"
				  , appkey: YOUR_APP_KEY
				  , baseUrl: API_ENDPOINT
				  , dbg: 0|1
				  , surveyId: ID_SURVEY
				  , surveyIdRating: ID_SURVEY_RATING
				  , surveyIdInfo: [ ID_INFO_0, ..., ID_INFO_N ]
				  , surveyOptions: [ ID_OPTION_0, ..., ID_OPTION_N ]
			}
			, strings: {
				... App-specific strings, in key: value format ...
				... KEY0: VALUE0 ...
				... , KEY1: VALUE1 ...
				... etc. ...
			}
			... additional options passed along to the connected viewing component ... 
		},
		
		viewer: {
			... Glympse viewer-specific settings ...
		},
		
		adapter: {
			  hideEvents: false -- do not change (debugging option)
			, hideUpdates: false -- do not change (debugging option)
			, element: $('#VIEWER_ELEMENT_ID') -- #VIEWER_ELEMENT_ID is where the Glympse Viewer is to be displayed
		}
	}
	

##ViewManager setup
After the GJC component is properly set up and initialized with an EnRoute-based
Glympse invite, all of the generated data and information is passed to a connected
ViewManager object.

The ViewManager object is the main controller for all UI/UX behaviors and flow of
the Journey experience. It is the consumer of the GJC and is the final "app"
generated in conjuction with the GJC and all of its subcomponents.

To properly interface with the GJC, the ViewManager must implement the following
public member functions:

- `init(newController)`: Called during invite initialization, with a reference to
  the GJC instance to be used for app to GJC notifications and requests. Refer
  below for the exposed GJC APIs.
- `cmd(cmd, args)`: A notification or command passed from the GJC controller to
  update the ViewManager-based app with updates to the EnRoute invite. `cmd` is
  a predefined identifier, defined either in the `glympse-journey-core.Defines.CMD`,
  or `glympse-view-client-adapter.ViewClientAdapterDefines.MSG` namespaces. `args`
  are the support values associated with the passed `cmd` value. [TO-DO: Outline
  these in more detail]
- `notify(msg, args)`: Though not required, it is recommended to implement this
  interface for subcomponents of the app that need to bubble up or request some
  resource from the ViewManager. This is similar to the top-down `cmd` interface
  (i.e. from GJC to ViewManager), but with a bottom-up approach (i.e. from sub-
  components to ViewManager). `msg` values are generally custom/internal
  identifiers, save for some pre-defined message identifiers used in
  communicating with the GJC instance, or its subcomponents.

##GJC API endpoints
The GJC exposes a single public endpoints to allow for the ViewManager-managed
app to drive the platform aspects of the Journey experience:

    GJCinstance.notify(msg, args);

Identical to the ViewManager `notify` interface described above, the messages/
content passed from the ViewManager to the GJC are used to drive various features
provided by the GJC (i.e., Feedback, Glympse Viewer API endpoints, custom external
iframe interfaces, etc.)

[TODO: Document available messages, associated arguments, and potential return
values]


##GJC Feedback component
[TODO: Describe calls/configuration necessary to interact with the Feedback component]


##Putting it all together
To build a stand-alone application that leverages the GJC (and its subcomponents),
the GJC is pulled in as a bower component (i.e. `bower install glympse-journey-core --save`)
to a ViewManager-based project. Note that `jquery` is a required component of the
GJC component system, and must be included with your project.

In conjunction with the ViewManager-driven application, a small wrapper is needed
to properly bind the GJC with your ViewManager object:

	var vm, core;
	var cfg = CONFIG_OBJ;
	
	$(document).ready(function()
	{
		vm = new ViewManager(cfg.app);		// Create ViewManager instance
		core = new JourneyCore(vm, cfg);	// Create GJC instance, passing in VM instance and running configuration
											// ---> c ore will call vm.init(ref) internally to pass its instance to your VM object
	});

To get you going, the `src/test` directory contains a sample project that illustrates a very basic
setup with a visualization of all of the messages passed from the GJC and its
sub-components, and allows for communication from the ViewManager back to the
GJC instance.

Additionally, there is a [Yeoman](http://yeoman.io/) generator that creates a basic ready-to-go
project GJC-based project. More details can be found at
[https://github.com/Glympse/generator-glympse-journey-app](https://github.com/Glympse/generator-glympse-journey-app).


##Local GJC project setup/build verification 
It is actually quite simple really!

First make sure you have node.js installed... without that nothing works!  You can either install it
with your favorite package manager or with [the installer](http://nodejs.org/download) found on
[nodejs.org](http://nodejs.org).

Once you have node set up, you'll need to install app-specific packages to facilitate all of the
automated building for this component:

1. Ensure you are in this project's root directory
2. This project relies on `grunt-cli` and `bower` to do all the heavy lifting for you, so: `npm install -g grunt-cli bower`. Note these will be local project installs, which `grunt` will eventually reference. It isn't enough to just have these packages installed somewhere in your build environment.
3. Now, install all of the base project dependencies: `npm install && bower install`. Again, this must be issue for local project builds. Note that none of the installed packages are committed to `git`.
4. Now you will be able to issue `grunt` to validate changes and generate a build (all output is placed in `dist/`)

Note: Currently, the GJC is intended to be used a bower component for end-user projects. While it will
generate acompiled/minified .js file, it is not currently used. However, the `grunt` command should be
successful before final git submission for users.

For final git submissions for public consumption, the following items should be covered:

- Version information updates:
  - `Gruntfile.js`: `data.config.moduleVersion` with the new [semantic](http://http://semver.org/) (MAJOR.MINOR.PATCH) version
  - `bower.json`: `version` property (same value as used above)
- This `README.md` with any relevent changes
- `CHANGELOG.md` should be updated with high-level change info
- `grunt` should return no warnings or errors
  - Note that `grunt` will also generate a compiled version of the GJC component, located in the root `builds/` directory
- git checkin to the repo's master branch, including a tag with the same semantic version used in the config versioning updates, as described above (this allows bower consumers to update to this version)
