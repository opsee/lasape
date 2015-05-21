(function(){

angular.module('opsee.onboard.services', []);

function OnboardService($resource, $q, $http, ENDPOINTS){
  return {
    domainAvailable:function(domain){
      var deferred = $q.defer();
      $http.get(ENDPOINTS.api+'/orgs/subdomain/'+domain).then(function(res){
        !!(res.data && res.data.available) ? deferred.resolve() : deferred.reject();
      }, function(res){
        deferred.reject(res);
      });
      return deferred.promise;
    }
  }
}
angular.module('opsee.onboard.services').service('OnboardService', OnboardService);

})();//IIFE