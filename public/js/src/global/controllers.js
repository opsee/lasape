(function(){

angular.module('opsee.global.controllers', ['opsee.global.services']); 

function headerController($scope, Global, $location, $rootScope) {
  // $scope.user = $rootScope.user;
  $scope.navbarEntries = [
    {
      title:'Checks',
      sref:'checks',
      icon:null,
      children:[]
    },
    {
      title:'Signups',
      sref:'signups',
      icon:null,
      children:[]
    },
    {
      title:'Login',
      sref:'login',
      icon:null,
      children:[]
    },
    {
      title:'Onboarding',
      sref:'onboard.start',
      icon:null,
      children:[]
    },
    {
      title:'Tutorial',
      sref:'onboard.tutorial',
      icon:null,
      children:[]
    },
    {
      title:'Password',
      sref:'onboard.password',
      icon:null,
      children:[]
    },
  ];
  $scope.isActive = function ($index) {
    if($scope.navbarEntries[$index].link == $location.path()){
      return true;
    }
    var c = _.pluck($scope.navbarEntries[$index].children,'link');
    return c.indexOf($location.path()) > -1
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

function HomeController($scope, $rootScope, _, $state){
  // if(!$rootScope.user.account.email){
  //   $state.go('onboard');
  // }
}
angular.module('opsee.global.controllers').controller('HomeController',HomeController);

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
      controller:'HomeController',
      templateUrl:'/public/js/src/global/views/home.html',
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
    }).state('restricted', {
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
    }).state('accessdenied', {
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