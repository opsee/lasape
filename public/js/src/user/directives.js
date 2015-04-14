(function(){

angular.module('opsee.user.directives', []);

function userInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/user/partials/user-inputs.html',
    scope:{
      user:'='
    },
    controller:function($scope){
    }
  }
}
angular.module('opsee.user.directives').directive('userInputs', userInputs);


})();//IIFE