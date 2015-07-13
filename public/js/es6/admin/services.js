(() => {

angular.module('opsee.admin.services', []);

function AdminService($q, $resource, $rootScope, $http, ENDPOINTS, User){
  return{
    activateSignup:email => {
      if(email){
        const path = $resource(ENDPOINTS.api+'/signups/send-activation?email='+email);
        return path.save({email:email}).$promise;
      }else{
        return $q.reject({error:'No email specified.'});
      }
    }
  }
}
angular.module('opsee.admin.services').service('AdminService', AdminService);

})();