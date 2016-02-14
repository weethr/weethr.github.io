/**
 * --------------------------------------------------------------------
 * Copyright 2015 Nikolay Mavrenkov
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * --------------------------------------------------------------------
 *
 * Author:  Nikolay Mavrenkov <koluch@koluch.ru>
 * Created: 03.11.2015 22:56
 */

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    watch = require('gulp-watch'),
    streamify = require('gulp-streamify'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    watchify = require('watchify'),
    anybar = require('anybar'),
    fs = require('fs'),
    babelify = require('babelify'),
    babelPresetEs2015 = require('babel-preset-es2015'),
    babelPresetReact = require('babel-preset-react'),
    babelPresetStage0 = require('babel-preset-stage-0'),
    notifier = require('node-notifier');

    packageJson = require('./package.json');


var DEBUG_ROOT = './debug';
var SRC_ROOT = '.';
var PROD_ROOT = '..';



gulp.task('static', function(){
    var files = SRC_ROOT + '/static/**/*';
    return gulp.src(files)
        .pipe(gulp.dest(PROD_ROOT))
});

gulp.task('scripts_vendor', function(){
    var bundler = browserify(SRC_ROOT + '/.noop.js', {
        debug: false,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: [".js", ".jsx"],
        require: Object.keys(packageJson.dependencies)
    });

    function onError(err) {
        gutil.log(gutil.colors.red(err.message));
    }

    bundler = bundler.transform(babelify, {
        global: true,
        presets: [babelPresetReact, babelPresetEs2015]
    })

    return bundler.bundle()
        .on('error',  onError)
        .pipe(source('vendor.js'))
        .on('error', onError)
        .pipe(streamify(uglify()))
        .on('error', onError)
        .pipe(gulp.dest(PROD_ROOT + '/scripts'))
        .on('error', onError)
});

gulp.task('scripts_context', function(){
    var files = SRC_ROOT + '/scripts/context_prod.js';
    return gulp.src(files)
        .pipe(rename('context.js'))
        .pipe(gulp.dest(PROD_ROOT + '/scripts'))
});

gulp.task('scripts', function(){
    var bundler = browserify(SRC_ROOT + '/scripts/main.js', {
        debug: false,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: [".js", ".jsx"]
    });

    function onError(err) {
        gutil.log(gutil.colors.red(err.message));
    }

    // Register all dependencies as external (they are loaded via vendor bundle)
    Object.keys(packageJson.dependencies).forEach(function(dep){
        bundler.external(dep)
    })

    bundler = bundler.transform(babelify, {
        global: true,
        presets: [babelPresetStage0, babelPresetReact, babelPresetEs2015]
    })

    return bundler.bundle()
        .on('error',  onError)
        .pipe(source('app.js'))
        .on('error', onError)
        .pipe(streamify(uglify()))
        .on('error', onError)
        .pipe(gulp.dest(PROD_ROOT + '/scripts'))
        .on('error', onError)
});

gulp.task('styles', function(){
    var files = SRC_ROOT + '/styles/**.scss';
    return gulp.src(files)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(gulp.dest(PROD_ROOT + '/styles'))
});

gulp.task('default', ['static', 'scripts_vendor', 'scripts_context', 'scripts', 'styles']);


//***************** Debug *****************

gulp.task('debug_static', function(){
    var files = SRC_ROOT + '/static/**/*';
    return gulp.src(files)
        .pipe(watch(files))
        .pipe(gulp.dest(DEBUG_ROOT))
});


gulp.task('debug_scripts_vendor',  function(){
    var bundler = browserify(SRC_ROOT + '/.noop.js', {
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: false,
        extensions: [".js", ".jsx"],
        require: Object.keys(packageJson.dependencies)
    });

    bundler = bundler.transform(babelify, {
        global: true,
        presets: [babelPresetStage0, babelPresetReact, babelPresetEs2015]
    })
    bundler = watchify(bundler);

    function onError(err) {
        anybar('red');
        gutil.log(gutil.colors.red(err.message));
        notifier.notify({
          'title': 'ERROR',
          'message': err.message
        });        
    }

    function rebundle() {
        anybar('yellow');
        var bundle = bundler.bundle()
            .on('error',  onError)
            .pipe(source('vendor.js'))
            .on('error', onError)
            .pipe(gulp.dest(DEBUG_ROOT + '/scripts'))
            .on('error', onError)
            .on('end', function(){
                anybar('green');
            })
        return bundle
    }

    bundler.on('update', function() {
        var start = Date.now();
        gutil.log('Rebundle vendor...');
        var bundle = rebundle();
        bundle.on('end', function(){
            gutil.log("Done! Time: " + (Date.now() - start));
        });
    });

    return rebundle();

});

gulp.task('debug_scripts_context', function(){
    var files = SRC_ROOT + '/scripts/context_debug.js';
    return gulp.src(files)
        .pipe(watch(files))
        .pipe(rename('context.js'))
        .pipe(gulp.dest(DEBUG_ROOT + '/scripts'))
});

gulp.task('debug_scripts', function(){
    var bundler = browserify(SRC_ROOT + '/scripts/main.js', {
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true,
        extensions: [".js", ".jsx"]
    });

    // Register all dependencies as external (they are loaded via vendor bundle)
    Object.keys(packageJson.dependencies).forEach(function(dep){
        bundler.external(dep)
    })

    bundler = bundler.transform(babelify, {
        presets: [babelPresetStage0, babelPresetReact, babelPresetEs2015]
    })
    bundler = watchify(bundler);

    function onError(err) {
        anybar('red');
        gutil.log(gutil.colors.red(err.message));
        notifier.notify({
          'title': 'ERROR',
          'message': err.message
        });
    }

    function rebundle() {
        anybar('yellow');
        var bundle = bundler.bundle()
            .on('error',  onError)
            .pipe(source('app.js'))
            .on('error', onError)
            .pipe(gulp.dest(DEBUG_ROOT + '/scripts'))
            .on('error', onError)
            .on('end', function(){
                anybar('green');
            })
        return bundle
    }

    bundler.on('update', function() {
        var start = Date.now();
        gutil.log('Rebundle app...');
        var bundle = rebundle();
        bundle.on('end', function(){
            gutil.log("Done! Time: " + (Date.now() - start));
        });
    });

    return rebundle();
});

gulp.task('__debug_styles', function(){
    var files = SRC_ROOT + '/styles/**.scss';
    return gulp.src(files)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 Chrome versions']}))
        .pipe(gulp.dest(DEBUG_ROOT + '/styles'))
});

gulp.task('debug_styles', ['__debug_styles'], function(){
    var files = SRC_ROOT + '/styles/**.scss';
    return gulp.watch(files, ['__debug_styles'])
});
gulp.task('debug', ['debug_static', 'debug_styles', 'debug_scripts_vendor', 'debug_scripts', 'debug_scripts_context']);
