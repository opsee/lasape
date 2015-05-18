(function(){

angular.module('opsee.onboard.services', []);

function OnboardService($resource, $q, $http, ENDPOINTS){
  return {
    domainAvailable:function(domain){
      var deferred = $q.defer();
      $http.get(ENDPOINTS.api+'/orgs/subdomain/'+domain).then(function(res){
        deferred.resolve(!!(res.data && res.data.available));
      }, function(res){
        deferred.reject(res);
      });
      return deferred.promise;
    }
  }
}
angular.module('opsee.onboard.services').service('OnboardService', OnboardService);

})();//IIFE