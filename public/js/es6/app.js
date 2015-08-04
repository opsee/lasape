(() => {

  angular.module('opsee', ['ngCookies', 'ngResource', 'ngStorage', 'ngTouch', 'ui.bootstrap', 'ngRoute', 'ngStorage', 'http-auth-interceptor', 'angulartics', 'angulartics.google.analytics', 'ngActivityIndicator', 'ngSanitize', 'validation.match', 'ui.router', 'ngMessages', 'ngWebSocket', 'angularMoment', 'ngAnimate','hljs', 'visibilityChange', 'notification', 'ui.gravatar', 'opsee.global', 'opsee.api', 'opsee.user', 'opsee.onboard', 'opsee.checks', 'opsee.admin', 'opsee.integrations', 'opsee.aws', 'opsee.docs'])

  angular.module('opsee').run(function ($rootScope, $window, $q, $http, $templateCache, $location, $timeout, $document, $localStorage, $analytics, $websocket, $activityIndicator, $state, Global, Regex, authService, User, ENDPOINTS, VisibilityChange, opseeAPI) {

    $window.FastClick.attach(document.body);

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams , error) {
      if(!toState.name.match('login|start')){
        $rootScope.previousRoute = toState.name;
      }
      $rootScope.hideHeader = !!(toState.hideHeader);
      $activityIndicator.timer = true;
      $timeout(() => {
        if($activityIndicator.timer){
          $activityIndicator.startAnimating();
        }
      },400);
    });

    VisibilityChange.onChange(visible => {
      $analytics.eventTrack('visibility-change', {category:'Global',label:visible ? 'visible' : 'hidden'});
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, fromState, fromParams) {
      $analytics.pageTrack(toState.url);
      $activityIndicator.timer = false;
      $activityIndicator.stopAnimating();
      // $timeout(() => {$window.document.querySelector('body').scrollTop = 0},410);
    });

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams , error) {
      $activityIndicator.timer = false;
      $activityIndicator.stopAnimating();
      if(error && error.status == 401){
        event.preventDefault();
        return $state.go('login');
      }
      console.log('stateError',error);
      return $state.go('404');
    });

    $rootScope.localStorage = $localStorage;
    $rootScope.global = Global;
    $rootScope.regex = Regex;
    $rootScope.opseeNotifs = [];
    $rootScope.pageInfo = {
      title: function(){
        let string = null;
        if(!$state.current.title){
          string = 'Opsee';
        }else{
          string = $state.current.title + ' - Opsee';
        }
        let notifsString = $rootScope.opseeNotifs.length ? `[${$rootScope.opseeNotifs.length}] ` : ' ';
        return $rootScope.opseeNotifs.length ? `${notifsString}${string}` : string;
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

    $rootScope.$state = $state;

    $rootScope.$on('notify', function(event,msg){
      $analytics.eventTrack('notify', {category:'Global',label:msg});
      Global.notify(msg);
    });

    $rootScope.$on('startSocket', function(event,token){
      $rootScope.stream = $websocket('ws://api-beta.opsee.co/stream/');
      $rootScope.stream.onOpen(() => {
        const auth = JSON.stringify({
          command:'authenticate',
          attributes:{
            hmac:$rootScope.user.token.replace('HMAC ','')
          }
        });
        $rootScope.stream.send(auth);
      });
      $rootScope.stream.onMessage(event => {
        let data;
        try{
          data = JSON.parse(event.data)
        }catch(err){
          console.log(err);
          return false;
        }
        if(!data){
          return false;
        }
        switch(data.command){
          case 'authenticate':
          if(data.state == 'ok'){
            const subscribe = JSON.stringify({
              "command":"subscribe",
              "attributes":{"subscribe_to": "launch-bastion"}
            });
            $rootScope.stream.send(subscribe);
          }else{
            $analytics.eventTrack('error',{category:'Websocket',label:'Auth failed'});
          }
          break;
          case 'heartbeat':
          break;
          default:
          !$rootScope.stream.messages ? $rootScope.stream.messages = [] : null;
          $rootScope.stream.messages.push(data);
          break;
        }
      });
      $rootScope.stream.onClose(evt => {
        console.log('socket close',evt);
        //reopen stream
        if(!$rootScope.stream.error && !evt.reason){
          $rootScope.$broadcast('startSocket');
        }
      });
      $rootScope.stream.onError(evt => {
        $rootScope.stream.error = true;
        console.log('socket error',evt);
      })
    });

    if($rootScope.user.token){
      $rootScope.$broadcast('startSocket');
    }

    $rootScope.$on('setAuth', (event,token) =>{
      if(token){
        if(!token.match('HMAC ')){
          token = 'HMAC '+token;
        }
        $localStorage.authToken = token
      }
      // authService.loginConfirmed();
      if($rootScope.previousRoute){
        $state.go($rootScope.previousRoute);
      }else{
        $state.go('home.instances');
      }
      $rootScope.$broadcast('startSocket');
    });

    $rootScope.$on('setUser', (event,user) => {
      $localStorage.user = angular.toJson(user);
      $rootScope.user = new User(user).setDefaults();
      $rootScope.$broadcast('setAuth',user.token);
    })

    $rootScope.$on('event:auth-loginRequired', () => {
      $rootScope.user.awaitingLogin = true;
      $location.path('/login');
    })

    $rootScope.$on('event:auth-forbidden', () => {
      alert('You do not have permission for that action. Contact the administrator for access.');
    });

  });//end of app.run

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
        request:config => {
          config.headers = config.headers || {};
          //slack rejects us if we have extraneous headers, sigh.
          if ($localStorage.authToken && !config.url.match('slack.com')) {
            config.headers.Authorization = $localStorage.authToken;
          }
          return config;
        },
        response: res => {
          if([400,401,403].indexOf(res.status) >-1){
            return $q.reject(res);
          }
          return res || $q.when(res);
        },
         responseError: res => {
          if([0].indexOf(res.status) > -1){
            $injector.get('$state').go('500',{res:JSON.stringify(res)});
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