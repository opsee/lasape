(function(){

angular.module('opsee.checks.services', []);

function Check($resource, $rootScope, _, CHECK_DEFAULTS, ENDPOINTS, CHECK_SCHEMAS){
  var Check = $resource(ENDPOINTS.api+'/check',
    {
      checkId:'@_id'
    },
    {
      update:{method:'PUT'}
    });
  Check.prototype.setDefaults = function(){
    _.defaults(this, CHECK_DEFAULTS);
    return this;
  }
  Check.prototype.addItem = function(selection){
    if(!selection){return false;}
    var target;
    try{
      //eval here allows us to write simple strings in html
      eval('var target=this.'+selection);
    }catch(err){
      console.log(err);
    }
    if(!target){return false;}
    var length = target.length;
    var schema;
    try{
      //eval here allows us to write simple strings in html
      eval('schema=CHECK_SCHEMAS.'+selection);
    }catch(err){
      console.log(err);
    }
    var cond1 = length && !angular.equals(target[length-1],schema);
    var cond2 = !length;
    if((cond1 || cond2) && schema){
      target.push(angular.copy(schema));
    }
  }
  Check.prototype.removeItem = function(selection, $index){
    if(!selection || $index == undefined){return false;}
    var target;
    try{
      //eval here allows us to write simple strings in html
      eval('var target=this.'+selection);
    }catch(err){
      console.log(err);
    }
    if(!target){return false;}
    $rootScope.global.confirm('Remove this item?').then(function(){
      target.splice($index,1);
    });
  }
  return Check;
}
angular.module('opsee.checks.services').factory('Check', Check);


function CheckService($q, $resource, $rootScope, Check, ENDPOINTS){
  return{
    edit:function(check,options) {
      var deferred = $q.defer();
      //used for editing checks and creating new ones
      saved = options && options.isEditing ? Check.update(check) : Check.save(check);
      saved.$promise.then(function(res){
        deferred.resolve(res);
      }, function(err){
        deferred.reject(err);
      })
      return deferred.promise;
    },
    create:function(check){
      if(check && check.account.email){
        var _check = {
          name:check.bio.name,
          email:check.account.email
        }
        var path = $resource(ENDPOINTS.api+'/signups');
        saved = path.save(_check);
        return saved.$promise;
      }else{
        return $q.reject();
      }
    }
  }
}
angular.module('opsee.checks.services').service('CheckService', CheckService);


var checkDefaults = {
  name:null,
  message:null,
  type:null,
  interval:null,
  http:{
    protocol:null,
    authentications:[],
    headers:[]
  },
  notifications:[],
  assertions:[]
}
angular.module('opsee.checks.services').constant('CHECK_DEFAULTS', checkDefaults);

var checkSchemas = {
  http:{
    authentications:{
      username:null,
      password:null
    },
    headers:{
      key:null,
      value:null
    }
  },
  notifications:{
    type:null,
    value:null
  },
  assertions:{
    code:null,
    relationship:null,
    value:null
  }
}
angular.module('opsee.checks.services').constant('CHECK_SCHEMAS', checkSchemas);

function AssertionTest(){
  var internals = {
    'Equal To':function(response,test){
      return angular.equals(response,test);
    },
    'Not Equal To':function(response,test){
      return !angular.equals(response,test);
    },
    'Is Empty':function(response){
      return _.isEmpty(response);
    },
    'Is Not Empty':function(response){
      return !_.isEmpty(response);
    },
    'Contains':function(response,test){
      if(typeof response === 'string' && typeof test === 'string'){
        response = response.toLowerCase();
        test = test.toLowerCase();
        return !!response.match(test);
      }
      return false;
    },
    'RegExp':function(response,test){
      if(typeof response === 'string' && typeof test === 'string'){
        return !!response.match(test);
      }
      return false;
    }
  }
  return function(assertion,res){
    if(!assertion || !res || assertion.value===null || !assertion.relationship.name){return false;}
    var name = assertion.type.name;
    var relationship = assertion.relationship.name;
    switch(name){
      case 'Status Code':
        try{
          var code = assertion.value;
          var status = res.status.toString();
          return internals[relationship].call(this,status,code);
        }catch(err){
          return false;
        }
      break;
      case 'Response Header':
        try{
          var name = typeof assertion.value.name == 'object' ? assertion.value.name[0] : assertion.value.name;
          var value = typeof assertion.value.value == 'object' ? assertion.value.value[1] : assertion.value.value;
          var header = _.chain(res.responseHeaders).filter(function(h){
            return h[0] == name;
          }).first().value();
          if(relationship == 'Is Empty'){
            if(!header){
              return true;
            }
            return !header[1];
          }else if(relationship == 'Is Not Empty'){
            return !!header[1];
          }
          if(!header){
            return false;
          }
          return internals[relationship].call(this,header[1],value);
        }catch(err){
          return false;
        }
      break;
      case 'Response Body':
      try{
        var text = assertion.value;
        var body = JSON.stringify(res.data);
        if(relationship == 'Is Empty'){
          return !body;
        }else if(relationship == 'Is Not Empty'){
          return !!body;
        }
        return internals[relationship].call(this,body,text);
      }catch(err){
        return false;
      }
      break;
    }
  }
}
angular.module('opsee.checks.services').service('AssertionTest',AssertionTest);

})();//IIFE