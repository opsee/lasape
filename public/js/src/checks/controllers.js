(function(){

angular.module('opsee.checks.controllers', ['opsee.checks.services']);

function ChecksCtrl($scope, $state){
  $scope.checks = [
  {
    name:'My great check',
    info:'Fun info here.'
  },
  {
    name:'My great check2',
    info:'Fun info here2.'
  },
  ]
}
angular.module('opsee.checks.controllers').controller('ChecksCtrl', ChecksCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('checks', {
      url:'/checks',
      templateUrl:'/public/js/src/checks/views/index.html',
      controller:'ChecksCtrl'
    })
  }
angular.module('opsee').config(config);

})();//IIFE