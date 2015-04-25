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
      $state.go('onboard.thanks',{email:$scope.user.account.email});
    }, function(res){
      $scope.error = res.data.error || 'There was an error processing your request.';
      $scope.state = $scope.options.error;
      $rootScope.$emit('notify',$scope.error);
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

function OnboardThanksCtrl($scope,$stateParams){
  $scope.user.account.email = $scope.user.account.email || $stateParams.email;
}
angular.module('opsee.onboard.controllers').controller('OnboardThanksCtrl', OnboardThanksCtrl);

function OnboardTutorialCtrl($scope,$state,$stateParams,$timeout){
  $scope.$state = $state;
  $scope.btn = {
    text:'Next',
    link:'onboard.tutorial.2'
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorialCtrl', OnboardTutorialCtrl);

function OnboardTutorial1Ctrl($scope){
  $scope.btn.text = 'Next';
  $scope.btn.link = 'onboard.tutorial.2';
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorial1Ctrl', OnboardTutorial1Ctrl);

function OnboardTutorial2Ctrl($scope){
  $scope.btn.text = 'Next';
  $scope.btn.link = 'onboard.tutorial.3';
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorial2Ctrl', OnboardTutorial2Ctrl);

function OnboardTutorial3Ctrl($scope){
  $scope.btn.text = 'Finish';
  $scope.btn.link = 'home';
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorial3Ctrl', OnboardTutorial3Ctrl);

function OnboardTeamCtrl($scope){
}
angular.module('opsee.onboard.controllers').controller('OnboardTeamCtrl', OnboardTeamCtrl);


function config ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('/tutorial', '/tutorial/1');
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
    .state('onboard.thanks', {
      url:'thanks?email',
      parent:'onboard',
      controller:'OnboardThanksCtrl',
      templateUrl:'/public/js/src/onboard/views/thanks.html',
      title:'Thank You'
    })
    .state('onboard.tutorial', {
      url:'tutorial',
      parent:'onboard',
      controller:'OnboardTutorialCtrl',
      title:'Tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial.html',
    })
    .state('onboard.tutorial.1', {
      url:'/1',
      parent:'onboard.tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial-1.html',
      controller:'OnboardTutorial1Ctrl',
      title:'Tutorial Step 1'
    })
    .state('onboard.tutorial.2', {
      url:'/2',
      parent:'onboard.tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial-2.html',
      controller:'OnboardTutorial2Ctrl',
      title:'Tutorial Step 2'
    })
    .state('onboard.tutorial.3', {
      url:'/3',
      parent:'onboard.tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial-3.html',
      controller:'OnboardTutorial3Ctrl',
      title:'Tutorial Step 3'
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