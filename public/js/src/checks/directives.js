(function(){

angular.module('opsee.checks.directives', []);

function checkInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/inputs.html',
    scope:{
      check:'=',
      checkStep:'=?'
    },
    controller:function($scope, $http, $filter, _, NotificationSettings, Intervals, Verbs, Protocols, StatusCodes, Relationships, AssertionTypes, AssertionTest){
      $scope.creating = !!$scope.checkStep;
      $scope.groups = [
        {
          name:'US Group 1'
        },
        {
          name:'Europe Group 2'
        },
        {
          name:'US Group 2'
        }
      ],
      $scope.protocols = Protocols;
      $scope.notificationSettings = NotificationSettings;
      $scope.intervals = Intervals;
      $scope.verbs = Verbs;
      $scope.relationships = Relationships;
      $scope.assertionTypes = AssertionTypes;

      //kick these off, 1 is required
      if($scope.creating){
        $scope.check.addItem('assertions');
        $scope.check.addItem('notifications');
      }
      StatusCodes().then(function(res){
        $scope.codes = res;
      });

      function genCheckResponse(res){
        $scope.checkResponse = res;
        $scope.checkResponse.responseHeaders = _.pairs(res.headers());
        $scope.checkResponse.dataString = typeof $scope.checkResponse.data == 'object' ? $filter('json')($scope.checkResponse.data) : $scope.checkResponse.data;
        $scope.checkResponse.language = null;
        var type = res.headers()['content-type'];
        if(type && typeof type == 'string'){
          if(type.match('css')){
            $scope.checkResponse.language = 'css';
          }else if(type.match('html')){
            $scope.checkResponse.language = 'html';
          }
        }
      }
      $http.get('/public/lib/know-your-http-well/json/status-codes.json').then(function(res){
      // $http.get('/public/js/src/user/partials/inputs.html').then(function(res){
      // $http.get('/public/css/src/style.css').then(function(res){
        genCheckResponse(res);
      }, function(res){
        genCheckResponse(res);
      })

      $scope.changeAssertionType = function(type,$index){
        $scope.check.assertions[$index].type = type;
        $scope.check.assertions[$index].value = null;
      }
      $scope.changeAssertionRelationship = function(relationship,assertion){
        assertion.relationship = relationship;
        if(relationship.name.match('Is Empty|Is Not Empty') && assertion.type && assertion.type.name != 'Header'){
         assertion.value = '';
        }
      }
      $scope.assertionPassing = function($index){
        return AssertionTest($scope.check.assertions[$index],$scope.checkResponse);
      }
      $scope.sendTestNotification = function(){
        $analytics.eventTrack('notification-test', {category:'Checks'});
        console.log($scope.check);
      }
      $scope.forward = function(num){
        //just editing, not creating
        if(!$scope.checkStep){
          return console.log('edit',$scope.check);
        }
        if(num < 4){
          //continue to next step
          $scope.checkStep = num;
        }else{
          //create this mofo
          $analytics.eventTrack('create', {category:'Checks'});
          console.log('create',$scope.check);
        }
      }
    }//end controller
  }
}
angular.module('opsee.checks.directives').directive('checkInputs', checkInputs);

function checkStep1(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/check-step-1.html',
    transclude:true
  }
}
angular.module('opsee.checks.directives').directive('checkStep1', checkStep1);

function checkStep2(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/check-step-2.html',
    transclude:true
  }
}
angular.module('opsee.checks.directives').directive('checkStep2', checkStep2);

function checkStep3(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/check-step-3.html',
    transclude:true
  }
}
angular.module('opsee.checks.directives').directive('checkStep3', checkStep3);

function checkSingleContextMenu(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/single-context-menu.html',
  }
}
angular.module('opsee.checks.directives').directive('checkSingleContextMenu', checkSingleContextMenu);

function checkItem(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/check-item.html',
    scope:{
      check:'='
    }
  }
}
angular.module('opsee.checks.directives').directive('checkItem', checkItem);

function notificationItem(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/notification-item.html',
    scope:{
      notif:'='
    },
    controller:function($scope,NotificationSettings){
      $scope.notificationSettings = new NotificationSettings();
      if($scope.notif.channel){
        $scope.notif.channel = _.findWhere($scope.notificationSettings.channels,{'type':$scope.notif.channel.type});
      }
      $scope.newChannel = function(notif,$index){
        console.log(notif,$index);
      }
    }
  }
}
angular.module('opsee.checks.directives').directive('notificationItem', notificationItem);


})();//IIFE