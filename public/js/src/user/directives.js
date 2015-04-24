(function(){

angular.module('opsee.user.directives', []);

function userInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/user/partials/inputs.html',
    transclude: true,
    scope:{
      user:'=',
      login:'='
    },
    controller:function($scope,$rootScope){
      $scope.regex = $rootScope.regex;
    }
  }
}
angular.module('opsee.user.directives').directive('userInputs', userInputs);

function userLogin(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/user/partials/user-login.html',
    controller:function($scope,$rootScope,UserService){
      $scope.options = {
        original:'Create Account',
        inProgress:'Creating your account...',
        error:'Create Account'
      }
      $scope.state = $scope.options.original;
      $scope.submit = function(){
        if($scope.user && $scope.user.account.password){
          UserService.login($scope.user).then(function(res){
            if(res.token){
              $rootScope.$emit('setAuth',res.token);
            }
            $scope.state = res.statusText || $scope.options.success;
            $rootScope.$emit('notify','Login Succeeded.');
          }, function(err){
            console.log(err);
            $scope.error = res.data.error || 'There was an error processing your request.';
            $scope.state = $scope.options.error;
            $rootScope.$emit('notify',$scope.error);
          })
        }
      }
    }
  }
}
angular.module('opsee.user.directives').directive('userLogin', userLogin);


})();//IIFE