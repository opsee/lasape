(function(){

angular.module('opsee.global.controllers', ['opsee.global.services']);

function HeaderCtrl($scope, $location, $state, $rootScope, Global) {
  // $scope.user = $rootScope.user;
  $scope.navbarEntries = [
    {
      title:'Checks',
      sref:'checks',
      children:[]
    },
    {
      title:'More',
      children:[
        {
          title:'Signup',
          sref:'onboard.start',
        },
        {
          title:'Tutorial',
          sref:'onboard.tutorial.1',
        },
        {
          title:'Set Password',
          sref:'onboard.password',
        },
        {
          title:'Onboarding Profile',
          sref:'onboard.profile',
        },
        {
          title:'Create Team',
          sref:'onboard.team',
        },
        {
          title:'Credentials',
          sref:'onboard.credentials',
        },
        {
          title:'Signups',
          sref:'signups',
          children:[]
        }
      ]
    }
  ];
  $scope.isActive = function (string) {
    if($state.current.name == string){
      return true;
    }
    return false;
  };
  $scope.navCollapsed = true
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
    $scope.navCollapsed = true;
  });
}

angular.module('opsee.global.controllers').controller('HeaderCtrl', HeaderCtrl);

function footerController($scope, Global, $location) {
  $scope.navbarEntries = [
    {
      title: "About",
      link: "/about",
      children:[]
    }
  ];
}

angular.module('opsee.global.controllers').controller('FooterController', footerController);

function HomeCtrl($scope, $rootScope, _, $state, Check){
  $scope.checks = [
    {
      name:'Wee a check',
      status:{
        health:25,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-60000),
          duration:180000
        }
      },
    },
    {
      name:'Another check',
      status:{
        health:50,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-100000),
          duration:500000
        }
      },
    },
    {
      name:'Third check.',
      status:{
        health:70,
        state:'running',
        silence:{
          startDate:new Date(Date.now()-10000).toString(),
          duration:20000
        }
      },
    },
    {
      name:'A check that needs attention',
      status:{
        health:null,
        state:'unmonitored',
        silence:{
          startDate:null,
          duration:null
        }
      },
    },
    {
      name:'Another',
      status:{
        health:null,
        state:'stopped',
        silence:{
          startDate:null,
          duration:null
        }
      },
    },
  ];
  $scope.checks.forEach(function(c,i){
    $scope.checks[i] = new Check(c);
  });
  $scope.runningChecks = _.filter($scope.checks, function(c){return c.status.state == 'running'});
  $scope.unmonitoredChecks = _.filter($scope.checks, function(c){return c.status.state == 'unmonitored'});
  $scope.stoppedChecks = _.filter($scope.checks, function(c){return c.status.state == 'stopped'});
  delete $scope.checks;
}
angular.module('opsee.global.controllers').controller('HomeCtrl',HomeCtrl);

function NotFoundCtrl($scope, $rootScope, _, $state){
}
angular.module('opsee.global.controllers').controller('NotFoundCtrl',NotFoundCtrl);

function config ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('404');
    $stateProvider.state('home', {
      url:'/',
      controller:'HomeCtrl',
      templateUrl:'/public/js/src/global/views/home.html'
    })
    .state('404', {
      url:'/404',
      controller:'NotFoundCtrl',
      templateUrl:'/public/js/src/global/views/404.html',
      title:'404'
    })
  }
  angular.module('opsee').config(config);

  })();//IIFE