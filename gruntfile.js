/**
 * Created by Gordeev on 20.07.2014.
 */
module.exports = function(grunt) {

    var buildDir = 'build',
        publicJs = buildDir + '/js',
        publicCss = buildDir + '/css',
        publicImg = buildDir + '/img',
        publicFonts = buildDir + '/fonts',
        webappsDir = 'webapps',
        commonLess = webappsDir + '/less/app.less',
        lessSource = {
            admin: [
                commonLess,
                'webapps/common/components/**/*.less',
                'webapps/admin/components/**/*.less'
            ],
            public: [
                commonLess,
                'webapps/common/components/**/*.less',
                'webapps/public/components/**/*.less'
            ]
        };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: [
            buildDir
        ],

        less: {
            admin: {
                files: [{
                    src: lessSource.admin,
                    dest: publicCss + '/admin.css'
                }],
                options: {
                    plugins: [
                        new(require('less-plugin-npm-import')),
                        new(require('less-plugin-autoprefix'))({
                            browsers: ['last 2 versions']
                        })
                    ]
                }
            },
            'admin-min': {
                files: [{
                    src: lessSource.admin,
                    dest: publicCss + '/admin.min.css'
                }],
                options: {
                    plugins: [
                        new(require('less-plugin-npm-import')),
                        new(require('less-plugin-autoprefix'))({
                            browsers: ['last 2 versions']
                        }),
                        new(require('less-plugin-clean-css'))
                    ]
                }
            },
            public: {
                files: [{
                    src: lessSource.public,
                    dest: publicCss + '/app.css'
                }],
                options: {
                    plugins: [
                        new(require('less-plugin-npm-import')),
                        new(require('less-plugin-autoprefix'))({
                            browsers: ['last 2 versions']
                        })
                    ]
                }
            },
            'public-min': {
                files: [{
                    src: lessSource.public,
                    dest: publicCss + '/app.min.css'
                }],
                options: {
                    plugins: [
                        new(require('less-plugin-npm-import')),
                        new(require('less-plugin-autoprefix'))({
                            browsers: ['last 2 versions']
                        }),
                        new(require('less-plugin-clean-css'))
                    ]
                }
            }
        },

        copy: {
            fonts: {
                files: [{
                    expand: true,
                    filter: 'isFile',
                    flatten: true,
                    src: 'node_modules/bootstrap/dist/fonts/*',
                    dest: publicFonts + '/'
                }, {
                    expand: true,
                    filter: 'isFile',
                    flatten: true,
                    src: 'node_modules/react-widgets/dist/fonts/*',
                    dest: publicFonts + '/'
                }]
            },
            images: {
                files: [{
                    expand: true,
                    filter: 'isFile',
                    flatten: true,
                    src: 'node_modules/react-widgets/dist/img/*',
                    dest: publicImg + '/'
                }]
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
                livereload: false
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
            'js-common': {
                files: ['webapps/common/**/*.js*', '!webapps/common/**/__tests__/*.*'],
                tasks: ['browserify:public', 'browserify:admin']
            },

            /**
             * When the LESS files change, we need to compile them.
             * but not minify
             */
            less: {
                files: ['webapps/less/**/*.less', 'webapps/admin/components/**/*.less', 'webapps/public/components/**/*.less', 'webapps/common/components/**/*.less'],
                tasks: ['less:admin', 'less:public']
            }
        },

        nodemon: {
            inspect: {
                script: '<%=pkg.main %>',
                options: {
                    nodeArgs: ['--debug'],
                    ignore: ['node_modules/**', '.git/', 'bower_components/**', 'build/**', 'upload/**', 'gruntfile.js'],
                    ext: 'js,jsx'
                }
            },
            inspectBreak: {
                script: '<%=pkg.main %>',
                options: {
                    nodeArgs: ['--debug-brk'],
                    ignore: ['node_modules/**', '.git/', 'bower_components/**', 'build/**', 'upload/**', 'gruntfile.js'],
                    ext: 'js,jsx'
                }
            }
        },

        concurrent: {
            options: {
                limit: 2,
                logConcurrentOutput: true
            },
            inspect: {
                tasks: ['nodemon:inspect', 'delta']
            },
            inspectBreak: {
                tasks: ['nodemon:inspectBreak', 'delta']
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
    grunt.registerTask('watch', ['clean', 'less', 'copy', 'browserify', 'delta']);

    grunt.registerTask('default', ['clean', 'less', 'copy', 'browserify', 'uglify']);

    /**
     * debug:break run build, starts node-inspector, start server and watch for changes
     */
    grunt.registerTask('debug', function(inspectBreak) {
        var nodemonTask = inspectBreak === 'break' ? 'inspectBreak' : 'inspect';

        grunt.util.spawn({
            cmd: 'node-inspector'
        });
        console.log("Node inspector running at http://localhost:8080/debug?port=5858");
        grunt.task.run(['clean', 'less', 'copy', 'browserify', 'concurrent:' + nodemonTask]);
    });

};
