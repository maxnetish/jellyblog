/**
 * Created by Gordeev on 20.07.2014.
 */
module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            build: {
                src: [
                    'public/js/lib/angular.js',
                    'public/js/lib/angular-route.js',
                    'public/js/lib/angular-sanitize.js',
                    'public/js/lib/angular-translate.js',
                    'public/js/lib/angular-translate-loader-url.js',
                    'public/js/lib/moment/moment.js',
                    'public/js/lib/moment/lang.min.js',
                    'public/js/app/**/*.js'
                ],
                dest: 'public/js/build/concat.js'
            },
            options: {
                sourceMap: true
            }
        },
        uglify: {
            build: {
                src: 'public/js/build/concat.js',
                dest: 'public/js/build/js.min.js'
            },
            options: {
                sourceMap: true,
                sourceMapIn: 'public/js/build/concat.js.map',
                compress: {
                    drop_console: true
                }
            }
        }
    });


    require('load-grunt-tasks')(grunt);
    grunt.registerTask('default', ['concat', 'uglify']);

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