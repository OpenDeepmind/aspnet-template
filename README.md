# aspnet-template
Improved [Visual Studio 2015](https://www.visualstudio.com/) project template for [ASP.NET 5](http://www.asp.net/).

While the built in ASP.NET 5 (beta) project template in Visual Studio 2015 comes with basic Gulp script, 
this repository contains an extended and improved template that you can copy and use for your own projects.

Template is designed as a starting point for building large scale Angular applications. It includes dynamic (lazy) loading
of modules (features) and individual complication of those modules. This is a Single Page Application template where
all the ASP.NET Razor files (.cshtml) have been removed and is no longer in use.

Template is optimized for performance of the final results, with only two files for scripts and two files for styles,
this will reduce the loading time for your web apps compared to loading individual components. Individual modules are
additionally compiled down to two files and lazy loaded upon request.

Source maps ensures great debugging capability while developing, even when referencing the minified versions of outputs.

Need to learn more about gulp to fully understand what's going on? Read [Building With Gulp](http://www.smashingmagazine.com/2014/06/11/building-with-gulp/).

## Documentation

### Ports
The template utilizes DNX for hosting and not IIS Express, which is default with the standard ASP.NET 5 beta project template.
Additionally is the Launch URL when running with F5 configured to launch the BrowserSync page and not directly the DNX hosted
page.

Following ports are standard with the template:

http://localhost:7600/ - DNX hosted ASP.NET 5 web app.  
http://localhost:7601/ - BrowserSync proxy URL. Launch URL from F5 (start) and Gulp script.  
http://localhost:7602/ - BrowserSync settings URL.

Why these ports? There are no widely known applications or services which uses them, so was choosen to avoid any potential conflicts.

## Introduction

Visual Studio 2015 makes a big change for web developers, moving away from NuGet packages for client dependencies and
instead rely on the industry standard package managers of NPM (Node Package Manager) and Bower. To help with this process,
we created this improved project template that you can copy as needed from.

It's based upon regular JavaScript for your scripts, and uses [Sassy CSS](http://sass-lang.com/) (SCSS) for styling. If you want to change to
regular CSS or another style language, there are plenty of Gulp tasks available to do that.

If you want to use TypeScript as oppose to JavaScript, it's a fairly easy task to customize the template so it uses
the available TypeScript compiler NPM package and changes the Gulp script filters from .js to .ts.

## Gulp Tasks

**build** Builds everything. This is run automatically on opening project in Visual Studio.

**build:lib** Builds all your bower_component dependencies into a singular lib.js file.

**build:app** Builds all your scripts, styles (SCSS) into a singular app.js file.

**build:js** Builds your scripts, generates validation report, generates source map, uglifies and minifies output.

**build:css** Builds your styles, generates validation report, generates source map, minifies output.

**watch** Runs watch:files and browser:sync tasks.

**watch:files** Watches for scripts and style changes and runs build tasks automatically.

**browser:sync** Hosts the BrowserSync plugin as a proxy for your ASP.NET 5 web app.

**clean** Cleans the entire output directory, which is the wwwroot. Make sure you never add files to the wwwroot directly.

## Common Tasks
Here are some of the commons developer tasks explained and how the workflow for developing with this template can be done.

### Adding a new external dependency

Whenever you need another external library, you simply add it to your bower.json file, saves that file to download into
the bower_components folder. Then you can run the build tasks and it will automatically includes the right files from
the bower_components folder and embed that into your output lib.js file.

### Opening Visual Studio project

Upon opening Visual Studio, the full build task will run. This will ensure that the lib.js is generated. Depending on the
amount of external dependencies, generating this file can take some time to process. It's therefore adviced not to run
the "build:lib" on each build.

### Adding new styles or scripts

The gulp tasks will automatically pick up any new files that are added to the "scripts" and "styles" folder on the root
of your project. You can make sub-folders to split your application into logical and functional modules.

## Questions and Answers

*Q: Why does the index.html include minified files by default?*

A: Frameworks such as Angular require a certain pattern to avoid breaking when minified, by loading the minified
copies of the output from the beginning, you avoid having to clean up any minification issues at a later time. It's
also important to start running the production results as early as possible in the development cycle to avoid any
big suprises. Thirdly it's a matter of performance, depending on your project size, you might get a slight performance
improvement while developing, debugging and testing your web apps.

*Q: Can I continue to use Browser Link in Visual Studio?*

A: The default template is built on a static index.html with no ASP.NET MVC 6 files running. This means the Browser Link
feature in Visual Studio is no longer supported. If you are not doing SPA and want instead to use MVC, you can continue
to use Browser Link by removing the gulp task for reload, or simply continue to use gulp for reloads.

The template relies on BrowserSync, which allows you to sync clicks and other events across multiple running instances
of your web app, so you can easily have different browsers running and automatically reloading when you modify your
code. BrowserSync acts as a pass-through proxy between ASP.NET (hosting your app) and it's endpoint.

*Q: How do I set a fixed port for web project debugging?*

A: Go into the properties on your ASP.NET 5 web project, then the Debug tab. In the IIS Express Setting section,
set your wanted port number. This number must be added to your gulpfile.js for BrowserSync to work.

*Q: Why such as large single gulpfile?*

A: While there are many ways to organize your Gulp scripts, with folders and automatic loading, this template is
implemented with a single script file for all of the Gulp tasks. This is done to reduce amount of files and might be
a bit easier for beginners to learn.

*Q: Why are external (library) dependencies only in lib.js?*

A: Most of the time, the external (library) dependencies are used all across your modules. To reduce build time
and complexity of Gulp scripts, all of the external dependencies should be specified in the lib.js and not within
individual sub-modules.

*Q: Why not read files directly from node_modules folder?*

A: By relying on Browserify, the required JavaScript files for each individual external library is automatically 
resolved. So if a library changes, e.g. splits into multiple files, you don't need to worry.

*Q: Downloading NPM packages seems to take a long time?*

A: This project template utilizes many NPM packages so there is a lot of files to download. Most of the packages
are themselves dependent on other packages, so in total there are many thousands of unpackaged files.


## License

The MIT License (MIT)

Copyright (c) 2015 Deepmind AS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

