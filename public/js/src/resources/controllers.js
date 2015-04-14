(function(){

angular.module('opsee.resources.controllers', ['opsee.resources.services']);

function resourcesHome($scope){

}
angular.module('opsee.resources.controllers').controller('resourcesHome', resourcesHome);

function config ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('resources', {
      url:'/resources',
      views:{
        '':{
          templateUrl:'public/js/src/resources/views/home.html',
          controller:''
        }
      }
    });
  }
angular.module('opsee').config(config);

})();//IIFE