(function(){

angular.module('opsee.aws.directives', []);

function instanceItem(){
  return {
    restrict:'EA',
    scope:{
      instance:'='
    },
    templateUrl:'/public/js/src/aws/partials/instance-item.html'
  }
}
angular.module('opsee.aws.directives').directive('instanceItem',instanceItem);

})();//IIFE