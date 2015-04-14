(function(){

angular.module('opsee.user.services', []);

function User($resource, $rootScope, _, USER_DEFAULTS, ENDPOINTS){
  var User = $resource(ENDPOINTS.user,
    {
      userId:'@_id'
    },
    {
      update:{method:'PUT'}
    });
  User.prototype.setDefaults = function(){
    _.defaults(this, USER_DEFAULTS);
    return this;
  }
  // User.prototype.hasPermission = function(string){
  //   return this.permissions.indexOf(string) > -1;
  // }
  User.prototype.hasUser = function(){
    return !!this.id;
  }
  return User;
}
angular.module('opsee.user.services').factory('User', User);

var userDefaults = {
  account:{
    email:null
  },
  bio:{
    name:null
  },
  team:{
    name:null,
    domain:null
  }
}
angular.module('opsee.user.services').constant('USER_DEFAULTS', userDefaults);

})();