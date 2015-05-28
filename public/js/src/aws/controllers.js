(function(){

angular.module('opsee.aws.controllers', []);

function InstanceSingleCtrl($scope, singleInstance){
  $scope.instance = singleInstance;
}
InstanceSingleCtrl.resolve = {
  singleInstance:function($stateParams, Check){
    var instance = {
      name:'a-q8r-309fo (US-West-1)',
      lastChecked:new Date(),
      created:new Date(),
      info:'Fun info here.',
      id:'foo',
      size:'t2.micro',
      status:{
        health:25,
        state:'running',
        silence:{
          startDate:null,
          duration:null
        }
      },
      checks:[
        {
        name:'My great check',
        info:'Fun info here.',
        id:'foo',
        status:{
          health:25,
          state:'running',
          silence:{
            startDate:null,
            duration:null
          }
        },
      },
      {
        name:'My great check2',
        info:'Fun info here2.',
        id:'feee',
        status:{
          health:50,
          state:'running',
          silence:{
            startDate:null,
            duration:null
          }
        },
      }
      ]
    }//instance
    instance.checks.forEach(function(c,i){
      instance.checks[i] = new Check(c);
    });
    return instance;
  }
}
angular.module('opsee.aws.controllers').controller('InstanceSingleCtrl',InstanceSingleCtrl);

function SystemCtrl($scope, bastion){
  $scope.bastion = bastion;
}
SystemCtrl.resolve = {
  bastion:function($stateParams, Check){
    return true;
  }
}
angular.module('opsee.aws.controllers').controller('SystemCtrl',SystemCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('instanceSingle', {
      url:'/instance/:id',
      templateUrl:'/public/js/src/aws/views/single-instance.html',
      controller:'InstanceSingleCtrl',
      resolve:InstanceSingleCtrl.resolve
    })
    .state('system', {
      url:'/system',
      templateUrl:'/public/js/src/aws/views/system.html',
      controller:'SystemCtrl',
      title:'System Status',
      resolve:SystemCtrl.resolve
    })
  }
angular.module('opsee').config(config);

})();//IIFE