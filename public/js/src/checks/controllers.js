(function(){

angular.module('opsee.checks.controllers', ['opsee.checks.services']);

function AllChecksCtrl($scope, $state, $stateParams, $timeout, $analytics, Check){
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
angular.module('opsee.checks.controllers').controller('AllChecksCtrl', AllChecksCtrl);

AllChecksCtrl.resolve = {
}

function CheckCtrl($scope){
  $scope.info = {
    edit:false
  }
}
angular.module('opsee.checks.controllers').controller('CheckCtrl', CheckCtrl);

function SingleCheckCtrl($scope, $state, $stateParams, $location, $timeout, Check, singleCheck){
  $scope.check = new Check(singleCheck).setDefaults();
  $state.current.title = $scope.check.name;
  $scope.edit = function(){
    $location.url('/check/'+$stateParams.id+'/edit');
  }
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

function EditCheckCtrl($scope, $state, $stateParams, $timeout, $location, _, singleCheck, Check, slate){
  $scope.check = new Check(singleCheck).setDefaults();
  $scope.close = function(){
    $location.url('/check/'+$stateParams.id);
  }
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
      channel:{
        type:"email",
      },
      value: "clownman@clowncentral.com"
    },
    {
      channel:{
        type:"slack",
      },
      value: "clown_channel"
    },
    {
      channel:{
        type:"desktop",
      },
      options:{
        push:true
      },
      value: true
    }
  ],
  "assertions": [
    {
      key:'statusCode',
      relationship:'notEqual',
      operand:500
    },
    {
      key:'body',
      relationship:'contain',
      operand:'meow'
    },
    ],
    "group": {
      "name": "cluster1",
      "id": "sg-4821a42d"
    },
    "protocol": {
      "name": "HTTP"
    },
    "method": {
      "name": "POST"
    },
    // "url": "http://foobar.com/fo/clowns"
  }
  }
}
angular.module('opsee.checks.controllers').controller('EditCheckCtrl', EditCheckCtrl);

function CreateCheckCtrl($scope, $state, Check, $http, $filter, _, $analytics, $notification, NotificationSettings, Methods, Protocols, StatusCodes, Relationships, AssertionTypes, AssertionTest){
  $scope.check = new Check().setDefaults();
  $scope.submit = function(){
    $analytics.eventTrack('create', {category:'Checks'});
    console.log($scope.check);
  }
  $scope.info = {
    checkStep:1
  }
  $scope.dropdownStatus = {};
  $scope.close = function() {
    $state.go('check.all');
  }
}
angular.module('opsee.checks.controllers').controller('CreateCheckCtrl', CreateCheckCtrl);

function CheckStep1Ctrl($scope, $state, Check, StatusCodes, Protocols, Methods, groups){
  if($scope.info){
    $scope.info.checkStep = 1;
  }
  StatusCodes().then(function(res){
    $scope.codes = res;
  });
  $scope.groups = groups;
  $scope.protocols = Protocols;
  $scope.methods = Methods;
}
angular.module('opsee.checks.controllers').controller('CheckStep1Ctrl', CheckStep1Ctrl);
CheckStep1Ctrl.resolve = {
  groups:function($resource, $q, ENDPOINTS){
    var deferred = $q.defer();
    var path = $resource(ENDPOINTS.api+'/groups');
    path.get().$promise.then(function(res){
      if(res && res.groups){
        return deferred.resolve(res.groups);
      }
      return deferred.reject();
    });
    return deferred.promise;
  }
}

function CheckStep2Ctrl($scope, $state, $http, $filter, Check, Relationships, AssertionTypes, slate){
  if($scope.info){
    $scope.info.checkStep = 2;
    $scope.check.addItem('assertions');
  }
  $scope.relationships = Relationships;
  $scope.assertionTypes = AssertionTypes;
  function genCheckResponse(res){
    $scope.checkResponse = res;
    //for some reason angular is choking on this unless we JSONify it
    $scope.checkResponse.headers = JSON.parse(JSON.stringify(res.headers()));
    $scope.checkResponse.dataString = typeof $scope.checkResponse.data == 'object' ? $filter('json')($scope.checkResponse.data) : $scope.checkResponse.data;
    $scope.checkResponse.language = null;
    $scope.headerKeys = _.keys($scope.checkResponse.headers);
    $scope.headerValues = _.values($scope.checkResponse.headers);
    var type = $scope.checkResponse.headers['content-type'];
    if(type && typeof type == 'string'){
      if(type.match('css')){
        $scope.checkResponse.language = 'css';
      }else if(type.match('html')){
        $scope.checkResponse.language = 'html';
      }
    }
  }
  $http.get('/public/lib/know-your-http-well/json/status-codes.json').then(function(res){
  // $http.get('/public/js/src/user/partials/inputs.html').then(function(res){
  // $http.get('/public/css/src/style.css').then(function(res){
    genCheckResponse(res);
  }, function(res){
    genCheckResponse(res);
  })

  $scope.changeAssertionType = function(type,$index){
    $scope.check.assertions[$index].key = type.id;
    $scope.check.assertions[$index].value = null;
  }
  $scope.changeAssertionRelationship = function(relationship,assertion){
    assertion.relationship = relationship.id;
    if(relationship.id.match('empty|notEmpty') && assertion.key && assertion.key != 'header'){
     assertion.value = '';
    }
  }
  $scope.assertionPassing = function($index){
    var test = slate.testAssertion({
      assertion:$scope.check.assertions[$index],
      response:$scope.checkResponse
    });
    return test.success;
  }
  $scope.relationshipById = function(id){
    return _.find(Relationships,{id:id}) || {name:null,title:null,id:null};
  }
  $scope.assertionById = function(id){
    return _.find(AssertionTypes,{id:id}) || {name:null,title:null,id:null};
  }
  $scope.relationshipIsEmpty = function(r){
    return r == 'empty' || r == 'notEmpty';
  }
}
angular.module('opsee.checks.controllers').controller('CheckStep2Ctrl', CheckStep2Ctrl);

