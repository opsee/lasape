(function(){

angular.module('opsee.checks.directives', []);

function checkInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/inputs.html',
    scope:{
      check:'=',
      checkStep:'=?'
    },
    controller:function($scope, $http, $filter, _, NotificationSettings, Intervals, Verbs, Protocols, StatusCodes, Relationships, AssertionTypes, AssertionTest){
      $scope.creating = !!$scope.checkStep;
      $scope.groups = [
        {
          name:'US Group 1'
        },
        {
          name:'Europe Group 2'
        },
        {
          name:'US Group 2'
        }
      ],
      $scope.protocols = Protocols;
      $scope.notificationSettings = NotificationSettings;
      $scope.intervals = Intervals;
      $scope.verbs = Verbs;
      $scope.relationships = Relationships;
      $scope.assertionTypes = AssertionTypes;

      //kick these off, 1 is required
      if($scope.creating){
        $scope.check.addItem('assertions');
        $scope.check.addItem('notifications');
      }
      StatusCodes().then(function(res){
        $scope.codes = res;
      });

      function genCheckResponse(res){
        $scope.checkResponse = res;
        $scope.checkResponse.responseHeaders = _.pairs(res.headers());
        $scope.checkResponse.dataString = typeof $scope.checkResponse.data == 'object' ? $filter('json')($scope.checkResponse.data) : $scope.checkResponse.data;
        $scope.checkResponse.language = null;
        var type = res.headers()['content-type'];
        if(type.match('css')){
          $scope.checkResponse.language = 'css';
        }else if(type.match('html')){
          $scope.checkResponse.language = 'html';
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
        $scope.check.assertions[$index].type = type;
        $scope.check.assertions[$index].value = null;
      }
      $scope.changeAssertionRelationship = function(relationship,assertion){
        assertion.relationship = relationship;
        if(relationship.name.match('Is Empty|Is Not Empty') && assertion.type && assertion.type.name != 'Response Header'){
         assertion.value = '';
        }
      }
      $scope.assertionPassing = function($index){
        return AssertionTest($scope.check.assertions[$index],$scope.checkResponse);
      }
      $scope.sendTestNotification = function(){
        console.log($scope.check);
      }
      $scope.finishCreate = function(){
        console.log($scope.check);
      }
      $scope.forward = function(num){
        //just editing, not creating
        if(!$scope.checkStep){
          return console.log('edit',$scope.check);
        }
        if(num < 4){
          //continue to next step
          $scope.checkStep = num;
        }else{
          //create this mofo
          console.log('create',$scope.check);
        }
      }
    }//end controller
  }
}
angular.module('opsee.checks.directives').directive('checkInputs', checkInputs);

function checkStep1(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/check-step-1.html',
    transclude:true
  }
}
angular.module('opsee.checks.directives').directive('checkStep1', checkStep1);

function checkStep2(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/check-step-2.html',
    transclude:true
  }
}
angular.module('opsee.checks.directives').directive('checkStep2', checkStep2);

function checkStep3(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/check-step-3.html',
    transclude:true
  }
}
angular.module('opsee.checks.directives').directive('checkStep3', checkStep3);

function checkSingleContextMenu(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/checks/partials/single-context-menu.html',
    // scope:{
    //   status:'='
    // },
    controller:function($scope){
      // $scope.foo = 'fa';
      // $scope.actions = [
      //   {
      //     title:'Silence Check',
      //     run:function(){
      //       console.log(self.contextMenu().actions);
      //     },
      //     actions:[
      //       {
      //         title:'1 minute',
      //         run:function(){
      //           console.log('1 minute');
      //         }
      //       },
      //       {
      //         title:'10 minutes',
      //         run:function(){
      //           console.log('10 minutes');
      //         }
      //       }
      //     ]
      //   },
      //   {
      //     title:'another',
      //     run:function(){
      //       console.log('foo')
      //     }
      //   }
      // ]
    },
    link:function($scope,$elem,$attr){
    }
  }
}
angular.module('opsee.checks.directives').directive('checkSingleContextMenu', checkSingleContextMenu);


function radialGraph(){
  return {
    restrict:'EA',
    replace:true,
    templateUrl:'/public/js/src/checks/partials/radial-graph.html',
    scope:{
      status:'='
    },
    controller:function($scope, $element, $timeout){
      // $scope.text = '';
      $scope.text = $scope.status.health ? Math.round($scope.status.health) : null;
      $scope.width = 40;
      function getSilenceRemaining(obj){
        if(obj && obj.startDate){
          if(Date.parse(obj.startDate)){
            var d = Date.parse(obj.startDate);
            var finalVal = d.valueOf()+obj.length;
            var remaining = finalVal-Date.now();
            return remaining;
          }
        }
        return false;
      }
      function getPath(health){
        if (health >= 100) {
          percentage = 99.9;
        } else if (health < 0) {
          percentage = 0;
        } else {
          percentage = Math.round(health);
        }
        var w = $scope.width;
        var α = (percentage/100)*360;
        var π = Math.PI;
        var r = ( α * π / 180 );
        var x = Math.sin( r ) * (w/2);
        var y = Math.cos( r ) * - (w/2);
        var mid = ( α > 180 ) ? 1 : 0;
        var path = 'M 0 0 v -' + (w/2) + ' A ' + (w/2) + ' ' + (w/2) + ' 1 ' + mid + ' 1 ' +  x  + ' ' +  y  + ' z';
        return path;
      }
      // if ($scope.status.state == 'running') {
      //   $scope.path = getPath($scope.status.health);
      // }

      $scope.$watch(function(){return $scope.path}, function(newVal,oldVal){
        var loader = $element[0].querySelector('.loader');
        angular.element(loader).attr('transform','translate('+$scope.width/2+','+$scope.width/2+')').attr('d',newVal);
      });

      $scope.$watch(function(){return $scope.status.silence.startDate}, function(newVal,oldVal){
        //we don't need to regen of we are adding time to instantiated silence
        if(!$scope.status.silence.remaining){
          regenGraphSilence(true);
        }
      });

      function regenGraphHealth(){
        $scope.bool = $scope.status.health < 50 ? 'failing' : 'passing';
        $scope.path = getPath($scope.status.health);
        $scope.text = Math.round($scope.status.health);
      }
      function regenGraphSilence(immediate){
        // $scope.status.silence.remaining = $scope.status.silence.remaining > 0 ? $scope.status.silence.remaining : getSilenceRemaining($scope.status.silence);
        $scope.status.silence.remaining = getSilenceRemaining($scope.status.silence);
        if($scope.status.silence.remaining > 0){
          $timeout(function(){
            $scope.path = getPath(($scope.status.silence.remaining/$scope.status.silence.length)*100);
            $scope.status.silence.remaining = $scope.status.silence.remaining - 1000;
            $scope.text = Math.ceil($scope.status.silence.remaining/1000)+'s';
            regenGraphSilence();
          },immediate ? 0 : 1000);
        }else{
          $scope.status.silence.remaining = 0;
          regenGraphHealth();
        }
      }

      if($scope.status.silence && $scope.status.silence.startDate){
        regenGraphSilence(true);
      }else{
        regenGraphHealth();
      }

    }
  }
}
angular.module('opsee.checks.directives').directive('radialGraph', radialGraph);

})();//IIFE