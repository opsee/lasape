(function(){

angular.module('opsee.global.services', []);

function Global($rootScope, $log, $q, $modal, $document, $compile, _) {
  return {
    confirm:function(msg,noConfirm){
      if(noConfirm){
        var deferred = $q.defer();
        deferred.resolve()
        return deferred.promise;
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

function ENDPOINTS(){
  var api = window.api_host || 'http://api-beta.opsee.co';
  return {
    api:api,
    user:api+'/logins/:id',
    vpcScan:api+'/scan-vpcs'
  }
}
angular.module('opsee.global.services').constant('ENDPOINTS', ENDPOINTS());

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
        name:'Email',
        title:'user@domain.com',
        placeholder:'user@domain.com'
      },
      {
        name:'Web'
      },
      {
        name:'Webhook',
        title:'An api service to post to',
        placeholder:'http://service.com'
      },
      {
        name:'Slack',
        title:'Slack channel',
        placeholder:'channel@slack'
      }
    ]
  }
}
angular.module('opsee.global.services').service('NotificationSettings', NotificationSettings);

function PreloadImg($q){
  return function(path){
    var deferred = $q.defer();
    var newImg = new Image();
    newImg.onload = function(){
      deferred.resolve(path);
    }
    newImg.onerror = function(){
      deferred.reject(path);
    }
    newImg.src = path;
    return deferred.promise;
  }
}
angular.module('opsee.global.services').service('PreloadImg', PreloadImg);

})();//IIFE