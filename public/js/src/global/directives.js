(function(){

angular.module('opsee.global.directives', []);

function statefulBtn(){
  return {
    restrict:'EA',
    scope:{
      value:'=',
      send:'='
    },
    controller:function($scope){
      $scope.options = {
        original:{
          text:'Test'
        },
        inProgress:{
          text:'Testing...'
        },
        success:{
          text:'Success!'
        },
        error:{
          text:'Error.'
        }
      }
      $scope.state = $scope.state || $scope.options.original;
      $scope.click = function(){
        $scope.state = $scope.options.inProgress;
        $scope.send().then(function(res){
          $scope.state = $scope.options.success;
        }, function(err){
          $scope.state = $scope.options.error;
        })
      }
    }
  }
}
angular.module('opsee.global.directives').directive('statefulBtn', statefulBtn);

function preventDefaultA(){
  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
        elem.on('click', function(e){
            e.preventDefault();
        });
      }
    }
 };
}
angular.module('opsee.global.directives').directive('preventDefaultA', preventDefaultA);

function contextMenu(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/global/partials/context-menu.html',
    controller:function($scope){
      console.log($scope);
    }
  }
}
angular.module('opsee.global.directives').directive('contextMenu', contextMenu);

function opseeHeader(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/global/partials/header.html',
    controller:function($scope, $location, $state, $rootScope, Global) {
      $scope.navbarEntries = [
        {
          title:'Checks',
          sref:'checks',
          children:[]
        },
        {
          title:'More',
          sref:'more',
          children:[]
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
  }
}
angular.module('opsee.global.directives').directive('opseeHeader', opseeHeader);

function opseeFooter(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/global/partials/footer.html',
    controller:function($scope, $location, $state, $rootScope, Global) {
      // $scope.user = $rootScope.user;
      $scope.entries = [
        {
          title:'Checks',
          link:'checks',
          children:[]
        },
        {
          title:'More',
          link:'more',
          children:[]
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
  }
}
angular.module('opsee.global.directives').directive('opseeFooter', opseeFooter);

function mdToolbar(){
  return {
    restrict:'EA',
    replace:true,
    transclude:'element',
    scope:{
      title:'@',
      close:'='
    },
    templateUrl:'/public/js/src/global/partials/md-toolbar.html'
  }
}
angular.module('opsee.global.directives').directive('mdToolbar', mdToolbar);

})();//IIFE