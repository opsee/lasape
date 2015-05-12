(function(){

angular.module('opsee.onboard.controllers', ['opsee.onboard.services','opsee.global.services']);

function OnboardCtrl($rootScope,$scope,$state){
  $scope.user = $rootScope.user;
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
  $scope.step = {
    text:'Next',
    link:'onboard.tutorial.2'
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorialCtrl', OnboardTutorialCtrl);

function OnboardTutorial1Ctrl($scope, preImg){
  $scope.step.text = 'Next';
  $scope.step.link = 'onboard.tutorial.2';
  $scope.step.img = preImg;
}
OnboardTutorial1Ctrl.resolve = {
  preImg:function(PreloadImg,$q){
    return PreloadImg('/public/img/tut-01.svg');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorial1Ctrl', OnboardTutorial1Ctrl);

function OnboardTutorial2Ctrl($scope, preImg){
  $scope.step.text = 'Next';
  $scope.step.link = 'onboard.tutorial.3';
  $scope.step.img = preImg;
}
OnboardTutorial2Ctrl.resolve = {
  preImg:function(PreloadImg){
    return PreloadImg('/public/img/tut-02.svg');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorial2Ctrl', OnboardTutorial2Ctrl);

function OnboardTutorial3Ctrl($scope, preImg){
  $scope.step.text = 'Finish';
  $scope.step.link = 'home';
  $scope.step.img = preImg;
}
OnboardTutorial3Ctrl.resolve = {
  preImg:function(PreloadImg){
    return PreloadImg('/public/img/tut-03.svg');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorial3Ctrl', OnboardTutorial3Ctrl);

function OnboardPasswordCtrl($scope,$state,$rootScope,$stateParams,User,UserService){
  $scope.user.activationId = $stateParams.token;
  $scope.user.account.email = $stateParams.email;
  $scope.submit = function(){
    $state.go('onboard.profile');
  }
}
angular.module('opsee.user.controllers').controller('OnboardPasswordCtrl', OnboardPasswordCtrl);

function OnboardProfileCtrl($scope, $state, $rootScope, $stateParams, $localStorage, User, UserService, SlackService, slackProfile){
  $scope.slackProfile = slackProfile;
  if($scope.slackProfile){
    $scope.user.bio.title = $scope.user.bio.title || $scope.slackProfile.title;
  }
  $scope.submit = function(){
    $state.go('onboard.team');
  }
}
OnboardProfileCtrl.resolve = {
  slackProfile:function($localStorage,SlackService){
    if($localStorage.slackAccessToken){
      return SlackService.getProfile().then(function(res){
        return res.data.user.profile;
      }, function(res){
        return null;
      })
    }else{
      return false;
    }
  }
}
angular.module('opsee.user.controllers').controller('OnboardProfileCtrl', OnboardProfileCtrl);

function OnboardTeamCtrl($scope, $rootScope, $state, UserService){
  $scope.fullDomain = null;
  $scope.$watch(function(){return $scope.user.account.customer_id}, function(newVal,oldVal){
    $scope.fullDomain = newVal ? newVal+'.opsee.co' : null;
  })
  $scope.submit = function(){
    var data = {
      password:$scope.user.account.password,
      team_name:$scope.user.account.team_name,
      customer_id:$scope.user.account.customer_id,
      activationId:$scope.user.activationId,
      email:$scope.user.account.email
    }
    UserService.claim(data).then(function(res){
      console.log(res);
      $rootScope.$emit('setUser',res.data);
      UserService.login($scope.user).then(function(res){
        console.log(res);
        if(res.token){
          $rootScope.$emit('setAuth',res.token);
        }
      }, function(err){
        console.log(err);
        $scope.error = res.data.error || 'There was an error processing your request.';
        $rootScope.$emit('notify',$scope.error);
      })
    }, function(res){
      console.log(res);
      $scope.error = res.data && res.data.error || 'There was an error processing your request.';
      $rootScope.$emit('notify',$scope.error);
    })
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardTeamCtrl', OnboardTeamCtrl);

function OnboardCredentialsCtrl($scope, $rootScope, $state, AWSService){
  $scope.submit = function(){
    var data = {
      accessKey:$scope.user.aws.accessKey,
      secretKey:$scope.user.aws.secretKey
    }
    //test creds
    data.accessKey = 'AKIAITLC4AUQZLJXBZGQ';
    data.secretKey = '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';
    data.regions = ['us-west-1','us-west-2'];
    AWSService.vpcScan(data).then(function(res){
      console.log(res);
      }, function(err){
      console.log(err);
      $scope.error = res.data.error || 'There was an error processing your request.';
      $rootScope.$emit('notify',$scope.error);
    })
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardCredentialsCtrl', OnboardCredentialsCtrl);


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
      url:'start/email?email',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/email.html',
      controller:'OnboardEmailCtrl',
      title:'Email'
    })
    .state('onboard.thanks', {
      url:'start/thanks?email',
      parent:'onboard',
      controller:'OnboardThanksCtrl',
      templateUrl:'/public/js/src/onboard/views/thanks.html',
      title:'Thank You'
    })
    .state('onboard.tutorial', {
      // url:'tutorial',
      parent:'onboard',
      controller:'OnboardTutorialCtrl',
      title:'Tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial.html',
    })
    .state('onboard.tutorial.1', {
      url:'intro/1',
      parent:'onboard.tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial-1.html',
      controller:'OnboardTutorial1Ctrl',
      title:'Tutorial Step 1',
      resolve:OnboardTutorial1Ctrl.resolve
    })
    .state('onboard.tutorial.2', {
      url:'intro/2',
      parent:'onboard.tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial-2.html',
      controller:'OnboardTutorial2Ctrl',
      title:'Tutorial Step 2',
      resolve:OnboardTutorial2Ctrl.resolve
    })
    .state('onboard.tutorial.3', {
      url:'intro/3',
      parent:'onboard.tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial-3.html',
      controller:'OnboardTutorial3Ctrl',
      title:'Tutorial Step 3',
      resolve:OnboardTutorial3Ctrl.resolve
    })
    .state('onboard.password', {
      url:'start/password?email&token',
      parent:'onboard',
      templateUrl:'/public/js/src/user/views/password.html',
      controller:'OnboardPasswordCtrl',
      title:'Set Your Password',
    })
    .state('onboard.profile', {
      url:'start/profile',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/profile.html',
      controller:'OnboardProfileCtrl',
      title:'Fill Out Your Profile',
      resolve:OnboardProfileCtrl.resolve
    })
    .state('onboard.team', {
      url:'start/team',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/team.html',
      controller:'OnboardTeamCtrl',
      title:'Create Your Team'
    })
    .state('onboard.credentials', {
      url:'start/credentials',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/credentials.html',
      controller:'OnboardCredentialsCtrl',
      title:'Enter your AWS Credentials'
    })
  }
angular.module('opsee').config(config);

})();//IIFE