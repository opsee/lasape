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
      id:$stateParams.id || 'TESTID',
      meta:[
        {
          key:'State',
          value:'Failing'
        },
        {
          key:'Port',
          value:80
        },
        {
          key:'Protocol',
          value:'HTTP'
        }
      ],
      instances:[
      {
        status:'Failing',
        name:'a-q8r-309fo (US-West-1)',
        lastChecked:new Date()
      },
      {
        status:'Passing',
        name:'hr-afoijfa-309fo (US-West-2)',
        lastChecked:new Date()
      },
      {
        status:'Passing',
        name:'aekfjoiuhfef1234-309fo (US-West-1)',
        lastChecked:new Date()
      }
      ]
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