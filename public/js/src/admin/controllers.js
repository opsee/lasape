(function(){

angular.module('opsee.admin.controllers', []);

function SignupsCtrl($scope,signups,AdminService){
  $scope.signups = signups;
  $scope.activateSignup = AdminService.activateSignup;
}
SignupsCtrl.resolve = {
  signups:function(AdminService){
    return AdminService.signups();
  }
}
angular.module('opsee.admin.controllers').controller('SignupsCtrl', SignupsCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('signups', {
      url:'/signups',
      templateUrl:'/public/js/src/admin/views/signups.html',
      controller:'SignupsCtrl',
      resolve:SignupsCtrl.resolve
    })
  }
angular.module('opsee').config(config);

})();//IIFE