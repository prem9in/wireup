requirejs.s.contexts._.config.baseUrl = window.requirejsconfig ? window.requirejsconfig.baseUrl : '';
requirejs.s.contexts._.config.urlArgs = window.requirejsconfig ? window.requirejsconfig.urlArgs : '';
requirejs.config({
    'paths': {
        'jquery': 'lib/framework',
        'underscore': 'lib/framework',
        'backbone': 'lib/framework',
        'react': 'lib/framework',
        'reactdom': 'lib/framework',
        'route/application': 'app',
        'domReady': 'app'
    },
    'map': {},
    'waitSeconds': 5000,
    'shim': {
        'jquery': {
            'exports': '$'
        },
        'backbone': {
            'deps': ['jquery', 'underscore'],
            'exports': 'Backbone'
        },
        'bootstrap': {
            'deps': ['jquery']
        },
        'underscore': {
            'exports': '_'
        }
    }
});

require(["domReady", "route/application"], function(domReady, app) {
    domReady(function () {
     app.default.start();
  });
});

