(() => {

angular.module('opsee.integrations.directives', []);

function slackAuth(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/integrations/partials/slack-auth.html',
    controller:function($scope, $state, $window, SlackService, INTEGRATIONS_DETAILS, ENDPOINTS){
      $scope.details = INTEGRATIONS_DETAILS.slack;
      $scope.redirect = $window.location.origin+'/oauth/slack/'+$state.current.name;
    }
  }
}
angular.module('opsee.integrations.directives').directive('slackAuth',slackAuth);

function slackTest(){
  return {
    restrict:'EA',
    replace:true,
    template:'<button ng-click="go()" class="btn btn-primary">Send Test Slack Msg</button>',
    controller:function($scope, $rootScope, SlackService, INTEGRATIONS_DETAILS){
      $scope.details = INTEGRATIONS_DETAILS.slack;
      $scope.go = function(){
        SlackService.sendTest().then(function(res){
          console.log(res);
          if(res.data.ok){
            $rootScope.$emit('notify','Test Message Sent.');
          }else{
            $rootScope.$emit('notify',res.data.error);
          }
        },function(res){
          $rootScope.$emit('notify','Something went wrong.');
          console.log(res);
        })
      }
    }
  }
}
angular.module('opsee.integrations.directives').directive('slackTest',slackTest);

})();//IIFE