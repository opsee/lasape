(function(){

  angular.module('opsee', ['ngCookies', 'ngResource', 'ui.bootstrap', 'ngRoute', 'opsee.global', 'opsee.user', 'opsee.onboard', 'opsee.checks', 'ngStorage', 'http-auth-interceptor', 'angulartics', 'angulartics.google.analytics', 'ngPageTitle', 'ngActivityIndicator', 'ngSanitize', 'validation.match', 'ui.router','ngMaterial','angularMoment'])

  angular.module('opsee').config(function($analyticsProvider, $pageTitleProvider){
    $pageTitleProvider.setSuffix(' - Opsee');
  });

  angular.module('opsee').run(function ($rootScope, $window, $q, $http, $location, Global, Regex, $localStorage, $pageTitle, $analytics, $activityIndicator, $state, User) {

    $rootScope.$on('$routeChangeStart', function (event, currentRoute, previousRoute) {
      $activityIndicator.startAnimating();
    });

    $rootScope.$on('$routeChangeSuccess', function (event, currentRoute, previousRoute) {
      $analytics.pageTrack($location.path());
      $activityIndicator.stopAnimating();
    });

    $rootScope.localStorage = $localStorage;
    $rootScope.global = Global;
    $rootScope.regex = Regex;

    $rootScope.user = new User().setDefaults();

    // User.get().$promise.then(function(res){
    //   if(res.user){
    //     $rootScope.user = new User(res.user);
    //     $rootScope.user.setDefaults();
    //   }
    // });

    $rootScope.$state = $state;

    $pageTitle.set();

     $rootScope.$on('event:auth-loginRequired', function(){
      $rootScope.user.awaitingLogin = true;
      $location.path('/login');
     })

     $rootScope.$on('event:auth-forbidden', function(){
      alert('You do not have permission for that action. Contact the administrator for access.');
     })


// opseeServices.factory('AuthInterceptor', ['$q', '$cookies',
//   function($q, $cookies) {
//     return {
//       request: function(config) {
//         config.headers = config.headers || {};
//         if ($cookies.authToken) {
//           config.headers.Authorization = 'HMAC ' + $cookies.authToken;
//         }
//         return config;
//       },
//       responseError: function(rejection) {
//         if (rejection != null && rejection.status === 401) {
//           //delete $cookies.authToken;
//         }
//         return $q.reject(rejection);
//       }
//     };
//   }]);

  });

  // Setting HTML5 Location Mode
  angular.module('opsee').config(function($locationProvider,$mdThemingProvider) {
      $locationProvider.html5Mode({
        enabled:true,
        requireBase:false
      });
      $mdThemingProvider.theme('docs-dark', 'default')
        .primaryPalette('yellow')
        .dark();
  });

  function opseeInterceptor($routeProvider, $locationProvider, $httpProvider, $provide, $stateProvider) {
    $provide.factory('myHttpInterceptor', function($q, $state, $cookies) {
      return {
        request:function(config){
          config.headers = config.headers || {};
          if ($cookies.authToken) {
            config.headers.Authorization = 'HMAC ' + $cookies.authToken;
          }
          return config;
        },
        response: function(res) {
          if(res.status.match('400|401|403')){
            return $q.reject(res);
          }
          return res || $q.when(res);
        },

       responseError: function(res) {
          if(res.status.match('500')){
          }else if(res.status.match('404')){
            $stateProvider.go('404');
          }
            return $q.reject(res);
          }
        };
      }
    )
  }
  angular.module('opsee').config(opseeInterceptor);

})();//IIFE