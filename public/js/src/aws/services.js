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

var AWSRegions = [
  {
    id:'ap-southeast-1',
    name:'Singapore'
  },
  {
    id:'ap-southeast-2',
    name:'Sydney'
  },
  {
    id:'eu-central-1',
    name:'Frankfurt'
  },
  {
    id:'eu-west-1',
    name:'Ireland'
  },
  {
    id:'sa-east-1',
    name:'São Paolo'
  },
  {
    id:'us-east-1',
    name:'N. Viginia'
  },
  {
    id:'us-west-1',
    name:'N. California'
  },
  {
    id:'us-west-2',
    name:'Oregon'
  }
]
angular.module('opsee.aws.services').constant('AWSRegions', AWSRegions);

})();