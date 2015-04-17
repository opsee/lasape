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
      $scope.check.addItem('assertions');
      $scope.check.addItem('notifications');
      StatusCodes().then(function(res){
        $scope.codes = res;
      });

      function genCheckResponse(res){
        $scope.checkResponse = res;
        $scope.checkResponse.responseHeaders = _.pairs(res.headers());
        $scope.checkResponse.dataString = typeof $scope.checkResponse.data == 'object' ? $filter('json')($scope.checkResponse.data) : $scope.checkResponse.data;
        $scope.checkResponse.language = null;
        var type = res.headers()['content-type'];
        if(type.match('css')){
          $scope.checkResponse.language = 'css';
        }else if(type.match('html')){
          $scope.checkResponse.language = 'html';
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
        if(relationship.name.match('Is Empty|Is Not Empty') && assertion.type && assertion.type.name != 'Response Header'){
         assertion.value = '';
        }
      }
      $scope.assertionPassing = function($index){
        return AssertionTest($scope.check.assertions[$index],$scope.checkResponse);
      }
      $scope.sendTestNotification = function(){
        console.log($scope.check);
      }
      $scope.finishCreate = function(){
        console.log($scope.check);
      }
      $scope.forward = function($index){
        console.log($index);
        $scope.checkStep = $index;
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
    templateUrl:'/public/js/src/checks/partials/check-step-1.html',
    transclude:true
  }
}
angular.module('opsee.checks.directives').directive('checkStep2', checkStep2);


function radialGraph(){
  return {
    restrict:'EA',
    replace:true,
    templateUrl:'/public/js/src/checks/partials/radial-graph.html',
    scope:{
      status:'='
    },
    controller:function($scope){
      $scope.text = '';
      if ($scope.status.state == 'running') {
        $scope.text = Math.round($scope.status.health);
      }
      var percentage;
      if ($scope.status.health >= 100) {
        percentage = 99.9;
      } else if ($scope.status.health < 0) {
        percentage = 0;
      } else {
        percentage = Math.round($scope.status.health);
      }
      $scope.bool = $scope.status.health < 50 ? 'failing' : 'passing';
      $scope.width = 40;
      var α = (percentage/100)*360;
      var π = Math.PI;
      var r = ( α * π / 180 );
      var x = Math.sin( r ) * ($scope.width/2);
      var y = Math.cos( r ) * - ($scope.width/2);
      var mid = ( α > 180 ) ? 1 : 0;
      $scope.path = 'M 0 0 v -' + ($scope.width/2) + ' A ' + ($scope.width/2) + ' ' + ($scope.width/2) + ' 1 ' + mid + ' 1 ' +  x  + ' ' +  y  + ' z';
    },
    link:function($scope,$elem,$attr){
      var loader = $elem[0].querySelector('.loader');
      angular.element(loader).attr('transform','translate('+$scope.width/2+','+$scope.width/2+')').attr('d',$scope.path);
    }
  }
}
angular.module('opsee.checks.directives').directive('radialGraph', radialGraph);

})();//IIFE