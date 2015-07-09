(()=>{

angular.module('opsee.docs.controllers', []);

function DocsNavCtrl($scope, $rootScope, $state) {
  $scope.pages = [
    {
      title:'The Bastion',
      link:'/docs/bastion'
    }
  ]
}
angular.module('opsee.docs.controllers').controller('DocsNavCtrl', DocsNavCtrl);

function config ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('/docs', '/docs/nav');
    $stateProvider
    .state('docs', {
      url:'/docs',
      templateUrl:'/public/js/src/docs/views/index.html',
      title:'Docs'
    })
    .state('docs.nav', {
      url:'^/docs/nav',
      templateUrl:'/public/js/src/docs/views/nav.html',
      controller:'DocsNavCtrl',
      title:'Documents'
    })
    .state('docs.bastion', {
      url:'^/docs/bastion',
      templateUrl:'/public/js/src/docs/views/bastion.html',
      title:'The Bastion'
    })
  }
angular.module('opsee').config(config);

})();//IIFE