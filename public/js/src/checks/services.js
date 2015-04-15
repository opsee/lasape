(function(){

angular.module('opsee.checks.services', []);

function Check($resource, $rootScope, _, CHECK_DEFAULTS, ENDPOINTS){
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
  // Check.prototype.hasPermission = function(string){
  //   return this.permissions.indexOf(string) > -1;
  // }
  Check.prototype.hasCheck = function(){
    return !!this.id;
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
  type:null,
  http:{
    protocol:null
  }
}
angular.module('opsee.checks.services').constant('CHECK_DEFAULTS', checkDefaults);

})();//IIFE