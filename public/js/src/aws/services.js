(function(){

angular.module('opsee.aws.services', []);

var TEST_KEYS = {
  'access-key':'AKIAITLC4AUQZLJXBZGQ',
  'secret-key':'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'
}
angular.module('opsee.aws.services').constant('TEST_KEYS',TEST_KEYS);

function AWSService($http, $localStorage, $rootScope, $websocket, _, ENDPOINTS, TEST_KEYS){
  return {
    vpcScan:function(data){
      data = data || {};
      _.defaults(data,TEST_KEYS);
      return $http.post(ENDPOINTS.vpcScan, data);
    },
    bastionInstall:function(data){
      console.log($rootScope.user);
      data = data || {};
      _.defaults(data, {
        hmac:$rootScope.user.token.replace('HMAC ',''),
        cmd:'launch',
        'instance-size': "t2.micro",
        regions: [
          {
            region: "us-east-1",
            vpcs: [
              {
                id: "vpc-31a0cc54"
              }
            ]
          }
        ]
      }, TEST_KEYS);
      if(!data){}
      var stream = $websocket('ws://api-beta.opsee.co/stream/');
      stream.send(JSON.stringify(data));
      return stream;
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