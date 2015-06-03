(function(){

angular.module('opsee.global.controllers', ['opsee.global.services']);

function HomeCtrl($scope, $rootScope, _, $state, Check){
}
angular.module('opsee.global.controllers').controller('HomeCtrl',HomeCtrl);

function HomeInstancesCtrl($scope, Check){
  $scope.instances = [
    {
      name:'Wee a check',
      status:{
        health:25,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-60000),
          duration:180000
        }
      },
    },
    {
      name:'Another check',
      status:{
        health:50,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-100000),
          duration:500000
        }
      },
    },
    {
      name:'Third check.',
      status:{
        health:70,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-10000).toString(),
          duration:20000
        }
      },
    },
    {
      name:'A check that needs attention',
      status:{
        health:null,
        state:'unmonitored',
        silence:{
          startDate:null,
          duration:null
        }
      },
    },
    {
      name:'Another',
      status:{
        health:null,
        state:'stopped',
        silence:{
          startDate:null,
          duration:null
        }
      },
    },
  ];
  $scope.instances.forEach(function(c,i){
    $scope.instances[i] = new Check(c);
  });
  $scope.runningInstances = _.filter($scope.instances, function(c){return c.status.state == 'running'});
  $scope.unmonitoredInstances = _.filter($scope.instances, function(c){return c.status.state == 'unmonitored'});
  $scope.stoppedInstances = _.filter($scope.instances, function(c){return c.status.state == 'stopped'});
}
angular.module('opsee.global.controllers').controller('HomeInstancesCtrl',HomeInstancesCtrl);

function HomeGroupsCtrl($scope, Check){
  $scope.groups = [
    {
      name:'A Group',
      status:{
        health:25,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-60000),
          duration:180000
        }
      },
    },
    {
      name:'Another group',
      status:{
        health:50,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-100000),
          duration:500000
        }
      },
    },
  ];
  $scope.groups.forEach(function(c,i){
    $scope.groups[i] = new Check(c);
  });
}
angular.module('opsee.global.controllers').controller('HomeGroupsCtrl',HomeGroupsCtrl);



function StyleGuideCtrl($scope, Check){
  $scope.checks = [
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
  },
  {
    name:'My great check3',
    info:'Fun info here2.',
    id:'feee',
    status:{
      health:0,
      state:'unmonitored',
      silence:{
        startDate:null,
        duration:null
      }
    },
  },
  {
    name:'My great check3',
    info:'Fun info here2.',
    id:'feee',
    status:{
      health:0,
      state:'stopped',
      silence:{
        startDate:null,
        duration:null
      }
    },
  },
  ];
  $scope.checks.forEach(function(c,i){
    $scope.checks[i] = new Check(c);
  });
  $scope.selectDropdown = function(num){
    $scope.dropdownSelected = 'Option '+num;
  }
  $scope.notify = function(){
    $scope.$emit('notify', 'A global notification.');
  }
}
angular.module('opsee.global.controllers').controller('StyleGuideCtrl',StyleGuideCtrl);



function NotFoundCtrl($scope, $rootScope, _, $state){
}
angular.module('opsee.global.controllers').controller('NotFoundCtrl',NotFoundCtrl);

function config ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('404');
  $urlRouterProvider.when('/', '/home/instances');
    $stateProvider.state('home', {
      url:'/',
      controller:'HomeCtrl',
      templateUrl:'/public/js/src/global/views/home.html'
    })
    .state('home.instances', {
      url:'home/instances',
      controller:'HomeInstancesCtrl',
      templateUrl:'/public/js/src/global/views/home-instances.html'
    })
    .state('home.groups', {
      url:'home/groups',
      controller:'HomeGroupsCtrl',
      templateUrl:'/public/js/src/global/views/home-groups.html'
    })
    .state('404', {
      url:'/404',
      controller:'NotFoundCtrl',
      templateUrl:'/public/js/src/global/views/404.html',
      title:'404'
    })
    .state('more', {
      url:'/more',
      templateUrl:'/public/js/src/global/views/more.html',
      title:'More Links'
    })
    .state('styleguide', {
      url:'/styleguide',
      controller:'StyleGuideCtrl',
      templateUrl:'/public/js/src/global/views/styleguide.html',
      title:'Style Guide'
    })
  }
  angular.module('opsee').config(config);

  })();//IIFE