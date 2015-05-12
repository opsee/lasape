(function(){

angular.module('opsee.admin.controllers', []);

function SignupsCtrl($scope,$rootScope,signups,AdminService, Global){
  $scope.signups = signups;
  $scope.activateSignup = function(email){
    AdminService.activateSignup(email).then(function(){
      $rootScope.$emit('notify','User activated.');
    }, function(res){
      var msg = res.data && res.data.error ? res.data.error : 'Something went wrong.';
      $rootScope.$emit('notify',msg);
    })
  }
}
SignupsCtrl.resolve = {
  signups:function(AdminService){
    return AdminService.signups();
  }
}
angular.module('opsee.admin.controllers').controller('SignupsCtrl', SignupsCtrl);

function SingleSignupCtrl($scope,signup,AdminService, Global){
  $scope.signup = signup;
}
SingleSignupCtrl.resolve = {
  signup:function(AdminService,$stateParams){
    return AdminService.singleSignup($stateParams.id);
  }
}
angular.module('opsee.admin.controllers').controller('SingleSignupCtrl', SingleSignupCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('signups', {
      url:'/admin/signups',
      templateUrl:'/public/js/src/admin/views/signups.html',
      controller:'SignupsCtrl',
      resolve:SignupsCtrl.resolve
    })
    .state('singleSignup', {
      url:'/admin/signup/:id',
      templateUrl:'/public/js/src/admin/views/single-signup.html',
      controller:'SingleSignupCtrl',
      resolve:SingleSignupCtrl.resolve
    })
  }
angular.module('opsee').config(config);

})();//IIFE