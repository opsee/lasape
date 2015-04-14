(function(){

angular.module('opsee.user.controllers', []);

function LoginCtrl(apiEndpoint, $scope, $http, $state, principal) {
  $scope.login = function(user) {
    $http.post(apiEndpoint + '/authenticate/password', user)
    .success(function(data, status, headers, config) {
      principal.authenticate({
        email: user.email,
        roles: ['User']
      });

      if ($scope.returnToState) $state.go($scope.returnToState.name, $scope.returnToStateParams);
      else $state.go('pre-welcome');
    })
    .error(function(data, status, headers, config) {
      console.log("error");
    });
  };
}
angular.module('opsee.user.controllers').controller('LoginCtrl', LoginCtrl);

function LogoutCtrl($state, principal) {
  principal.authenticate(null);
  //delete $cookies.authToken;
  localStorage.removeItem("opsee.identity");
  $state.go('login');
}
angular.module('opsee.user.controllers').controller('LogoutCtrl', LogoutCtrl);

})();//IIFE