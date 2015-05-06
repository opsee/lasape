(function(){

angular.module('opsee.aws.services', []);

function AWSService($http, $localStorage, ENDPOINTS){
  return {
    vpcScan:function(data){
      return $http.post(ENDPOINTS.vpcScan, {
        params:{
          'access-key':data.accessKey,
          'secret-key':data.secretKey,
          // regions:JSON.stringify(data.regions)
          regions:data.regions
        }
      });
    }
  }
}

angular.module('opsee.aws.services').service('AWSService', AWSService);

})();