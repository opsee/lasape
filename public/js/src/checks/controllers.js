(function(){

angular.module('opsee.checks.controllers', ['opsee.checks.services']);

function ChecksCtrl($scope, $state){
  $scope.checks = [
  {
    name:'My great check',
    info:'Fun info here.',
    id:'foo'
  },
  {
    name:'My great check2',
    info:'Fun info here2.',
    id:'feee'
  },
  ]
}
angular.module('opsee.checks.controllers').controller('ChecksCtrl', ChecksCtrl);

function SingleCheckCtrl($scope, $state, $stateParams, Check, singleCheck){
  $scope.check = new Check(singleCheck).setDefaults();
}
SingleCheckCtrl.resolve = {
  singleCheck:function($stateParams){
    return {
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
        status:'Failing',
        name:'a-q8r-309fo (US-West-1)',
        lastChecked:new Date()
      },
      {
        status:'Passing',
        name:'hr-afoijfa-309fo (US-West-2)',
        lastChecked:new Date()
      },
      {
        status:'Passing',
        name:'aekfjoiuhfef1234-309fo (US-West-1)',
        lastChecked:new Date()
      }
      ]
    }
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
    console.log($scope.check);
  }
  $scope.checkStep = 1;
  $scope.dropdownStatus = {};
}
angular.module('opsee.checks.controllers').controller('CreateCheckCtrl', CreateCheckCtrl);

function config ($stateProvider, $urlRouterProvider) {
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