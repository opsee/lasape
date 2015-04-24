(function(){

angular.module('opsee.user.controllers', []);

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

function LoginCtrl($scope, $http, $state) {
  $scope.user = {
    account:{
      email:null,
      password:null
    },
    bio:{
      name:null
    }
  }
}
angular.module('opsee.user.controllers').controller('LoginCtrl', LoginCtrl);

function UserPasswordCtrl($scope,$state,$rootScope,$stateParams,User,UserService){
  $scope.user = new User().setDefaults();
  $scope.user.token = $stateParams.token;
  $scope.user.account.email = $stateParams.email;
  $scope.submit = function(){
    var data = {
      password:$scope.user.account.password,
      customer_id:$scope.user.account.customer_id,
      token:$scope.user.token,
      email:$scope.user.account.email
    }
    UserService.claim(data).then(function(res){
      console.log(res);
      UserService.login($scope.user).then(function(res){
        console.log(res);
        if(res.token){
          $rootScope.emit('setAuth',res.token);
          $state.go('onboard.team');
        }
      }, function(err){
        console.log(err);
        $scope.error = res.data.error || 'There was an error processing your request.';
        $rootScope.$emit('notify',$scope.error);
      })
      // $state.go('onboard.team');
    }, function(res){
      console.log(res);
      $scope.error = res.data && res.data.error || 'There was an error processing your request.';
      // $scope.state = $scope.options.error;
      $rootScope.$emit('notify',$scope.error);
    })
  }
}
angular.module('opsee.user.controllers').controller('UserPasswordCtrl', UserPasswordCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('login', {
      url:'/login',
      templateUrl:'/public/js/src/user/views/login.html',
      controller:'LoginCtrl'
    })
    .state('password', {
      url:'/password?email&token',
      templateUrl:'/public/js/src/user/views/password.html',
      controller:'UserPasswordCtrl',
      title:'Set Your Password'
    })
  }
angular.module('opsee').config(config);

})();//IIFE