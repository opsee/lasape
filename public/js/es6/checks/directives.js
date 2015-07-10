(() => {

angular.module('opsee.checks.directives', []);

function checkSingleContextMenu(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/single-context-menu.html',
  }
}
angular.module('opsee.checks.directives').directive('checkSingleContextMenu', checkSingleContextMenu);

function checkItem(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/check-item.html',
    scope:{
      check:'='
    }
  }
}
angular.module('opsee.checks.directives').directive('checkItem', checkItem);

function notificationItem(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/notification-item.html',
    transclude:true,
    controller:function($scope,NotificationSettings){
      $scope.notificationSettings = new NotificationSettings();
      if($scope.notif.channel){
        $scope.notif.channel = _.findWhere($scope.notificationSettings.channels,{'type':$scope.notif.channel.type});
      }
      $scope.newChannel = function(notif,$index){
        console.log(notif,$index);
      }
    }
  }
}
angular.module('opsee.checks.directives').directive('notificationItem', notificationItem);


})();//IIFE