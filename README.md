GlobalsDB Admin for NodeJS
======================
###[Project page](http://zitros.github.io/globalsDB-Admin-NodeJS)

###Description
The administrative interface to GlobalsDB. Allows to view, manage and edit contents of Globlas database.

###Features
+ Simple graphical interface
+ Optimized for keyboard, mouse or touch control
+ All common administrative functions like editing, creating, etc.
+ Master password protection
+ Independent client/server modules

###Pre-installation
+ Install [latest] NodeJS platform (http://nodejs.org/)
+ Install [latest] GlobalsDB database (http://www.globalsdb.org/downloads)

###Installation guide

Check the complete reference at the [project page](http://zitros.github.io/globalsDB-Admin-NodeJS/#description).

0. Copy folder content to any place you want. (not necessarily)
1. Check "config.js" file. Feel free to edit it for you needs.
2. Run GlobalsDB.
3. Start Node application from "run.js" file. (execute "node path/to/app/run.js" in console)
	
After startup, you have to get the positive result in your console. Then, check localhost if local client was enabled in config.js.

###Troubleshooting
+ Server started successfully, but fails when login.
 + If there are a message in console <code>&lt;GlobalsDB Startup Error: GlobalsDB not up (2)&gt;</code> - start GlobalsDB and relaunch application;
 + Check if version of cache.node adapter is equal to installed GlobalsDB version. Find adapter in <code>server/node_modules/globalsDB/cache.node</code> and replace it with appropriate adapter version. Also you might have to download the appropriate node adapter from the official GlobalsDB site for your operating system.
+ Server fails to start
 + Check previous advices.
 + Check config.js file or try to restore default one.
 + Check if [default] ports 80 and 57775 are available.
 + Check [additional](http://zitros.github.io/globalsDB-Admin-NodeJS/#description) advices.
+ I can't just log in
 + Check if master password usage turned on in config.js file and enter a correct password.

###Advices
+ Launch server app as a daemon within [forever](https://www.npmjs.org/package/forever) node module.

###Screenshoots
<img width="100%" src="http://s28.postimg.org/n230e49j1/2014_04_21_224834_1.png"/>
