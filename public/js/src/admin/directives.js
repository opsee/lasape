(function(){

angular.module('opsee.admin.directives', []);

function adminInputs(){
  return {
    restrict:'EA',
    templateUrl:'/public/js/src/admin/partials/inputs.html',
    scope:{
      admin:'=',
      login:'='
    }
  }
}
angular.module('opsee.admin.directives').directive('adminInputs', adminInputs);


})();//IIFE