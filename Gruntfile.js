module.exports = function(grunt) {
    'use strict';
    var bannerContent = '/*! <%= pkg.name %> v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
        ' *  License: <%= pkg.license %> */\n';
    var name = '<%= pkg.name %>';

    var sourceMapMin = 'dist/' + name + '.min.js.map';
    var sourceMapUrl = name + '.min.js.map';

    var sources = [
        'lib/gs-w3sink-core.js',
        'lib/gs-w3sink-json.js',
        'lib/gs-w3sink-svg.js',
        'lib/gs-w3sink-canvas.js',
        'lib/gs-w3sink-dgs.js',
        'lib/gs-w3sink-layout.js',
        'lib/gs-w3sink-webgl.js',
        'lib/CSS_tree.js'

    ];

    grunt.initConfig({
        // pkg is used from templates and therefore
        // MUST be defined inside initConfig object
        pkg: grunt.file.readJSON('package.json'),

        qunit: {
            all: {
                options: {
                    urls: [
                        'http://localhost:8888/test/test-dgs.html',
                    ]
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8888,
                    base: '.'
                }
            }
        },

        uglify: {
            options: {
                banner: bannerContent,
                sourceMapRoot: '../',
                sourceMap: sourceMapMin,
                sourceMappingURL: sourceMapUrl
            },
            target: {
                src: sources,
                dest: 'dist/' + name + '.min.js'
            }
        },

        // concat configuration
        concat: {
            options: {
                banner: bannerContent
            },
            target: {
                src: sources,
                dest: 'dist/' + name + '.js'
            }
        },
        jshint: {
            options: {
                trailing: true,
                eqeqeq: true
            },
            target: {
                src: ['lib/**/*.js', 'test/**/*.js',
                    '!lib/d3-layout.js'
                ]
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('test', ['jshint', 'connect', 'qunit']);
    grunt.registerTask('build', ['concat', 'uglify']);

};
