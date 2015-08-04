(() => {

angular.module('opsee.admin.controllers', []);

function SignupsCtrl($scope, $rootScope, _, signups, AdminService, Global){
  signups = _.chain(signups).map(s => {
    s.created_at = Date.parse(s.created_at);
    return s;
  }).sortBy(s => {
    return -1*s.created_at;
  }).value();
  $scope.groups = {
    unapproved: _.filter(signups, s => !s.activation_id),
    approved: _.filter(signups, s => !!s.activation_id && !s.activation_used),
    users: _.filter(signups, s => !!s.activation_id && s.activation_used)
  }
  $scope.activateSignup = (email) => {
    AdminService.activateSignup(email).then(() => {
      $rootScope.$emit('notify','User activated.');
    }, res => {
      const msg = res.data && res.data.error ? res.data.error : 'Something went wrong.';
      $rootScope.$emit('notify',msg);
    })
  }
}
SignupsCtrl.resolve = {
  signups:function(AdminService, api){
    return api.getSignups();
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