(function(){

angular.module('opsee.onboard.services', []);

function OnboardService($resource, $q, $rootScope, $http, api, ENDPOINTS){
  return {
    domainAvailable:function(domain){
      var deferred = $q.defer();
      api.getOrgsSubdomainBySubdomain({subdomain:domain}).then(function(res){
        !!res.available ? deferred.resolve() : deferred.reject();
      }).catch(function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    }
  }
}
angular.module('opsee.onboard.services').service('OnboardService', OnboardService);

})();//IIFE