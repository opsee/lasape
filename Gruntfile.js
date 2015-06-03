module.exports = function(grunt) {

  var load = require('load-grunt-tasks')(grunt)
  , rewrite = require( "connect-modrewrite" )
  , request = require('request')
  , CodeGen = require('swagger-js-codegen').CodeGen
  ;

  function addLib(array){
    var n = [];
    array.forEach(function(a){
      n.push('public/lib/'+a+'.js');
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
        options:{
          mangle:false,
          compress:false
        },
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
            'angular-animate/angular-animate.min',
            'angular-ui-router/release/angular-ui-router',
            'angular-aria/angular-aria.min',
            'moment/moment',
            'angular-moment/angular-moment.min',
            '../js/src/vendor/scripts/highlight.pack',
            'angular-highlightjs/angular-highlightjs',
            'ngstorage/ngStorage.min',
            'angular-gravatar/build/angular-gravatar.min',
            'angular-messages/angular-messages.min',
            'angular-visibility-change/dist/angular-visibility-change.min',
            'angular-touch/angular-touch.min',
            'fastclick/lib/fastclick',
            'angular-toggle-switch/angular-toggle-switch.min',
            'angular-websocket/angular-websocket.min',
            'angular-notification/angular-notification.min'
          ])
        }
      },
      annotated: {
        options:{
          mangle:false,
          compress:false
        },
        files:{
          'public/js/dist/opsee.min.js':['public/js/dist/deps.min.js','public/js/src/app.app.js','public/**/*.annotated.js']
        }
      },
    },
    clean:{
      annotated:['**/*.annotated.js','**/*.app.js'],
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
    ngAnnotate:{
      options:{
        add:true,
        remove:true
      },
      all:{
        files:[
        {
          expand:true,
          src:['public/js/src/**/*.js'],
          ext:'.annotated.js',
          extDot:'last'
        }
        ]
      },
      //we have two annotate tasks because the app.js needs 
      //to load in before all the other modules
      app:{
        files:[
        {
          expand:true,
          src:['public/js/src/app.js'],
          ext:'.app.js',
          extDot:'last'
        }
        ]
      },
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

  grunt.registerTask('swagger', 'Generate Angular Swagger Code', function(){
    var done = this.async();
    var json = request('http://api-beta.opsee.co/api/swagger.json', function(error,response,body){
      if(error){
        grunt.log.error(error);
        done();
      }else{
        var code = CodeGen.getAngularCode({moduleName:'opsee', className:'api', swagger:JSON.parse(body)});
        grunt.file.write('public/js/src/swagger.js',code);
        done();
      }
    });
  });

  grunt.registerTask('default', ['shell:bower','compass','build','connect', 'watch']);
  grunt.registerTask('serve', ['connect', 'watch']);
  grunt.registerTask('annotate', ['ngAnnotate','uglify:annotated','clean:annotated']);
  grunt.registerTask('build', ['uglify:deps','shell:jekyll','copy','swagger']);
  grunt.registerTask('prod', ['uglify:deps','shell:jekyll','copy','annotate']);
  grunt.registerTask('docker', ['shell:bower', 'compass', 'build', 'shell:docker']);

};
