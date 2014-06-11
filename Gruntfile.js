module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        buildDirectory: "build",

        concat: {
            main: {
                src: [
                    "client/js/*.js"
                ],
                dest: "<%= buildDirectory %>/client/js/app.js"
            }
        },

        uglify: {
            main: {
                files: {
                    "<%= buildDirectory %>/client/js/app.js": "<%= buildDirectory %>/client/js/app.js"
                }
            }
        },

        copy: {
            main: {
                files: [
                    { src: "run.js", dest: "<%= buildDirectory %>/" },
                    { src: "package.json", dest: "<%= buildDirectory %>/" },
                    { src: "config.js", dest: "<%= buildDirectory %>/" },
                    { src: "LICENSE", dest: "<%= buildDirectory %>/" },
                    { src: "server/**", dest: "<%= buildDirectory %>/" }, // @todo
                    { src: "client/**", dest: "<%= buildDirectory %>/" } // @todo
                ]
            }
        }

    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("default", [/*"concat", "uglify",*/ "copy"]);

};