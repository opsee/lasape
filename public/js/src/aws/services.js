(function(){

angular.module('opsee.aws.services', []);

var TEST_KEYS = {
  'access-key':'AKIAITLC4AUQZLJXBZGQ',
  'secret-key':'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'
}
angular.module('opsee.aws.services').constant('TEST_KEYS',TEST_KEYS);

function AWSService($http, $localStorage, $rootScope, $websocket, $resource, _, ENDPOINTS, TEST_KEYS){
  return {
    vpcScan:function(data){
      data = data || {};
      _.defaults(data,TEST_KEYS);
      return $http.post(ENDPOINTS.vpcScan, data);
    },
    bastionInstall:function(data){
      data = data || {};
      _.defaults(data, {
        'instance-size': "t2.micro"
      }, TEST_KEYS);
      if($rootScope.user.email == 'cliff@leaninto.it'){
        _.extend(data,TEST_KEYS);
        _.extend(data,
          {
            regions: [
              {
                region: "us-east-1",
                vpcs: [
                  {
                    id: "vpc-31a0cc54"
                  },
                ]
              },
              {
                region: 'ap-southeast-1',
                vpcs: [
                  {
                    id:'vpc-22e51a47'
                  }
                ]
              }
            ]
          }
        )
      }
      var path = $resource(ENDPOINTS.api+'/bastions/launch');
      saved = path.save(data);
      return saved.$promise;
    }
  }
}

angular.module('opsee.aws.services').service('AWSService', AWSService);

function BastionInstaller(BastionInstallationItems){
  return function(obj){
    var defaults = {
      instance_id:null,
      status:'progress',
      msg:null,
      items:[
        {
          name:'group',
          status:null
        },
        {
          name:'role',
          status:null
        },
        {
          name:'profile',
          status:null
        },
        {
          name:'instance',
          status:null
        },
        {
          name:'stack',
          status:null
        }
      ]
    }
    function bastionInstaller(obj){
      _.extend(this,obj);
      _.defaults(this,defaults);
    }
    bastionInstaller.prototype.parseMsg = function(msg){
      var item = _.findWhere(BastionInstallationItems,{id:msg.attributes.ResourceType});
      var status = 'progress';
      switch(msg.attributes.ResourceStatus){
        case 'CREATE_COMPLETE':
        status = 'complete';
        break;
        case 'CREATE_IN_PROGRESS':
        break;
      }
      var item = _.findWhere(this.items, {name:item.name});
      item.status = status;
      var inProgressItems = _.reject(this.items, function(i){
        return i.status == 'complete';
      });
      if(!inProgressItems.length){
        this.status = 'complete';
      }
    }
    bastionInstaller.prototype.getInProgressItem = function(){
      var index = _.findLastIndex(this.items,{status:'complete'}) + 1;
      return (index > 0 && index < this.items.length) ? this.items[index] : {name:'group'};
    }
    bastionInstaller.prototype.getPercentComplete = function(){
      var complete = _.where(this.items,{status:'complete'}).length;
      return (complete/this.items.length)*100;
    }
    return new bastionInstaller(obj);
  }
}
angular.module('opsee.aws.services').factory('BastionInstaller', BastionInstaller);

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

var BastionInstallationItems = [
  {
    id:'AWS::EC2::SecurityGroup',
    name:'group'
  },
  {
    id:'AWS::IAM::InstanceProfile',
    name:'profile'
  },
  {
    id:'AWS::CloudFormation::Stack',
    name:'stack'
  },
  {
    id:'AWS::IAM::Role',
    name:'role'
  },
  {
    id:'AWS::EC2::Instance',
    name:'instance'
  }
]
angular.module('opsee.aws.services').constant('BastionInstallationItems', BastionInstallationItems);

function Group($resource, _, GROUP_DEFAULTS, ENDPOINTS){
  var Group = $resource(ENDPOINTS.api+'/group/:id',
    {
      id:'@_id'
    },
    {
      update:{
        method:'PATCH'
      }
    });
  Group.prototype.setDefaults = function(){
    _.defaults(this, GROUP_DEFAULTS);
    return this;
  }
  return Group;
}
angular.module('opsee.aws.services').factory('Group', Group);

var groupDefaults = {
}
angular.module('opsee.aws.services').constant('GROUP_DEFAULTS', groupDefaults);

function Instance($resource, _, INSTANCE_DEFAULTS, ENDPOINTS){
  var Instance = $resource(ENDPOINTS.api+'/instance/:id',
    {
      id:'@_id'
    },
    {
      update:{
        method:'PATCH'
      }
    });
  Instance.prototype.setDefaults = function(){
    _.defaults(this, INSTANCE_DEFAULTS);
    return this;
  }
  return Instance;
}
angular.module('opsee.aws.services').factory('Instance', Instance);

var INSTANCE_DEFAULTS = {
}
angular.module('opsee.aws.services').constant('INSTANCE_DEFAULTS', INSTANCE_DEFAULTS);


})();