(function(){

angular.module('opsee.global.filters', [])

function capitalize(){
  return function(input, scope) {
    if (input!=null)
    input = input.toLowerCase();
    return input.substring(0,1).toUpperCase()+input.substring(1);
  }
}
angular.module('opsee.global.filters').filter('capitalize',capitalize);

})();//IIFE