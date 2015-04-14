(function(){

angular.module('opsee.checks.controllers', ['opsee.checks.services']);

function ChecksCtrl($scope, $state){
  $scope.checks = [
  {
    name:'My great check',
    info:'Fun info here.',
    id:'foo'
  },
  {
    name:'My great check2',
    info:'Fun info here2.',
    id:'feee'
  },
  ]
}
angular.module('opsee.checks.controllers').controller('ChecksCtrl', ChecksCtrl);

function SingleCheckCtrl($scope, $state, $stateParams, singleCheck){
  $scope.check = singleCheck;
}
SingleCheckCtrl.resolve = {
  singleCheck:function($stateParams){
    console.log($stateParams);
    return {
      name:'My great check2',
      info:'Fun info here2.',
      id:$stateParams.id || 'TESTID'
    }
  }
}
angular.module('opsee.checks.controllers').controller('SingleCheckCtrl', SingleCheckCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('checks', {
      url:'/checks',
      templateUrl:'/public/js/src/checks/views/index.html',
      controller:'ChecksCtrl'
    })
    .state('singleCheck', {
      url:'/check/:id',
      templateUrl:'/public/js/src/checks/views/single.html',
      controller:'SingleCheckCtrl',
      resolve:SingleCheckCtrl.resolve
    })
  }
angular.module('opsee').config(config);

})();//IIFE