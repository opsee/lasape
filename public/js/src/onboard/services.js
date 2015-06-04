(function(){

angular.module('opsee.onboard.services', []);

function OnboardService($resource, $q, $rootScope, $http, ENDPOINTS){
  return {
    domainAvailable:function(domain){
      var deferred = $q.defer();
      $rootScope.api.getOrgsSubdomainBySubdomain({subdomain:domain}).then(function(res){
        !!(res.data && res.data.available) ? deferred.resolve() : deferred.reject();
      }).catch(function(err){
        deferred.reject(res);
      });
      return deferred.promise;
    }
  }
}
angular.module('opsee.onboard.services').service('OnboardService', OnboardService);

})();//IIFE