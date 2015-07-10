(() => {

angular.module('opsee.user.directives', []);

function userInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/user/partials/inputs.html',
    transclude: true,
    require: '^form',
    scope:{
      user:'=?',
      include:'@?'
    },
    controller:function($scope, $rootScope){
      $scope.user = $scope.user || $rootScope.user;
      $scope.regex = $rootScope.regex;
      $scope.include = $scope.include ? $scope.include.split(',') : null;
      $scope.display = function(string){
        return $scope.include ? $scope.include.indexOf(string) > -1 : true;
      }
    },
    link:function($scope, $element, $attrs, $formCtrl){
      $scope.form = $formCtrl;
    }
  }
}
angular.module('opsee.user.directives').directive('userInputs', userInputs);

function userLogin(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/user/partials/user-login.html',
    controller:function($scope, $rootScope, $state, $activityIndicator, UserService, authService){
      $scope.options = {
        original:'Create Account',
        inProgress:'Creating your account...',
        error:'Create Account'
      }
      $scope.state = $scope.options.original;
      $scope.submitting = false;
      $scope.submit = function(){
        if($scope.user && $scope.user.account.password){
          $activityIndicator.startAnimating();
          $scope.submitting = true;
          UserService.login($scope.user).then(function(res){
            $rootScope.$emit('setUser',res);
            $activityIndicator.stopAnimating();
            $scope.submitting = false;
          }, function(res){
            console.log(res);
            $activityIndicator.stopAnimating();
            $scope.submitting = false;
            try{
              $scope.error = res.data.error;
            }catch(err){
              $scope.error = 'There was an error processing your request.';
            }
            $scope.state = $scope.options.error;
            $rootScope.$emit('notify',$scope.error);
          })
        }
      }
    }
  }
}
angular.module('opsee.user.directives').directive('userLogin', userLogin);

function profileImg(){
  return {
    restrict:'EA',
    template:'<div ng-if="user.bio.img"><img title="Image from {{user.bio.imgService}}" src="{{user.bio.img}}"></div>'
  }
}
angular.module('opsee.user.directives').directive('profileImg', profileImg);


})();//IIFE