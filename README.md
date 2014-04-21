GlobalsDB Admin for NodeJS
======================

###Description
The administrative interface to GlobalsDB. Allows to view, manage and edit contents of Globlas database.

###Features
+ Simple graphical interface
+ Optimized for keyboard, mouse or touch control
+ All common administrative functions like editing, creating, etc.
+ Master password protection
+ Independent client/server modules

###Pre-installation:
+ Install latest NodeJS platform (http://nodejs.org/)
+ Install [latest] GlobalsDB database (http://www.globalsdb.org/downloads)

###Run guide:
0. Copy folder content to any place you want. (not necessarily)
1. Check "config.js" file. Feel free to edit it for you needs. (not necessarily)
2. Run GlobalsDB.
3. Start Node application from "run.js" file. (execute "node path/to/app/run.js" in console)
	
####After start, you have to get this result in console:
<code>
Server joined.<br/>
Client joined.<br/>
Everything ready!
</code>
	
Then, if local client was enabled, check "localhost" from your browser.

###Troubleshooting:
+ Server started successfully, but fails when login.
 + If there are a message in console <code>&lt;GlobalsDB Startup Error: GlobalsDB not up (2)&gt;</code> - start GlobalsDB and relaunch application;
 + Check if version of cache.node adapter is equal to installed GlobalsDB version. Find adapter in <code>server/node_modules/globalsDB/cache.node</code> and replace it with appropriate adapter version.
+ Server fails to start
 + Check previous advices.
 + Check config.js file or try to restore default one.
 + Check if default ports 80 and 57775 are available.
+ I can't just log in
 + Check if master password usage turned on in config.js file and you enter a correct password.

###Screenshoots
<img width="100%" src="http://s28.postimg.org/n230e49j1/2014_04_21_224834_1.png"/>
