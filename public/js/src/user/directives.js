(function(){

angular.module('opsee.user.directives', []);

function userInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/user/partials/inputs.html',
    scope:{
      user:'=',
      login:'='
    }
  }
}
angular.module('opsee.user.directives').directive('userInputs', userInputs);

function userLogin(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/user/partials/user-login.html',
    controller:function($scope,$cookies,UserService){
      $scope.submit = function(){
        if($scope.user && $scope.user.account.password){
          UserService.login($scope.user).then(function(res){
            if(res.token){
              $cookies.authToken = res.token;
            }
          }, function(err){
            console.log(err);
          })
        }
      }
    }
  }
}
angular.module('opsee.user.directives').directive('userLogin', userLogin);


})();//IIFE