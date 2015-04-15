(function(){

angular.module('opsee.onboard.controllers', ['opsee.onboard.services']);

function OnboardCtrl($scope,$state){
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

function OnboardStartCtrl($scope,$state,UserService){
  $scope.submit = function(){
    $scope.state = $scope.options.inProgress;
    UserService.create($scope.user).then(function(res){
      console.log(res);
      $scope.state = res.statusText || $scope.options.success;
      $state.go('onboard.check');
    }, function(res){
      $scope.error = res.statusText || 'There was an error processing your request.';
      $scope.state = $scope.options.error;
    });
  }
  $scope.options = {
    original:'Submit',
    inProgress:'Submitting...',
    success:'Success!',
    error:'Error.'
  }
  $scope.state = $scope.options.original;
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
      templateUrl:'/public/js/src/onboard/views/index.html',
      controller:'OnboardCtrl'
    })
    .state('onboard.start', {
      url:'start',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/start.html',
      controller:'OnboardStartCtrl',
      title:'Start'
    })
    .state('onboard.check', {
      url:'check',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/check.html',
      controller:'OnboardCheckCtrl',
      title:'Checks'
    })
    .state('onboard.tutorial', {
      url:'tutorial',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/tutorial.html',
      controller:'OnboardTutorialCtrl',
      title:'Tutorial'
    })
    .state('onboard.password', {
      url:'password',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/password.html',
      controller:'OnboardPasswordCtrl',
      title:'Set Your Password'
    })
    .state('onboard.team', {
      url:'team',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/team.html',
      controller:'OnboardTeamCtrl',
      title:'Create Your Team'
    })
  }
angular.module('opsee').config(config);

})();//IIFE