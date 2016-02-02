module.exports = function(grunt) {

  var load = require('load-grunt-tasks')(grunt)
  , rewrite = require( "connect-modrewrite" )
  , request = require('request')
  , jsDiff = require('diff')
  , colors = require('colors')
  ;

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
    watch:{
      grunt:{
        files:['Gruntfile.js'],
        tasks:['browserify']
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
        files:['_site/email/**/*.**', '_site/_layouts/**/*.**'],
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
      build:['shell:opseeBower','browserify','compass:dist','babel','preprocess']
    }
  });

  grunt.registerTask('processhtml', ['newer:preprocess']);
  grunt.registerTask('processbabel', ['newer:babel']);

  grunt.registerTask('packageCache', 'Generate packageCache file to avoid unnecessary npm install and bower install', function(){
    var done = this.async();
    var bower = grunt.file.readJSON('bower.json');
    var npm = grunt.file.readJSON('package.json');
    var combined = JSON.stringify({npm:npm,bower:bower});
    function runThem(){
      grunt.file.write('packageCache.json',combined);
      grunt.task.run(['concurrent:npmBower']);
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
  grunt.registerTask('init', ['packageCache','concurrent:build','buildJekyll']);
  grunt.registerTask('serve', ['connect', 'open','watch']);
  grunt.registerTask('prod', ['init']);
  grunt.registerTask('docker', ['init','shell:docker']);
  grunt.registerTask('default', ['init','serve']);

};
