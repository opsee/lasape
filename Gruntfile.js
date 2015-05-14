module.exports = function(grunt) {

  var rewrite = require( "connect-modrewrite" );

  function addLib(array){
    var n = [];
    array.forEach(function(a){
      n.push('public/lib/'+a+'.js');
    });
    return n;
  }

  function addSrc(array){
    var n = [];
    array.forEach(function(a){
      n.push('js/src/'+a+'.js');
    });
    return n;
  }

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jekyll: {                             // Task
      options: {                          // Universal options
        bundleExec: false,
        src : '_site',
        serve:false
      },
      dist: {                             // Target
        options: {                        // Target options
          dest: 'dist',
          config: '_config.yml'
        }
      },
    },
    shell:{
      jekyll:{
        command:'jekyll build --source _site --destination dist --config _config.yml'
      },
      bower:{
        command:'bower install'
      },
      docker:{
        command:'docker build -t opsee/lasape .'
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          base: '',
          open:true,
          middleware: function(connect, options, middlewares) {
            var rules = [
                "!\\.html|\\.js|\\.css|\\.svg|\\.jp(e?)g|\\.png|\\.woff|\\.tiff|\\.gif$ /index.html"
            ];
            middlewares.unshift( rewrite( rules ) );
            return middlewares;
          }
        }
      }
    },
    copy:{
      html:{
        files:[
        {
          src:'dist/index.html',
          dest:'index.html',
          filter:'isFile'
        }
        ]
      }
    },
    uglify:{
      deps:{
        files:{
          'public/js/dist/deps.min.js':addLib([
            'angular/angular.min',
            'angular-cookies/angular-cookies.min',
            'angular-resource/angular-resource.min',
            'angular-bootstrap/ui-bootstrap-tpls',
            'angular-route/angular-route.min',
            'lodash/lodash.min',
            'ngstorage/ngStorage.min',
            'angular-http-auth/src/http-auth-interceptor',
            'angulartics/dist/angulartics.min',
            'angulartics/dist/angulartics-ga.min',
            'ngActivityIndicator/ngActivityIndicator.min',
            'angular-sanitize/angular-sanitize.min',
            'angular-validation-match/dist/angular-input-match.min',
            'angular-material/angular-material.min',
            'angular-animate/angular-animate.min',
            'angular-ui-router/release/angular-ui-router',
            'angular-aria/angular-aria.min',
            'moment/moment',
            'angular-moment/angular-moment.min',
            '../js/src/vendor/scripts/highlight.pack',
            'angular-highlightjs/angular-highlightjs',
            'ngstorage/ngStorage.min',
            'angular-gravatar/build/angular-gravatar.min'
          ])
        }
      }
    },
    autoprefixer:{
      single_file:{
        options:{
          browsers:['last 2 versions']
        },
        src:'css/src/style.css',
        dest:'css/dist/style.min.css'
      }
    },
    watch:{
      grunt:{
        files:['Gruntfile.js'],
        tasks:['uglify:deps']
      },
      j:{
        options:{
          livereload:true
        },
        files:['_site/**/*.**'],
        tasks:['shell:jekyll','copy']
      },
      srcScripts:{
        options:{
           livereload:true
         },
        files:['js/public/**/*.js'],
      },
      sass:{
        files:['scss/**/*.scss'],
        tasks:['compass']
      },
      css:{
        options:{
          livereload:true
        },
        files:['public/css/**/*.css']
      },
      pages:{
        options:{
          livereload:true
        },
        files:['public/**/*.html']
      }
    },
    compass:{
      dist:{
        options:{
          cssDir:'public/css/src',
          sassDir:'scss',
          imagesDir:'public/img',
          fontsPath:'fonts',
          require:['breakpoint','sass-css-importer', 'compass-flexbox'],
          httpPath:'',
          relativeAssets:true,
          noLineComments:true,
          outputStyle:'compact'
        }
      }
    },
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Default task(s).
  grunt.registerTask('default', ['shell:bower','compass','build','connect', 'watch']);
  grunt.registerTask('build', ['uglify','shell:jekyll','copy']);
  grunt.registerTask('docker', ['shell:bower', 'compass', 'build', 'shell:docker']);

};
