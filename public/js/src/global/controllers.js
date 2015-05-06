(function(){

angular.module('opsee.global.controllers', ['opsee.global.services']); 

function headerController($scope, Global, $location, $rootScope) {
  // $scope.user = $rootScope.user;
  $scope.navbarEntries = [
    {
      title:'Checks',
      sref:'checks',
      children:[]
    },
    {
      title:'User',
      children:[
        {
          title:'Login',
          sref:'login',
        },
      ]
    },
    {
      title:'Onboarding',
      children:[
        {
          title:'Start',
          sref:'onboard.start',
        },
        {
          title:'Tutorial',
          sref:'onboard.tutorial.1',
        },
        {
          title:'Set Password',
          sref:'onboard.password',
        },
        {
          title:'Create Team',
          sref:'onboard.team',
        },
        {
          title:'Credentials',
          sref:'onboard.credentials',
        },
      ]
    },
    {
      title:'Admin',
      children:[
        {
          title:'Signups',
          sref:'signups',
        },
      ]
    }
  ];
  $scope.isActive = function ($index) {
    // if($scope.navbarEntries[$index].link == $location.path()){
    //   return true;
    // }
    // var c = _.pluck($scope.navbarEntries[$index].children,'link');
    // return c.indexOf($location.path()) > -1
  };
  $scope.navCollapsed = true
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
    $scope.navCollapsed = true;
  });
}

angular.module('opsee.global.controllers').controller('HeaderController', headerController);

function footerController($scope, Global, $location) {
  $scope.navbarEntries = [
    {
      title: "About",
      link: "/about",
      children:[]
    }
  ];
}

angular.module('opsee.global.controllers').controller('FooterController', footerController);

function HomeCtrl($scope, $rootScope, _, $state, Check){
  // if(!$rootScope.user.account.email){
  //   $state.go('onboard');
  // }
  $scope.checks = [
    {
      name:'Wee a check',
      status:{
        health:25,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-60000),
          duration:180000
        }
      },
    },
    {
      name:'Another check',
      status:{
        health:50,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-100000),
          duration:500000
        }
      },
    },
    {
      name:'Third check.',
      info:'This is info here',
      status:{
        health:70,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-10000).toString(),
          duration:20000
        }
      },
    },
    {
      status:{
        health:null,
        state:'unmonitored',
        silence:{
          startDate:null,
          duration:null
        }
      },
    },
    {
      status:{
        health:null,
        state:'stopped',
        silence:{
          startDate:null,
          duration:null
        }
      },
    },
  ];
  $scope.checks.forEach(function(c,i){
    $scope.checks[i] = new Check(c);
  });
}
angular.module('opsee.global.controllers').controller('HomeCtrl',HomeCtrl);

function NotFoundCtrl($scope, $rootScope, _, $state){
}
angular.module('opsee.global.controllers').controller('NotFoundCtrl',NotFoundCtrl);

function config ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
    $stateProvider.state('app', {
      'abstract': true,
      resolve: {
        authorize:function(authorization) {
          return authorization.authorize();
        }
      }
    })
    .state('home', {
      url:'/',
      controller:'HomeCtrl',
      templateUrl:'/public/js/src/global/views/home.html',
    })
    .state('404', {
      url:'/',
      controller:'NotFoundCtrl',
      templateUrl:'/public/js/src/global/views/404.html',
    })
    .state('pre-welcome', {
      parent: 'app',
      url: '/pre-welcome',
      data: {
        roles: ['User']
      },
      views: {
        'content@': {
          // templateUrl: '/app/views/pre-welcome.html',
          template:'<div>foo</div>',
          controller: 'PreWelcomeCtrl'
        }
      }
    }).state('welcome', {
      parent: 'app',
      url: '/welcome',
      data: {
        roles: ['User']
      },
      views: {
        'content@': {
          templateUrl: '/app/views/welcome.html',
          controller: 'WelcomeCtrl'
        }
      }
    }).state('welcome-aws', {
      parent: 'app',
      url: '/welcome-aws',
      data: {
        roles: ['User']
      },
      views: {
        'content@': {
          templateUrl: '/app/views/welcome-aws.html',
          controller: 'WelcomeCtrl'
        }
      }
    }).state('welcome-scan', {
      parent: 'app',
      url: '/welcome-scan',
      data: {
        roles: ['User']
      },
      views: {
        'content@': {
          templateUrl: '/app/views/welcome-scan.html',
          controller: 'WelcomeCtrl'
        }
      }
    }).state('welcome-checks', {
      parent: 'app',
      url: '/welcome-checks',
      data: {
        roles: ['User']
      },
      views: {
        'content@': {
          templateUrl: '/app/views/welcome-checks.html',
          controller: 'CheckCtrl'
        }
      }
    })
    // .state('login', {
    //   parent: 'app',
    //   url: '/login',
    //   data: {
    //     roles: []
    //   },
    //   views: {
    //     'content@': {
    //       templateUrl: '/app/views/login.html',
    //       controller: 'LoginCtrl'
    //     }
    //   }
    // })
    .state('logout', {
      parent: 'app',
      url: '/logout',
      data: {
        roles: []
      },
      views: {
        'content@': {
          controller: 'LogoutCtrl'
        }
      }
    })
    .state('restricted', {
      parent: 'app',
      url: '/restricted',
      data: {
        roles: ['Admin']
      },
      views: {
        'content@': {
          templateUrl: 'restricted.html'
        }
      }
    })
    .state('accessdenied', {
      parent: 'app',
      url: '/403',
      data: {
        roles: []
      },
      views: {
        'content@': {
          templateUrl: '/app/views/403.html'
        }
      }
    })
  }
  angular.module('opsee').config(config);

  })();//IIFE