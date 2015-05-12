(function(){

angular.module('opsee.integrations.controllers', []);

function SlackOauthCtrl($scope, $rootScope, $state, $window, $stateParams, $cookies, $location, $localStorage, SlackService) {
  $scope.msg = 'Processing...';
  if($stateParams.code){
    SlackService.token({
      code:$stateParams.code,
      redirect_uri:$window.location.origin + $window.location.pathname
    }).then(function(res){
      console.log(res);
      if(res.data.ok){
        //save access_token here
        console.log(res.data.access_token);
        $localStorage.slackAccessToken = res.data.access_token;
        $scope.msg = 'Success.';
        if($stateParams.startingState){
          $state.go($stateParams.startingState);
        }
      }else{
        $rootScope.$emit('notify',res.data.error);
        $scope.msg = 'Something went wrong.';
      }
    }, function(res){
      $scope.msg = 'Something went wrong.';
    })
  }
}
angular.module('opsee.integrations.controllers').controller('SlackOauthCtrl', SlackOauthCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('oauth-slack', {
      url:'/oauth/slack/:startingState?code&state',
      controller:'SlackOauthCtrl',
      templateUrl:'/public/js/src/integrations/views/oauth-slack.html',
      title:'Slack Oauth Callback'
    })
  }
angular.module('opsee').config(config);

})();//IIFE