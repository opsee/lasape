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

})();//IIFE