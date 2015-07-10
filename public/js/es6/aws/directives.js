(() => {

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

function groupItem(){
  return {
    restrict:'EA',
    scope:{
      group:'='
    },
    templateUrl:'/public/js/src/aws/partials/group-item.html'
  }
}
angular.module('opsee.aws.directives').directive('groupItem',groupItem);

})();//IIFE