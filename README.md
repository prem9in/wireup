# Wireup #

----------
This is a primer for web UI MVVM apps. 
Key features for this primer are
- Components are implemented in [ES6](http://exploringjs.com/es6/ch_about-es6.html "ES6")
- MVP architecture using [Backbone](http://backbonejs.org/ "Backbone")
- Views are built using [React](http://facebook.github.io/react/ "React") 
- [Less](http://lesscss.org/ "Less") for css is also integrated in this primer. 


> http ajax pipeline for [Backbone](http://backbonejs.org/ "Backbone") is refactored in this project with a custom implementation. This is not necessary. It was added to have more control on http requests made by client.
> For all normal purposes, [Backbone](http://backbonejs.org/ "Backbone") default ajax pipeline can be used.


## Building the project ##
For building this project, please ensure you have latest version of [node](https://nodejs.org/en/ "NodeJs") and [npm](https://www.npmjs.com/ "npm") installed on your machine.

1. First step is to get all required npm packages. To do this open command prompt and at root folder (where file package.json resides) execute
		`npm install .`

Do not forget the dot at the end of command.
2. Once all modules are downloaded run build.cmd, present in same folder, from command prompt

		`build.cmd`

Under the hood build.cmd uses [gulp](http://gulpjs.com/ "gulp") streaming build system and [babel](https://babeljs.io/ "babel") compiler through [node](https://nodejs.org/en/ "NodeJs").
3. All required files will be dropped in out directory as well as alongside the files in app folder.
4. Run index.html via a http endpoint and application would be running.


> Warning from build 
`fs: re-evaluating native module sources is not supported. If you are using the graceful-fs module, please update it to a more recent version.`
> [graceful-fs](https://www.npmjs.com/package/graceful-fs "graceful-fs") module is used by [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps "gulp-sourcemaps") module. Once sourcemaps module; updates this dependency, our warning will be gone.


## Using wireup ##
Fork the repository and then use the primer to build new apps in forked repository.
