/**
 * That's the global configuration file for application.
 */
module.exports = {

    database: {
        modulePath: "./node_modules/globalsDB/cache", // globalsDB path to node module file (without extension)
        databases: { // list of available database directories
            primaryDB: "C:/HardProgram/Globals/mgr",
            secondaryDB: "C:/HardProgram/Globals/mgr2" // @test
        }
    },

    server: { // server settings
        port: 57775, // port of server WebSocket application
        masterPassword: "protect", // second password, server will disconnect any client without masterPassword if on
        useMasterPassword: true, // turn master password usage on
        log: true, // log connections
        logFileName: "log.txt" // !RELATIVE! path with file name
    },

    localClient: { // local client settings
        enabled: true, // use local HTTP client (for browser application)
        directory: "client", // !RELATIVE! frontend location to this file
        port: 80 // port of client application. MAKE SURE THAT THIS PORT IS FREE AND CLIENT PORT DOES NOT MATCH SERVER PORT
    },

    system: { // advanced settings, do not edit
        cwd: process.cwd() // globalsDB directory change fix
    }

};