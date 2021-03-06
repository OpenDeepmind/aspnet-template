﻿/// <binding ProjectOpened='web' />

'use strict';

var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    source = require('vinyl-source-stream'),
    project = require('./project.json'),
    $ = require('gulp-load-plugins')({ pattern: ['*'] });

var settings = {
    // This is the URL and port for your web app during debugging, either run through
    // Visual Studio F5 command, or through the DNX "web" command. This will be default
    // be read from your hosting.ini, but can be overriden by setting manually here.
    //weburl: 'http://localhost:14300',

    // This is the port for your proxied browser-synced website.
    // The Browser Sync UI is available on the port + 1 (e.g. 8081).
    reloadport: 8080,

    https: false,

    // Which browsers to launch upon start.
    browsers: ["google chrome", "firefox"]
};

var paths = {

    node: path.join(__dirname, 'node_modules'),

    source: {
        root: path.join(__dirname, 'app'),
        lib: {
            script: path.join(__dirname, 'app', 'lib.js'),
            style: path.join(__dirname, 'app', 'lib.scss')
        }
    },

    target: {
        root: path.join(__dirname, project.webroot),
        libs: path.join(__dirname, project.webroot, 'libs'),
        fonts: path.join(__dirname, project.webroot, 'fonts'),
        modules: path.join(__dirname, project.webroot, 'modules'),
        strings: path.join(__dirname, project.webroot, 'strings'),
    }
};

var options = {

    scripts: {
        maps: true
    },

    styles: {
        maps: true
    },

    images: {
        optimizationLevel: 3,
        progessive: true,
        interlaced: true
    }
};

var watches = {
    scripts: {
        method: buildModuleScripts,
        filter: '**/*.js'
    },

    styles: {
        method: buildModuleStyles,
        filter: '**/*.scss'
    },
    files: {
        method: buildModuleFiles,
        filter: '**/*.html'
    },
    images: {
        method: buildModuleImages,
        filter: '**/*.{png,gif,jpg}'
    }
};

// Main entry point that does everything.
// BUILDS > WATCHES > HOSTS > SYNCS.
//gulp.task('start', ['build', 'watch', 'host', 'sync']);

gulp.task('default', ['web']);

gulp.task('web', function (callback) {
    $.runSequence('build', 'watch', ['host', 'sync'], callback);
});

// First copy static assets, then build vendor libs then build app and modules.
gulp.task('build', function (callback) {
    $.runSequence('clean',
                ['copy:files', 'copy:strings', 'copy:fonts'],
                ['build:lib', 'build:app'],
                callback);
});

gulp.task('build:lib', ['build:lib:js', 'build:lib:css']);

gulp.task('build:app', function () {

    // Get all module folders.
    var folders = getFolders(paths.source.root);

    var tasks = folders.map(function (folder) {

        var moduleName = folder;
        //var modulePath = path.join(paths.source.root, moduleName);

        for (var prop in watches) {
            //var watchName = prop;
            var watchOptions = watches[prop];

            // Create the path filter to look for files.
            var sourcePath = path.join(paths.source.root, moduleName, watchOptions.filter);

            // Destination folder path.
            var destinationPath = path.join(paths.target.modules, moduleName);

            watchOptions.method(moduleName, sourcePath, destinationPath);
        }
    });

    return tasks;

});


gulp.task('build:lib:js', function () {

    var b = $.browserify(paths.source.lib.script, {
        debug: false // Don't provide source maps for libs, doing so adds big size to unminified output.
    });

    return b.bundle()
        .pipe(source('lib.js'))
        .pipe(gulp.dest(paths.target.libs))
        .pipe($.vinylBuffer())
        .pipe($.uglify({
            outSourceMap: false
        }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.target.libs));

});

gulp.task('build:lib:css', function () {

    // Build the lib.css
    return gulp.src(paths.source.lib.style)
        .pipe($.sass())
        .pipe($.importCss()) // Imports the external .css files.
        .pipe($.concat('lib.css'))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(paths.target.libs))
        .pipe($.minifyCss({ keepBreaks: true }))
        .pipe($.rename({
            suffix: ".min"
        }))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(paths.target.libs))
        .on('error', $.util.log);
});

gulp.task("copy:files", function () {

    return gulp.src([path.join(paths.source.root, 'index.html'),
        path.join(paths.source.root, 'web.config'),
        path.join(paths.source.root, 'favicon.ico')])
            .pipe(gulp.dest(paths.target.root));

});

// Simple task to manually copy font files from node_modules to output target.
gulp.task("copy:fonts", function () {

    return gulp.src(path.join(paths.node, 'winjs', 'fonts', 'Symbols.ttf'))
            .pipe(gulp.dest(paths.target.fonts));

});

// Simple task to manually copy json strings to output target.
gulp.task("copy:strings", function () {

    return gulp.src('strings/**')
            .pipe(gulp.dest(paths.target.strings));

});

gulp.task('watch', ['watch:files', 'watch:lib', 'watch:app']);

// Build library if changes to lib.js or package.json.
gulp.task('watch:lib', function () {
    
    return gulp.watch([paths.source.lib.script, 'package.json'], ['build:lib']);
});

