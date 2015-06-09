(function(){

angular.module('opsee.onboard.controllers', ['opsee.onboard.services','opsee.global.services']);

function OnboardCtrl($rootScope, $scope, $state, AWSRegions, TEST_KEYS){
  $scope.user = $rootScope.user;
  //test regions
  $scope.user.info = {
    regions:angular.copy(AWSRegions)
  };
  //test keys
  _.defaults($scope.user.info.regions,TEST_KEYS);
  console.log($scope.user);
}
angular.module('opsee.onboard.controllers').controller('OnboardCtrl', OnboardCtrl);

function OnboardStartCtrl($scope, $state, $analytics, UserService, Global){
  $scope.submit = function(){
    $scope.state = $scope.options.inProgress;
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'Start Form'});
    UserService.create({
      name:$scope.user.bio.name,
      email:$scope.user.account.email
    }).then(function(res){
      $scope.state = res.statusText || $scope.options.success;
      $state.go('onboard.thanks',{email:$scope.user.account.email});
    }, function(res){
      if(res.data){
        $scope.error = res.data.error;
      }else{
        $scope.error = 'There was an error processing your request.';
      }
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

function OnboardPasswordCtrl($scope, $state, $rootScope, $stateParams, $analytics, User, UserService){
  $scope.user.activationId = $stateParams.token;
  $scope.user.account.email = $stateParams.email;
  $scope.submit = function(){
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'Password Form'});
    $state.go('onboard.profile');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardPasswordCtrl', OnboardPasswordCtrl);

function OnboardProfileCtrl($scope, $state, $rootScope, $stateParams, $analytics, $localStorage, User, UserService, SlackService){
  if(!$scope.user.bio.title && $scope.user.integrations.slack.user){
    $scope.user.bio.title = $scope.user.integrations.slack.user.profile.title;
  }
  if(!$localStorage.testSent){
    SlackService.sendTest();
    $localStorage.testSent = true;
  }
  $scope.submit = function(){
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'Profile Form'});
    $state.go('onboard.team');
  }
}
OnboardProfileCtrl.resolve = {
  slackProfile:function($localStorage,$rootScope){
    if($rootScope.user.integrations.slack.user){
      return true;
    }else if($localStorage.slackAccessToken){
      return $rootScope.user.populateSlack();
    }else{
      return false;
    }
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardProfileCtrl', OnboardProfileCtrl);

function OnboardTeamCtrl($scope, $rootScope, $state, $analytics, UserService, OnboardService){
  $scope.submit = function(){
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'Team Form'});
    var data = {
      name:$scope.user.account.name,
      subdomain:$scope.user.account.subdomain,
    }
    UserService.createOrg(data).then(function(res){
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

function OnboardRegionSelectCtrl($scope, $state, $analytics, _, AWSRegions){
  $scope.requiredSelection = function(){
    return !_.findWhere($scope.user.info.regions, {'selected':true});
  }
  $scope.selectAll = function(){
    $scope.user.info.regions.forEach(function(r){
      r.selected = true;
    });
  }
  $scope.deselectAll = function(){
    $scope.user.info.regions.forEach(function(r){
      r.selected = false;
    });
  }
  $scope.submit = function(){
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'RegionSelect'});
    $state.go('onboard.credentials');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardRegionSelectCtrl', OnboardRegionSelectCtrl);

function OnboardCredentialsCtrl($scope, $rootScope, $state, $analytics, AWSService, AWSRegions){
  $scope.submit = function(){
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'Credientials'});
    if(!$scope.user.info.regions){
      $scope.user.info.regions = _.pluck(AWSRegions,'id');
    }
    $state.go('onboard.vpcSelect');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardCredentialsCtrl', OnboardCredentialsCtrl);

function OnboardVpcsCtrl($scope, $rootScope, $state, $analytics, _, AWSService, AWSRegions, regionsWithVpcs){
  $scope.msg = 'loading';
  $scope.user.info.regions = regionsWithVpcs;
  $scope.selectAll = function(){
    _.chain($scope.user.info.regions).pluck('vpcs').flatten().map(function(vpc){
      vpc.selected = true;
      return vpc;
    }).value();
  }
  $scope.requiredSelection = function(){
    return !_.chain($scope.user.info.regions).pluck('vpcs').flatten().where({'selected':true}).value().length;
  }
  $scope.submit = function(){
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'VPCS Select'});
    $state.go('onboard.bastion');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardVpcsCtrl', OnboardVpcsCtrl);

OnboardVpcsCtrl.resolve = {
  regionsWithVpcs:function(AWSService, AWSRegions, $q, $rootScope, _){
    var deferred = $q.defer();
    var data = angular.copy($rootScope.user.info);
    data.regions = _.pluck(data.regions,'id');
    AWSService.vpcScan(data).then(function(res){
      var regions = res.data;
      regions.forEach(function(r){
        AWSRegions.forEach(function(ar){
          if(r.region == ar.id){
            r.regionName = ar.name;
          }
        });
      })
      deferred.resolve(regions);
    });
    return deferred.promise;
  }
}

function OnboardBastionCtrl($scope, $rootScope, $state, $timeout, $analytics, AWSService){
  $scope.messages = [];
  $scope.launch = function(){
    $scope.launched = true;
    try{
      $scope.user.info.regions.map(function(a){
        a.vpcs.map(function(v){
          v.id = v['vpc-id'];return v;
        });
        return a;
      });
    }catch(err){
      console.log(err);
    }
    $scope.stream = AWSService.bastionInstall($scope.user.info);
    $scope.stream.onMessage(function(e){
      var msg = JSON.parse(e.data).Message;
      if(msg.ResourceStatus == 'CREATE_IN_PROGRESS'){
        if(msg.ResourceType == 'AWS::CloudFormation::Stack'){
          $scope.started = true;
        }else{
          $scope.messages.push(msg);  
        }
      }else if(msg.ResourceStatus == 'CREATE_COMPLETE'){
        if(msg.ResourceType == 'AWS::CloudFormation::Stack'){
          $scope.complete = true;
        }else{
          $scope.messages.push(msg);
        }
      }else{
        $scope.messages.push(msg);
      }
    });
    $scope.stream.onError(function(err){
      console.log(err);
    });
    $scope.stream.onClose(function(msg){
      console.log('close',msg);
    });
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardBastionCtrl', OnboardBastionCtrl);


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
    .state('onboard.regionSelect', {
      url:'start/region-select',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/region-select.html',
      controller:'OnboardRegionSelectCtrl',
      title:'Select AWS Regions',
      hideHeader:true
    })
    .state('onboard.vpcSelect', {
      url:'start/vpc-select',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/vpc-select.html',
      controller:'OnboardVpcsCtrl',
      title:'Select VPCs',
      hideHeader:true,
      resolve:OnboardVpcsCtrl.resolve
    })
    .state('onboard.bastion', {
      url:'start/bastion',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/bastion.html',
      controller:'OnboardBastionCtrl',
      title:'Bastion Installation'
    })
    .state('onboard.credentials', {
      url:'start/credentials',
      parent:'onboard',
      templateUrl:'/public/js/src/onboard/views/credentials.html',
      controller:'OnboardCredentialsCtrl',
      title:'Enter your AWS Credentials',
      hideHeader:true
    })
  }
angular.module('opsee').config(config);

})();//IIFE