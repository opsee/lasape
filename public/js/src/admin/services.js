(function(){

angular.module('opsee.admin.services', []);

function AdminService($q, $resource, $rootScope, $http, ENDPOINTS){
  return{
    signups:function(){
      return $http.get(ENDPOINTS.api+'/signups');
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