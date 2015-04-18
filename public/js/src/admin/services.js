(function(){

angular.module('opsee.admin.services', []);

function AdminService($q, $resource, $rootScope, $http, ENDPOINTS){
  return{
    signups:function(){
      var deferred = $q.defer();
      $http.get(ENDPOINTS.api+'/signups').then(function(res){
        deferred.resolve(res.data);
      }, function(res){
        deferred.reject(res);
      });
      return deferred.promise;
    },
    activateSignup:function(email){
      if(email){
        var path = $resource(ENDPOINTS.api+'/signups/send-activation?email='+email);
        return path.save({email:email}).$promise;
      }else{
        return $q.reject({error:'No email specified.'});
      }
    },
    login:function(admin){
      if(admin && admin.account.email){
        var _admin = {
          password:admin.account.password,
          email:admin.account.email
        }
        var path = $resource(ENDPOINTS.api+'/authenticate/password');
        saved = path.save(_admin);
        return saved.$promise;
      }else{
        return $q.reject();
      }
    },
    logout:function(admin){
     var deferred = $q.defer();
      var path = $resource('/api/logout', {}, {});
      logout = path.get(admin);
      logout.$promise.then(function(res){
        $rootScope.admin = new Admin().setDefaults().setPrefs();
        deferred.resolve(res);
      }, function(err){
        deferred.reject(err);
      }) 
     return deferred.promise;
    }
  }
}
angular.module('opsee.admin.services').service('AdminService', AdminService);

})();