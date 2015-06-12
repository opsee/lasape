(function(){

angular.module('opsee.aws.controllers', []);

function InstancesCtrl($scope, allInstances){
  $scope.instances = allInstances.instances;
}
InstancesCtrl.resolve = {
  allInstances:function($resource, ENDPOINTS){
    var path = $resource(ENDPOINTS.api+'/instances');
    groups = path.get();
    return groups.$promise;
  }
}
angular.module('opsee.aws.controllers').controller('InstancesCtrl',InstancesCtrl);

function InstanceSingleCtrl($scope, singleInstance){
  $scope.instance = singleInstance;
}
InstanceSingleCtrl.resolve = {
  singleInstance:function($stateParams, Check, Instance){
    return Instance.get({id:$stateParams.id}).$promise;
    instance.checks.forEach(function(c,i){
      instance.checks[i] = new Check(c);
    });
    return instance;
  }
}
angular.module('opsee.aws.controllers').controller('InstanceSingleCtrl',InstanceSingleCtrl);

function GroupsCtrl($scope, allGroups){
  $scope.groups = allGroups.groups;
}
GroupsCtrl.resolve = {
  allGroups:function($resource, ENDPOINTS){
    var path = $resource(ENDPOINTS.api+'/groups');
    var groups = path.get();
    return groups.$promise;
  }
}
angular.module('opsee.aws.controllers').controller('GroupsCtrl',GroupsCtrl);

function GroupSingleCtrl($scope, singleGroup){
  $scope.group = singleGroup;
}
GroupSingleCtrl.resolve = {
  singleGroup:function(Group, $stateParams){
    return Group.get({id:$stateParams.id}).$promise;
  }
}
angular.module('opsee.aws.controllers').controller('GroupSingleCtrl',GroupSingleCtrl);

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
    .state('instances', {
      url:'/instances',
      templateUrl:'/public/js/src/aws/views/instances.html',
      controller:'InstancesCtrl',
      resolve:InstancesCtrl.resolve
    })
    .state('instanceSingle', {
      url:'/instance/:id',
      templateUrl:'/public/js/src/aws/views/single-instance.html',
      controller:'InstanceSingleCtrl',
      resolve:InstanceSingleCtrl.resolve
    })
    .state('groups', {
      url:'/groups',
      templateUrl:'/public/js/src/aws/views/groups.html',
      controller:'GroupsCtrl',
      resolve:GroupsCtrl.resolve
    })
    .state('groupSingle', {
      url:'/group/:id',
      templateUrl:'/public/js/src/aws/views/single-group.html',
      controller:'GroupSingleCtrl',
      resolve:GroupSingleCtrl.resolve
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