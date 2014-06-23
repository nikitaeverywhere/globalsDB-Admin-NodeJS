/**
 * That's the global configuration file for application. Feel free to edit it, but do not forget
 * to hold a reserve copy of it to restore default settings.
 */
module.exports = {

    database: { // database settings
        modulePath: "globalsDB/cache", // path to node addon file (./node_modules/<modulePath>.node)
        databases: { // list of available database directories
            GlobalsDB: "C:/HardProgram/GlobalsDB/mgr", // name: "path", name2: "path2", ...
            Cache: "C:/HardProgram/Cache/mgr" // replace with "/" or escape "\" characters in path
        }
    },

    server: { // server settings
        port: 57775, // port of server WebSocket application
        masterPassword: "protect", // authorisation password
        useMasterPassword: true, // turn master password usage on
        log: true, // log connections
        logFileName: "log.txt" // relative to this folder: path to log file including file name
    },

    localClient: { // local client settings
        enabled: true, // use local HTTP client (for browser application)
        directory: "client", // location of shared directory via HTTP (local client)
        port: 80 // port of client application. The value must not be equal to server port value
    }

};