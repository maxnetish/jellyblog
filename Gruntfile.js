module.exports = function (grunt) {

    var buildDir = 'build';
    var nodeModulesDir = 'node_modules';
    var srcDir = 'src';
    var mainAppFile = 'server.js';
    var webpack = require('webpack');
    // var webpackCommonOptions = require('./webpack.config.js');
    var webpackDevOptions = require('./webpack.config.dev.js');
    var webpackProdOptions = require('./webpack.config.prod');
    var path = require('path');

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: [
            buildDir
        ],

        copy: {
            favicon: {
                files: [
                    {
                        expand: true,
                        filter: 'isFile',
                        flatten: true,
                        src: srcDir + '/*.ico',
                        dest: path.join(buildDir, 'pub')
                    }
                ]
            },
            'json-files': {
                files: [
                    {
                        expand: true,
                        filter: 'isFile',
                        cwd: srcDir + '/',
                        src: ['**/*.json'],
                        dest: buildDir + '/'
                    }
                ]
            },
            'pug-views': {
                files: [
                    {
                        expand: true,
                        filter: 'isFile',
                        cwd: srcDir + '/views',
                        src: ['**/*.pug'],
                        dest: buildDir + '/views'
                    }
                ]
            },
            'bootstrap-base': {
                files: [
                    {
                        src: 'node_modules/bootstrap/dist/css/bootstrap.css',
                        dest: path.join(buildDir, 'pub/bootstrap.css')
                    }
                ]
            },
            'images': {
                files: [
                    {
                        expand: true,
                        filter: 'isFile',
                        cwd: 'src/images',
                        src: ['**/*.jpg', '**/*.png', '**/*.gif'],
                        dest: path.join(buildDir, 'pub')
                    }
                ]
            }
        },

        webpack: {
            dev: webpackDevOptions,
            prod: webpackProdOptions
        },

        less: {
            dev: {
                files: [
                    {
                        src: 'node_modules/bootstrap/less/normalize.less',
                        dest: path.join(buildDir, 'pub/normalize.css')
                    },
                    {
                        src: 'src/less-common/**/*.less',
                        dest: path.join(buildDir, 'pub/common.css')
                    },
                    {
                        src: 'src/less-pub/**/*.less',
                        dest: path.join(buildDir, 'pub/pub.css')
                    }
                ],
                options: {
                    sourceMap: true,
                    outputSourceFiles: true,
                    plugins: [
                        new (require('less-plugin-npm-import')),
                        new (require('less-plugin-autoprefix'))({
                            browsers: ['last 2 versions']
                        })
                    ]
                }
            },
            prod: {
                files: [
                    {
                        src: 'node_modules/bootstrap/less/normalize.less',
                        dest: path.join(buildDir, 'pub/normalize.css')
                    },
                    {
                        src: 'src/less-common/**/*.less',
                        dest: path.join(buildDir, 'pub/common.css')
                    },
                    {
                        src: 'src/less-pub/**/*.less',
                        dest: path.join(buildDir, 'pub/pub.css')
                    }
                ],
                options: {
                    sourceMap: false,
                    plugins: [
                        new (require('less-plugin-npm-import')),
                        new (require('less-plugin-autoprefix'))({
                            browsers: ['last 2 versions']
                        })
                    ]
                }
            }
        },

        delta: {
            options: {
                livereload: false
            },

            /**
             * When our JavaScript source files change, we want to browserify
             * but uglifying really not needed
             */
            'js-files': {
                files: [srcDir + '/**/*.js'],
                tasks: ['webpack:dev']
            },
            'vue-files': {
                files: [srcDir + '/**/*.js', srcDir + '/**/*.vue', srcDir + '/admin-vue-app/**/*.pug', srcDir + '/admin-vue-app/**/*.less'],
                tasks: ['webpack:dev']
            },
            'pug files': {
                files: [srcDir + '/views/**/*.pug'],
                tasks: ['copy:pug-views']
            },
            'json-files': {
                files: [srcDir + '/**/*.json'],
                tasks: ['copy:json-files']
            },
            // 'html-files': {
            //     files: [srcDir + '/**/*.html'],
            //     tasks: ['copy:index2Build']
            // },

            /**
             * When the LESS files change, we need to compile them.
             * but not minify
             */
            less: {
                files: ['src/less-common/**/*.less'],
                tasks: ['less:dev']
            }
        }
    });

    /**
     * In order to make it safe to just compile or copy *only* what was changed,
     * we need to ensure we are starting from a clean, fresh build. So we rename
     * the `watch` task to `delta` (that's why the configuration var above is
     * `delta`) and then add a new task called `watch` that does a clean build
     * before watching for changes.
     */
    grunt.renameTask('watch', 'delta');

    grunt.registerTask('dev', ['clean', 'copy', 'webpack:dev', 'less:dev']);
    grunt.registerTask('dev-delta', ['clean', 'copy', 'webpack:dev', 'less:dev', 'delta']);
    grunt.registerTask('prod', ['clean', 'copy', 'webpack:prod', 'less:prod']);
};