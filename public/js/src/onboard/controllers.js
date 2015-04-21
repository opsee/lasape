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

function OnboardStartCtrl($scope,$state,UserService,Global){
  $scope.submit = function(){
    $scope.state = $scope.options.inProgress;
    UserService.create($scope.user).then(function(res){
      console.log(res);
      $scope.state = res.statusText || $scope.options.success;
      $state.go('onboard.email',{email:$scope.user.account.email});
    }, function(res){
      $scope.error = res.data.error || 'There was an error processing your request.';
      $scope.state = $scope.options.error;
      Global.notify($scope.error);
    });
  }
  $scope.options = {
    original:'Create Account',
    inProgress:'Creating your account...',
    error:'Create Account'
  }
  $scope.state = $scope.options.original;
}
angular.module('opsee.onboard.controllers').controller('OnboardStartCtrl', OnboardStartCtrl);

function OnboardEmailCtrl($scope,$stateParams){
  $scope.user.account.email = $scope.user.account.email || $stateParams.email;
}
angular.module('opsee.onboard.controllers').controller('OnboardEmailCtrl', OnboardEmailCtrl);

function OnboardTutorialCtrl($scope){
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorialCtrl', OnboardTutorialCtrl);

function OnboardPasswordCtrl($scope,$state,$stateParams,User,UserService){
  $scope.user = new User().setDefaults();
  $scope.user.token = $stateParams.token;
  $scope.submit = function(){
    UserService.claim($scope.user).then(function(res){
      console.log(res);
      $state.go('onboard.team');
    }, function(res){
      console.log(res);
      $scope.error = res.data && res.data.error || 'There was an error processing your request.';
      // $scope.state = $scope.options.error;
      Global.notify($scope.error);
    })
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
    .state('onboard.email', {
      url:'email?email',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/email.html',
      controller:'OnboardEmailCtrl',
      title:'Email'
    })
    .state('onboard.tutorial', {
      url:'tutorial',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/tutorial.html',
      controller:'OnboardTutorialCtrl',
      title:'Tutorial'
    })
    .state('onboard.password', {
      url:'password?token',
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