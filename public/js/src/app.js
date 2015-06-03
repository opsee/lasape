(function(){

  angular.module('opsee', ['ngCookies', 'ngResource', 'ngStorage', 'ngTouch', 'ui.bootstrap', 'ngRoute', 'ngStorage', 'http-auth-interceptor', 'angulartics', 'angulartics.google.analytics', 'ngActivityIndicator', 'ngSanitize', 'validation.match', 'ui.router', 'swagger-client', 'ngMessages', 'ngWebSocket', 'angularMoment', 'ngAnimate','hljs', 'visibilityChange', 'notification', 'ui.gravatar', 'opsee.global', 'opsee.user', 'opsee.onboard', 'opsee.checks', 'opsee.admin', 'opsee.integrations', 'opsee.aws', 'opsee.docs'])

  angular.module('opsee').run(function ($rootScope, $window, $q, $http, $templateCache, $location, $timeout, $document, $localStorage, $analytics, $activityIndicator, $state, Global, Regex, authService, User, ENDPOINTS, VisibilityChange, swaggerClient) {

    console.log($window.swaggerSchema);
    var api = swaggerClient($window.swaggerSchema);
    console.dir(api);

    $window.FastClick.attach(document.body);

    $http.get('/public/js/src/global/partials/error-messages.html').then(function(res){
      $templateCache.put('error-messages', res.data);
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, fromState, fromParams) {
      if(toState.name != ('login')){
        $rootScope.previousRoute = toState.name;
      }
      $rootScope.hideHeader = !!(toState.hideHeader);
      $activityIndicator.timer = true;
      $timeout(function(){
        if($activityIndicator.timer){
          $activityIndicator.startAnimating();
        }
      },400);
    });

    VisibilityChange.onChange(function(visible){
      $analytics.eventTrack('visibility-change', {category:'Global',label:visible ? 'visible' : 'hidden'});
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, fromState, fromParams) {
      $analytics.pageTrack(toState.url);
      $activityIndicator.timer = false;
      $activityIndicator.stopAnimating();
    });

    $rootScope.$on('$stateChangeError', function (event, toState, fromState, fromParams) {
      $activityIndicator.timer = false;
      $activityIndicator.stopAnimating();
      $state.go('404');
    });

    $rootScope.localStorage = $localStorage;
    $rootScope.global = Global;
    $rootScope.regex = Regex;
    $rootScope.pageInfo = {
      title: function(){
        if(!$state.current.title){
          return 'Opsee';
        }
        return $state.current.title == 'Opsee' ? 'Opsee' : $state.current.title + ' - Opsee'
      }
    }

    if($localStorage.user){
      try{
        $rootScope.user = new User(JSON.parse($localStorage.user)).setDefaults();
      }catch(err){
        $rootScope.user = new User().setDefaults();
      }
    }else{
      $rootScope.user = new User().setDefaults();
    }

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

    $rootScope.$on('notify', function(event,msg){
      $analytics.eventTrack('notify', {category:'Global',label:msg});
      Global.notify(msg);
    });

    $rootScope.$on('setAuth', function(event,token){
      $localStorage.authToken = token || null;
      // authService.loginConfirmed();
      if($rootScope.previousRoute){
        $state.go($rootScope.previousRoute);
      }else{
        $state.go('home.instances');
      }
    });

    $rootScope.$on('setUser', function(event,user){
      $localStorage.user = angular.toJson(user);
      $rootScope.user = new User(user).setDefaults();
      $rootScope.$broadcast('setAuth',user.token);
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
  angular.module('opsee').config(function($locationProvider, $tooltipProvider, $activityIndicatorProvider, $notificationProvider){
    $locationProvider.html5Mode({
      enabled:true,
      requireBase:false
    });
    $tooltipProvider.options({
      placement:'left'
    });
    $activityIndicatorProvider.setActivityIndicatorStyle('DottedWhite');
    $notificationProvider.setOptions({icon: '/public/img/apple-touch-icon-144x144.png'});
  });

  function opseeInterceptor($routeProvider, $locationProvider, $httpProvider, $provide, $stateProvider) {
    $provide.factory('opseeInterceptor', function($q, $localStorage, $injector) {
      return {
        request:function(config){
          config.headers = config.headers || {};
          //slack rejects us if we have extraneous headers, sigh.
          if ($localStorage.authToken && !config.url.match('slack.com')) {
            config.headers.Authorization = $localStorage.authToken;
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