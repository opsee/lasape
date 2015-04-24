(function(){

  angular.module('opsee', ['ngCookies', 'ngResource', 'ui.bootstrap', 'ngRoute', 'opsee.global', 'opsee.user', 'opsee.onboard', 'opsee.checks', 'opsee.admin', 'ngStorage', 'http-auth-interceptor', 'angulartics', 'angulartics.google.analytics', 'ngPageTitle', 'ngActivityIndicator', 'ngSanitize', 'validation.match', 'ui.router','ngMaterial','angularMoment', 'ngAnimate','hljs'])

  angular.module('opsee').config(function($analyticsProvider, $pageTitleProvider){
    $pageTitleProvider.setSuffix(' - Opsee');
  });

  angular.module('opsee').run(function ($rootScope, $window, $q, $http, $location, $timeout, Global, Regex, $localStorage, $pageTitle, $analytics, $activityIndicator, $state, User) {

    $rootScope.$on('$stateChangeStart', function (event, currentRoute, previousRoute) {
      $activityIndicator.timer = true;
      $timeout(function(){
        if($activityIndicator.timer){
          $activityIndicator.startAnimating();
        }
      },400);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, currentRoute, previousRoute) {
      $analytics.pageTrack(currentRoute.url);
      $activityIndicator.timer = false;
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
    $provide.factory('opseeInterceptor', function($q, $cookies, $injector) {
      return {
        request:function(config){
          config.headers = config.headers || {};
          if ($cookies.authToken) {
            config.headers.Authorization = $cookies.authToken;
          }
          return config;
        },
        response: function(res) {
          if([400,401,403].indexOf(res.status) >-1){
            return $q.reject(res);
          }
          return res || $q.when(res);
        },
         responseError: function(res) {
          if([500].indexOf(res.status) > -1){
          }else if([404].indexOf(res.status) > -1){
            $injector.get('$state').go('404');
          }
            return $q.reject(res);
          }
        };
      }
    )
    $httpProvider.interceptors.push('opseeInterceptor');
  }
  angular.module('opsee').config(opseeInterceptor);

})();//IIFE