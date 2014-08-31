/**
 * Created by Gordeev on 20.07.2014.
 */
module.exports = function (grunt) {

    var bowerPath = 'bower_components',
        publicJs = 'public/js',
        targetJsConcatAdmin = publicJs + '/app-admin.js',
        targetJsMinAdmin = publicJs + '/app-admin.min.js',
        targetJsConcatPublic = publicJs + '/app-public.js',
        targetJsMinPublic = publicJs + '/app-public.min.js',
        webappsAdmin = 'webapps/admin',
        webappsCommon = 'webapps/common',
        webappsPublic = 'webapps/public',
        publicCss = 'public/css',
        publicFonts = 'public/fonts',
        webAppsLess = 'webapps/less',
        jslibsAdmin = [
            // libs
                bowerPath + '/requirejs/require.js',
                //bowerPath + '/jquery/dist/jquery.js',
                //bowerPath + '/pathjs-amd/dist/path.js',
                //bowerPath + '/moment/min/moment-with-langs.js',
                //bowerPath + '/select2/select2.js',

                webappsAdmin + '/**/*.js',
                webappsCommon + '/**/*.js'
        ],
        jsLibsPublic = [
            // public libs
                bowerPath + '/requirejs/require.js',
                //bowerPath + '/jquery/dist/jquery.js',
                //bowerPath + '/moment/min/moment-with-langs.js',

                webappsPublic + '/**/*.js',
                webappsCommon + '/**/*.js'
        ],
        filesUglify = {};

    filesUglify[targetJsMinAdmin] = [targetJsConcatAdmin];
    //filesUglify[publicJs + '/knockout.min.js'] = [publicJs + '/knockout.js'];
    //filesUglify[publicJs + '/lodash.min.js'] = [publicJs + '/lodash.js'];
    filesUglify[publicJs + '/q.min.js'] = [publicJs + '/q.js'];
    filesUglify[targetJsMinPublic] = [targetJsConcatPublic];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [
            publicJs,
            publicCss,
            publicFonts
        ],
        less: {
            build: {
                files: [
                    {
                        src: webAppsLess + '/style.less',
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
            buildAll: {
                files: [
                    {
                        src: bowerPath + '/select2/select2.js',
                        dest: publicJs + '/select2.js'
                    },
                    {
                        src: bowerPath + '/select2/select2.min.js',
                        dest: publicJs + '/select2.min.js'
                    },
                    {
                        src: bowerPath + '/moment/min/moment-with-langs.js',
                        dest: publicJs + '/moment-with-langs.js'
                    },
                    {
                        src: bowerPath + '/moment/min/moment-with-langs.min.js',
                        dest: publicJs + '/moment-with-langs.min.js'
                    },
                    {
                        src: bowerPath + '/pathjs-amd/dist/path.js',
                        dest: publicJs + '/path.js'
                    },
                    {
                        src: bowerPath + '/pathjs-amd/dist/path.min.js',
                        dest: publicJs + '/path.min.js'
                    },
                    {
                        src: bowerPath + '/requirejs/require.js',
                        dest: publicJs + '/require.js'
                    },
                    {
                        src: bowerPath + '/jquery/dist/jquery.js',
                        dest: publicJs + '/jquery.js'
                    },
                    {
                        src: bowerPath + '/jquery/dist/jquery.min.js',
                        dest: publicJs + '/jquery.min.js'
                    },
                    {
                        src: bowerPath + '/knockoutjs/dist/knockout.debug.js',
                        dest: publicJs + '/knockout.js'
                    },
                    {
                        src: bowerPath + '/knockoutjs/dist/knockout.js',
                        dest: publicJs + '/knockout.min.js'
                    },
                    {
                        src: bowerPath + '/lodash/dist/lodash.js',
                        dest: publicJs + '/lodash.js'
                    },
                    {
                        src: bowerPath + '/lodash/dist/lodash.min.js',
                        dest: publicJs + '/lodash.min.js'
                    },
                    {
                        src: bowerPath + '/q/q.js',
                        dest: publicJs + '/q.js'
                    },
                    {
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: bowerPath + '/select2/*.png',
                        dest: publicCss + '/'
                    },
                    {
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: bowerPath + '/bootstrap/dist/fonts/*',
                        dest: publicFonts + '/'
                    }
                ]
            }
        },
        concat: {
            build: {
                src: jslibsAdmin,
                dest: targetJsConcatAdmin
            },
            buildPublic: {
                src: jsLibsPublic,
                dest: targetJsConcatPublic
            },
            buildLess: {
                src: [
                        bowerPath + '/bootstrap/dist/css/bootstrap.css',
                        bowerPath + '/bootstrap/dist/css/bootstrap-theme.css',
                        bowerPath + '/select2/select2.css',
                        publicCss + '/app.css'
                ],
                dest: publicCss + '/style.css'
            },
            options: {
                sourceMap: true
                //sourceMapBasepath: publicCss
            }
        },
        uglify: {
            buildAll: {
                files: filesUglify
            },
            options: {
                sourceMap: true,
                sourceMapIn: targetJsConcatAdmin + '.map',
                compress: {
                    drop_console: true
                }
            }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', ['clean', 'less', 'copy', 'concat', 'uglify']);

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