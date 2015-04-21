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
  $scope.activeTutorialStep = 0;

  $scope.nextTutorialStep = function() {
    if ($scope.activeTutorialStep < $scope.tutorialSteps.length-1) {
      $scope.activeTutorialStep++;
    }
  }
  $scope.prevTutorialStep = function() {
    if ($scope.activeTutorialStep > 0) {
      $scope.activeTutorialStep--;
    }
  }
  $scope.tutorialSteps =
    [{
      title: "The Opsee bastion host",
      img: "/public/img/tut-01.svg",
      img_alt: "valid",
      desc: "Checks get run from the bastion host, which is deployed into your VPC.  The bastion is the middleman between you and Opsee, protecting your AWS creds and user data from ever leaving your control."
    },
    {
      title: "We scan your environment",
      img: "/public/img/tut-02.svg",
      img_alt: "valid",
      desc: "Once it's up and running, the bastion software will scan AWS for the services you have running."
    },
    {
      title: "Create health checks easily",
      img: "/public/img/tut-03.svg",
      img_alt: "valid",
      desc: "Lastly, we’ll help you set up some health checks. Just tell us which groups to monitor, what protocol to talk, and the details about what's to be considered a healthy response.  We'll take care of everything else."
    }];
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