// Watches for changes and builds the proper modules
gulp.task('watch:app', function () {

    // Create a watch for each type of files.
    for (var prop in watches) {
        //var watchName = prop;
        var options = watches[prop];

        createWatch(options.filter, options.method);
    }

});

// Build library if changes to lib.js or package.json.
gulp.task('watch:files', function () {

    return gulp.watch([path.join(paths.target.root, 'index.html'), path.join(paths.target.root, 'web.config'), path.join(paths.target.root, 'favicon.ico')], ['files']);
});

//gulp.task('host', $.shell.task(['dnvm use 1.0.0-beta5', 'dnu restore', 'dnx . web']));
gulp.task('host', $.shell.task(['dnx . web']));
//gulp.task('host', $.iisExpress());

gulp.task('sync', function (callback) {

    var files = [
       paths.target.root + '**/*.html',
       paths.target.root + '**/*.css',
       paths.target.root + '**/*.png',
       paths.target.root + '**/*.js'
    ];

    // If user have not overridden the weburl, use the one from hosting.ini.
    var weburl = settings.weburl || readHostingFile();

    $.browserSync.init(files, {

        proxy: weburl,
        port: settings.reloadport,
        https: settings.https,
        ui: { port: (settings.reloadport + 1) },
        browser: settings.browsers || "google chrome"

    });

    callback();
});

// Cleans everything from the target folder.
gulp.task("clean", function (cb) {

    $.del.sync([paths.target.root]);
    cb();

});

// Builds the scripts for a specified module.
function buildModuleScripts(moduleName, sourcePath, destinationPath) {

    // Clean up existing files.
    $.del([path.join(destinationPath, watches.scripts.filter)], function () {

        // Process the module files.
        return gulp.src(sourcePath)
         .pipe($.order([
            '**/*main.js', // Ensure main is concatinated first, it contains Angular module registration.
            '**/*.js',
         ]))
        .pipe($.jshint())
        .pipe($.jshint.reporter('default'))
        .pipe($.concat(moduleName + '.js'))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(destinationPath))
        .pipe($.uglify({
            outSourceMap: options.scripts.maps
        }))
        .pipe($.rename({ suffix: '.min' }))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(destinationPath))
        .on('error', $.util.log);

    });

}

// Builds the styles for a specified module.
function buildModuleStyles(moduleName, sourcePath, destinationPath) {

    // Clean up existing files.
    $.del([path.join(destinationPath, '**/*.css')], function () {

        // Process the module files.
        return gulp.src(sourcePath)
        .pipe($.if(options.styles.maps, $.sourcemaps.init()))
        .pipe($.sass())
        .pipe($.if(options.styles.maps, $.sourcemaps.write()))
        .pipe($.csslint())  /* To avoid Ruby dependency, we'll validate CSS output and not SCSS */
        .pipe($.csslint.reporter())
        .pipe($.concat(moduleName + '.css'))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(destinationPath))
        .pipe($.minifyCss({ keepBreaks: true }))
        .pipe($.rename({
            suffix: ".min"
        }))
        .pipe($.sourcemaps.write())
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(destinationPath))
        .on('error', $.util.log);

    });

}

// Builds the HTML files for a specified module.
function buildModuleFiles(moduleName, sourcePath, destinationPath) {

    // Clean up existing files.
    $.del([path.join(destinationPath, watches.files.filter)], function () {

        // Process the module files.
        return gulp.src(sourcePath)
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(destinationPath))
        .on('error', $.util.log);

    });

}

// Builds the image files for a specified module.
function buildModuleImages(moduleName, sourcePath, destinationPath) {

    // Clean up existing files.
    $.del([path.join(destinationPath, watches.images.filter)], function () {

        // Process the module files.
        return gulp.src(sourcePath)
        .pipe($.imagemin(options.images))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest(destinationPath))
        .on('error', $.util.log);

    });

}

function createWatch(filter, callback) {
    var watchFilter = path.join(paths.source.root, filter);

    return gulp.watch([watchFilter, '!' + path.normalize(paths.source.lib)], function (event) {

        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');

        var moduleName = getModuleName(event.path);
        console.log(moduleName);
        console.log(callback);

        // Create the path filter to look for files.
        var sourcePath = path.join(paths.source.root, moduleName, filter);

        // Destination folder path.
        var destinationPath = path.join(paths.target.modules, moduleName);

        callback(moduleName, sourcePath, destinationPath);

    });
}

function readHostingFile() {
    var config = $.ini.parse(fs.readFileSync(path.join(__dirname, 'hosting.ini'), 'utf-8'))

    console.log('Found URL in hosting.ini:\n');
    console.log(config["server.urls"] + '\n');

    return config["server.urls"];
}

// Returns the name of a module where a file watch event occurred.
function getModuleName(eventPath) {

    var appFolderName = path.basename(paths.source.root);
    var array = eventPath.split(path.sep);

    var moduleName = array[array.indexOf(appFolderName) + 1];

    return moduleName;
}

// Returns a list of folder, second parameter allows ignores to be applied.
function getFolders(dir, ignores) {

    return fs.readdirSync(dir)
      .filter(function (file) {

          if (ignores !== undefined && ignores.indexOf(file) > -1) {
              return false;
          }

          return fs.statSync(path.join(dir, file)).isDirectory();

      });
}
