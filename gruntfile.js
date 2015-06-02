/**
 * Created by Gordeev on 20.07.2014.
 */
module.exports = function (grunt) {

    var buildDir = 'build',
        publicJs = buildDir + '/js',
        publicCss = buildDir + '/css',
        publicFonts = buildDir + '/fonts';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: [
            buildDir
        ],

        less: {
            build: {
                files: [
                    {
                        src: ['webapps/less/app.less', 'webapps/admin/components/**/*.less', 'webapps/public/components/**/*.less'],
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
        },

        delta: {
            /**
             * By default, we want the Live Reload to work for all tasks; this is
             * overridden in some tasks (like this file) where browser resources are
             * unaffected. It runs by default on port 35729, which your browser
             * plugin should auto-detect.
             */
            options: {
                livereload: true
            },

            /**
             * When our JavaScript source files change, we want to browserify
             * but uglifying really not needed
             */
            'js-admin': {
                files: ['webapps/admin/**/*.js*', 'webapps/admin*.js*', '!webapps/admin/**/__tests__/*.*'],
                tasks: ['browserify:admin']
            },
            'js-public': {
                files: ['webapps/public/**/*.js*', 'webapps/public*.js*', '!webapps/public/**/__tests__/*.*'],
                tasks: ['browserify:public']
            },

            /**
             * When the LESS files change, we need to compile them.
             */
            less: {
                files: ['webapps/less/**/*.less', 'webapps/admin/components/**/*.less', 'webapps/public/components/**/*.less'],
                tasks: ['less', 'concat:css']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    /**
     * In order to make it safe to just compile or copy *only* what was changed,
     * we need to ensure we are starting from a clean, fresh build. So we rename
     * the `watch` task to `delta` (that's why the configuration var above is
     * `delta`) and then add a new task called `watch` that does a clean build
     * before watching for changes.
     */
    grunt.renameTask('watch', 'delta');

    /**
     * Watch uses in dev environment so we didn't uglify in watch task
     */
    grunt.registerTask('watch', ['clean', 'less', 'copy', 'concat', 'browserify', 'delta']);

    grunt.registerTask('default', ['clean', 'less', 'copy', 'concat', 'browserify', 'uglify']);


};