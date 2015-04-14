(function(){

angular.module('opsee.checks.controllers', ['opsee.checks.services']);

function ChecksCtrl($scope, $state){
  $state.go('checks.home');
}
angular.module('opsee.checks.controllers').controller('ChecksCtrl', ChecksCtrl);

function ChecksHomeCtrl($scope){
}
angular.module('opsee.checks.controllers').controller('ChecksHomeCtrl', ChecksHomeCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('checks', {
      url:'/checks',
      templateUrl:'/public/js/src/checks/views/index.html',
      controller:'ChecksCtrl'
    })
    .state('checks.home', {
      // url:'/start',
      parent:'checks',
      templateUrl:'/public/js/src/checks/views/start.html',
      controller:'ChecksHomeCtrl'
    })
  }
angular.module('opsee').config(config);

})();//IIFE