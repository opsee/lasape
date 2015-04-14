(function(){

angular.module('opsee.onboard.controllers', ['opsee.onboard.services']);

function OnboardCtrl($scope,$state){
  // $state.go('onboard.start');
  $scope.user = {
    bio:{
      name:null
    },
    account:{
      email:null,
    }
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardCtrl', OnboardCtrl);

function OnboardStartCtrl($scope,$state){
  $scope.submit = function(){
    $state.go('onboard.check');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardStartCtrl', OnboardStartCtrl);

function OnboardCheckCtrl($scope){
}
angular.module('opsee.onboard.controllers').controller('OnboardCheckCtrl', OnboardCheckCtrl);

function OnboardTutorialCtrl($scope){
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorialCtrl', OnboardTutorialCtrl);

function OnboardPasswordCtrl($scope,$state){
  $scope.submit = function(){
    $state.go('onboard.team')
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardPasswordCtrl', OnboardPasswordCtrl);

function OnboardTeamCtrl($scope){
}
angular.module('opsee.onboard.controllers').controller('OnboardTeamCtrl', OnboardTeamCtrl);


function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('onboard', {
      url:'/',
      templateUrl:'public/js/src/onboard/views/index.html',
      controller:'OnboardCtrl'
    })
    .state('onboard.start', {
      url:'start',
      parent:'onboard',
      templateUrl:'public/js/src/onboard/views/start.html',
      controller:'OnboardStartCtrl'
    })
    .state('onboard.check', {
      url:'check',
      parent:'onboard',
      templateUrl:'public/js/src/onboard/views/check.html',
      controller:'OnboardCheckCtrl'
    })
    .state('onboard.tutorial', {
      url:'tutorial',
      parent:'onboard',
      templateUrl:'public/js/src/onboard/views/tutorial.html',
      controller:'OnboardTutorialCtrl'
    })
    .state('onboard.password', {
      url:'password',
      parent:'onboard',
      templateUrl:'public/js/src/onboard/views/password.html',
      controller:'OnboardPasswordCtrl'
    })
    .state('onboard.team', {
      url:'team',
      parent:'onboard',
      templateUrl:'public/js/src/onboard/views/team.html',
      controller:'OnboardTeamCtrl'
    })
  }
angular.module('opsee').config(config);

})();//IIFE