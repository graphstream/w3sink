module.exports = function(grunt) {
	'use strict';
    var bannerContent = '/*! <%= pkg.name %> v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
        ' *  License: <%= pkg.license %> */\n';
    var name = '<%= pkg.name %>';

    var sourceMapMin = 'dist/' + name + '.min.js.map';
    var sourceMapUrl = name + '.min.js.map';

    var sources = [
        'gs-w3sink-core.js',
        'gs-w3sink-json.js',
        'gs-w3sink-svg.js',
        'gs-w3sink-canvas.js',
        'gs-w3sink-dgs.js',
        'gs-w3sink-layout.js',
        'gs-w3sink-webgl.js'
    ];

    grunt.initConfig({
        // pkg is used from templates and therefore
        // MUST be defined inside initConfig object
        pkg: grunt.file.readJSON('package.json'),

        qunit: {
            target: {
                src: ['test/**/*.html']
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

    grunt.registerTask('default', ['jshint', 'qunit']);
    grunt.registerTask('build', ['jshint', 'qunit', 'concat', 'uglify']);

};
