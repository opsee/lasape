(()=>{

angular.module('opsee.aws.controllers', []);

function InstanceSingleCtrl($scope, $state, singleInstance, Group){
  $scope.instance = singleInstance.setDefaults();
  $scope.instance.meta.created = new Date(Date.parse($scope.instance.meta.created));
  $state.current.title = 'Instance: '+($scope.instance.name || $scope.instance.id);
  $scope.instance.groups = _.map($scope.instance.groups, function(i){
    return new Group(i).setDefaults();
  });
}
InstanceSingleCtrl.resolve = {
  singleInstance:function($stateParams, Check, Instance){
    return Instance.get({id:$stateParams.id}).$promise;
  }
}
angular.module('opsee.aws.controllers').controller('InstanceSingleCtrl',InstanceSingleCtrl);

function GroupSingleCtrl($scope, $state, _, singleGroup, Instance){
  $scope.group = singleGroup.setDefaults();
  $state.current.title = 'Group: '+($scope.group.name || $scope.group.id);
  $scope.group.instances = _.map($scope.group.instances, function(i){
    return new Instance(i).setDefaults();
  });
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
    .state('instanceSingle', {
      url:'/instance/:id',
      templateUrl:'/public/js/src/aws/views/single-instance.html',
      controller:'InstanceSingleCtrl',
      resolve:InstanceSingleCtrl.resolve
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