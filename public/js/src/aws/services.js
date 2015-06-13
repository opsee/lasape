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
      if(data['access-key'].length == 5){
        _.extend(data,TEST_KEYS);
      }
      return $http.post(ENDPOINTS.vpcScan, data);
    },
    bastionInstall:function(data){
      data = data || {};
      if(data.regionsWithVpcs && data.regionsWithVpcs.length){
        data.regions = data.regionsWithVpcs;
      }
      var testRegions = {
        regions:[
            {
              region: "us-east-1",
              vpcs: [
                {
                  id: "vpc-31a0cc54"
                },
              ]
            },
            {
              region: 'us-west-1',
              vpcs: [
                {
                  id:'vpc-79b1491c'
                }
              ]
            }
          ]
        }
      _.defaults(data, {
        'instance-size': "t2.micro"
      }, TEST_KEYS, testRegions);
      if($rootScope.user.email == 'cliff@leaninto.it'){
        _.extend(data,TEST_KEYS);
      }
      return $http.post(ENDPOINTS.api+'/bastions/launch', data);
    }
  }
}

angular.module('opsee.aws.services').service('AWSService', AWSService);

function BastionInstaller(){
  return function(obj){
    var defaults = {
      instance_id:null,
      status:'progress',
      items:['AWS::CloudFormation::Stack','AWS::EC2::SecurityGroup','AWS::IAM::Role','AWS::IAM::InstanceProfile','AWS::EC2::Instance'].map(function(i){
        return {id:i,msgs:[]}
      })
    }
    function bastionInstaller(obj){
      _.extend(this,obj);
      _.defaults(this,defaults);
    }
    bastionInstaller.prototype.parseMsg = function(msg){
      var self = this;
      var item = _.findWhere(self.items,{id:msg.attributes.ResourceType});
      if(!item){
        self.items.push({
          id:msg.attributes.ResourceType,
          msgs:[]
        });
      }
      item = _.findWhere(self.items,{id:msg.attributes.ResourceType});
      item.msgs.push(msg.attributes);
      item.msgs = item.msgs.sort(function(a,b){
        return Date.parse(a.Timestamp) - Date.parse(b.Timestamp)
      });
    }
    bastionInstaller.prototype.getItemStatuses = function(){
      var statuses = this.items.map(function(i){
        var last = _.last(i.msgs);
        if(last){
          return last;
        }else{
          return {ResourceStatus:'CREATE_IN_PROGRESS', ResourceType:i.id};
        }
      });
      return _.compact(statuses);
    }
    bastionInstaller.prototype.getStatus = function(){
      var statuses = this.getItemStatuses();
      var progressItems = _.reject(statuses, {ResourceStatus:'CREATE_COMPLETE'});
      if(!progressItems.length && statuses.length){
        this.status = 'complete';
      }else if(statuses.length){
        var rollback = _.findWhere(statuses,{ResourceStatus:'ROLLBACK_COMPLETE'});
        var deleting = _.findWhere(statuses,{ResourceStatus:'DELETE_COMPLETE'});
        if(rollback){
          this.status = 'rollback';
        }else if(deleting){
          this.status = 'deleting';
        }else{
          this.status = 'progress';
        }
      }else{
        this.status = 'progress';
      }
      return this.status;
    }
    bastionInstaller.prototype.getInProgressItem = function(){
      var statuses = this.getItemStatuses();
      var index = _.findLastIndex(statuses,{ResourceStatus:'CREATE_COMPLETE'}) + 1;
      return (index > 0 && index < statuses.length) ? statuses[index] : {ResourceType:'AWS::EC2::SecurityGroup'};
    }
    bastionInstaller.prototype.getPercentComplete = function(){
      var statuses = this.getItemStatuses();
      var complete = _.where(statuses,{ResourceStatus:'CREATE_COMPLETE'}).length;
      var num = (complete/this.items.length)*100;
      if(this.id == "vpc-22e51a47"){
        // console.log(num,statuses);
      }
      return num;
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

function Group($resource, _, GROUP_DEFAULTS, ENDPOINTS, Global, Instance){
  var Group = $resource(ENDPOINTS.api+'/group/:id',
    {
      id:'@_id'
    },
    {
      update:{
        method:'PATCH'
      }
    });
  Group.prototype = Object.create(Instance.prototype);
  Group.prototype.constructor = Group;
  Group.prototype.setDefaults = function(){
    return _.defaults(this, angular.copy(GROUP_DEFAULTS));
  }
  return Group;
}
angular.module('opsee.aws.services').factory('Group', Group);

var GROUP_DEFAULTS = {
  itemName:'group',
  status:{
    state:'running',
    health:100,
    silence:{
      startDate:null,
      duration:null
    }
  }
}
angular.module('opsee.aws.services').constant('GROUP_DEFAULTS', GROUP_DEFAULTS);

function Instance($resource, $q, $timeout, _, INSTANCE_DEFAULTS, ENDPOINTS, Check){
  var Instance = $resource(ENDPOINTS.api+'/instance/:id',
    {
      id:'@_id'
    },
    {
      update:{
        method:'PATCH'
      }
    });
  Instance.prototype = Object.create(Check.prototype);
  var self = this;
  _.remove(Instance.prototype.actions, function(a){
    return a.id == 'delete'
  });
  Instance.prototype.start = function(){
    var d = $q.defer();
    d.resolve();
    this.status.state = 'running';
    return d.promise;
  }
  Instance.prototype.restart = function(){
    var d = $q.defer();
    d.resolve();
    this.status.state = 'restarting';
    var self = this;
    $timeout(function(){
      self.status.state = 'running'
    },5000);
    return d.promise;
  }
  Instance.prototype.stop = function(){
    var d = $q.defer();
    d.resolve();
    this.status.state = 'stopped';
    return d.promise;
  }
  Instance.prototype.actions.push({
    id:'management',
    title:'Manage',
    childrenActive:true,
    run:function(){
      this.childrenActive = true;
    },
    actions:[
      {
        title:'Start',
        run:function(){
          return this.start();
        }
      },
      {
        title:'Restart',
        run:function(){
          return this.restart();
        }
      },
      {
        title:'Stop',
        run:function(){
          return this.stop();
        }
      }
    ]
  })
  Instance.prototype.constructor = Instance;
  Instance.prototype.setDefaults = function(){
    _.defaults(this, angular.copy(INSTANCE_DEFAULTS));
    return this;
  }
  return Instance;
}
angular.module('opsee.aws.services').factory('Instance', Instance);

var INSTANCE_DEFAULTS = {
  itemName:'instance',
  status:{
    state:'running',
    health:100,
    silence:{
      startDate:null,
      duration:null
    }
  }
}
angular.module('opsee.aws.services').constant('INSTANCE_DEFAULTS', INSTANCE_DEFAULTS);


})();