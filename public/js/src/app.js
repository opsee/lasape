(function(){

  angular.module('opsee', ['ngCookies', 'ngResource', 'ui.bootstrap', 'ngRoute', 'opsee.global', 'opsee.user', 'opsee.onboard', 'opsee.checks', 'opsee.admin', 'ngStorage', 'http-auth-interceptor', 'angulartics', 'angulartics.google.analytics', 'ngPageTitle', 'ngActivityIndicator', 'ngSanitize', 'validation.match', 'ui.router','ngMaterial','angularMoment', 'ngAnimate','hljs'])

  angular.module('opsee').config(function($analyticsProvider, $pageTitleProvider){
    $pageTitleProvider.setSuffix(' - Opsee');
  });

  angular.module('opsee').run(function ($rootScope, $window, $q, $http, $location, $cookies, $timeout, Global, Regex, $localStorage, $pageTitle, $analytics, $activityIndicator, $state, authService, User) {

    $rootScope.$on('$stateChangeStart', function (event, toState, fromState, fromParams) {
      if(toState.name != ('login')){
        $rootScope.previousRoute = toState.name;
      }
      $activityIndicator.timer = true;
      $timeout(function(){
        if($activityIndicator.timer){
          $activityIndicator.startAnimating();
        }
      },400);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, fromState, fromParams) {
      $analytics.pageTrack(toState.name);
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

    $window.addEventListener('popstate', function(event){
      event.stopPropagation();
      event.preventDefault();
      $rootScope.$broadcast('popstate',event);
    });

    $rootScope.$on('popstate', function(e,data){
      $rootScope.popstate = true;
      $timeout(function(){
        $rootScope.popstate = false;
      },500);
    })

    $rootScope.$state = $state;

    $pageTitle.set();

    $rootScope.$on('notify', function(event,msg){
      Global.notify(msg);
    });

    $rootScope.$on('setAuth', function(event,token){
      $cookies.authToken = token || null;
      // authService.loginConfirmed();
      if($rootScope.previousRoute){
        $state.go($rootScope.previousRoute);
      }
    });

    $rootScope.$on('setUser', function(event,user){
      $cookies.user = user;
    })

    $rootScope.$on('event:auth-loginRequired', function(){
      $rootScope.user.awaitingLogin = true;
      $location.path('/login');
    })

    $rootScope.$on('event:auth-forbidden', function(){
      alert('You do not have permission for that action. Contact the administrator for access.');
    });

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