(function(){

angular.module('opsee.checks.controllers', ['opsee.checks.services']);

function ChecksCtrl($scope, $state, $timeout, $analytics, Check){
  $scope.checks = [
  {
    name:'My great check',
    info:'Fun info here.',
    id:'foo',
    status:{
      health:25,
      state:'running',
      silence:{
        startDate:null,
        duration:null
      }
    },
  },
  {
    name:'My great check2',
    info:'Fun info here2.',
    id:'feee',
    status:{
      health:50,
      state:'running',
      silence:{
        startDate:null,
        duration:null
      }
    },
  },
  ]
  $scope.checks.forEach(function(c,i){
    $scope.checks[i] = new Check(c);
  });
  $scope.$watch(function(){return $scope.checkSearch},function(newVal,oldVal){
    if(newVal && newVal != oldVal){
      $analytics.eventTrack('search', {category:'Checks',label:newVal});
      var query = Check.query({q:newVal});
      query.$promise.then(function(res){
        $scope.checks = res.data;
        $scope.searching = false;
      });
      $timeout(function(){
        if(!query.$resolved){
          $scope.searching = true;
        }
      },300);
    }
  });
}//ChecksCtrl
angular.module('opsee.checks.controllers').controller('ChecksCtrl', ChecksCtrl);

function SingleCheckCtrl($scope, $state, $stateParams, Check, singleCheck){
  $scope.check = new Check(singleCheck).setDefaults();
  $state.current.title = $scope.check.name;
}
SingleCheckCtrl.resolve = {
  singleCheck:function($stateParams, Check){
  var check = {
      name:'My great check2',
      info:'Fun info here2.',
      id:$stateParams.id || 'TESTID',
      meta:[
        {
          key:'State',
          value:'Failing'
        },
        {
          key:'Port',
          value:80
        },
        {
          key:'Protocol',
          value:'HTTP'
        }
      ],
      instances:[
      {
        name:'a-q8r-309fo (US-West-1)',
        lastChecked:new Date(),
        info:'Fun info here.',
        id:'foo',
        status:{
          health:25,
          state:'running',
          silence:{
            startDate:null,
            duration:null
          }
        },
      },
      {
        name:'aefiljea-fae-fe (US-West-2)',
        lastChecked:new Date(),
        info:'Secondary info.',
        id:'foo-2',
        status:{
          health:25,
          state:'running',
          silence:{
            startDate:null,
            duration:null
          }
        },
      },
      {
        name:'popfaef-eefff-f (US-West-3)',
        lastChecked:new Date(),
        info:'Great info here.',
        id:'foo-3',
        status:{
          health:25,
          state:'running',
          silence:{
            startDate:null,
            duration:null
          }
        },
      },
      ]
    }//check
    check.instances.forEach(function(c,i){
      check.instances[i] = new Check(c);
    });
    return check;
  }
}
angular.module('opsee.checks.controllers').controller('SingleCheckCtrl', SingleCheckCtrl);

function EditCheckCtrl($scope, $state, $stateParams, singleCheck,Check){
  $scope.check = new Check(singleCheck).setDefaults();
}
EditCheckCtrl.resolve = {
  singleCheck:function($stateParams){
    return {
  "name": "My Clown Check",
  "message": "hey, clowns are here.",
  "type": null,
  "interval": {
    "name": "15min"
  },
  "http": {
    "protocol": null,
    "authentications": [],
    "headers": [],
    "port": "80"
  },
  "notifications": [
    {
      "type": {
        "name": "Email"
      },
      "value": "clownman@clowncentral.com"
    }
  ],
  "assertions": [
    {
      "code": null,
      "relationship": {
        "name": "Not Equal To"
      },
      "value": "500",
      "type": {
        "name": "Status Code"
      }
    },
    {
      "code": null,
      "relationship": {
        "name": "Contains"
      },
      "value": "meow",
      "type": {
        "name": "Response Body"
      }
    }
    ],
    "group": {
      "name": "US Group 1"
    },
    "protocol": {
      "name": "HTTP"
    },
    "verb": {
      "name": "POST"
    },
    "url": "http://foobar.com/fo/clowns"
  }
  }
}
angular.module('opsee.checks.controllers').controller('EditCheckCtrl', EditCheckCtrl);

function CreateCheckCtrl($scope, $state, Check){
  $scope.check = new Check().setDefaults();
  $scope.submit = function(){
    $analytics.eventTrack('create', {category:'Checks'});
    console.log($scope.check);
  }
  $scope.checkStep = 1;
  $scope.dropdownStatus = {};
}
angular.module('opsee.checks.controllers').controller('CreateCheckCtrl', CreateCheckCtrl);

function config ($stateProvider, $urlRouterProvider, ENDPOINTS) {
    $stateProvider.state('checks', {
      url:'/checks',
      templateUrl:'/public/js/src/checks/views/index.html',
      controller:'ChecksCtrl',
      title:'Checks'
    })
    .state('checkSingle', {
      url:'/check/:id',
      templateUrl:'/public/js/src/checks/views/single.html',
      controller:'SingleCheckCtrl',
      resolve:SingleCheckCtrl.resolve
    })
    .state('checkEdit', {
      url:'/check/:id/edit',
      templateUrl:'/public/js/src/checks/views/edit.html',
      controller:'EditCheckCtrl',
      resolve:EditCheckCtrl.resolve
    })
    .state('checkCreate', {
      url:'/check-create',
      templateUrl:'/public/js/src/checks/views/create.html',
      controller:'CreateCheckCtrl',
      title:'Create New Check'
      // resolve:SingleCheckCtrl.resolve
    })
  }
angular.module('opsee').config(config);

})();//IIFE