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

function api($rootScope, opseeAPI){
  if(!$rootScope.api){
   $rootScope.api = new opseeAPI({domain:'http://api-beta.opsee.co'}); 
  }
  return $rootScope.api;
}
angular.module('opsee.global.services').service('api',api);

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
  return function(){
    return {
      channels:[
        {
          name:'Email',
          type:'email',
          title:'user@domain.com',
          placeholder:'user@domain.com'
        },
        {
          name:'Desktop',
          type:'desktop',
          options:{
            push:false
          },
          optionsMeta:{
            push:{
              name:'Push (Chrome Only)',
            }
          }
        },
        {
          name:'Webhook',
          type:'webhook',
          title:'An api service to post to',
          placeholder:'http://service.com'
        },
        {
          name:'Slack',
          type:'slack',
          title:'Slack channel',
          placeholder:'#notifications'
        }
      ]
    }
  }
}
angular.module('opsee.global.services').factory('NotificationSettings', NotificationSettings);

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

function $history($state, $rootScope, $window) {
  var history = [];
  angular.extend(this, {
    push: function(state, params) {
      history.push({ state: state, params: params });
    },
    all: function() {
      return history;
    },
    go: function(step) {
      var prev = this.previous(step || -1);
      return $state.go(prev.state, prev.params);
    },
    previous: function(step) {
      return history[history.length - Math.abs(step || 1)];
    },
    back: function() {
      return this.go(-1);
    }
  });
}
angular.module('opsee.global.services').service('$history', $history);

})();//IIFE