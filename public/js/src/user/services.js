(function(){

angular.module('opsee.user.services', []);

function User($resource, $rootScope, _, $cookies, $state, USER_DEFAULTS, ENDPOINTS){
  var User = $resource(ENDPOINTS.user,
    {
      id:'@_id'
    },
    {
      update:{
        method:'PATCH'
      }
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
  User.prototype.logout = function(){
    delete $cookies.user;
    delete $cookies.authToken;
    $rootScope.user = new User().setDefaults();
    $state.go('home');
  }
  return User;
}
angular.module('opsee.user.services').factory('User', User);


function UserService($q, $resource, $rootScope, User, ENDPOINTS){
  return{
    set:function(USER){
      $rootScope.user = new User(USER).setDefaults().setPrefs();
    },
    edit:function(user,options) {
      var deferred = $q.defer();
      //used for editing users and creating new ones
      saved = options && options.isEditing ? User.update(user) : User.save(user);
      saved.$promise.then(function(res){
        deferred.resolve(res);
      }, function(err){
        deferred.reject(err);
      })
      return deferred.promise;
    },
    create:function(user){
      if(user && user.account.email){
        var data = {
          name:user.bio.name,
          email:user.account.email
        }
        var path = $resource(ENDPOINTS.api+'/signups');
        saved = path.save(data);
        return saved.$promise;
      }else{
        return $q.reject();
      }
    },
    claim:function(user){
      if(user && user.password && user.token){
        var path = $resource(ENDPOINTS.api+'/activations/'+user.token+'/activate');
        return path.save(user).$promise;
      }else{
        return $q.reject({data:{error:'Bad credentials.'}});
      }
    },
    login:function(user){
      if(user && user.account.email){
        var data = {
          password:user.account.password,
          email:user.account.email
        }
        var path = $resource(ENDPOINTS.api+'/authenticate/password');
        saved = path.save(data);
        return saved.$promise;
      }else{
        return $q.reject();
      }
    },
    logout:function(user,$cookies){
      $cookies.remove('user');
      $cookies.remove('authToken');
      $rootScope.user = new User().setDefaults();
    }
  }
}
angular.module('opsee.user.services').service('UserService', UserService);


var userDefaults = {
  account:{
    email:null,
    password:null
  },
  bio:{
    name:null
  },
  teams:[
  ]
}
angular.module('opsee.user.services').constant('USER_DEFAULTS', userDefaults);

})();