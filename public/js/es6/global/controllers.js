(() => {

angular.module('opsee.global.controllers', ['opsee.global.services']);

function HomeCtrl($scope, $rootScope, _, $state, Check){
}
angular.module('opsee.global.controllers').controller('HomeCtrl',HomeCtrl);

function HomeInstancesCtrl($scope, Instance, instances){
  $scope.instances = _.map(instances.instances, function(i){
    return new Instance(i).setDefaults();
  });
  $scope.runningInstances = _.filter($scope.instances, function(c){return c.status.state == 'running'});
  $scope.unmonitoredInstances = _.filter($scope.instances, function(c){return c.status.state == 'unmonitored'});
  $scope.stoppedInstances = _.filter($scope.instances, function(c){return c.status.state == 'stopped'});
}
angular.module('opsee.global.controllers').controller('HomeInstancesCtrl',HomeInstancesCtrl);

HomeInstancesCtrl.resolve = {
  instances:function($resource, ENDPOINTS){
    var path = $resource(ENDPOINTS.api+'/instances');
    path = path.get();
    return path.$promise;
  },
  auth:function($rootScope){
    return $rootScope.user.hasUser(true);
  }
}

function HomeGroupsCtrl($scope, Group, groups){
  $scope.groups = _.map(groups.groups, function(i){
    return new Group(i).setDefaults();
  });
}
angular.module('opsee.global.controllers').controller('HomeGroupsCtrl',HomeGroupsCtrl);

HomeGroupsCtrl.resolve = {
  groups:function($resource, ENDPOINTS){
    var path = $resource(ENDPOINTS.api+'/groups');
    path = path.get();
    return path.$promise;
  },
  auth:function($rootScope){
    return $rootScope.user.hasUser(true);
  }
}



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

function ErrorCtrl($scope, $stateParams){
  console.log($stateParams);
  if($stateParams.res){
    try{
      $scope.res = JSON.parse($stateParams.res);
    }catch(err){
      console.log(err);
    }
  }
}

function config ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('404');
  $urlRouterProvider.when('/', '/home/instances');
    $stateProvider.state('home', {
      url:'/',
      controller:'HomeCtrl',
      templateUrl:'/public/js/src/global/views/home.html',
      title:'Your AWS Environment',
    })
    .state('home.instances', {
      url:'home/instances',
      controller:'HomeInstancesCtrl',
      templateUrl:'/public/js/src/global/views/home-instances.html',
      title:'AWS Instances',
      resolve:HomeInstancesCtrl.resolve
    })
    .state('home.groups', {
      url:'home/groups',
      controller:'HomeGroupsCtrl',
      templateUrl:'/public/js/src/global/views/home-groups.html',
      title:'AWS Groups',
      resolve:HomeGroupsCtrl.resolve
    })
    .state('404', {
      url:'/404',
      templateUrl:'/public/js/src/global/views/404.html',
      title:'404',
      hideInSearch:true
    })
    .state('500', {
      url:'/500?res',
      templateUrl:'/public/js/src/global/views/500.html',
      title:'500',
      controller:ErrorCtrl,
      hideInSearch:true
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