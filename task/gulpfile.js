'use strict';
// defining node objects
var path = require("path");
var gulp = require('gulp');
var gutil = require('gulp-util');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var less       = require('gulp-less');
var amdOptimize = require('gulp-amd-optimizer');
var exec = require('child_process').exec;
var fs = require('fs');

var uglifyFlag = process.env.uglify == 'true' ? true : false;

var outfile = "app.js";

// destination paths
var currentFolder = path.resolve('.');
var appFolder = currentFolder + "/../app";
var libFolder = currentFolder + "/../lib";

// source path to script libraries packages
var jQueryPath = libFolder + "/jquery/jquery-3.1.1.min.js";
var reactPath = libFolder + "/react/react_15.4.2.min.js";
var reactDomPath = libFolder + "/react/react_dom_15.4.2.min.js";
var requirePath = libFolder + "/require/require.js";
var requireDOMReadyPath = libFolder + "/require/domReady";
var bootstrapPath = libFolder + "/bootstrap/js/bootstrap.min.js";
var bootstrapStylePath = libFolder + "/bootstrap/css/bootstrap.min.css";
var bootstrapStyleThemePath = libFolder + "/bootstrap/css/bootstrap-theme.min.css";
var backbonePath = libFolder + "/backbone/backbone-min.js";
var underscorePath = libFolder + "/underscore/underscore.js";
var bootstrapFonts = [ libFolder + "/bootstrap/fonts/glyphicons-halflings-regular.ttf" ];
var destinationFont = appFolder + "/fonts";

var baseModule = "route/application";
var destdir = appFolder + "/scripts";
var globalFilePath = appFolder + "/global.js";
var srcpatterns = [ appFolder + "/scripts/**/*.js", 
                  "!" + appFolder + "/scripts/lib/**/*.js", 
                  "!" + appFolder + "/scripts/*.js", 
                  appFolder + "/scripts/**/*.jsx"];

var libjsdest = appFolder + "/scripts/lib";
var libcssdest = appFolder + "/styles";
var appless = libcssdest + "/app.less";

var outdir = process.env.OUTPUTROOT || currentFolder + "/../out";

var publishSrc = [libcssdest + '/app.css',
                  libcssdest + '/framework.css',
                  libcssdest + '/images/*.*',
                  libjsdest + '/framework.js',
                  libjsdest + '/require.js',
                  destdir + '/app.js',
                  appFolder + '/images/**/*',
                  appFolder + '/fonts/**/*',
                  appFolder + "/require.config.js",
                  appFolder + "/global.js",
                  appFolder + "/index.html",
                  appFolder + "/favicon.ico" ];

var amdOptions = {
  umd: false
};

//// amd optimization options
var requireConfig = {        
        'baseUrl': destdir,
        'paths': {         
          'jquery': 'empty',
          'underscore': 'empty',
          'backbone': 'empty',
          'react': 'empty',
          'reactdom': 'empty',
          'exports': 'empty',
          'domReady': requireDOMReadyPath
        },
        'map': {
        },
        'shim': {
          'jquery': {
            'exports': 'jQuery'
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
    };

var log = function(msg, iserr) {
    var logmsg = iserr ? gutil.colors.red(msg) : gutil.colors.green(msg);
    gutil.log(logmsg);
    /*
  exec('echo ' + msg, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
  */
};

// task for copying require JS library to local dev folder
gulp.task('copy-require', function() {
  // do not change the order
    log('copying requireJS. destination: '+libjsdest);
  return gulp.src([requirePath])
    .pipe(gulp.dest(libjsdest));
});

// task for copying all library JS to local dev folder
gulp.task('copy-lib-js', function() {
  // do not change the order
    log('copying JS libraries. destination: '+libjsdest);
  return gulp.src([jQueryPath, bootstrapPath, underscorePath, backbonePath, reactPath, reactDomPath])
    .pipe(concat('framework.js'))
    .pipe(gulp.dest(libjsdest));
});

/* Task to copy font files */
gulp.task('copy-fonts', function() {
    log('copying fonts. destination: '+destinationFont);
    gulp.src(bootstrapFonts)
        .pipe(gulp.dest(destinationFont));
});

// task for copying all library css styles to local dev folder
gulp.task('copy-lib-css', function() {
  // do not change the order
    log('copying styles. destination: '+libcssdest);
  return gulp.src([bootstrapStyleThemePath, bootstrapStylePath])
    .pipe(concat('framework.css'))
    .pipe(gulp.dest(libcssdest));
});

/* Task to compile less */
gulp.task('compile-less', ['copyComponents'], function() {
    log('compiling less to css. destination: '+libcssdest);
    gulp.src(appless)
        .pipe(less())
        .pipe(gulp.dest(libcssdest));
});
// compile from ES6 to ES5
gulp.task('compile', ['copyComponents'], function() {
    log('compiling ES6 to ES5 modules. minification: ' + uglifyFlag + '. destination: ' + destdir);
    return gulp.src(srcpatterns)
       .pipe(sourcemaps.init({loadMaps: false}))
    .pipe(babel())
    .pipe(amdOptimize(requireConfig, amdOptions))
    .pipe(concat(outfile))
        .pipe(uglifyFlag ? uglify() : gutil.noop())
      .pipe(sourcemaps.write('./', { includeContent: false }))
    .pipe(gulp.dest(destdir));
});

// generate global.js to set context such as version, etc
gulp.task('setglobal', function() {
    var timeOfBuild = (new Date()).getTime();
    var content = "window.scriptVersion=" + timeOfBuild + ";";
    fs.writeFile(globalFilePath, content, 'utf8', (err) => {
        if (err) {
          log('setglobal: global context can not be set. Error Details: ' +  err, true);
        } else {
          log('setglobal: global context set successfully.');
        }
    });
});

// publish files to out dir
gulp.task('publish', ['compile', 'compile-less', 'setglobal' ], function() {
    return gulp.src(publishSrc, {base: appFolder})
        .pipe(gulp.dest(outdir));
});

gulp.task('copyComponents', ['copy-require', 'copy-lib-js', 'copy-lib-css', 'copy-fonts']);

// default task
gulp.task('default', ['publish']);

// start the default task
gulp.start('default');
