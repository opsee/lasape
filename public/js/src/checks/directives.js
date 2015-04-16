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
    controller:function($scope, NotificationSettings, Intervals, Verbs, Protocols, StatusCodes, Relationships, AssertionTypes){
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
      $scope.changeAssertionType = function(type,$index){
        $scope.check.assertions[$index].type = type;
        $scope.check.assertions[$index].value = null;
      }
      $scope.sendTestNotification = function(){
        console.log($scope.check);
      }
      $scope.finishCreate = function(){
        console.log($scope.check);
      }
    }//end controller
  }
}
angular.module('opsee.checks.directives').directive('checkInputs', checkInputs);

})();//IIFE