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
var amdOptimize = require('amd-optimize');
var exec = require('child_process').exec;
var fs = require('fs');

var uglifyFlag = process.env.uglify == 'false' ? false : true;

var outfile = "app.js";

// destination paths
var currentFolder = path.resolve('.');
var appFolder = currentFolder + "\\..\\app";
var libFolder = currentFolder + "\\..\\lib";

// source path to script libraries packages
var jQueryPath = libFolder + "\\jquery\\jquery-2.2.4.min.js";
var reactPath = libFolder + "\\react\\react.15.1.0.min.js";
var reactDomPath = libFolder + "\\react\\react-dom.15.1.0.min.js";
var requirePath = libFolder + "\\require\\require.js";
var bootstrapPath = libFolder + "\\bootstrap\\js\\bootstrap.min.js";
var bootstrapStylePath = libFolder + "\\bootstrap\\css\\bootstrap.min.css";
var bootstrapStyleThemePath = libFolder + "\\bootstrap\\css\\bootstrap-theme.min.css";
var backbonePath = libFolder + "\\backbone\\backbone-min.js";
var underscorePath = libFolder + "\\underscore\\underscore.js";
var bootstrapFonts = [ libFolder + "\\bootstrap\\fonts\\glyphicons-halflings-regular.ttf" ];
var destinationFont = appFolder + "\\fonts";

var baseModule = "route/application";
var destdir = appFolder + "\\scripts";
var globalFilePath = appFolder + "\\global.js";
var srcpatterns = [ appFolder + "\\scripts\\**\\*.js", 
                  "!" + appFolder + "\\scripts\\lib\\**\\*.js", 
                  "!" + appFolder + "\\scripts\\*.js", 
                  appFolder + "\\scripts\\**\\*.jsx"];

var libjsdest = appFolder + "\\scripts\\lib";
var libcssdest = appFolder + "\\styles";
var appless = libcssdest + "\\app.less";

var outdir = process.env.OUTPUTROOT || currentFolder + "\\..\\out";

var publishSrc = [libcssdest + '\\app.css',
                  libcssdest + '\\framework.css',
                  libcssdest + '\\images\\*.*',
                  libjsdest + '\\framework.js',
                  libjsdest + '\\require.js',
                  destdir + '\\app.js',
                  appFolder + '\\images\\**\\*',
                  appFolder + '\\fonts\\**\*',
                  appFolder + "\\require.config.js",
                  appFolder + "\\global.js",
                  appFolder + "\\index.html",
                  appFolder + "\\favicon.ico" ];

//// amd optimization options
var amdOptions = {
        'paths': {
          'jquery': 'empty:',
          'underscore': 'empty:',
          'backbone': 'empty:',
          'react': 'empty:',
          'reactdom': 'empty:',
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

var log = function(msg) {
  exec('echo ' + msg, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
};

// task for copying require JS library to local dev folder
gulp.task('copy-require', function() {
  // do not change the order
  return gulp.src([requirePath])
    .pipe(gulp.dest(libjsdest));
});

// task for copying all library JS to local dev folder
gulp.task('copy-lib-js', function() {
  // do not change the order
  return gulp.src([jQueryPath, bootstrapPath, underscorePath, backbonePath, reactPath, reactDomPath])
    .pipe(concat('framework.js'))
    .pipe(gulp.dest(libjsdest));
});

/* Task to copy font files */
gulp.task('copy-fonts', function() {
    gulp.src(bootstrapFonts)
        .pipe(gulp.dest(destinationFont));
});

/* Task to compile less */
gulp.task('compile-less', function() {  
  gulp.src(appless)
    .pipe(less())
    .pipe(gulp.dest(libcssdest));
});

// task for copying all library css styles to local dev folder
gulp.task('copy-lib-css', function() {
  // do not change the order
  return gulp.src([bootstrapStyleThemePath, bootstrapStylePath])
    .pipe(concat('framework.css'))
    .pipe(gulp.dest(libcssdest));
});

// compile from ES6 to ES5
gulp.task('compile', function() {
    return gulp.src(srcpatterns)
        .pipe(sourcemaps.init({loadMaps: false}))
    .pipe(babel({'modules': 'amd'}))
    .pipe(amdOptimize(baseModule, amdOptions))
    .pipe(concat(outfile))
        .pipe(sourcemaps.write())
    .pipe(gulp.dest(destdir));
});

gulp.task('compress', function() {
  log('Scripts minified.');
  return gulp.src(destdir + '\\' + outfile)
    .pipe(uglify())
    .pipe(gulp.dest(destdir));
});


// generate global.js to set context such as version, etc
gulp.task('setglobal', function() {
    var timeOfBuild = (new Date()).getTime();
    var content = "window.scriptVersion=" + timeOfBuild + ";";
    fs.writeFile(globalFilePath, content, 'utf8', (err) => {
        if (err) {
          log('Error: global context cannot be set. Details: ' +  err);
        } else {
          log('Success: global context set successfully.');
        }
    });
});

// publish files to out dir
gulp.task('publish', function() {
    return gulp.src(publishSrc, {base: appFolder})
        .pipe(gulp.dest(outdir));
});

var taskArray = ['copy-require', 'copy-lib-js', 'copy-lib-css', 'copy-fonts', 'compile','compile-less'];
if (uglifyFlag) {
  taskArray.push('compress');
}
taskArray.push('setglobal');
taskArray.push('publish');

// default task
gulp.task('default', taskArray);

// start the default task
gulp.start('default');
