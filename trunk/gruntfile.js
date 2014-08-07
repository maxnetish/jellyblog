/**
 * Created by Gordeev on 20.07.2014.
 */
module.exports = function (grunt) {

    var bowerPath = 'bower_components',
        publicJs = 'public/js',
        targetJsConcatAdmin = publicJs + '/app-admin.js',
        targetJsMinAdmin = publicJs + '/app-admin.min.js',
        webappsAdmin = 'webapps/admin',
        webappsCommon = 'webapps/common',
        jslibsAdmin = [
            // libs
                bowerPath + '/requirejs/require.js',

                bowerPath + '/jquery/dist/jquery.js',
                bowerPath + '/pathjs-amd/dist/path.js',
                bowerPath + '/moment/min/moment-with-langs.js',
                webappsAdmin + '/**/*.js',
                webappsCommon + '/**/*.js'
        ],
        filesUglify = {};

    filesUglify[targetJsMinAdmin] = [targetJsConcatAdmin];
    filesUglify[publicJs + '/knockout.min.js'] = [publicJs + '/knockout.js'];
    filesUglify[publicJs + '/lodash.min.js'] = [publicJs + '/lodash.js'];
    filesUglify[publicJs + '/q.min.js'] = [publicJs + '/q.js'];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [
            publicJs
        ],
        copy: {
            buildAdmin: {
                files: [
                    {
                        src: bowerPath + '/knockoutjs/dist/knockout.debug.js',
                        dest: publicJs + '/knockout.js'
                    },
                    {
                        src: bowerPath + '/lodash/dist/lodash.js',
                        dest: publicJs + '/lodash.js'
                    },
                    {
                        src: bowerPath + '/q/q.js',
                        dest: publicJs + '/q.js'
                    }
                ]
            }
        },
        concat: {
            build: {
                src: jslibsAdmin,
                dest: targetJsConcatAdmin
            },
            options: {
                sourceMap: true
            }
        },
        uglify: {
            buildAdmin: {
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
    grunt.registerTask('default', ['clean', 'copy', 'concat', 'uglify']);

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