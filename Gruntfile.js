module.exports = function(grunt) {

  var load = require('load-grunt-tasks')(grunt)
  , rewrite = require( "connect-modrewrite" )
  , request = require('request')
  , CodeGen = require('swagger-js-codegen').CodeGen
  , jsDiff = require('diff')
  , colors = require('colors')
  ;

  var BARTNET_HOST = grunt.option('BARTNET_HOST') || 'api-beta.opsee.co';
  var BARTNET_PORT = grunt.option('BARTNET_PORT') || '80';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    shell:{
      jekyll:{
        command:'jekyll build --source _site --destination dist --config _config.yml,_vars.yml'
      },
      npm:{
        command:'npm install'
      },
      bower:{
        command:'bower cache clean && bower install'
      },
      slate:{
        command:'npm install slate'
      },
      opseeBower:{
        command:'bower update seedling'
      },
      docker:{
        command:'docker build -t quay.io/opsee/lasape .'
      },
    },
    connect: {
      server: {
        options: {
          port: 8000,
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
    open:{
      dev:{
        path:'http://localhost:8000'
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
          'public/js/dist/deps.min.js':[
            'angular/angular.min',
            'angular-cookies/angular-cookies.min',
            'angular-resource/angular-resource.min',
            'angular-bootstrap/ui-bootstrap-tpls',
            'angular-route/angular-route.min',
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
            '../js/es6/vendor/scripts/highlight.pack',
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
          ].map(function(f){
            return 'public/lib/'+f+'.js';
          })
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
      npm: {
        options:{
          mangle:true,
          compress:{}
        },
        files:{
          'public/js/dist/npm-deps.min.js':['public/js/dist/npm-deps.js']
        }
      }
    },
    clean:{
      annotated:['**/*.annotated.js','**/*.app.js'],
    },
    browserify:{
      slate:{
        src:['node_modules/slate/src/exports.js'],
        dest:'public/js/dist/npm-deps.js',
        options:{
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
    babel:{
      options:{
        sourceMap:false
      },
      dist:{
        files:[{
          expand:true,
          cwd:'public/js/es6',
          src:['**/*.js'],
          dest:'public/js/src',
          ext:'.js'
        }]
      }
    },
    preprocess:{
      html:{
        expand:true,
        cwd:'public/js/es6',
        src:['**/*.html'],
        dest:'public/js/src',
        ext:'.html'
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
        tasks:['uglify:deps','swagger','browserify']
      },
      appIndex:{
        options:{
          livereload:true
        },
        files:['_site/index.html'],
        tasks:['shell:jekyll','copy']
      },
      emailFiles:{
        options:{
          livereload:true
        },
        files:['_site/email/**/*.**'],
        tasks:['shell:jekyll','emailBuilder:inline']
      },
      babel:{
        files:['public/js/es6/**/*.js'],
        tasks:['processbabel']
      },
      srcScripts:{
        options:{
           livereload:true
         },
        files:['js/public/src/**/*.js'],
      },
      sass:{
        files:['scss/**/*.scss'],
        tasks:['compass:dist']
      },
      sassEmail:{
        files:['scss-email/**/*.scss'],
        tasks:['compass:email','shell:jekyll','emailBuilder:inline']
      },
      css:{
        options:{
          livereload:true
        },
        files:['public/css/**/*.css']
      },
      preprocess:{
        files:['public/js/es6/**/*.html'],
        tasks:['processhtml']
      },
      pages:{
        options:{
          livereload:true
        },
        files:['public/js/src/**/*.html']
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
      },
      email:{
        options:{
          cssDir:'_site/_includes',
          sassDir:'scss-email',
          require:['breakpoint','sass-css-importer', 'compass-flexbox'],
          relativeAssets:true,
          noLineComments:true,
          outputStyle:'compact'
        }
      }
    },
    emailBuilder:{
      inline:{
        files:[{
          expand:true,
          src:['dist/email/*.html'],
          dest:'',
          ext:'.html'
        }]
      },
      litmus: {
        files: { 'dest/output.html' : 'src/input.html' },
        options: {
          encodeSpecialChars: true,
          litmus: {
            username: 'username',
            password: 'password',
            url: 'https://yoursite.litmus.com',
            applications: ['gmailnew', 'ffgmail', 'chromegmail']
          }
        }
      }
    },
    concurrent:{
      npmBower:['shell:npm','shell:bower'],
      build:['shell:opseeBower','browserify','swagger','compass:dist','babel','preprocess']
    }
  });

  grunt.registerTask('processhtml', ['newer:preprocess']);
  grunt.registerTask('processbabel', ['newer:babel']);

  grunt.registerTask('swagger', 'Generate Angular Swagger Code, Notify of Changes', function(){
    var done = this.async();
    var json = request('http://api-beta.opsee.co/api/swagger.json', function(error,response,body){
      if(error){
        grunt.log.error(error);
        done();
      }else{
        var newCode = CodeGen.getAngularCode({moduleName:'opsee.api', className:'opseeAPI', swagger:JSON.parse(body)});
        var output = 'public/js/src/api.js';
        try{
          var oldCode = grunt.file.read(output);
        }catch(err){
          var oldCode = '';
        }
        var lines = jsDiff.diffLines(oldCode,newCode);
        var changed = false;
        lines.forEach(function(line, i){
          if(line.removed){
            // grunt.log.write(colors.gray('removed: ')+line.value);
            changed = true;
          }
          if(line.added){
            // grunt.log.write(colors.cyan('added: ')+line.value);
            changed = true;
          }
        });
        if(!changed){
         grunt.log.ok('No changes.'); 
        }else{
          grunt.file.write(output,newCode);
          grunt.log.ok('New swagger code generated.');
          // grunt.log.ok(output+' created.');
        }
        done();
      }
    });
  });

  grunt.registerTask('envVars', 'Write env vars for compiling with jekyll', function(){
    var data = 'bartnet_api_host: '+BARTNET_HOST+'\n'+'bartnet_api_port: '+BARTNET_PORT;
    grunt.file.write('_vars.yml',data);
  })

  grunt.registerTask('packageCache', 'Generate packageCache file to avoid unnecessary npm install and bower install', function(){
    var done = this.async();
    var bower = grunt.file.readJSON('bower.json');
    var npm = grunt.file.readJSON('package.json');
    var combined = JSON.stringify({npm:npm,bower:bower});
    function runThem(){
      grunt.file.write('packageCache.json',combined);
      grunt.task.run(['concurrent:npmBower','uglify:deps']);
      return done();
    }
    try{
      var cache = grunt.file.read('packageCache.json');
      if(combined != cache){
        return runThem();
      }
    }catch(err){
      runThem();
    }
    if(cache){
      grunt.log.ok('package.json and bower.json up to date.');
      done();
      return true;
    }
  });



  grunt.registerTask('buildJekyll', ['compass:email','shell:jekyll','copy','emailBuilder:inline']);
  grunt.registerTask('annotate', ['ngAnnotate','uglify:annotated','clean:annotated']);
  grunt.registerTask('init', ['envVars','packageCache','shell:slate','concurrent:build','uglify:npm','buildJekyll']);
  grunt.registerTask('serve', ['connect', 'open','watch']);
  grunt.registerTask('prod', ['init','annotate']);
  grunt.registerTask('docker', ['init','shell:docker']);
  grunt.registerTask('default', ['init','serve']);

};