function CheckStep3Ctrl($scope, $state, $analytics, $notification, Check, Intervals){
  if($scope.info){
    $scope.info.checkStep = 3;
    $scope.check.addItem('notifications');
  }
  $scope.intervals = Intervals;
  $scope.save = function(){
    $analytics.eventTrack('create', {category:'Checks'});
    console.log('create',$scope.check);
  }
  $scope.testNotif = function(){
    var notif = $notification('New Message', {
      body:'hello'
    });
    notif.$on('click', function(e){
      console.log('click');
    });
  }
  $scope.sendTestNotification = function(){
    $analytics.eventTrack('notification-test', {category:'Checks'});
    console.log($scope.check);
  }
}
angular.module('opsee.checks.controllers').controller('CheckStep3Ctrl', CheckStep3Ctrl);

function config ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('/check-create', '/check-create/step-1');
    $stateProvider.state('check', {
      template:'<div ui-view class="transition-sibling"></div>',
      resolve:{
        auth:function($rootScope){
          return $rootScope.user.hasUser(true);
        }
      }
    })
    .state('check.all', {
      url:'/checks',
      templateUrl:'/public/js/src/checks/views/index.html',
      controller:'AllChecksCtrl',
      resolve:AllChecksCtrl.resolve,
      title:'Checks'
    })
    .state('check.single', {
      url:'/check/:id?close',
      templateUrl:'/public/js/src/checks/views/single.html',
      controller:'SingleCheckCtrl',
      resolve:SingleCheckCtrl.resolve,
      reloadOnSearch:false
    })
    .state('check.create', {
      url:'/check-create',
      templateUrl:'/public/js/src/checks/views/create.html',
      controller:'CreateCheckCtrl',
      title:'Create New Check',
      resolve:CreateCheckCtrl.resolve,
      hideHeader:true
    })
    .state('check.create.1', {
      url:'/step-1',
      templateUrl:'/public/js/src/checks/views/check-step-1.html',
      controller:'CheckStep1Ctrl',
      title:'Check Step 1',
      resolve:CheckStep1Ctrl.resolve,
      hideInSearch:true
    })
    .state('check.create.2', {
      url:'/step-2',
      templateUrl:'/public/js/src/checks/views/check-step-2.html',
      controller:'CheckStep2Ctrl',
      title:'Check Step 2',
      hideInSearch:true
    })
    .state('check.create.3', {
      url:'/step-3',
      templateUrl:'/public/js/src/checks/views/check-step-3.html',
      controller:'CheckStep3Ctrl',
      title:'Check Step 3',
      hideInSearch:true
    })
    .state('check.editParent', {
      abstract:true,
      templateUrl:'/public/js/src/checks/views/edit.html',
      hideHeader:true,
      uiViewClasses:{
        'transition-parent-child':true,
        'transition-reverse':true
      },
      controller:'EditCheckCtrl',
      resolve:EditCheckCtrl.resolve
    })
    .state('check.edit', {
      parent:'check.editParent',
      url:'/check/:id/edit',
      views:{
        step1:{
          templateUrl:'/public/js/src/checks/views/check-step-1.html',
          controller:'CheckStep1Ctrl',
          resolve:CheckStep1Ctrl.resolve
        },
        step2:{
          templateUrl:'/public/js/src/checks/views/check-step-2.html',
          controller:'CheckStep2Ctrl',
          resolve:CheckStep2Ctrl.resolve
        },
        step3:{
          templateUrl:'/public/js/src/checks/views/check-step-3.html',
          controller:'CheckStep3Ctrl',
          resolve:CheckStep3Ctrl.resolve
        }
      },
    })
  }
angular.module('opsee').config(config);

})();//IIFE