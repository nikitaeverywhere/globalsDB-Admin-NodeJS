module.exports = function(grunt) {

    grunt.initConfig({

        pkg: grunt.file.readJSON("package.json"),

        buildDirectory: "build",

        env: {
            options: {

            },
            dev: {
                NODE_ENV: "DEVELOPMENT"
            },
            prod: {
                NODE_ENV: "PRODUCTION"
            }
        },

        clean: {
            build: {
                src: [ "build" ]
            }
        },

        concat: {
            js: {
                src: [
                    "client/js/*.js"
                ],
                dest: "<%= buildDirectory %>/client/js/app.js"
            },
            css: {
                src: [
                    "client/css/*.css"
                ],
                dest: "<%= buildDirectory %>/client/css/app.css"
            }
        },

        uglify: {
            main: {
                files: {
                    "<%= buildDirectory %>/client/js/app.js": "<%= buildDirectory %>/client/js/app.js"
                }
            }
        },

        cssmin: {
            minify: {
                src: "<%= concat.css.dest %>",
                dest: "<%= concat.css.dest %>"
            }
        },
        
        preprocess: {
            dev: {
                src: "client/index.html",
                dest: "<%= buildDirectory %>/client/index.html"
            },
            prod: {
                src: "client/index.html",
                dest: "<%= buildDirectory %>/client/index.html"
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "<%= buildDirectory %>/client/index.html":
                        "<%= buildDirectory %>/client/index.html"
                }
            }
        },

        copy: {
            main: {
                files: [
                    {
                        src: "run.js",
                        dest: "<%= buildDirectory %>/"
                    },
                    {
                        src: "package.json",
                        dest: "<%= buildDirectory %>/"
                    },
                    {
                        src: "config.js",
                        dest: "<%= buildDirectory %>/"
                    },
                    {
                        src: "LICENSE",
                        dest: "<%= buildDirectory %>/"
                    },
                    {
                        src: "README.md",
                        dest: "<%= buildDirectory %>/"
                    },
                    {
                        src: "client/favicon.ico",
                        dest: "<%= buildDirectory %>/client/favicon.ico"
                    },
                    {
                        expand: true,
                        cwd: "client/img/",
                        src: "**",
                        dest: "<%= buildDirectory %>/client/img/"
                    },
                    {
                        expand: true,
                        cwd: "server/",
                        src: "**",
                        dest: "<%= buildDirectory %>/server/"
                    }
                ]
            }
        }

    });

    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-preprocess");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("default", [
        "env", "preprocess", "clean", "concat", "uglify", "cssmin", "preprocess", "htmlmin", "copy"
    ]);

};