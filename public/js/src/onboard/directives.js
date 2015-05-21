(function(){

angular.module('opsee.onboard.directives', []);

function domainAvailable($q, $timeout, OnboardService){
  return {
    restrict:'A',
    require:'ngModel',
    link:function($scope, $element, $attrs, ngModel){
      ngModel.$parsers.push(function(modelValue){
        if(modelValue){
          ngModel.$setValidity('available',false);
          OnboardService.domainAvailable(modelValue).then(function(){
            ngModel.$setValidity('available',true);
          }, function(){
            ngModel.$setValidity('available',false);
          });
          return modelValue;
        }
      });
    }
  }
}
angular.module('opsee.onboard.directives').directive('domainAvailable',domainAvailable);

})();//IIFE