(() => {

angular.module('opsee.onboard.controllers', ['opsee.onboard.services','opsee.global.services']);

function OnboardCtrl($rootScope, $scope, $state, AWSRegions, TEST_KEYS){
  $rootScope.user.info = {
    baseRegions:angular.copy(AWSRegions)
  }
  $scope.user = $rootScope.user;
}
angular.module('opsee.onboard.controllers').controller('OnboardCtrl', OnboardCtrl);

function OnboardStartCtrl($scope, $rootScope, $state, $analytics, UserService, Global){
  $scope.submit = () => {
    $scope.state = $scope.options.inProgress;
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'Start Form'});
    UserService.create({
      name:$scope.user.bio.name,
      email:$scope.user.account.email
    }).then(res => {
      $scope.state = res.statusText || $scope.options.success;
      $state.go('onboard.thanks',{email:$scope.user.account.email});
    }, res => {
      if(res.data && res.data.error){
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
  preImg:PreloadImg => PreloadImg('/public/img/tut-checks.svg')
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorial1Ctrl', OnboardTutorial1Ctrl);

function OnboardTutorial2Ctrl($scope, preImg){
  $scope.step.text = 'Next';
  $scope.step.link = 'onboard.team';
  $scope.step.img = preImg;
}
OnboardTutorial2Ctrl.resolve = {
  preImg:PreloadImg => PreloadImg('/public/img/tut-bastion.svg')
}
angular.module('opsee.onboard.controllers').controller('OnboardTutorial2Ctrl', OnboardTutorial2Ctrl);

function OnboardPasswordCtrl($scope, $state, $rootScope, $stateParams, $analytics, User, UserService){
  $scope.user.activationId = $stateParams.token;
  $scope.user.account.email = $stateParams.email;
  $scope.submit = function(){
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'Password Form'});
    UserService.claim({
      password:$scope.user.account.password,
      activationId:$scope.user.activationId
    }).then(function(res){
      console.log(res);
      $rootScope.$emit('setUser',res);
      $state.go('onboard.tutorial.1');
    }, function(err){
      $rootScope.$emit('notify',err);
    })
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
  auth:($rootScope) => $rootScope.user.hasUser(true),
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
    const data = {
      name:$scope.user.account.name,
      subdomain:$scope.user.account.subdomain,
    }
    UserService.createOrg(data).then(function(res){
      console.log(res);
      $state.go('onboard.regionSelect');
    }, function(res){
      console.log(res);
      $scope.error = res.data && res.data.error || 'There was an error processing your request.';
      $rootScope.$emit('notify',$scope.error);
    })
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardTeamCtrl', OnboardTeamCtrl);

function OnboardRegionSelectCtrl($scope, $state, $analytics, _, AWSRegions){
  $scope.requiredSelection = () => !_.findWhere($scope.user.info.baseRegions, {'selected':true});
  $scope.selectAll = () => $scope.user.info.baseRegions.forEach(r => r.selected = true);
  $scope.deselectAll = () => $scope.user.info.baseRegions.forEach(r => r.selected = false);
  $scope.submit = () => {
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'RegionSelect'});
    $state.go('onboard.credentials');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardRegionSelectCtrl', OnboardRegionSelectCtrl);

function OnboardCredentialsCtrl($scope, $rootScope, $state, $analytics, AWSService, AWSRegions){
  $scope.submit = () => {
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'Credientials'});
    $state.go('onboard.vpcSelect');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardCredentialsCtrl', OnboardCredentialsCtrl);

function OnboardVpcsCtrl($scope, $rootScope, $q, $state, $analytics, _, AWSService, AWSRegions){
  function getRegionsWithVpcs(){
    const deferred = $q.defer();
    const data = angular.copy($rootScope.user.info);
    let regions = _.chain(data.baseRegions).where({selected:true}).pluck('id').value();
    if(!regions.length){
      regions = ['us-east-1','us-west-1'];
    }
    data.regions = regions;
    AWSService.vpcScan(data).then(function(res){
      const regions = res.data;
      regions.forEach(r => {
        AWSRegions.forEach(ar => {
          if(r.region == ar.id){
            r.regionName = ar.name;
          }
        });
      })
      deferred.resolve(regions);
    },function(err){
      $rootScope.$emit('notify',err);
    });
    return deferred.promise;
  }

  getRegionsWithVpcs().then(function(regions){
    $scope.loadingVpcs = false;
    $scope.user.info.regionsWithVpcs = regions;
  }, function(err){

  })

  $scope.loadingVpcs = true;

  $scope.msg = 'loading';
  $scope.selectAll = () => {
    _.chain($scope.user.info.regionsWithVpcs).pluck('vpcs').flatten().map(vpc => {
      vpc.selected = true;
      return vpc;
    }).value();
  }
  $scope.requiredSelection = function(){
    return !_.chain($scope.user.info.regionsWithVpcs).pluck('vpcs').flatten().where({'selected':true}).value().length;
  }
  $scope.submit = function(){
    $analytics.eventTrack('submit-form', {category:'Onboard',label:'VPCS Select'});
    $state.go('onboard.bastion');
  }
}
angular.module('opsee.onboard.controllers').controller('OnboardVpcsCtrl', OnboardVpcsCtrl);

OnboardVpcsCtrl.resolve = {
  // regionsWithVpcs:function(AWSService, AWSRegions, $q, $rootScope, _){
  //   const deferred = $q.defer();
  //   const data = angular.copy($rootScope.user.info);
  //   let regions = _.chain(data.baseRegions).where({selected:true}).pluck('id').value();
  //   if(!regions.length){
  //     regions = ['us-east-1','us-west-1'];
  //   }
  //   data.regions = regions;
  //   AWSService.vpcScan(data).then(function(res){
  //     const regions = res.data;
  //     regions.forEach(r => {
  //       AWSRegions.forEach(ar => {
  //         if(r.region == ar.id){
  //           r.regionName = ar.name;
  //         }
  //       });
  //     })
  //     deferred.resolve(regions);
  //   },function(err){
  //     $rootScope.$emit('notify',err);
  //   });
  //   return deferred.promise;
  // },
  auth:function($rootScope){
    return $rootScope.user.hasUser(true);
  }
}

function OnboardBastionCtrl($scope, $rootScope, $window, $state, $timeout, $analytics, $http, $stateParams, $location, AWSService, BastionInstaller){
  $scope.messages = [];
  $scope.bastions = [];
  $scope.launch = function(){
    $scope.launched = true;
    try{
      $rootScope.user.info.regionsWithVpcs.map(a => {
        a.vpcs.map(v => {
          v.id = v['vpc-id'];
        });
        return a;
      });
    }catch(err){
      console.log(err);
    }
    const data = angular.copy($scope.user.info);
    AWSService.bastionInstall(data).then(
      res => setLaunchedBastions(res.data),
      err => $scope.$emit('notify', err)
    );
  }

  // if($window.location.href.match(':8000') && !$location.search().noTesting){
  //   $scope.testing = true;
  // }else{
  //   $scope.launch();
  // }

    function setLaunchedBastions(bastions){
      $rootScope.user.info.launchedRegions = bastions;
      $scope.launched = true;
      $rootScope.user.info.launchedRegions.forEach(r => {
        r.vpcs.forEach(
          v => $scope.bastions.push(new BastionInstaller(v))
        )
      })
    }

    function getBastion(data){
      if(data.command == 'launch-bastion'){
        return _.findWhere($scope.bastions,{instance_id:data.instance_id});
      }
      return false;
    }

    $scope.$watch(() => $scope.messages, function(newVal,oldVal){
      if(newVal && newVal != oldVal){
        const msg = _.last(newVal);
        const bastion = getBastion(msg);
        bastion ? bastion.parseMsg(msg) : null;
      }
    },true);

    if($rootScope.stream){
      $rootScope.stream.onMessage(function(event){
        try{
          const data = JSON.parse(event.data)
        }catch(err){
          console.log(err);
          return false;
        }
        $scope.messages.push(data);
      });
    }

  $scope.exampleLaunch = function(){
    // setLaunchedBastions([{"region":"us-east-1","vpcs":[{"instance_id":"5tRx0JWEOQgGVdLoKj1W3Z","id":"vpc-31a0cc54"}]},{"region":"ap-southeast-1","vpcs":[{"instance_id":"1r6k6YRB3Uzh0Bk5vmZsFU","id":"vpc-22e51a47"}]}]);
    setLaunchedBastions([{"region":"ap-southeast-1","vpcs":[{"instance_id":"1r6k6YRB3Uzh0Bk5vmZsFU","id":"vpc-22e51a47"}]}]);
    $http.get('/public/js/es6/aws/bastion-install-messages-example.json').then(function(res){
      res.data.forEach(function(d,i){
        if(d.command != 'launch-bastion'){
          return false;
        }
        $timeout(() => {
          $scope.messages.push(d);
        }, i*500);
      })
    })
  }
  $scope.bastionsComplete = function(){
    const allComplete = !_.reject($scope.bastions, b => b.status == 'complete' || b.status == 'rollback').length;
    return allComplete && $scope.bastions.length;
  }
  $scope.submit = function(){
    $state.go('check.all');
  }
  $scope.launch();
  // $scope.exampleLaunch();

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
      templateUrl:'/public/js/src/onboard/views/start.html',
      controller:'OnboardStartCtrl',
      title:'Start',
      hideHeader:true
    })
    .state('onboard.email', {
      url:'start/email?email',
      templateUrl:'/public/js/src/onboard/views/email.html',
      controller:'OnboardEmailCtrl',
      title:'Email',
      hideHeader:true,
      hideInSearch:true
    })
    .state('onboard.thanks', {
      url:'start/thanks?email',
      controller:'OnboardThanksCtrl',
      templateUrl:'/public/js/src/onboard/views/thanks.html',
      title:'Thank You',
      hideHeader:true,
      hideInSearch:true
    })
    .state('onboard.tutorial', {
      controller:'OnboardTutorialCtrl',
      title:'Tutorial',
      templateUrl:'/public/js/src/onboard/views/tutorial.html',
      hideHeader:true
    })
    .state('onboard.tutorial.1', {
      url:'intro/1',
      templateUrl:'/public/js/src/onboard/views/tutorial-1.html',
      controller:'OnboardTutorial1Ctrl',
      title:'Tutorial Step 1',
      resolve:OnboardTutorial1Ctrl.resolve,
      hideHeader:true,
      hideInSearch:true
    })
    .state('onboard.tutorial.2', {
      url:'intro/2',
      templateUrl:'/public/js/src/onboard/views/tutorial-2.html',
      controller:'OnboardTutorial2Ctrl',
      title:'Tutorial Step 2',
      resolve:OnboardTutorial2Ctrl.resolve,
      hideHeader:true,
      hideInSearch:true
    })
    .state('onboard.password', {
      url:'start/password?email&token',
      templateUrl:'/public/js/src/user/views/password.html',
      controller:'OnboardPasswordCtrl',
      title:'Set Your Password',
      hideHeader:true
    })
    .state('onboard.team', {
      url:'start/team',
      templateUrl:'/public/js/src/onboard/views/team.html',
      controller:'OnboardTeamCtrl',
      title:'Create Your Team',
      hideHeader:true,
      resolve:{
        auth:($rootScope) => $rootScope.user.hasUser(true)
      }
    })
    .state('onboard.credentials', {
      url:'start/credentials',
      templateUrl:'/public/js/src/onboard/views/credentials.html',
      controller:'OnboardCredentialsCtrl',
      title:'Enter your AWS Credentials',
      hideHeader:true,
      resolve:{
        auth:($rootScope) => $rootScope.user.hasUser(true)
      }
    })
    .state('onboard.regionSelect', {
      url:'start/region-select',
      templateUrl:'/public/js/src/onboard/views/region-select.html',
      controller:'OnboardRegionSelectCtrl',
      title:'Select AWS Regions',
      hideHeader:true,
      resolve:{
        auth:($rootScope) => $rootScope.user.hasUser(true)
      }
    })
    .state('onboard.vpcSelect', {
      url:'start/vpc-select',
      templateUrl:'/public/js/src/onboard/views/vpc-select.html',
      controller:'OnboardVpcsCtrl',
      title:'Select VPCs',
      hideHeader:true,
      resolve:OnboardVpcsCtrl.resolve
    })
    .state('onboard.bastion', {
      url:'start/bastion',
      templateUrl:'/public/js/src/onboard/views/bastion.html',
      controller:'OnboardBastionCtrl',
      title:'Bastion Installation',
      hideHeader:true,
      resolve:{
        auth:($rootScope) => $rootScope.user.hasUser(true)
      }
    })
    .state('onboard.profile', {
      url:'start/profile',
      templateUrl:'/public/js/src/onboard/views/profile.html',
      controller:'OnboardProfileCtrl',
      title:'Fill Out Your Profile',
      resolve:OnboardProfileCtrl.resolve,
      hideHeader:true
    })
  }
angular.module('opsee').config(config);

})();//IIFE