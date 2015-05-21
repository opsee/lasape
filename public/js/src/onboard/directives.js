(function(){

angular.module('opsee.onboard.directives', []);

function domainAvailable(OnboardService,$q){
  return {
    restrict:'A',
    require:'ngModel',
    link:function($scope, $element, $attrs, ngModel){
      ngModel.$asyncValidators.available = function(modelValue){
        if(modelValue){
          return OnboardService.domainAvailable(modelValue);
        }
      }
    }
  }
}
angular.module('opsee.onboard.directives').directive('domainAvailable',domainAvailable);

})();//IIFE