(function(){

angular.module('opsee.global.services', []);

function Global($rootScope, $log, $q, $modal, $document, $compile, _) {
  return {
    confirm:function(msg,noConfirm){
      if(noConfirm){
        return $q.resolve();
      }
      if(!msg){
        $log.warn('No msg');
        return $q.reject('No msg');
      }
      var modalInstance = $modal.open({
        templateUrl:'/public/js/src/global/partials/confirm.html',
        size:'sm',
        resolve:{
          msg:function(){return msg;}
        },
        controller:function($scope, $modalInstance, msg){
          $scope.msg = msg;
          $scope.ok = function(){
            $modalInstance.close();
          }
          $scope.cancel = function(){
            $modalInstance.dismiss('cancel');
          }
        }
      });
      return modalInstance.result;
    },
    notify:function(msg){
      if(!msg){
        $log.warn('No msg');
        return $q.reject('No msg');
      }
      var modalInstance = $modal.open({
        templateUrl:'/public/js/src/global/partials/notify.html',
        size:'notify',
        // backdrop:false,
        backdropClass:'notify',
        resolve:{
          msg:function(){return msg;}
        },
        controller:function($scope, $modalInstance, $timeout, msg){
          $scope.msg = msg;
          $timeout($modalInstance.close, 5000);
          // $scope.ok = function(){
          //   $modalInstance.close();
          // }
        }
      });
      return modalInstance.result;
    },//notify
    contextMenu:function(parentItem,templateUrl){
      if(!parentItem){
        $log.warn('No parent item');
        return $q.reject('No parent item');
      }
      var modalInstance = $modal.open({
        templateUrl:templateUrl,
        size:'context',
        backdropClass:'notify',
        resolve:{
          parentItem:function(){return parentItem;}
        },
        controller:function($scope, $modalInstance, $timeout, parentItem){
          $scope.item = parentItem;
          $scope.close = function(){
            $modalInstance.close();
          }
          $scope.item.hasChildrenActive = function(){
            return _.findWhere($scope.item.actions,{childrenActive:true});
          }
          $scope.run = function(action,identity){
            var promise = action.run.call(identity || action);
            if(typeof promise == 'object'){
              promise.then($scope.close,$scope.close);
            }
          }
        }
      });
      return modalInstance.result;
    },//notify
    // contextMenu:function(item,directive){
    //   var $injector = angular.injector(['ng','opsee']);
    //   $injector.invoke(function($compile){
    //     var dir = angular.element($document[0].createElement(directive));
    //     var el = $compile(dir)(item);
    //     angular.element($document[0].querySelector('#context-menu')).empty().append(el);
    //   })
    //   // $rootScope.contextMenu = $parent.contextMenu();
    // }
  }
};

angular.module('opsee.global.services').service('Global',Global);

//lodash/underscore
function _($window){
  return $window._;
}
angular.module('opsee.global.services').service('_',_);

//momentjs
function moment($window){
  return $window.moment;
}
angular.module('opsee.global.services').service('moment',moment);

function regex(){
  return{
    float:/^[-+]?[0-9]*\.?[0-9]+$/,
    integer:/^\d+$/,
    commaNumber:/[1-9](?:\d{0,2})(?:,\d{3})*(?:\.\d*[1-9])?|0?\.\d*[1-9]|0/,
    email:/^\S+@\S+\.\S+$/,
    general:/.*/,
    subdomain:/^[a-z]+[a-z\d-]+$/
  }
}
angular.module('opsee.global.services').service('Regex', regex);

var KEYS = {
}
angular.module('opsee.global.services').constant('KEYS', KEYS);

var api = 'http://api-beta.opsee.co';
var ENDPOINTS = {
  api:api,
  user:api+'/logins/:id'
}
angular.module('opsee.global.services').constant('ENDPOINTS', ENDPOINTS);

'use strict';

/* Services */
var domain = 'http://api-beta.opsee.co';
var opseeServices = angular.module('opseeServices', ['ngResource', 'ngCookies']);

opseeServices.factory('Login', function() {
    var login = {};

    return {
      setLogin: function(l) {
        login = l;
      },
      getLogin: function() {
        return login;
      }
    };
  });

function Credentials(ENDPOINTS, $resource) {
  return $resource(ENDPOINTS.api + '/environments/:envId/credentials');
};
angular.module('opsee.global.services').factory('Credentials', Credentials)

function Environments(ENDPOINTS, $resource) {
  return $resource(ENDPOINTS.api + '/environments/:envId', {}, {
    'update': {method: "PUT"},
    'query': {method: "GET", isArray:true}
  });
}
angular.module('opsee.global.services').factory('Environments', Environments)

function Discovery(ENDPOINTS, $resource) {
  return $resource(ENDPOINTS.api + '/discovery', {}, {
    'update': {method: "PUT"},
    'query': {method: "GET"}
  });
}
angular.module('opsee.global.services').factory('Discovery', Discovery)


function Bastion(wsHost, wsPort, $q, $rootScope) {
  var Service = {};

  var callbacks = {};

  var currentCallbackId = 0;

  var connWs, disconnWs, discoveryWs;

  Service.onConnected = function(event) {}
  Service.onDisconnected = function(event) {}
  Service.onDiscovery = function(event) {}
  Service.onDiscoveryEnd = function(event) {}

  Service.connect = function() {
    var url = "ws://" + wsHost + ":" + wsPort + "/pubsub/";
    connWs = new WebSocket(url + "connect?query=true");
    disconnWs = new WebSocket(url + "disconnect?query=true");
    discoveryWs = new WebSocket(url + "discovery?query=true");

    // connWs.onopen = function() {
    //  console.log("connect ws has been opened")
    // }

    connWs.onmessage = function(message) {
      Service.onConnected(JSON.parse(message.data));
    }

    connWs.onerror = function(evt) {console.log(evt);}

    // disconnWs.onopen = function() {
    //  console.log("disconnect ws has been opened")
    // }

    disconnWs.onmessage = function(message) {
      Service.onDisconnected(JSON.parse(message.data));
    }

    // discoveryWs.onopen = function() {
    //  console.log("discovery ws has been opened")
    // }

    discoveryWs.onmessage = function(message) {
      var msg = JSON.parse(message.data);
      if (msg.state == 'end') {
        Service.onDiscoveryEnd(msg);
      } else {
        Service.onDiscovery(msg);
      }
    }
  }

  return Service;
}
angular.module('opsee.global.services').factory('Bastion', Bastion)

// authorization service's purpose is to wrap up authorize functionality
// it basically just checks to see if the Principal is authenticated and checks the root state
// to see if there is a state that needs to be authorized. if so, it does a role check.
// this is used by the state resolver to make sure when you refresh, hard navigate, or drop onto a
// route, the app resolves your identity before it does an authorize check. after that,
// authorize is called from $stateChangeStart to make sure the Principal is allowed to change to
// the desired state
function Authorization($rootScope, $state, Principal) {
  return {
    authorize: function() {
      return Principal.identity()
        .then(function() {
          var isAuthenticated = Principal.isAuthenticated();

          if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 && !Principal.isInAnyRole($rootScope.toState.data.roles)) {
            if (isAuthenticated) $state.go('accessdenied'); // user is signed in but not authorized for desired state
            else {
              // user is not authenticated. stow the state they wanted before you
              // send them to the signin state, so you can return them when you're done
              $rootScope.returnToState = $rootScope.toState;
              $rootScope.returnToStateParams = $rootScope.toStateParams;

              // now, send them to the signin state so they can log in
              $state.go('login');
            }
          }
        });
    }
  };
}

angular.module('opsee.global.services').factory('Authorization', Authorization);

// Principal is a service that tracks the user's identity.
// calling identity() returns a promise while it does what you need it to do
// to look up the signed-in user's identity info. for example, it could make an
// HTTP request to a rest endpoint which returns the user's name, roles, etc.
// after validating an auth token in a cookie. it will only do this identity lookup
// once, when the application first runs. you can force re-request it by calling identity(true)
function Principal($q, $http, $timeout) {
  var _identity = undefined;
  var _authenticated = false;

  return {
    isIdentityResolved: function() {
      return angular.isDefined(_identity);
    },
    isAuthenticated: function() {
      return _authenticated;
    },
    isInRole: function(role) {
      if (!_authenticated || !_identity.roles) return false;

      return _identity.roles.indexOf(role) != -1;
    },
    isInAnyRole: function(roles) {
      if (!_authenticated || !_identity.roles) return false;

      for (var i = 0; i < roles.length; i++) {
        if (this.isInRole(roles[i])) return true;
      }

      return false;
    },
    authenticate: function(identity) {
      _identity = identity;
      _authenticated = identity != null;

      if (identity) {
        localStorage.setItem("opsee.identity", angular.toJson(identity));
      }
      else {
        localStorage.removeItem("opsee.identity");
      }
    },
    identity: function(force) {
      var deferred = $q.defer();

      if (force === true) _identity = undefined;

      // check and see if we have retrieved the identity data from the server. if we have, reuse it by immediately resolving
      if (angular.isDefined(_identity)) {
        deferred.resolve(_identity);
        return deferred.promise;
      }

      // otherwise, retrieve the identity data from the server, update the identity object, and then resolve.
      //                   $http.get('/svc/account/identity', { ignoreErrors: true })
      //                        .success(function(data) {
      //                            _identity = data;
      //                            _authenticated = true;
      //                            deferred.resolve(_identity);
      //                        })
      //                        .error(function () {
      //                            _identity = null;
      //                            _authenticated = false;
      //                            deferred.resolve(_identity);
      //                        });

      // for the sake of the demo, we'll attempt to read the identity from localStorage. the example above might be a way if you use cookies or need to retrieve the latest identity from an api
      // i put it in a timeout to illustrate deferred resolution
      var self = this;

      _identity = angular.fromJson(localStorage.getItem("opsee.identity"));
      self.authenticate(_identity);
      deferred.resolve(_identity);

      return deferred.promise;
    }
  };
}
angular.module('opsee.global.services').service('Principal', Principal);

function Intervals(){
  return[
    {
      name:'5min'
    },
    {
      name:'15min'
    },
    {
      name:'24hr'
    },
    {
      name:'7d'
    }
  ]
}
angular.module('opsee.global.services').service('Intervals', Intervals);

function NotificationSettings(){
  return{
    types:[
      {
        name:'Email'
      },
      {
        name:'Webhook'
      },
      {
        name:'Slack'
      }
    ]
  }
}
angular.module('opsee.global.services').service('NotificationSettings', NotificationSettings);

function Verbs(){
  return[
    {
      name:'GET'
    },
    {
      name:'POST'
    },
    {
      name:'PUT'
    },
    {
      name:'DELETE'
    },
    {
      name:'PATCH'
    }
  ]
}
angular.module('opsee.global.services').service('Verbs', Verbs);


function Protocols(){
  return[
    {
      name:'HTTP'
    },
    {
      name:'MySQL'
    },
    {
      name:'Other'
    }
  ]
}
angular.module('opsee.global.services').service('Protocols', Protocols);

function StatusCodes($q, $http, _){
  return function(){
    var deferred = $q.defer();
    $http.get('/public/lib/know-your-http-well/json/status-codes.json').then(function(res){
      var array = _.chain(res.data).reject(function(n){
        return n.phrase.match(/\*\*/);
      }).sortBy(function(n){
        return n.code;
      }).value();
      deferred.resolve(array);
    }, function(res){
      deferred.reject(res);
    });
    return deferred.promise;
  }
}
angular.module('opsee.global.services').service('StatusCodes', StatusCodes);

function Relationships(){
  return[
    {
      name:'Equal To'
    },
    {
      name:'Not Equal To'
    },
    {
      name:'Is Empty'
    },
    {
      name:'Is Not Empty'
    },
    // {
    //   name:'Greater Than'
    // },
    // {
    //   name:'Less Than'
    // },
    {
      name:'Contains'
    },
    {
      name:'RegExp'
    }
  ]
}
angular.module('opsee.global.services').service('Relationships', Relationships);

function AssertionTypes(){
  return[
    {
      name:'Status Code'
    },
    {
      name:'Header'
    },
    {
      name:'Response Body'
    },
  ]
}
angular.module('opsee.global.services').service('AssertionTypes', AssertionTypes);

})();//IIFE