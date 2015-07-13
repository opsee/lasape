(() => {

angular.module('opsee.user.services', []);

function User($resource, $rootScope, _, $localStorage, $state, $q, $analytics, USER_DEFAULTS, ENDPOINTS, SlackService, gravatarService){
  const User = $resource(ENDPOINTS.user,
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
    this.populateSlack();
    return this;
  }
  User.prototype.populateSlack = function(){
    const self = this;
    const deferred = $q.defer();
    SlackService.getProfile().then(function(data){
      self.integrations.slack.user = data;
      self.setImage();
      deferred.resolve();
    }, function(){
      self.setImage();
      deferred.resolve();
    });
    return deferred.promise;
  }
  User.prototype.setImage = function(){
    const self = this;
    function slackSet(data){
      self.bio.img = data.user.profile.image_192;
      self.bio.imgService = 'Slack';
    }
    if(this.integrations.slack.user){
      slackSet(self.integrations.slack);
    }else{
      SlackService.getProfile().then(function(data){
        slackSet(data);
      }, function(){
        //no slack integration found, default to gravatar
        self.bio.img = gravatarService.url(self.account.email || self.email, {s:200});
        self.bio.imgService = 'Gravatar';
      });
    }
    return this;
  }
  // User.prototype.hasPermission = function(string){
  //   return this.permissions.indexOf(string) > -1;
  // }
  User.prototype.hasUser = function(promise){
    const test = !!this.id;
    if(promise){
      const d = $q.defer();
      test ? d.resolve() : d.reject({status:401});
      return d.promise;
    }
    return !!this.id;
  }
  User.prototype.logout = function(){
    $analytics.eventTrack('logout', {category:'User'});
    delete $localStorage.user;
    delete $localStorage.authToken;
    $rootScope.user = new User().setDefaults();
    $state.go('login');
  }
  return User;
}
angular.module('opsee.user.services').factory('User', User);

const userDefaults = {
  account:{
    email:null,
    password:null
  },
  bio:{
    name:null
  },
  aws:{
    accessKey:null,
    secretKey:null
  },
  teams:[
  ],
  integrations:{
    slack:{
      access_token:null,
      user:null
    }
  }
}
angular.module('opsee.user.services').constant('USER_DEFAULTS', userDefaults);


function UserService($q, $resource, $rootScope, $analytics, User, ENDPOINTS){
  return{
    set:USER => $rootScope.user = new User(USER).setDefaults().setPrefs(),
    edit:(user,options) => {
      const deferred = $q.defer();
      //used for editing users and creating new ones
      saved = options && options.isEditing ? User.update(user) : User.save(user);
      saved.$promise.then(
        res => deferred.resolve(res), 
        err => deferred.reject(err)
      );
      return deferred.promise;
    },
    create:user => {
      const path = $resource(ENDPOINTS.api+'/signups');
      return path.save(user).$promise;
    },
    claim:user => {
      if(user && user.password && user.activationId){
        const path = $resource(ENDPOINTS.api+'/activations/'+user.activationId+'/activate');
        return path.save(user).$promise;
      }else{
        const d = $q.defer();
        d.reject({data:{error:'Bad credentials.'}});
        return d.promise;
      }
    },
    createOrg:user => {
      if(user && user.name && user.subdomain){
        const path = $resource(ENDPOINTS.api+'/orgs');
        return path.save(user).$promise;
      }else{
        return $q.reject({data:{error:'Bad credentials.'}});
      }
    },
    login:user => {
      $analytics.eventTrack('login', {category:'User'});
      if(user && user.account.email){
        const data = {
          password:user.account.password,
          email:user.account.email
        }
        const path = $resource(ENDPOINTS.api+'/authenticate/password');
        return path.save(data).$promise;
      }else{
        return $q.reject();
      }
    },
    passwordForgot:user => {
      const path = $resource(ENDPOINTS.api+'/password-forgot');
      return path.save(user.account.email).$promise;
    }
  }
}
angular.module('opsee.user.services').service('UserService', UserService);

})();