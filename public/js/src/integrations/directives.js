(function(){

angular.module('opsee.integrations.directives', []);

function slackAuth(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/integrations/partials/slack-auth.html',
    controller:function($scope, SlackService, INTEGRATIONS_DETAILS){
      $scope.details = INTEGRATIONS_DETAILS.slack;
      $scope.submit = function(){
        SlackService.auth().then(function(res){
          console.log(res);
        },function(res){
          console.log(res);
        })
      }
    }
  }
}
angular.module('opsee.integrations.directives').directive('slackAuth',slackAuth);

})();//IIFE