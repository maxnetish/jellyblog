/**
 * Created by Gordeev on 20.07.2014.
 */
module.exports = function (grunt) {

    var buildDir = 'build',
        publicJs = buildDir + '/js',
        publicCss = buildDir + '/css',
        publicFonts = buildDir + '/fonts',
        sourceLess = 'webapps/less/app.less';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: [
            buildDir
        ],

        less: {
            build: {
                files: [
                    {
                        src: 'webapps/less/app.less',
                        dest: publicCss + '/app.css'
                    }
                ]
            },
            options: {
                // sourceMap: true
                // cleancss: true
            }
        },

        copy: {
            fonts: {
                files: [
                    {
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: 'node_modules/bootstrap/dist/fonts/*',
                        dest: publicFonts + '/'
                    }
                ]
            }
        },

        concat: {
            css: {
                src: [
                    'node_modules/bootstrap/dist/css/bootstrap.css',
                    'node_modules/bootstrap/dist/css/bootstrap-theme.css',
                    publicCss + '/app.css'
                ],
                dest: publicCss + '/style.css'
            },
            options: {
                sourceMap: true
                //sourceMapBasepath: publicCss
            }
        },

        browserify: {
            options: {
                transform: ['reactify'],
                browserifyOptions: {
                    debug: true
                }
            },
            admin: {
                files: {
                    'build/js/admin.js': ['webapps/admin.jsx']
                }
            },
            public: {
                files: {
                    'build/js/app.js': ['webapps/public.jsx']
                }
            }
        },

        uglify: {
            admin: {
                files: {
                    'build/js/admin.min.js': ['build/js/admin.js']
                }
            },
            public: {
                files: {
                    'build/js/app.min.js': ['build/js/app.js']
                }
            },
            options: {
                sourceMap: true,
                compress: {
                    drop_console: true
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['clean', 'less', 'copy', 'concat', 'browserify', 'uglify']);

    // Load tasks from the tasks folder
    //grunt.loadTasks('tasks');

    // Load all the tasks options in tasks/options base on the name:
    // watch.js => watch{}
    //grunt.util._.extend(config, loadConfig('./tasks/options/'));

    //grunt.initConfig(config);

    // Default Task is basically a rebuild
    //grunt.registerTask('default', ['concat', 'uglify', 'sass', 'imagemin', 'autoprefixer', 'cssmin']);

    // Moved to the tasks folder:
    // grunt.registerTask('dev', ['connect', 'watch']);

};