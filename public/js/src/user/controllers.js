(function(){

angular.module('opsee.user.controllers', ['opsee.user.services']);

// function LoginCtrl(apiEndpoint, $scope, $http, $state, principal) {
//   $scope.login = function(user) {
//     $http.post(apiEndpoint + '/authenticate/password', user)
//     .success(function(data, status, headers, config) {
//       principal.authenticate({
//         email: user.email,
//         roles: ['User']
//       });

//       if ($scope.returnToState) $state.go($scope.returnToState.name, $scope.returnToStateParams);
//       else $state.go('pre-welcome');
//     })
//     .error(function(data, status, headers, config) {
//       console.log("error");
//     });
//   };
// }
// angular.module('opsee.user.controllers').controller('LoginCtrl', LoginCtrl);

function LogoutCtrl($state, principal) {
  principal.authenticate(null);
  //delete $cookies.authToken;
  localStorage.removeItem("opsee.identity");
  $state.go('login');
}
angular.module('opsee.user.controllers').controller('LogoutCtrl', LogoutCtrl);

function LoginCtrl($scope, $rootScope, $state, User) {
  $scope.user = $rootScope.user;
}
angular.module('opsee.user.controllers').controller('LoginCtrl', LoginCtrl);

function PasswordForgotCtrl($scope, $rootScope, $state, UserService) {
  $scope.user = $rootScope.user;
  $scope.submit = function(){
    $scope.msg = null;
    UserService.forgotPassword($scope.user).then(function(res){
      $scope.msg = res.msg;
      $scope.msg = 'This endpoint does not exist yet, but this is the success message.';
    }, function(res){
      $scope.msg = res.msg || 'Dang, something went wrong.';
    })
  }
}
angular.module('opsee.user.controllers').controller('PasswordForgotCtrl', PasswordForgotCtrl);

function UserProfileCtrl($scope, $rootScope, $state, profile) {
  $scope.profile = profile;
  console.log(profile);
}
UserProfileCtrl.resolve = {
  profile:function($rootScope, $q, User){
    if($rootScope.user.hasUser()){
      return User.get({id:$rootScope.user.id}).$promise;
    }else{
      return $q.reject();
    }
  }
}
angular.module('opsee.user.controllers').controller('UserProfileCtrl', UserProfileCtrl);

function UserProfileEditCtrl($scope, $rootScope, $state, profile) {
  $scope.profile = profile;
  $scope.profile.account = {
    email:$scope.profile.email
  }
  console.log(profile);
}
angular.module('opsee.user.controllers').controller('UserProfileEditCtrl', UserProfileEditCtrl);


function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('login', {
      url:'/login',
      templateUrl:'/public/js/src/user/views/login.html',
      controller:'LoginCtrl',
      title:'Login'
    })
    .state('passwordForgot', {
      url:'/password-forgot',
      templateUrl:'/public/js/src/user/views/password-forgot.html',
      controller:'PasswordForgotCtrl',
      title:'Forgot my password'
    })
    .state('profile', {
      url:'/profile',
      templateUrl:'/public/js/src/user/views/profile.html',
      controller:'UserProfileCtrl',
      title:'Your Profile',
      resolve:UserProfileCtrl.resolve
    })
    .state('profileEdit', {
      url:'/profile/edit',
      templateUrl:'/public/js/src/user/views/profile-edit.html',
      controller:'UserProfileEditCtrl',
      title:'Edit Your Profile',
      resolve:UserProfileCtrl.resolve
    })
  }
angular.module('opsee').config(config);

})();//IIFE