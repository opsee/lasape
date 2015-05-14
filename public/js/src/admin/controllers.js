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

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('signups', {
      url:'/admin/signups',
      templateUrl:'/public/js/src/admin/views/signups.html',
      controller:'SignupsCtrl',
      resolve:SignupsCtrl.resolve,
      title:'Signups'
    })
  }
angular.module('opsee').config(config);

})();//IIFE