/*globals require*/
require.config({
    shim: {

    },
    paths: {
        requirejs: '../lib/requirejs/require',
        almond: '../lib/almond/almond',
        jquery: '../lib/jquery/dist/jquery',
        glympse: 'common/glympse',
        UUID: '../lib/UUID.js/dist/uuid.core',
        kamino: '../lib/kamino.js/lib/kamino',
        MessageChannel: '../lib/MessageChannel.js/lib/message_channel',
        oasis: '../lib/glympse-viewer-client-adapter/app/src/common/oasis',
        rsvp: '../lib/glympse-viewer-client-adapter/app/src/common/rsvp',
        'glympse-viewer-client-adapter': '../lib/glympse-viewer-client-adapter/app/src',
        'glympse-journey-core': '.'
    },
    packages: [

    ]
});
require(['JourneyCore']);
