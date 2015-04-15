(function(){

angular.module('opsee.checks.directives', []);

function checkInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/inputs.html',
    scope:{
      check:'='
    },
    controller:function($scope){
      $scope.groups = [
        {
          name:'foo'
        },
        {
          name:'fa'
        },
        {
          name:'fe'
        }
      ],
      $scope.types = [
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
  }
}
angular.module('opsee.checks.directives').directive('checkInputs', checkInputs);

})();//IIFE